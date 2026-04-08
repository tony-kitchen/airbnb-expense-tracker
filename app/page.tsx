'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Expense } from '@/lib/types';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseHistory from './components/ExpenseHistory';

type Tab = 'dashboard' | 'add' | 'history';

function IconHome({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={active ? '#FF385C' : 'none'}
      stroke={active ? '#FF385C' : '#9CA3AF'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12L12 3l9 9" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function IconPlus({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#FF385C' : '#9CA3AF'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function IconList({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#FF385C' : '#9CA3AF'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/expenses');
      const data = await res.json();
      setExpenses(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const TAB_LABELS: Record<Tab, string> = {
    dashboard: 'Resumen',
    add: 'Agregar',
    history: 'Historial',
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <div className="flex flex-col flex-1 max-w-md mx-auto w-full relative">
        {/* Header */}
        <header className="bg-[#FF385C] text-white px-5 pt-12 pb-5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold leading-tight">Gastos Airbnb</h1>
              <p className="text-xs opacity-70 mt-0.5">Cacho · Antonio · Jenny</p>
            </div>
            <button
              onClick={fetchExpenses}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Actualizar"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0115-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 01-15 6.7L3 16" />
              </svg>
            </button>
          </div>

          {/* Tab bar inside header */}
          <div className="flex gap-1 mt-4 bg-white/15 rounded-xl p-1">
            {(['dashboard', 'add', 'history'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  tab === t ? 'bg-white text-[#FF385C]' : 'text-white/80'
                }`}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-[#FF385C] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {tab === 'dashboard' && (
                <Dashboard
                  expenses={expenses}
                  onSettle={fetchExpenses}
                  onAddExpense={() => setTab('add')}
                />
              )}
              {tab === 'add' && (
                <ExpenseForm
                  onSuccess={() => {
                    fetchExpenses();
                    setTab('dashboard');
                  }}
                />
              )}
              {tab === 'history' && <ExpenseHistory expenses={expenses} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
