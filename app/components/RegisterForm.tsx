'use client';

import { useState } from 'react';
import { ServiceType, SERVICE_LABELS, PRESET_PRICES } from '../types';
import { Bike, Package, User, MoreHorizontal, Edit3, CheckCircle2 } from 'lucide-react';

const SERVICE_ICONS: Record<ServiceType, React.ReactNode> = {
    domicilio: <Bike className="w-8 h-8" strokeWidth={1.5} />,
    envio: <Package className="w-8 h-8" strokeWidth={1.5} />,
    pasajero: <User className="w-8 h-8" strokeWidth={1.5} />,
    otro: <MoreHorizontal className="w-8 h-8" strokeWidth={1.5} />,
};

interface RegisterFormProps {
    onSave: (type: ServiceType, price: number | null, status: 'completed' | 'scheduled', datetime?: string) => void;
}

const formatCOP = (n: number) =>
    '$' + n.toLocaleString('es-CO');

export default function RegisterForm({ onSave }: RegisterFormProps) {
    const [selectedType, setSelectedType] = useState<ServiceType | null>(null);
    const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
    const [customPrice, setCustomPrice] = useState('');
    const [showCustom, setShowCustom] = useState(false);
    const [mode, setMode] = useState<'immediate' | 'scheduled'>('immediate');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [saved, setSaved] = useState(false);

    const serviceTypes: ServiceType[] = ['domicilio', 'envio', 'pasajero', 'otro'];

    const effectivePrice = showCustom
        ? parseInt(customPrice.replace(/\D/g, ''), 10) || null
        : selectedPrice;

    const canSaveImmediate = selectedType !== null && effectivePrice !== null && effectivePrice > 0;
    
    const isFuture = () => {
        if (!scheduleDate || !scheduleTime) return false;
        const now = new Date();
        const selected = new Date(`${scheduleDate}T${scheduleTime}-05:00`);
        return selected > now;
    };
    const canSaveScheduled = selectedType !== null && isFuture();
    const canSave = mode === 'immediate' ? canSaveImmediate : canSaveScheduled;

    const minDateStr = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' }).format(new Date());

    const handleSave = () => {
        if (!canSave || !selectedType) return;
        
        if (mode === 'immediate') {
            if (!effectivePrice) return;
            onSave(selectedType, effectivePrice, 'completed');
        } else {
            const datetime = `${scheduleDate}T${scheduleTime}`;
            onSave(selectedType, null, 'scheduled', datetime);
        }

        setSaved(true);
        setTimeout(() => {
            setSelectedType(null);
            setSelectedPrice(null);
            setCustomPrice('');
            setShowCustom(false);
            setMode('immediate');
            setScheduleDate('');
            setScheduleTime('');
            setSaved(false);
        }, 900);
    };

    const handleCustomInput = (val: string) => {
        // Allow only digits
        const digits = val.replace(/\D/g, '');
        setCustomPrice(digits);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Step 1: Service Type */}
            <section aria-labelledby="label-service-type">
                <h2 id="label-service-type" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1">
                    1. ¿Qué servicio hiciste?
                </h2>
                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-labelledby="label-service-type">
                    {serviceTypes.map((type) => {
                        const isSelected = selectedType === type;
                        return (
                            <button
                                type="button"
                                key={type}
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => setSelectedType(type)}
                                className={`flex flex-col items-center justify-center gap-2 py-5 rounded-3xl transition-all duration-300 active:scale-95 border focus:outline-none ${isSelected
                                    ? 'bg-amber-400 text-slate-900 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)] scale-[1.02]'
                                    : 'bg-slate-800/50 text-slate-400 border-white/5 hover:bg-slate-800 hover:text-slate-300'
                                    }`}
                            >
                                {SERVICE_ICONS[type]}
                                <span className={`text-xs font-bold tracking-wide ${isSelected ? 'text-slate-900' : 'text-slate-300'}`}>
                                    {SERVICE_LABELS[type]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Step 1.5: Mode Toggle */}
            <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
                <button
                    type="button"
                    onClick={() => setMode('immediate')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mode === 'immediate' ? 'bg-amber-400 text-slate-900 shadow-lg scale-100' : 'text-slate-400 hover:text-slate-300 scale-95'}`}
                >⚡ Finalizado</button>
                <button
                    type="button"
                    onClick={() => setMode('scheduled')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mode === 'scheduled' ? 'bg-blue-400 text-slate-900 shadow-lg scale-100' : 'text-slate-400 hover:text-slate-300 scale-95'}`}
                >🗓️ Programar</button>
            </div>

            {/* Step 2: Details */}
            {mode === 'immediate' ? (
                <section aria-labelledby="label-price" aria-live="polite">
                <h2 id="label-price" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1">
                    2. ¿Cuánto cobraste?
                </h2>
                <div className="grid grid-cols-3 gap-2 mb-3" role="radiogroup" aria-labelledby="label-price">
                    {PRESET_PRICES.map((price) => {
                        const isSelected = !showCustom && selectedPrice === price;
                        return (
                            <button
                                type="button"
                                key={price}
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => {
                                    setSelectedPrice(price);
                                    setShowCustom(false);
                                    setCustomPrice('');
                                }}
                                className={`py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95 border focus:outline-none ${isSelected
                                    ? 'bg-emerald-400 text-slate-900 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.2)] scale-[1.02]'
                                    : 'bg-slate-800/50 text-slate-400 border-white/5 hover:bg-slate-800 hover:text-slate-300'
                                    }`}
                            >
                                {formatCOP(price)}
                            </button>
                        );
                    })}
                    {/* Custom button */}
                    <button
                        type="button"
                        role="radio"
                        aria-checked={showCustom}
                        onClick={() => {
                            setShowCustom(true);
                            setSelectedPrice(null);
                        }}
                        className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95 border focus:outline-none ${showCustom
                            ? 'bg-violet-400 text-slate-900 border-violet-400 shadow-[0_0_20px_rgba(167,139,250,0.2)] scale-[1.02]'
                            : 'bg-slate-800/50 text-slate-400 border-white/5 hover:bg-slate-800 hover:text-slate-300'
                            }`}
                    >
                        <Edit3 className="w-4 h-4" /> Otro
                    </button>
                </div>

                <div className={`transition-all duration-300 overflow-hidden ${showCustom ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold" aria-hidden="true">$</span>
                        <input
                            id="custom-price-input"
                            type="number"
                            inputMode="numeric"
                            placeholder="Monto exacto"
                            aria-label="Ingresa un precio personalizado"
                            value={customPrice}
                            onChange={(e) => handleCustomInput(e.target.value)}
                            className="w-full pl-8 pr-4 py-4 rounded-2xl bg-slate-950/50 text-white text-lg font-bold border border-white/10 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 placeholder:text-slate-600 transition-all shadow-inner"
                        />
                    </div>
                </div>
            </section>
            ) : (
                <section aria-labelledby="label-datetime" aria-live="polite">
                    <h2 id="label-datetime" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1">
                        2. ¿Cuándo es el servicio?
                    </h2>
                    <div className="flex flex-col gap-3">
                        <input 
                            type="date" 
                            title="Fecha"
                            min={minDateStr}
                            value={scheduleDate} 
                            onChange={e => setScheduleDate(e.target.value)}
                            className="w-full px-4 py-4 rounded-2xl bg-slate-950/50 text-white text-base font-bold border border-white/10 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                        />
                        <input 
                            type="time" 
                            title="Hora"
                            value={scheduleTime} 
                            onChange={e => setScheduleTime(e.target.value)}
                            className="w-full px-4 py-4 rounded-2xl bg-slate-950/50 text-white text-base font-bold border border-white/10 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                        />
                    </div>
                    {mode === 'scheduled' && scheduleDate && scheduleTime && !isFuture() && (
                        <p className="text-red-400 text-xs font-bold mt-2 ml-1 animate-pulse">
                            ⚠️ La fecha y hora deben ser en el futuro.
                        </p>
                    )}
                </section>
            )}

            {/* Step 3: Save Button */}
            <div className="mt-2 pt-2 border-t border-white/5">
                <button
                    onClick={handleSave}
                    disabled={!canSave}
                    aria-disabled={!canSave}
                    className={`w-full py-4 rounded-2xl text-lg flex items-center justify-center gap-2 font-black tracking-wide transition-all duration-300 focus:outline-none disabled:opacity-50 border ${saved
                        ? 'bg-emerald-400 text-slate-900 border-emerald-400 scale-100'
                        : canSave
                            ? 'bg-amber-400 text-slate-900 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:bg-amber-300 hover:scale-[1.02] active:scale-95'
                            : 'bg-slate-800/30 text-slate-600 border-white/5 cursor-not-allowed'
                        }`}
                >
                    {saved ? (
                        <><CheckCircle2 className="w-6 h-6" /> ¡Guardado!</>
                    ) : (
                        canSave ? (mode === 'immediate' ? 'Guardar servicio' : 'Programar servicio') : (!isFuture() && mode === 'scheduled' && scheduleDate && scheduleTime ? 'Fecha inválida' : 'Llena los datos')
                    )}
                </button>
            </div>
        </div>
    );
}
