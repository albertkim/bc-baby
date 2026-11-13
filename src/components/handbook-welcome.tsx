import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { HANDBOOK_URL } from './handbook-info'

const TOPICS = {
  baby: {
    label: 'Your baby',
    questions: [
      'How can my baby sleep safely?',
      'How do I know my baby is getting enough milk?',
      'What can I try when my baby cries?',
    ],
  },
  pregnancy: {
    label: 'Pregnancy',
    questions: [
      'When should I call my health care provider?',
      'How can I tell if I am in labour?',
      'What should I pack for the hospital?',
    ],
  },
  you: {
    label: 'You, too',
    questions: [
      'What can help with recovery after birth?',
      'How can my partner support me?',
      'Where can I find support as a new parent?',
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
      <a
        href={HANDBOOK_URL}
        target="_blank"
        rel="noreferrer"
        className="handbook-cover"
      >
        <img
          src="/babys-best-chance-cover.png"
          alt="Baby's Best Chance handbook cover"
          width={2568}
          height={1992}
        />
      </a>
      <h2>What’s on your mind?</h2>
      <p className="welcome-subtitle">Ask the handbook</p>
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
