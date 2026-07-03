import Link from 'next/link'
import type { ReactNode } from 'react'
import { AlertTriangle, ArrowLeft, Package, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/supabase/server-utils'

export default async function WarehouseInventoryPage() {
  const supabase = await createClient()
  const { empresaId } = await getSessionContext()
  if (!empresaId) return null

  const [{ data: refacciones }, { data: inventario }] = await Promise.all([
    supabase.from('refacciones').select('*').eq('empresa_id', empresaId).eq('activa', true).order('numero_parte'),
    supabase.from('inventario_refacciones').select('*, refacciones(numero_parte, descripcion), ubicaciones_almacen(codigo)').eq('empresa_id', empresaId).order('created_at', { ascending: false }),
  ])

  const resumen = (refacciones ?? []).map((r: any) => {
    const stock = (inventario ?? []).filter((item: any) => item.refaccion_id === r.id)
    const disponible = stock.filter((s: any) => s.estado === 'disponible').length
    const reservado = stock.filter((s: any) => s.estado === 'reservado').length
    const total = stock.length
    return { ...r, disponible, reservado, total, bajo: total <= (r.stock_minimo ?? 0), reorden: total <= (r.punto_reorden ?? 0) }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/almacen" className="text-slate-500 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center btn-accent"><TrendingUp className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-bold text-white">Inventario de Refacciones</h1><p className="text-slate-400 text-sm">Resumen de stock y detalle fisico.</p></div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Resumen de stock</h2>
        {(resumen ?? []).map((item: any) => (
          <div key={item.id} className={`glass-card rounded-xl border p-5 ${item.bajo ? 'border-red-500/30' : 'border-white/5'}`} style={{ background: 'rgba(15,31,53,0.7)' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-white font-bold">{item.numero_parte}</p>
                <p className="text-slate-400 text-sm">{item.descripcion}</p>
              </div>
              {item.bajo ? <Badge color="red"><AlertTriangle className="w-3 h-3" /> Stock bajo</Badge> : item.reorden ? <Badge color="amber">Reordenar</Badge> : <Badge color="green">OK</Badge>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 text-sm">
              <Metric label="Disponible" value={item.disponible} strong />
              <Metric label="Reservado" value={item.reservado} />
              <Metric label="Total" value={item.total} />
              <Metric label="Minimo" value={item.stock_minimo ?? 0} />
              <Metric label="Maximo" value={item.stock_maximo ?? 0} />
            </div>
          </div>
        ))}
        {!resumen.length && <div className="text-slate-500 text-sm">No hay refacciones activas.</div>}
      </div>

      <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <div className="px-5 py-4 border-b border-white/5"><h2 className="text-white font-semibold">Inventario detallado</h2></div>
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {(inventario ?? []).map((item: any) => (
            <div key={item.id} className="rounded-xl border border-white/5 p-4 bg-white/[0.02]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-300" />
                  <p className="text-white font-semibold">{item.refacciones?.numero_parte}</p>
                </div>
                <Badge color={item.estado === 'disponible' ? 'green' : item.estado === 'reservado' ? 'amber' : 'red'}>{String(item.estado).toUpperCase()}</Badge>
              </div>
              <p className="text-slate-400 text-sm mt-2">{item.refacciones?.descripcion}</p>
              <div className="mt-4 space-y-1 text-xs text-slate-400">
                <p>Ubicacion: <span className="text-slate-200">{item.ubicaciones_almacen?.codigo ?? '—'}</span></p>
                <p>Serie/Lote: <span className="text-slate-200">{item.numero_serie || item.lote || '—'}</span></p>
                <p>Recepcion: <span className="text-slate-200">{item.fecha_recepcion ?? '—'}</span></p>
              </div>
            </div>
          ))}
          {!inventario?.length && <div className="text-slate-500 text-sm">No hay inventario recibido.</div>}
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return <div><p className="text-slate-500 text-xs">{label}</p><p className={`${strong ? 'text-blue-300' : 'text-white'} text-2xl font-bold`}>{value}</p></div>
}

function Badge({ color, children }: { color: 'green' | 'amber' | 'red'; children: ReactNode }) {
  const cls = { green: 'bg-green-500/10 text-green-300 border-green-500/20', amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20', red: 'bg-red-500/10 text-red-300 border-red-500/20' }[color]
  return <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cls}`}>{children}</span>
}
