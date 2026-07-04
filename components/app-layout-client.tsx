'use client'
import { useState, useRef } from 'react'
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

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <aside
      className="flex flex-col h-full"
      style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)' }}
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--brand-gradient)' }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">GDT Platform</p>
            <p className="text-xs" style={{ color: 'var(--sidebar-label)' }}>
              {auth?.empresaNombre || 'Cargando...'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto hide-scrollbar space-y-1">
        {visibleGroups.map(group => (
          <div key={group.label}>
            <p
              className="px-3 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: 'var(--sidebar-label)' }}
            >
              {group.label}
            </p>
            {group.items.map(item => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className="sidebar-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all"
                  style={{
                    background: active ? 'var(--sidebar-active-bg)' : 'transparent',
                    color: active ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                    fontWeight: active ? 600 : 400,
                  }}
                  onClick={() => setSidebarOpen(false)}
                  onMouseEnter={e => {
                    if (!active)
                      (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover)';
                  }}
                  onMouseLeave={e => {
                    if (!active)
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                  </svg>
                  <span className="truncate">{item.label}</span>
                  {(item as any).badge && (
                    <span
                      className="ml-auto badge-counter"
                      style={{
                        background: 'var(--accent-light)',
                        color: 'var(--accent-primary)',
                      }}
                    >
                      {(item as any).badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* SuperAdmin link */}
      {auth?.isSuperAdmin && (
        <div className="px-3 pb-2">
          <Link
            href="/superadmin"
            prefetch={false}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
            style={{
              color: '#a78bfa',
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <span>⚡</span> Panel SuperAdmin
          </Link>
        </div>
      )}

      {/* Profile / Logout */}
      <div className="px-3 py-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <Link
          href="/perfil"
          prefetch={false}
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
          style={{ background: 'var(--sidebar-hover)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'var(--accent-gradient)' }}
          >
            {auth?.userName ? auth.userName[0].toUpperCase() : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--sidebar-text-active)' }}>
              {auth?.userName}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--sidebar-label)' }}>
              {auth?.userRol || 'Cargando...'}
            </p>
          </div>
          <button
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              handleLogout()
            }}
            title="Cerrar sesión"
            className="transition-colors cursor-pointer flex-shrink-0 p-1 rounded-md hover:bg-white/10"
            style={{ color: 'var(--sidebar-label)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
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
  const [searchFocused, setSearchFocused] = useState(false)

  const today = new Date()
  const dateStr = today.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-body)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 flex-shrink-0">
        <SidebarContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex-shrink-0">
            <SidebarContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          </div>
          <div
            className="flex-1"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="border-b px-4 md:px-6 py-2.5 flex items-center gap-3 flex-shrink-0 z-10"
          style={{
            background: 'var(--bg-topbar)',
            borderColor: 'var(--border-subtle)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search bar */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg flex-1 max-w-xs transition-all"
            style={{
              background: searchFocused ? 'var(--bg-card-solid)' : 'var(--bg-hover)',
              border: `1px solid ${searchFocused ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
            }}
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              style={{ color: 'var(--text-tertiary)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              placeholder="Buscar..."
              className="w-full bg-transparent border-none outline-none text-xs"
              style={{ color: 'var(--text-primary)' }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="hidden lg:inline-flex text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-hover)', color: 'var(--text-tertiary)' }}>
              ⌘K
            </kbd>
          </div>

          <div className="flex-1" />

          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg cursor-pointer transition-colors hover:bg-white/10"
            style={{ color: 'var(--text-secondary)' }}
            title="Notificaciones"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--brand-primary)' }}
            />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg cursor-pointer transition-colors hover:bg-white/10"
            style={{ color: 'var(--text-secondary)' }}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* Date */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {dateStr}
          </div>

          <div className="w-px h-5" style={{ background: 'var(--border-subtle)' }} />

          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="hidden md:inline text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Sistema activo
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
