'use client';

import { useState } from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { useMaintenance } from '../hooks/useMaintenance';
import { Vehicle, MaintenanceStatus } from '../types';
import { Bike, Trash2, Wrench, Save, CheckCircle2, ChevronDown } from 'lucide-react';

export default function VehicleManager() {
    const { vehicles, loaded, addVehicle, updateVehicleKm, deleteVehicle } = useVehicles();
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

    // Form states
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [km, setKm] = useState('');

    const handleAddVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !brand || !model || !km) return;
        const targetKm = parseInt(km, 10);
        await addVehicle(name, brand, model, targetKm);
        setName('');
        setBrand('');
        setModel('');
        setKm('');
        setIsAdding(false);
    };

    if (!loaded) return <div className="text-center text-slate-400 py-10 animate-pulse">Cargando vehículos...</div>;

    if (vehicles.length === 0 && !isAdding) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20 shadow-inner">
                    <Bike className="w-12 h-12 text-amber-500" />
                </div>
                <p className="text-xl font-black text-white text-center mb-6 tracking-tight">No ningun vehículo registrado</p>
                <button
                    onClick={() => setIsAdding(true)}
                    className="py-4 px-6 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)] active:scale-95 border border-amber-400 flex items-center gap-2"
                >
                    + Agregar mi primera vehículo
                </button>
            </div>
        );
    }

    if (isAdding) {
        return (
            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl w-full max-w-md mx-auto relative animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl shadow-2xl">
                <button onClick={() => setIsAdding(false)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition">✕</button>
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <Bike className="w-5 h-5 text-amber-400" /> Nuevo vehículo
                </h3>
                <form onSubmit={handleAddVehicle} className="flex flex-col gap-5">
                    <div>
                        <label className="text-[10px] text-slate-500 font-bold uppercase mb-1.5 block tracking-widest">Apodo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-inner"
                            placeholder="Ej: La consentida, la bebé..."
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase mb-1.5 block tracking-widest">Marca</label>
                            <input
                                type="text"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-inner"
                                placeholder="Yamaha..."
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase mb-1.5 block tracking-widest">Modelo</label>
                            <input
                                type="text"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-inner"
                                placeholder="FZ 2.0..."
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-500 font-bold uppercase mb-1.5 block tracking-widest">Kilometraje actual</label>
                        <input
                            type="number"
                            inputMode="numeric"
                            value={km}
                            onChange={(e) => setKm(e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-xl font-bold transition-all shadow-inner"
                            placeholder="Ej: 15400"
                            required
                            min="0"
                        />
                    </div>
                    <button type="submit" className="w-full py-4.5 bg-amber-400 text-slate-900 font-black tracking-wide rounded-2xl hover:bg-amber-300 transition-all active:scale-95 shadow-[0_0_20px_rgba(251,191,36,0.3)] mt-2 flex items-center justify-center gap-2 border border-amber-400">
                        <Save className="w-5 h-5" /> Guardar vehículo
                    </button>
                </form>
            </div>
        );
    }

    const currentVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

    return (
        <div className="flex flex-col gap-6 w-full max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-300">
            {/* Header / Selector */}
            <div className="flex items-center justify-between">
                <div className="relative">
                    <select
                        className="bg-slate-900/80 text-white font-black text-xl border border-white/10 rounded-2xl pl-5 pr-12 py-3 appearance-none shadow-xl hover:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                        value={currentVehicle.id}
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                    >
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400 pointer-events-none" />
                </div>

                <button
                    onClick={() => setIsAdding(true)}
                    className="w-12 h-12 flex items-center justify-center bg-slate-800/80 border border-white/5 rounded-2xl text-amber-400 hover:bg-white/5 hover:text-amber-300 transition-all active:scale-90"
                    title="Añadir otra moto"
                >
                    <Bike className="w-5 h-5" />
                </button>
            </div>

            {/* Vehiculo Activo (Card Context) */}
            <div className="bg-slate-900/80 border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-linear-to-bl from-amber-400/20 to-transparent rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col gap-2">
                    <p className="text-amber-500 text-[10px] font-bold uppercase tracking-widest">{currentVehicle.brand} • {currentVehicle.model}</p>
                    <div className="flex items-baseline justify-between mb-1">
                        <h2 className="text-3xl font-black text-white tracking-tight">{currentVehicle.name}</h2>
                        <button onClick={() => deleteVehicle(currentVehicle.id)} className="w-10 h-10 rounded-xl bg-slate-800/50 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all active:scale-95 flex items-center justify-center border border-white/5 shadow-inner">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="mt-5 p-5 bg-slate-950/50 rounded-2xl border border-white/5 flex flex-col items-center shadow-inner">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Kilometraje Actual</p>
                    <div className="flex items-center gap-3 w-full">
                        <input
                            type="number"
                            className="bg-transparent text-amber-400 text-4xl font-black text-center w-full focus:outline-none focus:border-amber-500 focus:bg-white/5 border-b-2 border-transparent border-dashed py-2 rounded-xl transition-all"
                            defaultValue={currentVehicle.current_km}
                            onBlur={(e) => {
                                const newKm = parseInt(e.target.value, 10);
                                if (!isNaN(newKm) && newKm !== currentVehicle.current_km) {
                                    updateVehicleKm(currentVehicle.id, newKm);
                                }
                            }}
                        />
                    </div>
                    <p className="text-slate-600 text-[10px] mt-3 tracking-wide text-center">Toca el número para actualizar el kilometraje (o añade una vuelta).</p>
                </div>
            </div>

            {/* Maintenance Rules Container */}
            <MaintenancePanel vehicle={currentVehicle} />
        </div>
    );
}

function MaintenancePanel({ vehicle }: { vehicle: Vehicle }) {
    const { statuses, loaded, error, addRule, deleteRule, markPerformed, refetch } = useMaintenance(vehicle);
    const [isAdding, setIsAdding] = useState(false);

    // Form rule payload
    const [name, setName] = useState('');
    const [intervalKm, setIntervalKm] = useState('');
    const [lastKm, setLastKm] = useState('');
    const [warningRange, setWarningRange] = useState('');

    const handleAddRule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !intervalKm || !lastKm) return;

        await addRule(
            name,
            parseInt(intervalKm, 10),
            parseInt(lastKm, 10),
            warningRange ? parseInt(warningRange, 10) : undefined
        );
        setName('');
        setIntervalKm('');
        setLastKm(vehicle.current_km.toString()); // default auto complete helper
        setWarningRange('');
        setIsAdding(false);
    };

    if (!loaded) return <div className="text-center text-slate-500 py-6 animate-pulse">Cargando tablero...</div>;

    const StatusBadge = ({ status }: { status: MaintenanceStatus['status'] }) => {
        switch (status) {
            case 'overdue': return <span className="bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse">Vencido</span>;
            case 'upcoming': return <span className="bg-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-amber-500/30 shadow-sm">Próximo</span>;
            case 'safe': return <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-emerald-500/20">Al Día</span>;
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="font-black text-xl text-white flex items-center gap-2 tracking-tight">
                    <Wrench className="w-5 h-5 text-amber-500" /> Taller
                </h3>
                {!isAdding && (
                    <button
                        onClick={() => {
                            setLastKm(vehicle.current_km.toString());
                            setIsAdding(true);
                        }}
                        className="text-amber-400 text-xs font-black uppercase tracking-wider bg-amber-400/10 px-4 py-2.5 rounded-xl border border-amber-400/20 hover:bg-amber-400 hover:text-slate-900 transition-all active:scale-95"
                    >
                        + Regla
                    </button>
                )}
            </div>

            {/* Form */}
            {isAdding && (
                <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-top-2 relative backdrop-blur-xl">
                    <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition bg-slate-800 w-8 h-8 flex items-center justify-center rounded-full">✕</button>
                    <h4 className="font-bold text-white mb-4">Programar Mantenimiento</h4>
                    <form onSubmit={handleAddRule} className="flex flex-col gap-4">
                        <input type="text" placeholder="Ej: Cambio de Aceite..." required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-3.5 text-white placeholder-slate-600 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition shadow-inner" />
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5 tracking-widest">Toca cambiarlo cada (KM)</label>
                                <input type="number" placeholder="Ej: 3000" min="1" required value={intervalKm} onChange={e => setIntervalKm(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-3.5 text-white placeholder-slate-600 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition shadow-inner" />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5 tracking-widest">Última vez que le hiciste (KM)</label>
                                <input type="number" placeholder="Ej: 12000" required value={lastKm} onChange={e => setLastKm(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-3.5 text-white placeholder-slate-600 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition shadow-inner" />
                            </div>
                        </div>
                        <div className="mt-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase mb-1.5 flex items-center justify-between tracking-widest">
                                Avisarme faltando
                                <span className="text-slate-600 font-normal normal-case tracking-normal">(Opcional)</span>
                            </label>
                            <input type="number" placeholder="Ej: Faltando 500KM" min="1" value={warningRange} onChange={e => setWarningRange(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-3.5 text-white placeholder-slate-600 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition shadow-inner" />
                        </div>
                        <button type="submit" className="w-full bg-amber-400 py-3.5 rounded-2xl text-slate-900 font-black tracking-wide mt-2 hover:bg-amber-300 transition active:scale-95 shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center justify-center gap-2 border border-amber-400">
                            <Save className="w-4 h-4" /> Guardar Mantenimiento
                        </button>
                    </form>
                </div>
            )}

            {statuses.length === 0 && !isAdding && (
                <div className="border border-white/10 bg-slate-900/40 rounded-3xl p-8 text-center text-slate-500 space-y-4 shadow-inner backdrop-blur-sm">
                    <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto border border-white/5 shadow-lg">
                        <Wrench className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium leading-relaxed max-w-[250px] mx-auto tracking-wide">
                        Registra a los cuántos kilómetros le tocan los cambios y Mototrack te avisa pa' que no fundas el motor.
                    </p>
                </div>
            )}

            {/* List */}
            <div className="flex flex-col gap-3">
                {statuses.map(s => {
                    const progress = Math.min(100, Math.max(0, ((vehicle.current_km - s.rule.last_service_km) / s.rule.interval_km) * 100));
                    const isOverdue = s.status === 'overdue';
                    const isUpcoming = s.status === 'upcoming';
                    const barColor = isOverdue ? 'bg-red-500' : (isUpcoming ? 'bg-amber-400' : 'bg-emerald-400');
                    const shadowGlow = isOverdue ? 'shadow-[0_0_10px_rgba(239,68,68,0.5)]' : (isUpcoming ? 'shadow-[0_0_10px_rgba(251,191,36,0.3)]' : '');

                    return (
                        <div key={s.rule.id} className="bg-slate-900/60 border border-white/5 rounded-[24px] overflow-hidden hover:border-white/10 transition duration-300 shadow-xl backdrop-blur-sm group">
                            <div className="p-5 flex flex-col gap-4 relative">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{s.rule.name}</h4>
                                        <p className="text-xs text-slate-400 uppercase tracking-widest mt-0.5">Cada {s.rule.interval_km} KM</p>
                                    </div>
                                    <StatusBadge status={s.status} />
                                </div>

                                {/* Progress Bar visual indicator */}
                                <div className="mt-1">
                                    <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-2 uppercase tracking-widest">
                                        <span>Último: {s.rule.last_service_km} KM</span>
                                        <span>Toca en: {s.rule.next_service_km} KM</span>
                                    </div>
                                    <div className="w-full bg-slate-950/80 rounded-full h-3 border border-white/5 overflow-hidden shadow-inner">
                                        <div className={`h-full ${barColor} ${shadowGlow} rounded-full`} style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <p className="text-center mt-3 text-xs font-semibold text-slate-300 tracking-wide">
                                        {isOverdue
                                            ? <span className="text-red-400 font-bold">Vencido hace {Math.abs(s.remaining_km)} KM</span>
                                            : <span>Faltan <span className={`font-black ${isUpcoming ? 'text-amber-400' : 'text-emerald-400'}`}>{s.remaining_km} KM</span></span>
                                        }
                                    </p>
                                </div>

                                {/* Acciones */}
                                <div className="flex items-center gap-2 mt-2 pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => markPerformed(s.rule.id, vehicle.current_km)}
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all active:scale-95 shadow-sm border border-white/5 flex items-center justify-center gap-2"
                                        title="Registrar mantenimiento"
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ¡Ya lo hice! <span className="text-[10px] text-emerald-400/70 font-medium tracking-wide">({vehicle.current_km}km)</span>
                                    </button>
                                    <button
                                        onClick={() => deleteRule(s.rule.id)}
                                        className="w-12 h-12 bg-slate-800/50 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all duration-300 active:scale-90 flex items-center justify-center rounded-xl border border-white/5"
                                        title="Borrar regla"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
