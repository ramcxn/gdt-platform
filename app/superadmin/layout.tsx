/* eslint-disable */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/superadmin', label: 'Empresas', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { href: '/superadmin/provisionamiento', label: 'Provisionamiento', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8' },
  { href: '/superadmin/planes', label: 'Planes', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { href: '/superadmin/usuarios', label: 'Usuarios', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75' },
  { href: '/superadmin/metricas', label: 'Métricas', icon: 'M18 20V10 M12 20V4 M6 20v-6' },
]

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession(); const user = session?.user ?? null
  if (!user) redirect('/login')
  const { data: perfil } = await supabase.from('usuarios').select('rol,nombre').eq('id', user.id).single()
  if (perfil?.rol !== 'SuperAdmin') redirect('/dashboard')

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      {/* Top bar */}
      <header
        className="border-b px-6 py-3 flex items-center justify-between flex-shrink-0"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-gradient)' }}
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>GDT Platform</span>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
            >
              SuperAdmin
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-xs font-medium transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            Volver al App
          </Link>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{perfil?.nombre}</span>
        </div>
      </header>

      {/* Sub-nav */}
      <nav
        className="border-b px-6 flex gap-1"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
      >
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 border-transparent transition-all"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
            {item.label}
          </Link>
        ))}
      </nav>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  )
}
