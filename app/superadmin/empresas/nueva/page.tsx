/* eslint-disable */
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NuevaEmpresaPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre_comercial: '', razon_social: '', rfc: '', telefono: '',
    correo_contacto: '', direccion: '', plan: 'Demo', estado: 'Activo',
    numero_ctpat: '', fecha_vigencia_ctpat: '',
    // Admin inicial
    admin_nombre: '', admin_email: '', admin_password: '',
  })

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Crear empresa
      const { data: emp, error: empErr } = await supabase.from('empresas').insert([{
        nombre_comercial: form.nombre_comercial,
        razon_social: form.razon_social || form.nombre_comercial,
        rfc: form.rfc || null,
        telefono: form.telefono || null,
        correo_contacto: form.correo_contacto || null,
        direccion: form.direccion || null,
        plan: form.plan,
        estado: form.estado,
        numero_ctpat: form.numero_ctpat || null,
        fecha_vigencia_ctpat: form.fecha_vigencia_ctpat || null,
      }]).select().single()
      if (empErr) throw empErr

      // 2. Crear usuario admin si se proveyeron credenciales
      if (form.admin_email && form.admin_password) {
        const res = await fetch('/api/superadmin/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            empresa_id: emp.id,
            nombre: form.admin_nombre || 'Administrador',
            email: form.admin_email,
            password: form.admin_password,
            rol: 'Admin_Empresa',
          })
        })
        if (!res.ok) {
          const { error: apiErr } = await res.json()
          throw new Error(apiErr ?? 'Error creando usuario admin')
        }
      }

      router.push('/superadmin')
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
    </form>
  )
}
