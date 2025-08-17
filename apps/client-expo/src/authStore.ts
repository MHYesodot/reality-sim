import * as SecureStore from 'expo-secure-store';
import jwtDecode from 'jwt-decode';

let memAccess: string | null = null;
let memRefresh: string | null = null;
let memSid: string | null = null;

export async function setTokens(access: string | null, refresh?: string | null, sid?: string | null) {
  memAccess = access || null;
  if (typeof refresh !== 'undefined') memRefresh = refresh || null;
  if (typeof sid !== 'undefined') memSid = sid || null;
  if (access) await SecureStore.setItemAsync('access', access); else await SecureStore.deleteItemAsync('access');
  if (typeof refresh !== 'undefined') { if (refresh) await SecureStore.setItemAsync('refresh', refresh); else await SecureStore.deleteItemAsync('refresh'); }
  if (typeof sid !== 'undefined') { if (sid) await SecureStore.setItemAsync('sid', sid); else await SecureStore.deleteItemAsync('sid'); }
  emitToken(access);
}

export async function getAccess(): Promise<string|null> {
  if (memAccess) return memAccess;
  const t = await SecureStore.getItemAsync('access');
  memAccess = t;
  return t;
}
export async function getRefresh(): Promise<string|null> {
  if (memRefresh) return memRefresh;
  const t = await SecureStore.getItemAsync('refresh');
  memRefresh = t;
  return t;
}
export async function getSid(): Promise<string|null> {
  if (memSid) return memSid;
  const t = await SecureStore.getItemAsync('sid');
  memSid = t;
  return t;
}

function expMs(token: string): number {
  try {
    const p:any = jwtDecode(token);
    if (p && p.exp) return p.exp * 1000;
  } catch {}
  return 0;
}

let refreshing: Promise<string|null> | null = null;

const listeners: Array<(t:string|null)=>void> = [];
export function onToken(cb:(t:string|null)=>void){ listeners.push(cb); return ()=>{ const i=listeners.indexOf(cb); if(i>=0) listeners.splice(i,1); }; }
function emitToken(t:string|null){ try{ listeners.forEach(fn=>fn(t)); }catch{} }

export async function refreshAccess(): Promise<string|null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const r = await getRefresh();
    if (!r) { refreshing = null; return null; }
    try {
      const res = await fetch((process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080') + '/auth/refresh', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: r })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'refresh failed');
      await setTokens(data.access || null, data.refresh || r, data.sid);
      refreshing = null;
      return data.access || null;
    } catch (e) {
      // drop session
      await setTokens(null, null, null);
      refreshing = null;
      return null;
    }
  })();
  return refreshing;
}

export async function ensureAccess(skewMs: number = 120000): Promise<string|null> {
  let a = await getAccess();
  if (!a) return await refreshAccess();
  const ms = expMs(a);
  if (ms && (ms - Date.now()) < skewMs) {
    const n = await refreshAccess();
    return n || a;
  }
  return a;
}

export async function logout() {
  const sid = await getSid();
  // best-effort server revoke of this device
  if (sid) {
    try {
      const a = await ensureAccess(0);
      await fetch((process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080') + '/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(a ? { Authorization: `Bearer ${a}` } : {}) },
        body: JSON.stringify({ sid })
      });
    } catch {}
  }
  await setTokens(null, null, null);
}
