'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type LimitSelectProps = {
  id: string
  name: string
  defaultValue: string
  options: readonly number[]
  className?: string
}

export default function LimitSelect({ id, name, defaultValue, options, className }: LimitSelectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (nextValue: string) => {
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.set(name, nextValue)

    const query = nextParams.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <select
      id={id}
      name={name}
      value={defaultValue}
      onChange={(event) => handleChange(event.currentTarget.value)}
      className={className}
    >
      {options.map((option) => (
        <option key={option} value={String(option)}>{option}</option>
      ))}
    </select>
  )
}
