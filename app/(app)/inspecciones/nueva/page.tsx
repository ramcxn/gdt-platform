'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Tracto, Remolque, Dolly, Operador } from '@/lib/types'
import { Truck, UserCheck, Link as LinkIcon, CheckSquare, AlertTriangle, Sparkles, Leaf, Disc, Wrench, ArrowRightCircle, ArrowLeftCircle, Check, Save } from 'lucide-react'

const CHECKLIST_TRACTO_ITEMS = [
  'Defensa','Motor','Cabina','Piso de la cabina',
  'Tanque de combustible','Mofle / escape','Quinta rueda'
]
const CHECKLIST_REM_ITEMS = [
  'Llantas','Paredes','Piso','Techo','Puertas','Bisagras',
  'Porta sellos de seguridad','Tornillos / Tuercas','Soldadura / Remaches','Inspección agrícola'
]

type Step = 1 | 2 | 3 | 4

export default function NuevaInspeccionPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep]       = useState<Step>(1)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [empresaId, setEmpresaId] = useState<string>('')

  // Catálogos
  const [tractos,    setTractos]    = useState<Tracto[]>([])
  const [remolques,  setRemolques]  = useState<Remolque[]>([])
  const [dollys,     setDollys]     = useState<Dolly[]>([])
  const [operadores, setOperadores] = useState<Operador[]>([])

  // Formulario
  const [form, setForm] = useState({
    tipo_movimiento: 'Entrada' as 'Entrada'|'Salida',
    tracto_id: '', tracto_numero: '', placas_tracto: '', unidad_negocio: '', kilometraje: '',
    operador_id: '', operador_nombre: '', numero_licencia: '', vigencia_licencia: '',
    cliente: '', origen: '', destino: '', procedencia_unidad: false,
    remolque1_id: '', remolque1_numero: '', remolque1_tipo: '', remolque1_placas: '',
    remolque1_status: 'Vacio', remolque1_sello: false, remolque1_num_sello: '',
    remolque2_id: '', remolque2_numero: '', remolque2_tipo: '', remolque2_placas: '',
    remolque2_sello: false,
    dolly_id: '', dolly_numero: '',
    checklist_tracto:    [] as string[],
    checklist_remolques: [] as string[],
    limpieza_unidad: false, fumigacion: false, status_llantas: false,
    danos_fisicos: false, info_mantenimiento: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user.id).single()
      if (!perfil?.empresa_id) return
      setEmpresaId(perfil.empresa_id)
      const [{ data: t }, { data: r }, { data: d }, { data: o }] = await Promise.all([
        supabase.from('tractos').select('*').eq('empresa_id', perfil.empresa_id).eq('activo', true).order('numero'),
        supabase.from('remolques').select('*').eq('empresa_id', perfil.empresa_id).eq('activo', true).order('numero'),
        supabase.from('dollys').select('*').eq('empresa_id', perfil.empresa_id).eq('activo', true).order('numero'),
        supabase.from('operadores').select('*').eq('empresa_id', perfil.empresa_id).eq('activo', true).order('nombre'),
      ])
      setTractos(t ?? [])
      setRemolques(r ?? [])
      setDollys(d ?? [])
      setOperadores(o ?? [])
    })
  }, [supabase])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function set(key: string, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleChecklist(list: 'checklist_tracto' | 'checklist_remolques', item: string) {
    setForm(prev => {
      const current = prev[list] as string[]
      return { ...prev, [list]: current.includes(item) ? current.filter(i => i !== item) : [...current, item] }
    })
  }

  function onTractoSelect(id: string) {
    const t = tractos.find(x => x.id === id)
    set('tracto_id', id)
    set('tracto_numero', t?.numero ?? '')
    set('placas_tracto', t?.placas ?? '')
  }

  function onOperadorSelect(id: string) {
    const o = operadores.find(x => x.id === id)
    set('operador_id', id)
    set('operador_nombre', o?.nombre ?? '')
    set('numero_licencia', o?.numero_licencia ?? '')
    set('vigencia_licencia', o?.vigencia_licencia ?? '')
  }

  function onRemolque1Select(id: string) {
    const r = remolques.find(x => x.id === id)
    set('remolque1_id', id)
    set('remolque1_numero', r?.numero ?? '')
    set('remolque1_tipo', r?.tipo ?? '')
    set('remolque1_placas', r?.placas ?? '')
  }

  function onRemolque2Select(id: string) {
    const r = remolques.find(x => x.id === id)
    set('remolque2_id', id)
    set('remolque2_numero', r?.numero ?? '')
    set('remolque2_tipo', r?.tipo ?? '')
  }

  function onDollySelect(id: string) {
    const d = dollys.find(x => x.id === id)
    set('dolly_id', id)
    set('dolly_numero', d?.numero ?? '')
  }

  async function handleSubmit() {
    if (!empresaId) { setError('Sin empresa asignada'); return }
    setSaving(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      empresa_id: empresaId,
      tipo_movimiento: form.tipo_movimiento,
      fecha: new Date().toISOString(),
      tracto_id: form.tracto_id || null,
      tracto_numero: form.tracto_numero,
      placas_tracto: form.placas_tracto,
      unidad_negocio: form.unidad_negocio,
      kilometraje: form.kilometraje ? parseInt(form.kilometraje) : null,
      operador_id: form.operador_id || null,
      operador_nombre: form.operador_nombre,
      numero_licencia: form.numero_licencia,
      vigencia_licencia: form.vigencia_licencia || null,
      cliente: form.cliente,
      origen: form.origen,
      destino: form.destino,
      procedencia_unidad: form.procedencia_unidad,
      remolque1_id: form.remolque1_id || null,
      remolque1_numero: form.remolque1_numero,
      remolque1_tipo: form.remolque1_tipo,
      remolque1_placas: form.remolque1_placas,
      remolque1_status: form.remolque1_status,
      remolque1_sello: form.remolque1_sello,
      remolque1_num_sello: form.remolque1_num_sello,
      remolque2_id: form.remolque2_id || null,
      remolque2_numero: form.remolque2_numero,
      remolque2_tipo: form.remolque2_tipo,
      remolque2_sello: form.remolque2_sello,
      dolly_id: form.dolly_id || null,
      dolly_numero: form.dolly_numero,
      checklist_tracto: form.checklist_tracto,
      checklist_remolques: form.checklist_remolques,
      limpieza_unidad: form.limpieza_unidad,
      fumigacion: form.fumigacion,
      status_llantas: form.status_llantas,
      danos_fisicos: form.danos_fisicos,
      info_mantenimiento: form.info_mantenimiento,
      registrado_por: user?.id,
    }
    const { error: err } = await supabase.from('inspecciones_ctpat').insert([payload])
    if (err) { setError(err.message); setSaving(false) }
    else router.push('/inspecciones')
  }

  const STEPS = ['Unidad', 'Operador / Ruta', 'Remolques', 'Checklists']
  const inputCls = "w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-[#0f1f35] text-white"
  const selectCls = "w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-[#0f1f35] text-white"
  const focusRing = "focus:ring-blue-500"

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Nueva Inspección CTPAT</h1>
        <p className="text-slate-400 text-sm">Completa los 4 pasos para registrar la inspección</p>
      </div>

      {/* Tipo de movimiento */}
      <div className="glass-card rounded-xl border border-white/5 p-5">
        <p className="text-sm font-semibold text-slate-300 mb-3">Tipo de movimiento</p>
        <div className="grid grid-cols-2 gap-3">
          {(['Entrada', 'Salida'] as const).map(tipo => (
            <button key={tipo} onClick={() => set('tipo_movimiento', tipo)}
              className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all cursor-pointer ${form.tipo_movimiento === tipo
                ? tipo === 'Entrada' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-red-500 bg-red-500/10 text-red-400'
                : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
              <span className="flex items-center justify-center gap-2">
                {tipo === 'Entrada' ? <ArrowRightCircle className="w-4 h-4" /> : <ArrowLeftCircle className="w-4 h-4" />} {tipo}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <button onClick={() => i + 1 <= step && setStep((i + 1) as Step)}
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                i + 1 < step ? 'bg-green-500 text-white' : i + 1 === step ? 'text-white' : 'bg-white/10 text-slate-500'
              }`} style={i + 1 === step ? {background:'#1E3A5F'} : {}}>
              {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
            </button>
            <span className={`text-xs ml-1.5 hidden sm:block ${i + 1 === step ? 'text-white font-medium' : 'text-slate-500'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i + 1 < step ? 'bg-green-400' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {/* STEP 1: Unidad */}
      {step === 1 && (
        <div className="glass-card rounded-xl border border-white/5 p-5 space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2"><Truck className="w-5 h-5 text-blue-400" /> Datos de la unidad</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tracto *</label>
              <select className={`${selectCls} ${focusRing}`} value={form.tracto_id} onChange={e => onTractoSelect(e.target.value)}>
                <option value="">Seleccionar...</option>
                {tractos.map(t => <option key={t.id} value={t.id}>{t.numero} — {t.placas}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Placas</label>
              <input className={`${inputCls} ${focusRing}`} value={form.placas_tracto} onChange={e => set('placas_tracto', e.target.value)} placeholder="000AA0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Unidad de negocio</label>
              <input className={`${inputCls} ${focusRing}`} value={form.unidad_negocio} onChange={e => set('unidad_negocio', e.target.value)} placeholder="Construcción, Granel..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Kilometraje</label>
              <input type="number" className={`${inputCls} ${focusRing}`} value={form.kilometraje} onChange={e => set('kilometraje', e.target.value)} placeholder="48500" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="proc" checked={form.procedencia_unidad} onChange={e => set('procedencia_unidad', e.target.checked)} className="rounded cursor-pointer" />
            <label htmlFor="proc" className="text-sm text-slate-300 cursor-pointer">¿Unidad de procedencia verificada?</label>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={() => setStep(2)} disabled={!form.tracto_id && !form.tracto_numero}
              className="px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-40 cursor-pointer"
              style={{background:'#1E3A5F'}}>
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Operador / Ruta */}
      {step === 2 && (
        <div className="glass-card rounded-xl border border-white/5 p-5 space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2"><UserCheck className="w-5 h-5 text-indigo-400" /> Operador y ruta</h2>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Operador *</label>
            <select className={`${selectCls} ${focusRing}`} value={form.operador_id} onChange={e => onOperadorSelect(e.target.value)}>
              <option value="">Seleccionar operador...</option>
              {operadores.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
          </div>
          {form.operador_id && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-4 py-3 text-xs text-indigo-200 space-y-1">
              <p><b className="text-indigo-300">Licencia:</b> {form.numero_licencia}</p>
              <p><b className="text-indigo-300">Vigencia:</b> {form.vigencia_licencia ? new Date(form.vigencia_licencia).toLocaleDateString('es-MX') : 'No registrada'}
                {form.vigencia_licencia && new Date(form.vigencia_licencia) < new Date() && <span className="ml-2 text-red-400 font-bold flex items-center gap-1 inline-flex"><AlertTriangle className="w-3 h-3" /> VENCIDA</span>}
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Cliente</label>
              <input className={`${inputCls} ${focusRing}`} value={form.cliente} onChange={e => set('cliente', e.target.value)} placeholder="CEMEX, TERNIUM..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Origen</label>
                <input className={`${inputCls} ${focusRing}`} value={form.origen} onChange={e => set('origen', e.target.value)} placeholder="Apodaca NL" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Destino</label>
                <input className={`${inputCls} ${focusRing}`} value={form.destino} onChange={e => set('destino', e.target.value)} placeholder="Saltillo COAH" />
              </div>
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm text-slate-400 hover:text-white cursor-pointer">← Anterior</button>
            <button onClick={() => setStep(3)} className="px-5 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer" style={{background:'#1E3A5F'}}>Siguiente →</button>
          </div>
        </div>
      )}

      {/* STEP 3: Remolques */}
      {step === 3 && (
        <div className="glass-card rounded-xl border border-white/5 p-5 space-y-5">
          <h2 className="font-semibold text-white flex items-center gap-2"><LinkIcon className="w-5 h-5 text-cyan-400" /> Remolques y dolly</h2>
          {/* Remolque 1 */}
          <div className="space-y-3 p-4 bg-white/5 border border-white/5 rounded-lg">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Remolque 1</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Remolque</label>
                <select className={`${selectCls} ${focusRing}`} value={form.remolque1_id} onChange={e => onRemolque1Select(e.target.value)}>
                  <option value="">Sin remolque</option>
                  {remolques.map(r => <option key={r.id} value={r.id}>{r.numero} — {r.tipo}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                <select className={`${selectCls} ${focusRing}`} value={form.remolque1_status} onChange={e => set('remolque1_status', e.target.value)}>
                  <option>Vacio</option><option>Cargado</option><option>Parcial</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="sello1" checked={form.remolque1_sello} onChange={e => set('remolque1_sello', e.target.checked)} className="rounded cursor-pointer" />
              <label htmlFor="sello1" className="text-sm text-slate-300 cursor-pointer">Sello de seguridad colocado</label>
              {form.remolque1_sello && (
                <input className={`flex-1 ${inputCls} ${focusRing}`} value={form.remolque1_num_sello} onChange={e => set('remolque1_num_sello', e.target.value)} placeholder="No. de sello" />
              )}
            </div>
          </div>
          {/* Remolque 2 */}
          <div className="space-y-3 p-4 bg-white/5 border border-white/5 rounded-lg">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Remolque 2 (opcional)</p>
            <select className={`${selectCls} ${focusRing}`} value={form.remolque2_id} onChange={e => onRemolque2Select(e.target.value)}>
              <option value="">Sin segundo remolque</option>
              {remolques.map(r => <option key={r.id} value={r.id}>{r.numero} — {r.tipo}</option>)}
            </select>
            {form.remolque2_id && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="sello2" checked={form.remolque2_sello} onChange={e => set('remolque2_sello', e.target.checked)} className="rounded cursor-pointer" />
                <label htmlFor="sello2" className="text-sm text-slate-300 cursor-pointer">Sello de seguridad</label>
              </div>
            )}
          </div>
          {/* Dolly */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Dolly (opcional)</label>
            <select className={`${selectCls} ${focusRing}`} value={form.dolly_id} onChange={e => onDollySelect(e.target.value)}>
              <option value="">Sin dolly</option>
              {dollys.map(d => <option key={d.id} value={d.id}>{d.numero}</option>)}
            </select>
          </div>
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(2)} className="px-4 py-2 text-sm text-slate-400 hover:text-white cursor-pointer">← Anterior</button>
            <button onClick={() => setStep(4)} className="px-5 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer" style={{background:'#1E3A5F'}}>Siguiente →</button>
          </div>
        </div>
      )}

      {/* STEP 4: Checklists */}
      {step === 4 && (
        <div className="glass-card rounded-xl border border-white/5 p-5 space-y-5">
          <h2 className="font-semibold text-white flex items-center gap-2"><CheckSquare className="w-5 h-5 text-emerald-400" /> Checklists CTPAT</h2>

          {/* Checklist tracto */}
          <div>
            <p className="text-sm font-medium text-slate-300 mb-3">Inspección del tracto</p>
            <div className="grid grid-cols-2 gap-2">
              {CHECKLIST_TRACTO_ITEMS.map(item => (
                <label key={item} className="flex items-center gap-2 p-2.5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                  <input type="checkbox" checked={form.checklist_tracto.includes(item)}
                    onChange={() => toggleChecklist('checklist_tracto', item)} className="rounded" />
                  <span className="text-sm text-slate-300">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Checklist remolques */}
          <div>
            <p className="text-sm font-medium text-slate-300 mb-3">Inspección de remolques</p>
            <div className="grid grid-cols-2 gap-2">
              {CHECKLIST_REM_ITEMS.map(item => (
                <label key={item} className="flex items-center gap-2 p-2.5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                  <input type="checkbox" checked={form.checklist_remolques.includes(item)}
                    onChange={() => toggleChecklist('checklist_remolques', item)} className="rounded" />
                  <span className="text-sm text-slate-300">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Condición general */}
          <div>
            <p className="text-sm font-medium text-slate-300 mb-3">Condición general</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key:'limpieza_unidad', label:'Limpieza', icon: <Sparkles className="w-4 h-4" /> },
                { key:'fumigacion',      label:'Fumigación', icon: <Leaf className="w-4 h-4" /> },
                { key:'status_llantas',  label:'Llantas OK', icon: <Disc className="w-4 h-4" /> },
                { key:'danos_fisicos',   label:'Daños físicos', icon: <AlertTriangle className="w-4 h-4" /> },
              ].map(({ key, label, icon }) => (
                <label key={key} className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  (form as Record<string, unknown>)[key]
                    ? key === 'danos_fisicos' ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-green-500/50 bg-green-500/10 text-green-400'
                    : 'border-white/5 text-slate-400 hover:border-white/20'}`}>
                  <input type="checkbox" checked={!!(form as Record<string, unknown>)[key]} onChange={e => set(key, e.target.checked)} className="rounded" />
                  <span className="text-sm flex items-center gap-1.5">{icon} {label}</span>
                </label>
              ))}
            </div>
            {form.danos_fisicos && (
              <textarea
                className={`mt-3 ${inputCls} ${focusRing}`} rows={2}
                value={form.info_mantenimiento} onChange={e => set('info_mantenimiento', e.target.value)}
                placeholder="Describe los daños observados..."
              />
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(3)} className="px-4 py-2 text-sm text-slate-400 hover:text-white cursor-pointer">← Anterior</button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 cursor-pointer shadow-sm transition-transform hover:scale-105"
              style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>
              {saving ? 'Guardando...' : <><Save className="w-4 h-4" /> Guardar inspección</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
