'use client'

import { useState, useTransition } from 'react'
import { updateArticleContent } from './actions'

function normalizeCategory(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase()
  return normalized || ''
}

function getCategorySelectTone(category: string) {
  if (category === 'feature') {
    return 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-300'
  }

  if (category === 'brief') {
    return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
  }

  if (category === 'economy') {
    return 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'
  }

  if (category === 'research') {
    return 'border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-300'
  }

  return 'border-(--color-card-border) bg-(--color-card-bg) text-(--color-text-primary)'
}

export default function CategorySelect({
  articleId,
  currentCategory,
}: {
  articleId: number
  currentCategory: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [optimisticCategory, setOptimisticCategory] = useState<string | null>(currentCategory)
  const categoryToneClass = getCategorySelectTone(normalizeCategory(optimisticCategory))

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
      className={`w-full rounded-md border px-2 py-1.5 type-caption transition-colors disabled:opacity-50 ${categoryToneClass}`}
    >
      <option value="">— Category —</option>
      <option value="feature">Feature</option>
      <option value="brief">Brief</option>
      <option value="economy">Economy</option>
      <option value="research">Research</option>
    </select>
  )
}
