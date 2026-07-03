/* eslint-disable */
import { createClient } from '@/lib/supabase/server'
import PerfilForm from './PerfilForm'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession(); const user = session?.user ?? null
  const { data: perfil } = await supabase
    .from('usuarios')
    .select('*, empresas(nombre_comercial, plan, estado)')
    .eq('id', user!.id)
    .single()

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#1E3A5F,#2E6DA4)' }}>
          {perfil?.nombre?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{perfil?.nombre ?? 'Mi Perfil'}</h1>
          <p className="text-slate-400 text-sm">{user?.email}</p>
        </div>
      </div>
      <PerfilForm perfil={perfil} userEmail={user?.email ?? ''} />
    </div>
  )
}
