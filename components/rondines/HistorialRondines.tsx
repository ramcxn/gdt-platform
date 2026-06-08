/* eslint-disable */
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function HistorialRondines() {
  const supabase = createClient()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user.id).single()
    if (!perfil?.empresa_id) return

    // Obtenemos los rondines
    const { data: rondines } = await supabase
      .from('rondines')
      .select('*, rondines_visitas(incidente, id)')
      .eq('empresa_id', perfil.empresa_id)
      .order('inicio', { ascending: false })
      .limit(20)

    // Agregamos total de incidentes y visitas a la data
    const formatted = (rondines || []).map(r => {
      const incidentes = r.rondines_visitas.filter((v: any) => v.incidente).length
      return {
        ...r,
        visitas_count: r.rondines_visitas.length,
        incidentes_count: incidentes
      }
    })

    setData(formatted)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="glass-card rounded-xl border border-white/5 p-8 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
      <div className="p-5 border-b border-white/5">
        <h2 className="text-lg font-bold text-white">Historial de Rondines</h2>
      </div>

      <div className="divide-y divide-white/5">
        {data.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No hay rondines registrados aún.
          </div>
        ) : (
          data.map(rondin => (
            <div key={rondin.id} className="p-5 hover:bg-white/5 transition-colors flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white">{rondin.numero}</span>
                  {rondin.estado === 'en_progreso' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      En Progreso
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Completado
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400">
                  {new Date(rondin.inicio).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  {rondin.fin && ` - ${new Date(rondin.fin).toLocaleTimeString([], { timeStyle: 'short' })}`}
                </p>
                <div className="flex gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Zonas: {rondin.visitas_count}
                  </span>
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${rondin.incidentes_count > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                    <AlertCircle className={`w-4 h-4 ${rondin.incidentes_count > 0 ? 'text-red-400' : 'text-slate-400'}`} />
                    Incidentes: {rondin.incidentes_count}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
