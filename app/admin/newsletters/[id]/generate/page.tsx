import { notFound } from 'next/navigation'
import GenerateClient from './GenerateClient'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function NewsletterGeneratePage({ params }: PageProps) {
  const { id } = await params
  const newsletterId = Number(id)

  if (!newsletterId || Number.isNaN(newsletterId)) {
    notFound()
  }

  return <GenerateClient newsletterId={newsletterId} />
}
