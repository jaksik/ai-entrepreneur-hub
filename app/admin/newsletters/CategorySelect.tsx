'use client'

import { useState, useTransition } from 'react'
import { updateArticleContent } from './actions'

export default function CategorySelect({
  articleId,
  currentCategory,
}: {
  articleId: number
  currentCategory: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [optimisticCategory, setOptimisticCategory] = useState<string | null>(currentCategory)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value === '' ? null : e.target.value
    setOptimisticCategory(newCategory)
    
    startTransition(async () => {
      await updateArticleContent(articleId, {
        newsletter_category: newCategory,
      })
    })
  }

  return (
    <select
      value={optimisticCategory || ''}
      onChange={handleChange}
      disabled={isPending}
      className="w-full rounded-md border border-(--color-card-border) bg-(--color-card-bg) px-2 py-1.5 type-caption text-(--color-text-primary) disabled:opacity-50"
    >
      <option value="">— Category —</option>
      <option value="feature">Feature</option>
      <option value="brief">Brief</option>
      <option value="economy">Economy</option>
      <option value="research">Research</option>
    </select>
  )
}
