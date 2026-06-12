/* eslint-disable */
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CotizacionActions from './CotizacionActions'

function Badge({ text, color }: { text: string; color: string }) {
  const c: Record<string,string> = { green:'bg-green-500/10 text-green-400 border-green-500/20', amber:'bg-amber-500/10 text-amber-400 border-amber-500/20', blue:'bg-blue-500/10 text-blue-400 border-blue-500/20', red:'bg-red-500/10 text-red-400 border-red-500/20', slate:'bg-slate-500/10 text-slate-300 border-slate-500/20' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c[color]??c.slate}`}>{text}</span>
}
const estadoColor: Record<string,string> = { Borrador:'slate', Enviada:'blue', Aceptada:'green', Rechazada:'red', Vencida:'amber' }

export default async function CotizacionDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: cot } = await supabase.from('cotizaciones').select('*').eq('id', params.id).single()
  if (!cot) notFound()

  const vigenciaDate = new Date(cot.created_at)
  vigenciaDate.setDate(vigenciaDate.getDate() + (cot.vigencia_dias ?? 15))

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/cotizaciones" className="text-slate-400 hover:text-white text-sm">← Cotizaciones</Link>
        <h1 className="text-xl font-bold text-white">{cot.folio}</h1>
        <Badge text={cot.estado} color={estadoColor[cot.estado] ?? 'slate'} />
      </div>

      {/* Resumen */}
      <div className="glass-card rounded-xl border border-white/5 p-5 space-y-4" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-slate-500">Cliente</p><p className="text-white font-semibold mt-0.5">{cot.cliente_nombre}</p></div>
          <div><p className="text-xs text-slate-500">Tipo de carga</p><p className="text-white mt-0.5">{cot.tipo_carga ?? '—'}</p></div>
          <div><p className="text-xs text-slate-500">Origen</p><p className="text-white mt-0.5">{cot.origen ?? '—'}</p></div>
          <div><p className="text-xs text-slate-500">Destino</p><p className="text-white mt-0.5">{cot.destino ?? '—'}</p></div>
          <div><p className="text-xs text-slate-500">Distancia</p><p className="text-white mt-0.5">{cot.distancia_km ? `${cot.distancia_km} km` : '—'}</p></div>
          <div><p className="text-xs text-slate-500">Peso</p><p className="text-white mt-0.5">{cot.peso_ton ? `${cot.peso_ton} ton` : '—'}</p></div>
          <div><p className="text-xs text-slate-500">Creada</p><p className="text-white mt-0.5">{new Date(cot.created_at).toLocaleDateString('es-MX')}</p></div>
          <div><p className="text-xs text-slate-500">Vigencia hasta</p><p className="text-white mt-0.5">{vigenciaDate.toLocaleDateString('es-MX')}</p></div>
        </div>
        {cot.notas && (
          <div className="p-3 bg-white/3 rounded-lg border border-white/5">
            <p className="text-xs text-slate-500 mb-1">Notas</p>
            <p className="text-slate-300 text-sm">{cot.notas}</p>
          </div>
        )}
      </div>

      {/* Desglose de costos */}
      <div className="glass-card rounded-xl border border-white/5 p-5" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <h2 className="text-white font-semibold mb-4">Desglose de Costos</h2>
        <div className="space-y-2">
          {[
            { label: 'Tarifa base', value: cot.tarifa_base },
            { label: 'Casetas', value: cot.casetas },
            { label: 'Diesel', value: cot.diesel },
            { label: 'Maniobras', value: cot.maniobras },
            { label: 'Otros costos', value: cot.otros_costos },
          ].map(item => item.value > 0 && (
            <div key={item.label} className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400 text-sm">{item.label}</span>
              <span className="text-white text-sm">${Number(item.value).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3">
            <span className="text-white font-bold">TOTAL</span>
            <span className="text-2xl font-bold text-white">${Number(cot.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Cambio de estado */}
      <CotizacionActions cotizacion={cot} />
    </div>
  )
}
