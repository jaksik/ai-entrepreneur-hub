import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()
  const [{ count: toolsCount }, { count: articlesCount }] = await Promise.all([
    supabase.from('tools').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div>
      <h2 className="type-title mb-6 text-(--color-text-primary)">Admin</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/tools"
          className="rounded-lg border border-(--color-card-border) bg-(--color-card-bg) p-6 transition hover:bg-(--color-bg-secondary)"
        >
          <p className="type-caption text-(--color-text-secondary)">Manage</p>
          <h3 className="type-title mt-1 text-(--color-text-primary)">Tools</h3>
          <p className="type-body mt-2 text-(--color-text-secondary)">{toolsCount ?? 0} total</p>
        </Link>

        <Link
          href="/admin/articles"
          className="rounded-lg border border-(--color-card-border) bg-(--color-card-bg) p-6 transition hover:bg-(--color-bg-secondary)"
        >
          <p className="type-caption text-(--color-text-secondary)">Manage</p>
          <h3 className="type-title mt-1 text-(--color-text-primary)">Articles</h3>
          <p className="type-body mt-2 text-(--color-text-secondary)">{articlesCount ?? 0} total</p>
        </Link>
      </div>
    </div>
  )
}