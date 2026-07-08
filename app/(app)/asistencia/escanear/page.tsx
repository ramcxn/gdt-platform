/* eslint-disable */
'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Scanner } from '@yudiel/react-qr-scanner'
import { ArrowLeft, CheckCircle2, LogIn, LogOut, AlertTriangle } from 'lucide-react'

type Resultado = { tipo: 'entrada' | 'salida'; nombre: string; hora: string } | { tipo: 'error'; mensaje: string }

export default function EscanearAsistenciaPage() {
  const supabase = createClient()
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [pausado, setPausado] = useState(false)

  const procesarCodigo = useCallback(async (codigo: string) => {
    if (procesando || pausado) return
    setProcesando(true)
    setPausado(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) throw new Error('Sesión expirada')
      const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user.id).single()
      const eid = perfil?.empresa_id
      if (!eid) throw new Error('Sin empresa asignada')

      // El QR contiene el id o el número de empleado
      const { data: empleados } = await supabase.from('empleados').select('id,nombre,numero_empleado')
        .eq('empresa_id', eid).or(`numero_empleado.eq.${codigo}` + (codigo.match(/^[0-9a-f-]{36}$/i) ? `,id.eq.${codigo}` : ''))
        .limit(1)
      const emp = empleados?.[0]
      if (!emp) throw new Error(`Empleado no encontrado para el código "${codigo}"`)

      const hoy = new Date().toISOString().slice(0, 10)
      const ahora = new Date().toISOString()
      const { data: registros } = await supabase.from('asistencia').select('*')
        .eq('empresa_id', eid).eq('empleado_id', emp.id).eq('fecha', hoy)
        .order('created_at', { ascending: false }).limit(1)
      const abierto = registros?.[0]

      if (abierto && abierto.hora_entrada && !abierto.hora_salida) {
        // Marcar salida
        const { error } = await supabase.from('asistencia').update({ hora_salida: ahora }).eq('id', abierto.id)
        if (error) throw new Error(error.message)
        setResultado({ tipo: 'salida', nombre: emp.nombre, hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) })
      } else {
        // Marcar entrada
        const { error } = await supabase.from('asistencia').insert({
          empresa_id: eid, empleado_id: emp.id, nombre_empleado: emp.nombre,
          fecha: hoy, hora_entrada: ahora, tipo: 'Normal',
        })
        if (error) throw new Error(error.message)
        setResultado({ tipo: 'entrada', nombre: emp.nombre, hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) })
      }
    } catch (e: any) {
      setResultado({ tipo: 'error', mensaje: e.message })
    } finally {
      setProcesando(false)
      setTimeout(() => { setResultado(null); setPausado(false) }, 3500)
    }
  }, [procesando, pausado])

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/asistencia" className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Escanear asistencia</h1>
          <p className="text-slate-400 text-sm">Apunta la cámara al QR de la credencial del empleado</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden relative">
        <Scanner
          onScan={(codes) => { const v = codes?.[0]?.rawValue; if (v) procesarCodigo(v) }}
          onError={() => {}}
          constraints={{ facingMode: 'environment' }}
          styles={{ container: { width: '100%' } }}
        />
        {resultado && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
            {resultado.tipo === 'error' ? (
              <div className="text-center">
                <AlertTriangle className="w-14 h-14 text-amber-400 mx-auto mb-3" />
                <p className="text-white font-semibold">{resultado.mensaje}</p>
              </div>
            ) : (
              <div className="text-center">
                {resultado.tipo === 'entrada'
                  ? <LogIn className="w-14 h-14 text-green-400 mx-auto mb-3" />
                  : <LogOut className="w-14 h-14 text-blue-400 mx-auto mb-3" />}
                <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-white text-lg font-bold">{resultado.nombre}</p>
                <p className="text-slate-300">
                  {resultado.tipo === 'entrada' ? 'Entrada registrada' : 'Salida registrada'} — {resultado.hora}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 text-center">
        Primer escaneo del día = entrada · segundo escaneo = salida.
        Los QR se generan desde el módulo Personal.
      </p>
    </div>
  )
}
