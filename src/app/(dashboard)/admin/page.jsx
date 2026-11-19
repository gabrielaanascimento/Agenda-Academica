'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      router.replace('/');
    }
  }, [user, router]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await apiFetch(`/admin/users${query}`);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      const timeout = setTimeout(loadUsers, 250);
      return () => clearTimeout(timeout);
    }
  }, [user, loadUsers]);

  async function handleToggleRole(targetUser) {
    const newRole = targetUser.role === 'ADM' ? 'ALUNO' : 'ADM';
    setUpdatingId(targetUser.id);
    try {
      await apiFetch(`/admin/users/${targetUser.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (user?.role !== 'SUPER_ADMIN') return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerenciamento de ADMs</h1>
          <p className="text-sm text-slate-500">
            Defina quais usuários podem criar matérias e gerar convites.
          </p>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar usuário por nome ou e-mail..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lista de Usuários */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">Nenhum usuário encontrado.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{u.nome}</span>
                    <span
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                        u.role === 'SUPER_ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : u.role === 'ADM'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {u.email} • {u.telefone}
                  </p>
                </div>

                {u.role !== 'SUPER_ADMIN' && (
                  <button
                    disabled={updatingId === u.id}
                    onClick={() => handleToggleRole(u)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 self-start sm:self-auto ${
                      u.role === 'ADM'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {updatingId === u.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {u.role === 'ADM' ? 'Rebaixar para Aluno' : 'Promover a ADM'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
