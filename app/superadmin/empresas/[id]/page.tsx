/* eslint-disable */
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EmpresaForm from './EmpresaForm'

function Badge({ text, color }: { text: string; color: string }) {
  const c: Record<string,string> = { green:'bg-green-500/10 text-green-400 border-green-500/20', amber:'bg-amber-500/10 text-amber-400 border-amber-500/20', red:'bg-red-500/10 text-red-400 border-red-500/20', purple:'bg-purple-500/10 text-purple-400 border-purple-500/20', blue:'bg-blue-500/10 text-blue-400 border-blue-500/20', slate:'bg-slate-500/10 text-slate-300 border-slate-500/20' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c[color]??c.slate}`}>{text}</span>
}
const rolColor: Record<string,string> = { SuperAdmin:'red', Admin_Empresa:'purple', Supervisor:'blue', Operador:'green', Guardia:'amber', Chofer:'slate' }

export default async function EmpresaDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: empresa } = await supabase.from('empresas').select('*').eq('id', params.id).single()
  if (!empresa) notFound()

  const { data: usuarios } = await supabase.from('usuarios').select('*').eq('empresa_id', params.id).order('nombre')
  const { data: modulosRows } = await supabase.from('empresa_modulos').select('modulo_key').eq('empresa_id', params.id)
  const modulosActuales = (modulosRows ?? []).map(m => m.modulo_key)

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/superadmin" className="text-slate-400 hover:text-white text-sm">← Empresas</Link>
        <h1 className="text-2xl font-bold text-white">{empresa.nombre_comercial}</h1>
        <Badge text={empresa.estado ?? 'Activo'} color={empresa.estado === 'Activo' ? 'green' : empresa.estado === 'Suspendido' ? 'red' : 'amber'} />
        <Badge text={empresa.plan ?? 'Demo'} color={({ Enterprise:'purple', Premium:'blue', Básico:'green', Demo:'amber' } as Record<string, string>)[empresa.plan] ?? 'slate'} />
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'RFC', value: empresa.rfc ?? '—' },
          { label: 'CTPAT No.', value: empresa.numero_ctpat ?? '—' },
          { label: 'Vigencia CTPAT', value: empresa.fecha_vigencia_ctpat ? new Date(empresa.fecha_vigencia_ctpat).toLocaleDateString('es-MX') : '—' },
          { label: 'Usuarios', value: usuarios?.length ?? 0 },
        ].map((item, i) => (
          <div key={i} className="rounded-xl p-4 border border-white/5" style={{ background: 'rgba(15,31,53,0.7)' }}>
            <p className="text-xs text-slate-500 mb-1">{item.label}</p>
            <p className="text-lg font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Editar empresa */}
      <EmpresaForm empresa={empresa} modulosActuales={modulosActuales} />

      {/* Usuarios de esta empresa */}
      <div className="rounded-xl border border-white/5 overflow-hidden" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Usuarios ({usuarios?.length ?? 0})</h2>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5">
            {['Nombre','Email','Rol','Estado','Creado'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {(usuarios ?? []).map((u: any) => (
              <tr key={u.id} className="hover:bg-white/3">
                <td className="px-4 py-3 text-white font-medium">{u.nombre}</td>
                <td className="px-4 py-3 text-slate-400">{u.email ?? '—'}</td>
                <td className="px-4 py-3"><Badge text={u.rol} color={rolColor[u.rol] ?? 'slate'} /></td>
                <td className="px-4 py-3"><Badge text={u.activo ? 'Activo' : 'Inactivo'} color={u.activo ? 'green' : 'slate'} /></td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.created_at).toLocaleDateString('es-MX')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
