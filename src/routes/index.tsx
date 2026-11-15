import { createFileRoute } from '@tanstack/react-router'
import { Route as RootRoute } from './__root'
import { HandbookChat } from '#/components/handbook-chat'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const locale = RootRoute.useLoaderData()
  return <HandbookChat locale={locale} />
}
