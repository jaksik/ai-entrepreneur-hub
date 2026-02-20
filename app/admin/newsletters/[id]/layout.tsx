import { notFound } from 'next/navigation'
import NewsletterTabs from './NewsletterTabs'

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

  return (
    <div className="space-y-6">
      <NewsletterTabs newsletterId={newsletterId} />
      {children}
    </div>
  )
}
