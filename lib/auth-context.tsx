'use client'

import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export interface AuthState {
  userId: string
  userName: string
  userRol: string
  empresaNombre: string
  isSuperAdmin: boolean
  /** Claves de módulos habilitados para la empresa del usuario. null = sin restricción (SuperAdmin). */
  enabledModules: string[] | null
}

const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({
  children,
  initial,
}: {
  children: React.ReactNode
  initial: AuthState | null
}) {
  const [auth, setAuth] = useState<AuthState | null>(initial)
  const router = useRouter()
  const supabase = useRef(createClient())
  const loaded = useRef(!!initial)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true

    supabase.current.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null
      if (!user) { router.push('/login'); return }
      const { data: perfil } = await supabase.current
        .from('usuarios')
        .select('nombre, empresa_id, rol')
        .eq('id', user.id)
        .single()

      if (!perfil) return

      let empresaNombre = ''
      let enabledModules: string[] | null = null
      if (perfil.empresa_id) {
        const { data: emp } = await supabase.current
          .from('empresas')
          .select('nombre_comercial')
          .eq('id', perfil.empresa_id)
          .single()
        if (emp) empresaNombre = emp.nombre_comercial

        if (perfil.rol !== 'SuperAdmin') {
          const { data: mods } = await supabase.current
            .from('empresa_modulos')
            .select('modulo_key')
            .eq('empresa_id', perfil.empresa_id)
          enabledModules = (mods ?? []).map(m => m.modulo_key)
        }
      }

      setAuth({
        userId: user.id,
        userName: perfil.nombre,
        userRol: perfil.rol ?? '',
        empresaNombre,
        isSuperAdmin: perfil.rol === 'SuperAdmin',
        enabledModules,
      })
    })
  }, [router])

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}
