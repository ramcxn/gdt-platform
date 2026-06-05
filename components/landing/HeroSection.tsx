import Link from 'next/link'
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react'

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[500px] overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[20%] w-72 h-72 bg-blue-500/30 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute top-[20%] right-[20%] w-72 h-72 bg-orange-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[40%] w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in-up border border-blue-500/30">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-200">Certificación CTPAT Gestionada</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400">
          Revoluciona tu <br className="hidden md:block" /> Gestión de Transporte
        </h1>
        
        <p className="mt-4 max-w-2xl text-lg md:text-xl text-slate-300 mx-auto mb-10">
          Plataforma integral para optimizar tus operaciones logísticas, asegurar cumplimiento aduanero y potenciar la eficiencia de tu flota en tiempo real.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/login" 
            className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all duration-200 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
          >
            Comenzar ahora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a 
            href="#features" 
            className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 glass hover:bg-white/10 text-white rounded-lg font-semibold transition-all duration-200"
          >
            Explorar características
          </a>
        </div>

        {/* Dashboard Preview Image/Mockup */}
        <div className="mt-20 relative mx-auto max-w-5xl">
          <div className="rounded-2xl border border-white/10 bg-[#0f1f35]/80 backdrop-blur-xl shadow-2xl overflow-hidden p-2">
            <div className="h-6 bg-slate-800/50 rounded-t-xl flex items-center px-4 gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="aspect-[16/9] bg-gradient-to-br from-slate-900 to-[#0a1526] rounded-xl flex items-center justify-center border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
              <div className="relative z-10 flex flex-col items-center gap-4">
                <Truck className="w-16 h-16 text-blue-500/50" />
                <span className="text-slate-400 font-medium tracking-widest uppercase">GDT Platform Dashboard</span>
              </div>
            </div>
          </div>
          
          {/* Decorative gradients for the mockup */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-orange-500 rounded-[20px] blur opacity-20 -z-10"></div>
        </div>
      </div>
    </div>
  )
}
