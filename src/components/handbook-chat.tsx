import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ArrowUp, LoaderCircle } from 'lucide-react'
import { Collapsible } from 'radix-ui'
import {
  getMessageText,
  MAX_CONTEXT_MESSAGES,
  MAX_QUESTION_LENGTH,
  MIN_QUESTION_LENGTH,
} from '#/lib/chat'
import { HandbookInfo, HANDBOOK_URL } from './handbook-info'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'

const AnswerMarkdown = lazy(async () => ({
  default: (await import('streamdown')).Streamdown,
}))
const SUGGESTIONS = [
  'When should I call my health care provider during pregnancy?',
  'How can I tell if I am in labour?',
  'What does the handbook say about safe sleep for my baby?',
]

export function HandbookChat() {
  const [input, setInput] = useState('')
  const viewportRef = useRef<HTMLDivElement>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const followOutputRef = useRef(true)
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            messages: messages.slice(-MAX_CONTEXT_MESSAGES).map((message) => ({
              ...message,
              parts: message.parts.filter((part) => part.type === 'text'),
            })),
          },
        }),
      }),
    [],
  )
  const {
    messages,
    sendMessage,
    setMessages,
    status,
    error,
    clearError,
    regenerate,
    stop,
  } = useChat({ transport })
  const busy = status === 'submitted' || status === 'streaming'

  // Observe rendered height so late-loading Markdown and images also follow
  // the conversation. Scrolling up hands control back to the reader.
  useEffect(() => {
    const viewport = viewportRef.current
    const transcript = transcriptRef.current
    if (!viewport || !transcript) return
    const observer = new ResizeObserver(() => {
      if (followOutputRef.current) viewport.scrollTop = viewport.scrollHeight
    })
    observer.observe(transcript)
    return () => observer.disconnect()
  }, [])

  function submitMessage(text: string) {
    const value = text.trim()
    if (
      busy ||
      value.length < MIN_QUESTION_LENGTH ||
      value.length > MAX_QUESTION_LENGTH
    )
      return
    clearError()
    followOutputRef.current = true
    void sendMessage({ text: value })
    setInput('')
  }

  return (
    <main className="mx-auto grid h-dvh w-full max-w-6xl grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-6">
      <HandbookInfo />
      <section
        aria-label="Handbook chat"
        className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card"
      >
        <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4 sm:px-6">
          <h2 className="text-sm font-medium">Ask the handbook</h2>
          {messages.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => {
                setMessages([])
                clearError()
                setInput('')
                followOutputRef.current = true
              }}
            >
              New chat
            </Button>
          ) : null}
        </header>
        <div
          ref={viewportRef}
          className="conversation-viewport min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6"
          onScroll={(event) => {
            const viewport = event.currentTarget
            followOutputRef.current =
              viewport.scrollHeight -
                viewport.scrollTop -
                viewport.clientHeight <
              80
          }}
        >
          <div
            ref={transcriptRef}
            role="log"
            aria-label="Handbook conversation"
            aria-busy={busy}
            className="flex min-h-full flex-col gap-6 py-6"
          >
            {messages.length === 0 ? (
              <div className="message-entry mx-auto my-auto w-full max-w-md py-3">
                <a
                  href={HANDBOOK_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-7 block w-40 sm:w-48"
                >
                  <img
                    src="/babys-best-chance-cover.png"
                    alt="Baby's Best Chance handbook cover"
                    width={2568}
                    height={1992}
                    className="h-auto w-full rounded-md"
                  />
                </a>
                <div className="divide-y divide-border">
                  {SUGGESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      className="suggestion block w-full cursor-pointer py-3 text-left text-sm leading-6 text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                      onClick={() => submitMessage(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => {
                const text = getMessageText(message)
                if (!text) return null
                const isUser = message.role === 'user'
                return (
                  <div
                    key={message.id}
                    aria-label={isUser ? 'Your question' : 'Handbook answer'}
                    className={
                      isUser
                        ? 'message-entry ml-auto max-w-[90%] rounded-lg bg-secondary px-4 py-3 text-sm leading-6 text-foreground sm:max-w-[80%]'
                        : 'message-entry min-w-0 text-sm leading-7 text-foreground'
                    }
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{text}</div>
                    ) : (
                      <Suspense
                        fallback={
                          <div className="whitespace-pre-wrap">{text}</div>
                        }
                      >
                        <AnswerMarkdown isAnimating={false}>
                          {text}
                        </AnswerMarkdown>
                      </Suspense>
                    )}
                  </div>
                )
              })
            )}
            <Collapsible.Root open={busy}>
              <Collapsible.Content className="collapsible-content">
                <output className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" />
                  Reading the handbook…
                </output>
              </Collapsible.Content>
            </Collapsible.Root>
          </div>
        </div>
        <div className="shrink-0 border-t border-border p-3 sm:p-4">
          {error ? (
            <div
              role="alert"
              className="message-entry mb-3 flex items-center justify-between gap-3 rounded-md bg-red-50 p-3 text-sm text-red-800"
            >
              <p>{error.message}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  clearError()
                  followOutputRef.current = true
                  void regenerate()
                }}
              >
                Try again
              </Button>
            </div>
          ) : null}
          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              submitMessage(input)
            }}
          >
            <Textarea
              value={input}
              onChange={(event) => setInput(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault()
                  submitMessage(input)
                }
              }}
              aria-label="Ask the handbook"
              maxLength={MAX_QUESTION_LENGTH}
              placeholder="Ask a question"
              className="max-h-40 min-h-12 flex-1 resize-none rounded-md bg-card px-3 py-3 text-base leading-6"
              rows={1}
            />
            {busy ? (
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-md px-4"
                onClick={() => {
                  void stop()
                }}
              >
                Stop
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={input.trim().length < MIN_QUESTION_LENGTH}
                className="h-12 rounded-md px-4"
              >
                <ArrowUp className="size-4" />
                Ask
              </Button>
            )}
          </form>
        </div>
      </section>
    </main>
  )
}
