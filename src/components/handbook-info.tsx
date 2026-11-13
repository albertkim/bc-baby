import { ChevronDown } from 'lucide-react'
import { Collapsible } from 'radix-ui'
import { Button } from './ui/button'

export const HANDBOOK_URL =
  'https://www.healthlinkbc.ca/living-well/parenting/parenting-babies-0-12-months/babys-best-chance-parents-handbook-pregnancy-and'

function HandbookDetails() {
  return (
    <div className="space-y-5 py-4 text-sm leading-6">
      <img
        src="/BC.png"
        alt="Province of British Columbia"
        width={1102}
        height={372}
        className="h-auto w-40"
      />
      <p className="text-muted-foreground">
        I built this to make the handbook easier to use on a phone.
      </p>
      <a
        href={HANDBOOK_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-block underline underline-offset-4"
      >
        Read the handbook
      </a>
      <p className="text-muted-foreground">
        Made by{' '}
        <a
          href="mailto:albert275@gmail.com"
          className="underline underline-offset-4"
        >
          Albert Kim
        </a>
        {' · '}
        <a
          href="https://www.linkedin.com/in/albert-kim-84a6169b/"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          LinkedIn
        </a>
      </p>
    </div>
  )
}

export function HandbookInfo() {
  return (
    <Collapsible.Root asChild>
      <aside className="min-h-0 shrink-0 border-b border-border px-1 pb-3 lg:overflow-y-auto lg:border-0 lg:py-5 lg:pr-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-base font-semibold leading-6 lg:text-lg">
            Baby&apos;s Best Chance
          </h1>
          <Collapsible.Trigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="info-trigger lg:hidden"
            >
              About <ChevronDown className="info-chevron size-4" />
            </Button>
          </Collapsible.Trigger>
        </div>
        <div className="hidden lg:block">
          <HandbookDetails />
        </div>
        <Collapsible.Content className="collapsible-content lg:hidden">
          <HandbookDetails />
        </Collapsible.Content>
      </aside>
    </Collapsible.Root>
  )
}
