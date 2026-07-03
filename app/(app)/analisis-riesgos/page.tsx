/* eslint-disable */
import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/supabase/server-utils'
function Badge({ text, color }: { text: string; color: string }) {
  const c: Record<string,string> = { green:'bg-green-500/10 text-green-400 border-green-500/20', amber:'bg-amber-500/10 text-amber-400 border-amber-500/20', blue:'bg-blue-500/10 text-blue-400 border-blue-500/20', red:'bg-red-500/10 text-red-400 border-red-500/20', slate:'bg-slate-500/10 text-slate-300 border-slate-500/20', purple:'bg-purple-500/10 text-purple-400 border-purple-500/20' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c[color]??c.slate}`}>{text}</span>
}
const riskColor: Record<string,string> = { Bajo:'green', Medio:'amber', Alto:'red', Critico:'red', Vigente:'green', Por_Vencer:'amber', Vencido:'red', Abierta:'amber', En_Proceso:'blue', Cerrada:'green', Activo:'amber', Mitigado:'blue', Baja:'green', Media:'amber', Alta:'red', Critica:'red', Abierto:'amber', En_Investigacion:'blue', Resuelto:'green', Falso_Positivo:'slate' }

export default async function Page() {
  const supabase = await createClient()
  const { empresaId: eid } = await getSessionContext()
  const { data: rows } = await supabase.from('analisis_riesgos').select('*').eq('empresa_id', eid).order('created_at', { ascending: false }).limit(50)
  const thisMo = rows?.filter((r:any) => { const d=new Date(r.created_at);const n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear() }).length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center flex-shrink-0 btn-accent">⚠️</div>
          <div><h1 className="text-xl font-bold text-white">Análisis de Riesgos</h1><p className="text-slate-400 text-sm">Identificación y gestión de riesgos operativos</p></div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer btn-accent">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Nuevo
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[{i:'⚠️',l:'Total registros',v:rows?.length??0},{i:'📅',l:'Este mes',v:thisMo},{i:'🕐',l:'Último registro',v:rows?.[0]?new Date((rows[0] as any).created_at).toLocaleDateString('es-MX',{day:'numeric',month:'short'}):'—'}].map((k,i)=>(
          <div key={i} className="glass-card rounded-xl p-5 border border-white/5" style={{background:'rgba(15,31,53,0.7)'}}>
            <span className="text-2xl block mb-2">{k.i}</span><p className="text-3xl font-bold text-white">{k.v}</p><p className="text-sm text-slate-400 mt-0.5">{k.l}</p>
          </div>
        ))}
      </div>
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{background:'rgba(15,31,53,0.7)'}}>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5">{['Tipo','Área','Nivel','Estado','Fecha'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {rows?.length ? (rows as any[]).map(r=>(
              <tr key={r.id} className="hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-white font-medium max-w-[160px] truncate">{r.tipo??'—'}</td>
                <td className="px-4 py-3 text-slate-300">{r.area??'—'}</td>
                <td className="px-4 py-3 text-slate-300">{r.nivel??'—'}</td>
                <td className="px-4 py-3"><Badge text={String(r.estado??'—')} color={riskColor[r.estado]??'slate'}/></td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(r.created_at).toLocaleDateString('es-MX')}</td>
              </tr>
            )) : <tr><td colSpan={5} className="px-4 py-16 text-center"><div className="text-4xl mb-3">⚠️</div><p className="text-slate-400">No hay registros en Análisis de Riesgos</p></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
