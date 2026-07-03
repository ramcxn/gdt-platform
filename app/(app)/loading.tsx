export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-64 rounded-lg bg-white/10" />
        <div className="h-4 w-40 rounded bg-white/5" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-white/5 bg-white/5" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="h-80 rounded-xl border border-white/5 bg-white/5" />
    </div>
  )
}
