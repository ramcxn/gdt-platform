import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/supabase/server-utils'

function Badge({ text, color }: { text: string; color: string }) {
  const c: Record<string,string> = { green:'bg-green-500/10 text-green-400 border-green-500/20', amber:'bg-amber-500/10 text-amber-400 border-amber-500/20', blue:'bg-blue-500/10 text-blue-400 border-blue-500/20', slate:'bg-slate-500/10 text-slate-300 border-slate-500/20', purple:'bg-purple-500/10 text-purple-400 border-purple-500/20' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c[color]??c.slate}`}>{text}</span>
}
const tipoColor: Record<string,string> = { Visita:'slate', Proveedor:'blue', Cliente:'green', Contratista:'purple' }

export default async function VisitasPage() {
  const supabase = await createClient()
  const { empresaId: eid } = await getSessionContext()
  const { data: rows } = await supabase.from('visitas_proveedores').select('*').eq('empresa_id', eid).order('created_at', { ascending: false }).limit(50)
  const activos = rows?.filter(r => !r.salida).length ?? 0
  const hoy = rows?.filter(r => { const d = new Date(r.created_at); const n = new Date(); return d.toDateString() === n.toDateString() }).length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center" className='btn-accent'>👥</div>
          <div><h1 className="text-xl font-bold text-white">Visitas / Proveedores</h1><p className="text-slate-400 text-sm">Registro de acceso de externos</p></div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer" className='btn-accent'>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Registrar Visita
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{i:'👥',l:'Total visitas',v:rows?.length??0,s:'Histórico'},{i:'🟢',l:'En instalaciones',v:activos,s:'Sin registro de salida'},{i:'📅',l:'Hoy',v:hoy,s:'Registros de hoy'},{i:'🏢',l:'Proveedores',v:rows?.filter(r=>r.tipo==='Proveedor').length??0,s:'Total'}].map((k,i)=>(
          <div key={i} className="glass-card rounded-xl p-5 border border-white/5" style={{background:'rgba(15,31,53,0.7)'}}>
            <span className="text-2xl block mb-2">{k.i}</span>
            <p className="text-3xl font-bold text-white">{k.v}</p>
            <p className="text-sm text-slate-400 mt-0.5">{k.l}</p>
            <p className="text-xs text-slate-500 mt-1">{k.s}</p>
          </div>
        ))}
      </div>
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{background:'rgba(15,31,53,0.7)'}}>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5">{['Tipo','Nombre','Empresa','Área visita','Gafete','Entrada','Salida'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {rows?.length ? rows.map(r=>(
              <tr key={r.id} className="hover:bg-white/3 transition-colors">
                <td className="px-4 py-3"><Badge text={r.tipo} color={tipoColor[r.tipo]??'slate'}/></td>
                <td className="px-4 py-3 text-white font-medium">{r.nombre}</td>
                <td className="px-4 py-3 text-slate-300">{r.empresa_origen||'—'}</td>
                <td className="px-4 py-3 text-slate-300">{r.area_visita||'—'}</td>
                <td className="px-4 py-3 text-slate-400 font-mono">{r.numero_gafete||'—'}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">{new Date(r.entrada).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}</td>
                <td className="px-4 py-3">{r.salida?<span className="text-slate-300 text-xs">{new Date(r.salida).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}</span>:<span className="text-green-400 text-xs font-medium">En planta</span>}</td>
              </tr>
            )) : <tr><td colSpan={7} className="px-4 py-16 text-center"><div className="text-4xl mb-3">👥</div><p className="text-slate-400">No hay visitas registradas</p></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
