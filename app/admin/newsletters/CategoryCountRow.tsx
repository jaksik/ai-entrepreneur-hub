const ORDERED_CATEGORIES = ['feature', 'brief', 'economy', 'research', 'uncategorized'] as const

function normalizeCategory(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase()
  if (!normalized) return 'uncategorized'
  return normalized
}

function formatCategoryLabel(value: string) {
  return value === 'uncategorized' ? 'Uncategorized' : value.charAt(0).toUpperCase() + value.slice(1)
}

function getCategoryChipTone(category: string) {
  if (category === 'feature') {
    return 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300'
  }

  if (category === 'brief') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
  }

  if (category === 'economy') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300'
  }

  if (category === 'research') {
    return 'border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300'
  }

  return 'border-(--color-card-border) bg-(--color-bg-secondary) text-(--color-text-secondary)'
}

type CategoryCountRowProps = {
  categories: Array<string | null | undefined>
  className?: string
  align?: 'left' | 'right'
}

export default function CategoryCountRow({ categories, className, align = 'right' }: CategoryCountRowProps) {
  const counts = categories.reduce((acc: Record<string, number>, category) => {
    const key = normalizeCategory(category)
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const summary = ORDERED_CATEGORIES.map((key) => ({
    key,
    label: formatCategoryLabel(key),
    count: counts[key] || 0,
  }))

  return (
    <div className={`flex flex-wrap items-center gap-2 ${align === 'right' ? 'justify-end' : 'justify-start'} ${className || ''}`}>
      {summary.map((item) => (
        <span
          key={item.key}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 type-caption ${
            item.count > 0 ? getCategoryChipTone(item.key) : 'border-(--color-card-border) bg-(--color-card-bg) text-(--color-text-secondary)'
          }`}
        >
          {item.key !== 'uncategorized' ? <span className="text-md">{item.label}: </span> : null}
          <span className="text-md">{item.count}</span>
        </span>
      ))}
    </div>
  )
}
