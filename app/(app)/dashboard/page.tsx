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
  ArrowRight,
} from 'lucide-react'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { MovimientosDoughnut, InspeccionesMensualBar } from '@/components/dashboard-charts'

// ─── Welcome Banner ───────────────────────────────────────

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

// ─── Ring meter ───────────────────────────────────────────

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
            background: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-heading)',
          }}
        >
          {safePct}%
        </div>
      </div>
      <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  )
}

// ─── Quick Action ─────────────────────────────────────────

function QuickActionCard({
  href,
  icon,
  title,
  desc,
  gradient,
}: {
  href: string
  icon: React.ReactNode
  title: string
  desc: string
  gradient: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-white transition-all hover:scale-[1.01]"
      style={{ background: gradient }}
    >
      <div className="w-9 h-9 rounded-md bg-white/15 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-white/60 mt-0.5">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-white/40 flex-shrink-0" />
    </Link>
  )
}

// ─── Stats + Charts ───────────────────────────────────────

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
      {/* Row 1: KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { value: s?.total ?? 0, label: 'Inspecciones totales', change: `+${s?.hoy ?? 0} hoy`, up: true },
          { value: s?.entradas ?? 0, label: 'Entradas registradas', change: `${((s?.entradas ?? 0) / (s?.total ?? 1) * 100).toFixed(0)}% del total`, up: true },
          { value: s?.flota_activa ?? 0, label: 'Unidades activas', change: s?.flota_total ? `${Math.round(flotaPct)}% de la flota` : '—', up: flotaPct >= 50 },
          { value: s?.mant_total ?? 0, label: 'Servicios de mantenimiento', change: `${s?.mant_completado ?? 0} completados`, up: mantPct >= 50 },
        ].map((kpi, i) => (
          <div key={i} className="kpi-card">
            <div className="flex items-center justify-between mb-1">
              <span className="kpi-value">{kpi.value}</span>
            </div>
            <p className="kpi-label">{kpi.label}</p>
            <p className={`kpi-change ${kpi.up ? 'up' : 'down'}`}>
              {kpi.up ? '↑' : '↓'} {kpi.change}
            </p>
          </div>
        ))}
      </div>

      {/* Row 2: Doughnut + Ring meters + Chart + Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Fleet summary */}
        <div
          className="rounded-xl p-5 text-white flex flex-col gap-2"
          style={{ background: 'linear-gradient(135deg, #1a2d4a, #2563eb)' }}
        >
          <p className="text-xs font-medium uppercase tracking-wide opacity-80">Resumen de flota</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold">{s?.flota_activa ?? 0}</span>
            <span className="text-sm opacity-80">/ {s?.flota_total ?? 0} unidades</span>
          </div>
          <div className="flex gap-1 mt-1">
            <Truck className="w-4 h-4 opacity-80" />
          </div>
          <p className="text-xs opacity-70 mt-auto">
            {s?.entradas ?? 0} entradas · {s?.salidas ?? 0} salidas · {s?.danos ?? 0} con daños
          </p>
        </div>

        {/* Movimientos doughnut */}
        <div className="card-app p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-heading)' }}>
            Movimientos CTPAT
          </p>
          <div className="flex items-center gap-4">
            <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
              <MovimientosDoughnut
                entradas={s?.entradas ?? 0}
                salidas={s?.salidas ?? 0}
                danos={s?.danos ?? 0}
              />
            </div>
            <div className="flex flex-col gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              {[
                { color: '#3B82F6', label: 'Entradas', value: s?.entradas ?? 0 },
                { color: '#6366F1', label: 'Salidas', value: s?.salidas ?? 0 },
                { color: '#FB7185', label: 'Con daños', value: s?.danos ?? 0 },
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  {item.label} · {item.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Ring meters */}
        <div className="card-app p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-heading)' }}>
            Indicadores de operación
          </p>
          <div className="flex justify-around">
            <RingMeter label="Flota activa" pct={flotaPct} color="#3B82F6" />
            <RingMeter label="Mantenimiento" pct={mantPct} color="#6366F1" />
            <RingMeter label="Sin daños" pct={checklistPct} color="#FB7185" />
          </div>
        </div>
      </div>

      {/* Row 3: Bar chart + Maintenance table */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
        <div className="card-app p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-heading)' }}>
            Inspecciones mensuales
          </p>
          <div style={{ position: 'relative', width: '100%', height: 220 }}>
            <InspeccionesMensualBar data={s?.mensual ?? []} />
          </div>
        </div>

        <div className="card-app overflow-hidden">
          <div className="card-app-header">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <h3>Mantenimientos programados</h3>
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {proximos && proximos.length > 0 ? (
              proximos.map((m, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-heading)' }}>
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
                  <span className="status-badge status-badge-amber">
                    <span className="dot" />
                    Pendiente
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                <Wrench className="w-6 h-6 mx-auto mb-2 opacity-30" />
                Sin mantenimientos pendientes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Damage alert */}
      {(s?.danos ?? 0) > 0 && (
        <div className="alert-card">
          <div className="icon-box" style={{ background: 'var(--amber-bg)' }}>
            <AlertTriangle className="w-4 h-4" style={{ color: 'var(--amber)' }} />
          </div>
          <div className="alert-card-text flex-1">
            <h4>{s?.danos ?? 0} unidad{(s?.danos ?? 0) > 1 ? 'es' : ''} con daños físicos reportados</h4>
            <p>Revisar inspecciones con daños antes de asignar nuevas rutas</p>
          </div>
          <Link href="/inspecciones" className="btn-accent btn-accent-sm whitespace-nowrap">
            Revisar inspecciones
          </Link>
        </div>
      )}
    </div>
  )
}

// ─── Recent Inspections ────────────────────────────────────

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
    <div className="md:col-span-2 card-app overflow-hidden">
      <div className="card-app-header">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <h3>Últimas inspecciones</h3>
        </div>
        <Link
          href="/inspecciones"
          className="text-xs font-medium flex items-center gap-1"
          style={{ color: 'var(--accent)' }}
        >
          Ver todas
          <ArrowRight className="w-3 h-3" />
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
              <span
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  insp.tipo_movimiento === 'Entrada' ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-heading)' }}>
                  {insp.tracto_numero}
                  {insp.operador_nombre
                    ? ` — ${insp.operador_nombre.split(' ').slice(0, 2).join(' ')}`
                    : ''}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {insp.cliente || 'Sin cliente'} · {insp.origen} → {insp.destino}
                </p>
              </div>
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
          <div className="px-5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No hay inspecciones registradas aún
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Skeletons ─────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl skeleton" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-xl skeleton" />)}
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────

export default async function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Resumen operativo del sistema CTPAT
        </p>
      </div>

      {/* Welcome Banner */}
      <Suspense fallback={<div className="h-28 rounded-xl skeleton animate-pulse" />}>
        <WelcomeBanner />
      </Suspense>

      {/* Stats + Charts */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsCardsGrid />
      </Suspense>

      {/* Bottom: Quick Actions + Recent Inspections */}
      <div className="grid md:grid-cols-3 gap-3">
        {/* Quick Actions */}
        <div className="card-app p-4 space-y-2.5">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Acciones rápidas
            </h3>
          </div>

          <QuickActionCard
            href="/inspecciones/nueva"
            icon={<Truck className="w-4 h-4" />}
            title="Nueva inspección"
            desc="Registrar entrada o salida de unidad"
            gradient="linear-gradient(135deg, #2563eb, #3b82f6)"
          />
          <QuickActionCard
            href="/acceso"
            icon={<UserCheck className="w-4 h-4" />}
            title="Control de acceso"
            desc="Registrar empleado o proveedor"
            gradient="linear-gradient(135deg, #4f46e5, #6366f1)"
          />
          <QuickActionCard
            href="/rondines"
            icon={<ShieldCheck className="w-4 h-4" />}
            title="Iniciar rondín"
            desc="Recorrido de seguridad por zonas"
            gradient="linear-gradient(135deg, #0891b2, #06b6d4)"
          />
        </div>

        {/* Recent Inspections */}
        <Suspense fallback={<div className="md:col-span-2 h-64 rounded-xl skeleton animate-pulse" />}>
          <RecentInspections />
        </Suspense>
      </div>
    </div>
  )
}
