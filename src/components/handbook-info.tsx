import { ChevronDown } from 'lucide-react'
import { Collapsible } from 'radix-ui'
import { Button } from './ui/button'

export const HANDBOOK_URL =
  'https://www.healthlinkbc.ca/living-well/parenting/parenting-babies-0-12-months/babys-best-chance-parents-handbook-pregnancy-and'

export function HandbookInfo() {
  return (
    <Collapsible.Root asChild>
      <header className="handbook-header">
        <div className="handbook-masthead">
          <h1>
            Baby&apos;s Best Chance
            <span className="brand-dot" aria-hidden="true" />
          </h1>
          <Collapsible.Trigger asChild>
            <Button variant="ghost" size="sm" className="info-trigger">
              About <ChevronDown className="info-chevron size-4" />
            </Button>
          </Collapsible.Trigger>
        </div>
        <Collapsible.Content className="collapsible-content">
          <div className="handbook-details">
            <img
              src="/BC.png"
              alt="Province of British Columbia"
              width={1102}
              height={372}
              className="h-auto w-32"
            />
            <p>I built this to make the handbook easier to use on a phone.</p>
            <a href={HANDBOOK_URL} target="_blank" rel="noreferrer">
              Read the handbook
            </a>
            <p className="handbook-maker">
              Made by <a href="mailto:albert275@gmail.com">Albert Kim</a>
              {' · '}
              <a
                href="https://www.linkedin.com/in/albert-kim-84a6169b/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            </p>
          </div>
        </Collapsible.Content>
      </header>
    </Collapsible.Root>
  )
}
