-- ============================================================
-- GDT Platform — Setup SQL
-- Pega este script en Supabase > SQL Editor > New query > Run
-- ============================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA EMPRESAS (raíz multi-tenant)
CREATE TABLE IF NOT EXISTS public.empresas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_comercial VARCHAR(200) NOT NULL,
  razon_social    VARCHAR(200),
  rfc             VARCHAR(13),
  plan            TEXT DEFAULT 'Demo',
  estado          TEXT DEFAULT 'Activo',
  config_ui       JSONB DEFAULT '{"primary_color":"#1E3A5F","logo_url":null}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 3. PERFIL DE USUARIOS (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id  UUID REFERENCES public.empresas(id),
  nombre      VARCHAR(200) NOT NULL,
  rol         TEXT DEFAULT 'Operador' CHECK (rol IN ('SuperAdmin','Admin_Empresa','Supervisor','Operador','Guardia','Chofer')),
  activo      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 4. CATÁLOGOS DE FLOTA
CREATE TABLE IF NOT EXISTS public.tractos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES public.empresas(id),
  numero      VARCHAR(20) NOT NULL,
  tipo        VARCHAR(50),
  placas      VARCHAR(20),
  activo      BOOLEAN DEFAULT true,
  UNIQUE(empresa_id, numero)
);

CREATE TABLE IF NOT EXISTS public.remolques (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES public.empresas(id),
  numero      VARCHAR(20) NOT NULL,
  tipo        VARCHAR(50),
  placas      VARCHAR(20),
  activo      BOOLEAN DEFAULT true,
  UNIQUE(empresa_id, numero)
);

CREATE TABLE IF NOT EXISTS public.dollys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES public.empresas(id),
  numero      VARCHAR(20) NOT NULL,
  placas      VARCHAR(20),
  activo      BOOLEAN DEFAULT true,
  UNIQUE(empresa_id, numero)
);

CREATE TABLE IF NOT EXISTS public.operadores (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id        UUID NOT NULL REFERENCES public.empresas(id),
  nombre            VARCHAR(200) NOT NULL,
  numero_licencia   VARCHAR(50),
  vigencia_licencia DATE,
  activo            BOOLEAN DEFAULT true
);

-- 5. INSPECCIONES CTPAT (módulo principal)
CREATE TABLE IF NOT EXISTS public.inspecciones_ctpat (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id          UUID NOT NULL REFERENCES public.empresas(id),
  tipo_movimiento     TEXT NOT NULL CHECK (tipo_movimiento IN ('Entrada','Salida')),
  fecha               TIMESTAMPTZ DEFAULT now(),
  -- Tracto
  tracto_id           UUID REFERENCES public.tractos(id),
  tracto_numero       VARCHAR(20),
  placas_tracto       VARCHAR(20),
  unidad_negocio      VARCHAR(100),
  kilometraje         INTEGER,
  -- Operador
  operador_id         UUID REFERENCES public.operadores(id),
  operador_nombre     VARCHAR(200),
  numero_licencia     VARCHAR(50),
  vigencia_licencia   DATE,
  -- Ruta
  cliente             VARCHAR(200),
  origen              VARCHAR(200),
  destino             VARCHAR(200),
  procedencia_unidad  BOOLEAN DEFAULT false,
  -- Remolque 1
  remolque1_id        UUID REFERENCES public.remolques(id),
  remolque1_numero    VARCHAR(20),
  remolque1_tipo      VARCHAR(50),
  remolque1_placas    VARCHAR(20),
  remolque1_status    TEXT DEFAULT 'Vacio',
  remolque1_sello     BOOLEAN DEFAULT false,
  remolque1_num_sello VARCHAR(50),
  -- Remolque 2
  remolque2_id        UUID REFERENCES public.remolques(id),
  remolque2_numero    VARCHAR(20),
  remolque2_tipo      VARCHAR(50),
  remolque2_placas    VARCHAR(20),
  remolque2_sello     BOOLEAN DEFAULT false,
  -- Dolly
  dolly_id            UUID REFERENCES public.dollys(id),
  dolly_numero        VARCHAR(20),
  -- Checklists CTPAT (JSONB)
  checklist_tracto    JSONB DEFAULT '[]'::jsonb,
  checklist_remolques JSONB DEFAULT '[]'::jsonb,
  -- Condición
  limpieza_unidad     BOOLEAN DEFAULT false,
  fumigacion          BOOLEAN DEFAULT false,
  status_llantas      BOOLEAN DEFAULT false,
  danos_fisicos       BOOLEAN DEFAULT false,
  info_mantenimiento  TEXT,
  -- Evidencia
  firma_url           TEXT,
  foto_tracto_url     TEXT,
  foto_remolque_url   TEXT,
  foto_dano_url       TEXT,
  -- Meta
  registrado_por      UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- 6. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_inspecciones_empresa ON public.inspecciones_ctpat(empresa_id);
CREATE INDEX IF NOT EXISTS idx_inspecciones_fecha   ON public.inspecciones_ctpat(empresa_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_inspecciones_tracto  ON public.inspecciones_ctpat(tracto_id);
CREATE INDEX IF NOT EXISTS idx_tractos_empresa      ON public.tractos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_operadores_empresa   ON public.operadores(empresa_id);

-- 7. ROW LEVEL SECURITY
ALTER TABLE public.empresas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tractos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remolques         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dollys            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operadores        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspecciones_ctpat ENABLE ROW LEVEL SECURITY;

-- Función auxiliar: obtiene empresa_id del usuario actual
CREATE OR REPLACE FUNCTION public.get_empresa_id()
RETURNS UUID AS $$
  SELECT empresa_id FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Eliminar políticas existentes antes de recrearlas (idempotente)
DROP POLICY IF EXISTS "insp_select"        ON public.inspecciones_ctpat;
DROP POLICY IF EXISTS "insp_insert"        ON public.inspecciones_ctpat;
DROP POLICY IF EXISTS "insp_update"        ON public.inspecciones_ctpat;
DROP POLICY IF EXISTS "tractos_select"     ON public.tractos;
DROP POLICY IF EXISTS "remolques_select"   ON public.remolques;
DROP POLICY IF EXISTS "dollys_select"      ON public.dollys;
DROP POLICY IF EXISTS "operadores_select"  ON public.operadores;
DROP POLICY IF EXISTS "usuarios_select"    ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update"    ON public.usuarios;
DROP POLICY IF EXISTS "empresas_select"    ON public.empresas;

-- Políticas para inspecciones_ctpat
CREATE POLICY "insp_select" ON public.inspecciones_ctpat
  FOR SELECT USING (empresa_id = public.get_empresa_id());

CREATE POLICY "insp_insert" ON public.inspecciones_ctpat
  FOR INSERT WITH CHECK (empresa_id = public.get_empresa_id());

CREATE POLICY "insp_update" ON public.inspecciones_ctpat
  FOR UPDATE USING (empresa_id = public.get_empresa_id());

-- Políticas para catálogos
CREATE POLICY "tractos_select"    ON public.tractos    FOR SELECT USING (empresa_id = public.get_empresa_id());
CREATE POLICY "remolques_select"  ON public.remolques  FOR SELECT USING (empresa_id = public.get_empresa_id());
CREATE POLICY "dollys_select"     ON public.dollys     FOR SELECT USING (empresa_id = public.get_empresa_id());
CREATE POLICY "operadores_select" ON public.operadores FOR SELECT USING (empresa_id = public.get_empresa_id());

-- Usuarios: solo puede ver su propio perfil
CREATE POLICY "usuarios_select" ON public.usuarios
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "usuarios_update" ON public.usuarios
  FOR UPDATE USING (id = auth.uid());

-- Empresas: solo puede ver la suya
CREATE POLICY "empresas_select" ON public.empresas
  FOR SELECT USING (id = public.get_empresa_id());

-- 8. TRIGGER: crea perfil de usuario automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'Operador')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Script completado. Ahora ejecuta: node scripts/seed.mjs
-- ============================================================

-- ============================================================
-- MÓDULO VIAJES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.viajes (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id             UUID NOT NULL REFERENCES public.empresas(id),

  -- Unidad y operador
  tracto_id              UUID REFERENCES public.tractos(id),
  tracto_numero          VARCHAR(20),
  operador_id            UUID REFERENCES public.operadores(id),
  operador_nombre        VARCHAR(200),

  -- Remolques
  remolque1_numero       VARCHAR(20),
  remolque2_numero       VARCHAR(20),

  -- Cliente y ruta
  cliente                VARCHAR(200),
  origen                 VARCHAR(200),
  destino                VARCHAR(200),
  distancia_km           INTEGER,
  tipo_carga             VARCHAR(100),

  -- Fechas
  fecha_salida           TIMESTAMPTZ,
  fecha_llegada_estimada TIMESTAMPTZ,
  fecha_llegada_real     TIMESTAMPTZ,

  -- Estado
  estado                 TEXT DEFAULT 'Programado'
    CHECK (estado IN ('Programado','En_Transito','Completado','Cancelado')),

  -- Meta
  notas                  TEXT,
  creado_por             UUID REFERENCES auth.users(id),
  created_at             TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_viajes_empresa ON public.viajes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_viajes_estado  ON public.viajes(empresa_id, estado);
CREATE INDEX IF NOT EXISTS idx_viajes_fecha   ON public.viajes(empresa_id, fecha_salida DESC);

ALTER TABLE public.viajes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "viajes_select" ON public.viajes;
DROP POLICY IF EXISTS "viajes_insert" ON public.viajes;
DROP POLICY IF EXISTS "viajes_update" ON public.viajes;
DROP POLICY IF EXISTS "viajes_delete" ON public.viajes;

CREATE POLICY "viajes_select" ON public.viajes FOR SELECT USING (empresa_id = public.get_empresa_id());
CREATE POLICY "viajes_insert" ON public.viajes FOR INSERT WITH CHECK (empresa_id = public.get_empresa_id());
CREATE POLICY "viajes_update" ON public.viajes FOR UPDATE USING (empresa_id = public.get_empresa_id());
CREATE POLICY "viajes_delete" ON public.viajes FOR DELETE USING (empresa_id = public.get_empresa_id());
