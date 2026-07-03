/* eslint-disable */
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NuevaLiquidacionPage() {
  const router = useRouter()
  const supabase = createClient()
  const [eid, setEid] = useState('')
  const [operadores, setOperadores] = useState<any[]>([])
  const [viajes, setViajes] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ operador_nombre:'', viaje_id:'', periodo:'', monto_base:'', bonos:'', deducciones:'', estado:'Pendiente', notas:'' })
  const s = (k:string,v:any) => setForm(p=>({...p,[k]:v}))

  useEffect(() => {
    supabase.auth.getSession().then(async({data:{session}})=>{ const user = session?.user ?? null
      if(!user) return
      const {data:p} = await supabase.from('usuarios').select('empresa_id').eq('id',user.id).single()
      if(!p?.empresa_id) return
      setEid(p.empresa_id)
      const [{data:o},{data:v}] = await Promise.all([
        supabase.from('operadores').select('*').eq('empresa_id',p.empresa_id).eq('activo',true).order('nombre'),
        supabase.from('viajes').select('id,tracto_numero,cliente,origen,destino').eq('empresa_id',p.empresa_id).order('created_at',{ascending:false}).limit(20),
      ])
      setOperadores(o??[])
      setViajes(v??[])
    })
  },[])

  async function submit(e:React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await supabase.from('liquidaciones').insert([{
      empresa_id:eid, operador_nombre:form.operador_nombre, viaje_id:form.viaje_id||null,
      periodo:form.periodo, monto_base:parseFloat(form.monto_base)||0,
      bonos:parseFloat(form.bonos)||0, deducciones:parseFloat(form.deducciones)||0,
      estado:form.estado, notas:form.notas,
    }])
    router.push('/liquidaciones')
  }

  const inp = "w-full px-3 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600"
  const lbl = "block text-xs font-medium text-slate-400 mb-1.5"

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/liquidaciones" className="text-slate-500 hover:text-slate-200 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </Link>
        <div><h1 className="text-xl font-bold text-white">Nueva Liquidación</h1><p className="text-slate-400 text-sm">Registrar pago a operador</p></div>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <div className="glass-card rounded-xl border border-white/5 p-5 space-y-4" style={{background:'rgba(15,31,53,0.7)'}}>
          <h2 className="text-sm font-semibold text-slate-300">💰 Datos del pago</h2>
          <div><label className={lbl}>Operador *</label>
            <select required className={inp} value={form.operador_nombre} onChange={e=>s('operador_nombre',e.target.value)}>
              <option value="">Seleccionar...</option>
              {operadores.map(o=><option key={o.id} value={o.nombre}>{o.nombre}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>Período</label><input className={inp} value={form.periodo} onChange={e=>s('periodo',e.target.value)} placeholder="Ej: Junio 2026"/></div>
            <div><label className={lbl}>Viaje relacionado</label>
              <select className={inp} value={form.viaje_id} onChange={e=>s('viaje_id',e.target.value)}>
                <option value="">Sin viaje</option>
                {viajes.map(v=><option key={v.id} value={v.id}>{v.tracto_numero} — {v.origen}→{v.destino}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Monto base $</label><input type="number" required className={inp} value={form.monto_base} onChange={e=>s('monto_base',e.target.value)} placeholder="0.00"/></div>
            <div><label className={lbl}>Bonos $</label><input type="number" className={inp} value={form.bonos} onChange={e=>s('bonos',e.target.value)} placeholder="0.00"/></div>
            <div><label className={lbl}>Deducciones $</label><input type="number" className={inp} value={form.deducciones} onChange={e=>s('deducciones',e.target.value)} placeholder="0.00"/></div>
            <div><label className={lbl}>Estado</label>
              <select className={inp} value={form.estado} onChange={e=>s('estado',e.target.value)}>
                {['Pendiente','Aprobada','Pagada','Rechazada'].map(e=><option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
          {(form.monto_base||form.bonos||form.deducciones) && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-sm text-blue-300">
              Total: <strong>${((parseFloat(form.monto_base)||0)+(parseFloat(form.bonos)||0)-(parseFloat(form.deducciones)||0)).toLocaleString()}</strong>
            </div>
          )}
          <div><label className={lbl}>Notas</label><textarea className={`${inp} resize-none`} rows={2} value={form.notas} onChange={e=>s('notas',e.target.value)}/></div>
        </div>
        <div className="flex justify-between">
          <Link href="/liquidaciones" className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">← Cancelar</Link>
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 cursor-pointer btn-accent">
            {saving?'Guardando...':'💾 Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
