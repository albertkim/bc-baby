import { useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { createFileRoute } from '@tanstack/react-router'
import { DefaultChatTransport } from 'ai'
import { ArrowUp, ChevronDown, ChevronUp, LoaderCircle, Square } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { ScrollArea } from '#/components/ui/scroll-area'
import { Textarea } from '#/components/ui/textarea'

export const Route = createFileRoute('/')({ component: App })

const SUGGESTIONS = [
  'When should I call my health care provider during pregnancy?',
  'How can I tell if I am in labour?',
  'What does the handbook say about safe sleep for my baby?',
]

function getMessageText(parts: Array<{ type: string; text?: string }>) {
  return parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text' && Boolean(part.text))
    .map((part) => part.text)
    .join('\n')
    .trim()
}

function App() {
  const [input, setInput] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const previousBusyRef = useRef(false)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            messages: messages.slice(-8),
          },
        }),
      }),
    [],
  )

  const { messages, sendMessage, status, stop, error } = useChat({ transport })
  const busy = status !== 'ready'

  function scrollToBottom(behavior: ScrollBehavior) {
    const viewport = scrollAreaRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]',
    )

    if (viewport instanceof HTMLElement) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior,
      })
    }
  }

  useEffect(() => {
    if (!busy && previousBusyRef.current) {
      scrollToBottom('smooth')
    }

    previousBusyRef.current = busy
  }, [busy, messages])

  function submitMessage(text: string) {
    const value = text.trim()

    if (!value || busy) {
      return
    }

    sendMessage({ text: value })
    setInput('')
    requestAnimationFrame(() => scrollToBottom('smooth'))
  }

  return (
    <main className="mx-auto flex h-svh w-full max-w-6xl flex-col overflow-hidden px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-5 sm:pb-[calc(1.25rem+env(safe-area-inset-bottom))] lg:h-dvh lg:px-8">
      <section className="flex min-h-0 flex-1 flex-col gap-3 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6">
        <Card
          className={
            mobileMenuOpen
              ? 'shrink-0 overflow-hidden border-border/70 bg-card/90 shadow-sm lg:flex lg:min-h-0 lg:flex-col'
              : 'shrink-0 overflow-hidden border-border/70 bg-card/90 py-3 shadow-sm lg:flex lg:min-h-0 lg:flex-col lg:py-4'
          }
        >
          <CardHeader
            className={
              mobileMenuOpen
                ? 'gap-2.5 pb-3 sm:gap-3 sm:pb-4'
                : 'gap-2.5 pb-0 sm:gap-3 sm:pb-4'
            }
          >
            <div className="flex items-center justify-between gap-3">
              <Badge
                variant="outline"
                className="min-w-0 max-w-full border-emerald-700/15 bg-emerald-50 text-emerald-900"
              >
                BC - Baby&apos;s Best Chance
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 cursor-pointer lg:hidden"
                onClick={() => setMobileMenuOpen((open) => !open)}
              >
                {mobileMenuOpen ? (
                  <>
                    Hide
                    <ChevronUp className="size-4" />
                  </>
                ) : (
                  <>
                    Info
                    <ChevronDown className="size-4" />
                  </>
                )}
              </Button>
            </div>
            <div className={mobileMenuOpen ? 'space-y-3 lg:space-y-4' : 'hidden lg:block lg:space-y-4'}>
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-white/70 p-3">
                <img
                  src="/BC.png"
                  alt="Baby's Best Chance"
                  className="h-auto w-full"
                />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="font-serif text-2xl tracking-tight sm:text-3xl">
                  Ask the handbook
                </CardTitle>
                <CardDescription className="text-sm leading-5 sm:leading-6">
                  Ask questions about pregnancy, birth, feeding, baby care, and
                  recovery in plain language.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="hidden min-h-0 flex-1 overflow-y-auto space-y-5 lg:block">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Try one of these
              </p>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="cursor-pointer rounded-xl border border-border bg-background px-3 py-3 text-left text-sm leading-5 text-foreground transition hover:border-emerald-700/20 hover:bg-emerald-50/70"
                    onClick={() => submitMessage(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-border/70 bg-card/92 shadow-sm">
          <CardHeader className="gap-1.5 pb-2 sm:gap-2 sm:pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <CardTitle>Chat</CardTitle>
                <CardDescription className="mt-0.5">
                  Answers are based on the handbook.
                </CardDescription>
              </div>
              <Badge variant="outline" className="shrink-0 capitalize">
                {status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-2.5 sm:gap-3">
            <ScrollArea
              ref={scrollAreaRef}
              className="min-h-0 flex-1 rounded-2xl border border-border bg-background/70"
            >
              <div className="flex min-h-full flex-col gap-4 p-4">
                {messages.map((message) => {
                  const text = getMessageText(message.parts)

                  if (!text) {
                    return null
                  }

                  const isUser = message.role === 'user'

                  return (
                    <div
                      key={message.id}
                      className={isUser ? 'ml-auto w-full max-w-2xl min-w-0' : 'mr-auto w-full max-w-3xl min-w-0'}
                    >
                      <div
                        className={
                          isUser
                            ? 'rounded-3xl rounded-br-md bg-emerald-900 px-4 py-3 text-sm leading-6 text-white shadow-sm'
                            : 'rounded-3xl rounded-bl-md border border-border bg-card px-4 py-3 text-sm leading-6 text-foreground shadow-sm'
                        }
                      >
                        <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] opacity-70">
                          {isUser ? 'You' : 'Handbook'}
                        </div>
                        <div className="whitespace-pre-wrap">{text}</div>
                      </div>
                    </div>
                  )
                })}

                {busy ? (
                  <div className="mr-auto flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                    <LoaderCircle className="size-3.5 animate-spin" />
                    Reading handbook sections
                  </div>
                ) : null}
              </div>
            </ScrollArea>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error.message}
              </div>
            ) : null}

            <form
              className="flex flex-col gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                submitMessage(input)
              }}
            >
              <Textarea
                value={input}
                onChange={(event) => setInput(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    submitMessage(input)
                  }
                }}
                placeholder="Ask a question"
                className="min-h-24 resize-none rounded-2xl border-border bg-background px-4 py-3 text-base leading-6 sm:min-h-28"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 text-xs text-muted-foreground">
                  Press Enter to send. Use Shift+Enter for a new line.
                </p>
                <div className="flex items-center justify-end gap-2">
                  {busy ? (
                    <Button type="button" variant="outline" onClick={() => stop()}>
                      <Square className="size-4" />
                      Stop
                    </Button>
                  ) : null}
                  <Button
                    type="submit"
                    disabled={busy || input.trim().length === 0}
                  >
                    <ArrowUp className="size-4" />
                    Ask
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
