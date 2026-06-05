'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Scanner } from '@yudiel/react-qr-scanner'
import { X, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'

type Props = {
  rondinId: string
  empresaId: string
  onClose: () => void
  onScanned: () => void
}

export default function ScannerQRModal({ rondinId, empresaId, onClose, onScanned }: Props) {
  const supabase = createClient()
  
  const [scannedZona, setScannedZona] = useState<any>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  
  const [incidente, setIncidente] = useState(false)
  const [observaciones, setObservaciones] = useState('')

  const handleScan = async (result: any) => {
    if (!result || !result[0] || scannedZona) return
    const qrText = result[0].rawValue

    // Buscar si el código QR pertenece a una zona de la empresa
    const { data: zona } = await supabase
      .from('zonas_rondin')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('qr_code', qrText)
      .eq('activo', true)
      .single()

    if (zona) {
      setScannedZona(zona)
      setError('')
    } else {
      setError(`Código no reconocido: ${qrText.slice(0, 20)}...`)
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleSave = async () => {
    if (!scannedZona) return
    setSaving(true)
    
    await supabase.from('rondines_visitas').insert([{
      rondin_id: rondinId,
      zona_id: scannedZona.id,
      incidente,
      observaciones
    }])

    onScanned()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#112240] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Escáner de Zonas</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {!scannedZona ? (
            <div className="space-y-4">
              <div className="aspect-square bg-black rounded-xl overflow-hidden relative border border-white/10">
                <Scanner onScan={handleScan} />
                <div className="absolute inset-0 border-2 border-blue-500/50 m-12 rounded-xl pointer-events-none" />
              </div>
              <p className="text-center text-sm text-slate-400">
                Apunta la cámara al código QR de la zona
              </p>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col items-center justify-center text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <CheckCircle2 className="w-12 h-12 text-blue-400 mb-2" />
                <p className="text-sm text-blue-300 font-medium">Zona identificada</p>
                <h3 className="text-2xl font-bold text-white">{scannedZona.nombre}</h3>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={incidente} 
                    onChange={e => setIncidente(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-[#0f1f35] text-red-500 focus:ring-red-500"
                  />
                  <span className={`text-sm font-medium ${incidente ? 'text-red-400' : 'text-slate-300'}`}>
                    {incidente ? 'Sí, hubo un incidente' : 'Registrar incidente o anomalía'}
                  </span>
                </label>
              </div>

              {incidente && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Descripción del incidente *
                  </label>
                  <textarea 
                    rows={3}
                    className="w-full px-3 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Describe qué encontraste..."
                    value={observaciones}
                    onChange={e => setObservaciones(e.target.value)}
                    required
                  />
                  {/* Podría ir un campo de foto aquí en el futuro */}
                  <div className="flex items-center gap-2 text-xs text-amber-400/80 bg-amber-500/10 p-2 rounded">
                    <AlertTriangle className="w-4 h-4" />
                    Este incidente se reportará de inmediato
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button 
                  onClick={() => setScannedZona(null)}
                  className="flex-1 px-4 py-3 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  Escanear otro
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving || (incidente && !observaciones)}
                  className={`flex-1 px-4 py-3 text-sm font-bold text-white rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    incidente ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  } disabled:opacity-50`}
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Visita'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
