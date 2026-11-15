import { Check, ChevronDown, Languages } from 'lucide-react'
import { DropdownMenu } from 'radix-ui'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  LANGUAGES,
  LOCALES,
  LOCALE_COOKIE,
  MESSAGES,
  type Locale,
} from '#/lib/locale'
import { Button } from './ui/button'

export function LanguageSelector({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false)
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="language-trigger"
          aria-label={`${MESSAGES[locale].language}: ${LANGUAGES[locale].label}`}
        >
          <Languages aria-hidden="true" className="size-4" />
          <span lang={locale}>{LANGUAGES[locale].label}</span>
          <ChevronDown aria-hidden="true" className="size-3" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="language-menu"
          align="end"
          sideOffset={8}
          aria-label={MESSAGES[locale].language}
        >
          {LOCALES.map((language) => (
            <DropdownMenu.Item key={language} asChild>
              <Link
                to="/"
                search={{ lang: language }}
                resetScroll={false}
                lang={language}
                aria-current={language === locale ? 'true' : undefined}
                className="language-option"
                onClick={(event) => {
                  if (
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey ||
                    event.button !== 0
                  )
                    return
                  document.cookie = `${LOCALE_COOKIE}=${language}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
                  setOpen(false)
                }}
              >
                {LANGUAGES[language].label}
                {language === locale ? (
                  <Check aria-hidden="true" className="size-4" />
                ) : null}
              </Link>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
