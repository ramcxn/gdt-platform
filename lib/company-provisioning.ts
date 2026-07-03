export type CompanyProvisionInput = {
  nombre_comercial: string
  razon_social?: string
  rfc?: string
  telefono?: string
  correo_contacto?: string
  direccion?: string
  plan?: string
  estado?: string
  numero_ctpat?: string
  fecha_vigencia_ctpat?: string
  seed_defaults?: boolean
}

const nullableSql = (value?: string | null) => {
  if (!value) return 'NULL'
  return `'${value.replaceAll("'", "''")}'`
}

export function buildCompanyProvisionSql(input: CompanyProvisionInput) {
  const nombre = input.nombre_comercial.trim()
  const razonSocial = input.razon_social?.trim() || nombre
  const plan = input.plan || 'Demo'
  const estado = input.estado || 'Activo'
  const seedDefaults = input.seed_defaults ?? true

  const seedBlock = seedDefaults
    ? `
  INSERT INTO public.ubicaciones_almacen (empresa_id, codigo, nombre, descripcion)
  VALUES (v_empresa_id, 'ALM-GRAL', 'Almacen general', 'Ubicacion inicial para refacciones')
  ON CONFLICT (empresa_id, codigo) DO NOTHING;

  INSERT INTO public.zonas_rondin (empresa_id, nombre, qr_code)
  VALUES
    (v_empresa_id, 'Caseta principal', 'RONDIN-CASETA-PRINCIPAL'),
    (v_empresa_id, 'Patio operativo', 'RONDIN-PATIO-OPERATIVO'),
    (v_empresa_id, 'Almacen', 'RONDIN-ALMACEN')
  ON CONFLICT (empresa_id, qr_code) DO NOTHING;`
    : ''

  return `-- ============================================================
-- GDT Platform - Provisionamiento de empresa
-- Ejecutar en Supabase SQL Editor con rol postgres/service_role.
-- Este proyecto usa una sola base multi-tenant: cada empresa se
-- separa por empresa_id y Row Level Security.
-- ============================================================

DO $$
DECLARE
  v_empresa_id uuid;
BEGIN
  INSERT INTO public.empresas (
    nombre_comercial,
    razon_social,
    rfc,
    telefono,
    correo_contacto,
    direccion,
    plan,
    estado,
    numero_ctpat,
    fecha_vigencia_ctpat
  )
  VALUES (
    ${nullableSql(nombre)},
    ${nullableSql(razonSocial)},
    ${nullableSql(input.rfc)},
    ${nullableSql(input.telefono)},
    ${nullableSql(input.correo_contacto)},
    ${nullableSql(input.direccion)},
    ${nullableSql(plan)},
    ${nullableSql(estado)},
    ${nullableSql(input.numero_ctpat)},
    ${nullableSql(input.fecha_vigencia_ctpat)}
  )
  RETURNING id INTO v_empresa_id;
${seedBlock}

  RAISE NOTICE 'Empresa creada: %', v_empresa_id;
END $$;
`
}
