import ProvisioningConsole from './ProvisioningConsole'

export default function ProvisionamientoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Provisionamiento</h1>
        <p className="text-slate-400 text-sm mt-1">Genera el script base para dar de alta empresas nuevas en el modelo multi-tenant.</p>
      </div>
      <ProvisioningConsole />
    </div>
  )
}
