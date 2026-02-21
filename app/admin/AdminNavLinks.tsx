'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type NewsletterOption = {
  id: number
  title: string | null
  publish_date: string | null
}

function formatPublishDate(value: string | null) {
  if (!value) return 'No publish date'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'No publish date'

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const navItems = [
  { href: '/admin/tools', label: 'Tools' },
  { href: '/admin/articles', label: 'Articles' }
]

export default function AdminNavLinks({ newsletters }: { newsletters: NewsletterOption[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const newsletterDetailMatch = pathname.match(/^\/admin\/newsletters\/(\d+)(?:\/(curate|design|generate))?/) 
  const pathnameNewsletterId = newsletterDetailMatch?.[1] || ''
  const pathnameSection = newsletterDetailMatch?.[2] as 'curate' | 'design' | 'generate' | undefined

  const [selectedNewsletterId, setSelectedNewsletterId] = useState(pathnameSection ? pathnameNewsletterId : '')

  useEffect(() => {
    if (pathnameSection && pathnameNewsletterId) {
      setSelectedNewsletterId(pathnameNewsletterId)
      return
    }

    setSelectedNewsletterId('')
  }, [pathnameNewsletterId, pathnameSection])

  const newsletterSectionItems = useMemo(() => {
    if (!selectedNewsletterId) return []

    return [
      { href: `/admin/newsletters/${selectedNewsletterId}/curate`, label: 'Curate' },
      { href: `/admin/newsletters/${selectedNewsletterId}/design`, label: 'Design' },
      { href: `/admin/newsletters/${selectedNewsletterId}/generate`, label: 'Generate' },
    ]
  }, [selectedNewsletterId])

  const isActive = (href: string) => {
    const baseHref = href.split('?')[0]
    if (baseHref === '/admin') return pathname === '/admin'
    if (baseHref === '/admin/newsletters') return pathname === '/admin/newsletters'
    return pathname === baseHref || pathname.startsWith(`${baseHref}/`)
  }

  const handleNewsletterChange = (value: string) => {
    setSelectedNewsletterId(value)

    if (!value) return

    if (pathnameSection) {
      router.push(`/admin/newsletters/${value}/${pathnameSection}`)
      return
    }

    router.push(`/admin/newsletters/${value}/curate`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {navItems.map((item) => (
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

      {newsletters.length ? (
        <div className="ml-1 flex flex-wrap items-center gap-2 rounded-xl border border-(--color-card-border) bg-(--color-bg-secondary) p-2">
          <Link
            href="/admin/newsletters"
            className={`type-caption px-3 py-1.5 rounded-md border transition ${isActive('/admin/newsletters')
                ? 'text-(--color-text-primary) border-(--color-card-border) bg-(--color-card-bg)'
                : 'text-(--color-text-primary) border-transparent hover:bg-(--color-card-bg)'
              }`}
            aria-current={isActive('/admin/newsletters') ? 'page' : undefined}
          >
            Newsletters
          </Link>

          <Link
            href="/admin/newsletters/create"
            className={`type-caption px-3 py-1.5 rounded-md border transition ${isActive('/admin/newsletters/create')
                ? 'text-(--color-text-primary) border-(--color-card-border) bg-(--color-card-bg)'
                : 'text-(--color-text-primary) border-transparent hover:bg-(--color-card-bg)'
              }`}
            aria-current={isActive('/admin/newsletters/create') ? 'page' : undefined}
          >
            Create
          </Link>

          <select
            aria-label="Select Newsletter"
            value={selectedNewsletterId}
            onChange={(event) => handleNewsletterChange(event.target.value)}
            className="type-caption min-w-52 rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-1.5 text-(--color-text-primary) focus:outline-none"
          >
            <option value="">Select a newsletter</option>
            {newsletters.map((newsletter) => (
              <option key={newsletter.id} value={String(newsletter.id)}>
                {formatPublishDate(newsletter.publish_date)}
              </option>
            ))}
          </select>

          {newsletterSectionItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`type-caption px-3 py-1.5 rounded-md border transition ${isActive(item.href)
                  ? 'text-(--color-text-primary) border-(--color-card-border) bg-(--color-card-bg)'
                  : 'text-(--color-text-primary) border-transparent hover:bg-(--color-card-bg)'
                }`}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}
