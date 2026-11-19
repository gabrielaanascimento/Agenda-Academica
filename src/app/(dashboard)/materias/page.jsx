'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, ClipboardList, Copy, Check, ArrowRight, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function MateriasPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  async function loadSubjects() {
    try {
      const data = await apiFetch('/subjects');
      setSubjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubjects();
    window.addEventListener('subjects-updated', loadSubjects);
    return () => window.removeEventListener('subjects-updated', loadSubjects);
  }, []);

  function copyCode(e, subject) {
    e.preventDefault();
    navigator.clipboard.writeText(subject.codigoConvite);
    setCopiedId(subject.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Minhas Matérias</h1>
        <p className="text-sm text-slate-500">
          Disciplinas em que você está inscrito neste semestre.
        </p>
      </div>

      {subjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="text-slate-700 font-medium">Você ainda não participa de nenhuma matéria.</p>
          <p className="text-sm text-slate-500 mt-1">
            Use o botão &quot;Entrar com Código&quot; no menu para ingressar em uma disciplina.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((sub) => (
            <Link
              key={sub.id}
              href={`/materias/${sub.id}`}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
            >
              <div className="h-2 w-full" style={{ backgroundColor: sub.corHex }} />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500">
                      {sub.codigoDisciplina ? `${sub.codigoDisciplina} • ` : ''}
                      Semestre {sub.semestre}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">{sub.nome}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Criada por {sub.criadoPor?.nome}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-slate-400" />
                      {sub._count?.members ?? 0} alunos
                    </span>
                    <span className="flex items-center gap-1">
                      <ClipboardList className="w-4 h-4 text-slate-400" />
                      {sub._count?.activities ?? 0} tarefas
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => copyCode(e, sub)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-mono font-semibold text-slate-700 flex items-center gap-1.5"
                    title="Copiar código de convite"
                  >
                    {sub.codigoConvite}
                    {copiedId === sub.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
