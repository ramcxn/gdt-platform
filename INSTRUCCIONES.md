# GDT Platform — Instrucciones de instalación

## Requisitos
- Node.js 18+ instalado (https://nodejs.org)
- Cuenta en Supabase con el proyecto ya creado

---

## Paso 1 — Configurar la base de datos en Supabase

1. Ve a https://supabase.com → tu proyecto `shegkoqkqyufldexfhff`
2. Menú izquierdo → **SQL Editor** → "New query"
3. Copia TODO el contenido del archivo `setup.sql` y pégalo
4. Clic en **Run** (botón verde)
5. Debes ver: "Success. No rows returned"

---

## Paso 2 — Instalar dependencias y cargar datos de prueba

Abre una terminal en la carpeta `gdt-app` y ejecuta:

```bash
npm install
npm run seed
```

El seed crea:
- Empresa: HELU Transportes
- Usuario admin: admin@helu.demo / Demo1234!
- 8 tractos, 5 remolques, 4 dollys, 5 operadores
- 4 inspecciones CTPAT de muestra

---

## Paso 3 — Correr la aplicación

```bash
npm run dev
```

Abre el navegador en: **http://localhost:3000**

Credenciales de acceso:
- Email: `admin@helu.demo`
- Password: `Demo1234!`

---

## Estructura de la app

| Ruta | Módulo |
|------|--------|
| `/dashboard` | KPIs y actividad reciente |
| `/inspecciones` | Lista de inspecciones CTPAT |
| `/inspecciones/nueva` | Formulario de 4 pasos (nueva inspección) |
| `/inspecciones/[id]` | Detalle de inspección |
| `/acceso` | Control de acceso (próximamente) |
| `/rondines` | Rondines de seguridad (próximamente) |
| `/catalogo` | Catálogos de flota (próximamente) |

---

## Credenciales Supabase

- **Project URL:** https://shegkoqkqyufldexfhff.supabase.co
- **Anon Key:** sb_publishable_7CbD8HXXlYT2F2PKCCSEfA_dGZmIWQO
- (Ya configuradas en `.env.local`)

