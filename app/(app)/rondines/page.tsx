import { Shield, Download } from 'lucide-react'
import RondinActivo from '@/components/rondines/RondinActivo'
import HistorialRondines from '@/components/rondines/HistorialRondines'

export default function RondinesPage() {
  return (
    <div className="flex flex-col h-full space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            Rondines de Seguridad
          </h1>
          <p className="text-slate-400 text-sm mt-1">Escanea zonas con código QR para registrar la patrulla</p>
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <Download className="w-4 h-4" />
          <span>Reporte</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex flex-col gap-6">
        <RondinActivo />
        <HistorialRondines />
      </div>
    </div>
  )
}
