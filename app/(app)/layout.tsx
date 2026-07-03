import { getSessionContext, getEmpresaNombre } from '@/lib/supabase/server-utils'
import { AuthProvider } from '@/lib/auth-context'
import type { AuthState } from '@/lib/auth-context'
import AppLayoutClient from '@/components/app-layout-client'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, perfil, empresaId } = await getSessionContext()

  const initial: AuthState | null = user && perfil
    ? {
        userId: user.id,
        userName: perfil.nombre,
        userRol: perfil.rol ?? '',
        empresaNombre: empresaId ? await getEmpresaNombre(empresaId) : '',
        isSuperAdmin: perfil.rol === 'SuperAdmin',
      }
    : null

  return (
    <AuthProvider initial={initial}>
      <AppLayoutClient>{children}</AppLayoutClient>
    </AuthProvider>
  )
}
