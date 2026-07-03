/* eslint-disable */
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const ESTADO_CONFIG: Record<string, { label: string; cls: string }> = {
  Programado:   { label: 'Programado',  cls: 'bg-slate-500/10 text-slate-300 border-slate-500/20' },
  En_Transito:  { label: 'En Tránsito', cls: 'bg-blue-500/10  text-blue-400  border-blue-500/20'  },
  Completado:   { label: 'Completado',  cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
  Cancelado:    { label: 'Cancelado',   cls: 'bg-red-500/10   text-red-400   border-red-500/20'   },
}

export default async function ViajesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession(); const user = session?.user ?? null
  if (!user) return null

  const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user.id).single()
  const eid = perfil?.empresa_id
  if (!eid) return null

  const now  = new Date()
  const mes1 = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [{ count: totalMes }, { count: enTransito }, { count: programados },
         { data: viajes }, { data: kmData }] = await Promise.all([
    supabase.from('viajes').select('*', { count: 'exact', head: true }).eq('empresa_id', eid).gte('fecha_salida', mes1),
    supabase.from('viajes').select('*', { count: 'exact', head: true }).eq('empresa_id', eid).eq('estado', 'En_Transito'),
    supabase.from('viajes').select('*', { count: 'exact', head: true }).eq('empresa_id', eid).eq('estado', 'Programado'),
    supabase.from('viajes').select('*').eq('empresa_id', eid).order('created_at', { ascending: false }).limit(20),
    supabase.from('viajes').select('distancia_km').eq('empresa_id', eid).gte('fecha_salida', mes1).not('distancia_km', 'is', null),
  ])

  const completadosMes = viajes?.filter(v => v.estado === 'Completado' && v.fecha_salida >= mes1).length ?? 0
  const kmTotales = kmData?.reduce((s: number, v: any) => s + (v.distancia_km ?? 0), 0) ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Registro de Viajes</h1>
            <p className="text-slate-400 text-sm">Control de rutas y operaciones</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-300 text-sm hover:bg-white/5 transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Ver Mapa
          </button>
          <Link href="/viajes/nueva"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-transform hover:scale-105 shadow"
            style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Viaje
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Viajes Este Mes', value: totalMes ?? 0,  sub: `${completadosMes} completados`,    icon: '📦' },
          { label: 'En Tránsito',     value: enTransito ?? 0, sub: 'Activos ahora',                   icon: '🚛' },
          { label: 'Programados',     value: programados ?? 0, sub: 'Próximos viajes',                icon: '📅' },
          { label: 'Km Totales',      value: kmTotales >= 1000 ? `${(kmTotales/1000).toFixed(1)}K` : kmTotales, sub: 'Este mes', icon: '📍' },
        ].map(({ label, value, sub, icon }) => (
          <div key={label} className="glass-card rounded-xl p-5 border border-white/5" style={{background:'rgba(15,31,53,0.7)'}}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{icon}</span>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{label}</p>
            <p className="text-xs text-slate-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Viajes Recientes */}
      <div className="glass-card rounded-xl border border-white/5" style={{background:'rgba(15,31,53,0.7)'}}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h2 className="text-base font-bold text-white">Viajes Recientes</h2>
            <p className="text-xs text-slate-400 mt-0.5">Estado actual de las operaciones</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 text-xs hover:bg-white/5 transition-colors cursor-pointer">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filtrar
          </button>
        </div>

        <div className="divide-y divide-white/5">
          {viajes && viajes.length > 0 ? viajes.map((v: any) => {
            const cfg = ESTADO_CONFIG[v.estado] ?? ESTADO_CONFIG.Programado
            return (
              <div key={v.id} className="px-5 py-4 hover:bg-white/3 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Top row: tracto + cliente + estado */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-white">{v.tracto_numero || 'Sin tracto'}</span>
                      {v.cliente && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                          {v.cliente}
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </div>
                    {/* Ruta */}
                    {(v.origen || v.destino) && (
                      <div className="flex items-center gap-1.5 text-slate-300 text-sm mb-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span>{v.origen || '—'}</span>
                        <span className="text-slate-600">→</span>
                        <span>{v.destino || '—'}</span>
                      </div>
                    )}
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {v.operador_nombre && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {v.operador_nombre.split(' ').slice(0,2).join(' ')}
                        </span>
                      )}
                      {v.fecha_salida && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Salida: {new Date(v.fecha_salida).toLocaleDateString('es-MX')}
                        </span>
                      )}
                      {v.distancia_km && (
                        <span>{v.distancia_km.toLocaleString()} km</span>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/viajes/${v.id}`}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 text-xs font-medium hover:bg-white/8 transition-colors">
                      Ver Detalles
                    </Link>
                    <DeleteViajeButton id={v.id} />
                  </div>
                </div>
              </div>
            )
          }) : (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🗺️</div>
              <p className="text-slate-400 font-medium">No hay viajes registrados</p>
              <Link href="/viajes/nueva" className="text-blue-400 text-sm mt-2 inline-block hover:underline">
                Registrar primer viaje →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Server component can't do client delete — placeholder que se reemplaza con Client Component
function DeleteViajeButton({ id }: { id: string }) {
  return (
    <Link href={`/viajes/${id}/eliminar`}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Eliminar
    </Link>
  )
}
