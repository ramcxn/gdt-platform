import { cache } from 'react'
import { createClient } from './server'
import type { User } from '@supabase/supabase-js'

/** Obtener el usuario autenticado (cacheado por request) */
export const getAuthUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

/** Perfil del usuario + empresa_id (cacheado por request) */
export const getUserProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('usuarios')
    .select('id, nombre, empresa_id, rol, restriccion_modulos')
    .eq('id', userId)
    .single()
  return data
})

/** Nombre comercial de la empresa (cacheado por request) */
export const getEmpresaNombre = cache(async (empresaId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('empresas')
    .select('nombre_comercial')
    .eq('id', empresaId)
    .single()
  return data?.nombre_comercial ?? ''
})

/**
 * Helper rápido para páginas server: devuelve user + perfil + empresa_id
 * en una sola función cacheada, evitando queries duplicadas.
 */
export const getSessionContext = cache(async () => {
  const user = await getAuthUser()
  if (!user) return { user: null, perfil: null, empresaId: null }

  const perfil = await getUserProfile(user.id)
  return { user, perfil, empresaId: perfil?.empresa_id ?? null }
})

/**
 * Claves de módulos habilitados para el usuario actual (cacheado por request).
 * Combina dos capas:
 *  1. Los módulos que la empresa tiene contratados/habilitados (empresa_modulos).
 *  2. Si el usuario tiene restriccion_modulos = true, se interseca con su propia
 *     asignación (usuario_modulos) — solo puede ver un subconjunto de lo que la
 *     empresa ya habilitó, nunca más.
 * SuperAdmin o usuarios sin empresa devuelven null = sin restricción.
 */
export const getEnabledModules = cache(async (
  empresaId: string | null,
  rol?: string | null,
  usuarioId?: string | null,
  restriccionModulos?: boolean | null,
): Promise<string[] | null> => {
  if (!empresaId || rol === 'SuperAdmin') return null
  const supabase = await createClient()
  const { data: empresaMods } = await supabase
    .from('empresa_modulos')
    .select('modulo_key')
    .eq('empresa_id', empresaId)
  const empresaKeys = (empresaMods ?? []).map(d => d.modulo_key)

  if (!restriccionModulos || !usuarioId) return empresaKeys

  const { data: userMods } = await supabase
    .from('usuario_modulos')
    .select('modulo_key')
    .eq('usuario_id', usuarioId)
  const userKeys = new Set((userMods ?? []).map(d => d.modulo_key))
  return empresaKeys.filter(k => userKeys.has(k))
})
