'use client';

import { useState } from 'react';
import { X, Ticket, Loader2, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function JoinSubjectModal({ isOpen, onClose, onJoined }) {
  const [codigoConvite, setCodigoConvite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const subject = await apiFetch('/subjects/join', {
        method: 'POST',
        body: JSON.stringify({ codigoConvite }),
      });
      setCodigoConvite('');
      onJoined(subject);
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
              <Ticket className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Entrar em uma Matéria</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Insira o código de convite compartilhado pelo representante (ADM) da disciplina.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Código de Convite
            </label>
            <input
              type="text"
              required
              value={codigoConvite}
              onChange={(e) => setCodigoConvite(e.target.value.toUpperCase())}
              placeholder="Ex: A1B2C3D4"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              Participar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
