'use client';

import { useState } from 'react';
import { X, BookPlus, Loader2, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const PRESET_COLORS = [
  '#2563EB', // Azul
  '#7C3AED', // Roxo
  '#DB2777', // Rosa
  '#DC2626', // Vermelho
  '#EA580C', // Laranja
  '#059669', // Verde
  '#0891B2', // Ciano
  '#4F46E5', // Índigo
];

export default function CreateSubjectModal({ isOpen, onClose, onCreated }) {
  const [nome, setNome] = useState('');
  const [codigoDisciplina, setCodigoDisciplina] = useState('');
  const [semestre, setSemestre] = useState('2026.2');
  const [corHex, setCorHex] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const subject = await apiFetch('/subjects', {
        method: 'POST',
        body: JSON.stringify({
          nome,
          codigoDisciplina: codigoDisciplina || undefined,
          semestre,
          corHex,
        }),
      });
      setNome('');
      setCodigoDisciplina('');
      onCreated(subject);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookPlus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Criar Nova Matéria</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome da Matéria *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Engenharia de Software II"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Código (opcional)
              </label>
              <input
                type="text"
                value={codigoDisciplina}
                onChange={(e) => setCodigoDisciplina(e.target.value)}
                placeholder="Ex: ESW-402"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Semestre *</label>
              <input
                type="text"
                required
                value={semestre}
                onChange={(e) => setSemestre(e.target.value)}
                placeholder="Ex: 2026.2"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cor no Calendário
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {PRESET_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setCorHex(hex)}
                  style={{ backgroundColor: hex }}
                  className={`w-8 h-8 rounded-full transition transform ${
                    corHex === hex ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar Matéria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
