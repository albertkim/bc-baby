import { createServerFn } from '@tanstack/react-start'
import {
  getCookie,
  getRequestHeader,
  setResponseHeader,
} from '@tanstack/react-start/server'
import { isLocale, LOCALE_COOKIE, preferredLocale, type Locale } from './locale'

export const getInitialLocale = createServerFn({ method: 'GET' })
  .validator((value: Locale | undefined) =>
    isLocale(value) ? value : undefined,
  )
  .handler(({ data }) => {
    // This response depends on the visitor's preferences, never a shared cache.
    setResponseHeader('Cache-Control', 'private, no-store')
    const saved = getCookie(LOCALE_COOKIE)
    return (
      data ??
      (isLocale(saved)
        ? saved
        : preferredLocale(getRequestHeader('accept-language')))
    )
  })
