'use client';

import { useState } from 'react';
import { ServiceRecord, SERVICE_EMOJIS, SERVICE_LABELS } from '../types';

interface HistoryViewProps {
    byDate: () => Record<string, ServiceRecord[]>;
    sortedDates: string[];
    getDayTotal: (date: string) => number;
    onDelete: (id: string) => void;
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

    return d.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
}

function formatTime(isoStr: string): string {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

interface DeleteConfirmProps {
    record: ServiceRecord;
    onConfirm: () => void;
    onCancel: () => void;
}

function DeleteConfirm({ record, onConfirm, onCancel }: DeleteConfirmProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <p className="text-xl font-bold text-white text-center mb-2">¿Eliminar registro?</p>
                <p className="text-slate-400 text-center text-sm mb-5">
                    {SERVICE_EMOJIS[record.type]} {SERVICE_LABELS[record.type]} —{' '}
                    <span className="text-amber-400 font-semibold">{formatCOP(record.price)}</span>
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

export default function HistoryView({
    byDate,
    sortedDates,
    getDayTotal,
    onDelete,
}: HistoryViewProps) {
    const [confirmRecord, setConfirmRecord] = useState<ServiceRecord | null>(null);
    const [expandedDates, setExpandedDates] = useState<Set<string>>(
        () => new Set(sortedDates.slice(0, 1)) // expand today by default
    );

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
                <span className="text-6xl mb-4">🛵</span>
                <p className="text-lg font-semibold">Sin registros aún</p>
                <p className="text-sm mt-1">¡Registra tu primer servicio!</p>
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
                    const dayRecords = groups[date] || [];
                    const total = getDayTotal(date);
                    const isExpanded = expandedDates.has(date);

                    return (
                        <div key={date} className="bg-slate-800/60 rounded-2xl overflow-hidden border border-slate-700/50">
                            {/* Day Header */}
                            <button
                                onClick={() => toggleDate(date)}
                                className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-700/30 transition active:bg-slate-700/50"
                            >
                                <div className="text-left">
                                    <p className="text-white font-bold capitalize">{formatDate(date)}</p>
                                    <p className="text-slate-400 text-xs mt-0.5">
                                        {dayRecords.length} servicio{dayRecords.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-emerald-400 font-black text-lg">{formatCOP(total)}</span>
                                    <span className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </div>
                            </button>

                            {/* Day Records */}
                            {isExpanded && (
                                <div className="border-t border-slate-700/50">
                                    {dayRecords.map((record, idx) => (
                                        <div
                                            key={record.id}
                                            className={`flex items-center justify-between px-4 py-3 ${idx < dayRecords.length - 1 ? 'border-b border-slate-700/30' : ''
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{SERVICE_EMOJIS[record.type]}</span>
                                                <div>
                                                    <p className="text-slate-200 font-semibold text-sm">
                                                        {SERVICE_LABELS[record.type]}
                                                    </p>
                                                    <p className="text-slate-500 text-xs">{formatTime(record.timestamp)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-amber-400 font-bold">{formatCOP(record.price)}</span>
                                                <button
                                                    onClick={() => setConfirmRecord(record)}
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
        </>
    );
}
