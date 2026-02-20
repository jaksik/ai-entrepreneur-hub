import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import CreateNewsletterModal from './CreateNewsletterModal'

function formatPublishedAt(value: string | null) {
  if (!value) return 'Not set'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Not set'

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function NewslettersPage() {
  const supabase = await createClient()
  const db = supabase

  const { data: newsletters, error } = await db
    .from('newsletters')
    .select('id, title, publish_date, status')
    .order('publish_date', { ascending: false, nullsFirst: false })

  if (error) {
    throw new Error('Failed to fetch newsletters')
  }

  return (
    <section className="w-full bg-(--color-bg-primary)">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="type-title text-(--color-text-primary)">Newsletters</h2>
        <CreateNewsletterModal />
      </div>

      <div className="overflow-hidden rounded-xl border border-(--color-card-border) bg-(--color-card-bg)">
        <table className="w-full border-collapse">
          <thead className="bg-(--color-bg-secondary)">
            <tr>
              <th className="px-4 py-3 text-left type-caption text-(--color-text-secondary)">Title</th>
              <th className="px-4 py-3 text-left type-caption text-(--color-text-secondary)">Publish Date</th>
              <th className="px-4 py-3 text-left type-caption text-(--color-text-secondary)">Status</th>
            </tr>
          </thead>
          <tbody>
            {newsletters?.length ? (
              newsletters.map((newsletter: { id: number; title: string | null; publish_date: string | null; status: string | null }) => (
                <tr
                  key={newsletter.id}
                  className="border-t border-(--color-card-border) transition hover:bg-(--color-bg-secondary)"
                >
                  <td className="px-4 py-3 type-body text-(--color-text-primary)">
                    <Link
                      href={`/admin/newsletters/${newsletter.id}/curate`}
                      className="hover:text-accent-primary hover:underline"
                    >
                      {newsletter.title || `Newsletter #${newsletter.id}`}
                    </Link>
                  </td>
                  <td className="px-4 py-3 type-caption text-(--color-text-secondary)">
                    {formatPublishedAt(newsletter.publish_date)}
                  </td>
                  <td className="px-4 py-3 type-caption text-(--color-text-secondary)">
                    <span className="capitalize">{newsletter.status || 'draft'}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center type-body text-(--color-text-secondary)">
                  No newsletters yet. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
