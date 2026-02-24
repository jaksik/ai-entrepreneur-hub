import Link from 'next/link'

type ContentTabsProps = {
  newsletterId: number
  active: 'articles' | 'jobs'
}

function getTabClassName(isActive: boolean) {
  const baseClassName =
    'flex h-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition sm:h-11 sm:px-4 sm:text-sm'

  if (isActive) {
    return `${baseClassName} border-(--color-card-border) bg-(--color-card-bg) text-(--color-text-primary)`
  }

  return `${baseClassName} border-transparent text-(--color-text-secondary) hover:border-(--color-card-border) hover:bg-(--color-bg-secondary) hover:text-(--color-text-primary)`
}

export default function ContentTabs({ newsletterId, active }: ContentTabsProps) {
  return (
    <div className="mx-auto mb-4 w-full max-w-md rounded-xl border border-(--color-card-border) bg-(--color-bg-secondary) p-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <Link href={`/admin/newsletters/${newsletterId}/articles`} className={getTabClassName(active === 'articles')}>
          Articles
        </Link>
        <Link href={`/admin/newsletters/${newsletterId}/jobs`} className={getTabClassName(active === 'jobs')}>
          Jobs
        </Link>
      </div>
    </div>
  )
}