'use client';

import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import {
  PERSON_LABELS,
  PERSON_COLOR,
  PERSON_BG,
  CATEGORIES,
  CATEGORY_ICONS,
  getSocio,
  SOCIO_LABELS,
  type Person,
  type Category,
} from '@/lib/types';

interface Props {
  onSuccess: () => void;
}

const PEOPLE: Person[] = ['jenny', 'antonio', 'cacho'];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ExpenseForm({ onSuccess }: Props) {
  const [paidBy, setPaidBy] = useState<Person>('jenny');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('otro');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayISO);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      let finalFile: File = file;
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: false, // more compatible on mobile
        });
        // imageCompression returns a Blob — convert back to File to preserve .name
        finalFile = new File([compressed], file.name || `receipt-${Date.now()}.jpg`, {
          type: compressed.type || file.type,
        });
      } catch {
        // If compression fails, use original file
        finalFile = file;
      }
      setReceiptFile(finalFile);
      setReceiptPreview(URL.createObjectURL(finalFile));
    } finally {
      setCompressing(false);
    }
  }

  function removeReceipt() {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (cameraRef.current) cameraRef.current.value = '';
    if (galleryRef.current) galleryRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Ingresá un monto válido');
      return;
    }
    if (!description.trim()) {
      setError('Ingresá una descripción');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload receipt first if present
      let receipt_url: string | null = null;
      if (receiptFile) {
        const fd = new FormData();
        fd.append('file', receiptFile);
        const uploadRes = await fetch('/api/expenses/upload', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.url) {
          receipt_url = uploadData.url;
        } else {
          // Show the actual error from the server instead of silently ignoring
          throw new Error(uploadData.error || `Error al subir foto (${uploadRes.status})`);
        }
      }

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          amount: Number(amount),
          paid_by: paidBy,
          category,
          receipt_url,
          date,
        }),
      });

      if (!res.ok) throw new Error('Error al guardar');

      // Reset form
      setAmount('');
      setDescription('');
      setCategory('otro');
      setDate(todayISO());
      setReceiptFile(null);
      setReceiptPreview(null);
      if (cameraRef.current) cameraRef.current.value = '';
      if (galleryRef.current) galleryRef.current.value = '';

      onSuccess();
    } catch {
      setError('No se pudo guardar el gasto. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const amountNum = Number(amount);
  const socio = getSocio(paidBy);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Nuevo gasto</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Who paid */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            ¿Quién pagó?
          </label>
          <div className="flex gap-2">
            {PEOPLE.map((person) => {
              const selected = paidBy === person;
              return (
                <button
                  key={person}
                  type="button"
                  onClick={() => setPaidBy(person)}
                  style={{
                    borderColor: PERSON_COLOR[person],
                    backgroundColor: selected ? PERSON_COLOR[person] : PERSON_BG[person],
                    color: selected ? '#fff' : PERSON_COLOR[person],
                  }}
                  className="flex-1 py-2.5 px-2 rounded-xl border-2 text-sm font-semibold transition-all active:scale-95"
                >
                  {PERSON_LABELS[person]}
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
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Monto (GTQ)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-base">
              Q
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3.5 rounded-xl border border-gray-200 text-gray-800 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#FF385C] bg-white"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Categoría
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const selected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 text-xs font-medium transition-all active:scale-95 ${
                    selected
                      ? 'border-[#FF385C] bg-red-50 text-[#FF385C]'
                      : 'border-gray-100 bg-white text-gray-500'
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
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Descripción
          </label>
          <input
            type="text"
            placeholder="Descripción breve..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF385C] bg-white"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF385C] bg-white"
          />
        </div>

        {/* Receipt photo */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Foto del recibo <span className="text-gray-400 font-normal">(opcional)</span>
          </label>

          {compressing ? (
            <div className="w-full py-5 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-sm text-gray-400">
              <span className="animate-spin">⏳</span> Comprimiendo imagen...
            </div>
          ) : receiptPreview ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={receiptPreview}
                alt="Recibo"
                className="w-full max-h-64 object-contain rounded-xl border border-gray-200 bg-gray-50"
              />
              <button
                type="button"
                onClick={removeReceipt}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="flex-1 py-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
              >
                <span className="text-2xl">📷</span>
                <span className="font-medium">Cámara</span>
              </button>
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="flex-1 py-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
              >
                <span className="text-2xl">🖼️</span>
                <span className="font-medium">Carrete</span>
              </button>
            </div>
          )}

          {/* Camera input */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          {/* Gallery / files input */}
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Split preview */}
        {amountNum > 0 && (
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
            <p className="text-xs font-medium text-gray-500 mb-2">División del gasto (50/50)</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-emerald-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Socio 1</p>
                <p className="text-xs text-gray-400">Jenny + Antonio</p>
                <p className="font-bold text-emerald-700 mt-0.5">Q{(amountNum * 0.5).toFixed(2)}</p>
              </div>
              <div className="flex-1 bg-blue-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Socio 2</p>
                <p className="text-xs text-gray-400">Cacho</p>
                <p className="font-bold text-blue-700 mt-0.5">Q{(amountNum * 0.5).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-[#FF385C] text-white font-bold text-base disabled:opacity-60 active:scale-95 transition-transform"
        >
          {loading ? 'Guardando...' : 'Guardar gasto'}
        </button>
      </form>
    </div>
  );
}
