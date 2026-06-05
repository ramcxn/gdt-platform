import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function InspeccionDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: insp, error } = await supabase
    .from('inspecciones_ctpat')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !insp) notFound()

  const isEntrada = insp.tipo_movimiento === 'Entrada'
  const badge = isEntrada
    ? 'bg-green-500/10 text-green-400 border-green-500/20'
    : 'bg-red-500/10 text-red-400 border-red-500/20'

  const Row = ({ label, value }: { label: string; value?: string | number | boolean | null }) => {
    if (value === null || value === undefined || value === '') return null
    const display = typeof value === 'boolean' ? (value ? '✅ Sí' : '❌ No') : String(value)
    return (
      <div className="flex justify-between py-2.5 border-b border-white/5 last:border-0">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm font-medium text-slate-200 text-right max-w-[60%]">{display}</span>
      </div>
    )
  }

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="glass-card rounded-xl border border-white/5 p-5" style={{background:'rgba(15,31,53,0.6)'}}>
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{title}</h2>
      {children}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link href="/inspecciones" className="text-slate-500 hover:text-slate-200 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-white">Inspección — {insp.tracto_numero}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge}`}>
              {insp.tipo_movimiento}
            </span>
            {insp.danos_fisicos && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/20">
                ⚠️ Daños reportados
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date(insp.fecha).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Card title="🚛 Unidad">
          <Row label="Tracto" value={insp.tracto_numero} />
          <Row label="Placas" value={insp.placas_tracto} />
          <Row label="Unidad de negocio" value={insp.unidad_negocio} />
          <Row label="Kilometraje" value={insp.kilometraje ? `${Number(insp.kilometraje).toLocaleString()} km` : null} />
          <Row label="Procedencia verificada" value={insp.procedencia_unidad} />
        </Card>

        <Card title="👤 Operador">
          <Row label="Nombre" value={insp.operador_nombre} />
          <Row label="Licencia" value={insp.numero_licencia} />
          <Row label="Vigencia" value={insp.vigencia_licencia ? new Date(insp.vigencia_licencia).toLocaleDateString('es-MX') : null} />
          <Row label="Cliente" value={insp.cliente} />
          <Row label="Origen" value={insp.origen} />
          <Row label="Destino" value={insp.destino} />
        </Card>

        <Card title="🔗 Remolques">
          {insp.remolque1_numero ? <>
            <p className="text-xs font-semibold text-blue-400 mb-1">Remolque 1</p>
            <Row label="Número" value={insp.remolque1_numero} />
            <Row label="Tipo" value={insp.remolque1_tipo} />
            <Row label="Status" value={insp.remolque1_status} />
            <Row label="Sello" value={insp.remolque1_sello ? `✅ ${insp.remolque1_num_sello || 'Colocado'}` : '❌ Sin sello'} />
          </> : <p className="text-sm text-slate-500">Sin remolque registrado</p>}
          {insp.remolque2_numero && <>
            <p className="text-xs font-semibold text-blue-400 mt-3 mb-1">Remolque 2</p>
            <Row label="Número" value={insp.remolque2_numero} />
            <Row label="Tipo" value={insp.remolque2_tipo} />
            <Row label="Sello" value={insp.remolque2_sello} />
          </>}
          {insp.dolly_numero && <Row label="Dolly" value={insp.dolly_numero} />}
        </Card>

        <Card title="📋 Condición">
          <Row label="Limpieza unidad" value={insp.limpieza_unidad} />
          <Row label="Fumigación" value={insp.fumigacion} />
          <Row label="Status llantas" value={insp.status_llantas} />
          <Row label="Daños físicos" value={insp.danos_fisicos} />
          {insp.info_mantenimiento && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-xs font-semibold text-amber-400 mb-1">Nota de mantenimiento</p>
              <p className="text-sm text-amber-200">{insp.info_mantenimiento}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Checklists */}
      {((insp.checklist_tracto?.length ?? 0) > 0 || (insp.checklist_remolques?.length ?? 0) > 0) && (
        <div className="glass-card rounded-xl border border-white/5 p-5" style={{background:'rgba(15,31,53,0.6)'}}>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">✅ Checklists CTPAT</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {insp.checklist_tracto?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-300 mb-3">Inspección del tracto</p>
                <div className="space-y-2">
                  {(insp.checklist_tracto as string[]).map((item: string) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {insp.checklist_remolques?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-300 mb-3">Inspección de remolques</p>
                <div className="space-y-2">
                  {(insp.checklist_remolques as string[]).map((item: string) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
