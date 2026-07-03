import { createClient } from '@/lib/supabase/server'

export default async function ZonasPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession(); const user = session?.user ?? null
  const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user!.id).single()
  const eid = perfil?.empresa_id
  const { data: zonas } = await supabase.from('zonas_rondin').select('*').eq('empresa_id', eid).order('nombre')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>📍</div>
          <div><h1 className="text-xl font-bold text-white">Zonas de Seguridad</h1><p className="text-slate-400 text-sm">Puntos de control para rondines</p></div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Nueva Zona
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[{i:'📍',l:'Zonas registradas',v:zonas?.length??0},{i:'✅',l:'Activas',v:zonas?.filter(z=>z.activo).length??0},{i:'🔒',l:'Con QR asignado',v:zonas?.filter(z=>z.qr_code).length??0}].map((k,i)=>(
          <div key={i} className="glass-card rounded-xl p-5 border border-white/5" style={{background:'rgba(15,31,53,0.7)'}}>
            <span className="text-2xl block mb-2">{k.i}</span>
            <p className="text-3xl font-bold text-white">{k.v}</p>
            <p className="text-sm text-slate-400 mt-0.5">{k.l}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zonas?.length ? zonas.map(z=>(
          <div key={z.id} className="glass-card rounded-xl border border-white/5 p-5" style={{background:'rgba(15,31,53,0.7)'}}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-white">{z.nombre}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{z.qr_code}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${z.activo?'bg-green-500/10 text-green-400 border-green-500/20':'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>{z.activo?'Activa':'Inactiva'}</span>
            </div>
            <div className="mt-3 p-3 bg-white/5 rounded-lg flex items-center justify-center">
              <div className="text-xs text-slate-400 font-mono">QR: {z.qr_code}</div>
            </div>
          </div>
        )) : (
          <div className="col-span-3 text-center py-16">
            <div className="text-4xl mb-3">📍</div>
            <p className="text-slate-400">No hay zonas registradas</p>
            <p className="text-slate-500 text-sm mt-1">Agrega zonas para que los guardias puedan escanear el QR en cada punto</p>
          </div>
        )}
      </div>
    </div>
  )
}
