-- ==============================================================================================
-- MotoTrack - Script de Actualización de Fechas (Producción) a Zona Horaria de Colombia
-- ==============================================================================================
-- Este script corrige el campo "date" (fecha de agrupación) de todos los registros
-- de la base de datos para que correspondan al día real en el que se registraron según
-- la hora local de Colombia (UTC-5), ignorando las discrepancias de UTC o la hora
-- del servidor en Brasil.
-- 
-- Problema original: El sistema guardaba "date" extrayendo el día de la hora UTC. 
-- Así, una carrera hecha el "2026-03-19 a las 10:00 PM" en Colombia, se registraba 
-- como del "2026-03-20" porque en UTC ya pasaba de la medianoche.
-- 
-- Nota: La columna "timestamp" (timestamp with time zone) ya guarda el momento absoluto 
-- correctamente, el problema principal radica únicamente en el campo "date".
-- ==============================================================================================

BEGIN;

-- 1. Actualización de Gastos (Expenses)
-- Extrae el momento exacto (timestamp), lo forza a su concepción UTC, luego lo traslada 
-- a la zona horaria de Bogotá ('America/Bogota') y estampa solo el día (date).
UPDATE public.expenses
SET date = (timestamp AT TIME ZONE 'America/Bogota')::date;

-- 2. Actualización de Servicios / Carreras (Services)
-- Hace exactamente lo mismo para los servicios prestados.
UPDATE public.services
SET date = (timestamp AT TIME ZONE 'America/Bogota')::date;

COMMIT;

-- Opcional: Ejecutar un conteo o un SELECT rápido para verificar que los datos coinciden
-- SELECT id, type, timestamp, date FROM public.services ORDER BY timestamp DESC LIMIT 10;
