import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/supabase/server-utils'
function Badge({ text, color }: { text: string; color: string }) {
  const c: Record<string,string> = { green:'bg-green-500/10 text-green-400 border-green-500/20', red:'bg-red-500/10 text-red-400 border-red-500/20', amber:'bg-amber-500/10 text-amber-400 border-amber-500/20', slate:'bg-slate-500/10 text-slate-300 border-slate-500/20' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c[color]??c.slate}`}>{text}</span>
}
export default async function AlcoholimetroPage() {
  const supabase = await createClient()
  const { empresaId: eid } = await getSessionContext()
  const { data: rows } = await supabase.from('alcoholimetro').select('*').eq('empresa_id', eid).order('fecha', { ascending: false }).limit(50)
  const positivos = rows?.filter(r => r.resultado === 'Positivo').length ?? 0
  const hoy = rows?.filter(r => { const d = new Date(r.fecha); const n = new Date(); return d.toDateString() === n.toDateString() }).length ?? 0
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center" className='btn-accent'>🍃</div>
          <div><h1 className="text-xl font-bold text-white">Alcoholímetro</h1><p className="text-slate-400 text-sm">Pruebas de alcoholimetría a personal</p></div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer" className='btn-accent'>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Registrar Prueba
        </button>
      </div>
      {positivos > 0 && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3"><span className="text-2xl">🚨</span><div><p className="text-red-300 font-semibold text-sm">{positivos} resultado(s) positivo(s) registrado(s)</p><p className="text-red-400/70 text-xs mt-0.5">Requiere atención inmediata del supervisor</p></div></div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{i:'📋',l:'Total pruebas',v:rows?.length??0},{i:'📅',l:'Hoy',v:hoy},{i:'✅',l:'Negativos',v:rows?.filter(r=>r.resultado==='Negativo').length??0},{i:'🚨',l:'Positivos',v:positivos}].map((k,i)=>(
          <div key={i} className="glass-card rounded-xl p-5 border border-white/5" style={{background:'rgba(15,31,53,0.7)'}}>
            <span className="text-2xl block mb-2">{k.i}</span><p className="text-3xl font-bold text-white">{k.v}</p><p className="text-sm text-slate-400 mt-0.5">{k.l}</p>
          </div>
        ))}
      </div>
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{background:'rgba(15,31,53,0.7)'}}>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5">{['Empleado','Puesto','Fecha','Resultado','mg/L','Observaciones'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {rows?.length ? rows.map(r=>(
              <tr key={r.id} className="hover:bg-white/3"><td className="px-4 py-3 text-white font-medium">{r.nombre_empleado||'—'}</td><td className="px-4 py-3 text-slate-300">{r.puesto||'—'}</td><td className="px-4 py-3 text-slate-300 text-xs">{new Date(r.fecha).toLocaleString('es-MX',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</td><td className="px-4 py-3"><Badge text={r.resultado} color={r.resultado==='Positivo'?'red':r.resultado==='Rehusado'?'amber':'green'}/></td><td className="px-4 py-3 text-slate-300 font-mono">{r.valor_mgl??'—'}</td><td className="px-4 py-3 text-slate-400 text-xs">{r.observaciones||'—'}</td></tr>
            )) : <tr><td colSpan={6} className="px-4 py-16 text-center"><div className="text-4xl mb-3">🍃</div><p className="text-slate-400">No hay pruebas registradas</p></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
