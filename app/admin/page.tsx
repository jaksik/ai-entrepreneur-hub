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
      <h2 className="type-title mb-6">Admin</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/tools"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
        >
          <p className="type-caption text-gray-500">Manage</p>
          <h3 className="type-title mt-1">Tools</h3>
          <p className="type-body text-gray-700 mt-2">{toolsCount ?? 0} total</p>
        </Link>

        <Link
          href="/admin/articles"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
        >
          <p className="type-caption text-gray-500">Manage</p>
          <h3 className="type-title mt-1">Articles</h3>
          <p className="type-body text-gray-700 mt-2">{articlesCount ?? 0} total</p>
        </Link>
      </div>
    </div>
  )
}