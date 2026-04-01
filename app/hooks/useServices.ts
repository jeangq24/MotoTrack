'use client';

import { useState, useEffect, useCallback } from 'react';
import { ServiceRecord, ServiceType, ServiceStatus } from '../types';
import { syncManager, SyncAction } from '../utils/syncManager';

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getLocalDateStr(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' }).format(date);
}

function getLocalISOString(date: Date = new Date()): string {
    const tzDateStr = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'America/Bogota',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(date).replace(' ', 'T');
    return `${tzDateStr}-05:00`;
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
            
            let fetchedRecords = Array.isArray(data) ? data : (data.records || []);
            
            // Apply any pending offline actions locally
            const queue = syncManager.getQueue();
            const serviceActions = queue.filter(q => q.endpoint.includes('/api/services'));
            
            for (const q of serviceActions) {
                if (q.method === 'POST' && q.payload) {
                    fetchedRecords.unshift(q.payload as ServiceRecord);
                } else if (q.method === 'DELETE') {
                    const delId = q.endpoint.split('/').pop();
                    fetchedRecords = fetchedRecords.filter((r: ServiceRecord) => r.id !== delId);
                } else if (q.method === 'PATCH' && q.payload) {
                    const patId = q.endpoint.split('/').pop();
                    fetchedRecords = fetchedRecords.map((r: ServiceRecord) => r.id === patId ? { ...r, ...q.payload } : r);
                }
            }
            
            // Re-sort just in case
            fetchedRecords.sort((a: ServiceRecord, b: ServiceRecord) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            if (isLoadMore) {
                setRecords(prev => {
                    const existingIds = new Set(prev.map(r => r.id));
                    const newUnique = fetchedRecords.filter((r: ServiceRecord) => !existingIds.has(r.id));
                    return [...prev, ...newUnique];
                });
            } else {
                setRecords(fetchedRecords);
                setGrandTotalState(fetchedRecords.reduce((sum: number, r: ServiceRecord) => sum + (r.status === 'completed' ? (r.price || 0) : 0), 0));
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

        const handleSyncEvent = () => fetchRecords(0, false);
        window.addEventListener('mototrack_synced', handleSyncEvent);
        return () => window.removeEventListener('mototrack_synced', handleSyncEvent);
    }, [fetchRecords]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            fetchRecords(offset, true);
        }
    }, [fetchRecords, offset, loadingMore, hasMore]);

    const addService = useCallback(async (
        type: ServiceType, 
        price: number | null, 
        status: ServiceStatus = 'completed', 
        customTimestamp?: string
    ) => {
        let now = new Date();
        let recordDate = getLocalDateStr(now);
        let recordTimestamp = getLocalISOString(now);

        if (customTimestamp) {
            const isISO = customTimestamp.includes('Z') || customTimestamp.includes('-0') || customTimestamp.includes('+0');
            const targetTimestamp = isISO ? customTimestamp : `${customTimestamp}-05:00`;
            const customDateObj = new Date(targetTimestamp);
            if (!isNaN(customDateObj.getTime())) {
                recordDate = getLocalDateStr(customDateObj);
                recordTimestamp = getLocalISOString(customDateObj);
            }
        }

        const record: ServiceRecord = {
            id: generateId(),
            type,
            price,
            status,
            timestamp: recordTimestamp,
            date: recordDate,
        };

        // Optimistic update — sort and show immediately in UI
        setRecords((prev) => {
            const next = [record, ...prev];
            return next.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        });
        
        if (status === 'completed' && price !== null) {
            setGrandTotalState((prev) => prev + price);
        }

        if (!navigator.onLine) {
            syncManager.addAction({
                endpoint: '/api/services',
                method: 'POST',
                payload: record
            });
            return record;
        }

        try {
            const res = await fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record),
            });
            if (!res.ok) {
                // Rollback on failure
                setRecords((prev) => prev.filter((r) => r.id !== record.id));
                if (status === 'completed' && price !== null) {
                    setGrandTotalState((prev) => prev - price);
                }
                const { error: apiError } = await res.json();
                setError(apiError ?? 'Error al guardar');
            }
        } catch {
            // Offline Mode: Queue the mutation instead of rolling back
            syncManager.addAction({
                endpoint: '/api/services',
                method: 'POST',
                payload: record
            });
            // We do NOT rollback or throw error so the UI stays up-to-date optimistically
        }

        return record;
    }, []);

    const deleteService = useCallback(async (id: string) => {
        const toDelete = records.find(r => r.id === id);
        const amountToSubtract = (toDelete?.status === 'completed' ? toDelete?.price : 0) || 0;

        // Optimistic update — remove immediately
        const prev = records;
        setRecords((r) => r.filter((s) => s.id !== id));
        setGrandTotalState((prevTotal) => prevTotal - amountToSubtract);

        if (!navigator.onLine) {
            syncManager.addAction({
                endpoint: `/api/services/${id}`,
                method: 'DELETE'
            });
            return;
        }

        try {
            const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                // Rollback on failure
                setRecords(prev);
                setGrandTotalState((prevTotal) => prevTotal + amountToSubtract);
                setError('Error al eliminar');
            }
        } catch {
            // Offline Mode: Queue mutation
            syncManager.addAction({
                endpoint: `/api/services/${id}`,
                method: 'DELETE'
            });
        }
    }, [records]);

    const updateService = useCallback(async (id: string, updates: Partial<ServiceRecord>) => {
        const prevRecords = records;
        const prevTotal = grandTotalState;
        
        let amountDiff = 0;
        const oldRecord = records.find(r => r.id === id);

        setRecords((prev) => prev.map(r => r.id === id ? { ...r, ...updates } : r).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

        if (oldRecord) {
            const oldPrice = oldRecord.status === 'completed' ? (oldRecord.price || 0) : 0;
            const newStatus = updates.status !== undefined ? updates.status : oldRecord.status;
            const newPrice = updates.price !== undefined ? (updates.price || 0) : (oldRecord.price || 0);
            
            const effectiveNewPrice = newStatus === 'completed' ? newPrice : 0;
            amountDiff = effectiveNewPrice - oldPrice;
            
            if (amountDiff !== 0) {
                setGrandTotalState(prev => prev + amountDiff);
            }
        }

        if (!navigator.onLine) {
            syncManager.addAction({
                endpoint: `/api/services/${id}`,
                method: 'PATCH',
                payload: updates
            });
            return;
        }

        try {
            const res = await fetch(`/api/services/${id}`, { 
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!res.ok) {
                setRecords(prevRecords);
                setGrandTotalState(prevTotal);
                setError('Error al actualizar');
            }
        } catch {
            // Offline mode: Queue mutation
            syncManager.addAction({
                endpoint: `/api/services/${id}`,
                method: 'PATCH',
                payload: updates
            });
        }
    }, [records, grandTotalState]);

    const byDate = useCallback((): Record<string, ServiceRecord[]> => {
        const map: Record<string, ServiceRecord[]> = {};
        for (const r of records) {
            if (!map[r.date]) map[r.date] = [];
            map[r.date].push(r);
        }
        return map;
    }, [records]);

    const todayRecords = records.filter((r) => r.date === getLocalDateStr());
    const todayTotal = todayRecords.reduce((sum, r) => sum + (r.status === 'completed' ? (r.price || 0) : 0), 0);
    const grandTotal = grandTotalState;

    const getDayTotal = useCallback(
        (date: string) =>
            records.filter((r) => r.date === date && r.status === 'completed').reduce((sum, r) => sum + (r.price || 0), 0),
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
        updateService,
        deleteService,
        loadMore,
        hasMore,
        loadingMore,
        refetch: () => fetchRecords(0, false),
    };
}
