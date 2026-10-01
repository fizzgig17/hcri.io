// frontend/src/hooks/useAuth.js
//
// Reconstructed from assets/app.js (minified var b). Differences from the
// stale version this replaces: logins pass a "remember" flag, registration
// sends an explicit consent flag the backend requires, the user object gets
// an isAdmin boolean derived from is_admin, and logout actually calls the
// server logout endpoint (not just a client-side token clear).

import { useState, useCallback } from 'react';
import { api, setToken, getToken } from '../lib/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // Called once on mount (see App.jsx). If a token is already stored,
  // validates it against /auth/me and populates `user`; otherwise leaves
  // `user` null. Either way it clears `checking` so the caller can stop
  // showing a loading state. Returns whether auto-login succeeded.
  const tryAutoLogin = useCallback(async () => {
    if (!getToken()) { setChecking(false); return false; }
    try {
      const u = await api.get('/auth/me');
      setUser({ ...u, isAdmin: !!u.is_admin });
      setChecking(false);
      return true;
    } catch {
      setToken('');
      setChecking(false);
      return false;
    }
  }, []);

  // Logs in with email/password (plus an optional "remember me" flag the
  // backend uses to vary token lifetime), stores the returned token, and
  // sets `user`. Throws if the backend didn't return a user.
  const login = useCallback(async (email, password, remember) => {
    const r = await api.post('/auth/login', { email, password, remember: !!remember });
    if (!r || !r.user) throw new Error(r?.error || r?.message || 'Login failed: ' + JSON.stringify(r));
    const u = { ...r.user, isAdmin: !!r.user.is_admin };
    setToken(r.token);
    setUser(u);
    return u;
  }, []);

  // Registers a new account. `consent: true` is sent unconditionally since
  // the signup form requires checking a terms/consent box before this is
  // ever called. Stores the returned token and sets `user` on success.
  const register = useCallback(async (name, email, password) => {
    const r = await api.post('/auth/register', { name, email, password, consent: true });
    if (!r.user) throw new Error(r.error || 'Registration failed');
    const u = { ...r.user, isAdmin: !!r.user.is_admin };
    setToken(r.token);
    setUser(u);
    return u;
  }, []);

  // Clears the local session immediately (token + user state) and fires a
  // best-effort call to the server logout endpoint in the background --
  // the UI doesn't wait on it, so a slow/failed network call never blocks
  // sign-out.
  const logout = useCallback(() => {
    try {
      fetch('./index.php/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
    } catch {}
    setToken('');
    setUser(null);
  }, []);

  // setUser is exposed so App.jsx can patch the logged-in user object in
  // place (e.g. after AccountSettings/Sidebar hands back an updated user)
  // without a round trip through login/register.
  return { user, setUser, checking, tryAutoLogin, login, register, logout };
}
