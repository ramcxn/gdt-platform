/* eslint-disable */
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CONFIGURABLE_MODULE_GROUPS } from '@/lib/modules'

const ROL_COLOR: Record<string,string> = {
  SuperAdmin: 'bg-red-500/10 text-red-400 border-red-500/20',
  Admin_Empresa: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Supervisor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Operador: 'bg-green-500/10 text-green-400 border-green-500/20',
  Guardia: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Chofer: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
}
const ROLES = ['Admin_Empresa', 'Supervisor', 'Operador', 'Guardia', 'Chofer']

function Badge({ text, cls }: { text: string; cls: string }) {
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>{text}</span>
}

export default function UsuariosManager({ usuarios, currentUserId, currentRol, canManage, empresaModulos, usuarioModulosMap }: {
  usuarios: any[], currentUserId: string, currentRol: string, canManage: boolean
  empresaModulos: string[], usuarioModulosMap: Record<string, string[]>
}) {
  const router = useRouter()
  const [showInvite, setShowInvite] = useState(false)
  const [editUser, setEditUser] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [inviteForm, setInviteForm] = useState({ nombre: '', email: '', password: '', rol: 'Operador' })
  const [modRestriccion, setModRestriccion] = useState(false)
  const [modKeys, setModKeys] = useState<string[]>([])

  // Grupos de módulos que la empresa tiene habilitados (solo esos tiene sentido asignar por usuario)
  const asignableGroups = CONFIGURABLE_MODULE_GROUPS
    .map(g => ({ label: g.label, items: g.items.filter(i => empresaModulos.includes(i.key)) }))
    .filter(g => g.items.length > 0)

  const openEdit = (u: any) => {
    setEditUser(u)
    setModRestriccion(!!u.restriccion_modulos)
    setModKeys(usuarioModulosMap[u.id] ?? [])
  }

  const toggleModKey = (key: string) =>
    setModKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])

  const stats = [
    { icon: '👤', label: 'Total', value: usuarios.length },
    { icon: '✅', label: 'Activos', value: usuarios.filter(u => u.activo).length },
    { icon: '🔑', label: 'Admins', value: usuarios.filter(u => ['Admin_Empresa','Supervisor'].includes(u.rol)).length },
    { icon: '🚛', label: 'Operativos', value: usuarios.filter(u => ['Operador','Chofer','Guardia'].includes(u.rol)).length },
  ]

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setMsg('')
    const res = await fetch('/api/admin/invite-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inviteForm)
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setMsg('Error: ' + data.error); return }
    setMsg('✓ Usuario creado correctamente')
    setShowInvite(false)
    setInviteForm({ nombre: '', email: '', password: '', rol: 'Operador' })
    router.refresh()
  }

  const handleUpdateUser = async (userId: string, updates: any) => {
    setSaving(true); setMsg('')
    const res = await fetch('/api/admin/update-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, ...updates })
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setMsg('Error: ' + data.error); return }
    setEditUser(null)
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {msg && (
        <div className={`p-3 rounded-lg text-sm ${msg.startsWith('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
          {msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-5 border border-white/5" style={{ background: 'rgba(15,31,53,0.7)' }}>
            <span className="text-2xl block mb-2">{s.icon}</span>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table + toolbar */}
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden" style={{ background: 'rgba(15,31,53,0.7)' }}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-white font-semibold">Usuarios de la empresa</h2>
          {canManage && (
            <button onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg,#1E3A5F,#2E6DA4)' }}>
              <span>+</span> Agregar Usuario
            </button>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Usuario', 'Email', 'Rol', 'Estado', 'Desde', ...(canManage ? [''] : [])].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {usuarios.map(u => (
              <tr key={u.id} className="hover:bg-white/3 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 text-xs font-bold flex-shrink-0">
                      {u.nombre?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <span className="text-white font-medium">{u.nombre}</span>
                    {u.id === currentUserId && <span className="text-xs text-slate-500">(tú)</span>}
                    {u.restriccion_modulos && (
                      <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                        Módulos limitados
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">{u.email ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge text={u.rol} cls={ROL_COLOR[u.rol] ?? ROL_COLOR.Chofer} />
                </td>
                <td className="px-4 py-3">
                  <Badge text={u.activo ? 'Activo' : 'Inactivo'} cls={u.activo ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'} />
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {new Date(u.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                {canManage && (
                  <td className="px-4 py-3">
                    {u.id !== currentUserId && (
                      <button onClick={() => openEdit(u)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        Editar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Invitar */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 p-6 space-y-4" style={{ background: '#0f1f35' }}>
            <h2 className="text-white font-bold text-lg">Agregar Usuario</h2>
            <form onSubmit={handleInvite} className="space-y-3">
              {[
                { label: 'Nombre completo', key: 'nombre', type: 'text', placeholder: 'Juan Pérez' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'juan@empresa.com', required: true },
                { label: 'Contraseña inicial', key: 'password', type: 'password', placeholder: 'Min. 8 caracteres', required: true },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm text-slate-300 mb-1">{f.label}{f.required && <span className="text-red-400 ml-1">*</span>}</label>
                  <input type={f.type} value={(inviteForm as any)[f.key]}
                    onChange={e => setInviteForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} required={f.required}
                    className="w-full px-3 py-2 bg-[#0a1526] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600" />
                </div>
              ))}
              <div>
                <label className="block text-sm text-slate-300 mb-1">Rol</label>
                <select value={inviteForm.rol} onChange={e => setInviteForm(p => ({ ...p, rol: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#0a1526] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#1E3A5F,#2E6DA4)' }}>
                  {saving ? 'Creando...' : 'Crear Usuario'}
                </button>
                <button type="button" onClick={() => setShowInvite(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 border border-white/10 text-sm hover:text-white">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 p-6 space-y-4" style={{ background: '#0f1f35' }}>
            <h2 className="text-white font-bold text-lg">Editar: {editUser.nombre}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Nombre</label>
                <input type="text" defaultValue={editUser.nombre}
                  id="edit-nombre"
                  className="w-full px-3 py-2 bg-[#0a1526] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Rol</label>
                <select id="edit-rol" defaultValue={editUser.rol}
                  className="w-full px-3 py-2 bg-[#0a1526] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-300">Estado:</label>
                <button type="button"
                  onClick={() => handleUpdateUser(editUser.id, { activo: !editUser.activo })}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${editUser.activo ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {editUser.activo ? 'Activo (click para desactivar)' : 'Inactivo (click para activar)'}
                </button>
              </div>
            </div>

            {/* Módulos del usuario */}
            <div className="rounded-lg border border-white/5 p-3 space-y-3" style={{ background: 'rgba(7,17,31,0.5)' }}>
              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input type="checkbox" checked={modRestriccion} onChange={e => setModRestriccion(e.target.checked)}
                  className="h-4 w-4 rounded border-white/10 bg-[#0f1f35]" />
                Restringir módulos para este usuario
              </label>
              <p className="text-xs text-slate-500">
                {modRestriccion
                  ? 'Solo verá los módulos marcados abajo (de los que ya tiene habilitados la empresa).'
                  : 'Sin marcar: el usuario ve todos los módulos habilitados para la empresa.'}
              </p>
              {modRestriccion && (
                asignableGroups.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                    {asignableGroups.map(group => (
                      <div key={group.label}>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{group.label}</p>
                        <div className="space-y-1">
                          {group.items.map(item => (
                            <label key={item.key} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                              <input type="checkbox" checked={modKeys.includes(item.key)} onChange={() => toggleModKey(item.key)}
                                className="h-3.5 w-3.5 rounded border-white/10 bg-[#0f1f35]" />
                              {item.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-amber-400">La empresa no tiene módulos habilitados todavía.</p>
                )
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  const nombre = (document.getElementById('edit-nombre') as HTMLInputElement)?.value
                  const rol = (document.getElementById('edit-rol') as HTMLSelectElement)?.value
                  handleUpdateUser(editUser.id, {
                    nombre, rol,
                    restriccion_modulos: modRestriccion,
                    modulos: modRestriccion ? modKeys : [],
                  })
                }}
                disabled={saving}
                className="flex-1 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#1E3A5F,#2E6DA4)' }}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setEditUser(null)}
                className="px-4 py-2 rounded-lg text-slate-400 border border-white/10 text-sm hover:text-white">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
