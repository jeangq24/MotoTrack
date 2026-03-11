-- =================================================================================
-- MotoTrack v1.2.1 - Maintenance Rango de Tolerancia (Warning Range)
-- =================================================================================
-- Este script agrega la columna para definir qué tanta anticipación en KM
-- avisa el sistema antes de vencerse, a la tabla de maintenance_rules.

ALTER TABLE maintenance_rules 
ADD COLUMN IF NOT EXISTS custom_warning_km integer DEFAULT 500;

-- Nota: Ya que DEFAULT es 500, todas tus reglas antiguas no se romperán 
-- sino que automáticamente seguirán avisándote faltando 500km.
-- =================================================================================
