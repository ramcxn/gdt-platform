/* eslint-disable */
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react'
import CatalogModal from './CatalogModal'

type TipoCatalogo = 'tractos' | 'remolques' | 'dollys' | 'operadores'

export default function CatalogTable({ tipo }: { tipo: TipoCatalogo }) {
  const supabase = createClient()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [empresaId, setEmpresaId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [tipo])

  async function fetchData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user.id).single()
    if (!perfil?.empresa_id) return
    setEmpresaId(perfil.empresa_id)

    const { data: rows } = await supabase
      .from(tipo)
      .select('*')
      .eq('empresa_id', perfil.empresa_id)
      .order(tipo === 'operadores' ? 'nombre' : 'numero', { ascending: true })

    setData(rows ?? [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return
    await supabase.from(tipo).delete().eq('id', id)
    fetchData()
  }

  const openNewModal = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const openEditModal = (item: any) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const filteredData = data.filter(item => {
    const term = search.toLowerCase()
    if (tipo === 'operadores') return item.nombre?.toLowerCase().includes(term) || item.numero_licencia?.toLowerCase().includes(term)
    return item.numero?.toLowerCase().includes(term) || item.placas?.toLowerCase().includes(term)
  })

  // Column definitions based on `tipo`
  const getColumns = () => {
    switch (tipo) {
      case 'tractos':
        return ['Número', 'Placas', 'Tipo', 'Estado']
      case 'remolques':
        return ['Número', 'Placas', 'Tipo', 'Estado']
      case 'dollys':
        return ['Número', 'Placas', 'Estado']
      case 'operadores':
        return ['Nombre', 'No. Licencia', 'Vigencia', 'Estado']
    }
  }

  return (
    <div className="glass-card rounded-xl border border-white/5 p-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
        </div>
        <button 
          onClick={openNewModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Registro</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-white/5 text-slate-400">
            <tr>
              {getColumns().map((col, i) => <th key={i} className="px-4 py-3">{col}</th>)}
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                    Cargando datos...
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No hay registros encontrados.
                </td>
              </tr>
            ) : (
              filteredData.map(item => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {tipo === 'tractos' || tipo === 'remolques' ? (
                    <>
                      <td className="px-4 py-3 font-medium text-white">{item.numero}</td>
                      <td className="px-4 py-3">{item.placas || '-'}</td>
                      <td className="px-4 py-3">{item.tipo || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${item.activo ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {item.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </>
                  ) : tipo === 'dollys' ? (
                    <>
                      <td className="px-4 py-3 font-medium text-white">{item.numero}</td>
                      <td className="px-4 py-3">{item.placas || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${item.activo ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {item.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-white">{item.nombre}</td>
                      <td className="px-4 py-3">{item.numero_licencia || '-'}</td>
                      <td className="px-4 py-3">{item.vigencia_licencia ? new Date(item.vigencia_licencia).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${item.activo ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {item.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <CatalogModal 
          tipo={tipo} 
          empresaId={empresaId!} 
          item={editingItem} 
          onClose={() => setIsModalOpen(false)} 
          onSaved={fetchData} 
        />
      )}
    </div>
  )
}
