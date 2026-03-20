'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExpenseRecord, ExpenseType } from '../types';

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

export function useExpenses() {
    const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
    const [grandTotalState, setGrandTotalState] = useState<number>(0);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const limit = 50;

    // Fetch expenses from the API on mount (paginated)
    const fetchExpenses = useCallback(async (currentOffset = 0, isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        try {
            const res = await fetch(`/api/expenses?limit=${limit}&offset=${currentOffset}`);
            if (!res.ok) throw new Error('Error al cargar gastos');
            const data = await res.json();
            
            const fetchedRecords = Array.isArray(data) ? data : (data.records || []);
            
            if (isLoadMore) {
                setExpenses(prev => {
                    const existingIds = new Set(prev.map(e => e.id));
                    const newUnique = fetchedRecords.filter((e: ExpenseRecord) => !existingIds.has(e.id));
                    return [...prev, ...newUnique];
                });
            } else {
                setExpenses(fetchedRecords);
                setGrandTotalState(Array.isArray(data) ? data.reduce((sum: number, e: ExpenseRecord) => sum + e.amount, 0) : data.grandTotal);
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
        fetchExpenses(0, false);
    }, [fetchExpenses]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            fetchExpenses(offset, true);
        }
    }, [fetchExpenses, offset, loadingMore, hasMore]);

    const addExpense = useCallback(
        async (type: ExpenseType, amount: number, note?: string) => {
            const now = new Date();
            const record: ExpenseRecord = {
                id: generateId(),
                type,
                amount,
                note,
                timestamp: getLocalISOString(now),
                date: getLocalDateStr(now),
            };

            // Optimistic update — show immediately in UI
            setExpenses((prev) => [record, ...prev]);
            setGrandTotalState((prev) => prev + amount);

            try {
                const res = await fetch('/api/expenses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
                if (!res.ok) {
                    setExpenses((prev) => prev.filter((e) => e.id !== record.id));
                    setGrandTotalState((prev) => prev - amount);
                    const { error: apiError } = await res.json();
                    setError(apiError ?? 'Error al guardar');
                }
            } catch {
                setExpenses((prev) => prev.filter((e) => e.id !== record.id));
                setGrandTotalState((prev) => prev - amount);
                setError('Sin conexión. Intenta de nuevo.');
            }

            return record;
        },
        []
    );

    const deleteExpense = useCallback(
        async (id: string) => {
            const toDelete = expenses.find(e => e.id === id);
            const amountToSubtract = toDelete?.amount || 0;

            const prev = expenses;
            setExpenses((e) => e.filter((x) => x.id !== id));
            setGrandTotalState((prevTotal) => prevTotal - amountToSubtract);

            try {
                const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
                if (!res.ok) {
                    setExpenses(prev);
                    setGrandTotalState((prevTotal) => prevTotal + amountToSubtract);
                    setError('Error al eliminar');
                }
            } catch {
                setExpenses(prev);
                setGrandTotalState((prevTotal) => prevTotal + amountToSubtract);
                setError('Sin conexión. Intenta de nuevo.');
            }
        },
        [expenses]
    );

    const byDate = useCallback((): Record<string, ExpenseRecord[]> => {
        const map: Record<string, ExpenseRecord[]> = {};
        for (const e of expenses) {
            if (!map[e.date]) map[e.date] = [];
            map[e.date].push(e);
        }
        return map;
    }, [expenses]);

    const today = getLocalDateStr();
    const todayExpenses = expenses.filter((e) => e.date === today);
    const todayExpenseTotal = todayExpenses.reduce((s, e) => s + e.amount, 0);
    const grandExpenseTotal = grandTotalState;

    const getDayExpenseTotal = useCallback(
        (date: string) =>
            expenses.filter((e) => e.date === date).reduce((s, e) => s + e.amount, 0),
        [expenses]
    );

    const sortedDates = Object.keys(byDate()).sort((a, b) => b.localeCompare(a));

    return {
        expenses,
        loaded,
        error,
        todayExpenses,
        todayExpenseTotal,
        grandExpenseTotal,
        byDate,
        sortedDates,
        getDayExpenseTotal,
        addExpense,
        deleteExpense,
        loadMore,
        hasMore,
        loadingMore,
        refetch: () => fetchExpenses(0, false),
    };
}
