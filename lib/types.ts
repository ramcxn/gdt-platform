export type TipoMovimiento = 'Entrada' | 'Salida'
export type RolUsuario = 'SuperAdmin' | 'Admin_Empresa' | 'Supervisor' | 'Operador' | 'Guardia' | 'Chofer'

export interface Empresa {
  id: string
  nombre_comercial: string
  razon_social?: string
  rfc?: string
  plan: string
  estado: string
  config_ui: { primary_color: string; logo_url: string | null }
}

export interface Usuario {
  id: string
  empresa_id: string
  nombre: string
  rol: RolUsuario
  activo: boolean
}

export interface Tracto {
  id: string
  empresa_id: string
  numero: string
  tipo?: string
  placas?: string
}

export interface Remolque {
  id: string
  empresa_id: string
  numero: string
  tipo?: string
  placas?: string
}

export interface Dolly {
  id: string
  empresa_id: string
  numero: string
  placas?: string
}

export interface Operador {
  id: string
  empresa_id: string
  nombre: string
  numero_licencia?: string
  vigencia_licencia?: string
}

export interface InspeccionCTpat {
  id: string
  empresa_id: string
  tipo_movimiento: TipoMovimiento
  fecha: string
  tracto_numero?: string
  placas_tracto?: string
  unidad_negocio?: string
  kilometraje?: number
  operador_nombre?: string
  numero_licencia?: string
  vigencia_licencia?: string
  cliente?: string
  origen?: string
  destino?: string
  remolque1_numero?: string
  remolque1_tipo?: string
  remolque1_status?: string
  remolque1_sello?: boolean
  remolque1_num_sello?: string
  remolque2_numero?: string
  remolque2_tipo?: string
  remolque2_sello?: boolean
  dolly_numero?: string
  checklist_tracto?: string[]
  checklist_remolques?: string[]
  limpieza_unidad?: boolean
  fumigacion?: boolean
  status_llantas?: boolean
  danos_fisicos?: boolean
  info_mantenimiento?: string
  firma_url?: string
  foto_tracto_url?: string
  created_at: string
}
