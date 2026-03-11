'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { MaintenanceRule, MaintenanceStatus, Vehicle } from '../types';
import { calculateMaintenanceStatus } from '@/lib/maintenance';

function generateId(): string {
    return crypto.randomUUID();
}

export function useMaintenance(vehicle: Vehicle | null) {
    const [rules, setRules] = useState<MaintenanceRule[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMaintenance = useCallback(async () => {
        if (!vehicle) {
            setLoaded(true);
            return;
        }

        try {
            const res = await fetch(`/api/vehicles/${vehicle.id}/maintenance`);
            if (!res.ok) throw new Error('Error al cargar mantenimientos');
            const data: MaintenanceRule[] = await res.json();
            setRules(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoaded(true);
        }
    }, [vehicle?.id]);

    useEffect(() => {
        fetchMaintenance();
    }, [fetchMaintenance]);

    // Refresh function strictly for rules
    const refetch = useCallback(() => {
        fetchMaintenance();
    }, [fetchMaintenance]);

    const addRule = useCallback(async (name: string, interval_km: number, last_service_km: number, custom_warning_km?: number) => {
        if (!vehicle) return;

        const rulePayload = {
            id: generateId(),
            vehicle_id: vehicle.id,
            name,
            interval_km,
            last_service_km,
            custom_warning_km: custom_warning_km || 500
        };

        try {
            const res = await fetch('/api/maintenance-rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rulePayload),
            });
            if (!res.ok) {
                const { error: apiError } = await res.json();
                setError(apiError ?? 'Error al crear regla');
            } else {
                refetch(); // Fast refetch to apply new rules layout based on DB calc (including next_km)
            }
        } catch {
            setError('Sin conexión. Intenta de nuevo.');
        }
    }, [vehicle?.id, refetch]);

    const deleteRule = useCallback(async (id: string) => {
        setRules(prev => prev.filter(r => r.id !== id));
        try {
            const res = await fetch(`/api/maintenance-rules/${id}`, { method: 'DELETE' });
            if (!res.ok) refetch(); // Rollback if failed by fetching the source truth
        } catch {
            setError('Error de conexión');
            refetch();
        }
    }, []);

    const markPerformed = useCallback(async (ruleId: string, currentKm: number, notes?: string) => {
        try {
            const pLoad = { id: generateId(), km: currentKm, notes };
            const res = await fetch(`/api/maintenance-rules/${ruleId}/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pLoad),
            });
            if (!res.ok) throw new Error();
            refetch(); // Server calc triggers upcoming reset
        } catch {
            setError('No pudimos actualizar el registro de mantenimiento.');
        }
    }, []);

    const statuses = useMemo(() => {
        if (!vehicle) return [];
        return rules
            .map(rule => calculateMaintenanceStatus(rule, vehicle.current_km))
            .sort((a, b) => a.remaining_km - b.remaining_km);
    }, [rules, vehicle?.current_km]);

    return {
        statuses,
        loaded,
        error,
        addRule,
        deleteRule,
        markPerformed,
        refetch
    };
}
