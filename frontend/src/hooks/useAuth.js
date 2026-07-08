import { useState, useCallback } from 'react';
import { api, setToken, getToken } from '../lib/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const tryAutoLogin = useCallback(async () => {
    if (!getToken()) { setChecking(false); return false; }
    try { const u = await api.get('/auth/me'); setUser(u); setChecking(false); return true; }
    catch { setToken(''); setChecking(false); return false; }
  }, []);

  const login = useCallback(async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    setToken(r.token); setUser(r.user); return r.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const r = await api.post('/auth/register', { name, email, password });
    setToken(r.token); setUser(r.user); return r.user;
  }, []);

  const logout = useCallback(() => { setToken(''); setUser(null); }, []);

  return { user, checking, tryAutoLogin, login, register, logout };
}
