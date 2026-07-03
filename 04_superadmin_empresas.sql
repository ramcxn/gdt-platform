-- ============================================================
-- GDT Platform - Modulo externo de gestion de empresas
-- Ejecutar una vez en Supabase SQL Editor.
-- ============================================================

ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS telefono TEXT,
  ADD COLUMN IF NOT EXISTS correo_contacto TEXT,
  ADD COLUMN IF NOT EXISTS direccion TEXT,
  ADD COLUMN IF NOT EXISTS numero_ctpat TEXT,
  ADD COLUMN IF NOT EXISTS fecha_vigencia_ctpat DATE;

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS email TEXT;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios
    WHERE id = auth.uid()
      AND rol = 'SuperAdmin'
      AND activo = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

DROP POLICY IF EXISTS "empresas_superadmin_all" ON public.empresas;
DROP POLICY IF EXISTS "usuarios_superadmin_all" ON public.usuarios;

CREATE POLICY "empresas_superadmin_all" ON public.empresas
  FOR ALL
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

CREATE POLICY "usuarios_superadmin_all" ON public.usuarios
  FOR ALL
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.empresas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usuarios TO authenticated;
