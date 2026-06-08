/* eslint-disable */
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, Play, Square, QrCode, Loader2, Shield } from 'lucide-react'
import ScannerQRModal from './ScannerQRModal'

export default function RondinActivo() {
  const supabase = createClient()
  const [empresaId, setEmpresaId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [rondin, setRondin] = useState<any>(null)
  const [visitas, setVisitas] = useState<any[]>([])
  const [totalZonas, setTotalZonas] = useState(0)
  
  const [loading, setLoading] = useState(true)
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  // Stats
  const [rondinesHoy, setRondinesHoy] = useState(0)
  const [rondinesTotal, setRondinesTotal] = useState(0)

  useEffect(() => {
    fetchState()
  }, [])

  async function fetchState() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user.id).single()
    if (!perfil?.empresa_id) return
    setEmpresaId(perfil.empresa_id)

    // 1. Obtener rondín en progreso
    const { data: enProgreso } = await supabase
      .from('rondines')
      .select('*')
      .eq('empresa_id', perfil.empresa_id)
      .eq('estado', 'en_progreso')
      .order('inicio', { ascending: false })
      .limit(1)
      .single()

    setRondin(enProgreso || null)

    // 2. Obtener total de zonas a patrullar
    const { count: zonasCount } = await supabase
      .from('zonas_rondin')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', perfil.empresa_id)
      .eq('activo', true)

    setTotalZonas(zonasCount || 0)

    // 3. Si hay un rondín, obtener sus visitas
    if (enProgreso) {
      const { data: currentVisitas } = await supabase
        .from('rondines_visitas')
        .select('*')
        .eq('rondin_id', enProgreso.id)
      setVisitas(currentVisitas || [])
    }

    // 4. Obtener stats del día
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const { count: hoyCount } = await supabase
      .from('rondines')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', perfil.empresa_id)
      .gte('inicio', startOfDay.toISOString())

    setRondinesHoy(hoyCount || 0)

    const { count: totalCount } = await supabase
      .from('rondines')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', perfil.empresa_id)
      
    setRondinesTotal(totalCount || 0)

    setLoading(false)
  }

  const iniciarRondin = async () => {
    if (!empresaId || !userId) return
    // Generar un número de rondín basado en timestamp
    const numero = `RON-${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}`
    
    await supabase.from('rondines').insert([{
      empresa_id: empresaId,
      numero,
      estado: 'en_progreso',
      registrado_por: userId
    }])
    fetchState()
  }

  const finalizarRondin = async () => {
    if (!rondin) return
    if (!confirm('¿Seguro que deseas finalizar este rondín?')) return
    await supabase.from('rondines').update({ 
      estado: 'completado', 
      fin: new Date().toISOString() 
    }).eq('id', rondin.id)
    fetchState()
  }

  const incidentesCount = visitas.filter(v => v.incidente).length

  if (loading) {
    return (
      <div className="glass-card rounded-xl border border-white/5 p-8 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Status Card */}
        <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
          {rondin ? (
            <div className="p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-full animate-pulse">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      Rondín en Progreso
                    </h2>
                    <p className="text-sm text-slate-400">{rondin.numero}</p>
                  </div>
                </div>
                <button 
                  onClick={finalizarRondin}
                  className="flex items-center gap-2 bg-[#1A365D] hover:bg-[#2A4A7F] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-500/30"
                >
                  <Square className="w-4 h-4" /> Finalizar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Progreso Zonas</p>
                  <p className="text-2xl font-bold text-white">
                    {visitas.length} <span className="text-slate-500 text-lg">/ {totalZonas}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Incidentes</p>
                  <p className={`text-2xl font-bold ${incidentesCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {incidentesCount}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No hay rondín activo</h2>
              <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                Inicia un nuevo patrullaje para registrar el recorrido por las zonas de la instalación.
              </p>
              <button 
                onClick={iniciarRondin}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-transform hover:scale-105"
              >
                <Play className="w-4 h-4 fill-current" /> Iniciar Nuevo Rondín
              </button>
            </div>
          )}
        </div>

        {/* Action Button (Visitar Zona) */}
        {rondin && (
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl text-lg font-bold transition-transform hover:scale-[1.01] shadow-lg shadow-blue-500/20"
          >
            <QrCode className="w-6 h-6" />
            Escanear Código QR de Zona
          </button>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 rounded-xl border border-white/5">
            <p className="text-sm font-medium text-slate-400 mb-1">Rondines Hoy</p>
            <p className="text-2xl font-bold text-white">{rondinesHoy}</p>
          </div>
          <div className="glass-card p-5 rounded-xl border border-white/5">
            <p className="text-sm font-medium text-slate-400 mb-1">Meta Diaria</p>
            <p className="text-2xl font-bold text-white">3</p>
          </div>
          <div className="glass-card p-5 rounded-xl border border-white/5">
            <p className="text-sm font-medium text-slate-400 mb-1">Total Histórico</p>
            <p className="text-2xl font-bold text-white">{rondinesTotal}</p>
          </div>
        </div>
      </div>

      {isScannerOpen && rondin && (
        <ScannerQRModal 
          rondinId={rondin.id}
          empresaId={empresaId!}
          onClose={() => setIsScannerOpen(false)}
          onScanned={fetchState}
        />
      )}
    </>
  )
}
