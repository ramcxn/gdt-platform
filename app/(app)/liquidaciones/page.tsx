import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function Badge({ text, color }: { text: string; color: string }) {
  const c: Record<string,string> = { green:'bg-green-500/10 text-green-400 border-green-500/20', amber:'bg-amber-500/10 text-amber-400 border-amber-500/20', blue:'bg-blue-500/10 text-blue-400 border-blue-500/20', red:'bg-red-500/10 text-red-400 border-red-500/20', slate:'bg-slate-500/10 text-slate-300 border-slate-500/20' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c[color]??c.slate}`}>{text}</span>
}
const estadoColor: Record<string,string> = { Pendiente:'amber', Aprobada:'blue', Pagada:'green', Rechazada:'red' }

export default async function LiquidacionesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession(); const user = session?.user ?? null
  const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user!.id).single()
  const eid = perfil?.empresa_id

  const { data: rows } = await supabase.from('liquidaciones').select('*').eq('empresa_id', eid).order('created_at', { ascending: false }).limit(50)
  const total      = rows?.reduce((s, r) => s + (r.total ?? 0), 0) ?? 0
  const pendientes = rows?.filter(r => r.estado === 'Pendiente').length ?? 0
  const pagadas    = rows?.filter(r => r.estado === 'Pagada').length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>💰</div>
          <div><h1 className="text-xl font-bold text-white">Liquidaciones</h1><p className="text-slate-400 text-sm">Pagos y compensaciones de operadores</p></div>
        </div>
        <Link href="/liquidaciones/nueva" className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:scale-105 transition-transform" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Nueva Liquidación
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{icon:'📋',label:'Total registros',val:rows?.length??0,sub:'Histórico'},{icon:'⏳',label:'Pendientes',val:pendientes,sub:'Por aprobar'},{icon:'✅',label:'Pagadas',val:pagadas,sub:'Este periodo'},{icon:'💵',label:'Monto total',val:`$${total.toLocaleString()}`,sub:'MXN'}].map((k,i)=>(
          <div key={i} className="glass-card rounded-xl p-5 border border-white/5" style={{background:'rgba(15,31,53,0.7)'}}>
            <span className="text-2xl block mb-2">{k.icon}</span>
            <p className="text-2xl font-bold text-white">{k.val}</p>
            <p className="text-sm text-slate-400 mt-0.5">{k.label}</p>
            <p className="text-xs text-slate-500 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{background:'rgba(15,31,53,0.7)'}}>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5">{['Operador','Período','Base','Bonos','Deducciones','Total','Estado','Fecha'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {rows?.length ? rows.map(r=>(
              <tr key={r.id} className="hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{r.operador_nombre||'—'}</td>
                <td className="px-4 py-3 text-slate-300">{r.periodo||'—'}</td>
                <td className="px-4 py-3 text-slate-300">${(r.monto_base||0).toLocaleString()}</td>
                <td className="px-4 py-3 text-green-400">+${(r.bonos||0).toLocaleString()}</td>
                <td className="px-4 py-3 text-red-400">-${(r.deducciones||0).toLocaleString()}</td>
                <td className="px-4 py-3 text-white font-semibold">${(r.total||0).toLocaleString()}</td>
                <td className="px-4 py-3"><Badge text={r.estado} color={estadoColor[r.estado]??'slate'}/></td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(r.created_at).toLocaleDateString('es-MX')}</td>
              </tr>
            )) : <tr><td colSpan={8} className="px-4 py-16 text-center text-slate-500">No hay liquidaciones registradas</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
