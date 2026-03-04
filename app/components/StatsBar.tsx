'use client';

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
        <div className="flex flex-col gap-3">
            {/* Top row: Today + Grand Total */}
            <div className="grid grid-cols-2 gap-3">
                {/* Today */}
                <div className="bg-linear-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl p-4">
                    <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
                        📅 Hoy · Ingresos
                    </p>
                    <p className="text-white text-xl font-black leading-tight">{formatCOP(todayTotal)}</p>
                    <p className="text-slate-400 text-xs mt-1">
                        {todayCount} servicio{todayCount !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Grand Total */}
                <div className="bg-linear-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-4">
                    <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                        💰 Acumulado
                    </p>
                    <p className="text-white text-xl font-black leading-tight">{formatCOP(grandTotal)}</p>
                    <p className="text-slate-400 text-xs mt-1">Total histórico</p>
                </div>
            </div>

            {/* Net income row */}
            <div className="grid grid-cols-3 gap-3">
                {/* Today expenses */}
                <div className="bg-slate-800/60 border border-red-500/20 rounded-2xl p-3">
                    <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">
                        ⛽ Gastos hoy
                    </p>
                    <p className="text-red-300 text-base font-black">-{formatCOP(todayExpenses)}</p>
                </div>

                {/* Today net */}
                <div className={`bg-slate-800/60 border rounded-2xl p-3 ${todayNet >= 0 ? 'border-emerald-500/30' : 'border-red-500/30'
                    }`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${todayNet >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                        📊 Neto hoy
                    </p>
                    <p className={`text-base font-black ${todayNet >= 0 ? 'text-emerald-300' : 'text-red-300'
                        }`}>
                        {todayNet >= 0 ? '' : '-'}{formatCOP(Math.abs(todayNet))}
                    </p>
                </div>

                {/* Grand net */}
                <div className={`bg-slate-800/60 border rounded-2xl p-3 ${grandNet >= 0 ? 'border-violet-500/30' : 'border-red-500/30'
                    }`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${grandNet >= 0 ? 'text-violet-400' : 'text-red-400'
                        }`}>
                        🏆 Neto total
                    </p>
                    <p className={`text-base font-black ${grandNet >= 0 ? 'text-violet-300' : 'text-red-300'
                        }`}>
                        {grandNet >= 0 ? '' : '-'}{formatCOP(Math.abs(grandNet))}
                    </p>
                </div>
            </div>
        </div>
    );
}
