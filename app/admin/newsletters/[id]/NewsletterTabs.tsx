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
    <div className="w-full flex justify-center">
      <div className="inline-flex rounded-lg border border-(--color-card-border) bg-(--color-bg-secondary) p-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map((tab) => {
            const href = `/admin/newsletters/${newsletterId}/${tab.key}`
            const isActive = pathname === href

            return (
              <Link
                key={tab.key}
                href={href}
                className={`rounded-md px-3 py-1.5 type-caption font-medium transition ${
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
    </div>
  )
}
