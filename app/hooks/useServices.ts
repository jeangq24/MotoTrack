'use client';

import { useState, useEffect, useCallback } from 'react';
import { ServiceRecord, ServiceType } from '../types';

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getLocalDateStr(date: Date = new Date()): string {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().split('T')[0];
}

function getLocalISOString(date: Date = new Date()): string {
    const tzOffset = date.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(tzOffset) / 60).toString().padStart(2, '0');
    const offsetMinutes = (Math.abs(tzOffset) % 60).toString().padStart(2, '0');
    const sign = tzOffset > 0 ? '-' : '+';
    const localISO = new Date(date.getTime() - tzOffset * 60000).toISOString().slice(0, -1);
    return `${localISO}${sign}${offsetHours}:${offsetMinutes}`;
}

export function useServices() {
    const [records, setRecords] = useState<ServiceRecord[]>([]);
    const [grandTotalState, setGrandTotalState] = useState<number>(0);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const limit = 50;

    // Fetch records from the API on mount (paginated)
    const fetchRecords = useCallback(async (currentOffset = 0, isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        try {
            const res = await fetch(`/api/services?limit=${limit}&offset=${currentOffset}`);
            if (!res.ok) throw new Error('Error al cargar servicios');
            const data = await res.json();
            
            const fetchedRecords = Array.isArray(data) ? data : (data.records || []);
            
            if (isLoadMore) {
                setRecords(prev => {
                    const existingIds = new Set(prev.map(r => r.id));
                    const newUnique = fetchedRecords.filter((r: ServiceRecord) => !existingIds.has(r.id));
                    return [...prev, ...newUnique];
                });
            } else {
                setRecords(fetchedRecords);
                setGrandTotalState(Array.isArray(data) ? data.reduce((sum: number, r: ServiceRecord) => sum + r.price, 0) : data.grandTotal);
            }

            setHasMore(fetchedRecords.length === limit);
            setOffset(currentOffset + fetchedRecords.length);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            if (!isLoadMore) setLoaded(true);
            if (isLoadMore) setLoadingMore(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchRecords(0, false);
    }, [fetchRecords]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            fetchRecords(offset, true);
        }
    }, [fetchRecords, offset, loadingMore, hasMore]);

    const addService = useCallback(async (type: ServiceType, price: number) => {
        const now = new Date();
        const record: ServiceRecord = {
            id: generateId(),
            type,
            price,
            timestamp: getLocalISOString(now),
            date: getLocalDateStr(now),
        };

        // Optimistic update — show immediately in UI
        setRecords((prev) => [record, ...prev]);
        setGrandTotalState((prev) => prev + price);

        try {
            const res = await fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record),
            });
            if (!res.ok) {
                // Rollback on failure
                setRecords((prev) => prev.filter((r) => r.id !== record.id));
                setGrandTotalState((prev) => prev - price);
                const { error: apiError } = await res.json();
                setError(apiError ?? 'Error al guardar');
            }
        } catch {
            setRecords((prev) => prev.filter((r) => r.id !== record.id));
            setGrandTotalState((prev) => prev - price);
            setError('Sin conexión. Intenta de nuevo.');
        }

        return record;
    }, []);

    const deleteService = useCallback(async (id: string) => {
        const toDelete = records.find(r => r.id === id);
        const amountToSubtract = toDelete?.price || 0;

        // Optimistic update — remove immediately
        const prev = records;
        setRecords((r) => r.filter((s) => s.id !== id));
        setGrandTotalState((prevTotal) => prevTotal - amountToSubtract);

        try {
            const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                // Rollback on failure
                setRecords(prev);
                setGrandTotalState((prevTotal) => prevTotal + amountToSubtract);
                setError('Error al eliminar');
            }
        } catch {
            setRecords(prev);
            setGrandTotalState((prevTotal) => prevTotal + amountToSubtract);
            setError('Sin conexión. Intenta de nuevo.');
        }
    }, [records]);

    const byDate = useCallback((): Record<string, ServiceRecord[]> => {
        const map: Record<string, ServiceRecord[]> = {};
        for (const r of records) {
            if (!map[r.date]) map[r.date] = [];
            map[r.date].push(r);
        }
        return map;
    }, [records]);

    const todayRecords = records.filter((r) => r.date === getLocalDateStr());
    const todayTotal = todayRecords.reduce((sum, r) => sum + r.price, 0);
    const grandTotal = grandTotalState;

    const getDayTotal = useCallback(
        (date: string) =>
            records.filter((r) => r.date === date).reduce((sum, r) => sum + r.price, 0),
        [records]
    );

    const sortedDates = Object.keys(byDate()).sort((a, b) => b.localeCompare(a));

    return {
        records,
        loaded,
        error,
        todayRecords,
        todayTotal,
        grandTotal,
        byDate,
        sortedDates,
        getDayTotal,
        addService,
        deleteService,
        loadMore,
        hasMore,
        loadingMore,
        refetch: () => fetchRecords(0, false),
    };
}
