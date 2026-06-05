-- ============================================================
-- GDT Platform — Rondines de Seguridad
-- Pega este script en Supabase > SQL Editor > New query > Run
-- ============================================================

-- 1. Zonas de Rondín (Catálogo de ubicaciones físicas a patrullar)
CREATE TABLE IF NOT EXISTS public.zonas_rondin (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES public.empresas(id),
  nombre          VARCHAR(150) NOT NULL,
  qr_code         VARCHAR(250) NOT NULL, -- El texto/ID que contiene el QR
  activo          BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, qr_code)
);

-- 2. Rondines (Cabecera del recorrido)
CREATE TABLE IF NOT EXISTS public.rondines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES public.empresas(id),
  numero          VARCHAR(50) NOT NULL,
  estado          TEXT DEFAULT 'en_progreso' CHECK (estado IN ('en_progreso', 'completado')),
  inicio          TIMESTAMPTZ DEFAULT now(),
  fin             TIMESTAMPTZ,
  registrado_por  UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, numero)
);

-- 3. Visitas a zonas durante un rondín (Detalle)
CREATE TABLE IF NOT EXISTS public.rondines_visitas (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rondin_id           UUID NOT NULL REFERENCES public.rondines(id) ON DELETE CASCADE,
  zona_id             UUID NOT NULL REFERENCES public.zonas_rondin(id),
  hora_visita         TIMESTAMPTZ DEFAULT now(),
  incidente           BOOLEAN DEFAULT false,
  observaciones       TEXT,
  foto_incidente_url  TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_zonas_empresa ON public.zonas_rondin(empresa_id);
CREATE INDEX IF NOT EXISTS idx_rondines_empresa ON public.rondines(empresa_id);
CREATE INDEX IF NOT EXISTS idx_rondines_visitas_rondin ON public.rondines_visitas(rondin_id);

-- ROW LEVEL SECURITY
ALTER TABLE public.zonas_rondin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rondines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rondines_visitas ENABLE ROW LEVEL SECURITY;

-- Drop policies si existen
DROP POLICY IF EXISTS "zonas_select" ON public.zonas_rondin;
DROP POLICY IF EXISTS "zonas_insert" ON public.zonas_rondin;
DROP POLICY IF EXISTS "zonas_update" ON public.zonas_rondin;
DROP POLICY IF EXISTS "rondines_select" ON public.rondines;
DROP POLICY IF EXISTS "rondines_insert" ON public.rondines;
DROP POLICY IF EXISTS "rondines_update" ON public.rondines;
DROP POLICY IF EXISTS "visitas_select" ON public.rondines_visitas;
DROP POLICY IF EXISTS "visitas_insert" ON public.rondines_visitas;
DROP POLICY IF EXISTS "visitas_update" ON public.rondines_visitas;

-- Políticas
CREATE POLICY "zonas_select" ON public.zonas_rondin FOR SELECT USING (empresa_id = public.get_empresa_id());
CREATE POLICY "zonas_insert" ON public.zonas_rondin FOR INSERT WITH CHECK (empresa_id = public.get_empresa_id());
CREATE POLICY "zonas_update" ON public.zonas_rondin FOR UPDATE USING (empresa_id = public.get_empresa_id());

CREATE POLICY "rondines_select" ON public.rondines FOR SELECT USING (empresa_id = public.get_empresa_id());
CREATE POLICY "rondines_insert" ON public.rondines FOR INSERT WITH CHECK (empresa_id = public.get_empresa_id());
CREATE POLICY "rondines_update" ON public.rondines FOR UPDATE USING (empresa_id = public.get_empresa_id());

CREATE POLICY "visitas_select" ON public.rondines_visitas FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.rondines WHERE id = rondin_id AND empresa_id = public.get_empresa_id())
);
CREATE POLICY "visitas_insert" ON public.rondines_visitas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.rondines WHERE id = rondin_id AND empresa_id = public.get_empresa_id())
);
CREATE POLICY "visitas_update" ON public.rondines_visitas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.rondines WHERE id = rondin_id AND empresa_id = public.get_empresa_id())
);

-- ============================================================
-- Opcional: Insertar unas zonas de prueba si deseas probar sin darlas de alta
-- (Reemplaza los qr_code con los IDs que imprimas o uses para probar)
-- ============================================================
-- INSERT INTO public.zonas_rondin (empresa_id, nombre, qr_code)
-- VALUES 
--   ((SELECT id FROM public.empresas LIMIT 1), 'Patio Norte', 'QR-001'),
--   ((SELECT id FROM public.empresas LIMIT 1), 'Almacén de Herramientas', 'QR-002'),
--   ((SELECT id FROM public.empresas LIMIT 1), 'Caseta Principal', 'QR-003');
