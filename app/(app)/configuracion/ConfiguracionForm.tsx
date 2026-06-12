/* eslint-disable */
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ConfiguracionForm({ empresa }: { empresa: any }) {
  const supabase = createClient()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    nombre_comercial: empresa?.nombre_comercial ?? '',
    razon_social: empresa?.razon_social ?? '',
    rfc: empresa?.rfc ?? '',
    telefono: empresa?.telefono ?? '',
    correo_contacto: empresa?.correo_contacto ?? '',
    direccion: empresa?.direccion ?? '',
    numero_ctpat: empresa?.numero_ctpat ?? '',
    fecha_vigencia_ctpat: empresa?.fecha_vigencia_ctpat?.split('T')[0] ?? '',
  })

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setMsg('')
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
    else { setMsg('✓ Configuración guardada'); router.refresh() }
  }

  const Field = ({ label, k, type = 'text', placeholder = '', hint = '' }: any) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      <input type={type} value={(form as any)[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600" />
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  )

  const Section = ({ title, children }: any) => (
    <div className="glass-card rounded-xl border border-white/5 p-5 space-y-4" style={{ background: 'rgba(15,31,53,0.7)' }}>
      <h2 className="text-white font-semibold text-base border-b border-white/5 pb-3">{title}</h2>
      {children}
    </div>
  )

  // Vigencia CTPAT status
  const vigencia = form.fecha_vigencia_ctpat ? new Date(form.fecha_vigencia_ctpat) : null
  const diasVigencia = vigencia ? Math.floor((vigencia.getTime() - Date.now()) / 86400000) : null
  const vigenciaStatus = diasVigencia === null ? null : diasVigencia < 0 ? 'vencido' : diasVigencia < 60 ? 'proximo' : 'vigente'

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {msg && (
        <div className={`p-3 rounded-lg text-sm border ${msg.startsWith('Error') ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
          {msg}
        </div>
      )}

      <Section title="🏢 Datos Generales">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre comercial" k="nombre_comercial" required placeholder="Transportes XYZ" />
          <Field label="Razón social" k="razon_social" placeholder="TRANSPORTES XYZ S.A. DE C.V." />
          <Field label="RFC" k="rfc" placeholder="TXY000101ABC" hint="13 caracteres. Identifica tu cuenta en la plataforma." />
          <Field label="Teléfono" k="telefono" placeholder="+52 (800) 000-0000" />
          <Field label="Correo de contacto" k="correo_contacto" type="email" placeholder="contacto@empresa.com" />
        </div>
        <Field label="Dirección" k="direccion" placeholder="Calle, Colonia, Ciudad, Estado, C.P." />
      </Section>

      <Section title="🛡️ Certificación CTPAT">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Número de certificación CTPAT" k="numero_ctpat" placeholder="MX-CTPAT-XXXXX" />
          <div>
            <Field label="Fecha de vigencia" k="fecha_vigencia_ctpat" type="date" />
            {vigenciaStatus && (
              <div className={`mt-2 text-xs font-medium px-3 py-1.5 rounded-lg inline-block ${
                vigenciaStatus === 'vencido' ? 'bg-red-500/10 text-red-400' :
                vigenciaStatus === 'proximo' ? 'bg-amber-500/10 text-amber-400' :
                'bg-green-500/10 text-green-400'
              }`}>
                {vigenciaStatus === 'vencido' ? `⚠️ Vencido hace ${Math.abs(diasVigencia!)} días` :
                 vigenciaStatus === 'proximo' ? `⏰ Vence en ${diasVigencia} días` :
                 `✓ Vigente por ${diasVigencia} días`}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Plan info (read-only) */}
      <Section title="📦 Plan de Suscripción">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-lg">{empresa?.plan ?? 'Demo'}</p>
            <p className="text-slate-400 text-sm">Estado: {empresa?.estado ?? 'Activo'}</p>
          </div>
          <span className="text-xs text-slate-500 bg-white/5 px-3 py-1.5 rounded-lg">
            Para cambiar de plan, contacta a soporte.
          </span>
        </div>
      </Section>

      <button type="submit" disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
        style={{ background: 'linear-gradient(135deg,#1E3A5F,#2E6DA4)' }}>
        {saving ? '⏳ Guardando...' : '✓ Guardar Configuración'}
      </button>
    </form>
  )
}
