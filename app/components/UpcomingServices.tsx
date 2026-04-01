'use client';

import { useState } from 'react';
import { ServiceRecord, ServiceType, SERVICE_LABELS } from '../types';
import { Bike, Package, User, MoreHorizontal, Clock, CalendarDays, CheckCircle2, Trash2, ChevronRight } from 'lucide-react';

const SERVICE_ICONS: Record<ServiceType, React.ReactNode> = {
    domicilio: <Bike className="w-5 h-5" strokeWidth={1.5} />,
    envio: <Package className="w-5 h-5" strokeWidth={1.5} />,
    pasajero: <User className="w-5 h-5" strokeWidth={1.5} />,
    otro: <MoreHorizontal className="w-5 h-5" strokeWidth={1.5} />,
};

interface UpcomingServicesProps {
    records: ServiceRecord[];
    onComplete: (id: string, finalPrice: number) => void;
    onDelete: (id: string) => void;
}

function formatRelativeFuture(dateStr: string, timeStr: string): string {
    const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' });
    const todayStr = formatter.format(new Date());
    const tomorrowStr = formatter.format(new Date(Date.now() + 86400000));

    if (dateStr === todayStr) return `Hoy a las ${timeStr}`;
    if (dateStr === tomorrowStr) return `Mañana a las ${timeStr}`;

    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const dayName = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
    return `${dayName} a las ${timeStr}`;
}

export default function UpcomingServices({ records, onComplete, onDelete }: UpcomingServicesProps) {
    const [completingId, setCompletingId] = useState<string | null>(null);
    const [finalPrice, setFinalPrice] = useState('');

    const scheduled = records.filter(r => r.status === 'scheduled');

    if (scheduled.length === 0) {
        return null;
    }

    // Sort by timestamp (asc)
    const sorted = [...scheduled].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const handleConfirm = (id: string) => {
        const priceNum = parseInt(finalPrice.replace(/\D/g, ''), 10);
        if (priceNum > 0) {
            onComplete(id, priceNum);
            setCompletingId(null);
            setFinalPrice('');
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Siguientes Servicios ({scheduled.length})
            </h2>
            
            <div className="flex flex-col gap-3">
                {sorted.map(record => {
                    // timestamp format from form was `${scheduleDate}T${scheduleTime}` inside useServices
                    // Actually, useServices saved it as standard ISO string. Let's parse.
                    const d = new Date(record.timestamp);
                    const dateStr = record.date; 
                    const timeStr = d.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit' });

                    const isCompleting = completingId === record.id;

                    return (
                        <div key={record.id} className="bg-blue-500/10 border border-blue-400/20 rounded-3xl p-4 backdrop-blur-sm relative overflow-hidden transition-all duration-300">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-3xl"></div>
                            
                            {!isCompleting ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-900/60 text-blue-400 flex items-center justify-center border border-white/5 shadow-inner">
                                            {SERVICE_ICONS[record.type]}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-base mb-0.5">
                                                {SERVICE_LABELS[record.type]}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                                                <CalendarDays className="w-3 h-3 text-blue-400" />
                                                <span className="capitalize">{formatRelativeFuture(dateStr, timeStr)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onDelete(record.id)}
                                            className="w-10 h-10 rounded-xl bg-slate-800/50 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 active:scale-95 flex items-center justify-center border border-white/5"
                                            aria-label="Cancelar Servicio"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setCompletingId(record.id)}
                                            className="h-10 px-4 rounded-xl bg-blue-500 text-white font-bold text-xs tracking-wide hover:bg-blue-400 transition-all duration-300 active:scale-95 flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Fin
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <p className="text-white font-bold text-sm tracking-wide">¿Cuánto cobraste por este {SERVICE_LABELS[record.type].toLowerCase()}?</p>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold" aria-hidden="true">$</span>
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                placeholder="Monto"
                                                autoFocus
                                                value={finalPrice}
                                                onChange={(e) => setFinalPrice(e.target.value.replace(/\D/g, ''))}
                                                className="w-full pl-7 pr-3 py-3 rounded-xl bg-slate-900/80 text-white font-bold border border-white/10 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                setCompletingId(null);
                                                setFinalPrice('');
                                            }}
                                            className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold transition-all hover:bg-slate-700 active:scale-95 border border-white/5"
                                        >
                                            Atrás
                                        </button>
                                        <button
                                            onClick={() => handleConfirm(record.id)}
                                            disabled={!finalPrice || parseInt(finalPrice, 10) === 0}
                                            className="px-4 py-3 rounded-xl bg-emerald-500 text-white font-bold transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
