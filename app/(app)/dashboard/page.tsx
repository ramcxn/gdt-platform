import { getSessionContext } from '@/lib/supabase/server-utils'
import Link from 'next/link'
import type { InspeccionCTpat } from '@/lib/types'
import { ClipboardList, Clock, ArrowRightCircle, ArrowLeftCircle, AlertTriangle, Truck, UserCheck, ShieldCheck } from 'lucide-react'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'

// ---- Streamed sub-components ----

async function Greeting() {
  const { perfil } = await getSessionContext()
  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div>
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{saludo}, {perfil?.nombre?.split(' ')[0]}</h1>
      <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Resumen operativo del sistema CTPAT</p>
    </div>
  )
}

async function StatsCards() {
  const { empresaId } = await getSessionContext()
  const supabase = await createClient()

  const { data: stats } = await supabase.rpc('get_dashboard_stats', { p_empresa_id: empresaId })
  const s = stats as { total: number; hoy: number; entradas: number; salidas: number; danos: number } | null

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total inspecciones" value={s?.total ?? 0} icon={<ClipboardList className="w-6 h-6" />} kpiClass="kpi-blue" />
        <KpiCard label="Inspecciones hoy" value={s?.hoy ?? 0} icon={<Clock className="w-6 h-6" />} kpiClass="kpi-green" />
        <KpiCard label="Entradas" value={s?.entradas ?? 0} icon={<ArrowRightCircle className="w-6 h-6" />} kpiClass="kpi-indigo" />
        <KpiCard label="Salidas" value={s?.salidas ?? 0} icon={<ArrowLeftCircle className="w-6 h-6" />} kpiClass="kpi-orange" />
      </div>

      {(s?.danos ?? 0) > 0 && (
        <div className="border rounded-xl p-4 flex items-center gap-3 glass-card"
          style={{ borderColor: 'rgba(251,191,36,0.2)' }}>
          <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-amber-300 font-semibold text-sm">{s?.danos ?? 0} unidad{(s?.danos ?? 0) > 1 ? 'es' : ''} con daños físicos reportados</p>
            <p className="text-amber-200/70 text-xs mt-0.5">Revisar inspecciones con daños antes de asignar rutas.</p>
          </div>
          <Link href="/inspecciones" className="ml-auto text-xs text-amber-300 font-medium border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-colors">
            Ver →
          </Link>
        </div>
      )}
    </>
  )
}

async function RecentInspections() {
  const { empresaId } = await getSessionContext()
  const supabase = await createClient()

  const { data: recientes } = await supabase
    .from('inspecciones_ctpat')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('fecha', { ascending: false })
    .limit(5)

  return (
    <div className="md:col-span-2 rounded-xl overflow-hidden glass-card" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Últimas inspecciones</h2>
        <Link href="/inspecciones" className="text-xs" style={{ color: 'var(--accent-primary)' }}>Ver todas →</Link>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border-subtle)', '--divide-color': 'var(--border-subtle)' } as React.CSSProperties}>
        {recientes && recientes.length > 0 ? (recientes as InspeccionCTpat[]).map((insp) => (
          <Link key={insp.id} href={`/inspecciones/${insp.id}`}
            className="flex items-center gap-3 px-5 py-3 transition-colors"
            style={{ background: 'transparent' }}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${insp.tipo_movimiento === 'Entrada' ? 'bg-green-400' : 'bg-red-400'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {insp.tracto_numero} — {insp.operador_nombre?.split(' ').slice(0, 2).join(' ')}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{insp.cliente || 'Sin cliente'} • {insp.origen} → {insp.destino}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${insp.tipo_movimiento === 'Entrada' ? 'bg-green-400/20 text-green-300' : 'bg-red-400/20 text-red-300'}`}>
                {insp.tipo_movimiento}
              </span>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {new Date(insp.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </Link>
        )) : (
          <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
            No hay inspecciones registradas aún.
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Skeleton loaders ----

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 rounded-xl" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-subtle)' }} />
      ))}
    </div>
  )
}

// ---- Main page ----

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="space-y-2 animate-pulse"><div className="h-7 w-64 rounded-lg" style={{ background: 'var(--bg-hover)' }} /><div className="h-4 w-40 rounded" style={{ background: 'var(--bg-hover)' }} /></div>}>
        <Greeting />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards />
      </Suspense>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Acciones rápidas */}
        <div className="rounded-xl p-5 space-y-3 glass-card" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Acciones rápidas</h2>
          <Link href="/inspecciones/nueva"
            className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed transition-all group"
            style={{ borderColor: 'var(--border-default)' }}>
            <Truck className="w-7 h-7 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Nueva inspección CTPAT</p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Registrar entrada o salida de unidad</p>
            </div>
          </Link>
          <Link href="/acceso"
            className="flex items-center gap-3 p-3 rounded-lg transition-all"
            style={{ background: 'var(--bg-hover)' }}>
            <UserCheck className="w-7 h-7 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Control de acceso</p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Registrar empleado o proveedor</p>
            </div>
          </Link>
          <Link href="/rondines"
            className="flex items-center gap-3 p-3 rounded-lg transition-all"
            style={{ background: 'var(--bg-hover)' }}>
            <ShieldCheck className="w-7 h-7 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Iniciar rondín</p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Recorrido de seguridad por zonas</p>
            </div>
          </Link>
        </div>

        <Suspense fallback={<div className="md:col-span-2 h-64 rounded-xl animate-pulse" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-subtle)' }} />}>
          <RecentInspections />
        </Suspense>
      </div>
    </div>
  )
}

// ---- KPI Card ----

function KpiCard({ label, value, icon, kpiClass }: { label: string; value: number; icon: React.ReactNode; kpiClass: string }) {
  return (
    <div className={`${kpiClass} rounded-xl p-4 text-white shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/90">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs opacity-80 mt-1">{label}</p>
    </div>
  )
}
