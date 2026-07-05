/* eslint-disable */
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function Badge({ text, color }: { text: string; color: string }) {
  const c: Record<string,string> = {
    green: 'status-badge status-badge-green',
    amber: 'status-badge status-badge-amber',
    red:   'status-badge status-badge-red',
    blue:  'status-badge status-badge-default',
    purple:'status-badge status-badge-purple',
    slate: 'status-badge',
    cyan:  'status-badge status-badge-cyan',
  }
  return <span className={c[color] ?? c.slate}><span className="dot" />{text}</span>
}

const estadoColor: Record<string,string> = { Activo:'green', Suspendido:'red', Demo:'amber', Inactivo:'slate' }
const planColor: Record<string,string> = { Enterprise:'purple', Premium:'blue', Básico:'green', Demo:'amber' }

const SvgIcons = {
  companies: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  active: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  users: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  demo: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  add: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  arrow: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
}

export default async function SuperAdminEmpresasPage() {
  const supabase = await createClient()

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

  const { data: userCounts } = await supabase
    .from('usuarios')
    .select('empresa_id')
  const uByEmp = (userCounts ?? []).reduce((acc: any, u: any) => {
    acc[u.empresa_id] = (acc[u.empresa_id] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const stats = [
    { label: 'Empresas totales', value: totalEmpresas ?? 0, icon: SvgIcons.companies, color: '#3b82f6' },
    { label: 'Empresas activas', value: activas ?? 0, icon: SvgIcons.active, color: '#059669' },
    { label: 'Total usuarios', value: totalUsuarios ?? 0, icon: SvgIcons.users, color: '#6366f1' },
    { label: 'Demos activas', value: empresas?.filter(e => e.plan === 'Demo').length ?? 0, icon: SvgIcons.demo, color: '#d97706' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>Panel de Empresas</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Administración global de todos los tenants</p>
        </div>
        <Link href="/superadmin/empresas/nueva"
          className="flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'var(--accent-gradient)' }}>
          {SvgIcons.add}
          Nueva Empresa
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-value" style={{ color: s.color }}>{s.value}</div>
            <div className="kpi-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card-app overflow-hidden">
        <div className="card-app-header">
          <h3>Todas las empresas</h3>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{empresas?.length ?? 0} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-app">
            <thead>
              <tr>
                {['Empresa', 'RFC', 'Plan', 'Estado', 'Usuarios', 'CTPAT', 'Creada', ''].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {(empresas ?? []).map((emp: any) => (
                <tr key={emp.id} className="row-hover transition-colors">
                  <td>
                    <div className="font-medium text-sm" style={{ color: 'var(--text-heading)' }}>{emp.nombre_comercial}</div>
                    {emp.razon_social && emp.razon_social !== emp.nombre_comercial && (
                      <div className="text-xs truncate max-w-[180px]" style={{ color: 'var(--text-muted)' }}>{emp.razon_social}</div>
                    )}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{emp.rfc ?? '—'}</td>
                  <td><Badge text={emp.plan ?? 'Demo'} color={planColor[emp.plan] ?? 'slate'} /></td>
                  <td><Badge text={emp.estado ?? 'Activo'} color={estadoColor[emp.estado] ?? 'slate'} /></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{uByEmp[emp.id] ?? 0}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{emp.numero_ctpat ?? '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {new Date(emp.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <Link href={`/superadmin/empresas/${emp.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium transition-colors"
                      style={{ color: 'var(--accent)' }}>
                      Gestionar
                      {SvgIcons.arrow}
                    </Link>
                  </td>
                </tr>
              ))}
              {!empresas?.length && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>No hay empresas registradas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
