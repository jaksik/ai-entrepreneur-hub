'use client'

import { deleteArticle } from './actions'

export default function DeleteButton({ id }: { id: number }) {
  return (
    <form
      action={deleteArticle}
      onSubmit={(e) => {
        if (!confirm('Are you sure you want to delete this article? This cannot be undone.')) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="type-caption text-accent-primary hover:text-accent-hover">Delete Article</button>
    </form>
  )
}
