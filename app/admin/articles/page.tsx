import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

function formatCreatedAt(value: string | null) {
  if (!value) return '—'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'

  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default async function AdminArticlesPage() {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, description, source, publisher, category, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="type-title text-(--color-text-primary)">AI-News Articles</h2>
        <Link
          href="/admin/articles/new"
          className="type-body rounded-md border border-(--color-card-border) bg-(--color-card-bg) px-4 py-2 text-(--color-text-primary) hover:bg-(--color-bg-secondary)"
        >
          + Add New Article
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-(--color-card-border) bg-(--color-card-bg)">
        <table className="min-w-full divide-y divide-(--color-card-border)">
          <thead className="bg-(--color-bg-secondary)">
            <tr>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">created_at</th>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">source</th>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">publisher</th>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">description</th>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">category</th>
              <th className="px-6 py-3 text-right type-caption text-(--color-text-secondary) uppercase tracking-wider">edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-card-border) bg-(--color-card-bg)">
            {articles?.map((article) => (
              <tr key={article.id}>
                <td className="px-6 py-4 whitespace-nowrap type-caption text-(--color-text-secondary)">
                  {formatCreatedAt(article.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap type-caption text-(--color-text-secondary)">{article.source || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap type-caption text-(--color-text-secondary)">{article.publisher || '—'}</td>
                <td className="px-6 py-4 type-body max-w-sm truncate text-(--color-text-primary)">{article.title || 'Untitled'}</td>
                <td className="px-6 py-4 type-caption max-w-md truncate text-(--color-text-secondary)">{article.description || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap type-caption text-(--color-text-secondary)">{article.category || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right type-caption">
                  <Link
                    href={`/admin/articles/edit/${article.id}`}
                    className="mr-4 text-accent-primary hover:text-accent-hover"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
