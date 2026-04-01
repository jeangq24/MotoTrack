'use client';

import { useState, useEffect, useRef } from 'react';
import { ServiceRecord, ServiceType, SERVICE_LABELS } from '../types';
import { Bike, Package, User, MoreHorizontal, ChevronDown, Trash2, CheckCircle2 } from 'lucide-react';

const SERVICE_ICONS: Record<ServiceType, React.ReactNode> = {
    domicilio: <Bike className="w-6 h-6" strokeWidth={1.5} />,
    envio: <Package className="w-6 h-6" strokeWidth={1.5} />,
    pasajero: <User className="w-6 h-6" strokeWidth={1.5} />,
    otro: <MoreHorizontal className="w-6 h-6" strokeWidth={1.5} />,
};

interface HistoryViewProps {
    byDate: () => Record<string, ServiceRecord[]>;
    sortedDates: string[];
    getDayTotal: (date: string) => number;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<ServiceRecord>) => void;
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
    return d.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
}

function formatTime(isoStr: string): string {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit' });
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

interface DeleteConfirmProps {
    record: ServiceRecord;
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
                <p className="text-xl font-black text-white text-center mb-2 tracking-tight">¿Eliminar registro?</p>
                <div className="flex items-center justify-center gap-2 mb-6 text-slate-300 bg-slate-800/50 py-3 rounded-2xl border border-white/5">
                    <span className="text-emerald-400">{SERVICE_ICONS[record.type]}</span>
                    <span className="font-semibold">{SERVICE_LABELS[record.type]}</span>
                    <span className="text-emerald-400 font-bold ml-1">{formatCOP(record.price || 0)}</span>
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

interface CompleteConfirmProps {
    record: ServiceRecord;
    onConfirm: (finalPrice: number) => void;
    onCancel: () => void;
}

function CompleteConfirm({ record, onConfirm, onCancel }: CompleteConfirmProps) {
    const [priceStr, setPriceStr] = useState('');
    const isValid = parseInt(priceStr, 10) > 0;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900/90 border border-white/10 rounded-[24px] p-6 w-full max-w-sm shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-xl font-black text-white text-center mb-2 tracking-tight">Finalizar Servicio</p>
                <div className="flex items-center justify-center gap-2 mb-4 text-slate-300 bg-slate-800/50 py-3 rounded-2xl border border-white/5">
                    <span className="text-emerald-400">{SERVICE_ICONS[record.type]}</span>
                    <span className="font-semibold">{SERVICE_LABELS[record.type]}</span>
                </div>
                
                <div className="mb-6 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold" aria-hidden="true">$</span>
                    <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Valor cobrado"
                        value={priceStr}
                        onChange={(e) => setPriceStr(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-8 pr-4 py-4 rounded-xl bg-slate-950/50 text-white text-lg font-bold border border-white/10 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3.5 rounded-xl bg-slate-800 text-slate-300 font-bold transition-all hover:bg-slate-700 active:scale-95 border border-white/5"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(parseInt(priceStr, 10))}
                        disabled={!isValid}
                        className={`flex-1 py-3.5 rounded-xl font-bold transition-all shadow-lg ${isValid ? 'bg-blue-500 text-white hover:bg-blue-400 active:scale-95 shadow-blue-500/20' : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed border border-white/5'}`}
                    >
                        Guardar
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
    onUpdate,
    loadMore,
    hasMore,
    loadingMore,
}: HistoryViewProps) {
    const [confirmRecord, setConfirmRecord] = useState<ServiceRecord | null>(null);
    const [completeRecord, setCompleteRecord] = useState<ServiceRecord | null>(null);
    const [expandedDates, setExpandedDates] = useState<Set<string>>(
        () => new Set(sortedDates.slice(0, 1)) // expand today by default
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
            rootMargin: '20px',
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

            {completeRecord && (
                <CompleteConfirm
                    record={completeRecord}
                    onConfirm={(finalPrice) => {
                        const now = new Date();
                        onUpdate(completeRecord.id, { 
                            status: 'completed', 
                            price: finalPrice,
                            timestamp: getLocalISOString(now),
                            date: getLocalDateStr(now)
                        });
                        setCompleteRecord(null);
                    }}
                    onCancel={() => setCompleteRecord(null)}
                />
            )}

            <div className="flex flex-col gap-3">
                {sortedDates.map((date) => {
                    const dayRecords = groups[date] || [];
                    const total = getDayTotal(date);
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
                                        {dayRecords.length} servicio{dayRecords.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-emerald-400 font-black text-lg">{formatCOP(total)}</span>
                                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
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
                                                <div className="w-10 h-10 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center border border-white/5 shadow-inner">
                                                    {SERVICE_ICONS[record.type]}
                                                </div>
                                                <div>
                                                    <p className="text-slate-200 font-bold text-sm">
                                                        {SERVICE_LABELS[record.type]}
                                                    </p>
                                                    <p className="text-slate-500 text-xs">{formatTime(record.timestamp)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {record.status === 'scheduled' ? (
                                                    <>
                                                        <span className="text-blue-400 font-bold text-[10px] uppercase tracking-wider bg-blue-400/10 px-2 py-1 rounded-md">
                                                            Prog.
                                                        </span>
                                                        <button
                                                            onClick={() => setCompleteRecord(record)}
                                                            className="w-10 h-10 rounded-xl bg-blue-400/10 text-blue-400 hover:bg-blue-400/20 transition-all duration-300 active:scale-90 flex items-center justify-center border border-blue-400/20"
                                                            aria-label="Completar"
                                                        >
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-emerald-400 font-black">+{formatCOP(record.price || 0)}</span>
                                                )}
                                                <button
                                                    onClick={() => setConfirmRecord(record)}
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
