-- =================================================================================
-- Update script to support Scheduling Services
-- =================================================================================

-- 1. Agregar la columna status al histórico de servicios. 
-- Por defecto 'completed' para no romper los servicios existentes.
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed' NOT NULL;

-- 2. Permitir que el precio (price) sea nulo.
-- Un servicio programado puede no tener precio hasta que se complete.
ALTER TABLE public.services ALTER COLUMN price DROP NOT NULL;

-- 3. Actualizar la función para obtener el total de producidos.
-- Ahora solo se suman los servicios que estén marcados como 'completed'.
CREATE OR REPLACE FUNCTION get_services_total(user_uuid uuid)
RETURNS numeric
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(price), 0) FROM public.services WHERE user_id = user_uuid AND status = 'completed';
$$;
