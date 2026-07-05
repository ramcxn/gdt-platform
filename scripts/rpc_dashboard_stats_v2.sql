-- ============================================================
-- GDT Platform — RPC: get_dashboard_stats_v2
-- Devuelve stats ampliadas para el nuevo Dashboard rediseñado
-- (flota, mantenimiento, movimientos CTPAT, serie mensual)
--
-- Pega esto en Supabase > SQL Editor > New query > Run
-- ============================================================

-- Primero: crear la tabla mantenimiento si no existe
CREATE TABLE IF NOT EXISTS public.mantenimiento (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id        UUID NOT NULL REFERENCES public.empresas(id),
  tracto_numero     VARCHAR(50),
  tipo              VARCHAR(50) NOT NULL DEFAULT 'Preventivo',
  descripcion       TEXT,
  fecha_programada  DATE,
  fecha_realizada   DATE,
  estado            VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  costo             NUMERIC(12,2),
  tecnico           VARCHAR(100),
  kilometraje       NUMERIC(10,1),
  observaciones     TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mantenimiento ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mantenimiento
CREATE POLICY "mantenimiento_select" ON public.mantenimiento
  FOR SELECT USING (empresa_id = public.get_empresa_id());
CREATE POLICY "mantenimiento_insert" ON public.mantenimiento
  FOR INSERT WITH CHECK (empresa_id = public.get_empresa_id());
CREATE POLICY "mantenimiento_update" ON public.mantenimiento
  FOR UPDATE USING (empresa_id = public.get_empresa_id());
CREATE POLICY "mantenimiento_delete" ON public.mantenimiento
  FOR DELETE USING (empresa_id = public.get_empresa_id());

-- Segundo: función RPC v2
CREATE OR REPLACE FUNCTION public.get_dashboard_stats_v2(p_empresa_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total',           (SELECT COUNT(*) FROM inspecciones_ctpat WHERE empresa_id = p_empresa_id),
    'hoy',             (SELECT COUNT(*) FROM inspecciones_ctpat WHERE empresa_id = p_empresa_id AND fecha::DATE >= CURRENT_DATE),
    'entradas',        (SELECT COUNT(*) FROM inspecciones_ctpat WHERE empresa_id = p_empresa_id AND tipo_movimiento = 'Entrada'),
    'salidas',         (SELECT COUNT(*) FROM inspecciones_ctpat WHERE empresa_id = p_empresa_id AND tipo_movimiento = 'Salida'),
    'danos',           (SELECT COUNT(*) FROM inspecciones_ctpat WHERE empresa_id = p_empresa_id AND danos_fisicos = true),
    'flota_total',     (SELECT COUNT(*) FROM tractos WHERE empresa_id = p_empresa_id),
    'flota_activa',    (SELECT COUNT(*) FROM tractos WHERE empresa_id = p_empresa_id AND activo = true),
    'mant_total',      (SELECT COUNT(*) FROM mantenimiento WHERE empresa_id = p_empresa_id),
    'mant_completado', (SELECT COUNT(*) FROM mantenimiento WHERE empresa_id = p_empresa_id AND estado = 'Completado'),
    'mensual',         (SELECT COALESCE(jsonb_agg(jsonb_build_object('mes', m.mes, 'total', m.total) ORDER BY m.mes), '[]'::jsonb)
                        FROM (
                          SELECT to_char(fecha, 'Mon') AS mes,
                                 COUNT(*) AS total
                          FROM inspecciones_ctpat
                          WHERE empresa_id = p_empresa_id
                            AND fecha >= (CURRENT_DATE - INTERVAL '12 months')
                          GROUP BY to_char(fecha, 'Mon'), EXTRACT(MONTH FROM fecha)
                          ORDER BY EXTRACT(MONTH FROM fecha)
                        ) m)
  ) INTO v_result;

  RETURN v_result;
END;
$$;
