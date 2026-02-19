import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function AdminToolsPage() {
  const supabase = await createClient()
  const { data: tools } = await supabase.from('tools').select().order('name', { ascending: true })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="type-title text-(--color-text-primary)">Your Tools</h2>
        <Link
          href="/admin/tools/new"
          className="type-body rounded-md border border-(--color-card-border) bg-(--color-card-bg) px-4 py-2 text-(--color-text-primary) hover:bg-(--color-bg-secondary)"
        >
          + Add New Tool
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-(--color-card-border) bg-(--color-card-bg)">
        <table className="min-w-full divide-y divide-(--color-card-border)">
          <thead className="bg-(--color-bg-secondary)">
            <tr>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">URL</th>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">Affiliate</th>
              <th className="px-6 py-3 text-right type-caption text-(--color-text-secondary) uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-card-border) bg-(--color-card-bg)">
            {tools?.map((tool) => (
              <tr key={tool.id}>
                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                  {tool.logo_url && (
                    <img src={tool.logo_url} className="w-6 h-6 object-contain" alt="" />
                  )}
                  <span className="type-body text-(--color-text-primary)">{tool.name}</span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap type-caption text-(--color-text-secondary)">{tool.category}</td>

                <td className="px-6 py-4 whitespace-nowrap type-caption text-accent-primary hover:underline truncate max-w-xs">
                  <a href={tool.url || ''} target="_blank" rel="noopener noreferrer">
                    {tool.url}
                  </a>
                </td>

                <td className="px-6 py-4 whitespace-nowrap type-caption">
                  {tool.affiliate_link ? (
                    <a
                      href={tool.affiliate_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-primary hover:underline truncate max-w-xs block"
                    >
                      {tool.affiliate_link}
                    </a>
                  ) : (
                    <span className="text-(--color-text-tertiary)">—</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right type-caption">
                  <Link
                    href={`/admin/tools/edit/${tool.id}`}
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
