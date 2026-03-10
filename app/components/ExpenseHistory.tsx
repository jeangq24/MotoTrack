'use client';

import { useState, useEffect, useRef } from 'react';
import { ExpenseRecord, EXPENSE_EMOJIS, EXPENSE_LABELS } from '../types';

interface ExpenseHistoryProps {
    byDate: () => Record<string, ExpenseRecord[]>;
    sortedDates: string[];
    getDayExpenseTotal: (date: string) => number;
    onDelete: (id: string) => void;
    loadMore?: () => void;
    hasMore?: boolean;
    loadingMore?: boolean;
}

const formatCOP = (n: number) => '$' + n.toLocaleString('es-CO');

function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.getTime() === today.getTime()) return '📅 Hoy';
    if (d.getTime() === yesterday.getTime()) return '📅 Ayer';
    return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatTime(isoStr: string): string {
    return new Date(isoStr).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

interface DeleteConfirmProps {
    record: ExpenseRecord;
    onConfirm: () => void;
    onCancel: () => void;
}

function DeleteConfirm({ record, onConfirm, onCancel }: DeleteConfirmProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <p className="text-xl font-bold text-white text-center mb-2">¿Eliminar gasto?</p>
                <p className="text-slate-400 text-center text-sm mb-5">
                    {EXPENSE_EMOJIS[record.type]} {EXPENSE_LABELS[record.type]} —{' '}
                    <span className="text-red-400 font-semibold">{formatCOP(record.amount)}</span>
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl bg-slate-700 text-slate-200 font-semibold transition hover:bg-slate-600 active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold transition hover:bg-red-400 active:scale-95"
                    >
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ExpenseHistory({
    byDate,
    sortedDates,
    getDayExpenseTotal,
    onDelete,
    loadMore,
    hasMore,
    loadingMore,
}: ExpenseHistoryProps) {
    const [confirmRecord, setConfirmRecord] = useState<ExpenseRecord | null>(null);
    const [expandedDates, setExpandedDates] = useState<Set<string>>(
        () => new Set(sortedDates.slice(0, 1))
    );

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (loadingMore) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && loadMore) {
                loadMore();
            }
        }, {
            root: null,
            rootMargin: '20px', // Trigger sligthly before it hits the bottom
            threshold: 1.0
        });

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [hasMore, loadingMore, loadMore]);

    const toggleDate = (date: string) => {
        setExpandedDates((prev) => {
            const next = new Set(prev);
            if (next.has(date)) next.delete(date);
            else next.add(date);
            return next;
        });
    };

    const groups = byDate();

    if (sortedDates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <span className="text-6xl mb-4">🛢️</span>
                <p className="text-lg font-semibold">Sin gastos registrados</p>
                <p className="text-sm mt-1">¡Registra tu primer gasto!</p>
            </div>
        );
    }

    return (
        <>
            {confirmRecord && (
                <DeleteConfirm
                    record={confirmRecord}
                    onConfirm={() => {
                        onDelete(confirmRecord.id);
                        setConfirmRecord(null);
                    }}
                    onCancel={() => setConfirmRecord(null)}
                />
            )}

            <div className="flex flex-col gap-3">
                {sortedDates.map((date) => {
                    const dayExpenses = groups[date] || [];
                    const total = getDayExpenseTotal(date);
                    const isExpanded = expandedDates.has(date);

                    return (
                        <div key={date} className="bg-slate-800/60 rounded-2xl overflow-hidden border border-slate-700/50">
                            {/* Day header */}
                            <button
                                onClick={() => toggleDate(date)}
                                className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-700/30 transition active:bg-slate-700/50"
                            >
                                <div className="text-left">
                                    <p className="text-white font-bold capitalize">{formatDate(date)}</p>
                                    <p className="text-slate-400 text-xs mt-0.5">
                                        {dayExpenses.length} gasto{dayExpenses.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-red-400 font-black text-lg">-{formatCOP(total)}</span>
                                    <span className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </div>
                            </button>

                            {/* Records */}
                            {isExpanded && (
                                <div className="border-t border-slate-700/50">
                                    {dayExpenses.map((expense, idx) => (
                                        <div
                                            key={expense.id}
                                            className={`flex items-center justify-between px-4 py-3 ${idx < dayExpenses.length - 1 ? 'border-b border-slate-700/30' : ''
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{EXPENSE_EMOJIS[expense.type]}</span>
                                                <div>
                                                    <p className="text-slate-200 font-semibold text-sm">
                                                        {EXPENSE_LABELS[expense.type]}
                                                    </p>
                                                    <p className="text-slate-500 text-xs">
                                                        {formatTime(expense.timestamp)}
                                                        {expense.note && (
                                                            <span className="text-slate-400 ml-1">· {expense.note}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-red-400 font-bold">-{formatCOP(expense.amount)}</span>
                                                <button
                                                    onClick={() => setConfirmRecord(expense)}
                                                    className="p-2 rounded-lg bg-slate-700/60 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition active:scale-90"
                                                    aria-label="Eliminar"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {hasMore && (
                <div ref={loadMoreRef} className="pt-2 pb-4 flex justify-center py-4">
                    {loadingMore && (
                        <div className="flex items-center gap-2 text-slate-400 font-medium">
                            <div className="w-5 h-5 rounded-full border-2 border-slate-400 border-t-white animate-spin"></div>
                            Cargando...
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
