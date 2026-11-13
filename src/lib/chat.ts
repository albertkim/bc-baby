import type { UIMessage } from 'ai'
import type { HANDBOOKS } from './handbooks'

export type HandbookMessage = UIMessage<{
  handbookIds: Array<keyof typeof HANDBOOKS>
}>

export const MIN_QUESTION_LENGTH = 5
export const MAX_QUESTION_LENGTH = 4000
export const MAX_CONTEXT_MESSAGES = 10

export function getMessageText(message: Pick<UIMessage, 'parts'>) {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim()
}
