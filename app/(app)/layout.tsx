import { getSessionContext, getEmpresaNombre, getEnabledModules } from '@/lib/supabase/server-utils'
import { AuthProvider } from '@/lib/auth-context'
import type { AuthState } from '@/lib/auth-context'
import AppLayoutClient from '@/components/app-layout-client'
import { ThemeProvider } from '@/lib/theme-context'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, perfil, empresaId } = await getSessionContext()

  const [empresaNombre, enabledModules] = empresaId
    ? await Promise.all([
        getEmpresaNombre(empresaId),
        getEnabledModules(empresaId, perfil?.rol, user?.id, perfil?.restriccion_modulos),
      ])
    : ['', null] as const

  const initial: AuthState | null = user && perfil
    ? {
        userId: user.id,
        userName: perfil.nombre,
        userRol: perfil.rol ?? '',
        empresaNombre,
        isSuperAdmin: perfil.rol === 'SuperAdmin',
        enabledModules,
      }
    : null

  return (
    <ThemeProvider>
      <AuthProvider initial={initial}>
        <AppLayoutClient>{children}</AppLayoutClient>
      </AuthProvider>
    </ThemeProvider>
  )
}
