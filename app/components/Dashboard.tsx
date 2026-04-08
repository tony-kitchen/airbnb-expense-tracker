'use client';

import { useState } from 'react';
import {
  PERSON_LABELS,
  PERSON_COLOR,
  PERSON_BG,
  SOCIO_COLOR,
  SOCIO_BG,
  getSocio,
  type Expense,
  type Person,
} from '@/lib/types';

interface Props {
  expenses: Expense[];
  onSettle: () => void;
  onAddExpense: () => void;
}

const PEOPLE: Person[] = ['jenny', 'antonio', 'cacho'];

function calculateBalances(expenses: Expense[]) {
  const individual: Record<Person, number> = { jenny: 0, antonio: 0, cacho: 0 };

  for (const e of expenses) {
    individual[e.paid_by] += e.amount;
  }

  const total = individual.jenny + individual.antonio + individual.cacho;
  const socio1Paid = individual.jenny + individual.antonio;
  const socio2Paid = individual.cacho;
  const eachOwes = total * 0.5;

  // Positive = overpaid = the OTHER socio owes them
  // Negative = underpaid = they owe the other socio
  const socio1Net = socio1Paid - eachOwes;
  const socio2Net = socio2Paid - eachOwes;

  return { individual, total, socio1Paid, socio2Paid, eachOwes, socio1Net, socio2Net };
}

const fmtQ = (n: number) => `Q${Math.abs(n).toFixed(2)}`;

export default function Dashboard({ expenses, onSettle, onAddExpense }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [settling, setSettling] = useState(false);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl">
          🏠
        </div>
        <h3 className="text-lg font-semibold text-gray-700">Sin gastos activos</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          Empezá a registrar los gastos del proyecto para ver el balance.
        </p>
        <button
          onClick={onAddExpense}
          className="mt-2 px-6 py-3 rounded-2xl bg-[#FF385C] text-white font-bold text-sm active:scale-95 transition-transform"
        >
          Agregar primer gasto
        </button>
      </div>
    );
  }

  const { individual, total, socio1Paid, socio2Paid, eachOwes, socio1Net, socio2Net } =
    calculateBalances(expenses);

  async function handleSettle() {
    setSettling(true);
    try {
      await fetch('/api/expenses/settle', { method: 'POST' });
      setConfirming(false);
      onSettle();
    } finally {
      setSettling(false);
    }
  }

  // Who owes whom
  const owesAmount = Math.abs(socio1Net); // both socioNets are symmetric
  const socio1Owes = socio1Net < -0.005; // Socio1 underpaid → owes Cacho
  const socio2Owes = socio2Net < -0.005; // Cacho underpaid → owes Socio1
  const balanced = owesAmount < 0.005;

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Grand total */}
      <div className="rounded-2xl bg-[#FF385C] text-white p-5">
        <p className="text-sm opacity-80 font-medium">Total del proyecto</p>
        <p className="text-4xl font-bold mt-1">Q{total.toFixed(2)}</p>
        <p className="text-xs opacity-60 mt-2">
          {expenses.length} gasto{expenses.length !== 1 ? 's' : ''} activo{expenses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Socio cards */}
      <div className="flex gap-3">
        {/* Socio 1 */}
        <div
          className="flex-1 rounded-2xl p-4 border"
          style={{ backgroundColor: SOCIO_BG.socio1, borderColor: '#A7F3D0' }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SOCIO_COLOR.socio1 }} />
            <span className="text-xs font-bold text-gray-700">Socio 1</span>
          </div>
          <p className="text-xs text-gray-500 mb-1">Jenny + Antonio</p>
          <p className="text-2xl font-bold" style={{ color: SOCIO_COLOR.socio1 }}>
            Q{socio1Paid.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Le toca: Q{eachOwes.toFixed(2)}</p>
          <div
            className="mt-2 text-xs font-semibold"
            style={{ color: socio1Net >= 0 ? '#059669' : '#DC2626' }}
          >
            {socio1Net >= 0.005
              ? `+Q${socio1Net.toFixed(2)} (a cobrar)`
              : socio1Net <= -0.005
              ? `-Q${Math.abs(socio1Net).toFixed(2)} (a pagar)`
              : '✓ Al día'}
          </div>
        </div>

        {/* Socio 2 */}
        <div
          className="flex-1 rounded-2xl p-4 border"
          style={{ backgroundColor: SOCIO_BG.socio2, borderColor: '#BFDBFE' }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SOCIO_COLOR.socio2 }} />
            <span className="text-xs font-bold text-gray-700">Socio 2</span>
          </div>
          <p className="text-xs text-gray-500 mb-1">Cacho</p>
          <p className="text-2xl font-bold" style={{ color: SOCIO_COLOR.socio2 }}>
            Q{socio2Paid.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Le toca: Q{eachOwes.toFixed(2)}</p>
          <div
            className="mt-2 text-xs font-semibold"
            style={{ color: socio2Net >= 0 ? '#059669' : '#DC2626' }}
          >
            {socio2Net >= 0.005
              ? `+Q${socio2Net.toFixed(2)} (a cobrar)`
              : socio2Net <= -0.005
              ? `-Q${Math.abs(socio2Net).toFixed(2)} (a pagar)`
              : '✓ Al día'}
          </div>
        </div>
      </div>

      {/* Individual breakdown */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Detalle individual
        </p>
        <div className="flex flex-col gap-2">
          {PEOPLE.map((person) => {
            const paid = individual[person];
            const socio = getSocio(person);
            const pct = total > 0 ? (paid / total) * 100 : 0;
            return (
              <div key={person} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: PERSON_COLOR[person] }}
                >
                  {PERSON_LABELS[person][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {PERSON_LABELS[person]}
                      <span className="text-xs text-gray-400 ml-1">
                        (Socio {socio === 'socio1' ? '1' : '2'})
                      </span>
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: PERSON_COLOR[person] }}
                    >
                      Q{paid.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: PERSON_COLOR[person] }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Balance / settlement */}
      <div
        className={`rounded-2xl border p-4 ${
          balanced
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-white border-gray-100 shadow-sm'
        }`}
      >
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Balance 50/50
        </p>
        {balanced ? (
          <p className="text-sm font-semibold text-emerald-700 text-center py-2">
            ✓ Están a mano
          </p>
        ) : (
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <div className="flex-1">
              {socio2Owes ? (
                <>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-blue-600">Cacho</span>
                    {' le debe a '}
                    <span className="font-bold text-emerald-600">Jenny/Antonio</span>
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{fmtQ(owesAmount)}</p>
                </>
              ) : socio1Owes ? (
                <>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-emerald-600">Jenny/Antonio</span>
                    {' le deben a '}
                    <span className="font-bold text-blue-600">Cacho</span>
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{fmtQ(owesAmount)}</p>
                </>
              ) : null}
            </div>
            <div className="text-3xl">💸</div>
          </div>
        )}
      </div>

      {/* Settle accounts */}
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="w-full py-4 rounded-2xl border-2 border-gray-200 text-gray-500 font-semibold text-sm active:scale-95 transition-transform"
        >
          Liquidar cuentas
        </button>
      ) : (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-red-700 text-center">
            ¿Confirmar liquidación?
          </p>
          <p className="text-xs text-red-500 text-center">
            Todos los gastos activos se van a archivar y el balance vuelve a cero.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSettle}
              disabled={settling}
              className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold disabled:opacity-60"
            >
              {settling ? 'Liquidando...' : 'Sí, liquidar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
