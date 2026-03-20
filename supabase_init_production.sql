-- =================================================================================
-- MotoTrack - Script Completo de Inicialización de Base de Datos para Producción
-- =================================================================================
-- Este script crea todas las tablas, funciones, índices y reglas de seguridad (RLS)
-- necesarias para que la app funcione correctamente desde cero.
-- =================================================================================

-- 1. CREACIÓN DE TABLAS BASE (VEHÍCULOS Y MANTENIMIENTOS)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  current_km integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.maintenance_rules (
  id uuid PRIMARY KEY,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  interval_km integer NOT NULL,
  last_service_km integer NOT NULL,
  next_service_km integer NOT NULL,
  custom_warning_km integer DEFAULT 500,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.maintenance_logs (
  id uuid PRIMARY KEY,
  rule_id uuid REFERENCES public.maintenance_rules(id) ON DELETE CASCADE NOT NULL,
  km integer NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 2. CREACIÓN DE TABLAS DE FINANZAS (SERVICES Y EXPENSES)
-- Nota: id es text porque se generan con Date.now().toString(36) + random en la web app
CREATE TABLE IF NOT EXISTS public.services (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL,
  price numeric NOT NULL,
  timestamp timestamp with time zone NOT NULL,
  date date NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL,
  note text,
  timestamp timestamp with time zone NOT NULL,
  date date NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 3. CREACIÓN DE ÍNDICES PARA OPTIMIZAR EL RENDIMIENTO DE LAS CONSULTAS
CREATE INDEX IF NOT EXISTS vehicles_user_id_idx ON public.vehicles(user_id);
CREATE INDEX IF NOT EXISTS vehicles_current_km_idx ON public.vehicles(current_km);

CREATE INDEX IF NOT EXISTS maintenance_rules_vehicle_id_idx ON public.maintenance_rules(vehicle_id);
CREATE INDEX IF NOT EXISTS maintenance_rules_next_service_km_idx ON public.maintenance_rules(next_service_km);

CREATE INDEX IF NOT EXISTS maintenance_logs_rule_id_idx ON public.maintenance_logs(rule_id);

CREATE INDEX IF NOT EXISTS services_user_id_idx ON public.services(user_id);
CREATE INDEX IF NOT EXISTS services_timestamp_idx ON public.services(timestamp DESC);

CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_timestamp_idx ON public.expenses(timestamp DESC);


-- 4. ACTIVAR ROW LEVEL SECURITY (RLS) PARA PROTEGER LOS DATOS DE LOS USUARIOS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;


-- 5. CREAR POLÍTICAS DE ACCESO SEGURAS (RLS POLICIES)
-- Eliminamos primero si existen para evitar errores, luego las creamos.

-- Vehículos:
DROP POLICY IF EXISTS "Users can create their own vehicles" ON public.vehicles;
CREATE POLICY "Users can create their own vehicles" ON public.vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own vehicles" ON public.vehicles;
CREATE POLICY "Users can view their own vehicles" ON public.vehicles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own vehicles" ON public.vehicles;
CREATE POLICY "Users can update their own vehicles" ON public.vehicles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own vehicles" ON public.vehicles;
CREATE POLICY "Users can delete their own vehicles" ON public.vehicles FOR DELETE USING (auth.uid() = user_id);

-- Reglas de Mantenimiento:
DROP POLICY IF EXISTS "Users can insert rules for their vehicles" ON public.maintenance_rules;
CREATE POLICY "Users can insert rules for their vehicles" ON public.maintenance_rules FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.vehicles WHERE id = vehicle_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view rules for their vehicles" ON public.maintenance_rules;
CREATE POLICY "Users can view rules for their vehicles" ON public.maintenance_rules FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vehicles WHERE id = vehicle_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update rules for their vehicles" ON public.maintenance_rules;
CREATE POLICY "Users can update rules for their vehicles" ON public.maintenance_rules FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.vehicles WHERE id = vehicle_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can delete rules for their vehicles" ON public.maintenance_rules;
CREATE POLICY "Users can delete rules for their vehicles" ON public.maintenance_rules FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.vehicles WHERE id = vehicle_id AND user_id = auth.uid())
);

-- Logs de Mantenimiento:
DROP POLICY IF EXISTS "Users can insert logs for their rules" ON public.maintenance_logs;
CREATE POLICY "Users can insert logs for their rules" ON public.maintenance_logs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.maintenance_rules mr
    JOIN public.vehicles v ON mr.vehicle_id = v.id
    WHERE mr.id = rule_id AND v.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can view logs for their rules" ON public.maintenance_logs;
CREATE POLICY "Users can view logs for their rules" ON public.maintenance_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.maintenance_rules mr
    JOIN public.vehicles v ON mr.vehicle_id = v.id
    WHERE mr.id = rule_id AND v.user_id = auth.uid()
  )
);

-- Servicios:
DROP POLICY IF EXISTS "Users can create their own services" ON public.services;
CREATE POLICY "Users can create their own services" ON public.services FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own services" ON public.services;
CREATE POLICY "Users can view their own services" ON public.services FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own services" ON public.services;
CREATE POLICY "Users can update their own services" ON public.services FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own services" ON public.services;
CREATE POLICY "Users can delete their own services" ON public.services FOR DELETE USING (auth.uid() = user_id);

-- Gastos:
DROP POLICY IF EXISTS "Users can create their own expenses" ON public.expenses;
CREATE POLICY "Users can create their own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
CREATE POLICY "Users can view their own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
CREATE POLICY "Users can update their own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;
CREATE POLICY "Users can delete their own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);


-- 6. CREAR FUNCIONES RPC PARA LOS TOTALIZADOS EN LA WEB
-- Se requiere para el cálculo global que traen hooks como useServices y useExpenses.

CREATE OR REPLACE FUNCTION get_services_total(user_uuid uuid)
RETURNS numeric
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(price), 0) FROM public.services WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION get_expenses_total(user_uuid uuid)
RETURNS numeric
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(amount), 0) FROM public.expenses WHERE user_id = user_uuid;
$$;


-- 7. ASIGNAR PERMISOS A LOS ROLES POR DEFECTO DE SUPABASE
GRANT ALL ON TABLE public.vehicles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.maintenance_rules TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.maintenance_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.services TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.expenses TO anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_services_total TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_expenses_total TO anon, authenticated, service_role;

-- =================================================================================
-- ¡FINALIZADO! Copia y pega esto en el SQL Editor de tu proyecto en Supabase y ejecútalo.
-- =================================================================================
