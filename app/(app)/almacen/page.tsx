import Link from 'next/link'
import type { ReactNode } from 'react'
import { AlertTriangle, BarChart3, ClipboardList, MapPin, Package, Truck, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/supabase/server-utils'

const modules = [
  { title: 'Catalogo de Refacciones', description: 'Refacciones, precios, proveedores y puntos de reorden', href: '/almacen/catalogo', icon: Package, color: 'text-blue-300', bg: 'bg-blue-500/10' },
  { title: 'Ubicaciones', description: 'Estanterias, bins y zonas fisicas de almacen', href: '/almacen/ubicaciones', icon: MapPin, color: 'text-green-300', bg: 'bg-green-500/10' },
  { title: 'Recepcion', description: 'Entradas de refacciones con lote, serie y documento', href: '/almacen/recepcion', icon: Truck, color: 'text-purple-300', bg: 'bg-purple-500/10' },
  { title: 'Solicitudes', description: 'Peticiones de refacciones por unidad o mantenimiento', href: '/almacen/solicitudes', icon: ClipboardList, color: 'text-amber-300', bg: 'bg-amber-500/10' },
  { title: 'Inventario', description: 'Stock disponible, reservado, asignado y alertas', href: '/almacen/inventario', icon: TrendingUp, color: 'text-cyan-300', bg: 'bg-cyan-500/10' },
  { title: 'Reportes', description: 'Movimientos, costos y necesidades de compra', href: '/almacen/reportes', icon: BarChart3, color: 'text-pink-300', bg: 'bg-pink-500/10' },
]

export default async function WarehousePage() {
  const supabase = await createClient()
  const { empresaId } = await getSessionContext()
  if (!empresaId) return null

  const [{ data: refacciones }, { data: inventario }, { data: solicitudes }, { data: ubicaciones }] = await Promise.all([
    supabase.from('refacciones').select('id, activa').eq('empresa_id', empresaId),
    supabase.from('inventario_refacciones').select('id, estado').eq('empresa_id', empresaId),
    supabase.from('solicitudes_refacciones').select('id, estado, prioridad').eq('empresa_id', empresaId),
    supabase.from('ubicaciones_almacen').select('id, activa').eq('empresa_id', empresaId),
  ])

  const stats = {
    totalRefacciones: refacciones?.filter(r => r.activa !== false).length ?? 0,
    stockDisponible: inventario?.filter(i => i.estado === 'disponible').length ?? 0,
    stockReservado: inventario?.filter(i => i.estado === 'reservado').length ?? 0,
    solicitudesPendientes: solicitudes?.filter(s => s.estado === 'pendiente').length ?? 0,
    solicitudesUrgentes: solicitudes?.filter(s => s.prioridad === 'urgente' && s.estado !== 'completada').length ?? 0,
    ubicacionesActivas: ubicaciones?.filter(u => u.activa !== false).length ?? 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Almacen de Refacciones</h1>
        <p className="text-slate-400 text-sm mt-1">Control operativo de catalogo, recepcion, solicitudes e inventario.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={<Package className="w-5 h-5" />} label="Refacciones" value={stats.totalRefacciones} sub="Activas en catalogo" />
        <Kpi icon={<TrendingUp className="w-5 h-5" />} label="Stock disponible" value={stats.stockDisponible} sub={`${stats.stockReservado} reservadas`} />
        <Kpi icon={<ClipboardList className="w-5 h-5" />} label="Pendientes" value={stats.solicitudesPendientes} sub="Solicitudes abiertas" />
        <Kpi icon={<MapPin className="w-5 h-5" />} label="Ubicaciones" value={stats.ubicacionesActivas} sub="Activas" />
      </div>

      {stats.solicitudesUrgentes > 0 && (
        <div className="glass-card rounded-xl border border-red-500/30 p-4 flex items-center gap-3" style={{ background: 'rgba(127,29,29,0.18)' }}>
          <AlertTriangle className="w-8 h-8 text-red-300 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-200 font-semibold">{stats.solicitudesUrgentes} solicitud(es) urgente(s)</p>
            <p className="text-red-200/70 text-sm">Requieren atencion inmediata del almacen.</p>
          </div>
          <Link href="/almacen/solicitudes" className="px-3 py-2 rounded-lg text-sm font-semibold text-white bg-red-500/20 border border-red-400/30">
            Revisar
          </Link>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {modules.map(module => {
          const Icon = module.icon
          return (
            <Link key={module.href} href={module.href}
              className="glass-card rounded-xl border border-white/5 p-5 transition-transform hover:-translate-y-0.5"
              style={{ background: 'rgba(15,31,53,0.7)' }}>
              <div className={`w-11 h-11 rounded-lg ${module.bg} ${module.color} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="text-white font-bold">{module.title}</h2>
              <p className="text-slate-400 text-sm mt-1 min-h-10">{module.description}</p>
              <div className="mt-4 text-sm text-blue-300 font-semibold">Acceder</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function Kpi({ icon, label, value, sub }: { icon: ReactNode; label: string; value: number; sub: string }) {
  return (
    <div className="glass-card rounded-xl border border-white/5 p-5" style={{ background: 'rgba(15,31,53,0.7)' }}>
      <div className="text-slate-400 mb-3">{icon}</div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400 mt-0.5">{label}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  )
}
