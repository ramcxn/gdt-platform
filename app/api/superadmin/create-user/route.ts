/* eslint-disable */
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    // Verificar que quien llama es SuperAdmin
    const serverSupabase = await createServerClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const { data: perfil } = await serverSupabase.from('usuarios').select('rol').eq('id', user.id).single()
    if (perfil?.rol !== 'SuperAdmin') return NextResponse.json({ error: 'Solo SuperAdmin puede crear usuarios' }, { status: 403 })

    const { empresa_id, nombre, email, password, rol } = await req.json()
    if (!empresa_id || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Usar service role para crear usuario en auth
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: newUser, error: authErr } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 })

    // Insertar perfil
    const { error: perfilErr } = await adminSupabase.from('usuarios').insert([{
      id: newUser.user.id,
      empresa_id,
      nombre: nombre || email.split('@')[0],
      email,
      rol: rol || 'Operador',
      activo: true,
    }])
    if (perfilErr) return NextResponse.json({ error: perfilErr.message }, { status: 400 })

    return NextResponse.json({ success: true, user_id: newUser.user.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error interno' }, { status: 500 })
  }
}
