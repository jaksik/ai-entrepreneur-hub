'use client'

import Link from 'next/link'
import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createNewsletter } from '../actions'

type CreateNewsletterState = {
  success: boolean
  newsletterId?: number
  error?: string
}

function toLocalDateTimeValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function adjustDateByDays(value: string, amount: number) {
  const parsed = new Date(`${value}T00:01:00`)
  const baseDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed
  baseDate.setDate(baseDate.getDate() + amount)
  return toLocalDateTimeValue(baseDate)
}

export default function CreateNewsletterPage() {
  const router = useRouter()
  const [publishDateValue, setPublishDateValue] = useState(() => toLocalDateTimeValue(new Date()))

  const [state, formAction, isPending] = useActionState(
    async (_prevState: CreateNewsletterState, formData: FormData): Promise<CreateNewsletterState> => {
      try {
        const newsletterId = await createNewsletter(formData)
        return { success: true, newsletterId }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create newsletter',
        }
      }
    },
    { success: false }
  )

  useEffect(() => {
    if (state.success && state.newsletterId) {
      router.push(`/admin/newsletters/${state.newsletterId}/articles`)
    }
  }, [router, state.newsletterId, state.success])

  return (
    <section className="mx-auto w-full max-w-2xl bg-(--color-bg-primary)">
      <div className="mb-6">
        <h2 className="type-title text-(--color-text-primary)">Create Newsletter</h2>
        <p className="type-caption text-(--color-text-secondary)">Set up a new newsletter and jump straight into articles.</p>
      </div>

      <div className="rounded-xl border border-(--color-card-border) bg-(--color-card-bg) p-5">
        <form action={formAction} className="space-y-4">
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
            <label className="mb-1 block type-caption text-(--color-text-secondary)">Sub-title</label>
            <input
              type="text"
              name="sub_title"
              placeholder="Short sub-title for this issue"
              className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block type-caption text-(--color-text-secondary)">Publish Date</label>
            <div className="flex items-stretch gap-2">
              <div className="flex-1 rounded-md border border-(--color-input-border) bg-(--color-input-bg)">
                <input
                  type="date"
                  name="publish_date"
                  value={publishDateValue}
                  onChange={(event) => setPublishDateValue(event.target.value)}
                  className="w-full bg-transparent px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
                />
              </div>

              <div className="flex w-12 flex-col overflow-hidden rounded-md border border-(--color-input-border) bg-(--color-bg-secondary)">
                <button
                  type="button"
                  onClick={() => setPublishDateValue((current) => adjustDateByDays(current, 1))}
                  className="flex-1 border-b border-(--color-input-border) text-lg font-bold leading-none text-(--color-text-primary) hover:bg-(--color-card-bg)"
                  aria-label="Increase publish date by one day"
                  title="Increase by 1 day"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => setPublishDateValue((current) => adjustDateByDays(current, -1))}
                  className="flex-1 text-lg font-bold leading-none text-(--color-text-primary) hover:bg-(--color-card-bg)"
                  aria-label="Decrease publish date by one day"
                  title="Decrease by 1 day"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block type-caption text-(--color-text-secondary)">Status</label>
              <select
                name="status"
                defaultValue="draft"
                className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block type-caption text-(--color-text-secondary)">Cover Image URL</label>
              <input
                type="url"
                name="cover_image"
                placeholder="https://..."
                className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
              />
            </div>
          </div>

          {state.error ? <p className="type-caption text-red-500">{state.error}</p> : null}
          {state.success ? <p className="type-caption text-(--color-text-secondary)">Redirecting to articles...</p> : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Link
              href="/admin/newsletters"
              className="rounded-md border border-(--color-card-border) px-3 py-2 type-caption text-(--color-text-primary) hover:bg-(--color-bg-secondary)"
            >
              Back
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md border border-(--color-card-border) bg-(--color-text-primary) px-4 py-2 type-caption font-medium text-(--color-bg-primary) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
