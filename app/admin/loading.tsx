export default function AdminLoading() {
  return (
    <div aria-live="polite" aria-label="Loading admin content">
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-(--color-bg-secondary)">
        <div className="h-full w-1/3 rounded-r bg-accent-primary animate-pulse" />
      </div>
    </div>
  )
}
