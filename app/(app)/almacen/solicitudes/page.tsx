import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft, CheckCircle, ClipboardList, Clock, Plus, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/supabase/server-utils'
import { createWarehouseRequest, updateWarehouseRequestState } from '../actions'

export default async function WarehouseRequestsPage() {
  const supabase = await createClient()
  const { empresaId } = await getSessionContext()
  if (!empresaId) return null

  const [{ data: solicitudes }, { data: refacciones }, { data: unidades }] = await Promise.all([
    supabase.from('solicitudes_refacciones').select('*, detalle_solicitudes_refacciones(*, refacciones(numero_parte, descripcion))').eq('empresa_id', empresaId).order('created_at', { ascending: false }),
    supabase.from('refacciones').select('*').eq('empresa_id', empresaId).eq('activa', true).order('numero_parte'),
    supabase.from('tractos').select('id, numero, placas').eq('empresa_id', empresaId).eq('activo', true).order('numero'),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/almacen" className="text-slate-500 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center btn-accent"><ClipboardList className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-bold text-white">Solicitudes de Refacciones</h1><p className="text-slate-400 text-sm">Peticiones por unidad, prioridad y fecha requerida.</p></div>
      </div>

      <form action={createWarehouseRequest} className="glass-card rounded-xl border border-white/5 p-5 grid grid-cols-1 md:grid-cols-3 gap-4" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <div className="md:col-span-3 flex items-center gap-2 text-white font-semibold"><Plus className="w-4 h-4 text-blue-300" /> Nueva solicitud</div>
        <Select name="unidad" label="Unidad">
          <option value="">Sin unidad</option>
          {(unidades ?? []).map((u: any) => <option key={u.id} value={u.numero}>{u.numero} - {u.placas}</option>)}
        </Select>
        <Select name="prioridad" label="Prioridad"><option value="normal">Normal</option><option value="alta">Alta</option><option value="urgente">Urgente</option><option value="baja">Baja</option></Select>
        <Field name="fecha_requerida" label="Fecha requerida" type="date" />
        {[0, 1, 2].map(index => (
          <div key={index} className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <Select name={`refaccion_${index}`} label={`Refaccion ${index + 1}`}>
                <option value="">Seleccionar...</option>
                {(refacciones ?? []).map((r: any) => <option key={r.id} value={r.id}>{r.numero_parte} - {r.descripcion}</option>)}
              </Select>
            </div>
            <Field name={`cantidad_${index}`} label="Cantidad" type="number" defaultValue={index === 0 ? '1' : ''} />
          </div>
        ))}
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Observaciones</label>
          <textarea name="observaciones" rows={2} className={inputClass} />
        </div>
        <div className="md:col-span-3"><button className="px-4 py-2 rounded-lg text-white text-sm font-semibold btn-accent">Crear solicitud</button></div>
      </form>

      <div className="space-y-4">
        {(solicitudes ?? []).map((s: any) => (
          <div key={s.id} className="glass-card rounded-xl border border-white/5 p-5" style={{ background: 'rgba(15,31,53,0.7)' }}>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-white font-bold">{s.folio}</p>
                  <StatusBadge estado={s.estado} />
                  <PriorityBadge prioridad={s.prioridad} />
                </div>
                <p className="text-slate-400 text-sm mt-1">Unidad {s.unidad || '—'} · requerida {s.fecha_requerida ? new Date(s.fecha_requerida).toLocaleDateString('es-MX') : 'sin fecha'}</p>
                <div className="mt-3 space-y-1 text-sm text-slate-300">
                  {(s.detalle_solicitudes_refacciones ?? []).map((d: any) => (
                    <p key={d.id}>{d.cantidad_solicitada} x {d.refacciones?.numero_parte} - <span className="text-slate-500">{d.refacciones?.descripcion}</span></p>
                  ))}
                </div>
                {s.observaciones && <p className="text-slate-500 text-sm mt-3">{s.observaciones}</p>}
              </div>
              <form action={updateWarehouseRequestState} className="flex gap-2">
                <input type="hidden" name="solicitud_id" value={s.id} />
                <select name="estado" defaultValue={s.estado} className={inputClass}>
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="en_picking">En picking</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
                <button className="px-3 py-2 rounded-lg border border-white/10 text-slate-200 text-sm hover:bg-white/5">Actualizar</button>
              </form>
            </div>
          </div>
        ))}
        {!solicitudes?.length && <div className="text-slate-500 text-sm">No hay solicitudes registradas.</div>}
      </div>
    </div>
  )
}

function StatusBadge({ estado }: { estado: string }) {
  const icon = estado === 'completada' ? <CheckCircle className="w-3 h-3" /> : estado === 'cancelada' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />
  const color = estado === 'completada' ? 'green' : estado === 'cancelada' ? 'red' : estado === 'aprobada' ? 'blue' : 'amber'
  return <Badge color={color as any}>{icon}{String(estado).replace('_', ' ').toUpperCase()}</Badge>
}

function PriorityBadge({ prioridad }: { prioridad: string }) {
  const color = prioridad === 'urgente' ? 'red' : prioridad === 'alta' ? 'amber' : 'slate'
  return <Badge color={color as any}>{String(prioridad).toUpperCase()}</Badge>
}

function Badge({ color, children }: { color: 'green' | 'red' | 'amber' | 'blue' | 'slate'; children: ReactNode }) {
  const cls = {
    green: 'bg-green-500/10 text-green-300 border-green-500/20',
    red: 'bg-red-500/10 text-red-300 border-red-500/20',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    slate: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  }[color]
  return <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cls}`}>{children}</span>
}

function Field(props: any) {
  const { label, ...inputProps } = props
  return <div><label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label><input {...inputProps} className={inputClass} /></div>
}

function Select({ label, children, ...props }: any) {
  return <div><label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label><select {...props} className={inputClass}>{children}</select></div>
}

const inputClass = 'w-full px-3 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600'
