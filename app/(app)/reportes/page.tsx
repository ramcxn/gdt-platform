/* eslint-disable */
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function StatCard({ icon, label, value, sub, color = '#1E3A5F' }: any) {
  return (
    <div className="glass-card rounded-xl p-5 border border-white/5" style={{ background: 'rgba(15,31,53,0.7)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background: color + '40' }}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm font-medium text-white mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default async function ReportesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession(); const user = session?.user ?? null
  const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user!.id).single()
  const eid = perfil?.empresa_id

  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString()
  const inicioSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay())).toISOString()

  const [
    { count: viajesTotal },
    { count: viajesMes },
    { count: inspTotal },
    { count: inspMes },
    { count: rondinesTotal },
    { count: rondinesMes },
    { count: mantenTotal },
    { count: mantenPendiente },
    { count: alertas },
    { count: accionesAbiertas },
    { count: empleados },
    { count: flota },
    { data: viajesRecientes },
    { data: inspRecientes },
  ] = await Promise.all([
    supabase.from('viajes').select('*', { count: 'exact', head: true }).eq('empresa_id', eid),
    supabase.from('viajes').select('*', { count: 'exact', head: true }).eq('empresa_id', eid).gte('created_at', inicioMes),
    supabase.from('inspecciones_ctpat').select('*', { count: 'exact', head: true }).eq('empresa_id', eid),
    supabase.from('inspecciones_ctpat').select('*', { count: 'exact', head: true }).eq('empresa_id', eid).gte('fecha', inicioMes),
    supabase.from('rondines').select('*', { count: 'exact', head: true }).eq('empresa_id', eid),
    supabase.from('rondines').select('*', { count: 'exact', head: true }).eq('empresa_id', eid).gte('inicio', inicioMes),
    supabase.from('mantenimiento').select('*', { count: 'exact', head: true }).eq('empresa_id', eid),
    supabase.from('mantenimiento').select('*', { count: 'exact', head: true }).eq('empresa_id', eid).eq('estado', 'Pendiente'),
    supabase.from('analisis_riesgos').select('*', { count: 'exact', head: true }).eq('empresa_id', eid).in('nivel_riesgo', ['Alto','Critico']),
    supabase.from('acciones_correctivas').select('*', { count: 'exact', head: true }).eq('empresa_id', eid).in('estado', ['Abierta','En_Proceso']),
    supabase.from('empleados').select('*', { count: 'exact', head: true }).eq('empresa_id', eid).eq('activo', true),
    supabase.from('tractos').select('*', { count: 'exact', head: true }).eq('empresa_id', eid).eq('activo', true),
    supabase.from('viajes').select('tracto_numero, operador_nombre, origen, destino, estado, created_at').eq('empresa_id', eid).order('created_at', { ascending: false }).limit(5),
    supabase.from('inspecciones_ctpat').select('tracto_numero, tipo_movimiento, fecha, resultado_final').eq('empresa_id', eid).order('fecha', { ascending: false }).limit(5),
  ])

  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const mesActual = meses[new Date().getMonth()]

  const reportLinks = [
    { href: '/viajes', icon: '🚛', label: 'Viajes', desc: 'Historial de operaciones y rutas' },
    { href: '/inspecciones', icon: '🔍', label: 'Inspecciones CTPAT', desc: 'Entradas y salidas inspeccionadas' },
    { href: '/rondines', icon: '🛡️', label: 'Rondines', desc: 'Patrullajes y zonas de seguridad' },
    { href: '/mantenimiento', icon: '🔧', label: 'Mantenimiento', desc: 'Servicios y calendarios de unidades' },
    { href: '/alcoholimetro', icon: '🧪', label: 'Alcoholímetro', desc: 'Registros de pruebas a operadores' },
    { href: '/antidoping', icon: '💊', label: 'Antidoping', desc: 'Controles de drogas y resultados' },
    { href: '/analisis-riesgos', icon: '⚠️', label: 'Análisis de Riesgos', desc: 'Evaluaciones y niveles de riesgo' },
    { href: '/acciones-correctivas', icon: '✅', label: 'Acciones Correctivas', desc: 'Planes y seguimiento' },
    { href: '/cotizaciones', icon: '💰', label: 'Cotizaciones', desc: 'Propuestas aceptadas y pipeline' },
    { href: '/asistencia', icon: '📅', label: 'Asistencia', desc: 'Control de personal activo' },
    { href: '/revision-documental', icon: '📋', label: 'Revisión Documental', desc: 'Cumplimiento de documentos' },
    { href: '/ciberseguridad', icon: '🔐', label: 'Ciberseguridad', desc: 'Incidentes y vulnerabilidades' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#1E3A5F,#2E6DA4)' }}>📊</div>
        <div>
          <h1 className="text-xl font-bold text-white">Reportes y Métricas</h1>
          <p className="text-slate-400 text-sm">Resumen ejecutivo de operaciones — {mesActual} {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* KPIs principales */}
      <div>
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">Operaciones</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="🚛" label="Viajes este mes" value={viajesMes ?? 0} sub={`${viajesTotal ?? 0} histórico`} color="#1E3A5F" />
          <StatCard icon="🔍" label="Inspecciones este mes" value={inspMes ?? 0} sub={`${inspTotal ?? 0} histórico`} color="#1E3A5F" />
          <StatCard icon="🛡️" label="Rondines este mes" value={rondinesMes ?? 0} sub={`${rondinesTotal ?? 0} histórico`} color="#1a3a2f" />
          <StatCard icon="🔧" label="Mant. pendiente" value={mantenPendiente ?? 0} sub={`${mantenTotal ?? 0} total`} color={mantenPendiente && mantenPendiente > 0 ? '#4a1a1a' : '#1a3a2f'} />
        </div>
      </div>

      {/* Alertas y recursos */}
      <div>
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">Alertas y Recursos</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="⚠️" label="Riesgos Altos/Críticos" value={alertas ?? 0} sub="activos" color={(alertas ?? 0) > 0 ? '#4a1a1a' : '#1a3a2f'} />
          <StatCard icon="📋" label="Acciones Correctivas" value={accionesAbiertas ?? 0} sub="abiertas" color={(accionesAbiertas ?? 0) > 0 ? '#3a2a0a' : '#1a3a2f'} />
          <StatCard icon="👤" label="Personal activo" value={empleados ?? 0} sub="empleados" color="#1E3A5F" />
          <StatCard icon="🚚" label="Flota activa" value={flota ?? 0} sub="tractos" color="#1E3A5F" />
        </div>
      </div>

      {/* Últimas actividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{ background: 'rgba(15,31,53,0.7)' }}>
          <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-white font-semibold text-sm">Últimos Viajes</h3>
            <Link href="/viajes" className="text-xs text-blue-400 hover:text-blue-300">Ver todos →</Link>
          </div>
          <div className="divide-y divide-white/5">
            {(viajesRecientes ?? []).map((v: any, i: number) => (
              <div key={i} className="px-5 py-3 flex justify-between items-center">
                <div>
                  <p className="text-white text-sm font-medium">{v.tracto_numero} — {v.operador_nombre ?? '—'}</p>
                  <p className="text-slate-500 text-xs">{v.origen ?? '—'} → {v.destino ?? '—'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${v.estado === 'Completado' ? 'bg-green-500/10 text-green-400 border-green-500/20' : v.estado === 'En_Camino' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-500/10 text-slate-300 border-slate-500/20'}`}>
                  {v.estado}
                </span>
              </div>
            ))}
            {!viajesRecientes?.length && <p className="px-5 py-4 text-slate-600 text-sm">Sin registros</p>}
          </div>
        </div>

        <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{ background: 'rgba(15,31,53,0.7)' }}>
          <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-white font-semibold text-sm">Últimas Inspecciones</h3>
            <Link href="/inspecciones" className="text-xs text-blue-400 hover:text-blue-300">Ver todas →</Link>
          </div>
          <div className="divide-y divide-white/5">
            {(inspRecientes ?? []).map((ins: any, i: number) => (
              <div key={i} className="px-5 py-3 flex justify-between items-center">
                <div>
                  <p className="text-white text-sm font-medium">{ins.tracto_numero} — {ins.tipo_movimiento}</p>
                  <p className="text-slate-500 text-xs">{new Date(ins.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${ins.resultado_final === 'Aprobado' ? 'bg-green-500/10 text-green-400 border-green-500/20' : ins.resultado_final === 'Rechazado' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-slate-500/10 text-slate-300 border-slate-500/20'}`}>
                  {ins.resultado_final ?? 'Pendiente'}
                </span>
              </div>
            ))}
            {!inspRecientes?.length && <p className="px-5 py-4 text-slate-600 text-sm">Sin registros</p>}
          </div>
        </div>
      </div>

      {/* Accesos rápidos a módulos */}
      <div>
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">Acceso a Módulos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {reportLinks.map(r => (
            <Link key={r.href} href={r.href}
              className="flex items-start gap-3 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all hover:bg-white/3"
              style={{ background: 'rgba(15,31,53,0.5)' }}>
              <span className="text-xl flex-shrink-0 mt-0.5">{r.icon}</span>
              <div>
                <p className="text-white text-sm font-medium">{r.label}</p>
                <p className="text-slate-500 text-xs mt-0.5 leading-tight">{r.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
