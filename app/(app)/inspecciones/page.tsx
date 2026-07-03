import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/supabase/server-utils'
import Link from 'next/link'
import { InspeccionCTpat } from '@/lib/types'
import { AlertTriangle, Lock, CheckCircle, ClipboardList } from 'lucide-react'

export default async function InspeccionesPage() {
  const supabase = await createClient()
  const { empresaId: eid } = await getSessionContext()
  if (!eid) return null

  const { data: inspecciones } = await supabase
    .from('inspecciones_ctpat')
    .select('*')
    .eq('empresa_id', eid)
    .order('fecha', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inspecciones CTPAT</h1>
          <p className="text-slate-400 text-sm">{inspecciones?.length ?? 0} registros encontrados</p>
        </div>
        <Link href="/inspecciones/nueva"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-transform hover:scale-105"
          className='btn-accent'>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva inspección
        </Link>
      </div>

      {/* Tabla */}
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Tracto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Operador</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden lg:table-cell">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden lg:table-cell">Ruta</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inspecciones && (inspecciones as InspeccionCTpat[]).map((insp) => (
                <tr key={insp.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${insp.tipo_movimiento === 'Entrada' ? 'bg-green-400/20 text-green-300' : 'bg-red-400/20 text-red-300'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${insp.tipo_movimiento === 'Entrada' ? 'bg-green-500' : 'bg-red-500'}`} />
                      {insp.tipo_movimiento}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/inspecciones/${insp.id}`} className="font-semibold text-blue-400 hover:underline">
                      {insp.tracto_numero}
                    </Link>
                    <div className="text-xs text-slate-400">{insp.placas_tracto}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="text-white max-w-[160px] truncate">{insp.operador_nombre}</div>
                    <div className="text-xs text-slate-400">{insp.numero_licencia}</div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-300 max-w-[140px] truncate">{insp.cliente || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {insp.origen && insp.destino ? (
                      <span className="text-xs text-slate-400">{insp.origen} → {insp.destino}</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {insp.danos_fisicos && <span title="Daños físicos"><AlertTriangle className="w-5 h-5 text-amber-500" /></span>}
                      {insp.remolque1_sello && <span title="Sello verificado"><Lock className="w-5 h-5 text-indigo-400" /></span>}
                      {insp.fumigacion && <span title="Fumigación OK"><CheckCircle className="w-5 h-5 text-green-400" /></span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(insp.fecha).toLocaleDateString('es-MX',{day:'numeric',month:'short'})}
                    <br/>
                    {new Date(insp.fecha).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!inspecciones || inspecciones.length === 0) && (
            <div className="text-center py-16 text-slate-500">
              <div className="flex justify-center mb-3"><ClipboardList className="w-12 h-12 opacity-50" /></div>
              <p className="font-medium text-white">No hay inspecciones registradas</p>
              <Link href="/inspecciones/nueva" className="text-blue-400 text-sm mt-2 inline-block hover:underline">
                Crear la primera inspección →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
