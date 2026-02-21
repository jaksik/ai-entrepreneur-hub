export const CATEGORY_OPTIONS = [
  { value: 'feature', label: 'Feature' },
  { value: 'brief', label: 'Brief' },
  { value: 'economy', label: 'Economy' },
  { value: 'research', label: 'Research' },
] as const

export function normalizeCategoryValue(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase()
  return normalized || ''
}

export function getCategorySelectTone(category: string) {
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
