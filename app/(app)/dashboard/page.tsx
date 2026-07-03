import { getSessionContext } from '@/lib/supabase/server-utils'
import Link from 'next/link'
import type { InspeccionCTpat } from '@/lib/types'
import {
  ClipboardList,
  Clock,
  ArrowRightCircle,
  ArrowLeftCircle,
  AlertTriangle,
  Truck,
  UserCheck,
  ShieldCheck,
  Activity,
  TrendingUp,
} from 'lucide-react'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'

// ─── Streamed: Greeting + Welcome Banner ──────────────────────────

async function WelcomeBanner() {
  const { perfil } = await getSessionContext()
  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const nombre = perfil?.nombre?.split(' ')[0] ?? 'Usuario'

  return (
    <div className="welcome-banner">
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              {saludo}, {nombre}
            </h1>
            <p className="text-white/70 text-sm mt-0.5">
              Resumen operativo del sistema CTPAT
            </p>
            <div className="flex items-center gap-2 mt-2 text-white/50 text-xs">
              <Activity className="w-3.5 h-3.5" />
              <span>Panel actualizado en tiempo real</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Hoy</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Streamed: Stats Cards ────────────────────────────────────────

async function StatsCardsGrid() {
  const { empresaId } = await getSessionContext()
  const supabase = await createClient()

  const { data: stats } = await supabase.rpc('get_dashboard_stats', { p_empresa_id: empresaId })
  const s = stats as { total: number; hoy: number; entradas: number; salidas: number; danos: number } | null

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Total inspecciones"
          value={s?.total ?? 0}
          icon={<ClipboardList className="w-5 h-5" />}
          kpiClass="kpi-blue"
          trend="+ históricas"
        />
        <KpiCard
          label="Inspecciones hoy"
          value={s?.hoy ?? 0}
          icon={<Clock className="w-5 h-5" />}
          kpiClass="kpi-green"
          trend="en el día"
        />
        <KpiCard
          label="Entradas"
          value={s?.entradas ?? 0}
          icon={<ArrowRightCircle className="w-5 h-5" />}
          kpiClass="kpi-indigo"
          trend="unidades ingresadas"
        />
        <KpiCard
          label="Salidas"
          value={s?.salidas ?? 0}
          icon={<ArrowLeftCircle className="w-5 h-5" />}
          kpiClass="kpi-teal"
          trend="unidades despachadas"
        />
      </div>

      {/* Alerta de daños */}
      {(s?.danos ?? 0) > 0 && (
        <div
          className="rounded-xl p-4 flex items-center gap-3 card-app"
          style={{ borderLeft: '4px solid #f59e0b' }}
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {s?.danos ?? 0} unidad{(s?.danos ?? 0) > 1 ? 'es' : ''} con daños físicos reportados
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              Revisar inspecciones con daños antes de asignar rutas.
            </p>
          </div>
          <Link
            href="/inspecciones"
            className="btn-accent text-xs whitespace-nowrap"
          >
            Ver inspecciones
          </Link>
        </div>
      )}
    </>
  )
}

// ─── Streamed: Recent Inspections ─────────────────────────────────

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
    <div className="md:col-span-2 rounded-xl overflow-hidden card-app">
      <div
        className="px-5 py-3.5 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Últimas inspecciones
          </h2>
        </div>
        <Link
          href="/inspecciones"
          className="text-xs font-medium flex items-center gap-1"
          style={{ color: 'var(--accent-primary)' }}
        >
          Ver todas
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
        {recientes && recientes.length > 0 ? (
          (recientes as InspeccionCTpat[]).map((insp) => (
            <Link
              key={insp.id}
              href={`/inspecciones/${insp.id}`}
              className="flex items-center gap-3 px-5 py-3.5 transition-all"
              style={{ background: 'transparent' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              {/* Status dot */}
              <span
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  insp.tipo_movimiento === 'Entrada' ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {insp.tracto_numero}
                  {insp.operador_nombre
                    ? ` — ${insp.operador_nombre.split(' ').slice(0, 2).join(' ')}`
                    : ''}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  {insp.cliente || 'Sin cliente'} · {insp.origen} → {insp.destino}
                </p>
              </div>
              {/* Badge + time */}
              <div className="text-right flex-shrink-0">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    insp.tipo_movimiento === 'Entrada'
                      ? 'bg-green-400/15 text-green-300'
                      : 'bg-red-400/15 text-red-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      insp.tipo_movimiento === 'Entrada' ? 'bg-green-400' : 'bg-red-400'
                    }`}
                  />
                  {insp.tipo_movimiento}
                </span>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  {new Date(insp.fecha).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="px-5 py-10 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No hay inspecciones registradas aún.
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Skeleton loaders ─────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 rounded-xl skeleton" />
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────

export default async function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <Suspense
        fallback={
          <div className="h-28 rounded-xl skeleton animate-pulse" />
        }
      >
        <WelcomeBanner />
      </Suspense>

      {/* Stats Cards */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsCardsGrid />
      </Suspense>

      {/* Bottom section: Quick Actions + Recent */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* Quick Actions — colorful cards */}
        <div className="rounded-xl p-5 space-y-3 card-app">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            <h2
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Acciones rápidas
            </h2>
          </div>

          <QuickActionCard
            href="/inspecciones/nueva"
            icon={<Truck className="w-5 h-5" />}
            title="Nueva inspección CTPAT"
            desc="Registrar entrada o salida de unidad"
            colorClass="action-blue"
          />
          <QuickActionCard
            href="/acceso"
            icon={<UserCheck className="w-5 h-5" />}
            title="Control de acceso"
            desc="Registrar empleado o proveedor"
            colorClass="action-teal"
          />
          <QuickActionCard
            href="/rondines"
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Iniciar rondín"
            desc="Recorrido de seguridad por zonas"
            colorClass="action-purple"
          />
        </div>

        {/* Recent Inspections */}
        <Suspense
          fallback={
            <div className="md:col-span-2 h-64 rounded-xl skeleton animate-pulse" />
          }
        >
          <RecentInspections />
        </Suspense>
      </div>
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
  kpiClass,
  trend,
}: {
  label: string
  value: number
  icon: React.ReactNode
  kpiClass: string
  trend?: string
}) {
  return (
    <div className={`${kpiClass} rounded-xl p-4 text-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/80">{icon}</span>
        <span className="inline-flex items-center gap-1 text-[10px] text-white/60 bg-white/10 rounded-full px-2 py-0.5">
          <span className="w-1 h-1 rounded-full bg-white/60" />
          {trend ?? ''}
        </span>
      </div>
      <p className="text-2xl md:text-3xl font-bold tracking-tight">{value.toLocaleString()}</p>
      <p className="text-xs text-white/70 mt-1 font-medium">{label}</p>
    </div>
  )
}

// ─── Quick Action Card ────────────────────────────────────────────

function QuickActionCard({
  href,
  icon,
  title,
  desc,
  colorClass,
}: {
  href: string
  icon: React.ReactNode
  title: string
  desc: string
  colorClass: string
}) {
  return (
    <Link
      href={href}
      className={`${colorClass} flex items-center gap-4 p-4 rounded-xl text-white transition-all hover:scale-[1.02] hover:shadow-md`}
    >
      <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-white/70 mt-0.5">{desc}</p>
      </div>
      <svg className="w-4 h-4 text-white/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
