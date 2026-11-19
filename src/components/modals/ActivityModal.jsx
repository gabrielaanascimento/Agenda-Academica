'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { ACTIVITY_TYPES, toInputDateValue } from '@/lib/dateUtils';

export default function ActivityModal({
  isOpen,
  onClose,
  subjects,
  defaultDate,
  defaultSubjectId,
  editingActivity,
  onSaved,
}) {
  const [subjectId, setSubjectId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('TRABALHO');
  const [dataEntrega, setDataEntrega] = useState('');
  const [descricao, setDescricao] = useState('');
  const [linkApoio, setLinkApoio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');

    if (editingActivity) {
      setSubjectId(editingActivity.subjectId);
      setTitulo(editingActivity.titulo || '');
      setTipo(editingActivity.tipo || 'TRABALHO');
      setDataEntrega(toInputDateValue(editingActivity.dataEntrega));
      setDescricao(editingActivity.descricao || '');
      setLinkApoio(editingActivity.linkApoio || '');
    } else {
      setSubjectId(defaultSubjectId || (subjects[0]?.id ?? ''));
      setTitulo('');
      setTipo('TRABALHO');
      setDataEntrega(defaultDate || '');
      setDescricao('');
      setLinkApoio('');
    }
  }, [isOpen, editingActivity, defaultDate, defaultSubjectId, subjects]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Envia meio-dia UTC para evitar deslocamento de fuso horário ao salvar o dia
      const isoDate = `${dataEntrega}T12:00:00.000Z`;
      const payload = {
        titulo,
        tipo,
        dataEntrega: isoDate,
        descricao: descricao.trim() || null,
        linkApoio: linkApoio.trim() || null,
      };

      if (editingActivity) {
        await apiFetch(`/activities/${editingActivity.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch(`/subjects/${subjectId}/activities`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {editingActivity ? 'Editar Atividade' : 'Nova Atividade'}
          </h2>
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
          {!editingActivity && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Matéria *</label>
              <select
                required
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.nome} ({sub.semestre})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Prova P1 - Derivadas e Integrais"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(ACTIVITY_TYPES).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data de Entrega *
              </label>
              <input
                type="date"
                required
                value={dataEntrega}
                onChange={(e) => setDataEntrega(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descrição / Conteúdo (opcional)
            </label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes da entrega, capítulos que caem na prova, regras do grupo..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Link de Apoio (opcional)
            </label>
            <input
              type="url"
              value={linkApoio}
              onChange={(e) => setLinkApoio(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {editingActivity ? 'Salvar Alterações' : 'Adicionar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
