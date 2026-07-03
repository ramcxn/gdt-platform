/* eslint-disable */
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CONFIGURABLE_MODULE_KEYS } from '@/lib/modules'

export async function POST(req: Request) {
  try {
    const serverSupabase = await createClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: perfil } = await serverSupabase
      .from('usuarios')
      .select('rol, empresa_id')
      .eq('id', user.id)
      .single()

    if (!['SuperAdmin', 'Admin_Empresa'].includes(perfil?.rol ?? '')) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const { user_id, nombre, rol, activo, restriccion_modulos, modulos } = await req.json()
    if (!user_id) return NextResponse.json({ error: 'user_id requerido' }, { status: 400 })

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verificar que el usuario target pertenece a la misma empresa (excepto SuperAdmin)
    if (perfil?.rol !== 'SuperAdmin') {
      const { data: target } = await adminSupabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user_id)
        .single()
      if (target?.empresa_id !== perfil?.empresa_id) {
        return NextResponse.json({ error: 'No puedes modificar usuarios de otra empresa' }, { status: 403 })
      }
    }

    const updates: any = {}
    if (nombre !== undefined) updates.nombre = nombre
    if (rol !== undefined) updates.rol = rol
    if (activo !== undefined) updates.activo = activo
    if (restriccion_modulos !== undefined) updates.restriccion_modulos = restriccion_modulos

    if (Object.keys(updates).length > 0) {
      const { error } = await adminSupabase.from('usuarios').update(updates).eq('id', user_id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (modulos !== undefined) {
      const set = new Set(CONFIGURABLE_MODULE_KEYS)
      const sanitized = Array.isArray(modulos) ? modulos.filter((k): k is string => typeof k === 'string' && set.has(k)) : []

      const { error: delErr } = await adminSupabase.from('usuario_modulos').delete().eq('usuario_id', user_id)
      if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 })

      if (sanitized.length > 0) {
        const { error: insErr } = await adminSupabase
          .from('usuario_modulos')
          .insert(sanitized.map(modulo_key => ({ usuario_id: user_id, modulo_key })))
        if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error interno' }, { status: 500 })
  }
}
