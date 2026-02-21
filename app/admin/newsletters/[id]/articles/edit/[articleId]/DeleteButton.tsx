'use client'

import { deleteArticle } from './actions'

export default function DeleteButton({ articleId, newsletterId }: { articleId: number; newsletterId: number }) {
  return (
    <form
      action={deleteArticle}
      onSubmit={(event) => {
        if (!confirm('Are you sure you want to delete this article? This cannot be undone.')) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="article_id" value={articleId} />
      <input type="hidden" name="newsletter_id" value={newsletterId} />
      <button className="type-caption text-accent-primary hover:text-accent-hover">Delete Article</button>
    </form>
  )
}
