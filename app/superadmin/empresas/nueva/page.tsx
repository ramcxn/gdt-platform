/* eslint-disable */
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CONFIGURABLE_MODULE_GROUPS, CONFIGURABLE_MODULE_KEYS } from '@/lib/modules'

export default function NuevaEmpresaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [script, setScript] = useState('')
  const [modulos, setModulos] = useState<string[]>(CONFIGURABLE_MODULE_KEYS)
  const [form, setForm] = useState({
    nombre_comercial: '', razon_social: '', rfc: '', telefono: '',
    correo_contacto: '', direccion: '', plan: 'Demo', estado: 'Activo',
    numero_ctpat: '', fecha_vigencia_ctpat: '',
    seed_defaults: true,
    // Admin inicial
    admin_nombre: '', admin_email: '', admin_password: '',
  })

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))

  const toggleModulo = (key: string) =>
    setModulos(prev => prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key])

  const toggleGroup = (keys: string[], allSelected: boolean) =>
    setModulos(prev => allSelected ? prev.filter(m => !keys.includes(m)) : Array.from(new Set([...prev, ...keys])))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/superadmin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, modulos }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? 'Error creando empresa')
      }
      setScript(json.sql ?? '')
      router.push(`/superadmin/empresas/${json.empresa.id}`)
    } catch (e: any) {
      setError(e?.message ?? 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, k, type = 'text', required = false, placeholder = '' }: any) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
      <input type={type} value={(form as any)[k]} onChange={e => set(k, e.target.value)} required={required} placeholder={placeholder}
        className="w-full px-3 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-600" />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Nueva Empresa</h1>
        <p className="text-slate-400 text-sm mt-1">Registra un nuevo tenant en la plataforma</p>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

      {/* Datos empresa */}
      <div className="rounded-xl border border-white/5 p-5 space-y-4" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <h2 className="text-white font-semibold">Datos de la Empresa</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre comercial" k="nombre_comercial" required placeholder="Transportes XYZ" />
          <Field label="Razón social" k="razon_social" placeholder="TRANSPORTES XYZ S.A. DE C.V." />
          <Field label="RFC" k="rfc" placeholder="TXY000101ABC" />
          <Field label="Teléfono" k="telefono" placeholder="+52 (800) 000-0000" />
          <Field label="Correo contacto" k="correo_contacto" type="email" placeholder="admin@empresa.com" />
          <Field label="No. CTPAT" k="numero_ctpat" placeholder="MX-CTPAT-0000" />
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
        <Field label="Dirección" k="direccion" placeholder="Calle, Ciudad, Estado, CP" />
        <label className="flex items-center gap-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={form.seed_defaults}
            onChange={e => set('seed_defaults', e.target.checked)}
            className="h-4 w-4 rounded border-white/10 bg-[#0f1f35]"
          />
          Crear datos base: ubicación de almacén y zonas de rondín
        </label>
      </div>

      {/* Módulos habilitados */}
      <div className="rounded-xl border border-white/5 p-5 space-y-4" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold">Módulos del Sistema</h2>
            <p className="text-slate-500 text-xs mt-0.5">Selecciona qué módulos podrá utilizar esta empresa. Puedes ajustarlo después.</p>
          </div>
          <div className="flex gap-2 text-xs">
            <button type="button" onClick={() => setModulos(CONFIGURABLE_MODULE_KEYS)}
              className="text-purple-300 hover:underline">Seleccionar todos</button>
            <span className="text-slate-600">·</span>
            <button type="button" onClick={() => setModulos([])}
              className="text-slate-400 hover:underline">Ninguno</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONFIGURABLE_MODULE_GROUPS.map(group => {
            const keys = group.items.map(i => i.key)
            const allSelected = keys.every(k => modulos.includes(k))
            return (
              <div key={group.label} className="rounded-lg border border-white/5 p-3" style={{ background: 'rgba(7,17,31,0.5)' }}>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 cursor-pointer">
                  <input type="checkbox" checked={allSelected} onChange={() => toggleGroup(keys, allSelected)}
                    className="h-3.5 w-3.5 rounded border-white/10 bg-[#0f1f35]" />
                  {group.label}
                </label>
                <div className="space-y-1.5">
                  {group.items.map(item => (
                    <label key={item.key} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input type="checkbox" checked={modulos.includes(item.key)} onChange={() => toggleModulo(item.key)}
                        className="h-4 w-4 rounded border-white/10 bg-[#0f1f35]" />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Usuario admin inicial */}
      <div className="rounded-xl border border-white/5 p-5 space-y-4" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <div>
          <h2 className="text-white font-semibold">Usuario Administrador</h2>
          <p className="text-slate-500 text-xs mt-0.5">Opcional — puedes crearlo después desde Gestión de Usuarios</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre" k="admin_nombre" placeholder="Nombre Apellido" />
          <Field label="Email" k="admin_email" type="email" placeholder="admin@empresa.com" />
          <div className="sm:col-span-2">
            <Field label="Contraseña inicial" k="admin_password" type="password" placeholder="Min. 8 caracteres" />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
          {loading ? '⏳ Guardando...' : '✓ Crear Empresa'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2.5 rounded-lg text-slate-400 border border-white/10 text-sm hover:text-white transition-colors">
          Cancelar
        </button>
      </div>
      {script && (
        <textarea readOnly value={script}
          className="w-full h-72 p-4 bg-[#07111f] border border-white/10 rounded-xl text-slate-200 text-xs font-mono outline-none resize-none" />
      )}
    </form>
  )
}
