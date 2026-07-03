/* eslint-disable */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
  }

  return supabaseResponse
}

export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
