'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExpenseRecord, ExpenseType } from '../types';

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useExpenses() {
    const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all expenses from the API on mount
    const fetchExpenses = useCallback(async () => {
        try {
            const res = await fetch('/api/expenses');
            if (!res.ok) throw new Error('Error al cargar gastos');
            const data: ExpenseRecord[] = await res.json();
            setExpenses(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoaded(true);
        }
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const addExpense = useCallback(
        async (type: ExpenseType, amount: number, note?: string) => {
            const now = new Date();
            const record: ExpenseRecord = {
                id: generateId(),
                type,
                amount,
                note,
                timestamp: now.toISOString(),
                date: now.toISOString().split('T')[0],
            };

            // Optimistic update — show immediately in UI
            setExpenses((prev) => [record, ...prev]);

            try {
                const res = await fetch('/api/expenses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
                if (!res.ok) {
                    setExpenses((prev) => prev.filter((e) => e.id !== record.id));
                    const { error: apiError } = await res.json();
                    setError(apiError ?? 'Error al guardar');
                }
            } catch {
                setExpenses((prev) => prev.filter((e) => e.id !== record.id));
                setError('Sin conexión. Intenta de nuevo.');
            }

            return record;
        },
        []
    );

    const deleteExpense = useCallback(
        async (id: string) => {
            const prev = expenses;
            setExpenses((e) => e.filter((x) => x.id !== id));

            try {
                const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
                if (!res.ok) {
                    setExpenses(prev);
                    setError('Error al eliminar');
                }
            } catch {
                setExpenses(prev);
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

    const today = new Date().toISOString().split('T')[0];
    const todayExpenses = expenses.filter((e) => e.date === today);
    const todayExpenseTotal = todayExpenses.reduce((s, e) => s + e.amount, 0);
    const grandExpenseTotal = expenses.reduce((s, e) => s + e.amount, 0);

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
        refetch: fetchExpenses,
    };
}
