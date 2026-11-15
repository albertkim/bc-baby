import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { HANDBOOKS } from '#/lib/handbooks'

import { MESSAGES, TOPIC_IDS, type Locale, type TopicId } from '#/lib/locale'

export function HandbookWelcome({
  onQuestion,
  locale,
}: {
  onQuestion: (question: string) => void
  locale: Locale
}) {
  const [topic, setTopic] = useState<TopicId>('baby')
  const t = MESSAGES[locale]

  return (
    <div className="handbook-welcome message-entry">
      <div className="handbook-covers">
        {Object.values(HANDBOOKS).map((book) => (
          <a
            key={book.title}
            href={book.url}
            target="_blank"
            rel="noreferrer"
            className="handbook-cover"
          >
            <img
              src={book.cover}
              alt={`${book.title} — ${t.cover}`}
              width={774}
              height={603}
            />
          </a>
        ))}
      </div>
      <h2>{t.welcome}</h2>
      <p className="welcome-subtitle">{t.subtitle}</p>
      <fieldset className="question-topics">
        <legend className="sr-only">{t.topicsLabel}</legend>
        {TOPIC_IDS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={topic === value}
            onClick={() => setTopic(value)}
          >
            {t.topics[value].label}
          </button>
        ))}
      </fieldset>
      <div className="suggestions">
        {t.topics[topic].questions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onQuestion(question)}
          >
            <span>{question}</span>
            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
