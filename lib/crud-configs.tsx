/* eslint-disable */
// Configuraciones CRUD por módulo — campos alineados al esquema real de Supabase.
import type { CrudConfig } from '@/components/crud/CrudModule'

const estadoServicio = { Pendiente: 'amber', En_Proceso: 'blue', Completado: 'green', Cancelado: 'red' }
const abiertoCerrado = { Abierta: 'amber', En_Proceso: 'blue', Cerrada: 'green' }

export const sellosConfig: CrudConfig = {
  table: 'sellos_seguridad', icon: '🔒', title: 'Sellos de Seguridad', subtitle: 'Control y trazabilidad de sellos CTPAT', addLabel: 'Registrar sello',
  fields: [
    { key: 'numero', label: 'Número', required: true, table: true },
    { key: 'tipo', label: 'Tipo', type: 'select', options: ['Botella', 'Cable', 'Plástico', 'Metálico'], table: true },
    { key: 'estado', label: 'Estado', type: 'select', required: true, options: ['Disponible', 'En_Uso', 'Roto', 'Extraviado'], table: true, badge: { Disponible: 'green', En_Uso: 'blue', Roto: 'red', Extraviado: 'red' } },
    { key: 'asignado_a', label: 'Asignado a', table: true },
    { key: 'unidad_numero', label: 'Unidad', table: true },
    { key: 'fecha_asignacion', label: 'Fecha asignación', type: 'datetime', table: true },
    { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
  ],
  kpis: [
    { icon: '🔒', label: 'Total sellos', sub: 'Inventario', count: r => r.length },
    { icon: '✅', label: 'Disponibles', sub: 'En stock', count: r => r.filter(x => x.estado === 'Disponible').length },
    { icon: '🚛', label: 'En uso', sub: 'Asignados', count: r => r.filter(x => x.estado === 'En_Uso').length },
    { icon: '⚠️', label: 'Rotos/Extraviados', sub: 'Baja', count: r => r.filter(x => x.estado === 'Roto' || x.estado === 'Extraviado').length },
  ],
}

export const visitasConfig: CrudConfig = {
  table: 'visitas_proveedores', icon: '🪪', title: 'Visitas y Proveedores', subtitle: 'Registro de entradas y salidas', addLabel: 'Registrar visita',
  fields: [
    { key: 'nombre', label: 'Nombre', required: true, table: true },
    { key: 'tipo', label: 'Tipo', type: 'select', required: true, options: ['Visita', 'Proveedor', 'Contratista', 'Transportista'], table: true, badge: { Visita: 'blue', Proveedor: 'indigo', Contratista: 'amber', Transportista: 'purple' } },
    { key: 'empresa_origen', label: 'Empresa', table: true },
    { key: 'area_visita', label: 'Área que visita', table: true },
    { key: 'numero_gafete', label: 'Gafete', table: true },
    { key: 'tiene_cita', label: '¿Tiene cita?', type: 'boolean' },
    { key: 'objetos', label: 'Objetos que ingresa', type: 'textarea' },
    { key: 'entrada', label: 'Entrada', type: 'datetime', table: true },
    { key: 'salida', label: 'Salida', type: 'datetime' },
  ],
  kpis: [
    { icon: '🪪', label: 'Registros', count: r => r.length },
    { icon: '🏢', label: 'Dentro ahora', sub: 'Sin salida', count: r => r.filter(x => x.entrada && !x.salida).length },
    { icon: '📅', label: 'Hoy', count: r => r.filter(x => x.entrada && new Date(x.entrada).toDateString() === new Date().toDateString()).length },
    { icon: '📦', label: 'Proveedores', count: r => r.filter(x => x.tipo === 'Proveedor').length },
  ],
}

export const vacacionesConfig: CrudConfig = {
  table: 'vacaciones', icon: '🏖️', title: 'Vacaciones', subtitle: 'Solicitudes y control de días', addLabel: 'Nueva solicitud',
  fields: [
    { key: 'nombre_empleado', label: 'Empleado', required: true, table: true },
    { key: 'fecha_inicio', label: 'Inicio', type: 'date', required: true, table: true },
    { key: 'fecha_fin', label: 'Fin', type: 'date', required: true, table: true },
    { key: 'dias', label: 'Días', type: 'number', table: true },
    { key: 'estado', label: 'Estado', type: 'select', required: true, options: ['Pendiente', 'Aprobada', 'Rechazada', 'Disfrutada'], table: true, badge: { Pendiente: 'amber', Aprobada: 'green', Rechazada: 'red', Disfrutada: 'blue' } },
    { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
  ],
  kpis: [
    { icon: '📋', label: 'Solicitudes', count: r => r.length },
    { icon: '⏳', label: 'Pendientes', count: r => r.filter(x => x.estado === 'Pendiente').length },
    { icon: '✅', label: 'Aprobadas', count: r => r.filter(x => x.estado === 'Aprobada').length },
    { icon: '🏖️', label: 'Días totales', count: r => r.reduce((a, x) => a + (x.dias ?? 0), 0) },
  ],
}

export const antidopingConfig: CrudConfig = {
  table: 'antidoping', icon: '🧪', title: 'Antidoping', subtitle: 'Pruebas de detección de sustancias', addLabel: 'Registrar prueba',
  fields: [
    { key: 'nombre_empleado', label: 'Empleado', required: true, table: true },
    { key: 'puesto', label: 'Puesto', table: true },
    { key: 'fecha', label: 'Fecha', type: 'datetime', required: true, table: true },
    { key: 'resultado', label: 'Resultado', type: 'select', required: true, options: ['Negativo', 'Positivo', 'Pendiente'], table: true, badge: { Negativo: 'green', Positivo: 'red', Pendiente: 'amber' } },
    { key: 'sustancias', label: 'Sustancias detectadas', table: true },
    { key: 'laboratorio', label: 'Laboratorio' },
    { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
  ],
  kpis: [
    { icon: '🧪', label: 'Pruebas', count: r => r.length },
    { icon: '✅', label: 'Negativas', count: r => r.filter(x => x.resultado === 'Negativo').length },
    { icon: '🚨', label: 'Positivas', count: r => r.filter(x => x.resultado === 'Positivo').length },
    { icon: '⏳', label: 'Pendientes', count: r => r.filter(x => x.resultado === 'Pendiente').length },
  ],
}

export const alcoholimetroConfig: CrudConfig = {
  table: 'alcoholimetro', icon: '🚨', title: 'Alcoholímetro', subtitle: 'Pruebas de alcoholemia', addLabel: 'Registrar prueba',
  fields: [
    { key: 'nombre_empleado', label: 'Empleado', required: true, table: true },
    { key: 'puesto', label: 'Puesto', table: true },
    { key: 'fecha', label: 'Fecha', type: 'datetime', required: true, table: true },
    { key: 'resultado', label: 'Resultado', type: 'select', required: true, options: ['Negativo', 'Positivo'], table: true, badge: { Negativo: 'green', Positivo: 'red' } },
    { key: 'valor_mgl', label: 'Valor (mg/L)', type: 'number', table: true },
    { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
  ],
  kpis: [
    { icon: '🚨', label: 'Pruebas', count: r => r.length },
    { icon: '✅', label: 'Negativas', count: r => r.filter(x => x.resultado === 'Negativo').length },
    { icon: '⚠️', label: 'Positivas', count: r => r.filter(x => x.resultado === 'Positivo').length },
    { icon: '📅', label: 'Este mes', count: r => r.filter(x => x.fecha && new Date(x.fecha).getMonth() === new Date().getMonth() && new Date(x.fecha).getFullYear() === new Date().getFullYear()).length },
  ],
}

export const asistenciaConfig: CrudConfig = {
  table: 'asistencia', icon: '🕐', title: 'Asistencia', subtitle: 'Control de entradas y salidas del personal', addLabel: 'Registrar asistencia',
  fields: [
    { key: 'nombre_empleado', label: 'Empleado', required: true, table: true },
    { key: 'fecha', label: 'Fecha', type: 'date', required: true, table: true },
    { key: 'hora_entrada', label: 'Hora entrada', type: 'datetime', table: true },
    { key: 'hora_salida', label: 'Hora salida', type: 'datetime', table: true },
    { key: 'tipo', label: 'Tipo', type: 'select', options: ['Normal', 'Retardo', 'Falta', 'Permiso', 'Incapacidad'], table: true, badge: { Normal: 'green', Retardo: 'amber', Falta: 'red', Permiso: 'blue', Incapacidad: 'purple' } },
    { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
  ],
  kpis: [
    { icon: '🕐', label: 'Registros', count: r => r.length },
    { icon: '📅', label: 'Hoy', count: r => r.filter(x => x.fecha === new Date().toISOString().slice(0, 10)).length },
    { icon: '⏰', label: 'Retardos', count: r => r.filter(x => x.tipo === 'Retardo').length },
    { icon: '❌', label: 'Faltas', count: r => r.filter(x => x.tipo === 'Falta').length },
  ],
}

export const personalConfig: CrudConfig = {
  table: 'empleados', icon: '👥', title: 'Personal', subtitle: 'Plantilla de empleados', addLabel: 'Nuevo empleado', orderBy: 'nombre', orderAsc: true,
  fields: [
    { key: 'nombre', label: 'Nombre', required: true, table: true },
    { key: 'numero_empleado', label: 'No. empleado', table: true },
    { key: 'puesto', label: 'Puesto', table: true },
    { key: 'departamento', label: 'Departamento', table: true },
    { key: 'fecha_ingreso', label: 'Fecha ingreso', type: 'date', table: true },
    { key: 'activo', label: 'Activo', type: 'boolean', table: true },
  ],
  kpis: [
    { icon: '👥', label: 'Empleados', count: r => r.length },
    { icon: '✅', label: 'Activos', count: r => r.filter(x => x.activo).length },
    { icon: '📁', label: 'Departamentos', count: r => new Set(r.map(x => x.departamento).filter(Boolean)).size },
    { icon: '🆕', label: 'Este año', count: r => r.filter(x => x.fecha_ingreso && new Date(x.fecha_ingreso).getFullYear() === new Date().getFullYear()).length },
  ],
}

export const mantenimientoConfig: CrudConfig = {
  table: 'mantenimiento', icon: '🔧', title: 'Mantenimiento', subtitle: 'Servicios preventivos y correctivos de unidades', addLabel: 'Programar servicio',
  fields: [
    { key: 'tracto_numero', label: 'Unidad', required: true, table: true },
    { key: 'tipo', label: 'Tipo', type: 'select', required: true, options: ['Preventivo', 'Correctivo'], table: true, badge: { Preventivo: 'blue', Correctivo: 'amber' } },
    { key: 'descripcion', label: 'Descripción', type: 'textarea', table: true },
    { key: 'fecha_programada', label: 'Programado', type: 'date', table: true },
    { key: 'fecha_realizada', label: 'Realizado', type: 'date' },
    { key: 'estado', label: 'Estado', type: 'select', required: true, options: ['Pendiente', 'En_Proceso', 'Completado', 'Cancelado'], table: true, badge: estadoServicio },
    { key: 'costo', label: 'Costo (MXN)', type: 'number' },
    { key: 'tecnico', label: 'Técnico' },
    { key: 'kilometraje', label: 'Kilometraje', type: 'number' },
    { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
  ],
  kpis: [
    { icon: '🔧', label: 'Servicios', count: r => r.length },
    { icon: '⏳', label: 'Pendientes', count: r => r.filter(x => x.estado === 'Pendiente').length },
    { icon: '⚙️', label: 'En proceso', count: r => r.filter(x => x.estado === 'En_Proceso').length },
    { icon: '💰', label: 'Costo total', count: r => r.reduce((a, x) => a + (x.costo ?? 0), 0) },
  ],
}

export const instalacionesConfig: CrudConfig = {
  table: 'mantenimiento_instalaciones', icon: '🏭', title: 'Instalaciones', subtitle: 'Mantenimiento e inspección de instalaciones', addLabel: 'Nuevo registro',
  fields: [
    { key: 'area', label: 'Área', required: true, table: true },
    { key: 'tipo', label: 'Tipo', type: 'select', options: ['Mantenimiento', 'Inspección', 'Reparación', 'Limpieza'], table: true },
    { key: 'descripcion', label: 'Descripción', type: 'textarea', table: true },
    { key: 'fecha_programada', label: 'Programado', type: 'date', table: true },
    { key: 'fecha_realizada', label: 'Realizado', type: 'date' },
    { key: 'estado', label: 'Estado', type: 'select', required: true, options: ['Pendiente', 'En_Proceso', 'Completado', 'Cancelado'], table: true, badge: estadoServicio },
    { key: 'responsable', label: 'Responsable', table: true },
    { key: 'costo', label: 'Costo (MXN)', type: 'number' },
  ],
  kpis: [
    { icon: '🏭', label: 'Registros', count: r => r.length },
    { icon: '⏳', label: 'Pendientes', count: r => r.filter(x => x.estado === 'Pendiente').length },
    { icon: '✅', label: 'Completados', count: r => r.filter(x => x.estado === 'Completado').length },
    { icon: '💰', label: 'Costo total', count: r => r.reduce((a, x) => a + (x.costo ?? 0), 0) },
  ],
}

export const analisisRutaConfig: CrudConfig = {
  table: 'analisis_ruta', icon: '🗺️', title: 'Análisis de Ruta', subtitle: 'Evaluación de riesgo por ruta', addLabel: 'Nueva ruta',
  fields: [
    { key: 'nombre_ruta', label: 'Ruta', required: true, table: true },
    { key: 'origen', label: 'Origen', required: true, table: true },
    { key: 'destino', label: 'Destino', required: true, table: true },
    { key: 'distancia_km', label: 'Distancia (km)', type: 'number', table: true },
    { key: 'nivel_riesgo', label: 'Riesgo', type: 'select', required: true, options: ['Bajo', 'Medio', 'Alto', 'Crítico'], table: true, badge: { Bajo: 'green', Medio: 'amber', Alto: 'red', Crítico: 'red' } },
    { key: 'amenazas', label: 'Amenazas identificadas', type: 'textarea' },
    { key: 'medidas', label: 'Medidas de mitigación', type: 'textarea' },
    { key: 'fecha_evaluacion', label: 'Fecha evaluación', type: 'date', table: true },
    { key: 'activo', label: 'Activa', type: 'boolean' },
  ],
  kpis: [
    { icon: '🗺️', label: 'Rutas', count: r => r.length },
    { icon: '🟢', label: 'Riesgo bajo', count: r => r.filter(x => x.nivel_riesgo === 'Bajo').length },
    { icon: '🟡', label: 'Riesgo medio', count: r => r.filter(x => x.nivel_riesgo === 'Medio').length },
    { icon: '🔴', label: 'Alto/Crítico', count: r => r.filter(x => x.nivel_riesgo === 'Alto' || x.nivel_riesgo === 'Crítico').length },
  ],
}

export const analisisRiesgosConfig: CrudConfig = {
  table: 'analisis_riesgos', icon: '⚠️', title: 'Análisis de Riesgos', subtitle: 'Matriz de riesgos operativos', addLabel: 'Nuevo riesgo',
  fields: [
    { key: 'tipo', label: 'Tipo', type: 'select', options: ['Seguridad', 'Operativo', 'Financiero', 'Legal', 'Cibernético'], table: true },
    { key: 'descripcion', label: 'Descripción', type: 'textarea', required: true, table: true },
    { key: 'area', label: 'Área', table: true },
    { key: 'probabilidad', label: 'Probabilidad', type: 'select', options: ['Baja', 'Media', 'Alta'] },
    { key: 'impacto', label: 'Impacto', type: 'select', options: ['Bajo', 'Medio', 'Alto'] },
    { key: 'nivel', label: 'Nivel', type: 'select', required: true, options: ['Bajo', 'Medio', 'Alto', 'Crítico'], table: true, badge: { Bajo: 'green', Medio: 'amber', Alto: 'red', Crítico: 'red' } },
    { key: 'estado', label: 'Estado', type: 'select', options: ['Identificado', 'En_Mitigacion', 'Controlado', 'Cerrado'], table: true, badge: { Identificado: 'amber', En_Mitigacion: 'blue', Controlado: 'green', Cerrado: 'slate' } },
    { key: 'responsable', label: 'Responsable', table: true },
  ],
  kpis: [
    { icon: '⚠️', label: 'Riesgos', count: r => r.length },
    { icon: '🔴', label: 'Alto/Crítico', count: r => r.filter(x => x.nivel === 'Alto' || x.nivel === 'Crítico').length },
    { icon: '🛡️', label: 'Controlados', count: r => r.filter(x => x.estado === 'Controlado').length },
    { icon: '🔄', label: 'En mitigación', count: r => r.filter(x => x.estado === 'En_Mitigacion').length },
  ],
}

export const ciberseguridadConfig: CrudConfig = {
  table: 'ciberseguridad', icon: '🖥️', title: 'Ciberseguridad', subtitle: 'Eventos e incidentes de seguridad informática', addLabel: 'Registrar evento',
  fields: [
    { key: 'tipo_evento', label: 'Tipo de evento', type: 'select', required: true, options: ['Phishing', 'Malware', 'Acceso_No_Autorizado', 'Fuga_De_Datos', 'Capacitación', 'Auditoría', 'Otro'], table: true },
    { key: 'descripcion', label: 'Descripción', type: 'textarea', required: true, table: true },
    { key: 'severidad', label: 'Severidad', type: 'select', required: true, options: ['Baja', 'Media', 'Alta', 'Crítica'], table: true, badge: { Baja: 'green', Media: 'amber', Alta: 'red', Crítica: 'red' } },
    { key: 'estado', label: 'Estado', type: 'select', options: ['Abierto', 'En_Investigacion', 'Resuelto'], table: true, badge: { Abierto: 'amber', En_Investigacion: 'blue', Resuelto: 'green' } },
    { key: 'fecha', label: 'Fecha', type: 'datetime', table: true },
    { key: 'responsable', label: 'Responsable', table: true },
    { key: 'accion_tomada', label: 'Acción tomada', type: 'textarea' },
  ],
  kpis: [
    { icon: '🖥️', label: 'Eventos', count: r => r.length },
    { icon: '🚨', label: 'Alta/Crítica', count: r => r.filter(x => x.severidad === 'Alta' || x.severidad === 'Crítica').length },
    { icon: '🔍', label: 'Abiertos', count: r => r.filter(x => x.estado === 'Abierto' || x.estado === 'En_Investigacion').length },
    { icon: '✅', label: 'Resueltos', count: r => r.filter(x => x.estado === 'Resuelto').length },
  ],
}

export const accionesCorrectivasConfig: CrudConfig = {
  table: 'acciones_correctivas', icon: '🛠️', title: 'Acciones Correctivas', subtitle: 'Seguimiento de no conformidades', addLabel: 'Nueva acción',
  fields: [
    { key: 'titulo', label: 'Título', required: true, table: true },
    { key: 'area', label: 'Área', table: true },
    { key: 'responsable', label: 'Responsable', table: true },
    { key: 'fecha_deteccion', label: 'Detección', type: 'date', table: true },
    { key: 'fecha_limite', label: 'Fecha límite', type: 'date', table: true },
    { key: 'fecha_cierre', label: 'Cierre', type: 'date' },
    { key: 'estado', label: 'Estado', type: 'select', required: true, options: ['Abierta', 'En_Proceso', 'Cerrada'], table: true, badge: abiertoCerrado },
    { key: 'descripcion', label: 'Descripción', type: 'textarea' },
    { key: 'causa_raiz', label: 'Causa raíz', type: 'textarea' },
    { key: 'accion_tomada', label: 'Acción tomada', type: 'textarea' },
  ],
  kpis: [
    { icon: '🛠️', label: 'Acciones', count: r => r.length },
    { icon: '📂', label: 'Abiertas', count: r => r.filter(x => x.estado === 'Abierta').length },
    { icon: '🔄', label: 'En proceso', count: r => r.filter(x => x.estado === 'En_Proceso').length },
    { icon: '⏰', label: 'Vencidas', count: r => r.filter(x => x.estado !== 'Cerrada' && x.fecha_limite && new Date(x.fecha_limite) < new Date()).length },
  ],
}

export const revisionDocumentalConfig: CrudConfig = {
  table: 'revision_documental', icon: '📄', title: 'Revisión Documental', subtitle: 'Vigencia de documentos de unidades, operadores y empresa', addLabel: 'Nuevo documento',
  fields: [
    { key: 'entidad', label: 'Entidad (unidad/operador)', required: true, table: true },
    { key: 'tipo_entidad', label: 'Tipo entidad', type: 'select', options: ['Unidad', 'Operador', 'Empresa'], table: true },
    { key: 'tipo_documento', label: 'Documento', required: true, table: true },
    { key: 'fecha_emision', label: 'Emisión', type: 'date' },
    { key: 'fecha_vencimiento', label: 'Vencimiento', type: 'date', table: true },
    { key: 'estado', label: 'Estado', type: 'select', options: ['Vigente', 'Por_Vencer', 'Vencido'], table: true, badge: { Vigente: 'green', Por_Vencer: 'amber', Vencido: 'red' } },
    { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
  ],
  kpis: [
    { icon: '📄', label: 'Documentos', count: r => r.length },
    { icon: '✅', label: 'Vigentes', count: r => r.filter(x => x.estado === 'Vigente').length },
    { icon: '⚠️', label: 'Por vencer', count: r => r.filter(x => x.estado === 'Por_Vencer').length },
    { icon: '❌', label: 'Vencidos', count: r => r.filter(x => x.estado === 'Vencido').length },
  ],
}

export const inventarioConfig: CrudConfig = {
  table: 'inventario_equipo', icon: '📦', title: 'Inventario de Equipo', subtitle: 'Equipo y herramientas de la empresa', addLabel: 'Nuevo equipo',
  fields: [
    { key: 'nombre', label: 'Nombre', required: true, table: true },
    { key: 'codigo', label: 'Código', table: true },
    { key: 'categoria', label: 'Categoría', type: 'select', options: ['Cómputo', 'Comunicación', 'Herramienta', 'Seguridad', 'Mobiliario', 'Otro'], table: true },
    { key: 'estado', label: 'Estado', type: 'select', options: ['Disponible', 'Asignado', 'En_Reparacion', 'Baja'], table: true, badge: { Disponible: 'green', Asignado: 'blue', En_Reparacion: 'amber', Baja: 'red' } },
    { key: 'asignado_a', label: 'Asignado a', table: true },
    { key: 'fecha_compra', label: 'Fecha compra', type: 'date' },
    { key: 'valor', label: 'Valor (MXN)', type: 'number', table: true },
    { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
  ],
  kpis: [
    { icon: '📦', label: 'Equipos', count: r => r.length },
    { icon: '✅', label: 'Disponibles', count: r => r.filter(x => x.estado === 'Disponible').length },
    { icon: '👤', label: 'Asignados', count: r => r.filter(x => x.estado === 'Asignado').length },
    { icon: '💰', label: 'Valor total', count: r => r.reduce((a, x) => a + (x.valor ?? 0), 0) },
  ],
}

export const inventarioOperadorConfig: CrudConfig = {
  table: 'inventario_operador', icon: '🎒', title: 'Inventario de Operador', subtitle: 'Artículos entregados a operadores', addLabel: 'Entregar artículo',
  fields: [
    { key: 'operador_nombre', label: 'Operador', required: true, table: true },
    { key: 'tipo_articulo', label: 'Artículo', required: true, table: true },
    { key: 'descripcion', label: 'Descripción', type: 'textarea' },
    { key: 'cantidad', label: 'Cantidad', type: 'number', table: true },
    { key: 'fecha_entrega', label: 'Entrega', type: 'date', table: true },
    { key: 'fecha_devolucion', label: 'Devolución', type: 'date', table: true },
    { key: 'estado', label: 'Estado', type: 'select', options: ['Entregado', 'Devuelto', 'Extraviado', 'Dañado'], table: true, badge: { Entregado: 'blue', Devuelto: 'green', Extraviado: 'red', Dañado: 'amber' } },
  ],
  kpis: [
    { icon: '🎒', label: 'Entregas', count: r => r.length },
    { icon: '📤', label: 'Entregados', count: r => r.filter(x => x.estado === 'Entregado').length },
    { icon: '📥', label: 'Devueltos', count: r => r.filter(x => x.estado === 'Devuelto').length },
    { icon: '⚠️', label: 'Extraviados/Dañados', count: r => r.filter(x => x.estado === 'Extraviado' || x.estado === 'Dañado').length },
  ],
}

export const almacenConfig: CrudConfig = {
  table: 'almacen_refacciones', icon: '🏬', title: 'Almacén de Refacciones', subtitle: 'Existencias y stock mínimo', addLabel: 'Nueva refacción', orderBy: 'nombre', orderAsc: true,
  fields: [
    { key: 'nombre', label: 'Refacción', required: true, table: true },
    { key: 'codigo', label: 'Código', table: true },
    { key: 'categoria', label: 'Categoría', type: 'select', options: ['Motor', 'Frenos', 'Suspensión', 'Eléctrico', 'Llantas', 'Filtros', 'Aceites', 'Otro'], table: true },
    { key: 'cantidad', label: 'Existencia', type: 'number', required: true, table: true },
    { key: 'cantidad_minima', label: 'Mínimo', type: 'number', table: true },
    { key: 'precio_unitario', label: 'Precio unit.', type: 'number', table: true },
    { key: 'proveedor', label: 'Proveedor' },
    { key: 'ubicacion', label: 'Ubicación' },
  ],
  kpis: [
    { icon: '🏬', label: 'Refacciones', count: r => r.length },
    { icon: '📉', label: 'Bajo mínimo', sub: 'Reordenar', count: r => r.filter(x => (x.cantidad ?? 0) <= (x.cantidad_minima ?? 0)).length },
    { icon: '📦', label: 'Piezas totales', count: r => r.reduce((a, x) => a + (x.cantidad ?? 0), 0) },
    { icon: '💰', label: 'Valor inventario', count: r => Math.round(r.reduce((a, x) => a + (x.cantidad ?? 0) * (x.precio_unitario ?? 0), 0)) },
  ],
}

export const clientesConfig: CrudConfig = {
  table: 'clientes_ctpat', icon: '🤝', title: 'Clientes', subtitle: 'Clientes y certificaciones CTPAT', addLabel: 'Nuevo cliente', orderBy: 'nombre', orderAsc: true,
  fields: [
    { key: 'nombre', label: 'Nombre', required: true, table: true },
    { key: 'rfc', label: 'RFC', table: true },
    { key: 'nivel', label: 'Nivel CTPAT', type: 'select', options: ['Certificado', 'En_Proceso', 'No_Certificado'], table: true, badge: { Certificado: 'green', En_Proceso: 'amber', No_Certificado: 'slate' } },
    { key: 'fecha_cert', label: 'Certificación', type: 'date' },
    { key: 'fecha_vencimiento', label: 'Vencimiento', type: 'date', table: true },
    { key: 'contacto', label: 'Contacto', table: true },
    { key: 'telefono', label: 'Teléfono', table: true },
    { key: 'email', label: 'Email' },
    { key: 'activo', label: 'Activo', type: 'boolean' },
  ],
  kpis: [
    { icon: '🤝', label: 'Clientes', count: r => r.length },
    { icon: '✅', label: 'Activos', count: r => r.filter(x => x.activo).length },
    { icon: '🛡️', label: 'Certificados', count: r => r.filter(x => x.nivel === 'Certificado').length },
    { icon: '⚠️', label: 'Cert. por vencer', sub: '90 días', count: r => r.filter(x => x.fecha_vencimiento && new Date(x.fecha_vencimiento) < new Date(Date.now() + 90 * 864e5) && new Date(x.fecha_vencimiento) >= new Date()).length },
  ],
}

export const zonasConfig: CrudConfig = {
  table: 'zonas_rondin', icon: '📍', title: 'Zonas de Seguridad', subtitle: 'Puntos de control para rondines', addLabel: 'Nueva zona', orderBy: 'nombre', orderAsc: true,
  fields: [
    { key: 'nombre', label: 'Nombre', required: true, table: true },
    { key: 'qr_code', label: 'Código QR', table: true },
    { key: 'activo', label: 'Activa', type: 'boolean', table: true },
  ],
  kpis: [
    { icon: '📍', label: 'Zonas', count: r => r.length },
    { icon: '✅', label: 'Activas', count: r => r.filter(x => x.activo).length },
    { icon: '🚫', label: 'Inactivas', count: r => r.filter(x => !x.activo).length },
    { icon: '🔳', label: 'Con QR', count: r => r.filter(x => x.qr_code).length },
  ],
}

export const liquidacionesConfig: CrudConfig = {
  table: 'liquidaciones', icon: '💵', title: 'Liquidaciones', subtitle: 'Pagos a operadores por viaje', addLabel: 'Nueva liquidación',
  fields: [
    { key: 'operador_nombre', label: 'Operador', required: true, table: true },
    { key: 'periodo', label: 'Periodo', table: true },
    { key: 'fecha', label: 'Fecha', type: 'datetime', table: true },
    { key: 'monto_base', label: 'Monto base', type: 'number', required: true, table: true },
    { key: 'bonos', label: 'Bonos', type: 'number' },
    { key: 'deducciones', label: 'Deducciones', type: 'number' },
    { key: 'total', label: 'Total', type: 'number', table: true },
    { key: 'estado', label: 'Estado', type: 'select', options: ['Pendiente', 'Pagada', 'Cancelada'], table: true, badge: { Pendiente: 'amber', Pagada: 'green', Cancelada: 'red' } },
    { key: 'notas', label: 'Notas', type: 'textarea' },
  ],
  kpis: [
    { icon: '💵', label: 'Liquidaciones', count: r => r.length },
    { icon: '⏳', label: 'Pendientes', count: r => r.filter(x => x.estado === 'Pendiente').length },
    { icon: '✅', label: 'Pagadas', count: r => r.filter(x => x.estado === 'Pagada').length },
    { icon: '💰', label: 'Total pagado', count: r => Math.round(r.filter(x => x.estado === 'Pagada').reduce((a, x) => a + (x.total ?? 0), 0)) },
  ],
}

export const operadoresConfig: CrudConfig = {
  table: 'operadores', icon: '🧑‍✈️', title: 'Operadores', subtitle: 'Choferes y licencias', addLabel: 'Nuevo operador', orderBy: 'nombre', orderAsc: true,
  fields: [
    { key: 'nombre', label: 'Nombre', required: true, table: true },
    { key: 'numero_licencia', label: 'No. licencia', table: true },
    { key: 'vigencia_licencia', label: 'Vigencia licencia', type: 'date', table: true },
    { key: 'activo', label: 'Activo', type: 'boolean', table: true },
  ],
  kpis: [
    { icon: '🧑‍✈️', label: 'Operadores', count: r => r.length },
    { icon: '✅', label: 'Activos', count: r => r.filter(x => x.activo).length },
    { icon: '⚠️', label: 'Licencia por vencer', sub: '60 días', count: r => r.filter(x => x.vigencia_licencia && new Date(x.vigencia_licencia) < new Date(Date.now() + 60 * 864e5) && new Date(x.vigencia_licencia) >= new Date()).length },
    { icon: '❌', label: 'Licencia vencida', count: r => r.filter(x => x.vigencia_licencia && new Date(x.vigencia_licencia) < new Date()).length },
  ],
}
