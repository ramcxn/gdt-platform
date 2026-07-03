import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft, BarChart3, DollarSign, Package, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/supabase/server-utils'

export default async function WarehouseReportsPage() {
  const supabase = await createClient()
  const { empresaId } = await getSessionContext()
  if (!empresaId) return null

  const [{ data: movimientos }, { data: inventario }, { data: refacciones }] = await Promise.all([
    supabase.from('movimientos_refacciones').select('*, refacciones(numero_parte, descripcion)').eq('empresa_id', empresaId).order('created_at', { ascending: false }).limit(80),
    supabase.from('inventario_refacciones').select('estado, costo_unitario').eq('empresa_id', empresaId),
    supabase.from('refacciones').select('id, numero_parte, descripcion, stock_minimo, punto_reorden').eq('empresa_id', empresaId).eq('activa', true),
  ])

  const totalValor = (inventario ?? []).reduce((sum: number, item: any) => sum + Number(item.costo_unitario ?? 0), 0)
  const entradas = movimientos?.filter((m: any) => m.tipo_movimiento === 'entrada').length ?? 0
  const salidas = movimientos?.filter((m: any) => m.tipo_movimiento === 'salida').length ?? 0
  const disponibles = inventario?.filter((i: any) => i.estado === 'disponible').length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/almacen" className="text-slate-500 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center btn-accent"><BarChart3 className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-bold text-white">Reportes de Almacen</h1><p className="text-slate-400 text-sm">Movimientos, valor de inventario y actividad reciente.</p></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={<Package className="w-5 h-5" />} label="Items disponibles" value={disponibles} />
        <Kpi icon={<TrendingUp className="w-5 h-5" />} label="Entradas" value={entradas} />
        <Kpi icon={<TrendingUp className="w-5 h-5 rotate-180" />} label="Salidas" value={salidas} />
        <Kpi icon={<DollarSign className="w-5 h-5" />} label="Valor inventario" value={`$${totalValor.toLocaleString('es-MX')}`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 glass-card rounded-xl border border-white/5 overflow-hidden" style={{ background: 'rgba(15,31,53,0.7)' }}>
          <div className="px-5 py-4 border-b border-white/5"><h2 className="text-white font-semibold">Movimientos recientes</h2></div>
          <div className="divide-y divide-white/5">
            {(movimientos ?? []).map((m: any) => (
              <div key={m.id} className="px-5 py-3 flex items-center justify-between gap-4 text-sm">
                <div>
                  <p className="text-white font-medium">{m.refacciones?.numero_parte} - {m.refacciones?.descripcion}</p>
                  <p className="text-slate-500 text-xs">{m.documento_referencia || m.observaciones || 'Sin referencia'}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-300 capitalize">{m.tipo_movimiento}</p>
                  <p className="text-slate-500 text-xs">{new Date(m.created_at).toLocaleDateString('es-MX')}</p>
                </div>
              </div>
            ))}
            {!movimientos?.length && <div className="px-5 py-10 text-center text-slate-500">No hay movimientos.</div>}
          </div>
        </div>

        <div className="glass-card rounded-xl border border-white/5 p-5" style={{ background: 'rgba(15,31,53,0.7)' }}>
          <h2 className="text-white font-semibold">Catalogo activo</h2>
          <p className="text-4xl font-bold text-white mt-4">{refacciones?.length ?? 0}</p>
          <p className="text-slate-500 text-sm mt-1">Refacciones disponibles para solicitud y recepcion.</p>
          <Link href="/almacen/catalogo" className="inline-block mt-5 text-blue-300 text-sm font-semibold">Ver catalogo</Link>
        </div>
      </div>
    </div>
  )
}

function Kpi({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="glass-card rounded-xl border border-white/5 p-5" style={{ background: 'rgba(15,31,53,0.7)' }}>
      <div className="text-slate-400 mb-3">{icon}</div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400 mt-0.5">{label}</p>
    </div>
  )
}
