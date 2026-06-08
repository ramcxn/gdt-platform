/* eslint-disable */
import Link from 'next/link'

interface KPI { label: string; value: string | number; sub?: string; icon: string; color?: string }
interface Col  { key: string; label: string; render?: (row: any) => React.ReactNode }

interface Props {
  title: string
  subtitle: string
  icon: string
  newHref?: string
  newLabel?: string
  kpis: KPI[]
  cols: Col[]
  rows: any[]
  emptyText?: string
  emptyIcon?: string
  extra?: React.ReactNode
}

export default function ModulePage({ title, subtitle, icon, newHref, newLabel = 'Nuevo', kpis, cols, rows, emptyText, emptyIcon = '📋', extra }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>
            {icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            <p className="text-slate-400 text-sm">{subtitle}</p>
          </div>
        </div>
        {newHref && (
          <Link href={newHref}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-transform hover:scale-105 shadow"
            style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {newLabel}
          </Link>
        )}
      </div>

      {/* KPIs */}
      <div className={`grid gap-4 grid-cols-2 ${kpis.length >= 4 ? 'lg:grid-cols-4' : kpis.length === 3 ? 'lg:grid-cols-3' : ''}`}>
        {kpis.map((k, i) => (
          <div key={i} className="glass-card rounded-xl p-5 border border-white/5" style={{background:'rgba(15,31,53,0.7)'}}>
            <span className="text-2xl block mb-2">{k.icon}</span>
            <p className="text-3xl font-bold text-white">{k.value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{k.label}</p>
            {k.sub && <p className="text-xs text-slate-500 mt-1">{k.sub}</p>}
          </div>
        ))}
      </div>

      {extra}

      {/* Table */}
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{background:'rgba(15,31,53,0.7)'}}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {cols.map(c => (
                  <th key={c.key} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.length > 0 ? rows.map((row, i) => (
                <tr key={row.id ?? i} className="hover:bg-white/3 transition-colors">
                  {cols.map(c => (
                    <td key={c.key} className="px-4 py-3 text-slate-300">
                      {c.render ? c.render(row) : (row[c.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              )) : (
                <tr>
                  <td colSpan={cols.length} className="px-4 py-16 text-center">
                    <div className="text-4xl mb-3">{emptyIcon}</div>
                    <p className="text-slate-400">{emptyText ?? `No hay registros en ${title}`}</p>
                    {newHref && (
                      <Link href={newHref} className="text-blue-400 text-sm mt-2 inline-block hover:underline">
                        Agregar primer registro →
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
