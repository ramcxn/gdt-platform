'use client'
import { useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { MODULE_GROUPS, CORE_MODULE_KEY } from '@/lib/modules'

// ─── SVG Icons ──────────────────────────────────────────────

const Icons = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  inspections: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13 12H3"/></svg>,
  access: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  patrol: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  truck: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  maintenance: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  travel: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  warehouse: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  report: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  config: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  sun: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  chevronRight: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  bolt: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
}

// ─── Module icon map ───────────────────────────────────────

const moduleIcon: Record<string, React.ReactNode> = {
  '/dashboard': Icons.dashboard,
  '/inspecciones': Icons.inspections,
  '/inspecciones/nueva': Icons.inspections,
  '/acceso': Icons.access,
  '/rondines': Icons.patrol,
  '/tractos': Icons.truck,
  '/remolques': Icons.truck,
  '/mantenimiento': Icons.maintenance,
  '/viajes': Icons.travel,
  '/almacen': Icons.warehouse,
  '/seguridad': Icons.shield,
  '/reportes': Icons.report,
  '/configuracion': Icons.config,
  '/perfil': Icons.users,
}

function getIcon(href: string): React.ReactNode {
  return moduleIcon[href] || Icons.chevronRight
}

// ─── Module group section labels ───────────────────────────

const sectionLabel: Record<string, string> = {
  'Operaciones': 'operaciones',
  'Flota': 'flota',
  'Seguridad': 'seguridad',
  'Administración': 'administración',
  'Sistema': 'sistema',
}

// ─── Sidebar ───────────────────────────────────────────────

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
    <aside className="sidebar flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent-gradient)' }}
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>GDT Platform</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{auth?.empresaNombre || 'Cargando...'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto hide-scrollbar space-y-5">
        {visibleGroups.map(group => {
          const label = sectionLabel[group.label] || group.label.toLowerCase()
          return (
            <div key={group.label}>
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)' }}>
                {label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      className={`sidebar-item flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-all ${active ? 'active' : ''}`}
                      style={{
                        background: active ? 'var(--accent-light)' : 'transparent',
                        color: active ? 'var(--accent)' : 'var(--text-secondary)',
                        fontWeight: active ? 600 : 400,
                      }}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="w-4 h-4 flex items-center justify-center flex-shrink-0" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
                        {getIcon(item.href)}
                      </span>
                      <span className="truncate">{item.label}</span>
                      {(item as any).badge && (
                        <span className="ml-auto badge-counter" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                          {(item as any).badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* SuperAdmin link */}
      {auth?.isSuperAdmin && (
        <div className="px-3 pb-3">
          <Link
            href="/superadmin"
            prefetch={false}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition-colors"
            style={{
              color: 'var(--accent)',
              background: 'var(--accent-light)',
              border: '1px solid var(--accent-border)',
            }}
          >
            <span className="w-4 h-4 flex items-center">{Icons.bolt}</span>
            Panel SuperAdmin
          </Link>
        </div>
      )}

      {/* Profile / Logout */}
      <div className="px-3 py-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-md" style={{ background: 'var(--bg-elevated)' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'var(--accent-gradient)' }}
          >
            {auth?.userName ? auth.userName[0].toUpperCase() : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-heading)' }}>
              {auth?.userName}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {auth?.userRol || 'Cargando...'}
            </p>
          </div>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); handleLogout() }}
            title="Cerrar sesión"
            className="flex-shrink-0 p-1.5 rounded-md transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
          >
            {Icons.logout}
          </button>
        </div>
      </div>
    </aside>
  )
}

// ─── Main layout ────────────────────────────────────────────

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggle: toggleTheme } = useTheme()

  const today = new Date()
  const dateStr = today.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-canvas)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:w-60 flex-shrink-0 border-r" style={{ borderColor: 'var(--border-medium)' }}>
        <SidebarContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-60 flex-shrink-0">
            <SidebarContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          </div>
          <div className="flex-1" style={{ background: 'var(--bg-overlay)' }} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="topbar flex items-center gap-3 px-4 md:px-6 py-2.5 flex-shrink-0 z-10 h-13">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 rounded-md transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => setSidebarOpen(true)}
          >
            <span className="w-5 h-5 flex items-center">{Icons.menu}</span>
          </button>

          {/* Search */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md flex-1 max-w-xs transition-all"
            style={{
              background: 'var(--bg-inset)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span className="w-4 h-4 flex items-center flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{Icons.search}</span>
            <input
              placeholder="Buscar..."
              className="w-full bg-transparent border-none outline-none text-xs"
              style={{ color: 'var(--text-body)' }}
            />
            <kbd
              className="hidden lg:inline-flex text-[10px] px-1.5 py-0.5 rounded font-sans"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
            >
              K
            </kbd>
          </div>

          <div className="flex-1" />

          {/* Notifications */}
          <button
            className="relative p-2 rounded-md transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
            title="Notificaciones"
          >
            <span className="w-4 h-4 flex items-center">{Icons.bell}</span>
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            <span className="w-4 h-4 flex items-center">{theme === 'dark' ? Icons.sun : Icons.moon}</span>
          </button>

          {/* Date */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            <span className="w-3.5 h-3.5 flex items-center">{Icons.calendar}</span>
            {dateStr}
          </div>

          <div className="w-px h-5 mx-1" style={{ background: 'var(--border-subtle)' }} />

          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }} />
            <span className="hidden md:inline text-xs" style={{ color: 'var(--text-muted)' }}>Sistema activo</span>
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
