/* eslint-disable */
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function Badge({ text, color }: { text: string; color: string }) {
  const c: Record<string,string> = { green:'bg-green-500/10 text-green-400 border-green-500/20', amber:'bg-amber-500/10 text-amber-400 border-amber-500/20', blue:'bg-blue-500/10 text-blue-400 border-blue-500/20', red:'bg-red-500/10 text-red-400 border-red-500/20', slate:'bg-slate-500/10 text-slate-300 border-slate-500/20', purple:'bg-purple-500/10 text-purple-400 border-purple-500/20' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c[color]??c.slate}`}>{text}</span>
}
const estadoColor: Record<string,string> = { Borrador:'slate', Enviada:'blue', Aceptada:'green', Rechazada:'red', Vencida:'amber' }

export default async function CotizacionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user!.id).single()
  const eid = perfil?.empresa_id

  const { data: rows } = await supabase
    .from('cotizaciones')
    .select('*')
    .eq('empresa_id', eid)
    .order('created_at', { ascending: false })
    .limit(100)

  const total = rows?.length ?? 0
  const aceptadas = rows?.filter(r => r.estado === 'Aceptada').length ?? 0
  const pendientes = rows?.filter(r => ['Borrador','Enviada'].includes(r.estado)).length ?? 0
  const montoTotal = rows?.filter(r => r.estado === 'Aceptada').reduce((s, r) => s + (r.total ?? 0), 0) ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#1E3A5F,#2E6DA4)' }}>💰</div>
          <div>
            <h1 className="text-xl font-bold text-white">Cotizaciones</h1>
            <p className="text-slate-400 text-sm">Gestión de propuestas y tarifas a clientes</p>
          </div>
        </div>
        <Link href="/cotizaciones/nueva"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg,#1E3A5F,#2E6DA4)' }}>
          <span>+</span> Nueva Cotización
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '📋', label: 'Total', value: total },
          { icon: '✅', label: 'Aceptadas', value: aceptadas },
          { icon: '⏳', label: 'Pendientes', value: pendientes },
          { icon: '💵', label: 'Monto Aceptado', value: `$${montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 0 })}` },
        ].map((k, i) => (
          <div key={i} className="glass-card rounded-xl p-5 border border-white/5" style={{ background: 'rgba(15,31,53,0.7)' }}>
            <span className="text-2xl block mb-2">{k.icon}</span>
            <p className="text-3xl font-bold text-white">{k.value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Folio', 'Cliente', 'Ruta', 'Total', 'Estado', 'Vigencia', 'Fecha', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(rows ?? []).map((r: any) => {
                const vigenciaDate = new Date(r.created_at)
                vigenciaDate.setDate(vigenciaDate.getDate() + (r.vigencia_dias ?? 15))
                const vencida = vigenciaDate < new Date() && r.estado !== 'Aceptada'
                return (
                  <tr key={r.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-300 text-xs">{r.folio}</td>
                    <td className="px-4 py-3 text-white font-medium">{r.cliente_nombre}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {r.origen && r.destino ? `${r.origen} → ${r.destino}` : r.origen || r.destino || '—'}
                    </td>
                    <td className="px-4 py-3 text-white font-semibold">
                      {r.total ? `$${Number(r.total).toLocaleString('es-MX')}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge text={r.estado} color={vencida ? 'amber' : estadoColor[r.estado] ?? 'slate'} />
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {vigenciaDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                      {vencida && r.estado === 'Enviada' && <span className="text-amber-400 ml-1">⚠️</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(r.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/cotizaciones/${r.id}`} className="text-blue-400 hover:text-blue-300 text-xs font-medium">Ver →</Link>
                    </td>
                  </tr>
                )
              })}
              {!rows?.length && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-500">No hay cotizaciones. ¡Crea la primera!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
