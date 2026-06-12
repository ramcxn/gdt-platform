/* eslint-disable */
import { createClient } from '@/lib/supabase/server'

export default async function SuperAdminMetricasPage() {
  const supabase = await createClient()

  const [
    { count: empresas },
    { count: usuarios },
    { count: viajes },
    { count: inspecciones },
    { count: rondines },
    { data: empresasList }
  ] = await Promise.all([
    supabase.from('empresas').select('*', { count: 'exact', head: true }),
    supabase.from('usuarios').select('*', { count: 'exact', head: true }),
    supabase.from('viajes').select('*', { count: 'exact', head: true }),
    supabase.from('inspecciones_ctpat').select('*', { count: 'exact', head: true }),
    supabase.from('rondines').select('*', { count: 'exact', head: true }),
    supabase.from('empresas').select('id, nombre_comercial, plan, estado, created_at').order('created_at', { ascending: false }).limit(10)
  ])

  const kpis = [
    { label: 'Empresas', value: empresas ?? 0, icon: '🏢', sub: 'tenants activos' },
    { label: 'Usuarios totales', value: usuarios ?? 0, icon: '👤', sub: 'en plataforma' },
    { label: 'Viajes registrados', value: viajes ?? 0, icon: '🚛', sub: 'total histórico' },
    { label: 'Inspecciones CTPAT', value: inspecciones ?? 0, icon: '🔍', sub: 'total histórico' },
    { label: 'Rondines', value: rondines ?? 0, icon: '🛡️', sub: 'total histórico' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Métricas Globales</h1>
        <p className="text-slate-400 text-sm mt-1">Vista agregada de toda la plataforma</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="rounded-xl p-5 border border-white/5" style={{ background: 'rgba(15,31,53,0.7)' }}>
            <div className="text-2xl mb-2">{k.icon}</div>
            <p className="text-3xl font-bold text-white">{k.value.toLocaleString()}</p>
            <p className="text-sm font-medium text-white mt-1">{k.label}</p>
            <p className="text-xs text-slate-500">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/5 p-5" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <h2 className="text-white font-semibold mb-4">Últimas empresas registradas</h2>
        <div className="space-y-2">
          {(empresasList ?? []).map((e: any) => (
            <div key={e.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-white text-sm">{e.nombre_comercial}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{e.plan}</span>
                <span className="text-xs text-slate-500">{new Date(e.created_at).toLocaleDateString('es-MX')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
