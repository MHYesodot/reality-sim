import { ENV } from '../env';

export async function http(path: string, options?: RequestInit, token?: string) {
  const url = ENV.API_URL.replace(/\/$/, '') + path;
  const baseHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) baseHeaders['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, {
    ...(options || {}),
    headers: { ...(options?.headers as any || {}), ...baseHeaders }
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || text || 'Request failed';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

export const auth = {
  register: (email:string, password:string, displayName:string) =>
    http('/auth/register', { method:'POST', body: JSON.stringify({ email, password, displayName }) }),
  login: (email:string, password:string) =>
    http('/auth/login', { method:'POST', body: JSON.stringify({ email, password }) }),
  refresh: (refresh:string) =>
    http('/auth/refresh', { method:'POST', body: JSON.stringify({ refresh }) }),
  logout: (refresh:string) =>
    http('/auth/logout', { method:'POST', body: JSON.stringify({ refresh }) })
};

export const quests = {
  list: (token?:string) => http('/quests', undefined, token),
  accept: (id:string, token?:string) => http(`/quests/accept/${id}`, { method:'POST' }, token),
  complete: (id:string, token?:string) => http(`/quests/complete/${id}`, { method:'POST' }, token),
  get: (id:string, token?:string) => http(`/quests/${id}`, undefined, token)
};

export const leaderboard = {
  list: (token?:string) => http('/leaderboard', undefined, token)
};

export const privacy = {
  consent: (analytics: boolean, token?:string) => http('/privacy/consent', { method:'POST', body: JSON.stringify({ analytics }) }, token)
};

export const analytics = {
  track: (name:string, props?: Record<string, any>, token?:string) =>
    http('/analytics/event', { method:'POST', body: JSON.stringify({ name, props: props || {} }) }, token)
};

export const sessions = {
  list: (token?:string) => http('/auth/sessions', undefined, token),
  revoke: (sid: string, token?:string) => http('/auth/logout', { method:'POST', body: JSON.stringify({ sid }) }, token),
  revokeAll: (token?:string) => http('/auth/logout_all', { method:'POST' }, token)
};

export const api = { auth, quests, leaderboard, privacy, analytics, sessions };
