/* eslint-disable */
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ESTADOS = ['Borrador', 'Enviada', 'Aceptada', 'Rechazada', 'Vencida']

export default function CotizacionActions({ cotizacion }: { cotizacion: any }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const cambiarEstado = async (estado: string) => {
    setLoading(true); setMsg('')
    const { error } = await supabase.from('cotizaciones').update({ estado }).eq('id', cotizacion.id)
    setLoading(false)
    if (error) setMsg('Error: ' + error.message)
    else { setMsg('✓ Estado actualizado'); router.refresh() }
  }

  return (
    <div className="glass-card rounded-xl border border-white/5 p-5 space-y-3" style={{ background: 'rgba(15,31,53,0.7)' }}>
      <h2 className="text-white font-semibold">Cambiar Estado</h2>
      {msg && <p className={`text-sm ${msg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{msg}</p>}
      <div className="flex flex-wrap gap-2">
        {ESTADOS.filter(e => e !== cotizacion.estado).map(estado => (
          <button key={estado} onClick={() => cambiarEstado(estado)} disabled={loading}
            className="px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:text-white hover:border-blue-500/50 transition-colors disabled:opacity-50">
            → {estado}
          </button>
        ))}
      </div>
    </div>
  )
}
