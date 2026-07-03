/* eslint-disable */
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

function Badge({ text, color }: { text: string; color: string }) {
  const c: Record<string,string> = {
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red:   'bg-red-500/10 text-red-400 border-red-500/20',
    blue:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple:'bg-purple-500/10 text-purple-400 border-purple-500/20',
    slate: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c[color]??c.slate}`}>{text}</span>
}

const estadoColor: Record<string,string> = { Activo:'green', Suspendido:'red', Demo:'amber', Inactivo:'slate' }
const planColor: Record<string,string> = { Enterprise:'purple', Premium:'blue', Básico:'green', Demo:'amber' }

export default async function SuperAdminEmpresasPage() {
  await createClient()
  const supabase = createAdminClient()

  // Stats globales
  const [
    { count: totalEmpresas },
    { count: activas },
    { count: totalUsuarios },
    { data: empresas }
  ] = await Promise.all([
    supabase.from('empresas').select('*', { count: 'exact', head: true }),
    supabase.from('empresas').select('*', { count: 'exact', head: true }).eq('estado', 'Activo'),
    supabase.from('usuarios').select('*', { count: 'exact', head: true }),
    supabase.from('empresas').select('*').order('created_at', { ascending: false })
  ])

  // Usuarios por empresa
  const { data: userCounts } = await supabase
    .from('usuarios')
    .select('empresa_id')
  const uByEmp = (userCounts ?? []).reduce((acc: any, u: any) => {
    acc[u.empresa_id] = (acc[u.empresa_id] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const stats = [
    { label: 'Empresas totales', value: totalEmpresas ?? 0, icon: '🏢', color: '#7c3aed' },
    { label: 'Empresas activas', value: activas ?? 0, icon: '✅', color: '#10b981' },
    { label: 'Total usuarios', value: totalUsuarios ?? 0, icon: '👤', color: '#3b82f6' },
    { label: 'Demos activas', value: empresas?.filter(e => e.plan === 'Demo').length ?? 0, icon: '🧪', color: '#f59e0b' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel de Empresas</h1>
          <p className="text-slate-400 text-sm mt-1">Administración global de todos los tenants</p>
        </div>
        <Link href="/superadmin/empresas/nueva"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
          <span className="text-base">+</span> Nueva Empresa
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="rounded-xl p-5 border border-white/5" style={{ background: 'rgba(15,31,53,0.7)' }}>
            <span className="text-2xl block mb-2">{s.icon}</span>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabla de empresas */}
      <div className="rounded-xl border border-white/5 overflow-hidden" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-white font-semibold">Todas las empresas</h2>
          <span className="text-slate-500 text-sm">{empresas?.length ?? 0} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Empresa', 'RFC', 'Plan', 'Estado', 'Usuarios', 'CTPAT', 'Creada', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(empresas ?? []).map((emp: any) => (
                <tr key={emp.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{emp.nombre_comercial}</div>
                    {emp.razon_social && emp.razon_social !== emp.nombre_comercial && (
                      <div className="text-xs text-slate-500 truncate max-w-[180px]">{emp.razon_social}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300 text-xs">{emp.rfc ?? '—'}</td>
                  <td className="px-4 py-3"><Badge text={emp.plan ?? 'Demo'} color={planColor[emp.plan] ?? 'slate'} /></td>
                  <td className="px-4 py-3"><Badge text={emp.estado ?? 'Activo'} color={estadoColor[emp.estado] ?? 'slate'} /></td>
                  <td className="px-4 py-3 text-slate-300">{uByEmp[emp.id] ?? 0}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{emp.numero_ctpat ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(emp.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-3">
                    <Link href={`/superadmin/empresas/${emp.id}`}
                      className="text-purple-400 hover:text-purple-300 text-xs font-medium transition-colors">
                      Gestionar →
                    </Link>
                  </td>
                </tr>
              ))}
              {!empresas?.length && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No hay empresas registradas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
