import type { ReactNode } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { Button } from './ui/button'
import { LanguageSelector } from './language-selector'
import { localeHref, MESSAGES, type Locale } from '#/lib/locale'
import { HANDBOOKS } from '#/lib/handbooks'

export function HandbookInfo({
  children,
  locale,
}: {
  children?: ReactNode
  locale: Locale
}) {
  const t = MESSAGES[locale]
  return (
    <Dialog.Root>
      <header className="handbook-header">
        <div className="handbook-masthead">
          <h1>
            <a
              href={localeHref(locale)}
              className="handbook-brand"
              aria-label={t.home}
            >
              BC Baby
              <span className="brand-dot" aria-hidden="true" />
            </a>
          </h1>
          <div className="handbook-actions">
            {children}
            <Dialog.Trigger asChild>
              <Button variant="ghost" size="sm">
                {t.about}
              </Button>
            </Dialog.Trigger>
            <LanguageSelector locale={locale} />
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
              aria-label={t.closeAbout}
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          </Dialog.Close>
          <img
            src="/BC.png"
            alt={t.province}
            width={1102}
            height={372}
            className="about-logo"
          />
          <Dialog.Title className="about-title">{t.aboutTitle}</Dialog.Title>
          <Dialog.Description className="about-description">
            {t.aboutDescription}
          </Dialog.Description>
          <div className="about-handbooks">
            {Object.values(HANDBOOKS).map((book) => (
              <a
                key={book.title}
                href={book.url}
                target="_blank"
                rel="noreferrer"
                className="about-handbook-link"
              >
                {book.title}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            ))}
          </div>
          <p className="about-source-language">{t.sourceLanguage}</p>
          <div className="about-contact">
            <p>{t.madeBy}</p>
            <div>
              <a href="mailto:albert275@gmail.com">{t.email}</a>
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
