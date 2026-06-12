/* eslint-disable */
import { createClient } from '@/lib/supabase/server'
import UsuariosManager from './UsuariosManager'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = await supabase
    .from('usuarios')
    .select('empresa_id, rol, nombre')
    .eq('id', user!.id)
    .single()
  const eid = perfil?.empresa_id
  const { data: rows } = await supabase
    .from('usuarios')
    .select('*')
    .eq('empresa_id', eid)
    .order('nombre')

  const canManage = ['SuperAdmin', 'Admin_Empresa'].includes(perfil?.rol ?? '')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#1E3A5F,#2E6DA4)' }}>👤</div>
        <div>
          <h1 className="text-xl font-bold text-white">Gestión de Usuarios</h1>
          <p className="text-slate-400 text-sm">Control de acceso y roles del sistema</p>
        </div>
      </div>
      <UsuariosManager
        usuarios={rows ?? []}
        currentUserId={user!.id}
        currentRol={perfil?.rol ?? 'Operador'}
        canManage={canManage}
      />
    </div>
  )
}
