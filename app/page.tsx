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

type Tab = 'registro' | 'historial' | 'gastos' | 'historial-gastos';

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
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700/50 px-4 pt-safe">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-white font-black text-xl tracking-tight" id="main-title">
                🛵 MotoTrack
              </h1>
              <p className="text-slate-500 text-xs" aria-hidden="true">Historial de servicios</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 font-black text-lg flex items-center gap-2 justify-end">
                ${grandTotal.toLocaleString('es-CO')}
                <button
                  onClick={handleSignOut}
                  aria-label="Cerrar sesión"
                  className="p-1 px-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  title="Cerrar sesión"
                >
                  <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </p>
              <p className="text-slate-500 text-xs">acumulado</p>
            </div>
          </div>

          {/* Tabs — 2x2 grid */}
          <div className="grid grid-cols-2 gap-2 pb-3" role="tablist" aria-label="Navegación principal">
            <button
              onClick={() => setActiveTab('registro')}
              role="tab"
              aria-selected={activeTab === 'registro'}
              aria-controls="panel-registro"
              id="tab-registro"
              className={`py-2.5 rounded-xl text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${activeTab === 'registro'
                ? 'bg-amber-400 text-slate-900'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
            >
              ➕ Registrar
            </button>

            <button
              onClick={() => setActiveTab('historial')}
              role="tab"
              aria-selected={activeTab === 'historial'}
              aria-controls="panel-historial"
              id="tab-historial"
              className={`py-2.5 rounded-xl text-sm font-bold transition-all duration-200 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${activeTab === 'historial'
                ? 'bg-amber-400 text-slate-900'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
            >
              📋 Servicios
              {todayRecords.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-400 text-slate-900 text-xs font-black rounded-full w-5 h-5 flex items-center justify-center" aria-label={`${todayRecords.length} servicios hoy`}>
                  {todayRecords.length > 9 ? '9+' : todayRecords.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('gastos')}
              role="tab"
              aria-selected={activeTab === 'gastos'}
              aria-controls="panel-gastos"
              id="tab-gastos"
              className={`py-2.5 rounded-xl text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${activeTab === 'gastos'
                ? 'bg-red-400 text-slate-900'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
            >
              ⛽ Gastos
            </button>

            <button
              onClick={() => setActiveTab('historial-gastos')}
              role="tab"
              aria-selected={activeTab === 'historial-gastos'}
              aria-controls="panel-historial-gastos"
              id="tab-historial-gastos"
              className={`py-2.5 rounded-xl text-sm font-bold transition-all duration-200 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${activeTab === 'historial-gastos'
                ? 'bg-red-400 text-slate-900'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
            >
              🗒️ Historial Gastos
              {todayExpenses.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-400 text-slate-900 text-xs font-black rounded-full w-5 h-5 flex items-center justify-center" aria-label={`${todayExpenses.length} gastos hoy`}>
                  {todayExpenses.length > 9 ? '9+' : todayExpenses.length}
                </span>
              )}
            </button>
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
          {activeTab === 'registro' && (
            <div role="tabpanel" aria-labelledby="tab-registro" id="panel-registro" className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
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
              />
            </div>
          )}

          {activeTab === 'gastos' && (
            <div role="tabpanel" aria-labelledby="tab-gastos" id="panel-gastos" className="bg-slate-800/40 rounded-2xl p-4 border border-red-900/30">
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
              />
            </div>
          )}

          {/* Footer signature */}
          <div className="text-center pt-2 pb-6 text-xs text-slate-500/80 font-medium tracking-wide">
            MotoTrack by <a href="https://www.linkedin.com/in/jeangarzon/" target="_blank" rel="noopener noreferrer" className="text-amber-400 font-bold hover:underline">JGDev</a>
          </div>
        </div>
      </main>
    </div>
  );
}
