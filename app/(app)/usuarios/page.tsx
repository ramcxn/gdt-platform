import { createClient } from '@/lib/supabase/server'
const rolColor: Record<string,string> = { SuperAdmin:'red', Admin_Empresa:'purple', Supervisor:'blue', Operador:'green', Guardia:'amber', Chofer:'slate' }
export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = await supabase.from('usuarios').select('empresa_id,rol').eq('id', user!.id).single()
  const eid = perfil?.empresa_id
  const { data: rows } = await supabase.from('usuarios').select('*').eq('empresa_id', eid).order('nombre')
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>👤</div>
          <div><h1 className="text-xl font-bold text-white">Gestión de Usuarios</h1><p className="text-slate-400 text-sm">Control de acceso y roles del sistema</p></div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Invitar Usuario
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{i:'👤',l:'Usuarios',v:rows?.length??0},{i:'✅',l:'Activos',v:rows?.filter(r=>r.activo).length??0},{i:'🔑',l:'Admins',v:rows?.filter(r=>r.rol==='Admin_Empresa'||r.rol==='Supervisor').length??0},{i:'🚛',l:'Operadores',v:rows?.filter(r=>r.rol==='Operador'||r.rol==='Chofer').length??0}].map((k,i)=>(
          <div key={i} className="glass-card rounded-xl p-5 border border-white/5" style={{background:'rgba(15,31,53,0.7)'}}>
            <span className="text-2xl block mb-2">{k.i}</span><p className="text-3xl font-bold text-white">{k.v}</p><p className="text-sm text-slate-400 mt-0.5">{k.l}</p>
          </div>
        ))}
      </div>
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{background:'rgba(15,31,53,0.7)'}}>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5">{['Nombre','Rol','Estado','Desde'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {rows?.map(r=>(
              <tr key={r.id} className="hover:bg-white/3">
                <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 text-xs font-bold flex-shrink-0">{r.nombre?.[0]?.toUpperCase()??'?'}</div><span className="text-white font-medium">{r.nombre}</span>{r.id===user?.id&&<span className="text-xs text-slate-500">(tú)</span>}</div></td>
                <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${rolColor[r.rol]==='red'?'bg-red-500/10 text-red-400 border-red-500/20':rolColor[r.rol]==='purple'?'bg-purple-500/10 text-purple-400 border-purple-500/20':rolColor[r.rol]==='blue'?'bg-blue-500/10 text-blue-400 border-blue-500/20':rolColor[r.rol]==='green'?'bg-green-500/10 text-green-400 border-green-500/20':rolColor[r.rol]==='amber'?'bg-amber-500/10 text-amber-400 border-amber-500/20':'bg-slate-500/10 text-slate-300 border-slate-500/20'}`}>{r.rol}</span></td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border ${r.activo?'bg-green-500/10 text-green-400 border-green-500/20':'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>{r.activo?'Activo':'Inactivo'}</span></td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(r.created_at).toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'})}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
