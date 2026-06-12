/* eslint-disable */
import { createClient } from '@/lib/supabase/server'

function Badge({ text, color }: { text: string; color: string }) {
  const c: Record<string,string> = { red:'bg-red-500/10 text-red-400 border-red-500/20', purple:'bg-purple-500/10 text-purple-400 border-purple-500/20', blue:'bg-blue-500/10 text-blue-400 border-blue-500/20', green:'bg-green-500/10 text-green-400 border-green-500/20', amber:'bg-amber-500/10 text-amber-400 border-amber-500/20', slate:'bg-slate-500/10 text-slate-300 border-slate-500/20' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c[color]??c.slate}`}>{text}</span>
}
const rolColor: Record<string,string> = { SuperAdmin:'red', Admin_Empresa:'purple', Supervisor:'blue', Operador:'green', Guardia:'amber', Chofer:'slate' }

export default async function SuperAdminUsuariosPage() {
  const supabase = await createClient()
  const { data: usuarios } = await supabase
    .from('usuarios')
    .select('*, empresas(nombre_comercial)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Todos los Usuarios</h1>
      <div className="rounded-xl border border-white/5 overflow-hidden" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5">
              {['Nombre','Email','Empresa','Rol','Estado','Desde'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {(usuarios ?? []).map((u: any) => (
                <tr key={u.id} className="hover:bg-white/3">
                  <td className="px-4 py-3 text-white font-medium">{u.nombre}</td>
                  <td className="px-4 py-3 text-slate-400">{u.email ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{u.empresas?.nombre_comercial ?? <span className="text-slate-600">Sistema</span>}</td>
                  <td className="px-4 py-3"><Badge text={u.rol} color={rolColor[u.rol] ?? 'slate'} /></td>
                  <td className="px-4 py-3"><Badge text={u.activo ? 'Activo':'Inactivo'} color={u.activo?'green':'slate'} /></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.created_at).toLocaleDateString('es-MX')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
