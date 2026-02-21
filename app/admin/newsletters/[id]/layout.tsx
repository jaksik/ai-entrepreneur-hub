import { notFound } from 'next/navigation'

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function NewsletterDetailLayout({ children, params }: LayoutProps) {
  const { id } = await params
  const newsletterId = Number(id)

  if (!newsletterId || Number.isNaN(newsletterId)) {
    notFound()
  }

  return children
}
