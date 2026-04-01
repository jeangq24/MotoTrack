'use client';

import { useState, useEffect, useRef } from 'react';
import { ExpenseRecord, ExpenseType, EXPENSE_LABELS } from '../types';
import { Fuel, Coffee, Wrench, MoreHorizontal, ChevronDown, Trash2 } from 'lucide-react';

const EXPENSE_ICONS: Record<ExpenseType, React.ReactNode> = {
    gasolina: <Fuel className="w-6 h-6" strokeWidth={1.5} />,
    comida: <Coffee className="w-6 h-6" strokeWidth={1.5} />,
    mantenimiento: <Wrench className="w-6 h-6" strokeWidth={1.5} />,
    otro: <MoreHorizontal className="w-6 h-6" strokeWidth={1.5} />,
};

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
    const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' });
    const todayStr = formatter.format(new Date());
    const yesterdayStr = formatter.format(new Date(Date.now() - 86400000));

    if (dateStr === todayStr) return '📅 Hoy';
    if (dateStr === yesterdayStr) return '📅 Ayer';

    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatTime(isoStr: string): string {
    return new Date(isoStr).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit' });
}

interface DeleteConfirmProps {
    record: ExpenseRecord;
    onConfirm: () => void;
    onCancel: () => void;
}

function DeleteConfirm({ record, onConfirm, onCancel }: DeleteConfirmProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900/90 border border-white/10 rounded-[24px] p-6 w-full max-w-sm shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-xl font-black text-white text-center mb-2 tracking-tight">¿Eliminar gasto?</p>
                <div className="flex items-center justify-center gap-2 mb-6 text-slate-300 bg-slate-800/50 py-3 rounded-2xl border border-white/5">
                    <span className="text-red-400">{EXPENSE_ICONS[record.type]}</span>
                    <span className="font-semibold">{EXPENSE_LABELS[record.type]}</span>
                    <span className="text-red-400 font-bold ml-1">{formatCOP(record.amount)}</span>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3.5 rounded-xl bg-slate-800 text-slate-300 font-bold transition-all hover:bg-slate-700 active:scale-95 border border-white/5"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3.5 rounded-xl bg-red-500 text-white font-bold transition-all hover:bg-red-400 active:scale-95 shadow-lg shadow-red-500/20"
                    >
                        Eliminar
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
                        <div key={date} className="bg-slate-900/60 rounded-3xl overflow-hidden border border-white/5 shadow-lg">
                            {/* Day header */}
                            <button
                                onClick={() => toggleDate(date)}
                                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors duration-300 active:bg-white/10"
                            >
                                <div className="text-left">
                                    <p className="text-white font-bold capitalize tracking-wide">{formatDate(date)}</p>
                                    <p className="text-slate-400 text-xs mt-0.5 tracking-wider uppercase font-medium">
                                        {dayExpenses.length} gasto{dayExpenses.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-red-400 font-black text-lg">-{formatCOP(total)}</span>
                                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
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
                                                <div className="w-10 h-10 rounded-full bg-slate-800 text-red-500 flex items-center justify-center border border-white/5 shadow-inner">
                                                    {EXPENSE_ICONS[expense.type]}
                                                </div>
                                                <div>
                                                    <p className="text-slate-200 font-bold text-sm">
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
                                            <div className="flex items-center gap-4">
                                                <span className="text-red-400 font-black">-{formatCOP(expense.amount)}</span>
                                                <button
                                                    onClick={() => setConfirmRecord(expense)}
                                                    className="w-10 h-10 rounded-xl bg-slate-800/50 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 active:scale-90 flex items-center justify-center border border-white/5"
                                                    aria-label="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
