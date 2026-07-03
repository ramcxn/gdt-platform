'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/supabase/server-utils'

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function numberValue(formData: FormData, key: string) {
  const value = text(formData, key)
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

async function requireContext() {
  const { user, empresaId } = await getSessionContext()
  if (!user || !empresaId) throw new Error('Sesion no valida')
  return { user, empresaId }
}

async function nextSolicitudFolio(supabase: Awaited<ReturnType<typeof createClient>>, empresaId: string) {
  const today = new Date().toISOString().slice(0, 10)
  const { count } = await supabase
    .from('solicitudes_refacciones')
    .select('id', { count: 'exact', head: true })
    .eq('empresa_id', empresaId)
    .gte('created_at', `${today}T00:00:00`)
  return `SOL-${today.replace(/-/g, '')}-${String((count ?? 0) + 1).padStart(4, '0')}`
}

export async function createWarehouseLocation(formData: FormData) {
  const supabase = await createClient()
  const { user, empresaId } = await requireContext()

  await supabase.from('ubicaciones_almacen').insert({
    empresa_id: empresaId,
    codigo: text(formData, 'codigo'),
    descripcion: text(formData, 'descripcion'),
    tipo: text(formData, 'tipo') ?? 'estanteria',
    capacidad: numberValue(formData, 'capacidad'),
    created_by: user.id,
  })

  revalidatePath('/almacen')
  revalidatePath('/almacen/ubicaciones')
}

export async function createWarehousePart(formData: FormData) {
  const supabase = await createClient()
  const { user, empresaId } = await requireContext()

  await supabase.from('refacciones').insert({
    empresa_id: empresaId,
    numero_parte: text(formData, 'numero_parte'),
    descripcion: text(formData, 'descripcion'),
    categoria: text(formData, 'categoria') ?? 'General',
    proveedor: text(formData, 'proveedor') ?? 'Por definir',
    precio_unitario: numberValue(formData, 'precio_unitario') ?? 0,
    unidad_medida: text(formData, 'unidad_medida') ?? 'PZA',
    ubicacion_principal: text(formData, 'ubicacion_principal'),
    stock_minimo: numberValue(formData, 'stock_minimo') ?? 0,
    stock_maximo: numberValue(formData, 'stock_maximo') ?? 100,
    punto_reorden: numberValue(formData, 'punto_reorden') ?? 10,
    requiere_serie: formData.get('requiere_serie') === 'on',
    tiene_caducidad: formData.get('tiene_caducidad') === 'on',
    dias_vida_util: numberValue(formData, 'dias_vida_util'),
    notas: text(formData, 'notas'),
    created_by: user.id,
  })

  revalidatePath('/almacen')
  revalidatePath('/almacen/catalogo')
}

export async function receiveWarehousePart(formData: FormData) {
  const supabase = await createClient()
  const { user, empresaId } = await requireContext()

  const refaccionId = text(formData, 'refaccion_id')
  const ubicacionId = text(formData, 'ubicacion_id')
  const costoUnitario = numberValue(formData, 'costo_unitario') ?? 0

  const { data: inventario } = await supabase
    .from('inventario_refacciones')
    .insert({
      empresa_id: empresaId,
      refaccion_id: refaccionId,
      numero_serie: text(formData, 'numero_serie'),
      lote: text(formData, 'lote'),
      fecha_recepcion: text(formData, 'fecha_recepcion') ?? new Date().toISOString().slice(0, 10),
      fecha_caducidad: text(formData, 'fecha_caducidad'),
      ubicacion_id: ubicacionId,
      estado: 'disponible',
      costo_unitario: costoUnitario,
      proveedor: text(formData, 'proveedor') ?? 'Por definir',
      documento_recepcion: text(formData, 'documento_recepcion'),
      created_by: user.id,
    })
    .select('id')
    .single()

  if (inventario?.id) {
    await supabase.from('movimientos_refacciones').insert({
      empresa_id: empresaId,
      tipo_movimiento: 'entrada',
      refaccion_id: refaccionId,
      inventario_id: inventario.id,
      cantidad: 1,
      ubicacion_destino: ubicacionId,
      costo_unitario: costoUnitario,
      costo_total: costoUnitario,
      documento_referencia: text(formData, 'documento_recepcion'),
      observaciones: text(formData, 'observaciones'),
      created_by: user.id,
    })
  }

  revalidatePath('/almacen')
  revalidatePath('/almacen/recepcion')
  revalidatePath('/almacen/inventario')
}

export async function createWarehouseRequest(formData: FormData) {
  const supabase = await createClient()
  const { user, empresaId } = await requireContext()
  const folio = await nextSolicitudFolio(supabase, empresaId)

  const { data: solicitud } = await supabase
    .from('solicitudes_refacciones')
    .insert({
      empresa_id: empresaId,
      folio,
      unidad: text(formData, 'unidad') ?? 'Sin unidad',
      prioridad: text(formData, 'prioridad') ?? 'normal',
      fecha_requerida: text(formData, 'fecha_requerida'),
      observaciones: text(formData, 'observaciones'),
      solicitante: user.id,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (solicitud?.id) {
    const detalles = [0, 1, 2]
      .map(index => ({
        empresa_id: empresaId,
        solicitud_id: solicitud.id,
        refaccion_id: text(formData, `refaccion_${index}`),
        cantidad_solicitada: numberValue(formData, `cantidad_${index}`) ?? 0,
      }))
      .filter(item => item.refaccion_id && item.cantidad_solicitada > 0)

    if (detalles.length) {
      await supabase.from('detalle_solicitudes_refacciones').insert(detalles)
    }
  }

  revalidatePath('/almacen')
  revalidatePath('/almacen/solicitudes')
}

export async function updateWarehouseRequestState(formData: FormData) {
  const supabase = await createClient()
  const solicitudId = text(formData, 'solicitud_id')
  const estado = text(formData, 'estado')
  if (!solicitudId || !estado) return

  await supabase
    .from('solicitudes_refacciones')
    .update({
      estado,
      fecha_aprobacion: estado === 'aprobada' ? new Date().toISOString() : undefined,
      fecha_completada: estado === 'completada' ? new Date().toISOString() : undefined,
    })
    .eq('id', solicitudId)

  revalidatePath('/almacen')
  revalidatePath('/almacen/solicitudes')
}

export async function goToWarehouse() {
  redirect('/almacen')
}
