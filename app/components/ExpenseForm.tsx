'use client';

import { useState } from 'react';
import {
    ExpenseType,
    EXPENSE_EMOJIS,
    EXPENSE_LABELS,
    EXPENSE_PRESET_AMOUNTS,
} from '../types';

interface ExpenseFormProps {
    onSave: (type: ExpenseType, amount: number, note?: string) => void;
}

const formatCOP = (n: number) => '$' + n.toLocaleString('es-CO');

const expenseTypes: ExpenseType[] = ['gasolina', 'comida', 'mantenimiento', 'otro'];

const TYPE_COLORS: Record<ExpenseType, string> = {
    gasolina: 'selected:bg-orange-400 bg-orange-400 shadow-orange-400/30',
    comida: 'selected:bg-pink-400 bg-pink-400 shadow-pink-400/30',
    mantenimiento: 'selected:bg-blue-400 bg-blue-400 shadow-blue-400/30',
    otro: 'selected:bg-violet-400 bg-violet-400 shadow-violet-400/30',
};

const SELECTED_BG: Record<ExpenseType, string> = {
    gasolina: 'bg-orange-400 text-slate-900 shadow-lg shadow-orange-400/30 scale-[1.02]',
    comida: 'bg-pink-400 text-slate-900 shadow-lg shadow-pink-400/30 scale-[1.02]',
    mantenimiento: 'bg-blue-400 text-slate-900 shadow-lg shadow-blue-400/30 scale-[1.02]',
    otro: 'bg-violet-400 text-slate-900 shadow-lg shadow-violet-400/30 scale-[1.02]',
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
        <div className="flex flex-col gap-5">
            {/* Step 1: Expense Type */}
            <section aria-labelledby="label-expense-type">
                <h2 id="label-expense-type" className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    1. Tipo de gasto
                </h2>
                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-labelledby="label-expense-type">
                    {expenseTypes.map((type) => {
                        const isSelected = selectedType === type;
                        return (
                            <button
                                key={type}
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => setSelectedType(type)}
                                className={`flex flex-col items-center justify-center gap-1 py-4 rounded-2xl font-bold transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400 ${isSelected
                                    ? SELECTED_BG[type]
                                    : 'bg-slate-700/60 text-slate-200 hover:bg-slate-600/60'
                                    }`}
                            >
                                <span className="text-3xl">{EXPENSE_EMOJIS[type]}</span>
                                <span className="text-sm font-semibold">{EXPENSE_LABELS[type]}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Step 2: Amount */}
            <section aria-labelledby="label-expense-amount" aria-live="polite">
                <h2 id="label-expense-amount" className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    2. Valor del gasto
                </h2>
                <div className="grid grid-cols-3 gap-2 mb-2" role="radiogroup" aria-labelledby="label-expense-amount">
                    {EXPENSE_PRESET_AMOUNTS.map((amount) => {
                        const isSelected = !showCustom && selectedAmount === amount;
                        return (
                            <button
                                key={amount}
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => {
                                    setSelectedAmount(amount);
                                    setShowCustom(false);
                                    setCustomAmount('');
                                }}
                                className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400 ${isSelected
                                    ? 'bg-red-400 text-slate-900 shadow-lg shadow-red-400/30 scale-[1.02]'
                                    : 'bg-slate-700/60 text-slate-200 hover:bg-slate-600/60'
                                    }`}
                            >
                                {formatCOP(amount)}
                            </button>
                        );
                    })}
                    <button
                        role="radio"
                        aria-checked={showCustom}
                        onClick={() => {
                            setShowCustom(true);
                            setSelectedAmount(null);
                        }}
                        className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-400 ${showCustom
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
                                id="custom-expense-input"
                                type="number"
                                inputMode="numeric"
                                placeholder="Ingresa el valor"
                                aria-label="Ingresa un gasto personalizado"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value.replace(/\D/g, ''))}
                                className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-700/60 text-slate-100 text-base font-semibold border border-violet-400/50 focus:outline-none focus:border-violet-400 focus-visible:ring-2 focus-visible:ring-violet-400 placeholder:text-slate-500"
                                autoFocus
                            />
                        </div>
                        {customAmount && (
                            <p className="text-violet-400 text-sm mt-1 text-right font-semibold">
                                {formatCOP(parseInt(customAmount))}
                            </p>
                        )}
                    </div>
                )}
            </section>

            {/* Step 3: Optional note */}
            <div>
                <label htmlFor="expense-note" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    3. Nota (opcional)
                </label>
                <input
                    id="expense-note"
                    type="text"
                    placeholder="Ej: Tanque lleno, Almuerzo..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={60}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/60 text-slate-100 text-sm border border-slate-600/50 focus:outline-none focus:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400 placeholder:text-slate-500"
                />
            </div>

            {/* Save button */}
            <button
                onClick={handleSave}
                disabled={!canSave}
                aria-disabled={!canSave}
                className={`w-full py-5 rounded-2xl text-xl font-black tracking-wide transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400 disabled:opacity-80 ${saved
                    ? 'bg-emerald-400 text-slate-900 scale-[1.02]'
                    : canSave
                        ? 'bg-red-400 text-white shadow-xl shadow-red-400/30 hover:bg-red-300'
                        : 'bg-slate-700/40 text-slate-500 cursor-not-allowed'
                    }`}
            >
                {saved ? '✅ ¡Guardado!' : canSave ? '💾 Guardar Gasto' : 'Selecciona tipo y valor'}
            </button>
        </div>
    );
}
