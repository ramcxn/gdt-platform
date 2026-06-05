import { createClient } from '@/lib/supabase/server'
export default async function AlmacenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user!.id).single()
  const eid = perfil?.empresa_id
  const { data: rows } = await supabase.from('almacen_refacciones').select('*').eq('empresa_id', eid).order('nombre')
  const bajoStock = rows?.filter(r => r.cantidad <= r.cantidad_minima).length ?? 0
  const valorTotal = rows?.reduce((s,r) => s + ((r.cantidad||0)*(r.precio_unitario||0)), 0) ?? 0
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>📦</div>
          <div><h1 className="text-xl font-bold text-white">Almacén Refacciones</h1><p className="text-slate-400 text-sm">Inventario de partes y refacciones</p></div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Nueva Refacción
        </button>
      </div>
      {bajoStock > 0 && <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3"><span className="text-2xl">⚠️</span><p className="text-amber-300 font-semibold text-sm">{bajoStock} artículo(s) con stock bajo o en cero — requiere reabastecimiento</p></div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{i:'📦',l:'Artículos',v:rows?.length??0},{i:'⚠️',l:'Stock bajo',v:bajoStock},{i:'🏷️',l:'Categorías',v:new Set(rows?.map(r=>r.categoria).filter(Boolean)).size},{i:'💰',l:'Valor inventario',v:`$${Math.round(valorTotal).toLocaleString()}`}].map((k,i)=>(
          <div key={i} className="glass-card rounded-xl p-5 border border-white/5" style={{background:'rgba(15,31,53,0.7)'}}>
            <span className="text-2xl block mb-2">{k.i}</span><p className="text-2xl font-bold text-white">{k.v}</p><p className="text-sm text-slate-400 mt-0.5">{k.l}</p>
          </div>
        ))}
      </div>
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{background:'rgba(15,31,53,0.7)'}}>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5">{['Nombre','Código','Categoría','Stock','Mín.','Precio unit.','Proveedor'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {rows?.length ? rows.map(r=>(
              <tr key={r.id} className={`hover:bg-white/3 transition-colors ${r.cantidad<=r.cantidad_minima?'border-l-2 border-amber-500/50':''}`}>
                <td className="px-4 py-3 text-white font-medium">{r.nombre}</td>
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">{r.codigo||'—'}</td>
                <td className="px-4 py-3 text-slate-300">{r.categoria||'—'}</td>
                <td className={`px-4 py-3 font-bold ${r.cantidad<=r.cantidad_minima?'text-amber-400':'text-green-400'}`}>{r.cantidad}</td>
                <td className="px-4 py-3 text-slate-400">{r.cantidad_minima}</td>
                <td className="px-4 py-3 text-slate-300">{r.precio_unitario?`$${r.precio_unitario.toLocaleString()}`:'—'}</td>
                <td className="px-4 py-3 text-slate-300">{r.proveedor||'—'}</td>
              </tr>
            )) : <tr><td colSpan={7} className="px-4 py-16 text-center"><div className="text-4xl mb-3">📦</div><p className="text-slate-400">No hay refacciones en almacén</p></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
