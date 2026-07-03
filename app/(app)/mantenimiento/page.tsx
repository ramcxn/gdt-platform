import { createClient } from '@/lib/supabase/server'
function Badge({ text, color }: { text: string; color: string }) {
  const c: Record<string,string> = { green:'bg-green-500/10 text-green-400 border-green-500/20', amber:'bg-amber-500/10 text-amber-400 border-amber-500/20', blue:'bg-blue-500/10 text-blue-400 border-blue-500/20', red:'bg-red-500/10 text-red-400 border-red-500/20', slate:'bg-slate-500/10 text-slate-300 border-slate-500/20', purple:'bg-purple-500/10 text-purple-400 border-purple-500/20' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c[color]??c.slate}`}>{text}</span>
}
const eColor: Record<string,string> = { Programado:'slate', En_Proceso:'blue', Completado:'green', Cancelado:'red' }
const tColor: Record<string,string> = { Preventivo:'green', Correctivo:'amber', Predictivo:'purple' }
export default async function MantenimientoPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession(); const user = session?.user ?? null
  const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user!.id).single()
  const eid = perfil?.empresa_id
  const { data: rows } = await supabase.from('mantenimiento').select('*').eq('empresa_id', eid).order('created_at', { ascending: false }).limit(50)
  const enProceso = rows?.filter(r => r.estado === 'En_Proceso').length ?? 0
  const costoTotal = rows?.filter(r => r.estado === 'Completado').reduce((s,r) => s + (r.costo||0), 0) ?? 0
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>🔧</div>
          <div><h1 className="text-xl font-bold text-white">Mantenimiento</h1><p className="text-slate-400 text-sm">Mantenimiento preventivo y correctivo de flota</p></div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Nuevo Servicio
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{i:'📋',l:'Total servicios',v:rows?.length??0},{i:'🔧',l:'En proceso',v:enProceso},{i:'✅',l:'Completados',v:rows?.filter(r=>r.estado==='Completado').length??0},{i:'💰',l:'Costo total',v:`$${costoTotal.toLocaleString()}`}].map((k,i)=>(
          <div key={i} className="glass-card rounded-xl p-5 border border-white/5" style={{background:'rgba(15,31,53,0.7)'}}>
            <span className="text-2xl block mb-2">{k.i}</span><p className="text-2xl font-bold text-white">{k.v}</p><p className="text-sm text-slate-400 mt-0.5">{k.l}</p>
          </div>
        ))}
      </div>
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{background:'rgba(15,31,53,0.7)'}}>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5">{['Unidad','Tipo','Descripción','Fecha prog.','Técnico','Costo','Estado'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {rows?.length ? rows.map(r=>(
              <tr key={r.id} className="hover:bg-white/3">
                <td className="px-4 py-3 text-white font-medium">{r.tracto_numero||'—'}</td>
                <td className="px-4 py-3"><Badge text={r.tipo} color={tColor[r.tipo]??'slate'}/></td>
                <td className="px-4 py-3 text-slate-300 max-w-[200px] truncate">{r.descripcion||'—'}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">{r.fecha_programada||'—'}</td>
                <td className="px-4 py-3 text-slate-300">{r.tecnico||'—'}</td>
                <td className="px-4 py-3 text-slate-300">{r.costo?`$${r.costo.toLocaleString()}`:'—'}</td>
                <td className="px-4 py-3"><Badge text={r.estado} color={eColor[r.estado]??'slate'}/></td>
              </tr>
            )) : <tr><td colSpan={7} className="px-4 py-16 text-center"><div className="text-4xl mb-3">🔧</div><p className="text-slate-400">No hay servicios de mantenimiento</p></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
