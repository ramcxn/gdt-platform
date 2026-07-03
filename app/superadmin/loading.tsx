export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-64 rounded-lg bg-white/10" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-white/5 bg-white/5" />
        ))}
      </div>
      <div className="h-96 rounded-xl border border-white/5 bg-white/5" />
    </div>
  )
}
