/* eslint-disable */
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function EmpresaForm({ empresa }: { empresa: any }) {
  const supabase = createClient()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    nombre_comercial: empresa.nombre_comercial ?? '',
    razon_social: empresa.razon_social ?? '',
    rfc: empresa.rfc ?? '',
    telefono: empresa.telefono ?? '',
    correo_contacto: empresa.correo_contacto ?? '',
    direccion: empresa.direccion ?? '',
    plan: empresa.plan ?? 'Demo',
    estado: empresa.estado ?? 'Activo',
    numero_ctpat: empresa.numero_ctpat ?? '',
    fecha_vigencia_ctpat: empresa.fecha_vigencia_ctpat ?? '',
  })

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const { error } = await supabase.from('empresas').update({
      ...form,
      rfc: form.rfc || null,
      telefono: form.telefono || null,
      correo_contacto: form.correo_contacto || null,
      direccion: form.direccion || null,
      numero_ctpat: form.numero_ctpat || null,
      fecha_vigencia_ctpat: form.fecha_vigencia_ctpat || null,
    }).eq('id', empresa.id)
    setSaving(false)
    if (error) setMsg('Error: ' + error.message)
    else { setMsg('✓ Guardado correctamente'); router.refresh() }
  }

  const Field = ({ label, k, type = 'text', placeholder = '' }: any) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      <input type={type} value={(form as any)[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-600" />
    </div>
  )

  return (
    <form onSubmit={handleSave} className="rounded-xl border border-white/5 p-5 space-y-4" style={{ background: 'rgba(15,31,53,0.7)' }}>
      <h2 className="text-white font-semibold">Editar Información</h2>
      {msg && <div className={`p-2 rounded text-sm ${msg.startsWith('Error') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{msg}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombre comercial" k="nombre_comercial" />
        <Field label="Razón social" k="razon_social" />
        <Field label="RFC" k="rfc" />
        <Field label="Teléfono" k="telefono" />
        <Field label="Correo" k="correo_contacto" type="email" />
        <Field label="No. CTPAT" k="numero_ctpat" />
        <Field label="Vigencia CTPAT" k="fecha_vigencia_ctpat" type="date" />
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Plan</label>
          <select value={form.plan} onChange={e => set('plan', e.target.value)}
            className="w-full px-3 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
            {['Demo','Básico','Premium','Enterprise'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Estado</label>
          <select value={form.estado} onChange={e => set('estado', e.target.value)}
            className="w-full px-3 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
            {['Activo','Demo','Suspendido','Inactivo'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <Field label="Dirección" k="direccion" />
      <button type="submit" disabled={saving}
        className="px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
        {saving ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  )
}
