'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CadastroPage() {
  const { register, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  function handlePhoneChange(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) {
      setTelefone(digits);
    } else if (digits.length <= 7) {
      setTelefone(`(${digits.slice(0, 2)}) ${digits.slice(2)}`);
    } else {
      setTelefone(`(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({ nome, email, telefone, senha });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-sm">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Criar Conta</h1>
          <p className="text-sm text-slate-500 mt-1">
            Preencha seus dados para acessar as matérias por convite
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
            <input
              type="text"
              required
              minLength={2}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Gabriela Nascimento"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@dominio.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Telefone (WhatsApp)
            </label>
            <input
              type="tel"
              required
              value={telefone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Já possui cadastro?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
