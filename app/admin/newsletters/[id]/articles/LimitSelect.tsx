'use client'

type LimitSelectProps = {
  id: string
  name: string
  defaultValue: string
  options: readonly number[]
  className?: string
}

export default function LimitSelect({ id, name, defaultValue, options, className }: LimitSelectProps) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
      className={className}
    >
      {options.map((option) => (
        <option key={option} value={String(option)}>{option}</option>
      ))}
    </select>
  )
}
