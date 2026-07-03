import { createClient } from '@/lib/supabase/server'

function Badge({ text, color }: { text: string; color: string }) {
  const c: Record<string,string> = { green:'bg-green-500/10 text-green-400 border-green-500/20', amber:'bg-amber-500/10 text-amber-400 border-amber-500/20', blue:'bg-blue-500/10 text-blue-400 border-blue-500/20', red:'bg-red-500/10 text-red-400 border-red-500/20', slate:'bg-slate-500/10 text-slate-300 border-slate-500/20' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c[color]??c.slate}`}>{text}</span>
}

export default async function SellosPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession(); const user = session?.user ?? null
  const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user!.id).single()
  const eid = perfil?.empresa_id
  const { data: rows } = await supabase.from('sellos_seguridad').select('*').eq('empresa_id', eid).order('created_at', { ascending: false }).limit(100)

  const disponibles = rows?.filter(r => r.estado === 'Disponible').length ?? 0
  const en_uso      = rows?.filter(r => r.estado === 'En_Uso').length ?? 0
  const rotos       = rows?.filter(r => r.estado === 'Roto' || r.estado === 'Extraviado').length ?? 0
  const estadoColor: Record<string,string> = { Disponible:'green', En_Uso:'blue', Roto:'red', Extraviado:'red' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>🔒</div>
          <div><h1 className="text-xl font-bold text-white">Sellos de Seguridad</h1><p className="text-slate-400 text-sm">Control y trazabilidad de sellos CTPAT</p></div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Registrar Sello
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{i:'🔒',l:'Total sellos',v:rows?.length??0,s:'Inventario'},{i:'✅',l:'Disponibles',v:disponibles,s:'En stock'},{i:'🚛',l:'En uso',v:en_uso,s:'Asignados'},{i:'⚠️',l:'Rotos/Extraviados',v:rotos,s:'Baja'}].map((k,i)=>(
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
          <thead><tr className="border-b border-white/5">{['Número','Tipo','Estado','Asignado a','Unidad','Fecha asignación'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {rows?.length ? rows.map(r=>(
              <tr key={r.id} className="hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-white font-mono font-medium">{r.numero}</td>
                <td className="px-4 py-3 text-slate-300">{r.tipo}</td>
                <td className="px-4 py-3"><Badge text={r.estado} color={estadoColor[r.estado]??'slate'}/></td>
                <td className="px-4 py-3 text-slate-300">{r.asignado_a||'—'}</td>
                <td className="px-4 py-3 text-slate-300">{r.unidad_numero||'—'}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{r.fecha_asignacion?new Date(r.fecha_asignacion).toLocaleDateString('es-MX'):'—'}</td>
              </tr>
            )) : <tr><td colSpan={6} className="px-4 py-16 text-center"><div className="text-4xl mb-3">🔒</div><p className="text-slate-400">No hay sellos registrados</p></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
