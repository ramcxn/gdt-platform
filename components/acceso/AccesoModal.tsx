'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Save } from 'lucide-react'

type Props = {
  empresaId: string
  onClose: () => void
  onSaved: () => void
}

export default function AccesoModal({ empresaId, onClose, onSaved }: Props) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [tipoPersona, setTipoPersona] = useState('Visitante')
  const [nombrePersona, setNombrePersona] = useState('')
  const [identificacion, setIdentificacion] = useState('')
  const [empresaOrigen, setEmpresaOrigen] = useState('')
  const [motivoVisita, setMotivoVisita] = useState('')
  const [observaciones, setObservaciones] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      empresa_id: empresaId,
      tipo_persona: tipoPersona,
      nombre_persona: nombrePersona,
      identificacion,
      empresa_origen: empresaOrigen,
      motivo_visita: motivoVisita,
      observaciones,
      hora_entrada: new Date().toISOString()
    }

    const { error: err } = await supabase.from('bitacora_accesos').insert([payload])
    
    if (err) setError(err.message)
    else { onSaved(); onClose() }
    
    setSaving(false)
  }

  const inputCls = "w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#0f1f35] text-white"
  const selectCls = "w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#0f1f35] text-white"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#112240] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Registrar Entrada
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tipo de Persona *</label>
            <select className={selectCls} value={tipoPersona} onChange={e => setTipoPersona(e.target.value)}>
              <option>Visitante</option>
              <option>Proveedor</option>
              <option>Empleado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nombre Completo *</label>
            <input required className={inputCls} value={nombrePersona} onChange={e => setNombrePersona(e.target.value)} placeholder="Ej. Juan Pérez" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Identificación</label>
              <input className={inputCls} value={identificacion} onChange={e => setIdentificacion(e.target.value)} placeholder="INE, Licencia..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Empresa Origen</label>
              <input className={inputCls} value={empresaOrigen} onChange={e => setEmpresaOrigen(e.target.value)} placeholder="Ej. Coca Cola" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Motivo de Visita</label>
            <input className={inputCls} value={motivoVisita} onChange={e => setMotivoVisita(e.target.value)} placeholder="Ej. Entrega de papelería" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Observaciones</label>
            <textarea className={inputCls} rows={2} value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Opcional..." />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer transition-transform hover:scale-105 disabled:opacity-50 bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Registrando...' : <><Save className="w-4 h-4" /> Registrar Entrada</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
