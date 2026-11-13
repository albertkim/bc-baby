import type { ReactNode } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { Button } from './ui/button'

export const HANDBOOK_URL =
  'https://www.healthlinkbc.ca/living-well/parenting/parenting-babies-0-12-months/babys-best-chance-parents-handbook-pregnancy-and'

export function HandbookInfo({ children }: { children?: ReactNode }) {
  return (
    <Dialog.Root>
      <header className="handbook-header">
        <div className="handbook-masthead">
          <h1>
            BC Baby
            <span className="brand-dot" aria-hidden="true" />
          </h1>
          <div className="handbook-actions">
            {children}
            <Dialog.Trigger asChild>
              <Button variant="ghost" size="sm">
                About
              </Button>
            </Dialog.Trigger>
          </div>
        </div>
      </header>
      <Dialog.Portal>
        <Dialog.Overlay className="about-overlay" />
        <Dialog.Content className="about-dialog">
          <Dialog.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="about-close"
              aria-label="Close About"
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          </Dialog.Close>
          <img
            src="/BC.png"
            alt="Province of British Columbia"
            width={1102}
            height={372}
            className="about-logo"
          />
          <Dialog.Title className="about-title">About BC Baby</Dialog.Title>
          <Dialog.Description className="about-description">
            I’m Albert, a new parent in BC. I made this so the Baby’s Best
            Chance handbook is easier to use on a phone.
          </Dialog.Description>
          <a
            href={HANDBOOK_URL}
            target="_blank"
            rel="noreferrer"
            className="about-handbook-link"
          >
            Read the handbook{' '}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
          <div className="about-contact">
            <p>Made by Albert Kim</p>
            <div>
              <a href="mailto:albert275@gmail.com">Email</a>
              <a
                href="https://www.linkedin.com/in/albert-kim-84a6169b/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn{' '}
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </a>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
