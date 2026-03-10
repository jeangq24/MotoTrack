'use client';

import { useState, useEffect, useCallback } from 'react';
import { Vehicle } from '../types';

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useVehicles() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVehicles = useCallback(async () => {
        try {
            const res = await fetch('/api/vehicles');
            if (!res.ok) throw new Error('Error al cargar vehículos');
            const data: Vehicle[] = await res.json();
            setVehicles(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoaded(true);
        }
    }, []);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    const addVehicle = useCallback(async (name: string, brand: string, model: string, current_km: number) => {
        const vehicle: Vehicle = {
            id: generateId(),
            name,
            brand,
            model,
            current_km
        };

        setVehicles(prev => [vehicle, ...prev]);

        try {
            const res = await fetch('/api/vehicles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vehicle),
            });
            if (!res.ok) {
                setVehicles(prev => prev.filter(v => v.id !== vehicle.id));
                const { error: apiError } = await res.json();
                setError(apiError ?? 'Error al guardar vehículo');
            } else {
                const data = await res.json();
                setVehicles(prev => prev.map(v => v.id === vehicle.id ? data : v)); // Update with server struct
            }
        } catch {
            setVehicles(prev => prev.filter(v => v.id !== vehicle.id));
            setError('Sin conexión. Intenta de nuevo.');
        }
        return vehicle;
    }, []);

    const updateVehicleKm = useCallback(async (id: string, newKm: number) => {
        const target = vehicles.find(v => v.id === id);
        if (!target) return;
        const previousKm = target.current_km;

        setVehicles(prev => prev.map(v => v.id === id ? { ...v, current_km: newKm } : v));

        try {
            const res = await fetch(`/api/vehicles/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_km: newKm }),
            });
            if (!res.ok) {
                setVehicles(prev => prev.map(v => v.id === id ? { ...v, current_km: previousKm } : v));
            }
        } catch {
            setVehicles(prev => prev.map(v => v.id === id ? { ...v, current_km: previousKm } : v));
            setError('Error al actualizar kilometraje.');
        }
    }, [vehicles]);

    const deleteVehicle = useCallback(async (id: string) => {
        const prev = vehicles;
        setVehicles(v => v.filter(x => x.id !== id));
        try {
            const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                setVehicles(prev);
                setError('Error al eliminar vehículo');
            }
        } catch {
            setVehicles(prev);
            setError('Sin conexión. Intenta de nuevo.');
        }
    }, [vehicles]);

    return {
        vehicles,
        loaded,
        error,
        addVehicle,
        updateVehicleKm,
        deleteVehicle,
        refetch: fetchVehicles
    };
}
