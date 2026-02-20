'use client'

import { useActionState, useState } from 'react'
import { createNewsletter } from './actions'

type CreateNewsletterState = {
  success: boolean
  error?: string
}

export default function CreateNewsletterModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    async (_prevState: CreateNewsletterState, formData: FormData): Promise<CreateNewsletterState> => {
      try {
        await createNewsletter(formData)
        setIsOpen(false)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create newsletter',
        }
      }
    },
    { success: false }
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="type-body rounded-md border border-(--color-card-border) bg-(--color-card-bg) px-4 py-2 text-(--color-text-primary) hover:bg-(--color-bg-secondary)"
      >
        Create Newsletter
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-(--color-card-border) bg-(--color-card-bg) p-5">
            <div className="mb-4">
              <h2 className="type-subtitle text-(--color-text-primary)">Create Newsletter</h2>
              <p className="type-caption text-(--color-text-secondary)">
                Add a new newsletter draft.
              </p>
            </div>

            <form action={formAction} className="space-y-3">
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

              {state?.error ? (
                <p className="type-caption text-red-500">{state.error}</p>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md border border-(--color-card-border) px-3 py-2 type-caption text-(--color-text-primary) hover:bg-(--color-bg-secondary)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-accent-primary px-4 py-2 type-caption font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}