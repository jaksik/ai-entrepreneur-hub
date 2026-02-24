'use client'

import { useState, useTransition } from 'react'
import { updateArticleCategory } from './actions'
import {
  CATEGORY_OPTIONS,
  getCategorySelectTone,
  normalizeCategoryValue,
} from '../../categoryDropdown'

export default function ArticleCategorySelect({
  articleId,
  newsletterId,
  currentCategory,
}: {
  articleId: number
  newsletterId: number
  currentCategory: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [optimisticCategory, setOptimisticCategory] = useState<string | null>(() => {
    const normalized = normalizeCategoryValue(currentCategory)
    return normalized || null
  })
  const categoryToneClass = getCategorySelectTone(normalizeCategoryValue(optimisticCategory))

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = event.target.value === '' ? null : event.target.value
    setOptimisticCategory(newCategory)

    startTransition(async () => {
      await updateArticleCategory(articleId, newsletterId, newCategory)
    })
  }

  return (
    <select
      value={optimisticCategory || ''}
      onChange={handleChange}
      disabled={isPending}
      className={`w-full rounded-md border px-2 py-1.5 type-caption transition-colors disabled:opacity-50 ${categoryToneClass}`}
    >
      <option value="">Category</option>
      {CATEGORY_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
