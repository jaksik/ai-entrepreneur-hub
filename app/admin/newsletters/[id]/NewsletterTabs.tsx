'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { key: 'curate', label: 'Curate' },
  { key: 'design', label: 'Design' },
  { key: 'generate', label: 'Generate' },
] as const

export default function NewsletterTabs({ newsletterId }: { newsletterId: number }) {
  const pathname = usePathname()

  return (
    <div className="rounded-2xl border border-(--color-card-border) bg-(--color-bg-secondary) p-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {tabs.map((tab) => {
          const href = `/admin/newsletters/${newsletterId}/${tab.key}`
          const isActive = pathname === href

          return (
            <Link
              key={tab.key}
              href={href}
              className={`rounded-2xl px-5 py-6 text-center text-4xl font-semibold transition ${
                isActive
                  ? 'bg-(--color-card-bg) text-(--color-text-primary)'
                  : 'text-(--color-text-primary) hover:bg-(--color-card-bg)'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
