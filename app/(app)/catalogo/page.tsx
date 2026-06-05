import Link from 'next/link'
import { Truck, Box, Link as LinkIcon, UserCheck, Plus } from 'lucide-react'
import CatalogTable from '@/components/catalogo/CatalogTable'

export default async function CatalogoPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams
  const activeTab = params.tab || 'tractos'

  const tabs = [
    { id: 'tractos', name: 'Tractos', icon: Truck },
    { id: 'remolques', name: 'Remolques', icon: Box },
    { id: 'dollys', name: 'Dollys', icon: LinkIcon },
    { id: 'operadores', name: 'Operadores', icon: UserCheck },
  ]

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Catálogos</h1>
          <p className="text-slate-400 text-sm mt-1">Gestiona los tractos, remolques y operadores</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-white/10 hide-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <Link 
              key={tab.id}
              href={`/catalogo?tab=${tab.id}`}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-white/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </Link>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1">
        <CatalogTable tipo={activeTab as 'tractos' | 'remolques' | 'dollys' | 'operadores'} />
      </div>
    </div>
  )
}
