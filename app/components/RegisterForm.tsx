'use client';

import { useState } from 'react';
import { ServiceType, SERVICE_EMOJIS, SERVICE_LABELS, PRESET_PRICES } from '../types';

interface RegisterFormProps {
    onSave: (type: ServiceType, price: number) => void;
}

const formatCOP = (n: number) =>
    '$' + n.toLocaleString('es-CO');

export default function RegisterForm({ onSave }: RegisterFormProps) {
    const [selectedType, setSelectedType] = useState<ServiceType | null>(null);
    const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
    const [customPrice, setCustomPrice] = useState('');
    const [showCustom, setShowCustom] = useState(false);
    const [saved, setSaved] = useState(false);

    const serviceTypes: ServiceType[] = ['domicilio', 'envio', 'pasajero', 'otro'];

    const effectivePrice = showCustom
        ? parseInt(customPrice.replace(/\D/g, ''), 10) || null
        : selectedPrice;

    const canSave = selectedType !== null && effectivePrice !== null && effectivePrice > 0;

    const handleSave = () => {
        if (!canSave || !selectedType || !effectivePrice) return;
        onSave(selectedType, effectivePrice);
        setSaved(true);
        setTimeout(() => {
            setSelectedType(null);
            setSelectedPrice(null);
            setCustomPrice('');
            setShowCustom(false);
            setSaved(false);
        }, 900);
    };

    const handleCustomInput = (val: string) => {
        // Allow only digits
        const digits = val.replace(/\D/g, '');
        setCustomPrice(digits);
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Step 1: Service Type */}
            <section aria-labelledby="label-service-type">
                <h2 id="label-service-type" className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    1. Tipo de servicio
                </h2>
                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-labelledby="label-service-type">
                    {serviceTypes.map((type) => {
                        const isSelected = selectedType === type;
                        return (
                            <button
                                key={type}
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => setSelectedType(type)}
                                className={`flex flex-col items-center justify-center gap-1 py-4 rounded-2xl text-2xl font-bold transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500 ${isSelected
                                    ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/30 scale-[1.02]'
                                    : 'bg-slate-700/60 text-slate-200 hover:bg-slate-600/60'
                                    }`}
                            >
                                <span className="text-3xl">{SERVICE_EMOJIS[type]}</span>
                                <span className="text-sm font-semibold">{SERVICE_LABELS[type]}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Step 2: Price */}
            <section aria-labelledby="label-price" aria-live="polite">
                <h2 id="label-price" className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    2. Precio del servicio
                </h2>
                <div className="grid grid-cols-3 gap-2 mb-2" role="radiogroup" aria-labelledby="label-price">
                    {PRESET_PRICES.map((price) => {
                        const isSelected = !showCustom && selectedPrice === price;
                        return (
                            <button
                                key={price}
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => {
                                    setSelectedPrice(price);
                                    setShowCustom(false);
                                    setCustomPrice('');
                                }}
                                className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500 ${isSelected
                                    ? 'bg-emerald-400 text-slate-900 shadow-lg shadow-emerald-400/30 scale-[1.02]'
                                    : 'bg-slate-700/60 text-slate-200 hover:bg-slate-600/60'
                                    }`}
                            >
                                {formatCOP(price)}
                            </button>
                        );
                    })}
                    {/* Custom button */}
                    <button
                        role="radio"
                        aria-checked={showCustom}
                        onClick={() => {
                            setShowCustom(true);
                            setSelectedPrice(null);
                        }}
                        className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-500 ${showCustom
                            ? 'bg-violet-400 text-slate-900 shadow-lg shadow-violet-400/30 scale-[1.02]'
                            : 'bg-slate-700/60 text-slate-200 hover:bg-slate-600/60'
                            }`}
                    >
                        🖊️ Otro
                    </button>
                </div>

                {showCustom && (
                    <div className="mt-2">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold" aria-hidden="true">$</span>
                            <input
                                id="custom-price-input"
                                type="number"
                                inputMode="numeric"
                                placeholder="Ingresa el valor"
                                aria-label="Ingresa un precio personalizado"
                                value={customPrice}
                                onChange={(e) => handleCustomInput(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-700/60 text-slate-100 text-base font-semibold border border-violet-400/50 focus:outline-none focus:border-violet-400 focus-visible:ring-2 focus-visible:ring-violet-400 placeholder:text-slate-500"
                                autoFocus
                            />
                        </div>
                        {customPrice && !isNaN(parseInt(customPrice)) && (
                            <p className="text-violet-400 text-sm mt-1 text-right font-semibold">
                                {formatCOP(parseInt(customPrice))}
                            </p>
                        )}
                    </div>
                )}
            </section>

            {/* Step 3: Save Button */}
            <button
                onClick={handleSave}
                disabled={!canSave}
                aria-disabled={!canSave}
                className={`w-full py-5 rounded-2xl text-xl font-black tracking-wide transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500 disabled:opacity-80 ${saved
                    ? 'bg-emerald-400 text-slate-900 scale-[1.02]'
                    : canSave
                        ? 'bg-amber-400 text-slate-900 shadow-xl shadow-amber-400/30 hover:bg-amber-300'
                        : 'bg-slate-700/40 text-slate-500 cursor-not-allowed'
                    }`}
            >
                {saved ? '✅ ¡Guardado!' : canSave ? '💾 Guardar Servicio' : 'Selecciona tipo y precio'}
            </button>
        </div>
    );
}
