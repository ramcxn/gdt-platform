import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/supabase/server-utils'
import Link from 'next/link'

export default async function PersonalPage() {
  const supabase = await createClient()
  const { empresaId: eid } = await getSessionContext()
  const { data: rows } = await supabase.from('empleados').select('*').eq('empresa_id', eid).order('nombre')
  const activos = rows?.filter(r => r.activo).length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center" className='btn-accent'>👷</div>
          <div><h1 className="text-xl font-bold text-white">Personal</h1><p className="text-slate-400 text-sm">Catálogo de empleados</p></div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer" className='btn-accent'>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Nuevo Empleado
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{i:'👷',l:'Total empleados',v:rows?.length??0},{i:'✅',l:'Activos',v:activos},{i:'🏢',l:'Departamentos',v:new Set(rows?.map(r=>r.departamento).filter(Boolean)).size},{i:'🚛',l:'Operadores',v:rows?.filter(r=>r.puesto?.toLowerCase().includes('operator')||r.departamento?.toLowerCase().includes('operacion')).length??0}].map((k,i)=>(
          <div key={i} className="glass-card rounded-xl p-5 border border-white/5" style={{background:'rgba(15,31,53,0.7)'}}>
            <span className="text-2xl block mb-2">{k.i}</span>
            <p className="text-3xl font-bold text-white">{k.v}</p>
            <p className="text-sm text-slate-400 mt-0.5">{k.l}</p>
          </div>
        ))}
      </div>
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{background:'rgba(15,31,53,0.7)'}}>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5">{['#','Nombre','Departamento','Puesto','Fecha ingreso','Estado'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {rows?.length ? rows.map(r=>(
              <tr key={r.id} className="hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{r.numero_empleado||'—'}</td>
                <td className="px-4 py-3 text-white font-medium">{r.nombre}</td>
                <td className="px-4 py-3 text-slate-300">{r.departamento||'—'}</td>
                <td className="px-4 py-3 text-slate-300">{r.puesto||'—'}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{r.fecha_ingreso?new Date(r.fecha_ingreso).toLocaleDateString('es-MX'):'—'}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border ${r.activo?'bg-green-500/10 text-green-400 border-green-500/20':'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>{r.activo?'Activo':'Inactivo'}</span></td>
              </tr>
            )) : <tr><td colSpan={6} className="px-4 py-16 text-center"><div className="text-4xl mb-3">👷</div><p className="text-slate-400">No hay empleados registrados</p></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
