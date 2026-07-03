import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft, Package, Plus, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/supabase/server-utils'
import { createWarehousePart } from '../actions'

export default async function WarehouseCatalogPage() {
  const supabase = await createClient()
  const { empresaId } = await getSessionContext()
  if (!empresaId) return null

  const [{ data: refacciones }, { data: ubicaciones }] = await Promise.all([
    supabase.from('refacciones').select('*, ubicaciones_almacen(codigo)').eq('empresa_id', empresaId).order('created_at', { ascending: false }),
    supabase.from('ubicaciones_almacen').select('*').eq('empresa_id', empresaId).eq('activa', true).order('codigo'),
  ])

  return (
    <div className="space-y-6">
      <Header title="Catalogo de Refacciones" subtitle="Alta de refacciones, costos y niveles de stock." />

      <form action={createWarehousePart} className="glass-card rounded-xl border border-white/5 p-5 grid grid-cols-1 md:grid-cols-3 gap-4" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <div className="md:col-span-3 flex items-center gap-2 text-white font-semibold">
          <Plus className="w-4 h-4 text-blue-300" /> Nueva refaccion
        </div>
        <Field name="numero_parte" label="Numero de parte" required />
        <Field name="descripcion" label="Descripcion" required />
        <Field name="categoria" label="Categoria" defaultValue="General" />
        <Field name="proveedor" label="Proveedor" defaultValue="Por definir" />
        <Field name="precio_unitario" label="Precio unitario" type="number" step="0.01" defaultValue="0" />
        <Field name="unidad_medida" label="Unidad" defaultValue="PZA" />
        <Select name="ubicacion_principal" label="Ubicacion principal">
          <option value="">Sin ubicacion</option>
          {(ubicaciones ?? []).map((u: any) => <option key={u.id} value={u.id}>{u.codigo}</option>)}
        </Select>
        <Field name="stock_minimo" label="Stock minimo" type="number" defaultValue="0" />
        <Field name="stock_maximo" label="Stock maximo" type="number" defaultValue="100" />
        <Field name="punto_reorden" label="Punto de reorden" type="number" defaultValue="10" />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input name="requiere_serie" type="checkbox" className="accent-blue-500" /> Requiere serie
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input name="tiene_caducidad" type="checkbox" className="accent-blue-500" /> Tiene caducidad
        </label>
        <Field name="dias_vida_util" label="Dias vida util" type="number" />
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Notas</label>
          <textarea name="notas" rows={2} className={inputClass} />
        </div>
        <div className="md:col-span-3">
          <button className="px-4 py-2 rounded-lg text-white text-sm font-semibold btn-accent">Guardar refaccion</button>
        </div>
      </form>

      <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-white font-semibold">Refacciones registradas</h2>
            <p className="text-slate-500 text-xs">{refacciones?.length ?? 0} registros</p>
          </div>
          <div className="text-slate-500"><Search className="w-4 h-4" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500 bg-white/5">
              <tr>{['Parte', 'Descripcion', 'Categoria', 'Proveedor', 'Stock', 'Ubicacion', 'Estado'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(refacciones ?? []).map((r: any) => (
                <tr key={r.id} className="hover:bg-white/3">
                  <td className="px-4 py-3 font-mono text-blue-300">{r.numero_parte}</td>
                  <td className="px-4 py-3 text-white">{r.descripcion}</td>
                  <td className="px-4 py-3 text-slate-300">{r.categoria}</td>
                  <td className="px-4 py-3 text-slate-400">{r.proveedor}</td>
                  <td className="px-4 py-3 text-slate-300">{r.stock_minimo} / {r.punto_reorden} / {r.stock_maximo}</td>
                  <td className="px-4 py-3 text-slate-400">{r.ubicaciones_almacen?.codigo ?? '—'}</td>
                  <td className="px-4 py-3"><Badge color={r.activa ? 'green' : 'slate'}>{r.activa ? 'Activa' : 'Inactiva'}</Badge></td>
                </tr>
              ))}
              {!refacciones?.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No hay refacciones todavia.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <Link href="/almacen" className="text-slate-500 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center btn-accent"><Package className="w-5 h-5 text-white" /></div>
      <div><h1 className="text-xl font-bold text-white">{title}</h1><p className="text-slate-400 text-sm">{subtitle}</p></div>
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

function Badge({ color, children }: { color: 'green' | 'slate'; children: ReactNode }) {
  const cls = color === 'green' ? 'bg-green-500/10 text-green-300 border-green-500/20' : 'bg-slate-500/10 text-slate-300 border-slate-500/20'
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>{children}</span>
}

const inputClass = 'w-full px-3 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600'
