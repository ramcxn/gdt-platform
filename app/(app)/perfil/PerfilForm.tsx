/* eslint-disable */
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ROL_COLOR: Record<string,string> = {
  SuperAdmin: 'bg-red-500/10 text-red-400 border-red-500/20',
  Admin_Empresa: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Supervisor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Operador: 'bg-green-500/10 text-green-400 border-green-500/20',
  Guardia: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Chofer: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
}

export default function PerfilForm({ perfil, userEmail }: { perfil: any; userEmail: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [nombre, setNombre] = useState(perfil?.nombre ?? '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPwd, setChangingPwd] = useState(false)

  const handleSaveNombre = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setMsg('')
    const { error } = await supabase.from('usuarios').update({ nombre }).eq('id', perfil.id)
    setSaving(false)
    if (error) setMsg('Error: ' + error.message)
    else { setMsg('✓ Nombre actualizado'); router.refresh() }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setMsg('Error: Las contraseñas no coinciden'); return }
    if (newPassword.length < 8) { setMsg('Error: Mínimo 8 caracteres'); return }
    setChangingPwd(true); setMsg('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setChangingPwd(false)
    if (error) setMsg('Error: ' + error.message)
    else { setMsg('✓ Contraseña actualizada'); setNewPassword(''); setConfirmPassword('') }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const Section = ({ title, children }: any) => (
    <div className="glass-card rounded-xl border border-white/5 p-5 space-y-4" style={{ background: 'rgba(15,31,53,0.7)' }}>
      <h2 className="text-white font-semibold border-b border-white/5 pb-3">{title}</h2>
      {children}
    </div>
  )

  return (
    <div className="space-y-5">
      {msg && (
        <div className={`p-3 rounded-lg text-sm border ${msg.startsWith('Error') ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
          {msg}
        </div>
      )}

      {/* Info de cuenta */}
      <Section title="👤 Información de Cuenta">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg p-3 border border-white/5" style={{ background: 'rgba(10,21,38,0.5)' }}>
            <p className="text-xs text-slate-500 mb-1">Email</p>
            <p className="text-white text-sm font-medium">{userEmail}</p>
          </div>
          <div className="rounded-lg p-3 border border-white/5" style={{ background: 'rgba(10,21,38,0.5)' }}>
            <p className="text-xs text-slate-500 mb-1">Rol</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${ROL_COLOR[perfil?.rol] ?? ROL_COLOR.Operador}`}>
              {perfil?.rol}
            </span>
          </div>
          <div className="rounded-lg p-3 border border-white/5" style={{ background: 'rgba(10,21,38,0.5)' }}>
            <p className="text-xs text-slate-500 mb-1">Empresa</p>
            <p className="text-white text-sm font-medium">{perfil?.empresas?.nombre_comercial ?? '—'}</p>
          </div>
          <div className="rounded-lg p-3 border border-white/5" style={{ background: 'rgba(10,21,38,0.5)' }}>
            <p className="text-xs text-slate-500 mb-1">Plan</p>
            <p className="text-white text-sm font-medium">{perfil?.empresas?.plan ?? '—'}</p>
          </div>
        </div>
      </Section>

      {/* Cambiar nombre */}
      <Section title="✏️ Editar Nombre">
        <form onSubmit={handleSaveNombre} className="flex gap-3">
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required
            className="flex-1 px-3 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" disabled={saving}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#1E3A5F,#2E6DA4)' }}>
            {saving ? '...' : 'Guardar'}
          </button>
        </form>
      </Section>

      {/* Cambiar contraseña */}
      <Section title="🔐 Cambiar Contraseña">
        <form onSubmit={handleChangePassword} className="space-y-3">
          {[
            { label: 'Nueva contraseña', val: newPassword, set: setNewPassword },
            { label: 'Confirmar contraseña', val: confirmPassword, set: setConfirmPassword },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-sm text-slate-300 mb-1">{f.label}</label>
              <input type="password" value={f.val} onChange={e => f.set(e.target.value)} required minLength={8}
                placeholder="Mínimo 8 caracteres"
                className="w-full px-3 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600" />
            </div>
          ))}
          <button type="submit" disabled={changingPwd}
            className="px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#1E3A5F,#2E6DA4)' }}>
            {changingPwd ? 'Actualizando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </Section>

      {/* Cerrar sesión */}
      <button onClick={handleLogout}
        className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors">
        Cerrar Sesión
      </button>
    </div>
  )
}
