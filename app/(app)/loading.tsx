export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-64 rounded-lg" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-subtle)' }} />
        <div className="h-4 w-40 rounded" style={{ background: 'var(--bg-hover)' }} />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-subtle)' }} />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="h-80 rounded-xl" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-subtle)' }} />
    </div>
  )
}
