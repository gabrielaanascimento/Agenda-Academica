'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CalendarDays,
  BookOpen,
  User,
  ShieldCheck,
  LogOut,
  Ticket,
  Plus,
  Menu,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import JoinSubjectModal from '@/components/modals/JoinSubjectModal';
import CreateSubjectModal from '@/components/modals/CreateSubjectModal';

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [subjects, setSubjects] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  async function loadSubjects() {
    try {
      const data = await apiFetch('/subjects');
      setSubjects(data);
    } catch (err) {
      console.error('Erro ao carregar matérias:', err);
    }
  }

  useEffect(() => {
    if (user) {
      loadSubjects();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const canCreateSubject = user.role === 'ADM' || user.role === 'SUPER_ADMIN';
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  const navItems = [
    { href: '/', label: 'Calendário', icon: CalendarDays },
    { href: '/materias', label: 'Minhas Matérias', icon: BookOpen },
    { href: '/perfil', label: 'Meu Perfil', icon: User },
    ...(isSuperAdmin ? [{ href: '/admin', label: 'Gerenciar ADMs', icon: ShieldCheck }] : []),
  ];

  const roleLabels = {
    ALUNO: { text: 'Aluno', className: 'bg-slate-100 text-slate-700' },
    ADM: { text: 'ADM', className: 'bg-blue-100 text-blue-700' },
    SUPER_ADMIN: { text: 'Super Admin', className: 'bg-purple-100 text-purple-700' },
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Header Mobile */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <CalendarDays className="w-4 h-4" />
          </div>
          <span>Agenda Acadêmica</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Backdrop Mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">Agenda Acadêmica</h1>
            <span className="text-xs text-slate-500">Organização por matérias</span>
          </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="p-4 space-y-2 border-b border-slate-100">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setJoinModalOpen(true);
            }}
            className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center gap-2 transition"
          >
            <Ticket className="w-4 h-4" />
            Entrar com Código
          </button>

          {canCreateSubject && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCreateModalOpen(true);
              }}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Criar Matéria
            </button>
          )}
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  active
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}

          {/* Lista rápida de matérias */}
          <div className="pt-5">
            <div className="px-3.5 mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Suas Matérias ({subjects.length})
              </span>
            </div>
            {subjects.length === 0 ? (
              <p className="px-3.5 text-xs text-slate-400">
                Nenhuma matéria ainda. Use um código de convite para entrar.
              </p>
            ) : (
              <div className="space-y-1">
                {subjects.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/materias/${sub.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm transition ${
                      pathname === `/materias/${sub.id}`
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: sub.corHex }}
                    />
                    <span className="truncate">{sub.nome}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Perfil e Logout */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.nome}</p>
              <span
                className={`inline-block mt-0.5 px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                  roleLabels[user.role]?.className
                }`}
              >
                {roleLabels[user.role]?.text}
              </span>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>

      {/* Modais Globais */}
      <JoinSubjectModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onJoined={() => {
          loadSubjects();
          window.dispatchEvent(new Event('subjects-updated'));
        }}
      />

      <CreateSubjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => {
          loadSubjects();
          window.dispatchEvent(new Event('subjects-updated'));
        }}
      />
    </div>
  );
}
