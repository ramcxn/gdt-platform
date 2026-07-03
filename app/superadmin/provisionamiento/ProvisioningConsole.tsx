/* eslint-disable */
'use client'

import { useMemo, useState } from 'react'
import { buildCompanyProvisionSql } from '@/lib/company-provisioning'

export default function ProvisioningConsole() {
  const [form, setForm] = useState({
    nombre_comercial: 'Nueva Empresa',
    razon_social: '',
    rfc: '',
    telefono: '',
    correo_contacto: '',
    direccion: '',
    plan: 'Demo',
    estado: 'Activo',
    numero_ctpat: '',
    fecha_vigencia_ctpat: '',
    seed_defaults: true,
  })
  const [copied, setCopied] = useState(false)
  const sql = useMemo(() => buildCompanyProvisionSql(form), [form])
  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))

  const Field = ({ label, k, type = 'text', placeholder = '' }: any) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      <input type={type} value={(form as any)[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-600" />
    </div>
  )

  async function copySql() {
    await navigator.clipboard.writeText(sql)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
      <section className="rounded-xl border border-white/5 p-5 space-y-4" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <h2 className="text-white font-semibold">Datos de provisionamiento</h2>
        <div className="grid grid-cols-1 gap-4">
          <Field label="Nombre comercial" k="nombre_comercial" />
          <Field label="Razon social" k="razon_social" />
          <Field label="RFC" k="rfc" />
          <Field label="Telefono" k="telefono" />
          <Field label="Correo contacto" k="correo_contacto" type="email" />
          <Field label="Direccion" k="direccion" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Plan</label>
              <select value={form.plan} onChange={e => set('plan', e.target.value)}
                className="w-full px-3 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                {['Demo','Basico','Premium','Enterprise'].map(p => <option key={p}>{p}</option>)}
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
          <Field label="No. CTPAT" k="numero_ctpat" />
          <Field label="Vigencia CTPAT" k="fecha_vigencia_ctpat" type="date" />
          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.seed_defaults}
              onChange={e => set('seed_defaults', e.target.checked)}
              className="h-4 w-4 rounded border-white/10 bg-[#0f1f35]"
            />
            Crear ubicacion de almacen y zonas de rondin iniciales
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-white/5 overflow-hidden" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-white font-semibold">Script SQL generado</h2>
            <p className="text-slate-500 text-xs mt-0.5">Para ejecutar en Supabase SQL Editor cuando quieras provisionar manualmente.</p>
          </div>
          <button type="button" onClick={copySql}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
            style={{ background: copied ? '#10b981' : 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
            {copied ? 'Copiado' : 'Copiar SQL'}
          </button>
        </div>
        <textarea readOnly value={sql}
          className="w-full h-[620px] p-5 bg-[#07111f] text-slate-200 text-xs font-mono outline-none resize-none leading-5" />
      </section>
    </div>
  )
}
