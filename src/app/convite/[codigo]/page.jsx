'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function ConvitePage() {
  const { codigo } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('Processando convite...');

  useEffect(() => {
    if (loading) return;

    if (!user) {
      localStorage.setItem('pending_invite_code', codigo);
      router.replace('/login');
      return;
    }

    apiFetch('/subjects/join', {
      method: 'POST',
      body: JSON.stringify({ codigoConvite: codigo }),
    })
      .then((subject) => {
        setStatus('success');
        setMessage(`Você entrou na matéria "${subject.nome}"!`);
        setTimeout(() => router.replace('/'), 1500);
      })
      .catch((err) => {
        if (err.message.includes('já está participando')) {
          router.replace('/');
        } else {
          setStatus('error');
          setMessage(err.message);
        }
      });
  }, [codigo, user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-900">{message}</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-900">{message}</h2>
            <p className="text-sm text-slate-500 mt-1">Redirecionando para o calendário...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-900">Não foi possível entrar</h2>
            <p className="text-sm text-slate-600 mt-1">{message}</p>
            <button
              onClick={() => router.replace('/')}
              className="mt-5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700"
            >
              Ir para o início
            </button>
          </>
        )}
      </div>
    </div>
  );
}
