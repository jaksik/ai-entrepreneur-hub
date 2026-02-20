'use client'

import { useActionState, useEffect, useState } from 'react'
import { updateNewsletterPublishDate } from '../../actions'

type ScheduledDateState = {
  error?: string
}

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

function formatDateTimeLocalValue(value: string | null) {
  if (!value) return ''

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''

  const localDate = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

export default function ScheduledDateEditor({
  newsletterId,
  publishDate,
}: {
  newsletterId: number
  publishDate: string | null
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [currentPublishDate, setCurrentPublishDate] = useState<string | null>(publishDate)

  useEffect(() => {
    setCurrentPublishDate(publishDate)
  }, [publishDate])

  const [state, formAction, isPending] = useActionState(
    async (_prevState: ScheduledDateState, formData: FormData): Promise<ScheduledDateState> => {
      try {
        await updateNewsletterPublishDate(formData)
        const nextRawValue = formData.get('publish_date')
        const nextValue = typeof nextRawValue === 'string' && nextRawValue ? new Date(nextRawValue).toISOString() : null
        setCurrentPublishDate(nextValue)
        setIsEditing(false)
        return {}
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to update scheduled date',
        }
      }
    },
    {}
  )

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center gap-2 rounded-full border border-(--color-card-border) bg-(--color-card-bg) px-4 py-1.5 hover:bg-(--color-bg-secondary)"
      >
        <span className="type-caption text-(--color-text-secondary)">Scheduled Date:</span>
        <span className="type-caption font-medium text-(--color-text-primary)">{formatPublishedAt(currentPublishDate)}</span>
      </button>
    )
  }

  return (
    <div className="rounded-lg border border-(--color-card-border) bg-(--color-card-bg) p-3">
      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="newsletter_id" value={String(newsletterId)} />
        <div>
          <label className="mb-1 block type-caption text-(--color-text-secondary)">Update scheduled date</label>
          <input
            type="datetime-local"
            name="publish_date"
            defaultValue={formatDateTimeLocalValue(currentPublishDate)}
            className="rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="rounded-md border border-(--color-card-border) px-3 py-2 type-caption text-(--color-text-primary) hover:bg-(--color-bg-secondary)"
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md border border-accent-primary bg-accent-primary px-3 py-2 type-caption font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Saving...' : 'Save'}
        </button>
      </form>
      {state.error ? <p className="mt-2 type-caption text-red-500">{state.error}</p> : null}
    </div>
  )
}