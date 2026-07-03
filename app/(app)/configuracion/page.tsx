/* eslint-disable */
import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/supabase/server-utils'
import ConfiguracionForm from './ConfiguracionForm'
import { redirect } from 'next/navigation'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { user, perfil, empresaId } = await getSessionContext()
  if (!user || !perfil || !empresaId) { redirect('/login'); return null }

  if (!['SuperAdmin','Admin_Empresa'].includes(perfil.rol ?? '')) {
    redirect('/dashboard')
  }

  const { data: empresa } = await supabase
    .from('empresas')
    .select('*')
    .eq('id', empresaId)
    .single()

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#1E3A5F,#2E6DA4)' }}>⚙️</div>
        <div>
          <h1 className="text-xl font-bold text-white">Configuración de Empresa</h1>
          <p className="text-slate-400 text-sm">Datos generales, CTPAT y preferencias</p>
        </div>
      </div>
      <ConfiguracionForm empresa={empresa} />
    </div>
  )
}
