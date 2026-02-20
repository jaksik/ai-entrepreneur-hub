import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createNewsletter } from '../actions'

async function createNewsletterAndRedirect(formData: FormData) {
  'use server'

  await createNewsletter(formData)
  redirect('/admin/newsletters')
}

export default function NewNewsletterPage() {
  return (
    <section className="w-full bg-(--color-bg-primary)">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="type-title text-(--color-text-primary)">Create Newsletter</h2>
        <Link
          href="/admin/newsletters"
          className="rounded-md border border-(--color-card-border) px-3 py-2 type-caption text-(--color-text-primary) hover:bg-(--color-bg-secondary)"
        >
          Back to Newsletters
        </Link>
      </div>

      <div className="max-w-2xl rounded-xl border border-(--color-card-border) bg-(--color-card-bg) p-5">
        <form action={createNewsletterAndRedirect} className="space-y-4">
          <div>
            <label className="mb-1 block type-caption text-(--color-text-secondary)">Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="Newsletter title"
              className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block type-caption text-(--color-text-secondary)">Publish Date</label>
            <input
              type="datetime-local"
              name="publish_date"
              className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-accent-primary px-4 py-2 type-caption font-medium text-white hover:bg-accent-hover"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}