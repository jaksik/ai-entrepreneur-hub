import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DeleteButton from './DeleteButton'
import { updateArticle } from './actions'

function toDateTimeLocal(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: article } = await supabase.from('articles').select().eq('id', Number(id)).single()

  if (!article) {
    redirect('/admin/articles')
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="type-title text-(--color-text-primary)">Edit Article</h1>
        <DeleteButton id={article.id} />
      </div>

      <form action={updateArticle} className="space-y-6">
        <input type="hidden" name="id" value={article.id} />

        <div>
          <label className="block type-caption">Title</label>
          <input
            name="title"
            type="text"
            required
            defaultValue={article.title || ''}
            className="mt-1 block w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) p-2 text-(--color-text-primary)"
          />
        </div>

        <div>
          <label className="block type-caption">URL</label>
          <input
            name="url"
            type="url"
            required
            defaultValue={article.url || ''}
            className="mt-1 block w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) p-2 text-(--color-text-primary)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block type-caption">Publisher</label>
            <input
              name="publisher"
              type="text"
              defaultValue={article.publisher || ''}
              className="mt-1 block w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) p-2 text-(--color-text-primary)"
            />
          </div>

          <div>
            <label className="block type-caption">Category</label>
            <input
              name="category"
              type="text"
              defaultValue={article.category || ''}
              className="mt-1 block w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) p-2 text-(--color-text-primary)"
            />
          </div>
        </div>

        <div>
          <label className="block type-caption">Published At</label>
          <input
            name="published_at"
            type="datetime-local"
            defaultValue={toDateTimeLocal(article.published_at)}
            className="mt-1 block w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) p-2 text-(--color-text-primary)"
          />
        </div>

        <button
          type="submit"
          className="type-body w-full rounded-md bg-accent-primary p-3 text-white hover:bg-accent-hover"
        >
          Save Changes
        </button>
      </form>
    </div>
  )
}
