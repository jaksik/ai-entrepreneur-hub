'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin/tools', label: 'Tools' },
  { href: '/admin/articles', label: 'Articles' },
  { href: '/admin/newsletters', label: 'Newsletters' }
]

export default function AdminNavLinks() {
  const pathname = usePathname()
  const newsletterDetailMatch = pathname.match(/^\/admin\/newsletters\/(\d+)/)
  const newsletterId = newsletterDetailMatch?.[1]

  const newsletterSectionItems = newsletterId
    ? [
        { href: `/admin/newsletters/${newsletterId}/curate`, label: 'Curate' },
        { href: `/admin/newsletters/${newsletterId}/design`, label: 'Design' },
        { href: `/admin/newsletters/${newsletterId}/generate`, label: 'Generate' },
      ]
    : []

  const items = [...navItems, ...newsletterSectionItems]

  const isActive = (href: string) => {
    const baseHref = href.split('?')[0]
    if (baseHref === '/admin') return pathname === '/admin'
    return pathname === baseHref || pathname.startsWith(`${baseHref}/`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`type-caption px-3 py-1.5 rounded-md border transition ${isActive(item.href)
              ? 'text-(--color-text-primary) border-(--color-card-border) bg-(--color-bg-secondary)'
              : 'text-(--color-text-secondary) border-transparent hover:text-(--color-text-primary) hover:bg-(--color-bg-secondary)'
            }`}
          aria-current={isActive(item.href) ? 'page' : undefined}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}
