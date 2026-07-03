import Link from 'next/link'
import { ArrowLeft, MapPin, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/supabase/server-utils'
import { createWarehouseLocation } from '../actions'

export default async function WarehouseLocationsPage() {
  const supabase = await createClient()
  const { empresaId } = await getSessionContext()
  if (!empresaId) return null

  const { data: ubicaciones } = await supabase
    .from('ubicaciones_almacen')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('codigo')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/almacen" className="text-slate-500 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center btn-accent"><MapPin className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-bold text-white">Ubicaciones de Almacen</h1><p className="text-slate-400 text-sm">Estanterias, bins y zonas de resguardo.</p></div>
      </div>

      <form action={createWarehouseLocation} className="glass-card rounded-xl border border-white/5 p-5 grid grid-cols-1 md:grid-cols-5 gap-4" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <div className="md:col-span-5 flex items-center gap-2 text-white font-semibold"><Plus className="w-4 h-4 text-blue-300" /> Nueva ubicacion</div>
        <Field name="codigo" label="Codigo" required />
        <Select name="tipo" label="Tipo"><option value="estanteria">Estanteria</option><option value="bin">Bin</option><option value="zona">Zona</option></Select>
        <Field name="descripcion" label="Descripcion" />
        <Field name="capacidad" label="Capacidad" type="number" />
        <div className="flex items-end"><button className="w-full px-4 py-2 rounded-lg text-white text-sm font-semibold btn-accent">Guardar</button></div>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(ubicaciones ?? []).map((u: any) => (
          <div key={u.id} className="glass-card rounded-xl border border-white/5 p-5" style={{ background: 'rgba(15,31,53,0.7)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-300" />
                <h2 className="text-white font-bold">{u.codigo}</h2>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full border border-green-500/20 bg-green-500/10 text-green-300">{u.activa ? 'Activa' : 'Inactiva'}</span>
            </div>
            <p className="text-slate-400 text-sm mt-3 min-h-5">{u.descripcion || 'Sin descripcion'}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-slate-500 text-xs">Tipo</p><p className="text-slate-200 capitalize">{String(u.tipo).replace('_', ' ')}</p></div>
              <div><p className="text-slate-500 text-xs">Capacidad</p><p className="text-slate-200">{u.capacidad ?? '—'}</p></div>
            </div>
          </div>
        ))}
        {!ubicaciones?.length && <div className="text-slate-500 text-sm">No hay ubicaciones registradas.</div>}
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
