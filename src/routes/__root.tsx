import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import {
  isLocale,
  LANGUAGES,
  LOCALES,
  localeHref,
  MESSAGES,
  SITE_URL,
  type Locale,
} from '#/lib/locale'
import { getInitialLocale } from '#/lib/locale.functions'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  validateSearch: (search: Record<string, unknown>): { lang?: Locale } => ({
    lang: isLocale(search.lang) ? search.lang : undefined,
  }),
  loaderDeps: ({ search }) => ({ lang: search.lang }),
  loader: ({ deps }) => getInitialLocale({ data: deps.lang }),
  head: ({ loaderData }) => {
    const locale = loaderData ?? 'en'
    const { title, description } = MESSAGES[locale]
    const canonical = new URL(localeHref(locale), SITE_URL).href
    return {
      meta: [
        {
          charSet: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover',
        },
        {
          title,
        },
        { name: 'description', content: description },
        { name: 'theme-color', content: '#edf4f2' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'BC Baby' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: canonical },
        { property: 'og:locale', content: LANGUAGES[locale].og },
        { property: 'og:image', content: `${SITE_URL}icon-512.png` },
        { property: 'og:image:width', content: '512' },
        { property: 'og:image:height', content: '512' },
        { property: 'og:image:alt', content: MESSAGES[locale].iconAlt },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: `${SITE_URL}icon-512.png` },
      ],
      links: [
        { rel: 'canonical', href: canonical },
        ...LOCALES.map((language) => ({
          rel: 'alternate',
          hrefLang: language,
          href: new URL(localeHref(language), SITE_URL).href,
        })),
        { rel: 'alternate', hrefLang: 'x-default', href: SITE_URL },
        { rel: 'icon', href: '/favicon.ico', sizes: '16x16 32x32 48x48 64x64' },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        {
          rel: 'apple-touch-icon',
          href: '/apple-touch-icon.png',
          sizes: '180x180',
        },
        { rel: 'manifest', href: '/manifest.json' },
        {
          rel: 'stylesheet',
          href: appCss,
        },
      ],
    }
  },
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const locale = Route.useLoaderData() ?? 'en'
  return (
    <html lang={locale}>
      <head>
        <HeadContent />
      </head>
      <body className="overflow-x-hidden font-sans antialiased [overflow-wrap:anywhere]">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
