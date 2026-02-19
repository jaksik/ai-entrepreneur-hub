'use client'

import { useRouter } from 'next/navigation'

export default function NewsletterSelect({
  newsletters,
  activeNewsletterId,
}: {
  newsletters: any[]
  activeNewsletterId: number | null
}) {
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    if (id) {
      router.push(`/admin/curation?newsletterId=${id}`)
    } else {
      router.push('/admin/curation')
    }
  }

  return (
    <select
      value={activeNewsletterId ? String(activeNewsletterId) : ''}
      onChange={handleChange}
      className="w-full rounded-md border border-(--color-card-border) bg-(--color-card-bg) px-3 py-2 type-body text-(--color-text-primary)"
    >
      <option value="">Select newsletter</option>
      {newsletters?.map((newsletter: { id: number; title: string | null }) => (
        <option key={newsletter.id} value={newsletter.id}>
          {newsletter.title || `Newsletter #${newsletter.id}`}
        </option>
      ))}
    </select>
  )
}
