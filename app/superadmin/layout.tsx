/* eslint-disable */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: perfil } = await supabase.from('usuarios').select('rol,nombre').eq('id', user.id).single()
  if (perfil?.rol !== 'SuperAdmin') redirect('/dashboard')

  return (
    <div style={{ background: '#060e1a', minHeight: '100vh' }} className="flex flex-col">
      {/* Top bar */}
      <header className="border-b border-white/5 px-6 py-3 flex items-center justify-between" style={{ background: 'rgba(10,21,38,0.95)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>⚡</div>
          <div>
            <span className="text-white font-bold text-sm">GDT Platform</span>
            <span className="ml-2 text-xs text-purple-400 font-semibold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">SuperAdmin</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">← Volver al App</Link>
          <span className="text-slate-500 text-sm">{perfil?.nombre}</span>
        </div>
      </header>

      {/* Sub-nav */}
      <nav className="border-b border-white/5 px-6 flex gap-1" style={{ background: 'rgba(10,21,38,0.9)' }}>
        {[
          { href: '/superadmin', label: '🏢 Empresas' },
          { href: '/superadmin/planes', label: '📦 Planes' },
          { href: '/superadmin/usuarios', label: '👤 Usuarios' },
          { href: '/superadmin/metricas', label: '📊 Métricas' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="px-4 py-3 text-sm text-slate-400 hover:text-white border-b-2 border-transparent hover:border-purple-400 transition-all">
            {item.label}
          </Link>
        ))}
      </nav>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  )
}
