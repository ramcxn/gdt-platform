import { Activity, FileText, Globe, MapPin, Users, Zap } from 'lucide-react'

export default function FeaturesBento() {
  const features = [
    {
      title: "Monitoreo en Tiempo Real",
      description: "Sigue cada movimiento de tu flota con precisión GPS y alertas instantáneas.",
      icon: <MapPin className="w-6 h-6 text-blue-400" />,
      colSpan: "col-span-1 md:col-span-2",
      rowSpan: "row-span-1",
      bgGradient: "from-blue-900/40 to-slate-900/80"
    },
    {
      title: "Cumplimiento CTPAT",
      description: "Auditorías y reportes automatizados para asegurar estándares internacionales.",
      icon: <Globe className="w-6 h-6 text-orange-400" />,
      colSpan: "col-span-1 md:col-span-1",
      rowSpan: "row-span-2",
      bgGradient: "from-slate-800/60 to-[#0f1f35]/80"
    },
    {
      title: "Análisis Avanzado",
      description: "Métricas de rendimiento de operadores y vehículos centralizadas.",
      icon: <Activity className="w-6 h-6 text-green-400" />,
      colSpan: "col-span-1 md:col-span-1",
      rowSpan: "row-span-1",
      bgGradient: "from-slate-800/40 to-slate-900/60"
    },
    {
      title: "Gestión Documental",
      description: "Digitaliza cartas porte, facturas e inspecciones físicas de las unidades.",
      icon: <FileText className="w-6 h-6 text-cyan-400" />,
      colSpan: "col-span-1 md:col-span-1",
      rowSpan: "row-span-1",
      bgGradient: "from-slate-800/40 to-[#0f1f35]/60"
    },
    {
      title: "Operación Eficiente",
      description: "Optimiza rutas, reduce tiempos de inactividad y mejora el ROI de cada viaje.",
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      colSpan: "col-span-1 md:col-span-2",
      rowSpan: "row-span-1",
      bgGradient: "from-indigo-900/30 to-slate-900/80"
    }
  ]

  return (
    <section id="features" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Todo lo que necesitas para escalar</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Un ecosistema de herramientas diseñado específicamente para empresas logísticas modernas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className={`glass-card rounded-2xl p-8 flex flex-col justify-between border border-white/5 bg-gradient-to-br ${feature.bgGradient} relative overflow-hidden group ${feature.colSpan} ${feature.rowSpan}`}
            >
              {/* Decorative radial gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="w-12 h-12 rounded-lg bg-slate-800/80 border border-white/10 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              
              <div className="mt-auto relative z-10">
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
