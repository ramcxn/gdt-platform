-- ============================================================
-- GDT Platform — Control de Acceso Físico
-- Pega este script en Supabase > SQL Editor > New query > Run
-- ============================================================

CREATE TABLE IF NOT EXISTS public.bitacora_accesos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES public.empresas(id),
  tipo_persona    TEXT NOT NULL CHECK (tipo_persona IN ('Visitante', 'Proveedor', 'Empleado')),
  nombre_persona  VARCHAR(200) NOT NULL,
  identificacion  VARCHAR(100),
  motivo_visita   TEXT,
  empresa_origen  VARCHAR(200),
  hora_entrada    TIMESTAMPTZ DEFAULT now(),
  hora_salida     TIMESTAMPTZ,
  observaciones   TEXT,
  registrado_por  UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_bitacora_empresa ON public.bitacora_accesos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_bitacora_fecha ON public.bitacora_accesos(empresa_id, hora_entrada DESC);

-- RLS
ALTER TABLE public.bitacora_accesos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bitacora_select" ON public.bitacora_accesos;
DROP POLICY IF EXISTS "bitacora_insert" ON public.bitacora_accesos;
DROP POLICY IF EXISTS "bitacora_update" ON public.bitacora_accesos;

CREATE POLICY "bitacora_select" ON public.bitacora_accesos
  FOR SELECT USING (empresa_id = public.get_empresa_id());

CREATE POLICY "bitacora_insert" ON public.bitacora_accesos
  FOR INSERT WITH CHECK (empresa_id = public.get_empresa_id());

CREATE POLICY "bitacora_update" ON public.bitacora_accesos
  FOR UPDATE USING (empresa_id = public.get_empresa_id());
