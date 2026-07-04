import { getSessionContext } from '@/lib/supabase/server-utils'
import Link from 'next/link'
import type { InspeccionCTpat } from '@/lib/types'
import {
  ClipboardList,
  AlertTriangle,
  Truck,
  UserCheck,
  ShieldCheck,
  Activity,
  TrendingUp,
  Wrench,
  CalendarClock,
} from 'lucide-react'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { MovimientosDoughnut, InspeccionesMensualBar } from '@/components/dashboard-charts'

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

// ─── Ring meter (medidor circular, sin JS) ─────────────────────────

function RingMeter({ label, pct, color }: { label: string; pct: number; color: string }) {
  const safePct = Number.isFinite(pct) ? Math.max(0, Math.min(100, Math.round(pct))) : 0
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: `conic-gradient(${color} 0 ${safePct}%, var(--ring-track) 0 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'var(--bg-card-solid)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          {safePct}%
        </div>
      </div>
      <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </p>
    </div>
  )
}

// ─── Streamed: Overview + Dona + Medidores + Barras + Próximos mantenimientos ──

async function StatsCardsGrid() {
  const { empresaId } = await getSessionContext()
  const supabase = await createClient()

  const [{ data: stats }, { data: proximos }] = await Promise.all([
    supabase.rpc('get_dashboard_stats_v2', { p_empresa_id: empresaId }),
    supabase
      .from('mantenimiento')
      .select('tracto_numero, tipo, estado, fecha_programada')
      .eq('empresa_id', empresaId)
      .eq('estado', 'Pendiente')
      .order('fecha_programada', { ascending: true })
      .limit(5),
  ])

  const s = stats as {
    total: number
    hoy: number
    entradas: number
    salidas: number
    danos: number
    flota_total: number
    flota_activa: number
    mant_total: number
    mant_completado: number
    mensual: { mes: string; total: number }[]
  } | null

  const flotaPct = s?.flota_total ? (s.flota_activa / s.flota_total) * 100 : 0
  const mantPct = s?.mant_total ? (s.mant_completado / s.mant_total) * 100 : 100
  const checklistPct = s?.total ? 100 - (s.danos / s.total) * 100 : 100

  return (
    <div className="space-y-5">
      {/* Fila 1: overview + dona + medidores */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_1fr] gap-4 items-stretch">
        <div
          className="rounded-xl p-4 text-white flex flex-col gap-2"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <p className="text-sm font-medium opacity-90">Resumen de flota</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{s?.flota_activa ?? 0}</span>
            <span className="text-xs opacity-80">unidades activas</span>
          </div>
          <div className="flex gap-2 opacity-90">
            <Truck className="w-4 h-4" />
          </div>
          <p className="text-[11px] opacity-80 mt-1">
            {s?.entradas ?? 0} entradas · {s?.salidas ?? 0} salidas · {s?.danos ?? 0} con daños
          </p>
        </div>

        <div className="rounded-xl p-4 card-app">
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Movimientos CTPAT
          </p>
          <div className="flex items-center gap-3">
            <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
              <MovimientosDoughnut
                entradas={s?.entradas ?? 0}
                salidas={s?.salidas ?? 0}
                danos={s?.danos ?? 0}
              />
            </div>
            <div className="flex flex-col gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#3B82F6' }} />
                Entradas · {s?.entradas ?? 0}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#8B5CF6' }} />
                Salidas · {s?.salidas ?? 0}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#FB7185' }} />
                Con daños · {s?.danos ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-4 card-app">
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Indicadores de operación
          </p>
          <div className="flex justify-around">
            <RingMeter label="Flota activa" pct={flotaPct} color="#3B82F6" />
            <RingMeter label="Mant. al día" pct={mantPct} color="#8B5CF6" />
            <RingMeter label="Sin daños" pct={checklistPct} color="#FB7185" />
          </div>
        </div>
      </div>

      {/* Fila 2: barras mensuales + próximos mantenimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-stretch">
        <div className="rounded-xl p-4 card-app">
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Inspecciones por mes
          </p>
          <div style={{ position: 'relative', width: '100%', height: 220 }}>
            <InspeccionesMensualBar data={s?.mensual ?? []} />
          </div>
        </div>

        <div className="rounded-xl overflow-hidden card-app">
          <div
            className="px-4 py-3 border-b flex items-center gap-2"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <Wrench className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Próximos mantenimientos
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {proximos && proximos.length > 0 ? (
              proximos.map((m, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {m.tracto_numero} · {m.tipo}
                    </p>
                    <p className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      <CalendarClock className="w-3 h-3" />
                      {m.fecha_programada
                        ? new Date(m.fecha_programada).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : 'Sin fecha'}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}
                  >
                    Pendiente
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <Wrench className="w-6 h-6 mx-auto mb-2 opacity-40" />
                Sin mantenimientos pendientes.
              </div>
            )}
          </div>
        </div>
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
          <Link href="/inspecciones" className="btn-accent text-xs whitespace-nowrap">
            Ver inspecciones
          </Link>
        </div>
      )}
    </div>
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
              className="row-hover flex items-center gap-3 px-5 py-3.5 transition-all"
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
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_1fr] gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 rounded-xl skeleton" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="h-56 rounded-xl skeleton" />
        <div className="h-56 rounded-xl skeleton" />
      </div>
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
            colorClass="action-purple"
          />
          <QuickActionCard
            href="/rondines"
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Iniciar rondín"
            desc="Recorrido de seguridad por zonas"
            colorClass="action-rose"
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
