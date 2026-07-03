'use client'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { MODULE_GROUPS, CORE_MODULE_KEY } from '@/lib/modules'

function SidebarContent({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (v: boolean) => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const auth = useAuth()

  // null = sin restricción (SuperAdmin / sin empresa). Dashboard siempre visible.
  const enabledModules = auth?.enabledModules ?? null
  const visibleGroups = MODULE_GROUPS
    .map(group => ({
      label: group.label,
      items: group.items.filter(item =>
        item.key === CORE_MODULE_KEY || enabledModules === null || enabledModules.includes(item.key)
      ),
    }))
    .filter(group => group.items.length > 0)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="flex flex-col h-full" style={{ background: 'var(--bg-sidebar)' }}>
      {/* Brand */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border-default)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">GDT Platform</p>
            <p className="text-blue-300 text-xs" style={{ color: 'var(--sidebar-text)' }}>{auth?.empresaNombre || 'Cargando...'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 overflow-y-auto hide-scrollbar space-y-1">
        {visibleGroups.map(group => (
          <div key={group.label}>
            <p className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--sidebar-label)' }}>{group.label}</p>
            {group.items.map(item => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${active ? 'text-white font-medium' : ''}`}
                  style={{
                    background: active ? 'var(--sidebar-active-bg)' : 'transparent',
                    color: active ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
                  }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                  </svg>
                  <span className="truncate text-xs">{item.label}</span>
                  {(item as any).badge && <span className="ml-auto bg-blue-500/20 text-blue-300 text-xs px-1.5 py-0.5 rounded-full border border-blue-500/30 flex-shrink-0">{(item as any).badge}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {auth?.isSuperAdmin && (
        <div className="px-3 pb-1">
          <Link href="/superadmin"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-purple-300 hover:bg-purple-500/10 text-xs font-semibold transition-colors border border-purple-500/20">
            ⚡ Panel SuperAdmin
          </Link>
        </div>
      )}

      <div className="px-3 py-3 border-t" style={{ borderColor: 'var(--border-default)' }}>
        <Link href="/perfil" onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
          style={{ background: 'var(--bg-hover)', '--hover-bg': 'var(--bg-hover-strong)' } as React.CSSProperties}
        >
          <div className="w-7 h-7 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {auth?.userName ? auth.userName[0].toUpperCase() : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{auth?.userName}</p>
            <p className="text-xs" style={{ color: 'var(--sidebar-text)' }}>{auth?.userRol || 'Cargando...'}</p>
          </div>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); handleLogout() }}
            title="Cerrar sesión"
            className="transition-colors cursor-pointer flex-shrink-0"
            style={{ color: 'var(--sidebar-text)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </Link>
      </div>
    </aside>
  )
}

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggle: toggleTheme } = useTheme()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-body)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 flex-shrink-0">
        <SidebarContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-56 flex-shrink-0">
            <SidebarContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          </div>
          <div className="flex-1" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="border-b px-4 py-3 flex items-center gap-3 flex-shrink-0 z-10"
          style={{
            background: 'var(--glass-bg)',
            borderColor: 'var(--border-subtle)',
            backdropFilter: 'blur(12px)',
          }}>
          <button className="md:hidden p-1.5 rounded-lg cursor-pointer" style={{ color: 'var(--text-secondary)' }}
            onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="p-1.5 rounded-lg cursor-pointer transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <div className="flex-1" />
          <div className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
            {new Date().toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="w-px h-5" style={{ background: 'var(--border-default)' }} />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Sistema activo</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  )
}
