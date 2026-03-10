-- =================================================================================
-- MotoTrack v1.2.0 - Vehicle Maintenance System Update
-- =================================================================================

-- 1. CREACIÓN DE TABLAS

-- Tabla Vehicles
CREATE TABLE vehicles (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  current_km integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla Maintenance Rules
CREATE TABLE maintenance_rules (
  id uuid PRIMARY KEY,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  interval_km integer NOT NULL,
  last_service_km integer NOT NULL,
  next_service_km integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla Maintenance Logs
CREATE TABLE maintenance_logs (
  id uuid PRIMARY KEY,
  rule_id uuid REFERENCES maintenance_rules(id) ON DELETE CASCADE NOT NULL,
  km integer NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =================================================================================

-- 2. CREACIÓN DE ÍNDICES PARA OPTIMIZACIÓN

CREATE INDEX IF NOT EXISTS vehicles_user_id_idx ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS vehicles_current_km_idx ON vehicles(current_km);

CREATE INDEX IF NOT EXISTS maintenance_rules_vehicle_id_idx ON maintenance_rules(vehicle_id);
CREATE INDEX IF NOT EXISTS maintenance_rules_next_service_km_idx ON maintenance_rules(next_service_km);

CREATE INDEX IF NOT EXISTS maintenance_logs_rule_id_idx ON maintenance_logs(rule_id);

-- =================================================================================

-- 3. ACTIVAR ROW LEVEL SECURITY (RLS)

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- =================================================================================

-- 4. CREAR POLÍTICAS DE ACCESO SEGURAS (RLS POLICIES)

-- Políticas para vehicles (El usuario solo puede CRUD sus propios vehículos)
CREATE POLICY "Users can create their own vehicles" 
ON vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own vehicles" 
ON vehicles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles" 
ON vehicles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles" 
ON vehicles FOR DELETE USING (auth.uid() = user_id);


-- Políticas para maintenance_rules (El usuario accede a reglas solo si posee el vehículo)
CREATE POLICY "Users can insert rules for their vehicles" 
ON maintenance_rules FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM vehicles WHERE id = vehicle_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view rules for their vehicles" 
ON maintenance_rules FOR SELECT USING (
  EXISTS (SELECT 1 FROM vehicles WHERE id = vehicle_id AND user_id = auth.uid())
);

CREATE POLICY "Users can update rules for their vehicles" 
ON maintenance_rules FOR UPDATE USING (
  EXISTS (SELECT 1 FROM vehicles WHERE id = vehicle_id AND user_id = auth.uid())
);

CREATE POLICY "Users can delete rules for their vehicles" 
ON maintenance_rules FOR DELETE USING (
  EXISTS (SELECT 1 FROM vehicles WHERE id = vehicle_id AND user_id = auth.uid())
);


-- Políticas para maintenance_logs (El usuario accede a los logs solo si la regla le pertenece indirectamente)
CREATE POLICY "Users can insert logs for their rules" 
ON maintenance_logs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM maintenance_rules mr
    JOIN vehicles v ON mr.vehicle_id = v.id
    WHERE mr.id = rule_id AND v.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view logs for their rules" 
ON maintenance_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM maintenance_rules mr
    JOIN vehicles v ON mr.vehicle_id = v.id
    WHERE mr.id = rule_id AND v.user_id = auth.uid()
  )
);

-- =================================================================================

-- 5. ASIGNAR PERMISOS A LOS ROLES DE SUPABASE (CORRECCIÓN DE PERMISO DENEGADO)
-- Esto asegura que los usuarios autenticados a través de la API tengan permiso de usar las tablas

GRANT ALL ON TABLE vehicles TO anon, authenticated, service_role;
GRANT ALL ON TABLE maintenance_rules TO anon, authenticated, service_role;
GRANT ALL ON TABLE maintenance_logs TO anon, authenticated, service_role;

-- =================================================================================
-- ¡Listo! Copia y pega esto en el SQL Editor de tu proyecto en Supabase y ejecútalo.
