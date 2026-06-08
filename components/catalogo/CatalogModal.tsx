/* eslint-disable */
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Save } from 'lucide-react'

type Props = {
  tipo: 'tractos' | 'remolques' | 'dollys' | 'operadores'
  empresaId: string
  item: any | null
  onClose: () => void
  onSaved: () => void
}

export default function CatalogModal({ tipo, empresaId, item, onClose, onSaved }: Props) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form states based on item
  const [numero, setNumero] = useState(item?.numero || '')
  const [placas, setPlacas] = useState(item?.placas || '')
  const [tipoUnidad, setTipoUnidad] = useState(item?.tipo || '')
  
  // Operadores
  const [nombre, setNombre] = useState(item?.nombre || '')
  const [numeroLicencia, setNumeroLicencia] = useState(item?.numero_licencia || '')
  const [vigenciaLicencia, setVigenciaLicencia] = useState(item?.vigencia_licencia || '')

  const [activo, setActivo] = useState(item ? item.activo : true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    let payload: any = { empresa_id: empresaId, activo }

    if (tipo === 'tractos' || tipo === 'remolques') {
      payload = { ...payload, numero, placas, tipo: tipoUnidad }
    } else if (tipo === 'dollys') {
      payload = { ...payload, numero, placas }
    } else if (tipo === 'operadores') {
      payload = { ...payload, nombre, numero_licencia: numeroLicencia, vigencia_licencia: vigenciaLicencia || null }
    }

    if (item) {
      // Update
      const { error: err } = await supabase.from(tipo).update(payload).eq('id', item.id)
      if (err) setError(err.message)
      else { onSaved(); onClose() }
    } else {
      // Insert
      const { error: err } = await supabase.from(tipo).insert([payload])
      if (err) setError(err.message)
      else { onSaved(); onClose() }
    }
    
    setSaving(false)
  }

  const inputCls = "w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-[#0f1f35] text-white"
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#112240] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white capitalize">
            {item ? 'Editar' : 'Nuevo'} {tipo.slice(0, -1)}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {(tipo === 'tractos' || tipo === 'remolques' || tipo === 'dollys') && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Número Económico *</label>
                <input required className={inputCls} value={numero} onChange={e => setNumero(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Placas</label>
                <input className={inputCls} value={placas} onChange={e => setPlacas(e.target.value)} />
              </div>
            </>
          )}

          {(tipo === 'tractos' || tipo === 'remolques') && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tipo de {tipo === 'tractos' ? 'Tracto' : 'Remolque'}</label>
              <input className={inputCls} value={tipoUnidad} onChange={e => setTipoUnidad(e.target.value)} />
            </div>
          )}

          {tipo === 'operadores' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nombre Completo *</label>
                <input required className={inputCls} value={nombre} onChange={e => setNombre(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">No. Licencia</label>
                <input className={inputCls} value={numeroLicencia} onChange={e => setNumeroLicencia(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Vigencia Licencia</label>
                <input type="date" className={inputCls} value={vigenciaLicencia} onChange={e => setVigenciaLicencia(e.target.value)} />
              </div>
            </>
          )}

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="activo" checked={activo} onChange={e => setActivo(e.target.checked)} className="rounded" />
            <label htmlFor="activo" className="text-sm text-slate-300 cursor-pointer">Activo</label>
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
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer transition-transform hover:scale-105 disabled:opacity-50" style={{background:'linear-gradient(135deg,#1E3A5F,#2E6DA4)'}}>
              {saving ? 'Guardando...' : <><Save className="w-4 h-4" /> Guardar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
