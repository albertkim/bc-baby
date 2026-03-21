import { useMemo, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { createFileRoute } from '@tanstack/react-router'
import { DefaultChatTransport } from 'ai'
import { ArrowUp, LoaderCircle, Square } from 'lucide-react'
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
import { Separator } from '#/components/ui/separator'
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

  function submitMessage(text: string) {
    const value = text.trim()

    if (!value || busy) {
      return
    }

    sendMessage({ text: value })
    setInput('')
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader className="gap-3">
            <Badge
              variant="outline"
              className="w-fit border-emerald-700/15 bg-emerald-50 text-emerald-900"
            >
              BC Baby Handbook
            </Badge>
            <CardTitle className="font-serif text-3xl tracking-tight">
              Ask the handbook
            </CardTitle>
            <CardDescription className="text-sm leading-6">
              Minimal handbook chat over the cleaned Baby&apos;s Best Chance
              chapters. The app picks a few source files from metadata, reads
              them, and answers from those excerpts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Corpus: 17 handbook files</p>
              <p>
                Selection: router model over <code>content/metadata.json</code>
              </p>
              <p>Answering: selected Markdown files only</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Try asking
              </p>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="rounded-xl border border-border bg-background px-3 py-3 text-left text-sm leading-5 text-foreground transition hover:border-emerald-700/20 hover:bg-emerald-50/70"
                    onClick={() => submitMessage(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex min-h-[70vh] flex-col border-border/70 bg-card/92 shadow-sm">
          <CardHeader className="gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Chat</CardTitle>
                <CardDescription>
                  Answers should end with a source line naming the files used.
                </CardDescription>
              </div>
              <Badge variant="outline" className="capitalize">
                {status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
            <ScrollArea className="min-h-0 flex-1 rounded-2xl border border-border bg-background/70">
              <div className="flex min-h-full flex-col gap-4 p-4">
                {messages.length === 0 ? (
                  <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 text-center text-sm leading-6 text-muted-foreground">
                    Ask a question about pregnancy, birth, baby care, feeding,
                    or recovery and the app will pull the most relevant chapter
                    files before answering.
                  </div>
                ) : null}

                {messages.map((message) => {
                  const text = getMessageText(message.parts)

                  if (!text) {
                    return null
                  }

                  const isUser = message.role === 'user'

                  return (
                    <div
                      key={message.id}
                      className={
                        isUser
                          ? 'ml-auto w-full max-w-2xl'
                          : 'mr-auto w-full max-w-3xl'
                      }
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
              className="flex flex-col gap-3"
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
                placeholder="Ask a question about the handbook..."
                className="min-h-28 resize-none rounded-2xl border-border bg-background px-4 py-3 text-sm leading-6"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Minimal flow: metadata pick, file read, answer from selected
                  chapters.
                </p>
                <div className="flex items-center gap-2">
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
