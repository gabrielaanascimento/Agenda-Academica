const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agendafaculdadeapi.vercel.app/api';

export async function apiFetch(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('agenda_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      const isAuthRoute = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('agenda_token');
        window.location.href = '/login';
      }
    }

    if (data?.errors && Array.isArray(data.errors)) {
      const messages = data.errors.map((e) => e.mensagem).join(' ');
      throw new Error(messages);
    }

    throw new Error(data?.message || 'Ocorreu um erro ao comunicar com o servidor.');
  }

  return data;
}
