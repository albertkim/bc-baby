import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import appCss from '../styles.css?url'

const title = 'BC Baby · Pregnancy, baby & toddler questions'
const description =
  'Ask about pregnancy, baby care and toddler development with answers grounded in BC’s Baby’s Best Chance and Toddler’s First Steps handbooks.'
const siteUrl = 'https://bc-baby.vercel.app/'

export const Route = createRootRoute({
  head: () => ({
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
      { property: 'og:url', content: siteUrl },
      { property: 'og:locale', content: 'en_CA' },
      { property: 'og:image', content: `${siteUrl}icon-512.png` },
      { property: 'og:image:width', content: '512' },
      { property: 'og:image:height', content: '512' },
      { property: 'og:image:alt', content: 'BC Baby’s smiling baby icon' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: `${siteUrl}icon-512.png` },
    ],
    links: [
      { rel: 'canonical', href: siteUrl },
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
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA">
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
