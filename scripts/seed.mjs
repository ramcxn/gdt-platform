/**
 * GDT Platform — Seed Script (sin dependencias externas, usa fetch nativo)
 * Crea empresa HELU, usuario admin y datos de demostración.
 * Uso: node scripts/seed.mjs   (requiere Node 18+)
 */

const URL_BASE   = 'https://shegkoqkqyufldexfhff.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZWdrb3FrcXl1ZmxkZXhmaGZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5MDM0NSwiZXhwIjoyMDk2MTY2MzQ1fQ.aEi0Q8sjwT752iQnQDUES_HzW74FA_5Lp3DzMYFxPIM'

const HEADERS = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation,resolution=merge-duplicates',
}

async function rest(method, path, body) {
  const res = await fetch(`${URL_BASE}${path}`, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) throw new Error(`${res.status} ${path} — ${JSON.stringify(data)}`)
  return data
}

async function adminPost(path, body) {
  const res = await fetch(`${URL_BASE}${path}`, {
    method: 'POST',
    headers: { ...HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

async function seed() {
  console.log('🌱 Iniciando seed...\n')

  // 1. Empresa HELU — buscar existente o crear nueva
  let empresa
  const existing = await rest('GET', '/rest/v1/empresas?nombre_comercial=eq.HELU Transportes&limit=1', null)
  if (existing?.length > 0) {
    empresa = existing[0]
    console.log(`✅ Empresa ya existe: ${empresa.nombre_comercial} (${empresa.id})`)
  } else {
    const created = await rest('POST', '/rest/v1/empresas', [{
      nombre_comercial: 'HELU Transportes',
      razon_social: 'HELU Logística y Transportes S.A. de C.V.',
      rfc: 'HLT200101ABC',
      plan: 'Premium',
      estado: 'Activo',
      config_ui: { primary_color: '#1E3A5F', secondary_color: '#2E6DA4', logo_url: null },
    }])
    empresa = created[0]
    console.log(`✅ Empresa creada: ${empresa.nombre_comercial} (${empresa.id})`)
  }
  const EID = empresa.id

  // 2. Usuario admin via Auth Admin API
  const authRes = await adminPost('/auth/v1/admin/users', {
    email: 'admin@helu.demo',
    password: 'Demo1234!',
    email_confirm: true,
    user_metadata: { nombre: 'Admin HELU', rol: 'Admin_Empresa' },
  })
  const uid = authRes?.id
  if (uid) {
    await rest('POST', '/rest/v1/usuarios?on_conflict=id', [{
      id: uid,
      empresa_id: EID,
      nombre: 'Admin HELU',
      rol: 'Admin_Empresa',
    }])
    console.log(`✅ Usuario: admin@helu.demo / Demo1234!`)
  } else {
    // Si ya existe, buscar el id
    console.log('   (usuario ya existía, buscando id...)')
    const users = await rest('GET', '/auth/v1/admin/users', null)
    const existing = users?.users?.find(u => u.email === 'admin@helu.demo')
    if (existing) {
      await rest('POST', '/rest/v1/usuarios?on_conflict=id', [{
        id: existing.id, empresa_id: EID, nombre: 'Admin HELU', rol: 'Admin_Empresa',
      }])
      console.log(`✅ Usuario vinculado: ${existing.id}`)
    }
  }

  // 3. Tractos
  const tractos = [
    { empresa_id: EID, numero: 'T03',  tipo: 'TRACTOCAMION', placas: '38AP8R' },
    { empresa_id: EID, numero: 'T08',  tipo: 'TRACTOCAMION', placas: '97AN6A' },
    { empresa_id: EID, numero: 'T10',  tipo: 'TRACTOCAMION', placas: '119DL8' },
    { empresa_id: EID, numero: 'T12',  tipo: 'TRACTOCAMION', placas: '98AN6A' },
    { empresa_id: EID, numero: 'T25',  tipo: 'TRACTOCAMION', placas: '573EN3' },
    { empresa_id: EID, numero: 'T120', tipo: 'TRACTOCAMION', placas: '86BF4W' },
    { empresa_id: EID, numero: 'C50',  tipo: 'CAJA_SECA',    placas: '144WP2' },
    { empresa_id: EID, numero: 'C53',  tipo: 'CAJA_SECA',    placas: '784WT4' },
  ]
  await rest('POST', '/rest/v1/tractos?on_conflict=empresa_id,numero', tractos)
  console.log(`✅ ${tractos.length} tractos`)

  // 4. Remolques
  const remolques = [
    { empresa_id: EID, numero: 'J12', tipo: 'VOLTEO',    placas: '38AP8R' },
    { empresa_id: EID, numero: 'J21', tipo: 'VOLTEO',    placas: '38AP8R' },
    { empresa_id: EID, numero: 'J40', tipo: 'TOLVA',     placas: '573EN3' },
    { empresa_id: EID, numero: 'J41', tipo: 'TOLVA',     placas: '573EN3' },
    { empresa_id: EID, numero: 'C57', tipo: 'CAJA_SECA', placas: '840WT4' },
  ]
  await rest('POST', '/rest/v1/remolques?on_conflict=empresa_id,numero', remolques)
  console.log(`✅ ${remolques.length} remolques`)

  // 5. Dollys
  const dollys = [
    { empresa_id: EID, numero: 'D01' },
    { empresa_id: EID, numero: 'D11' },
    { empresa_id: EID, numero: 'D15' },
    { empresa_id: EID, numero: 'D17' },
  ]
  await rest('POST', '/rest/v1/dollys?on_conflict=empresa_id,numero', dollys)
  console.log(`✅ ${dollys.length} dollys`)

  // 6. Operadores — solo insertar si no existen
  const opExist = await rest('GET', `/rest/v1/operadores?empresa_id=eq.${EID}&limit=1`, null)
  if (opExist?.length === 0) {
    const operadores = [
      { empresa_id: EID, nombre: 'JORGE ALBERTO CISNEROS BANDA',  numero_licencia: 'LFD00035013', vigencia_licencia: '2025-10-06' },
      { empresa_id: EID, nombre: 'OSCAR JAVIER NUÑEZ VILLANUEVA', numero_licencia: 'TAMP103371',  vigencia_licencia: '2024-11-07' },
      { empresa_id: EID, nombre: 'JOEL GUADALUPE ALEMAN ROEL',    numero_licencia: 'TAMP310854',  vigencia_licencia: '2025-04-10' },
      { empresa_id: EID, nombre: 'JESUS EDMUNDO ARMENTA TELLO',   numero_licencia: 'COAH110306',  vigencia_licencia: '2025-08-10' },
      { empresa_id: EID, nombre: 'MARIO ROBERTO GARCIA SANCHEZ',  numero_licencia: 'NL440012',    vigencia_licencia: '2026-03-15' },
    ]
    await rest('POST', '/rest/v1/operadores', operadores)
    console.log(`✅ ${operadores.length} operadores`)
  } else {
    console.log('✅ Operadores ya existen, omitiendo')
  }

  // 7. Inspecciones de muestra — solo si no hay ninguna aún
  const inspExist = await rest('GET', `/rest/v1/inspecciones_ctpat?empresa_id=eq.${EID}&limit=1`, null)
  if (inspExist?.length > 0) {
    console.log('✅ Inspecciones ya existen, omitiendo')
  } else {
    const CT = ['Defensa','Motor','Cabina','Piso de cabina','Tanque combustible','Mofle/escape','Quinta rueda']
    const CR = ['Llantas','Paredes','Piso','Techo','Puertas','Bisagras','Porta sellos','Tornillos/Tuercas','Soldadura/Remaches']

    // Plantilla base — todos los objetos DEBEN tener exactamente las mismas claves (PGRST102)
    const base = {
      empresa_id: null, tipo_movimiento: null, fecha: null,
      tracto_numero: null, placas_tracto: null, unidad_negocio: null, kilometraje: null,
      operador_nombre: null, numero_licencia: null, vigencia_licencia: null,
      cliente: null, origen: null, destino: null, procedencia_unidad: false,
      remolque1_numero: null, remolque1_tipo: null, remolque1_placas: null,
      remolque1_status: 'Vacio', remolque1_sello: false, remolque1_num_sello: null,
      remolque2_numero: null, remolque2_tipo: null, remolque2_placas: null, remolque2_sello: false,
      dolly_numero: null,
      checklist_tracto: [], checklist_remolques: [],
      limpieza_unidad: false, fumigacion: false, status_llantas: false,
      danos_fisicos: false, info_mantenimiento: null,
      firma_url: null, foto_tracto_url: null, foto_remolque_url: null, foto_dano_url: null,
    }

    const inspecciones = [
      { ...base, empresa_id: EID, tipo_movimiento: 'Entrada',
        fecha: new Date(Date.now() - 2*3600000).toISOString(),
        tracto_numero: 'T25', placas_tracto: '573EN3', unidad_negocio: 'Construcción', kilometraje: 48500,
        operador_nombre: 'JORGE ALBERTO CISNEROS BANDA', numero_licencia: 'LFD00035013',
        cliente: 'CEMEX Monterrey', origen: 'Apodaca NL', destino: 'Saltillo COAH',
        remolque1_numero: 'J40', remolque1_tipo: 'TOLVA', remolque1_status: 'Vacio',
        remolque1_sello: true, remolque1_num_sello: 'SL-2024-001',
        remolque2_numero: 'J41', remolque2_tipo: 'TOLVA', remolque2_sello: false,
        dolly_numero: 'D15', checklist_tracto: CT, checklist_remolques: CR,
        limpieza_unidad: true, fumigacion: true, status_llantas: true, danos_fisicos: false },

      { ...base, empresa_id: EID, tipo_movimiento: 'Salida',
        fecha: new Date(Date.now() - 5*3600000).toISOString(),
        tracto_numero: 'T03', placas_tracto: '38AP8R', unidad_negocio: 'Áridos',
        operador_nombre: 'OSCAR JAVIER NUÑEZ VILLANUEVA', numero_licencia: 'TAMP103371',
        cliente: 'PREZA Industrial', origen: 'Allende NL', destino: 'Monterrey NL',
        remolque1_numero: 'J12', remolque1_tipo: 'VOLTEO', remolque1_status: 'Cargado',
        remolque1_sello: true, remolque1_num_sello: 'SL-2024-002',
        dolly_numero: 'D17', checklist_tracto: CT, checklist_remolques: CR,
        limpieza_unidad: true, fumigacion: false, status_llantas: true,
        danos_fisicos: true, info_mantenimiento: 'Golpe menor en defensa trasera derecha. Reportado a taller.' },

      { ...base, empresa_id: EID, tipo_movimiento: 'Entrada',
        fecha: new Date(Date.now() - 26*3600000).toISOString(),
        tracto_numero: 'T08', placas_tracto: '97AN6A', unidad_negocio: 'Granel',
        operador_nombre: 'JOEL GUADALUPE ALEMAN ROEL', numero_licencia: 'TAMP310854',
        cliente: 'TERNIUM México', origen: 'San Nicolás NL', destino: 'Pesquería NL',
        remolque1_numero: 'C57', remolque1_tipo: 'CAJA_SECA', remolque1_status: 'Cargado',
        remolque1_sello: true, remolque1_num_sello: 'SL-2024-003',
        checklist_tracto: CT, checklist_remolques: CR,
        limpieza_unidad: true, fumigacion: true, status_llantas: true, danos_fisicos: false },

      { ...base, empresa_id: EID, tipo_movimiento: 'Salida',
        fecha: new Date(Date.now() - 28*3600000).toISOString(),
        tracto_numero: 'T10', placas_tracto: '119DL8', unidad_negocio: 'Construcción',
        operador_nombre: 'JESUS EDMUNDO ARMENTA TELLO', numero_licencia: 'COAH110306',
        cliente: 'GCC Cementos', origen: 'Monterrey NL', destino: 'Chihuahua CHIH',
        remolque1_numero: 'J40', remolque1_tipo: 'TOLVA', remolque1_status: 'Vacio',
        remolque1_sello: false, checklist_tracto: CT.slice(0,5), checklist_remolques: CR.slice(0,6),
        limpieza_unidad: false, fumigacion: false, status_llantas: true, danos_fisicos: false },
    ]

    await rest('POST', '/rest/v1/inspecciones_ctpat', inspecciones)
    console.log(`✅ ${inspecciones.length} inspecciones de muestra`)
  }

  console.log('\n🎉 Seed completado exitosamente!')
  console.log('   ➜  Email:    admin@helu.demo')
  console.log('   ➜  Password: Demo1234!\n')
}

seed().catch(err => {
  console.error('\n❌ Error en seed:', err.message)
  process.exit(1)
})

// ── Viajes de muestra ──────────────────────────────────────────
async function seedViajes(EID) {
  const exist = await rest('GET', `/rest/v1/viajes?empresa_id=eq.${EID}&limit=1`, null)
  if (exist?.length > 0) { console.log('✅ Viajes ya existen, omitiendo'); return }

  const base = {
    empresa_id: null, tracto_id: null, tracto_numero: null,
    operador_id: null, operador_nombre: null,
    remolque1_numero: null, remolque2_numero: null,
    cliente: null, origen: null, destino: null,
    distancia_km: null, tipo_carga: null,
    fecha_salida: null, fecha_llegada_estimada: null, fecha_llegada_real: null,
    estado: 'Programado', notas: null,
  }

  const viajes = [
    { ...base, empresa_id: EID, tracto_numero: 'T-001', operador_nombre: 'JORGE ALBERTO CISNEROS BANDA',
      cliente: 'PROLIFT', origen: 'Monterrey', destino: 'CDMX',
      distancia_km: 900, tipo_carga: 'Cargado',
      fecha_salida: new Date('2026-04-10').toISOString(),
      fecha_llegada_estimada: new Date('2026-04-11').toISOString(),
      estado: 'En_Transito' },

    { ...base, empresa_id: EID, tracto_numero: 'T25', operador_nombre: 'OSCAR JAVIER NUÑEZ VILLANUEVA',
      cliente: 'CEMEX Monterrey', origen: 'Apodaca NL', destino: 'Saltillo COAH',
      distancia_km: 210, tipo_carga: 'Granel',
      fecha_salida: new Date(Date.now() + 2*86400000).toISOString(),
      estado: 'Programado' },

    { ...base, empresa_id: EID, tracto_numero: 'T08', operador_nombre: 'JOEL GUADALUPE ALEMAN ROEL',
      cliente: 'TERNIUM México', origen: 'San Nicolás NL', destino: 'Pesquería NL',
      distancia_km: 45, tipo_carga: 'Cargado',
      fecha_salida: new Date(Date.now() - 3*86400000).toISOString(),
      fecha_llegada_real: new Date(Date.now() - 2*86400000).toISOString(),
      estado: 'Completado' },
  ]

  await rest('POST', '/rest/v1/viajes', viajes)
  console.log(`✅ ${viajes.length} viajes de muestra`)
}

// Obtener empresa HELU y llamar seedViajes
const eid = await rest('GET', '/rest/v1/empresas?nombre_comercial=eq.HELU Transportes&limit=1', null)
if (eid?.[0]?.id) await seedViajes(eid[0].id)
