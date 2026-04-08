'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (res.ok) {
        router.replace('/');
      } else {
        setError('Código incorrecto. Intentá de nuevo.');
        setCode('');
        inputRef.current?.focus();
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">

        {/* Logo / App name */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-3xl bg-[#FF385C] flex items-center justify-center shadow-lg">
            <span className="text-4xl">🏠</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Gastos Airbnb</h1>
            <p className="text-sm text-gray-400 mt-1">Ingresá el código de acceso</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError('');
            }}
            placeholder="Código de acceso"
            autoComplete="off"
            autoFocus
            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 text-gray-800 text-center text-lg font-semibold tracking-widest focus:outline-none focus:border-[#FF385C] bg-white transition-colors"
          />

          {error && (
            <p className="text-sm text-red-500 text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-4 rounded-2xl bg-[#FF385C] text-white font-bold text-base disabled:opacity-50 active:scale-95 transition-transform shadow-md"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-xs text-gray-300">Tony Kitchen · Acceso privado</p>
      </div>
    </div>
  );
}
