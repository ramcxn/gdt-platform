import { createClient } from '@/lib/supabase/server'
function Badge({ text, color }: { text: string; color: string }) {
  const c: Record<string,string> = { green:'bg-green-500/10 text-green-400 border-green-500/20', amber:'bg-amber-500/10 text-amber-400 border-amber-500/20', red:'bg-red-500/10 text-red-400 border-red-500/20', slate:'bg-slate-500/10 text-slate-300 border-slate-500/20' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c[color]??c.slate}`}>{text}</span>
}
const eColor: Record<string,string> = { Operativo:'green', En_Reparacion:'amber', Dado_de_Baja:'red' }
export default async function InventarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user!.id).single()
  const eid = perfil?.empresa_id
  const { data: rows } = await supabase.from('inventario_equipo').select('*').eq('empresa_id', eid).order('nombre')
  const valor = rows?.filter(r=>r.estado!=='Dado_de_Baja').reduce((s,r)=>s+(r.valor||0),0)??0
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>🖥️</div>
          <div><h1 className="text-xl font-bold text-white">Inventario de Equipo</h1><p className="text-slate-400 text-sm">Control de activos y equipos de la empresa</p></div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Nuevo Equipo
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{i:'🖥️',l:'Total equipos',v:rows?.length??0},{i:'✅',l:'Operativos',v:rows?.filter(r=>r.estado==='Operativo').length??0},{i:'🔧',l:'En reparación',v:rows?.filter(r=>r.estado==='En_Reparacion').length??0},{i:'💰',l:'Valor activo',v:`$${Math.round(valor).toLocaleString()}`}].map((k,i)=>(
          <div key={i} className="glass-card rounded-xl p-5 border border-white/5" style={{background:'rgba(15,31,53,0.7)'}}>
            <span className="text-2xl block mb-2">{k.i}</span><p className="text-2xl font-bold text-white">{k.v}</p><p className="text-sm text-slate-400 mt-0.5">{k.l}</p>
          </div>
        ))}
      </div>
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{background:'rgba(15,31,53,0.7)'}}>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5">{['Nombre','Código','Categoría','Asignado a','Estado','Valor'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {rows?.length ? rows.map(r=>(
              <tr key={r.id} className="hover:bg-white/3"><td className="px-4 py-3 text-white font-medium">{r.nombre}</td><td className="px-4 py-3 text-slate-400 font-mono text-xs">{r.codigo||'—'}</td><td className="px-4 py-3 text-slate-300">{r.categoria||'—'}</td><td className="px-4 py-3 text-slate-300">{r.asignado_a||'—'}</td><td className="px-4 py-3"><Badge text={r.estado.replace('_',' ')} color={eColor[r.estado]??'slate'}/></td><td className="px-4 py-3 text-slate-300">{r.valor?`$${r.valor.toLocaleString()}`:'—'}</td></tr>
            )) : <tr><td colSpan={6} className="px-4 py-16 text-center"><div className="text-4xl mb-3">🖥️</div><p className="text-slate-400">No hay equipos registrados</p></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
