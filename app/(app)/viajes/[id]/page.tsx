/* eslint-disable */
'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const ESTADO_CONFIG: Record<string, { label: string; cls: string }> = {
  Programado:  { label: 'Programado',  cls: 'bg-slate-500/10 text-slate-300 border-slate-500/20' },
  En_Transito: { label: 'En Tránsito', cls: 'bg-blue-500/10  text-blue-400  border-blue-500/20'  },
  Completado:  { label: 'Completado',  cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
  Cancelado:   { label: 'Cancelado',   cls: 'bg-red-500/10   text-red-400   border-red-500/20'   },
}

export default function ViajeDetallePage() {
  const params  = useParams()
  const router  = useRouter()
  const supabase = createClient()
  const [viaje, setViaje]         = useState<any>(null)
  const [loading, setLoading]     = useState(true)
  const [deleting, setDeleting]   = useState(false)
  const [updating, setUpdating]   = useState(false)
  const [showDel, setShowDel]     = useState(false)

  useEffect(() => {
    supabase.from('viajes').select('*').eq('id', params.id as string).single()
      .then(({ data }) => { setViaje(data); setLoading(false) })
  }, [params.id])

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('viajes').delete().eq('id', params.id as string)
    router.push('/viajes')
  }

  async function cambiarEstado(estado: string) {
    setUpdating(true)
    const extra: any = {}
    if (estado === 'Completado') extra.fecha_llegada_real = new Date().toISOString()
    await supabase.from('viajes').update({ estado, ...extra }).eq('id', params.id as string)
    setViaje((v: any) => ({ ...v, estado, ...extra }))
    setUpdating(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Cargando...</div>
  if (!viaje)  return <div className="flex items-center justify-center h-64 text-slate-400">Viaje no encontrado.</div>

  const cfg = ESTADO_CONFIG[viaje.estado] ?? ESTADO_CONFIG.Programado

  const Row = ({ label, val }: { label: string; val?: string | null }) =>
    val ? (
      <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm text-slate-200 font-medium text-right max-w-[60%]">{val}</span>
      </div>
    ) : null

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/viajes" className="text-slate-500 hover:text-slate-200 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-white">Viaje — {viaje.tracto_numero || 'Sin tracto'}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>{cfg.label}</span>
          </div>
          {viaje.origen && viaje.destino && (
            <p className="text-slate-400 text-sm mt-0.5">{viaje.origen} → {viaje.destino}</p>
          )}
        </div>
        <button onClick={() => setShowDel(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors cursor-pointer">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Eliminar
        </button>
      </div>

      {/* Cambiar estado */}
      <div className="glass-card rounded-xl border border-white/5 p-4" style={{background:'rgba(15,31,53,0.7)'}}>
        <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wide">Actualizar estado</p>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(ESTADO_CONFIG).map(([k, v]) => (
            <button key={k} onClick={() => cambiarEstado(k)} disabled={viaje.estado === k || updating}
              className={`py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${v.cls} ${viaje.estado === k ? 'opacity-100 ring-1 ring-white/20' : 'opacity-40 hover:opacity-80'}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="glass-card rounded-xl border border-white/5 p-5" style={{background:'rgba(15,31,53,0.7)'}}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">🚛 Unidad</p>
          <Row label="Tracto"       val={viaje.tracto_numero} />
          <Row label="Operador"     val={viaje.operador_nombre} />
          <Row label="Remolque 1"   val={viaje.remolque1_numero} />
          <Row label="Remolque 2"   val={viaje.remolque2_numero} />
        </div>
        <div className="glass-card rounded-xl border border-white/5 p-5" style={{background:'rgba(15,31,53,0.7)'}}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">📍 Ruta</p>
          <Row label="Cliente"      val={viaje.cliente} />
          <Row label="Origen"       val={viaje.origen} />
          <Row label="Destino"      val={viaje.destino} />
          <Row label="Distancia"    val={viaje.distancia_km ? `${viaje.distancia_km.toLocaleString()} km` : null} />
          <Row label="Tipo de carga" val={viaje.tipo_carga} />
        </div>
        <div className="glass-card rounded-xl border border-white/5 p-5" style={{background:'rgba(15,31,53,0.7)'}}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">📅 Fechas</p>
          <Row label="Salida"         val={viaje.fecha_salida ? new Date(viaje.fecha_salida).toLocaleString('es-MX') : null} />
          <Row label="Llegada est."   val={viaje.fecha_llegada_estimada ? new Date(viaje.fecha_llegada_estimada).toLocaleString('es-MX') : null} />
          <Row label="Llegada real"   val={viaje.fecha_llegada_real ? new Date(viaje.fecha_llegada_real).toLocaleString('es-MX') : null} />
          <Row label="Registrado"     val={new Date(viaje.created_at).toLocaleString('es-MX')} />
        </div>
        {viaje.notas && (
          <div className="glass-card rounded-xl border border-white/5 p-5" style={{background:'rgba(15,31,53,0.7)'}}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">📝 Notas</p>
            <p className="text-sm text-slate-300 leading-relaxed">{viaje.notas}</p>
          </div>
        )}
      </div>

      {/* Confirm delete modal */}
      {showDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#112240] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">¿Eliminar viaje?</h3>
            <p className="text-slate-400 text-sm mb-5">Esta acción no se puede deshacer. El viaje será eliminado permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDel(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-300 text-sm hover:bg-white/5 transition-colors cursor-pointer">Cancelar</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50">
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
