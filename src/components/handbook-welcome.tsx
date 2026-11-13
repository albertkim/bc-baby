import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { HANDBOOKS } from '#/lib/handbooks'

const TOPICS = {
  pregnancy: {
    label: 'Pregnancy',
    questions: [
      'How can I ease nausea during pregnancy?',
      'Which foods should I avoid while pregnant?',
      'How can I tell if labour is starting?',
    ],
  },
  baby: {
    label: 'Baby',
    questions: [
      'How can I help my baby sleep safely?',
      'How can I tell if my baby is getting enough milk?',
      'What can I try when my baby won’t stop crying?',
    ],
  },
  toddler: {
    label: 'Toddler',
    questions: [
      'What can I do when my toddler has a tantrum?',
      'How can I handle picky eating?',
      'How do I know if my child is ready to use the toilet?',
    ],
  },
  parenting: {
    label: 'Parenting',
    questions: [
      'What can help with recovery after birth?',
      'What can I do when parenting feels overwhelming?',
      'How can my partner and I share the load?',
    ],
  },
}

type Topic = keyof typeof TOPICS

export function HandbookWelcome({
  onQuestion,
}: {
  onQuestion: (question: string) => void
}) {
  const [topic, setTopic] = useState<Topic>('baby')

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
              alt={`${book.title} handbook cover`}
              width={774}
              height={603}
            />
          </a>
        ))}
      </div>
      <h2>What’s on your mind?</h2>
      <p className="welcome-subtitle">Ask the handbooks</p>
      <fieldset className="question-topics">
        <legend className="sr-only">Question topics</legend>
        {(Object.keys(TOPICS) as Topic[]).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={topic === value}
            onClick={() => setTopic(value)}
          >
            {TOPICS[value].label}
          </button>
        ))}
      </fieldset>
      <div className="suggestions">
        {TOPICS[topic].questions.map((question) => (
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
