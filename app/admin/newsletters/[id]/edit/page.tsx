import { redirect } from 'next/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function NewsletterEditRedirectPage({ params }: PageProps) {
  const { id } = await params
  redirect(`/admin/newsletters/${id}/design`)
}
