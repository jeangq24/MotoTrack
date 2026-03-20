'use client';

import { useState } from 'react';
import {
    ExpenseType,
    EXPENSE_LABELS,
    EXPENSE_PRESET_AMOUNTS,
} from '../types';
import { Fuel, Coffee, Wrench, MoreHorizontal, Edit3, CheckCircle2 } from 'lucide-react';

const EXPENSE_ICONS: Record<ExpenseType, React.ReactNode> = {
    gasolina: <Fuel className="w-8 h-8" strokeWidth={1.5} />,
    comida: <Coffee className="w-8 h-8" strokeWidth={1.5} />,
    mantenimiento: <Wrench className="w-8 h-8" strokeWidth={1.5} />,
    otro: <MoreHorizontal className="w-8 h-8" strokeWidth={1.5} />,
};

interface ExpenseFormProps {
    onSave: (type: ExpenseType, amount: number, note?: string) => void;
}

const formatCOP = (n: number) => '$' + n.toLocaleString('es-CO');

const expenseTypes: ExpenseType[] = ['gasolina', 'comida', 'mantenimiento', 'otro'];

const SELECTED_BG: Record<ExpenseType, string> = {
    gasolina: 'bg-orange-500 text-slate-900 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)] scale-[1.02]',
    comida: 'bg-pink-500 text-slate-900 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.2)] scale-[1.02]',
    mantenimiento: 'bg-blue-500 text-slate-900 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)] scale-[1.02]',
    otro: 'bg-violet-500 text-slate-900 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.2)] scale-[1.02]',
};

export default function ExpenseForm({ onSave }: ExpenseFormProps) {
    const [selectedType, setSelectedType] = useState<ExpenseType | null>(null);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState('');
    const [showCustom, setShowCustom] = useState(false);
    const [note, setNote] = useState('');
    const [saved, setSaved] = useState(false);

    const effectiveAmount = showCustom
        ? parseInt(customAmount.replace(/\D/g, ''), 10) || null
        : selectedAmount;

    const canSave = selectedType !== null && effectiveAmount !== null && effectiveAmount > 0;

    const handleSave = () => {
        if (!canSave || !selectedType || !effectiveAmount) return;
        onSave(selectedType, effectiveAmount, note.trim() || undefined);
        setSaved(true);
        setTimeout(() => {
            setSelectedType(null);
            setSelectedAmount(null);
            setCustomAmount('');
            setShowCustom(false);
            setNote('');
            setSaved(false);
        }, 900);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Step 1: Expense Type */}
            <section aria-labelledby="label-expense-type">
                <h2 id="label-expense-type" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1">
                    1. ¿En qué gastaste?
                </h2>
                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-labelledby="label-expense-type">
                    {expenseTypes.map((type) => {
                        const isSelected = selectedType === type;
                        return (
                            <button
                                type="button"
                                key={type}
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => setSelectedType(type)}
                                className={`flex flex-col items-center justify-center gap-2 py-5 rounded-3xl transition-all duration-300 active:scale-95 border focus:outline-none ${isSelected
                                    ? SELECTED_BG[type]
                                    : 'bg-slate-800/50 text-slate-400 border-white/5 hover:bg-slate-800 hover:text-slate-300'
                                    }`}
                            >
                                {EXPENSE_ICONS[type]}
                                <span className={`text-xs font-bold tracking-wide ${isSelected ? 'text-slate-900' : 'text-slate-300'}`}>
                                    {EXPENSE_LABELS[type]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Step 2: Amount */}
            <section aria-labelledby="label-expense-amount" aria-live="polite">
                <h2 id="label-expense-amount" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1">
                    2. ¿Cuánto se fue?
                </h2>
                <div className="grid grid-cols-3 gap-2 mb-3" role="radiogroup" aria-labelledby="label-expense-amount">
                    {EXPENSE_PRESET_AMOUNTS.map((amount) => {
                        const isSelected = !showCustom && selectedAmount === amount;
                        return (
                            <button
                                type="button"
                                key={amount}
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => {
                                    setSelectedAmount(amount);
                                    setShowCustom(false);
                                    setCustomAmount('');
                                }}
                                className={`py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95 border focus:outline-none ${isSelected
                                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)] scale-[1.02]'
                                    : 'bg-slate-800/50 text-slate-400 border-white/5 hover:bg-slate-800 hover:text-slate-300'
                                    }`}
                            >
                                {formatCOP(amount)}
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        role="radio"
                        aria-checked={showCustom}
                        onClick={() => {
                            setShowCustom(true);
                            setSelectedAmount(null);
                        }}
                        className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95 border focus:outline-none ${showCustom
                            ? 'bg-violet-500 text-slate-900 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.2)] scale-[1.02]'
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
                            id="custom-expense-input"
                            type="number"
                            inputMode="numeric"
                            placeholder="Monto exacto"
                            aria-label="Ingresa un gasto personalizado"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value.replace(/\D/g, ''))}
                            className="w-full pl-8 pr-4 py-4 rounded-2xl bg-slate-950/50 text-white text-lg font-bold border border-white/10 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder:text-slate-600 transition-all shadow-inner"
                        />
                    </div>
                </div>
            </section>

            {/* Step 3: Optional note */}
            <section aria-labelledby="label-expense-note">
                <h2 id="label-expense-note" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1">
                    3. Detalles (opcional)
                </h2>
                <input
                    id="expense-note"
                    type="text"
                    placeholder="Ej: Tanque lleno, almorcé por ahí..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={60}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-950/50 text-white text-sm border border-white/10 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 placeholder:text-slate-600 shadow-inner transition-all"
                />
            </section>

            {/* Save button */}
            <div className="mt-2 pt-2 border-t border-white/5">
                <button
                    onClick={handleSave}
                    disabled={!canSave}
                    aria-disabled={!canSave}
                    className={`w-full py-4 rounded-2xl text-lg flex items-center justify-center gap-2 font-black tracking-wide transition-all duration-300 focus:outline-none disabled:opacity-50 border ${saved
                        ? 'bg-emerald-400 text-slate-900 border-emerald-400 scale-100'
                        : canSave
                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:bg-indigo-400 hover:scale-[1.02] active:scale-95'
                            : 'bg-slate-800/30 text-slate-600 border-white/5 cursor-not-allowed'
                        }`}
                >
                    {saved ? (
                        <><CheckCircle2 className="w-6 h-6" /> Guardado!</>
                    ) : (
                        canSave ? 'Guardar Gasto' : 'Llena los datos'
                    )}
                </button>
            </div>
        </div>
    );
}
