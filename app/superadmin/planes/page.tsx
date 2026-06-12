/* eslint-disable */
export default function PlanesPage() {
  const planes = [
    { nombre: 'Demo', precio: '$0', duracion: '30 días', modulos: ['Dashboard', 'Viajes (5)', 'Inspecciones (10)', 'Usuarios (2)'], color: '#f59e0b' },
    { nombre: 'Básico', precio: '$2,500/mes', duracion: 'Mensual', modulos: ['Todos los módulos operativos', 'Hasta 5 usuarios', 'Soporte por email'], color: '#10b981' },
    { nombre: 'Premium', precio: '$5,500/mes', duracion: 'Mensual', modulos: ['Todos los módulos', 'Hasta 20 usuarios', 'CTPAT completo', 'Soporte prioritario'], color: '#3b82f6' },
    { nombre: 'Enterprise', precio: 'A convenir', duracion: 'Anual', modulos: ['Usuarios ilimitados', 'Multi-sucursal', 'API access', 'SLA garantizado', 'Onboarding dedicado'], color: '#7c3aed' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Planes de Suscripción</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {planes.map(plan => (
          <div key={plan.nombre} className="rounded-xl border border-white/5 p-5 space-y-4" style={{ background: 'rgba(15,31,53,0.7)' }}>
            <div className="w-3 h-3 rounded-full" style={{ background: plan.color }} />
            <div>
              <h2 className="text-lg font-bold text-white">{plan.nombre}</h2>
              <p className="text-2xl font-bold mt-1" style={{ color: plan.color }}>{plan.precio}</p>
              <p className="text-xs text-slate-500">{plan.duracion}</p>
            </div>
            <ul className="space-y-1.5">
              {plan.modulos.map(m => (
                <li key={m} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span> {m}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-slate-500 text-sm">Los planes se asignan desde el panel de cada empresa. Próximamente: gestión automática de límites por plan.</p>
    </div>
  )
}
