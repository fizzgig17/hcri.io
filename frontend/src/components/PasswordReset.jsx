// frontend/src/components/PasswordReset.jsx
//
// Reconstructed from the deployed assets/app.js (minified function We). The
// stale frontend/src this replaces had no password-reset flow at all. This
// is the page shown when the app is loaded with a `?reset=<token>` URL
// (that routing decision lives outside this batch's reconstructed range --
// presumably in App.jsx or index.jsx). On success the server returns a
// fresh JWT (the user is signed in immediately, no separate login step),
// and after a short pause the page does a full reload back to the bare
// path so the app re-mounts as the logged-in SPA.

import { useState } from 'react';
import { useTheme } from '../lib/ThemeContext.jsx';
import { setToken } from '../lib/api';

export default function PasswordReset({ token, onDone }) {
  const { theme: T } = useTheme();
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [saving, setSaving]       = useState(false);
  const [err, setErr]             = useState('');
  const [done, setDone]           = useState(false);

  const inputStyle = {
    background:T.surface, border:`1px solid ${T.border}`, borderRadius:6, padding:'12px 14px',
    color:T.text, fontSize:16, outline:'none', width:'100%', fontFamily:'monospace', boxSizing:'border-box',
  };

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (password.length < 8) { setErr('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setErr('Passwords do not match'); return; }
    setSaving(true);
    try {
      const res = await fetch('./index.php/api/auth/reset_confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setToken(data.token);
      setDone(true);
      setTimeout(() => {
        window.location.href = window.location.pathname;
      }, 2000);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:T.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'monospace' }}>
      <div style={{ width:'100%', maxWidth:400, display:'flex', flexDirection:'column', gap:24 }}>
        <div style={{ textAlign:'center', fontWeight:900, fontSize:26, color:T.white }}>
          hCRI<span style={{ color:T.accent }}>.io</span>
        </div>
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:28, display:'flex', flexDirection:'column', gap:18 }}>
          {done ? (
            <div style={{ textAlign:'center', padding:'12px 0' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
              <div style={{ fontSize:16, fontWeight:700, color:T.good, marginBottom:8 }}>Password updated!</div>
              <div style={{ fontSize:13, color:T.dim }}>Signing you in…</div>
            </div>
          ) : (
            <>
              <div>
                <div style={{ fontSize:20, fontWeight:900, color:T.white, marginBottom:6 }}>Set New Password</div>
                <div style={{ fontSize:14, color:T.dim }}>Choose a new password for your hCRI.io account.</div>
              </div>
              <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label style={{ fontSize:13, textTransform:'uppercase', letterSpacing:1, color:T.dim, fontWeight:700, display:'block', marginBottom:7 }}>
                    New Password
                  </label>
                  <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min 8 characters" autoComplete="new-password" autoFocus />
                </div>
                <div>
                  <label style={{ fontSize:13, textTransform:'uppercase', letterSpacing:1, color:T.dim, fontWeight:700, display:'block', marginBottom:7 }}>
                    Confirm Password
                  </label>
                  <input style={inputStyle} type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat password" autoComplete="new-password" />
                </div>
                {err && <div style={{ fontSize:14, color:T.bad, fontWeight:600, textAlign:'center' }}>{err}</div>}
                <button type="submit" disabled={saving}
                  style={{ background:T.accent, color:T.bg, border:'none', borderRadius:8, padding:14, fontWeight:900, fontSize:16, cursor:'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving…' : 'Set New Password'}
                </button>
              </form>
              <button onClick={() => onDone(null)}
                style={{ background:'none', border:'none', color:T.dim, fontSize:13, cursor:'pointer', textAlign:'center' }}>
                ← Back to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
