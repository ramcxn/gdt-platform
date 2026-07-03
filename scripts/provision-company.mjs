#!/usr/bin/env node
/*
 * Provisiona una empresa nueva en GDT Platform.
 *
 * Uso:
 *   node scripts/provision-company.mjs --nombre "Transportes XYZ" --admin-email admin@xyz.com --admin-password "Demo1234!"
 */

import fs from 'node:fs'

function readEnv() {
  if (!fs.existsSync('.env.local')) return {}
  return Object.fromEntries(
    fs.readFileSync('.env.local', 'utf8')
      .split(/\n/)
      .map(line => line.match(/^([^=]+)=(.*)$/))
      .filter(Boolean)
      .map(match => [match[1], match[2]])
  )
}

function args() {
  const out = {}
  for (let i = 2; i < process.argv.length; i += 1) {
    const key = process.argv[i]
    if (!key.startsWith('--')) continue
    const value = process.argv[i + 1]?.startsWith('--') ? true : process.argv[i + 1]
    out[key.slice(2)] = value === undefined ? true : value
    if (value !== true) i += 1
  }
  return out
}

async function rest(url, key, method, path, body) {
  const res = await fetch(`${url}${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation,resolution=merge-duplicates',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${path} ${res.status}: ${text}`)
  return text ? JSON.parse(text) : null
}

async function main() {
  const env = readEnv()
  const opts = args()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  if (!opts.nombre) throw new Error('Usa --nombre "Nombre Empresa"')

  const empresaPayload = [{
    nombre_comercial: opts.nombre,
    razon_social: opts.razon || opts.nombre,
    rfc: opts.rfc || null,
    telefono: opts.telefono || null,
    correo_contacto: opts.correo || opts['admin-email'] || null,
    direccion: opts.direccion || null,
    plan: opts.plan || 'Demo',
    estado: opts.estado || 'Activo',
    numero_ctpat: opts.ctpat || null,
    fecha_vigencia_ctpat: opts['ctpat-vigencia'] || null,
  }]

  const [empresa] = await rest(url, key, 'POST', '/rest/v1/empresas', empresaPayload)
  console.log(`Empresa creada: ${empresa.nombre_comercial} (${empresa.id})`)

  await rest(url, key, 'POST', '/rest/v1/ubicaciones_almacen?on_conflict=empresa_id,codigo', [{
    empresa_id: empresa.id,
    codigo: 'ALM-GRAL',
    nombre: 'Almacen general',
    descripcion: 'Ubicacion inicial para refacciones',
  }])

  await rest(url, key, 'POST', '/rest/v1/zonas_rondin?on_conflict=empresa_id,qr_code', [
    { empresa_id: empresa.id, nombre: 'Caseta principal', qr_code: 'RONDIN-CASETA-PRINCIPAL' },
    { empresa_id: empresa.id, nombre: 'Patio operativo', qr_code: 'RONDIN-PATIO-OPERATIVO' },
    { empresa_id: empresa.id, nombre: 'Almacen', qr_code: 'RONDIN-ALMACEN' },
  ])

  if (opts['admin-email'] && opts['admin-password']) {
    const authRes = await rest(url, key, 'POST', '/auth/v1/admin/users', {
      email: opts['admin-email'],
      password: opts['admin-password'],
      email_confirm: true,
    })
    const userId = authRes.id
    await rest(url, key, 'POST', '/rest/v1/usuarios', [{
      id: userId,
      empresa_id: empresa.id,
      nombre: opts['admin-nombre'] || 'Administrador',
      email: opts['admin-email'],
      rol: 'Admin_Empresa',
      activo: true,
    }])
    console.log(`Admin creado: ${opts['admin-email']} (${userId})`)
  }

  console.log('Provisionamiento completo.')
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
