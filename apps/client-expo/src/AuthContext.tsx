import React, { createContext, useEffect, useState } from 'react';
import { api } from './api';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type User = { id:string; email:string; displayName?:string } | null;
type Tokens = { access:string; refresh:string } | null;

export const AuthContext = createContext<{
  user: User;
  tokens: Tokens;
  login: (email:string, password:string) => Promise<void>;
  register: (email:string, password:string, displayName:string) => Promise<void>;
  logout: () => Promise<void>;
  ready: boolean;
}>({ user: null, tokens: null, login: async()=>{}, register: async()=>{}, logout: async()=>{}, ready:false });

const storage = {
  async get(key: string) {
    if (Platform.OS === 'web') {
      try { return window.localStorage.getItem(key); } catch { return null; }
    }
    try { return await SecureStore.getItemAsync(key); } catch { return null; }
  },
  async set(key: string, value: string | null) {
    if (Platform.OS === 'web') {
      try { if (value == null) window.localStorage.removeItem(key); else window.localStorage.setItem(key, value); } catch {}
      return;
    }
    try { if (value == null) await SecureStore.deleteItemAsync(key); else await SecureStore.setItemAsync(key, value); } catch {}
  }
};

async function loadTokens(): Promise<Tokens> {
  const access = await storage.get('access');
  const refresh = await storage.get('refresh');
  if (access && refresh) return { access, refresh };
  return null;
}
async function saveTokens(t: Tokens) {
  await storage.set('access', t?.access ?? null);
  await storage.set('refresh', t?.refresh ?? null);
}

export function AuthProvider({ children }:{ children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [tokens, setTokens] = useState<Tokens>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => { (async () => {
    const t = await loadTokens();
    setTokens(t);
    setReady(true);
  })(); }, []);

  async function login(email:string, password:string) {
    const res = await api.auth.login(email, password);
    setUser(res.user || null);
    const t: Tokens = res.tokens || (res.access && res.refresh ? { access: res.access, refresh: res.refresh } : null);
    setTokens(t);
    await saveTokens(t);
  }
  async function register(email:string, password:string, displayName:string) {
    const res = await api.auth.register(email, password, displayName);
    setUser(res.user || null);
    const t: Tokens = res.tokens || (res.access && res.refresh ? { access: res.access, refresh: res.refresh } : null);
    setTokens(t);
    await saveTokens(t);
  }
  async function logout() {
    const t = await loadTokens();
    if (t?.refresh) { try { await api.auth.logout(t.refresh); } catch {} }
    await saveTokens(null);
    setUser(null); setTokens(null);
  }

  return (
    <AuthContext.Provider value={{ user, tokens, login, register, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}
