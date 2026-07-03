import Link from 'next/link'
import { ArrowLeft, PackageCheck, Plus, Truck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/supabase/server-utils'
import { receiveWarehousePart } from '../actions'

export default async function WarehouseReceptionPage() {
  const supabase = await createClient()
  const { empresaId } = await getSessionContext()
  if (!empresaId) return null

  const [{ data: refacciones }, { data: ubicaciones }, { data: recepciones }] = await Promise.all([
    supabase.from('refacciones').select('*').eq('empresa_id', empresaId).eq('activa', true).order('numero_parte'),
    supabase.from('ubicaciones_almacen').select('*').eq('empresa_id', empresaId).eq('activa', true).order('codigo'),
    supabase.from('inventario_refacciones').select('*, refacciones(numero_parte, descripcion), ubicaciones_almacen(codigo)').eq('empresa_id', empresaId).order('created_at', { ascending: false }).limit(30),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/almacen" className="text-slate-500 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center btn-accent"><Truck className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-bold text-white">Recepcion de Refacciones</h1><p className="text-slate-400 text-sm">Registra entradas fisicas al inventario.</p></div>
      </div>

      <form action={receiveWarehousePart} className="glass-card rounded-xl border border-white/5 p-5 grid grid-cols-1 md:grid-cols-3 gap-4" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <div className="md:col-span-3 flex items-center gap-2 text-white font-semibold"><Plus className="w-4 h-4 text-blue-300" /> Registrar recepcion</div>
        <Select name="refaccion_id" label="Refaccion" required>
          <option value="">Seleccionar...</option>
          {(refacciones ?? []).map((r: any) => <option key={r.id} value={r.id}>{r.numero_parte} - {r.descripcion}</option>)}
        </Select>
        <Select name="ubicacion_id" label="Ubicacion" required>
          <option value="">Seleccionar...</option>
          {(ubicaciones ?? []).map((u: any) => <option key={u.id} value={u.id}>{u.codigo} - {u.descripcion || u.tipo}</option>)}
        </Select>
        <Field name="fecha_recepcion" label="Fecha recepcion" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
        <Field name="numero_serie" label="Numero de serie" />
        <Field name="lote" label="Lote" />
        <Field name="fecha_caducidad" label="Caducidad" type="date" />
        <Field name="costo_unitario" label="Costo unitario" type="number" step="0.01" defaultValue="0" />
        <Field name="proveedor" label="Proveedor" defaultValue="Por definir" />
        <Field name="documento_recepcion" label="Documento" />
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Observaciones</label>
          <textarea name="observaciones" rows={2} className={inputClass} />
        </div>
        <div className="md:col-span-3"><button className="px-4 py-2 rounded-lg text-white text-sm font-semibold btn-accent">Registrar entrada</button></div>
      </form>

      <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <div className="px-5 py-4 border-b border-white/5"><h2 className="text-white font-semibold">Recepciones recientes</h2></div>
        <div className="divide-y divide-white/5">
          {(recepciones ?? []).map((item: any) => (
            <div key={item.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <PackageCheck className="w-5 h-5 text-green-300" />
                <div>
                  <p className="text-white font-medium">{item.refacciones?.numero_parte} - {item.refacciones?.descripcion}</p>
                  <p className="text-slate-500 text-xs">Ubicacion {item.ubicaciones_almacen?.codigo ?? '—'} · {item.proveedor}</p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>{item.fecha_recepcion}</p>
                <p>{item.numero_serie || item.lote || item.documento_recepcion || 'Sin referencia'}</p>
              </div>
            </div>
          ))}
          {!recepciones?.length && <div className="px-5 py-10 text-center text-slate-500">No hay recepciones registradas.</div>}
        </div>
      </div>
    </div>
  )
}

function Field(props: any) {
  const { label, ...inputProps } = props
  return <div><label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label><input {...inputProps} className={inputClass} /></div>
}

function Select({ label, children, ...props }: any) {
  return <div><label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label><select {...props} className={inputClass}>{children}</select></div>
}

const inputClass = 'w-full px-3 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600'
