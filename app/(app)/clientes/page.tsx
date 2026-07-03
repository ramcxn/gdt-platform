import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/supabase/server-utils'
export default async function ClientesCTPatPage() {
  const supabase = await createClient()
  const { empresaId: eid } = await getSessionContext()
  const { data: rows } = await supabase.from('clientes_ctpat').select('*').eq('empresa_id', eid).order('nombre')
  const hoy = new Date()
  const porVencer = rows?.filter(r => { if (!r.fecha_vencimiento) return false; const d = new Date(r.fecha_vencimiento); return d > hoy && d <= new Date(Date.now() + 30*86400000) }).length ?? 0
  const vencidos  = rows?.filter(r => r.fecha_vencimiento && new Date(r.fecha_vencimiento) < hoy).length ?? 0
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>🏢</div>
          <div><h1 className="text-xl font-bold text-white">Clientes CTPAT</h1><p className="text-slate-400 text-sm">Socios comerciales certificados en CTPAT</p></div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Nuevo Cliente
        </button>
      </div>
      {(porVencer > 0 || vencidos > 0) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {vencidos > 0 && <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3"><span className="text-xl">🚨</span><p className="text-red-300 text-sm font-medium">{vencidos} certificación(es) VENCIDA(S)</p></div>}
          {porVencer > 0 && <div className="flex-1 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3"><span className="text-xl">⚠️</span><p className="text-amber-300 text-sm font-medium">{porVencer} certificación(es) vencen en 30 días</p></div>}
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{i:'🏢',l:'Clientes CTPAT',v:rows?.length??0},{i:'✅',l:'Activos',v:rows?.filter(r=>r.activo).length??0},{i:'⚠️',l:'Por vencer',v:porVencer},{i:'🚨',l:'Vencidos',v:vencidos}].map((k,i)=>(
          <div key={i} className="glass-card rounded-xl p-5 border border-white/5" style={{background:'rgba(15,31,53,0.7)'}}>
            <span className="text-2xl block mb-2">{k.i}</span><p className="text-3xl font-bold text-white">{k.v}</p><p className="text-sm text-slate-400 mt-0.5">{k.l}</p>
          </div>
        ))}
      </div>
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{background:'rgba(15,31,53,0.7)'}}>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5">{['Nombre','RFC','Nivel','Certificación','Vencimiento','Contacto','Estado'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {rows?.length ? rows.map(r=>{
              const isVencido = r.fecha_vencimiento && new Date(r.fecha_vencimiento) < hoy
              const isPorVencer = r.fecha_vencimiento && !isVencido && new Date(r.fecha_vencimiento) <= new Date(Date.now()+30*86400000)
              return (
                <tr key={r.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{r.nombre}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{r.rfc||'—'}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">{r.nivel?.replace('_',' ')||'—'}</span></td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{r.fecha_cert||'—'}</td>
                  <td className="px-4 py-3 text-xs"><span className={isVencido?'text-red-400 font-semibold':isPorVencer?'text-amber-400 font-semibold':'text-slate-300'}>{r.fecha_vencimiento||'—'}</span></td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{r.contacto||'—'}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border ${r.activo?'bg-green-500/10 text-green-400 border-green-500/20':'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>{r.activo?'Activo':'Inactivo'}</span></td>
                </tr>
              )
            }) : <tr><td colSpan={7} className="px-4 py-16 text-center"><div className="text-4xl mb-3">🏢</div><p className="text-slate-400">No hay clientes CTPAT registrados</p></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
