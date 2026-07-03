/* eslint-disable */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildCompanyProvisionSql } from '@/lib/company-provisioning'

async function requireSuperAdmin() {
  const serverSupabase = await createClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }

  const { data: perfil } = await serverSupabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfil?.rol !== 'SuperAdmin') {
    return { error: NextResponse.json({ error: 'Solo SuperAdmin puede administrar empresas' }, { status: 403 }) }
  }

  return { user }
}

export async function POST(req: Request) {
  try {
    const auth = await requireSuperAdmin()
    if (auth.error) return auth.error

    const body = await req.json()
    if (!body.nombre_comercial) {
      return NextResponse.json({ error: 'Nombre comercial requerido' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    const { data: empresa, error: empresaErr } = await adminSupabase
      .from('empresas')
      .insert([{
        nombre_comercial: body.nombre_comercial,
        razon_social: body.razon_social || body.nombre_comercial,
        rfc: body.rfc || null,
        telefono: body.telefono || null,
        correo_contacto: body.correo_contacto || null,
        direccion: body.direccion || null,
        plan: body.plan || 'Demo',
        estado: body.estado || 'Activo',
        numero_ctpat: body.numero_ctpat || null,
        fecha_vigencia_ctpat: body.fecha_vigencia_ctpat || null,
      }])
      .select()
      .single()

    if (empresaErr) return NextResponse.json({ error: empresaErr.message }, { status: 400 })

    if (body.seed_defaults !== false) {
      await Promise.all([
        adminSupabase.from('ubicaciones_almacen').upsert([{
          empresa_id: empresa.id,
          codigo: 'ALM-GRAL',
          nombre: 'Almacen general',
          descripcion: 'Ubicacion inicial para refacciones',
        }], { onConflict: 'empresa_id,codigo' }),
        adminSupabase.from('zonas_rondin').upsert([
          { empresa_id: empresa.id, nombre: 'Caseta principal', qr_code: 'RONDIN-CASETA-PRINCIPAL' },
          { empresa_id: empresa.id, nombre: 'Patio operativo', qr_code: 'RONDIN-PATIO-OPERATIVO' },
          { empresa_id: empresa.id, nombre: 'Almacen', qr_code: 'RONDIN-ALMACEN' },
        ], { onConflict: 'empresa_id,qr_code' }),
      ])
    }

    let adminUserId: string | null = null
    if (body.admin_email && body.admin_password) {
      const { data: newUser, error: authErr } = await adminSupabase.auth.admin.createUser({
        email: body.admin_email,
        password: body.admin_password,
        email_confirm: true,
      })
      if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 })

      adminUserId = newUser.user.id
      const { error: perfilErr } = await adminSupabase.from('usuarios').insert([{
        id: newUser.user.id,
        empresa_id: empresa.id,
        nombre: body.admin_nombre || 'Administrador',
        email: body.admin_email,
        rol: 'Admin_Empresa',
        activo: true,
      }])
      if (perfilErr) return NextResponse.json({ error: perfilErr.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      empresa,
      admin_user_id: adminUserId,
      sql: buildCompanyProvisionSql({ ...body, seed_defaults: body.seed_defaults !== false }),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireSuperAdmin()
    if (auth.error) return auth.error

    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'ID de empresa requerido' }, { status: 400 })

    const adminSupabase = createAdminClient()

    const { data, error } = await adminSupabase
      .from('empresas')
      .update({
        nombre_comercial: body.nombre_comercial,
        razon_social: body.razon_social || body.nombre_comercial,
        rfc: body.rfc || null,
        telefono: body.telefono || null,
        correo_contacto: body.correo_contacto || null,
        direccion: body.direccion || null,
        plan: body.plan || 'Demo',
        estado: body.estado || 'Activo',
        numero_ctpat: body.numero_ctpat || null,
        fecha_vigencia_ctpat: body.fecha_vigencia_ctpat || null,
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, empresa: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error interno' }, { status: 500 })
  }
}
