-- ============================================================
-- GDT Platform - Almacen avanzado inspirado en Lovable
-- Ejecutar despues de setup.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ubicaciones_almacen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL DEFAULT 'estanteria' CHECK (tipo IN ('estanteria','bin','zona')),
  capacidad INTEGER,
  activa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE (empresa_id, codigo)
);

CREATE TABLE IF NOT EXISTS public.refacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  numero_parte TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'General',
  proveedor TEXT NOT NULL DEFAULT 'Por definir',
  precio_unitario NUMERIC NOT NULL DEFAULT 0,
  unidad_medida TEXT NOT NULL DEFAULT 'PZA',
  ubicacion_principal UUID REFERENCES public.ubicaciones_almacen(id),
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  stock_maximo INTEGER NOT NULL DEFAULT 100,
  punto_reorden INTEGER NOT NULL DEFAULT 10,
  requiere_serie BOOLEAN NOT NULL DEFAULT false,
  tiene_caducidad BOOLEAN NOT NULL DEFAULT false,
  dias_vida_util INTEGER,
  foto_url TEXT,
  notas TEXT,
  activa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE (empresa_id, numero_parte)
);

CREATE TABLE IF NOT EXISTS public.inventario_refacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  refaccion_id UUID NOT NULL REFERENCES public.refacciones(id) ON DELETE CASCADE,
  numero_serie TEXT,
  lote TEXT,
  fecha_recepcion DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_caducidad DATE,
  ubicacion_id UUID NOT NULL REFERENCES public.ubicaciones_almacen(id),
  estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible','reservado','asignado','danado','caducado')),
  mantenimiento_id UUID,
  costo_unitario NUMERIC NOT NULL DEFAULT 0,
  proveedor TEXT NOT NULL DEFAULT 'Por definir',
  documento_recepcion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.solicitudes_refacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  folio TEXT NOT NULL,
  mantenimiento_id UUID,
  unidad TEXT NOT NULL,
  prioridad TEXT NOT NULL DEFAULT 'normal' CHECK (prioridad IN ('baja','normal','alta','urgente')),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aprobada','en_picking','completada','cancelada')),
  solicitante UUID REFERENCES auth.users(id),
  aprobador UUID REFERENCES auth.users(id),
  fecha_solicitud TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_requerida TIMESTAMPTZ,
  fecha_aprobacion TIMESTAMPTZ,
  fecha_completada TIMESTAMPTZ,
  observaciones TEXT,
  motivo_cancelacion TEXT,
  estado_compra TEXT DEFAULT 'pendiente_compra',
  fecha_compra TIMESTAMPTZ,
  comprador_id UUID REFERENCES auth.users(id),
  monto_compra NUMERIC,
  proveedor_compra TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE (empresa_id, folio)
);

CREATE TABLE IF NOT EXISTS public.detalle_solicitudes_refacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  solicitud_id UUID NOT NULL REFERENCES public.solicitudes_refacciones(id) ON DELETE CASCADE,
  refaccion_id UUID NOT NULL REFERENCES public.refacciones(id),
  cantidad_solicitada INTEGER NOT NULL,
  cantidad_entregada INTEGER NOT NULL DEFAULT 0,
  inventario_asignado_id UUID REFERENCES public.inventario_refacciones(id),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','reservado','entregado','no_disponible')),
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.movimientos_refacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  tipo_movimiento TEXT NOT NULL CHECK (tipo_movimiento IN ('entrada','salida','transferencia','ajuste','devolucion')),
  refaccion_id UUID NOT NULL REFERENCES public.refacciones(id),
  inventario_id UUID REFERENCES public.inventario_refacciones(id),
  cantidad INTEGER NOT NULL DEFAULT 1,
  ubicacion_origen UUID REFERENCES public.ubicaciones_almacen(id),
  ubicacion_destino UUID REFERENCES public.ubicaciones_almacen(id),
  solicitud_id UUID REFERENCES public.solicitudes_refacciones(id),
  mantenimiento_id UUID,
  costo_unitario NUMERIC,
  costo_total NUMERIC,
  documento_referencia TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_ubicaciones_almacen_empresa ON public.ubicaciones_almacen(empresa_id);
CREATE INDEX IF NOT EXISTS idx_refacciones_empresa ON public.refacciones(empresa_id);
CREATE INDEX IF NOT EXISTS idx_inventario_refacciones_empresa ON public.inventario_refacciones(empresa_id);
CREATE INDEX IF NOT EXISTS idx_inventario_refacciones_refaccion ON public.inventario_refacciones(refaccion_id);
CREATE INDEX IF NOT EXISTS idx_inventario_refacciones_ubicacion ON public.inventario_refacciones(ubicacion_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_refacciones_empresa ON public.solicitudes_refacciones(empresa_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_refacciones_estado ON public.solicitudes_refacciones(empresa_id, estado);
CREATE INDEX IF NOT EXISTS idx_detalle_solicitudes_refacciones_empresa ON public.detalle_solicitudes_refacciones(empresa_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_refacciones_empresa ON public.movimientos_refacciones(empresa_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_refacciones_fecha ON public.movimientos_refacciones(empresa_id, created_at DESC);

ALTER TABLE public.ubicaciones_almacen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario_refacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_refacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_solicitudes_refacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_refacciones ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'ubicaciones_almacen',
    'refacciones',
    'inventario_refacciones',
    'solicitudes_refacciones',
    'detalle_solicitudes_refacciones',
    'movimientos_refacciones'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s_select_empresa" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "%s_insert_empresa" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "%s_update_empresa" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "%s_delete_empresa" ON public.%I', tbl, tbl);

    EXECUTE format('CREATE POLICY "%s_select_empresa" ON public.%I FOR SELECT USING (empresa_id = public.get_empresa_id())', tbl, tbl);
    EXECUTE format('CREATE POLICY "%s_insert_empresa" ON public.%I FOR INSERT WITH CHECK (empresa_id = public.get_empresa_id())', tbl, tbl);
    EXECUTE format('CREATE POLICY "%s_update_empresa" ON public.%I FOR UPDATE USING (empresa_id = public.get_empresa_id()) WITH CHECK (empresa_id = public.get_empresa_id())', tbl, tbl);
    EXECUTE format('CREATE POLICY "%s_delete_empresa" ON public.%I FOR DELETE USING (empresa_id = public.get_empresa_id())', tbl, tbl);
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ubicaciones_almacen TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.refacciones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventario_refacciones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.solicitudes_refacciones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.detalle_solicitudes_refacciones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movimientos_refacciones TO authenticated;

GRANT ALL ON public.ubicaciones_almacen TO service_role;
GRANT ALL ON public.refacciones TO service_role;
GRANT ALL ON public.inventario_refacciones TO service_role;
GRANT ALL ON public.solicitudes_refacciones TO service_role;
GRANT ALL ON public.detalle_solicitudes_refacciones TO service_role;
GRANT ALL ON public.movimientos_refacciones TO service_role;
