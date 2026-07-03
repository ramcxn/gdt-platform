-- ============================================================
-- GDT Platform — RPC: get_dashboard_stats
-- Devuelve en una sola llamada todas las stats del dashboard
-- Pega esto en Supabase > SQL Editor > New query > Run
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_empresa_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hoy DATE := CURRENT_DATE;
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total',      (SELECT COUNT(*) FROM inspecciones_ctpat WHERE empresa_id = p_empresa_id),
    'hoy',        (SELECT COUNT(*) FROM inspecciones_ctpat WHERE empresa_id = p_empresa_id AND fecha::DATE >= v_hoy),
    'entradas',   (SELECT COUNT(*) FROM inspecciones_ctpat WHERE empresa_id = p_empresa_id AND tipo_movimiento = 'Entrada'),
    'salidas',    (SELECT COUNT(*) FROM inspecciones_ctpat WHERE empresa_id = p_empresa_id AND tipo_movimiento = 'Salida'),
    'danos',      (SELECT COUNT(*) FROM inspecciones_ctpat WHERE empresa_id = p_empresa_id AND danos_fisicos = true)
  ) INTO v_result;

  RETURN v_result;
END;
$$;
