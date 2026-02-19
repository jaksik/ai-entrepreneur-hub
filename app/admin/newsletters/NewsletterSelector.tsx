'use client'

import { useRouter } from 'next/navigation'

type Newsletter = {
  id: number
  title: string | null
  publish_date: string | null
  status: string | null
}

export default function NewsletterSelector({ 
  newsletters, 
  activeNewsletterId 
}: { 
  newsletters: Newsletter[]
  activeNewsletterId: number | null
}) {
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newsletterId = e.target.value
    if (newsletterId) {
      router.push(`/admin/newsletters?newsletterId=${newsletterId}`)
    } else {
      router.push('/admin/newsletters')
    }
  }

  return (
    <select
      value={activeNewsletterId ? String(activeNewsletterId) : ''}
      onChange={handleChange}
      className="rounded-md border border-(--color-card-border) bg-(--color-card-bg) px-3 py-2 type-body text-(--color-text-primary)"
    >
      <option value="">Select a newsletter...</option>
      {newsletters?.map((newsletter) => (
        <option key={newsletter.id} value={newsletter.id}>
          {newsletter.title || `Newsletter #${newsletter.id}`}
          {newsletter.publish_date ? ` · ${new Date(newsletter.publish_date).toLocaleDateString()}` : ''}
          {newsletter.status ? ` · ${newsletter.status}` : ''}
        </option>
      ))}
    </select>
  )
}
