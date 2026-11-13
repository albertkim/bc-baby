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
import { HandbookInfo } from './handbook-info'
import { HandbookWelcome } from './handbook-welcome'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'

const AnswerMarkdown = lazy(async () => ({
  default: (await import('streamdown')).Streamdown,
}))
export function HandbookChat() {
  const [input, setInput] = useState('')
  const viewportRef = useRef<HTMLDivElement>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const followOutputRef = useRef(false)
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
    <main className="handbook-app">
      <HandbookInfo>
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
              followOutputRef.current = false
            }}
          >
            New chat
          </Button>
        ) : null}
      </HandbookInfo>
      <section aria-label="Handbook chat" className="handbook-chat">
        <div
          ref={viewportRef}
          className="conversation-viewport"
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
            className="conversation-transcript"
          >
            {messages.length === 0 ? (
              <HandbookWelcome onQuestion={submitMessage} />
            ) : (
              messages.map((message) => {
                const text = getMessageText(message)
                const isUser = message.role === 'user'
                if (!text) return null
                return (
                  <div
                    key={message.id}
                    aria-label={isUser ? 'Your question' : 'Handbook answer'}
                    className={
                      isUser
                        ? 'message-entry chat-question'
                        : 'message-entry chat-answer'
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
            {messages.length > 0 ? (
              <Collapsible.Root open={busy}>
                <Collapsible.Content className="collapsible-content">
                  <output className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
                    <LoaderCircle className="size-4 animate-spin" />
                    Reading the handbooks…
                  </output>
                </Collapsible.Content>
              </Collapsible.Root>
            ) : null}
          </div>
        </div>
        <div className="composer-wrap">
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
            className="chat-composer"
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
              placeholder="Ask a question…"
              className="chat-input"
              rows={1}
            />
            {busy ? (
              <Button
                type="button"
                variant="outline"
                className="composer-action composer-stop"
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
                className="composer-action"
              >
                <ArrowUp aria-hidden="true" className="size-5" />
                <span className="sr-only">Ask</span>
              </Button>
            )}
          </form>
        </div>
      </section>
    </main>
  )
}
