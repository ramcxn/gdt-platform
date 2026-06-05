import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { InspeccionCTpat } from '@/lib/types'
import { ClipboardList, Clock, ArrowRightCircle, ArrowLeftCircle, AlertTriangle, Truck, UserCheck, ShieldCheck } from 'lucide-react'

async function getStats(empresaId: string) {
  const supabase = await createClient()
  const today = new Date(); today.setHours(0,0,0,0)

  const [{ count: total }, { count: hoy }, { count: entradas }, { count: salidas }, { count: danos }] = await Promise.all([
    supabase.from('inspecciones_ctpat').select('*', { count: 'exact', head: true }).eq('empresa_id', empresaId),
    supabase.from('inspecciones_ctpat').select('*', { count: 'exact', head: true }).eq('empresa_id', empresaId).gte('fecha', today.toISOString()),
    supabase.from('inspecciones_ctpat').select('*', { count: 'exact', head: true }).eq('empresa_id', empresaId).eq('tipo_movimiento', 'Entrada'),
    supabase.from('inspecciones_ctpat').select('*', { count: 'exact', head: true }).eq('empresa_id', empresaId).eq('tipo_movimiento', 'Salida'),
    supabase.from('inspecciones_ctpat').select('*', { count: 'exact', head: true }).eq('empresa_id', empresaId).eq('danos_fisicos', true),
  ])
  return { total: total ?? 0, hoy: hoy ?? 0, entradas: entradas ?? 0, salidas: salidas ?? 0, danos: danos ?? 0 }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: perfil } = await supabase.from('usuarios').select('nombre,empresa_id').eq('id', user.id).single()
  const empresaId = perfil?.empresa_id

  const stats = empresaId ? await getStats(empresaId) : { total: 0, hoy: 0, entradas: 0, salidas: 0, danos: 0 }

  // Últimas inspecciones
  const { data: recientes } = await supabase
    .from('inspecciones_ctpat')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('fecha', { ascending: false })
    .limit(5)

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{saludo}, {perfil?.nombre?.split(' ')[0]}</h1>
        <p className="text-slate-400 text-sm mt-0.5">Resumen operativo del sistema CTPAT</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total inspecciones" value={stats.total} icon={<ClipboardList className="w-6 h-6" />} color="blue" />
        <KpiCard label="Inspecciones hoy" value={stats.hoy} icon={<Clock className="w-6 h-6" />} color="green" />
        <KpiCard label="Entradas" value={stats.entradas} icon={<ArrowRightCircle className="w-6 h-6" />} color="indigo" />
        <KpiCard label="Salidas" value={stats.salidas} icon={<ArrowLeftCircle className="w-6 h-6" />} color="orange" />
      </div>

      {/* Alerta daños */}
      {stats.danos > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 glass-card">
          <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-amber-300 font-semibold text-sm">{stats.danos} unidad{stats.danos > 1 ? 'es' : ''} con daños físicos reportados</p>
            <p className="text-amber-200/70 text-xs mt-0.5">Revisar inspecciones con daños antes de asignar rutas.</p>
          </div>
          <Link href="/inspecciones" className="ml-auto text-xs text-amber-300 font-medium border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-colors">
            Ver →
          </Link>
        </div>
      )}

      {/* Acciones rápidas + Últimas inspecciones */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* Acciones */}
        <div className="glass-card border border-white/5 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Acciones rápidas</h2>
          <Link href="/inspecciones/nueva"
            className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-white/10 transition-all hover:border-blue-400 hover:bg-white/5 group">
            <Truck className="w-7 h-7 text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">Nueva inspección CTPAT</p>
              <p className="text-xs text-slate-400">Registrar entrada o salida de unidad</p>
            </div>
          </Link>
          <Link href="/acceso"
            className="flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-all">
            <UserCheck className="w-7 h-7 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Control de acceso</p>
              <p className="text-xs text-slate-400">Registrar empleado o proveedor</p>
            </div>
          </Link>
          <Link href="/rondines"
            className="flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-all">
            <ShieldCheck className="w-7 h-7 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Iniciar rondín</p>
              <p className="text-xs text-slate-400">Recorrido de seguridad por zonas</p>
            </div>
          </Link>
        </div>

        {/* Últimas inspecciones */}
        <div className="md:col-span-2 glass-card border border-white/5 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Últimas inspecciones</h2>
            <Link href="/inspecciones" className="text-xs text-blue-400 hover:underline">Ver todas →</Link>
          </div>
          <div className="divide-y divide-white/5">
            {recientes && recientes.length > 0 ? (recientes as InspeccionCTpat[]).map((insp) => (
              <Link key={insp.id} href={`/inspecciones/${insp.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${insp.tipo_movimiento === 'Entrada' ? 'bg-green-400' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {insp.tracto_numero} — {insp.operador_nombre?.split(' ').slice(0,2).join(' ')}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{insp.cliente || 'Sin cliente'} • {insp.origen} → {insp.destino}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${insp.tipo_movimiento === 'Entrada' ? 'bg-green-400/20 text-green-300' : 'bg-red-400/20 text-red-300'}`}>
                    {insp.tipo_movimiento}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(insp.fecha).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}
                  </p>
                </div>
              </Link>
            )) : (
              <div className="px-5 py-8 text-center text-slate-500 text-sm">
                No hay inspecciones registradas aún.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-500 to-green-600',
    indigo: 'from-indigo-500 to-indigo-600',
    orange: 'from-orange-500 to-orange-600',
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-4 text-white shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/90">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs opacity-80 mt-1">{label}</p>
    </div>
  )
}
