/* eslint-disable */
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    if (!['SuperAdmin', 'Admin_Empresa', 'Supervisor'].includes(perfil?.rol ?? '')) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const { nombre, email, password, rol } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: newUser, error: authErr } = await adminSupabase.auth.admin.createUser({
      email, password, email_confirm: true,
    })
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 })

    const { error: perfilErr } = await adminSupabase.from('usuarios').insert([{
      id: newUser.user.id,
      empresa_id: perfil?.empresa_id,
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
