'use client';

import { useState } from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { useMaintenance } from '../hooks/useMaintenance';
import { Vehicle, MaintenanceStatus } from '../types';

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
                <span className="text-6xl mb-4">🏍️</span>
                <p className="text-lg font-semibold text-center mb-6">No has registrado vehículos</p>
                <button
                    onClick={() => setIsAdding(true)}
                    className="py-3 px-6 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl transition-all shadow-lg active:scale-95"
                >
                    + Registrar mi primer vehículo
                </button>
            </div>
        );
    }

    if (isAdding) {
        return (
            <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl w-full max-w-md mx-auto relative animate-in fade-in zoom-in-95 duration-200">
                <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
                <h3 className="text-xl font-black text-white mb-4">Nuevo Vehículo</h3>
                <form onSubmit={handleAddVehicle} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Apodo (Ej: La consentida)</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                            placeholder="Nombre del vehículo"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Marca</label>
                        <input
                            type="text"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                            placeholder="Yamaha, Honda, etc."
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Modelo</label>
                        <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                            placeholder="FZ 2.0, CB190R"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Odómetro Actual (KM)</label>
                        <input
                            type="number"
                            inputMode="numeric"
                            value={km}
                            onChange={(e) => setKm(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-xl font-bold transition-all"
                            placeholder="Ej: 15400"
                            required
                            min="0"
                        />
                    </div>
                    <button type="submit" className="w-full py-4 bg-amber-400 text-slate-900 font-black rounded-xl hover:bg-amber-300 transition-all active:scale-95 shadow-lg mt-2 flex items-center justify-center gap-2">
                        💾 Guardar Vehículo
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
                 <select
                    className="bg-slate-800 text-white font-bold text-lg border-2 border-slate-700 rounded-xl px-4 py-2 appearance-none shadow-md hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={currentVehicle.id}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                 >
                    {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.brand})</option>
                    ))}
                 </select>

                 <button
                    onClick={() => setIsAdding(true)}
                    className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-xl text-amber-400 hover:bg-slate-700 hover:text-amber-300 font-bold text-xl transition-all shadow-md active:scale-90"
                    title="Añadir otro vehículo"
                 >
                    +
                 </button>
            </div>

            {/* Vehiculo Activo (Card Context) */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-xl relative overflow-hidden backdrop-blur">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="relative z-10 flex flex-col gap-2">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{currentVehicle.brand} • {currentVehicle.model}</p>
                    <div className="flex items-baseline justify-between mb-2">
                         <h2 className="text-3xl font-black text-white">{currentVehicle.name}</h2>
                         <button onClick={() => deleteVehicle(currentVehicle.id)} className="text-slate-500 hover:text-red-400 transition" title="Mandar al deshuesadero">🗑️</button>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-slate-900/60 rounded-xl border border-slate-700 flex flex-col items-center">
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Odómetro Actual</p>
                    <div className="flex items-center gap-3 w-full">
                        <input
                            type="number"
                            className="bg-transparent text-amber-400 text-3xl font-black text-center w-full focus:outline-none focus:border-amber-400 border-b-2 border-transparent border-dashed py-1 transition-colors"
                            defaultValue={currentVehicle.current_km}
                            onBlur={(e) => {
                                const newKm = parseInt(e.target.value, 10);
                                if (!isNaN(newKm) && newKm !== currentVehicle.current_km) {
                                    updateVehicleKm(currentVehicle.id, newKm);
                                }
                            }}
                        />
                    </div>
                    <p className="text-slate-500 text-[10px] mt-2">Toca el número para actualizar el KM actual o hazlo al añadir registro.</p>
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
        switch(status) {
            case 'overdue': return <span className="bg-red-500/20 text-red-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-red-500/30 shadow-sm animate-pulse shadow-red-500/20">Vencido</span>;
            case 'upcoming': return <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-amber-500/30 shadow-sm">Próximo a Vencer</span>;
            case 'safe': return <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-emerald-500/30">Al Día</span>;
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-black text-xl text-white">Tablero de Mantenimiento</h3>
                {!isAdding && (
                     <button
                        onClick={() => {
                            setLastKm(vehicle.current_km.toString());
                            setIsAdding(true);
                        }}
                        className="text-amber-400 text-sm font-bold bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20 hover:bg-amber-400 hover:text-slate-900 transition-colors active:scale-95"
                    >
                        + Agregar
                     </button>
                )}
            </div>
            
            {/* Form */}
            {isAdding && (
                <div className="bg-slate-800 border border-amber-500/30 rounded-xl p-4 shadow-lg shadow-amber-500/5 animate-in slide-in-from-top-2 relative">
                    <button onClick={() => setIsAdding(false)} className="absolute top-3 right-3 text-slate-400 hover:text-white">✕</button>
                    <h4 className="font-bold text-white mb-3">Nueva Regla</h4>
                    <form onSubmit={handleAddRule} className="flex flex-col gap-3">
                         <input type="text" placeholder="Ej: Cambio de Aceite / Filtro" required value={name} onChange={e=>setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition" />
                         <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Se cambia cada (KM)</label>
                                <input type="number" placeholder="Ej: 3000" min="1" required value={intervalKm} onChange={e=>setIntervalKm(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition" />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Último cambio (KM)</label>
                                <input type="number" placeholder="Ej: 12000" required value={lastKm} onChange={e=>setLastKm(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition" />
                            </div>
                         </div>
                         <div className="mt-1">
                             <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1 flex items-center justify-between">
                                 Rango de Aviso / Tolerancia
                                 <span className="text-slate-500 font-normal normal-case">(Opcional)</span>
                             </label>
                             <input type="number" placeholder="Ej: 500 (Te avisa 500 km antes)" min="1" value={warningRange} onChange={e=>setWarningRange(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition" />
                         </div>
                         <button type="submit" className="w-full bg-amber-400 py-3 rounded-lg text-slate-900 font-bold mt-2 hover:bg-amber-300 transition active:scale-95">Guardar Criterio</button>
                    </form>
                </div>
            )}

            {statuses.length === 0 && !isAdding && (
                <div className="border border-slate-700 border-dashed rounded-xl p-6 text-center text-slate-500 space-y-2">
                    <p className="text-3xl">🧰</p>
                    <p className="text-sm">Registra a cuántos kilómetros se le cambia el aceite y Mototrack te avisará antes de que fundas el motor.</p>
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
                        <div key={s.rule.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden hover:border-slate-500/50 transition duration-300">
                             <div className="p-4 flex flex-col gap-3 relative">
                                 <div className="flex justify-between items-start">
                                    <div>
                                         <h4 className="font-bold text-white text-lg">{s.rule.name}</h4>
                                         <p className="text-xs text-slate-400 uppercase tracking-widest mt-0.5">Cada {s.rule.interval_km} KM</p>
                                    </div>
                                    <StatusBadge status={s.status} />
                                 </div>
                                 
                                 {/* Progress Bar visual indicator */}
                                 <div className="mt-1">
                                    <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                                        <span>Último: {s.rule.last_service_km} KM</span>
                                        <span>Toca en: {s.rule.next_service_km} KM</span>
                                    </div>
                                    <div className="w-full bg-slate-900 rounded-full h-2.5 border border-slate-700 overflow-hidden">
                                        <div className={`h-full ${barColor} ${shadowGlow}`} style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <p className="text-center mt-1.5 text-xs font-medium text-slate-300">
                                         {isOverdue 
                                            ? <span className="text-red-400 font-bold">Vencido hace {Math.abs(s.remaining_km)} KM</span> 
                                            : <span>Faltan <span className={`font-bold ${isUpcoming ? 'text-amber-400' : 'text-emerald-400'}`}>{s.remaining_km} KM</span></span>
                                         }
                                    </p>
                                 </div>

                                 {/* Acciones */}
                                 <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50">
                                     <button 
                                        onClick={() => markPerformed(s.rule.id, vehicle.current_km)} // Quick mark
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs py-2.5 rounded-lg transition active:scale-95 shadow-sm"
                                        title="Registrar mantenimiento usando kilometraje del odómetro actual"
                                     >
                                         ✅ Marcar Hecho (a los {vehicle.current_km}km)
                                     </button>
                                     <button 
                                        onClick={() => deleteRule(s.rule.id)}
                                        className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-lg flex items-center justify-center transition active:scale-90"
                                     >
                                        🗑️
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
