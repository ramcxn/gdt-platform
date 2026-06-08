/* eslint-disable */
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const ESTADOS = ['Programado', 'En_Transito', 'Completado', 'Cancelado'] as const

export default function NuevoViajePage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [empresaId, setEmpresaId] = useState('')
  const [tractos,    setTractos]    = useState<any[]>([])
  const [operadores, setOperadores] = useState<any[]>([])
  const [remolques,  setRemolques]  = useState<any[]>([])

  const [form, setForm] = useState({
    tracto_id: '', tracto_numero: '',
    operador_id: '', operador_nombre: '',
    remolque1_numero: '', remolque2_numero: '',
    cliente: '', origen: '', destino: '',
    distancia_km: '', tipo_carga: '',
    fecha_salida: '', fecha_llegada_estimada: '',
    estado: 'Programado' as typeof ESTADOS[number],
    notas: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: p } = await supabase.from('usuarios').select('empresa_id').eq('id', user.id).single()
      if (!p?.empresa_id) return
      setEmpresaId(p.empresa_id)
      const [{ data: t }, { data: o }, { data: r }] = await Promise.all([
        supabase.from('tractos').select('*').eq('empresa_id', p.empresa_id).eq('activo', true).order('numero'),
        supabase.from('operadores').select('*').eq('empresa_id', p.empresa_id).eq('activo', true).order('nombre'),
        supabase.from('remolques').select('*').eq('empresa_id', p.empresa_id).eq('activo', true).order('numero'),
      ])
      setTractos(t ?? [])
      setOperadores(o ?? [])
      setRemolques(r ?? [])
    })
  }, [])

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('viajes').insert([{
      empresa_id:             empresaId,
      tracto_id:              form.tracto_id || null,
      tracto_numero:          form.tracto_numero,
      operador_id:            form.operador_id || null,
      operador_nombre:        form.operador_nombre,
      remolque1_numero:       form.remolque1_numero || null,
      remolque2_numero:       form.remolque2_numero || null,
      cliente:                form.cliente,
      origen:                 form.origen,
      destino:                form.destino,
      distancia_km:           form.distancia_km ? parseInt(form.distancia_km) : null,
      tipo_carga:             form.tipo_carga,
      fecha_salida:           form.fecha_salida || null,
      fecha_llegada_estimada: form.fecha_llegada_estimada || null,
      estado:                 form.estado,
      notas:                  form.notas,
      creado_por:             user?.id,
    }])
    if (err) { setError(err.message); setSaving(false) }
    else router.push('/viajes')
  }

  const inputCls = "w-full px-3 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-600"
  const selectCls = `${inputCls} cursor-pointer`
  const labelCls = "block text-xs font-medium text-slate-400 mb-1.5"

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/viajes" className="text-slate-500 hover:text-slate-200 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Nuevo Viaje</h1>
          <p className="text-slate-400 text-sm">Registra una nueva operación de transporte</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Unidad y operador */}
        <Section title="🚛 Unidad y Operador">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tracto *</label>
              <select required className={selectCls}
                value={form.tracto_id}
                onChange={e => { const t = tractos.find(x => x.id === e.target.value); set('tracto_id', e.target.value); set('tracto_numero', t?.numero ?? '') }}>
                <option value="">Seleccionar...</option>
                {tractos.map(t => <option key={t.id} value={t.id}>{t.numero} — {t.placas}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Operador *</label>
              <select required className={selectCls}
                value={form.operador_id}
                onChange={e => { const o = operadores.find(x => x.id === e.target.value); set('operador_id', e.target.value); set('operador_nombre', o?.nombre ?? '') }}>
                <option value="">Seleccionar...</option>
                {operadores.map(o => <option key={o.id} value={o.id}>{o.nombre.split(' ').slice(0,3).join(' ')}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Remolque 1</label>
              <select className={selectCls} value={form.remolque1_numero}
                onChange={e => { const r = remolques.find(x => x.id === e.target.value); set('remolque1_numero', r?.numero ?? '') }}>
                <option value="">Sin remolque</option>
                {remolques.map(r => <option key={r.id} value={r.id}>{r.numero} — {r.tipo}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Remolque 2</label>
              <select className={selectCls} value={form.remolque2_numero}
                onChange={e => { const r = remolques.find(x => x.id === e.target.value); set('remolque2_numero', r?.numero ?? '') }}>
                <option value="">Sin remolque</option>
                {remolques.map(r => <option key={r.id} value={r.id}>{r.numero} — {r.tipo}</option>)}
              </select>
            </div>
          </div>
        </Section>

        {/* Ruta */}
        <Section title="📍 Ruta y Cliente">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Cliente</label>
              <input className={inputCls} value={form.cliente} onChange={e => set('cliente', e.target.value)} placeholder="CEMEX, TERNIUM..." />
            </div>
            <div>
              <label className={labelCls}>Origen *</label>
              <input required className={inputCls} value={form.origen} onChange={e => set('origen', e.target.value)} placeholder="Monterrey NL" />
            </div>
            <div>
              <label className={labelCls}>Destino *</label>
              <input required className={inputCls} value={form.destino} onChange={e => set('destino', e.target.value)} placeholder="CDMX" />
            </div>
            <div>
              <label className={labelCls}>Distancia (km)</label>
              <input type="number" className={inputCls} value={form.distancia_km} onChange={e => set('distancia_km', e.target.value)} placeholder="900" />
            </div>
            <div>
              <label className={labelCls}>Tipo de carga</label>
              <input className={inputCls} value={form.tipo_carga} onChange={e => set('tipo_carga', e.target.value)} placeholder="Granel, Cargado, Vacío..." />
            </div>
          </div>
        </Section>

        {/* Fechas y estado */}
        <Section title="📅 Fechas y Estado">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Fecha de salida</label>
              <input type="datetime-local" className={inputCls} value={form.fecha_salida} onChange={e => set('fecha_salida', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Llegada estimada</label>
              <input type="datetime-local" className={inputCls} value={form.fecha_llegada_estimada} onChange={e => set('fecha_llegada_estimada', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Estado inicial</label>
              <div className="grid grid-cols-4 gap-2">
                {ESTADOS.map(e => {
                  const colors: Record<string, string> = {
                    Programado:  'border-slate-500/40 text-slate-300 data-[active=true]:bg-slate-500/20 data-[active=true]:border-slate-400',
                    En_Transito: 'border-blue-500/40  text-blue-300  data-[active=true]:bg-blue-500/20  data-[active=true]:border-blue-400',
                    Completado:  'border-green-500/40 text-green-300 data-[active=true]:bg-green-500/20 data-[active=true]:border-green-400',
                    Cancelado:   'border-red-500/40   text-red-300   data-[active=true]:bg-red-500/20   data-[active=true]:border-red-400',
                  }
                  const labels: Record<string, string> = { Programado: 'Programado', En_Transito: 'En Tránsito', Completado: 'Completado', Cancelado: 'Cancelado' }
                  const isActive = form.estado === e
                  return (
                    <button key={e} type="button" onClick={() => set('estado', e)}
                      className={`py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${colors[e]} ${isActive ? 'ring-1 ring-offset-0' : 'opacity-60 hover:opacity-90'}`}>
                      {labels[e]}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </Section>

        {/* Notas */}
        <Section title="📝 Notas">
          <textarea className={`${inputCls} resize-none`} rows={3}
            value={form.notas} onChange={e => set('notas', e.target.value)}
            placeholder="Instrucciones especiales, condiciones del viaje..." />
        </Section>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        <div className="flex justify-between pt-2">
          <Link href="/viajes" className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">← Cancelar</Link>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 cursor-pointer shadow transition-transform hover:scale-105"
            style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>
            {saving ? 'Guardando...' : '🗺️ Registrar Viaje'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl border border-white/5 p-5 space-y-4" style={{background:'rgba(15,31,53,0.7)'}}>
      <h2 className="text-sm font-semibold text-slate-300">{title}</h2>
      {children}
    </div>
  )
}
