'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Loader2, LogOut, CheckCircle2 } from 'lucide-react'
import AccesoModal from './AccesoModal'

export default function AccesoTable() {
  const supabase = createClient()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [empresaId, setEmpresaId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user.id).single()
    if (!perfil?.empresa_id) return
    setEmpresaId(perfil.empresa_id)

    const { data: rows } = await supabase
      .from('bitacora_accesos')
      .select('*')
      .eq('empresa_id', perfil.empresa_id)
      .order('hora_entrada', { ascending: false })
      .limit(50)

    setData(rows ?? [])
    setLoading(false)
  }

  const handleSalida = async (id: string) => {
    if (!confirm('¿Confirmar salida de esta persona?')) return
    await supabase.from('bitacora_accesos').update({ hora_salida: new Date().toISOString() }).eq('id', id)
    fetchData()
  }

  const filteredData = data.filter(item => {
    const term = search.toLowerCase()
    return item.nombre_persona?.toLowerCase().includes(term) || 
           item.empresa_origen?.toLowerCase().includes(term) || 
           item.tipo_persona?.toLowerCase().includes(term)
  })

  return (
    <div className="glass-card rounded-xl border border-white/5 p-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar persona o empresa..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-[#0f1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Entrada</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-white/5 text-slate-400">
            <tr>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Empresa Origen</th>
              <th className="px-4 py-3">Motivo</th>
              <th className="px-4 py-3">Entrada</th>
              <th className="px-4 py-3">Salida</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                    Cargando bitácora...
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No hay registros de acceso.
                </td>
              </tr>
            ) : (
              filteredData.map(item => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.tipo_persona === 'Visitante' ? 'bg-purple-500/10 text-purple-400' :
                      item.tipo_persona === 'Proveedor' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {item.tipo_persona}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{item.nombre_persona}</td>
                  <td className="px-4 py-3">{item.empresa_origen || '-'}</td>
                  <td className="px-4 py-3">{item.motivo_visita || '-'}</td>
                  <td className="px-4 py-3 text-emerald-400 font-medium">
                    {new Date(item.hora_entrada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="px-4 py-3">
                    {item.hora_salida ? (
                      <span className="text-slate-400">{new Date(item.hora_salida).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    ) : (
                      <span className="text-yellow-400 text-xs">Dentro</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!item.hora_salida ? (
                      <button 
                        onClick={() => handleSalida(item.id)} 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors ml-auto"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Salida
                      </button>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5 text-slate-500 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completado
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && empresaId && (
        <AccesoModal 
          empresaId={empresaId} 
          onClose={() => setIsModalOpen(false)} 
          onSaved={fetchData} 
        />
      )}
    </div>
  )
}
