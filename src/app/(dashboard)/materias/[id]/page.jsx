'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Copy,
  Check,
  RefreshCw,
  UserMinus,
  LogOut,
  ArrowLeft,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function SubjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [rotating, setRotating] = useState(false);

  const loadDetails = useCallback(async () => {
    try {
      const data = await apiFetch(`/subjects/${id}`);
      setSubject(data);
    } catch (err) {
      alert(err.message);
      router.replace('/materias');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  if (loading || !subject) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
      </div>
    );
  }

  const canManageSubject =
    subject.criadoPorId === user?.id || user?.role === 'SUPER_ADMIN';

  function handleCopyCode() {
    navigator.clipboard.writeText(subject.codigoConvite);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/convite/${subject.codigoConvite}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  async function handleRotateInvite() {
    if (!window.confirm('O código antigo deixará de funcionar. Deseja gerar um novo código?')) {
      return;
    }
    setRotating(true);
    try {
      const updated = await apiFetch(`/subjects/${id}/rotate-invite`, { method: 'PATCH' });
      setSubject((prev) => ({ ...prev, codigoConvite: updated.codigoConvite }));
    } catch (err) {
      alert(err.message);
    } finally {
      setRotating(false);
    }
  }

  async function handleRemoveOrLeave(targetUserId, targetName) {
    const isSelf = targetUserId === user?.id;
    const confirmMsg = isSelf
      ? 'Deseja realmente sair desta matéria?'
      : `Remover ${targetName} desta matéria?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await apiFetch(`/subjects/${id}/members/${targetUserId}`, { method: 'DELETE' });
      window.dispatchEvent(new Event('subjects-updated'));
      if (isSelf) {
        router.replace('/materias');
      } else {
        loadDetails();
      }
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/materias"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para matérias
      </Link>

      {/* Cabeçalho da Matéria */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="h-3 w-full" style={{ backgroundColor: subject.corHex }} />
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              {subject.codigoDisciplina ? `${subject.codigoDisciplina} • ` : ''}
              Semestre {subject.semestre}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{subject.nome}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Responsável: <span className="font-medium text-slate-700">{subject.criadoPor?.nome}</span>
            </p>
          </div>

          <button
            onClick={() => handleRemoveOrLeave(user.id, user.nome)}
            className="px-3.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 self-start"
          >
            <LogOut className="w-4 h-4" />
            Sair da Matéria
          </button>
        </div>
      </div>

      {/* Cartão de Convite */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">Convite da Matéria</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Compartilhe o código ou o link direto no grupo da sala para que os colegas entrem.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-slate-100 font-mono text-base font-bold tracking-widest text-slate-900">
            {subject.codigoConvite}
          </div>

          <button
            onClick={handleCopyCode}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedCode ? 'Código Copiado!' : 'Copiar Código'}
          </button>

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <LinkIcon className="w-4 h-4" />}
            {copiedLink ? 'Link Copiado!' : 'Copiar Link Direto'}
          </button>

          {canManageSubject && (
            <button
              onClick={handleRotateInvite}
              disabled={rotating}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${rotating ? 'animate-spin' : ''}`} />
              Gerar Novo Código
            </button>
          )}
        </div>
      </div>

      {/* Lista de Participantes */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          Participantes ({subject.members?.length || 0})
        </h2>

        <div className="divide-y divide-slate-100">
          {subject.members?.map((member) => (
            <div key={member.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {member.user.nome}
                  {member.user.id === subject.criadoPorId && (
                    <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-100 text-blue-700">
                      Criador
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500">{member.user.email}</p>
              </div>

              {canManageSubject && member.user.id !== user.id && (
                <button
                  onClick={() => handleRemoveOrLeave(member.user.id, member.user.nome)}
                  title="Remover aluno"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
