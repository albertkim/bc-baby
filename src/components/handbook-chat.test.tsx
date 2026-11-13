// @vitest-environment jsdom
import { createUIMessageStream, createUIMessageStreamResponse } from 'ai'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { HandbookChat } from './handbook-chat'

vi.mock('streamdown', () => ({
  Streamdown: ({ children }: { children: string }) => children,
}))

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  Element.prototype.scrollTo = vi.fn()
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function answer() {
  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({ type: 'start', messageId: 'answer' })
        writer.write({ type: 'text-start', id: 'text' })
        writer.write({
          type: 'text-delta',
          id: 'text',
          delta: 'Use a firm, flat surface. Sources: Baby Sleep',
        })
        writer.write({ type: 'text-end', id: 'text' })
        writer.write({ type: 'finish' })
      },
    }),
  })
}

it('submits valid questions, displays a streamed answer, and allows a follow-up', async () => {
  const fetch = vi.fn().mockImplementation(async () => answer())
  vi.stubGlobal('fetch', fetch)
  render(<HandbookChat />)
  const input = screen.getByRole('textbox', { name: 'Ask the handbook' })
  const ask = screen.getByRole('button', { name: /^Ask$/ })
  expect((ask as HTMLButtonElement).disabled).toBe(true)
  fireEvent.change(input, { target: { value: 'hi' } })
  expect((ask as HTMLButtonElement).disabled).toBe(true)
  fireEvent.change(input, { target: { value: 'How should my baby sleep?' } })
  fireEvent.keyDown(input, { key: 'Enter' })
  await screen.findByText('Use a firm, flat surface. Sources: Baby Sleep')
  await waitFor(() =>
    expect(screen.queryByText('Reading the handbook…')).toBeNull(),
  )
  expect((input as HTMLTextAreaElement).value).toBe('')
  fireEvent.change(input, { target: { value: 'What about blankets?' } })
  fireEvent.click(ask)
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
  const body = JSON.parse(fetch.mock.calls[1]?.[1]?.body as string)
  expect(
    body.messages.map((message: { role: string }) => message.role),
  ).toEqual(['user', 'assistant', 'user'])
})

it('lets the reader retry a failed request without duplicating their question', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      new Response('The handbook response failed. Please try again.', {
        status: 502,
      }),
    )
    .mockImplementationOnce(async () => answer())
  vi.stubGlobal('fetch', fetch)
  render(<HandbookChat />)
  fireEvent.click(screen.getByRole('button', { name: /^Pregnancy$/ }))
  fireEvent.click(
    screen.getByRole('button', { name: 'How can I tell if I am in labour?' }),
  )
  await screen.findByRole('alert')
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  await screen.findByText('Use a firm, flat surface. Sources: Baby Sleep')
  expect(screen.getAllByText('How can I tell if I am in labour?')).toHaveLength(
    1,
  )
  expect(screen.queryByRole('alert')).toBeNull()
})

it('keeps Shift+Enter and composition input from submitting a question', () => {
  const fetch = vi.fn()
  vi.stubGlobal('fetch', fetch)
  render(<HandbookChat />)
  const input = screen.getByRole('textbox', { name: 'Ask the handbook' })
  fireEvent.change(input, {
    target: { value: 'A question with multiple lines' },
  })
  fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
  fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
  expect(fetch).not.toHaveBeenCalled()
})

it('stops a pending response and can start a new conversation', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      (_url, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () =>
            reject(new DOMException('Stopped', 'AbortError')),
          )
        }),
    ),
  )
  render(<HandbookChat />)
  fireEvent.click(screen.getByRole('button', { name: /^Pregnancy$/ }))
  fireEvent.click(
    screen.getByRole('button', { name: 'How can I tell if I am in labour?' }),
  )
  fireEvent.click(await screen.findByRole('button', { name: 'Stop' }))
  await screen.findByRole('button', { name: /^Ask$/ })
  fireEvent.click(screen.getByRole('button', { name: 'New chat' }))
  expect(
    screen.getByRole('button', { name: 'How can my baby sleep safely?' }),
  ).toBeDefined()
  expect(screen.queryByLabelText('Your question')).toBeNull()
  expect(screen.queryByRole('alert')).toBeNull()
})

it('exposes the handbook details as an accessible disclosure', () => {
  render(<HandbookChat />)
  const trigger = screen.getByRole('button', { name: 'About' })
  expect(trigger.getAttribute('aria-expanded')).toBe('false')
  fireEvent.click(trigger)
  expect(trigger.getAttribute('aria-expanded')).toBe('true')
  const panelId = trigger.getAttribute('aria-controls')
  expect(document.getElementById(panelId ?? '')?.textContent).toContain(
    'Read the handbook',
  )
  fireEvent.click(trigger)
  expect(trigger.getAttribute('aria-expanded')).toBe('false')
})
