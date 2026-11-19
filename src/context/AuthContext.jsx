'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('agenda_token');
    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch('/auth/me')
      .then((userData) => setUser(userData))
      .catch(() => {
        localStorage.removeItem('agenda_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, senha) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    localStorage.setItem('agenda_token', data.token);
    setUser(data.user);

    const pendingInvite = localStorage.getItem('pending_invite_code');
    if (pendingInvite) {
      localStorage.removeItem('pending_invite_code');
      router.push(`/convite/${pendingInvite}`);
    } else {
      router.push('/');
    }
  }

  async function register(payload) {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    localStorage.setItem('agenda_token', data.token);
    setUser(data.user);

    const pendingInvite = localStorage.getItem('pending_invite_code');
    if (pendingInvite) {
      localStorage.removeItem('pending_invite_code');
      router.push(`/convite/${pendingInvite}`);
    } else {
      router.push('/');
    }
  }

  function logout() {
    localStorage.removeItem('agenda_token');
    setUser(null);
    router.push('/login');
  }

  async function refreshProfile() {
    const updated = await apiFetch('/auth/me');
    setUser(updated);
    return updated;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
