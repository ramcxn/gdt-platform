'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail]       = useState('admin@helu.demo')
  const [password, setPassword] = useState('Demo1234!')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router = useRouter()
  const supabaseRef = useRef(undefined as ReturnType<typeof createClient> | undefined)

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient()
    return supabaseRef.current
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await getSupabase().auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a1526 0%, #0f1f35 40%, #1a365d 70%, #1E3A5F 100%)' }}
    >
      {/* Decorative orbs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1E3A5F)' }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">GDT Platform</h1>
          <p className="text-blue-200/70 mt-1 text-sm">Gestión del Transporte CTPAT</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl shadow-2xl p-8 border"
          style={{
            background: 'rgba(15, 31, 53, 0.6)',
            borderColor: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <h2 className="text-xl font-semibold text-white mb-6">Iniciar sesión</h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                placeholder="usuario@empresa.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg text-white text-sm font-semibold transition-all disabled:opacity-60 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando...
                </span>
              ) : (
                'Entrar al sistema'
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs text-center" style={{ color: 'var(--sidebar-label)' }}>
              Credenciales demo
            </p>
            <div
              className="mt-2 rounded-lg p-3 font-mono text-xs space-y-1"
              style={{ background: 'rgba(0,0,0,0.2)' }}
            >
              <div>
                <span className="text-slate-500">email:</span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>admin@helu.demo</span>
              </div>
              <div>
                <span className="text-slate-500">pass:</span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>Demo1234!</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © 2026 gestiondeltransporte.com
        </p>
      </div>
    </div>
  )
}
