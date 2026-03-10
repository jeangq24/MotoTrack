'use client';

import { useState, useCallback, useEffect } from 'react';
import { MaintenanceRule, MaintenanceStatus } from '../types';

function generateId(): string {
    return crypto.randomUUID();
}

export function useMaintenance(vehicleId: string | null) {
    const [statuses, setStatuses] = useState<MaintenanceStatus[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMaintenance = useCallback(async () => {
        if (!vehicleId) {
            setLoaded(true);
            return;
        }

        try {
            const res = await fetch(`/api/vehicles/${vehicleId}/maintenance`);
            if (!res.ok) throw new Error('Error al cargar mantenimientos');
            const data: MaintenanceStatus[] = await res.json();
            // Sort to show overdue and upcoming first
            data.sort((a, b) => a.remaining_km - b.remaining_km);
            setStatuses(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoaded(true);
        }
    }, [vehicleId]);

    useEffect(() => {
        fetchMaintenance();
    }, [fetchMaintenance]);

    // Refresh function strictly for rules (doesn't trigger overall vehicle re-fetch but recalcs based heavily on DB side after an update or log action)
    const refetch = () => {
        fetchMaintenance();
    };

    const addRule = useCallback(async (name: string, interval_km: number, last_service_km: number) => {
        if (!vehicleId) return;

        const rulePayload = {
            id: generateId(),
            vehicle_id: vehicleId,
            name,
            interval_km,
            last_service_km
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
    }, [vehicleId]);

    const deleteRule = useCallback(async (id: string) => {
        setStatuses(prev => prev.filter(s => s.rule.id !== id));
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
