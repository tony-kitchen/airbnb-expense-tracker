'use client';

import { useState, useEffect } from 'react';
import {
  PERSON_LABELS,
  PERSON_COLOR,
  PERSON_BG,
  CATEGORY_ICONS,
  type Expense,
  type Person,
  type Category,
} from '@/lib/types';

interface Props {
  expenses: Expense[];
}

const PEOPLE: Person[] = ['jenny', 'antonio', 'cacho'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatDate(iso: string) {
  const [year, month, day] = iso.split('-');
  return `${parseInt(day)} ${MONTHS[parseInt(month) - 1]} ${year}`;
}

function ExpenseCard({ expense }: { expense: Expense }) {
  const [showReceipt, setShowReceipt] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        {/* Left: category icon + info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shrink-0">
            {CATEGORY_ICONS[expense.category as Category] ?? '📦'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">{expense.description}</p>
            <p className="text-xs text-gray-400 mt-0.5">{expense.category}</p>
            <p className="text-xs text-gray-400">{formatDate(expense.date)}</p>
          </div>
        </div>

        {/* Right: amount + who */}
        <div className="text-right shrink-0">
          <p className="font-bold text-gray-900 text-lg">Q{expense.amount.toFixed(2)}</p>
          <span
            className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: PERSON_BG[expense.paid_by as Person],
              color: PERSON_COLOR[expense.paid_by as Person],
            }}
          >
            {PERSON_LABELS[expense.paid_by as Person]}
          </span>
        </div>
      </div>

      {/* Each socio's split */}
      <div className="mt-3 flex gap-2">
        <div className="flex-1 rounded-xl bg-emerald-50 px-2 py-1.5 text-center">
          <p className="text-xs text-gray-400">Socio 1</p>
          <p className="text-xs font-bold text-emerald-700">Q{(expense.amount * 0.5).toFixed(2)}</p>
        </div>
        <div className="flex-1 rounded-xl bg-blue-50 px-2 py-1.5 text-center">
          <p className="text-xs text-gray-400">Socio 2</p>
          <p className="text-xs font-bold text-blue-700">Q{(expense.amount * 0.5).toFixed(2)}</p>
        </div>
        {expense.receipt_url && (
          <button
            onClick={() => setShowReceipt((v) => !v)}
            className="flex-1 rounded-xl bg-gray-50 px-2 py-1.5 text-center active:scale-95 transition-transform"
          >
            <p className="text-xs text-gray-400">Recibo</p>
            <p className="text-base">📄</p>
          </button>
        )}
      </div>

      {/* Receipt image */}
      {showReceipt && expense.receipt_url && (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={expense.receipt_url}
            alt="Recibo"
            className="w-full rounded-xl border border-gray-100"
          />
        </div>
      )}
    </div>
  );
}

export default function ExpenseHistory({ expenses }: Props) {
  const [filterPerson, setFilterPerson] = useState<Person | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [archived, setArchived] = useState<Expense[]>([]);
  const [loadingArchived, setLoadingArchived] = useState(false);

  useEffect(() => {
    if (!showArchived) return;
    setLoadingArchived(true);
    fetch('/api/expenses?archived=true')
      .then((r) => r.json())
      .then(setArchived)
      .finally(() => setLoadingArchived(false));
  }, [showArchived]);

  function applyFilters(list: Expense[]) {
    return list.filter((e) => {
      if (filterPerson !== 'all' && e.paid_by !== filterPerson) return false;
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return true;
    });
  }

  const filtered = applyFilters(expenses);
  const filteredArchived = applyFilters(archived);
  const hasActiveFilters = filterPerson !== 'all' || dateFrom || dateTo;

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Filter toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">
          {filtered.length} gasto{filtered.length !== 1 ? 's' : ''}
          {filtered.length > 0 && (
            <span className="text-gray-400 ml-1">
              · Q{filtered.reduce((s, e) => s + e.amount, 0).toFixed(2)}
            </span>
          )}
        </p>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            hasActiveFilters
              ? 'bg-[#FF385C] text-white border-[#FF385C]'
              : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 6h18M6 12h12M9 18h6" />
          </svg>
          Filtros{hasActiveFilters ? ' ●' : ''}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
          {/* Person filter */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Persona</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterPerson('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  filterPerson === 'all'
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                Todos
              </button>
              {PEOPLE.map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPerson(p)}
                  style={
                    filterPerson === p
                      ? { backgroundColor: PERSON_COLOR[p], borderColor: PERSON_COLOR[p], color: '#fff' }
                      : { backgroundColor: PERSON_BG[p], borderColor: PERSON_COLOR[p], color: PERSON_COLOR[p] }
                  }
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors"
                >
                  {PERSON_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Rango de fechas</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Desde</p>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Hasta</p>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                />
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setFilterPerson('all');
                setDateFrom('');
                setDateTo('');
              }}
              className="text-xs text-red-500 font-medium text-center"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Active expenses list */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm">No hay gastos con esos filtros</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((e) => (
            <ExpenseCard key={e.id} expense={e} />
          ))}
        </div>
      )}

      {/* Archived toggle */}
      <button
        onClick={() => setShowArchived((v) => !v)}
        className="w-full py-3 rounded-2xl border border-dashed border-gray-300 text-gray-400 text-sm font-medium active:scale-95 transition-transform"
      >
        {showArchived ? '▲ Ocultar archivados' : '▼ Ver historial archivado'}
      </button>

      {showArchived && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Archivados</p>
          {loadingArchived ? (
            <p className="text-sm text-center text-gray-400 py-4">Cargando...</p>
          ) : filteredArchived.length === 0 ? (
            <p className="text-sm text-center text-gray-400 py-4">Sin gastos archivados</p>
          ) : (
            filteredArchived.map((e) => (
              <div key={e.id} className="opacity-50">
                <ExpenseCard expense={e} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
