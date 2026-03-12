'use client';

import { ArrowUpRight, ArrowDownRight, Wallet, BadgeDollarSign, Landmark, Coins } from 'lucide-react';

interface StatsBarProps {
    todayTotal: number;
    todayCount: number;
    todayExpenses: number;
    grandTotal: number;
    grandExpenses: number;
}

const formatCOP = (n: number) => '$' + n.toLocaleString('es-CO');

export default function StatsBar({
    todayTotal,
    todayCount,
    todayExpenses,
    grandTotal,
    grandExpenses,
}: StatsBarProps) {
    const todayNet = todayTotal - todayExpenses;
    const grandNet = grandTotal - grandExpenses;

    return (
        <div className="flex flex-col gap-4 mb-2">
            {/* Main Financial Card (Today's Net) */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[32px] p-6 shadow-2xl shadow-black/40 border border-white/10 group">
                <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-linear-to-br from-emerald-500/20 to-amber-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-70"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-slate-400">
                            <BadgeDollarSign className="w-5 h-5 text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Balance del día</span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-slate-800 border border-white/5 text-[10px] font-bold text-slate-300 shadow-inner">
                            {todayCount} servicio{todayCount !== 1 ? 's' : ''} hoy
                        </span>
                    </div>

                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-slate-500 text-sm font-medium mb-1 tracking-wide">Te queda libre (Hoy)</p>
                            <h2 className={`text-4xl font-black tracking-tight ${todayNet >= 0 ? 'text-white' : 'text-red-400'}`}>
                                {todayNet >= 0 ? '' : '-'}{formatCOP(Math.abs(todayNet))}
                            </h2>
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg ${todayNet >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'}`}>
                            {todayNet >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            NETO
                        </div>
                    </div>
                </div>
            </div>

            {/* Incomes & Expenses Split Row (Today details) */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/60 rounded-3xl p-5 border border-white/5 shadow-xl shadow-black/20 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4 text-amber-500 stroke-3" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Producido</span>
                    </div>
                    <div>
                        <p className="text-xl font-black text-amber-500">{formatCOP(todayTotal)}</p>
                    </div>
                </div>

                <div className="bg-slate-900/60 rounded-3xl p-5 border border-white/5 shadow-xl shadow-black/20 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                            <ArrowDownRight className="w-4 h-4 text-red-500 stroke-3" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gastos</span>
                    </div>
                    <div>
                        <p className="text-xl font-black text-red-500">-{formatCOP(todayExpenses)}</p>
                    </div>
                </div>
            </div>

            {/* Global History Card */}
            <div className="bg-slate-900/40 rounded-3xl p-5 border border-white/5 shadow-xl flex items-center justify-between backdrop-blur-sm mt-1">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                        <Landmark className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Libre Acumulado</span>
                        <p className={`text-xl font-black ${grandNet >= 0 ? 'text-slate-200' : 'text-red-400'}`}>
                            {grandNet >= 0 ? '' : '-'}{formatCOP(Math.abs(grandNet))}
                        </p>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end mt-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-0.5">Total Producido</p>
                    <p className="text-sm font-bold text-amber-500">{formatCOP(grandTotal)}</p>
                </div>
            </div>
        </div>
    );
}
