'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useServices } from './hooks/useServices';
import { useExpenses } from './hooks/useExpenses';
import { ServiceType, ExpenseType } from './types';
import RegisterForm from './components/RegisterForm';
import HistoryView from './components/HistoryView';
import StatsBar from './components/StatsBar';
import ExpenseForm from './components/ExpenseForm';
import ExpenseHistory from './components/ExpenseHistory';
import VehicleManager from './components/VehicleManager';
import { PlusCircle, ClipboardList, Fuel, FileText, Wrench, LogOut } from 'lucide-react';

type Tab = 'registro' | 'historial' | 'gastos' | 'historial-gastos' | 'vehiculos';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('registro');
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const {
    loaded: servicesLoaded,
    todayRecords,
    todayTotal,
    grandTotal,
    byDate,
    sortedDates,
    getDayTotal,
    addService,
    deleteService,
    loadMore: loadMoreServices,
    hasMore: hasMoreServices,
    loadingMore: loadingMoreServices,
  } = useServices();

  const {
    loaded: expensesLoaded,
    todayExpenses,
    todayExpenseTotal,
    grandExpenseTotal,
    byDate: expensesByDate,
    sortedDates: expenseSortedDates,
    getDayExpenseTotal,
    addExpense,
    deleteExpense,
    loadMore: loadMoreExpenses,
    hasMore: hasMoreExpenses,
    loadingMore: loadingMoreExpenses,
  } = useExpenses();

  const loaded = servicesLoaded && expensesLoaded;

  const handleSaveService = (type: ServiceType, price: number) => {
    addService(type, price);
  };

  const handleSaveExpense = (type: ExpenseType, amount: number, note?: string) => {
    addExpense(type, amount, note);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-lg animate-pulse">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header (Top) */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 pt-safe mb-2">
        <div className="max-w-md mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center overflow-hidden border border-white/10 bg-slate-900/50">
                <img src="/logo_mototrack.png" alt="MotoTrack Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-white font-bold text-lg tracking-tight leading-none mb-1" id="main-title">
                  MotoTrack
                </h1>
                <p className="text-slate-400 text-[10px] font-medium tracking-wider uppercase" aria-hidden="true">
                  Copiloto Financiero
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs font-medium">Neto Global</span>
                <button
                  onClick={handleSignOut}
                  aria-label="Cerrar sesión"
                  className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4 ml-0.5" />
                </button>
              </div>
              <p className="text-emerald-400 font-black text-xl tracking-tight leading-none mt-1">
                ${grandTotal.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-5 flex flex-col gap-5 pb-safe">
          {/* Stats — always visible */}
          <StatsBar
            todayTotal={todayTotal}
            todayCount={todayRecords.length}
            todayExpenses={todayExpenseTotal}
            grandTotal={grandTotal}
            grandExpenses={grandExpenseTotal}
          />

          {/* Tab Content */}
          <div className="pb-28"> {/* Buffer for bottom nav */}
            {activeTab === 'registro' && (
              <div role="tabpanel" aria-labelledby="tab-registro" id="panel-registro" className="bg-slate-900/40 rounded-[32px] p-5 shadow-2xl shadow-black/20 border border-white/5 backdrop-blur-sm">
                <RegisterForm onSave={handleSaveService} />
              </div>
            )}

          {activeTab === 'historial' && (
            <div role="tabpanel" aria-labelledby="tab-historial" id="panel-historial">
              <HistoryView
                byDate={byDate}
                sortedDates={sortedDates}
                getDayTotal={getDayTotal}
                onDelete={deleteService}
                loadMore={loadMoreServices}
                hasMore={hasMoreServices}
                loadingMore={loadingMoreServices}
              />
            </div>
          )}

          {activeTab === 'gastos' && (
            <div role="tabpanel" aria-labelledby="tab-gastos" id="panel-gastos" className="bg-slate-900/40 rounded-[32px] p-5 shadow-2xl shadow-black/20 border border-white/5 backdrop-blur-sm">
              <ExpenseForm onSave={handleSaveExpense} />
            </div>
          )}

          {activeTab === 'historial-gastos' && (
            <div role="tabpanel" aria-labelledby="tab-historial-gastos" id="panel-historial-gastos">
              <ExpenseHistory
                byDate={expensesByDate}
                sortedDates={expenseSortedDates}
                getDayExpenseTotal={getDayExpenseTotal}
                onDelete={deleteExpense}
                loadMore={loadMoreExpenses}
                hasMore={hasMoreExpenses}
                loadingMore={loadingMoreExpenses}
              />
            </div>
          )}

          {activeTab === 'vehiculos' && (
            <div role="tabpanel" aria-labelledby="tab-vehiculos" id="panel-vehiculos">
               <VehicleManager />
            </div>
          )}

          </div> {/* End of buffer */}

          {/* Footer signature */}
          <div className="text-center pt-2 pb-8 text-xs text-slate-600 font-medium tracking-wide">
            MotoTrack by <a href="https://www.linkedin.com/in/jeangarzon/" target="_blank" rel="noopener noreferrer" className="text-slate-500 font-bold hover:text-white transition-colors">JGDev</a>
          </div>
        </div>
      </main>

      {/* Fixed iOS-like Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 pb-safe pt-2 px-2 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto grid gap-1" style={{ gridTemplateColumns: "repeat(5, 1fr)" }} role="tablist" aria-label="Navegación principal">
          <button
            onClick={() => setActiveTab('registro')}
            role="tab"
            aria-selected={activeTab === 'registro'}
            aria-controls="panel-registro"
            id="tab-registro"
            className="flex flex-col items-center justify-center gap-1.5 py-2 rounded-2xl transition-all duration-300 active:scale-90 relative touch-manipulation focus:outline-none group"
          >
            <div className={`w-12 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeTab === 'registro' ? 'bg-amber-400/20 text-amber-400' : 'text-slate-500 group-hover:bg-white/5 group-hover:text-slate-300'}`}>
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold tracking-wide transition-colors ${activeTab === 'registro' ? 'text-amber-400' : 'text-slate-500'}`}>Inicio</span>
          </button>

          <button
            onClick={() => setActiveTab('historial')}
            role="tab"
            aria-selected={activeTab === 'historial'}
            aria-controls="panel-historial"
            id="tab-historial"
            className="flex flex-col items-center justify-center gap-1.5 py-2 rounded-2xl transition-all duration-300 active:scale-90 relative touch-manipulation focus:outline-none group"
          >
            <div className={`w-12 h-8 rounded-full flex items-center justify-center transition-all duration-300 relative ${activeTab === 'historial' ? 'bg-amber-400/20 text-amber-400' : 'text-slate-500 group-hover:bg-white/5 group-hover:text-slate-300'}`}>
              <ClipboardList className="w-5 h-5" />
              {todayRecords.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-slate-950 shadow-sm">
                  {todayRecords.length > 9 ? '9+' : todayRecords.length}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-bold tracking-wide transition-colors ${activeTab === 'historial' ? 'text-amber-400' : 'text-slate-500'}`}>Servicios</span>
          </button>

          <button
            onClick={() => setActiveTab('gastos')}
            role="tab"
            aria-selected={activeTab === 'gastos'}
            aria-controls="panel-gastos"
            id="tab-gastos"
            className="flex flex-col items-center justify-center gap-1.5 py-2 rounded-2xl transition-all duration-300 active:scale-90 relative touch-manipulation focus:outline-none group"
          >
            <div className={`w-12 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeTab === 'gastos' ? 'bg-red-400/20 text-red-500' : 'text-slate-500 group-hover:bg-white/5 group-hover:text-slate-300'}`}>
              <Fuel className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold tracking-wide transition-colors ${activeTab === 'gastos' ? 'text-red-500' : 'text-slate-500'}`}>Gasto</span>
          </button>

          <button
            onClick={() => setActiveTab('historial-gastos')}
            role="tab"
            aria-selected={activeTab === 'historial-gastos'}
            aria-controls="panel-historial-gastos"
            id="tab-historial-gastos"
            className="flex flex-col items-center justify-center gap-1.5 py-2 rounded-2xl transition-all duration-300 active:scale-90 relative touch-manipulation focus:outline-none group"
          >
            <div className={`w-12 h-8 rounded-full flex items-center justify-center transition-all duration-300 relative ${activeTab === 'historial-gastos' ? 'bg-red-400/20 text-red-500' : 'text-slate-500 group-hover:bg-white/5 group-hover:text-slate-300'}`}>
              <FileText className="w-5 h-5" />
              {todayExpenses.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-slate-950 shadow-sm">
                  {todayExpenses.length > 9 ? '9+' : todayExpenses.length}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-bold tracking-wide transition-colors ${activeTab === 'historial-gastos' ? 'text-red-500' : 'text-slate-500'}`}>H. Gastos</span>
          </button>

          <button
            onClick={() => setActiveTab('vehiculos')}
            role="tab"
            aria-selected={activeTab === 'vehiculos'}
            aria-controls="panel-vehiculos"
            id="tab-vehiculos"
            className="flex flex-col items-center justify-center gap-1.5 py-2 rounded-2xl transition-all duration-300 active:scale-90 relative touch-manipulation focus:outline-none group"
          >
            <div className={`w-12 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeTab === 'vehiculos' ? 'bg-blue-400/20 text-blue-400' : 'text-slate-500 group-hover:bg-white/5 group-hover:text-slate-300'}`}>
              <Wrench className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold tracking-wide transition-colors ${activeTab === 'vehiculos' ? 'text-blue-400' : 'text-slate-500'}`}>Taller</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
