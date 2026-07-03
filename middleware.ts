/* eslint-disable */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { resolveModuleKeyForPath } from '@/lib/modules'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Lectura de sesión desde la cookie (sin llamada de red).
  // La protección real de datos la garantiza RLS en Supabase; este gate solo decide redirecciones.
  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = request.nextUrl

  // Rutas públicas
  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/invite') || pathname === '/') {
    if (session && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // Sin sesión → login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protección rutas SuperAdmin: aquí sí validamos contra el servidor
  if (pathname.startsWith('/superadmin')) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const { data: perfil } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single()
    if (perfil?.rol !== 'SuperAdmin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // Gate de módulos: bloquea acceso directo por URL a módulos no habilitados
  // para la empresa del usuario. Solo corre para rutas que mapean a un módulo
  // configurable (no /dashboard, /perfil, /api, etc.), y es una sola consulta
  // indexada por PK (empresa_id, modulo_key) — igual de liviana que el check
  // de SuperAdmin de arriba.
  const moduloKey = resolveModuleKeyForPath(pathname)
  if (moduloKey) {
    const { data: perfil } = await supabase
      .from('usuarios')
      .select('empresa_id, rol, restriccion_modulos')
      .eq('id', session.user.id)
      .single()

    if (perfil && perfil.rol !== 'SuperAdmin' && perfil.empresa_id) {
      const { data: modulo } = await supabase
        .from('empresa_modulos')
        .select('modulo_key')
        .eq('empresa_id', perfil.empresa_id)
        .eq('modulo_key', moduloKey)
        .maybeSingle()

      if (!modulo) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // Capa adicional: si el usuario tiene su propia restricción de módulos,
      // debe estar también en su lista (subconjunto de lo que la empresa habilitó).
      if (perfil.restriccion_modulos) {
        const { data: usuarioModulo } = await supabase
          .from('usuario_modulos')
          .select('modulo_key')
          .eq('usuario_id', session.user.id)
          .eq('modulo_key', moduloKey)
          .maybeSingle()

        if (!usuarioModulo) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    }
  }

  return supabaseResponse
}

export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
