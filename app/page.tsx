import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesBento from '@/components/landing/FeaturesBento'
import { Truck } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#0a1526] text-white relative overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Truck className="w-6 h-6 text-blue-500" />
              <span className="font-bold text-xl tracking-tight text-white">GDT Platform</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
              <a href="#features" className="hover:text-white transition-colors">Características</a>
              <Link href="#" className="hover:text-white transition-colors">Soluciones</Link>
              <Link href="#" className="hover:text-white transition-colors">Precios</Link>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <Link 
                  href="/dashboard" 
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Ir al Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    href="/login" 
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Comenzar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <HeroSection />
        <FeaturesBento />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/5 py-12 mt-20 relative z-10 bg-[#070e1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Truck className="w-5 h-5 text-slate-500" />
            <span className="font-medium">© {new Date().getFullYear()} GDT Platform. Todos los derechos reservados.</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-slate-300 transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Términos</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
