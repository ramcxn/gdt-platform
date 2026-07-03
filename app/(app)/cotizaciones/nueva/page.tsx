/* eslint-disable */
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NuevaCotizacionPage() {
  const supabase = createClient()
  const router = useRouter()
  const [empresaId, setEmpresaId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [clientes, setClientes] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    cliente_nombre: '', cliente_id: '',
    origen: '', destino: '', tipo_carga: '', peso_ton: '',
    distancia_km: '', tarifa_base: '', casetas: '0',
    diesel: '0', maniobras: '0', otros_costos: '0',
    vigencia_dias: '15', estado: 'Borrador', notas: '',
  })

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user ?? null
      if (!user) return
      setUserId(user.id)
      const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user.id).single()
      if (!perfil?.empresa_id) return
      setEmpresaId(perfil.empresa_id)
      const { data: cli } = await supabase.from('clientes_ctpat').select('id, nombre').eq('empresa_id', perfil.empresa_id).eq('activo', true).order('nombre')
      setClientes(cli ?? [])
    }
    init()
  }, [])

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const total = [form.tarifa_base, form.casetas, form.diesel, form.maniobras, form.otros_costos]
    .reduce((s, v) => s + (parseFloat(v) || 0), 0)

  const genFolio = () => {
    const d = new Date()
    return `COT-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*9000)+1000}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresaId || !userId) return
    setSaving(true); setError('')
    const { error: err } = await supabase.from('cotizaciones').insert([{
      empresa_id: empresaId,
      folio: genFolio(),
      cliente_nombre: form.cliente_nombre,
      cliente_id: form.cliente_id || null,
      origen: form.origen || null,
      destino: form.destino || null,
      tipo_carga: form.tipo_carga || null,
      peso_ton: parseFloat(form.peso_ton) || null,
      distancia_km: parseInt(form.distancia_km) || null,
      tarifa_base: parseFloat(form.tarifa_base) || 0,
      casetas: parseFloat(form.casetas) || 0,
      diesel: parseFloat(form.diesel) || 0,
      maniobras: parseFloat(form.maniobras) || 0,
      otros_costos: parseFloat(form.otros_costos) || 0,
      total,
      vigencia_dias: parseInt(form.vigencia_dias) || 15,
      estado: form.estado,
      notas: form.notas || null,
      creado_por: userId,
    }])
    setSaving(false)
    if (err) { setError(err.message); return }
    router.push('/cotizaciones')
  }

  const inp = (cls = '') =>
    `w-full px-3 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600 ${cls}`

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1E3A5F,#2E6DA4)' }}>💰</div>
        <div>
          <h1 className="text-xl font-bold text-white">Nueva Cotización</h1>
          <p className="text-slate-400 text-sm">Genera una propuesta de servicio</p>
        </div>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

      <div className="glass-card rounded-xl border border-white/5 p-5 space-y-4" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <h2 className="text-white font-semibold">Cliente y Ruta</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Cliente <span className="text-red-400">*</span></label>
            <input type="text" value={form.cliente_nombre} onChange={e => set('cliente_nombre', e.target.value)} required placeholder="Nombre del cliente" className={inp()} list="clientes-list" />
            <datalist id="clientes-list">
              {clientes.map(c => <option key={c.id} value={c.nombre} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Tipo de carga</label>
            <input type="text" value={form.tipo_carga} onChange={e => set('tipo_carga', e.target.value)} placeholder="Electrónico, Alimentos, General..." className={inp()} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Origen</label>
            <input type="text" value={form.origen} onChange={e => set('origen', e.target.value)} placeholder="Ciudad / Terminal de origen" className={inp()} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Destino</label>
            <input type="text" value={form.destino} onChange={e => set('destino', e.target.value)} placeholder="Ciudad / Terminal de destino" className={inp()} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Distancia (km)</label>
            <input type="number" value={form.distancia_km} onChange={e => set('distancia_km', e.target.value)} placeholder="0" min="0" className={inp()} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Peso (ton)</label>
            <input type="number" value={form.peso_ton} onChange={e => set('peso_ton', e.target.value)} placeholder="0.00" step="0.01" min="0" className={inp()} />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl border border-white/5 p-5 space-y-4" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <h2 className="text-white font-semibold">Desglose de Costos</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Tarifa base', k: 'tarifa_base', required: true },
            { label: 'Casetas', k: 'casetas' },
            { label: 'Diesel', k: 'diesel' },
            { label: 'Maniobras', k: 'maniobras' },
            { label: 'Otros costos', k: 'otros_costos' },
          ].map(f => (
            <div key={f.k}>
              <label className="block text-sm text-slate-300 mb-1">{f.label}{f.required && <span className="text-red-400 ml-1">*</span>}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                <input type="number" value={(form as any)[f.k]} onChange={e => set(f.k, e.target.value)}
                  step="0.01" min="0" placeholder="0.00" required={f.required}
                  className={inp('pl-7')} />
              </div>
            </div>
          ))}
          <div className="rounded-lg p-3 border border-blue-500/30 flex flex-col justify-center" style={{ background: 'rgba(30,58,95,0.4)' }}>
            <p className="text-xs text-slate-400">Total</p>
            <p className="text-2xl font-bold text-white">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl border border-white/5 p-5 space-y-4" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <h2 className="text-white font-semibold">Condiciones</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Vigencia (días)</label>
            <input type="number" value={form.vigencia_dias} onChange={e => set('vigencia_dias', e.target.value)} min="1" max="90" className={inp()} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Estado inicial</label>
            <select value={form.estado} onChange={e => set('estado', e.target.value)} className={inp()}>
              <option value="Borrador">Borrador</option>
              <option value="Enviada">Enviada</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Notas / condiciones adicionales</label>
          <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={3}
            placeholder="Condiciones de pago, observaciones especiales..."
            className="w-full px-3 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600 resize-none" />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#1E3A5F,#2E6DA4)' }}>
          {saving ? 'Guardando...' : '✓ Crear Cotización'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2.5 rounded-lg text-slate-400 border border-white/10 text-sm hover:text-white">
          Cancelar
        </button>
      </div>
    </form>
  )
}
