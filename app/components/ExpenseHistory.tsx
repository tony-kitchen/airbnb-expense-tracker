'use client';

import { useState, useEffect } from 'react';
import {
  PERSON_LABELS,
  PERSON_COLOR,
  PERSON_BG,
  CATEGORIES,
  CATEGORY_ICONS,
  SOCIO_LABELS,
  getSocio,
  type Expense,
  type Person,
  type Category,
} from '@/lib/types';

interface Props {
  expenses: Expense[];
  onUpdate: () => void;
}

const PEOPLE: Person[] = ['jenny', 'antonio', 'cacho'];

interface EditState {
  description: string;
  amount: string;
  paid_by: Person;
  category: Category;
  date: string;
}

function EditModal({
  expense,
  onClose,
  onSaved,
}: {
  expense: Expense;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<EditState>({
    description: expense.description,
    amount: String(expense.amount),
    paid_by: expense.paid_by as Person,
    category: expense.category as Category,
    date: expense.date,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!form.amount || Number(form.amount) <= 0) { setError('Monto inválido'); return; }
    if (!form.description.trim()) { setError('Ingresá una descripción'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/expenses/${expense.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: form.description.trim(),
          amount: Number(form.amount),
          paid_by: form.paid_by,
          category: form.category,
          date: form.date,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onSaved();
      onClose();
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'desconocido'}`);
    } finally {
      setSaving(false);
    }
  }

  const socio = getSocio(form.paid_by);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800">Editar gasto</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">✕</button>
        </div>

        {/* Who paid */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">¿Quién pagó?</p>
          <div className="flex gap-2">
            {PEOPLE.map((p) => {
              const sel = form.paid_by === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, paid_by: p }))}
                  style={{
                    borderColor: PERSON_COLOR[p],
                    backgroundColor: sel ? PERSON_COLOR[p] : PERSON_BG[p],
                    color: sel ? '#fff' : PERSON_COLOR[p],
                  }}
                  className="flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all"
                >
                  {PERSON_LABELS[p]}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-1.5 ml-1">
            Socio: <span className="font-medium text-gray-600">{SOCIO_LABELS[socio]}</span>
          </p>
        </div>

        {/* Amount */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Monto (GTQ)</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">Q</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#FF385C] bg-white"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Categoría</p>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const sel = form.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: cat }))}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 text-xs font-medium transition-all ${
                    sel ? 'border-[#FF385C] bg-red-50 text-[#FF385C]' : 'border-gray-100 bg-white text-gray-500'
                  }`}
                >
                  <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                  <span className="text-center leading-tight">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Descripción</p>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF385C] bg-white"
          />
        </div>

        {/* Date */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Fecha</p>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF385C] bg-white"
          />
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <div className="flex gap-2 pb-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-[#FF385C] text-white text-sm font-bold disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatDate(iso: string) {
  const [year, month, day] = iso.split('-');
  return `${parseInt(day)} ${MONTHS[parseInt(month) - 1]} ${year}`;
}

// Proxy URL — routes the private blob through our API so auth is enforced
function proxyUrl(blobUrl: string) {
  return `/api/expenses/receipt?url=${encodeURIComponent(blobUrl)}`;
}

function ReceiptLightbox({ blobUrl, onClose }: { blobUrl: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-lg font-bold"
      >
        ✕
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={proxyUrl(blobUrl)}
        alt="Recibo"
        className="max-w-full max-h-[85vh] rounded-xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function ReceiptButton({ blobUrl }: { blobUrl: string }) {
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      {lightbox && (
        <ReceiptLightbox blobUrl={blobUrl} onClose={() => setLightbox(false)} />
      )}
      <button
        onClick={() => setLightbox(true)}
        className="w-full flex items-center gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50 active:bg-gray-100 transition-colors"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={proxyUrl(blobUrl)}
          alt="Recibo"
          className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
        />
        <span className="flex-1 text-sm font-medium text-gray-600 text-left">
          Ver foto del recibo
        </span>
        <span className="text-gray-400 text-lg">›</span>
      </button>
    </>
  );
}

function ExpenseCard({ expense, onEdit }: { expense: Expense; onEdit: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Main info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
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
          <div className="text-right shrink-0 flex flex-col items-end gap-1">
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
            <button
              onClick={onEdit}
              className="text-xs text-[#FF385C] font-semibold mt-0.5"
            >
              Editar
            </button>
          </div>
        </div>

        {/* Split */}
        <div className="mt-3 flex gap-2">
          <div className="flex-1 rounded-xl bg-emerald-50 px-2 py-1.5 text-center">
            <p className="text-xs text-gray-400">Socio 1</p>
            <p className="text-xs font-bold text-emerald-700">Q{(expense.amount * 0.5).toFixed(2)}</p>
          </div>
          <div className="flex-1 rounded-xl bg-blue-50 px-2 py-1.5 text-center">
            <p className="text-xs text-gray-400">Socio 2</p>
            <p className="text-xs font-bold text-blue-700">Q{(expense.amount * 0.5).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Receipt button */}
      {expense.receipt_url && (
        <ReceiptButton blobUrl={expense.receipt_url} />
      )}
    </div>
  );
}

export default function ExpenseHistory({ expenses, onUpdate }: Props) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
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
      {editingExpense && (
        <EditModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSaved={() => { setEditingExpense(null); onUpdate(); }}
        />
      )}
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
            <ExpenseCard key={e.id} expense={e} onEdit={() => setEditingExpense(e)} />
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
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Archivados</p>
            {!loadingArchived && archived.length > 0 && (
              <button
                onClick={async () => {
                  if (!window.confirm('¿Seguro que quieres borrar todo el historial archivado?')) return;
                  await fetch('/api/expenses', { method: 'DELETE' });
                  setArchived([]);
                  setShowArchived(false);
                }}
                className="text-xs text-red-400 font-medium"
              >
                Borrar historial
              </button>
            )}
          </div>
          {loadingArchived ? (
            <p className="text-sm text-center text-gray-400 py-4">Cargando...</p>
          ) : filteredArchived.length === 0 ? (
            <p className="text-sm text-center text-gray-400 py-4">Sin gastos archivados</p>
          ) : (
            filteredArchived.map((e) => (
              <div key={e.id} className="opacity-50">
                <ExpenseCard expense={e} onEdit={() => setEditingExpense(e)} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
