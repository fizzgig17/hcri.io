// frontend/src/components/AccountSettings.jsx
//
// Reconstructed from the deployed assets/app.js (minified functions
// ApiTokens and k). This is the full account/settings modal reachable from
// the logged-in app -- the stale frontend/src this replaces had only a
// bare password-change form; the real deployed modal has seven tabs
// (Password, Email, Name, Display, Privacy, API, Links), a default-list-view
// setting, a timezone picker, GDPR-style data export/account deletion, and
// share-link management, none of which existed before.

import { useState, useEffect } from 'react';
import { useTheme } from '../lib/ThemeContext.jsx';
import { api, setToken } from '../lib/api';
import { setTZ } from '../lib/tz';

// ── API token management (bundle: `ApiTokens`) ─────────────────────────────
// Rendered inside the "API" tab of AccountSettings below. theme is passed
// down rather than read via useTheme() directly, matching the bundle (it's
// used as a plain sub-component of the settings modal, not mounted on its
// own elsewhere).
export function ApiTokens({ theme: t, onClose: closeSettings }) {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');
  const [name, setName]       = useState('');
  const [busy, setBusy]       = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied]   = useState(false);

  function load() {
    setLoading(true);
    api.get('/tokens')
      .then(d => { setList(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setErr('Failed to load tokens'); setLoading(false); });
  }
  useEffect(() => { load(); }, []);

  async function create() {
    setBusy(true); setErr('');
    try {
      const r = await api.post('/tokens', { name: name || 'API token' });
      setCreated(r); setName(''); setCopied(false); load();
    } catch (x) {
      setErr((x && x.message) || 'Failed to create token');
    }
    setBusy(false);
  }

  async function revoke(id) {
    if (!window.confirm('Revoke this token? Any scripts using it will stop working.')) return;
    try {
      await api.del('/tokens/' + id);
      if (created && created.id === id) setCreated(null);
      load();
    } catch {
      setErr('Failed to revoke');
    }
  }

  const endpoint = `${window.location.origin}${basePathForTokens()}index.php/api/v1/upload`;
  const box = { background:t.bg, border:`1px solid ${t.border}`, borderRadius:6, padding:'10px 12px', color:t.text, whiteSpace:'pre-wrap', wordBreak:'break-all', fontFamily:'monospace', fontSize:12 };

  return (
    <div>
      <div style={{ fontSize:13, color:t.dim, lineHeight:1.5, marginBottom:14 }}>
        Create a non-expiring token to upload reports from scripts or instruments. Treat it like a password — it carries your account's upload access.
      </div>
      <button
        onClick={() => {
          try { window.dispatchEvent(new CustomEvent('hcri:openHelp', { detail: { title: 'Uploading via the API' } })); } catch {}
          closeSettings && closeSettings();
        }}
        style={{ background:'none', border:'none', color:t.accent, cursor:'pointer', fontFamily:'monospace', fontSize:13, fontWeight:600, padding:0, marginBottom:16, textDecoration:'underline' }}>
        📖 Read the full API documentation
      </button>

      {created && (
        <div style={{ border:`1px solid ${t.good}`, background:`${t.good}14`, borderRadius:8, padding:'12px 14px', marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:t.good, marginBottom:6, fontFamily:'monospace' }}>
            New token — copy it now, it won't be shown again
          </div>
          <div style={box}>{created.token}</div>
          <button
            onClick={() => {
              try {
                navigator.clipboard.writeText(created.token).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                });
              } catch {}
            }}
            style={{ marginTop:8, background: copied ? `${t.good}22` : 'none', border:`1px solid ${copied ? t.good : t.border}`, color: copied ? t.good : t.text, borderRadius:6, padding:'6px 14px', fontSize:12, cursor:'pointer', fontFamily:'monospace', fontWeight:600 }}>
            {copied ? '✓ Copied' : 'Copy token'}
          </button>
        </div>
      )}

      <div style={{ display:'flex', gap:8, alignItems:'flex-end', marginBottom:18 }}>
        <div style={{ flex:1 }}>
          <label style={{ fontSize:10, textTransform:'uppercase', letterSpacing:1, color:t.dim, fontWeight:700, display:'block', marginBottom:4 }}>Token name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Lab laptop"
            style={{ width:'100%', boxSizing:'border-box', background:t.bg, border:`1px solid ${t.border}`, borderRadius:6, padding:'8px 10px', color:t.text, fontSize:13, fontFamily:'monospace', outline:'none' }} />
        </div>
        <button onClick={create} disabled={busy}
          style={{ background:`${t.accent}22`, border:`1px solid ${t.accent}`, color:t.accent, borderRadius:6, padding:'9px 16px', fontSize:13, fontWeight:700, cursor: busy ? 'default' : 'pointer', fontFamily:'monospace', whiteSpace:'nowrap', opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Creating…' : 'Create token'}
        </button>
      </div>

      {err && <div style={{ fontSize:12, color:t.bad, fontFamily:'monospace', marginBottom:12 }}>{err}</div>}

      <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:1, color:t.dim, fontWeight:700, marginBottom:8 }}>Your tokens</div>
      {loading ? (
        <div style={{ color:t.dim, fontFamily:'monospace', fontSize:12 }}>Loading…</div>
      ) : list.length ? (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {list.map(tk => (
            <div key={tk.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, border:`1px solid ${t.border}`, borderRadius:6, padding:'9px 12px' }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, color:t.text, fontWeight:600, fontFamily:'monospace' }}>{tk.name}</div>
                <div style={{ fontSize:11, color:t.dim, fontFamily:'monospace', marginTop:2 }}>
                  {tk.prefix}…  ·  created {(tk.createdAt || '').slice(0, 10)}
                  {tk.lastUsedAt ? '  ·  last used ' + (tk.lastUsedAt || '').slice(0, 10) : '  ·  never used'}
                </div>
              </div>
              <button onClick={() => revoke(tk.id)}
                style={{ background:'none', border:`1px solid ${t.bad}55`, color:t.bad, borderRadius:5, padding:'5px 12px', fontSize:12, cursor:'pointer', fontFamily:'monospace', flexShrink:0 }}>
                Revoke
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color:t.dim, fontFamily:'monospace', fontSize:12 }}>No tokens yet.</div>
      )}

      <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:1, color:t.dim, fontWeight:700, margin:'18px 0 8px' }}>Upload via API</div>
      <div style={{ fontSize:12, color:t.dim, marginBottom:6, fontFamily:'monospace' }}>POST a file (csv, tsv, txt, json, sp, pdf):</div>
      <div style={box}>
        {`curl -X POST "${endpoint}" \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -F "file=@measurement.csv" \\\n  -F "label=My Light"`}
      </div>
      <div style={{ marginTop:12 }}>
        <a href={`${window.location.origin}${basePathForTokens().replace(/index\.php\/$/, '')}assets/hcri-api-spec.pdf`} target="_blank" rel="noopener" download="hcri-api-spec.pdf"
           style={{ color:t.accent, fontSize:12, fontWeight:700, textDecoration:'none' }}>
          ⬇ Download the API reference (PDF)
        </a>
      </div>
    </div>
  );
}

// basePath() from lib/api.js, inlined under a distinct name here because the
// bundle's ApiTokens builds the curl endpoint URL the same way the rest of
// the app does (directory the app is served from).
function basePathForTokens() {
  const p = window.location.pathname;
  return p.substring(0, p.lastIndexOf('/') + 1);
}

// ── Main account/settings modal (bundle: `k`) ──────────────────────────────
export default function AccountSettings({ user, onClose, onUserUpdate }) {
  const { theme: T } = useTheme();
  const [tab, setTab] = useState('password');
  const [shareTokens, setShareTokens] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNoticeState] = useState(null); // { text, ok }

  const [curPw, setCurPw]       = useState('');
  const [newPw, setNewPw]       = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailPw, setEmailPw]   = useState('');
  const [displayName, setDisplayName] = useState(user?.name || '');

  const [delOpen, setDelOpen]   = useState(false);
  const [delPw, setDelPw]       = useState('');
  const [delKeep, setDelKeep]   = useState(true);

  const [reportsDefaultPrivate, setReportsDefaultPrivate] = useState(!!(user && user.reportsDefaultPrivate));
  const [viewExplore, setViewExplore]     = useState(user && user.viewExplore === 'all' ? 'all' : 'cards');
  const [viewMyReports, setViewMyReports] = useState(user && user.viewMyReports === 'all' ? 'all' : 'cards');
  const [timezone, setTimezone]           = useState((user && user.timezone) || 'America/New_York');

  function notify(text, ok = true) { setNoticeState({ text, ok }); }
  function clearNotice() { setNoticeState(null); }

  useEffect(() => {
    api.get('/auth/profile')
      .then(d => {
        if (d && typeof d.reportsDefaultPrivate === 'boolean') setReportsDefaultPrivate(d.reportsDefaultPrivate);
        if (d && d.timezone) setTimezone(d.timezone);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/share_tokens')
      .then(d => setShareTokens((d && d.tokens) || []))
      .catch(() => {});
  }, []);

  async function saveReportsDefaultPrivate(val) {
    setBusy(true); clearNotice();
    try {
      const r = await api.post('/auth/profile', { action: 'reports_default', value: val });
      setReportsDefaultPrivate(!!r.reportsDefaultPrivate);
      notify(val ? 'New reports will be excluded from Explore by default.' : 'New reports will be public by default.');
      onUserUpdate && onUserUpdate({ ...user, reportsDefaultPrivate: !!r.reportsDefaultPrivate });
    } catch (x) {
      notify((x && x.message) || 'Failed to save', false);
    } finally {
      setBusy(false);
    }
  }

  async function submitPasswordChange(e) {
    e.preventDefault();
    clearNotice();
    if (newPw !== confirmPw) return notify('New passwords do not match', false);
    if (newPw.length < 8) return notify('Password must be at least 8 characters', false);
    setBusy(true);
    try {
      await api.post('/auth/profile', { action: 'password', current: curPw, new: newPw });
      notify('Password updated successfully');
      setCurPw(''); setNewPw(''); setConfirmPw('');
    } catch (e) {
      notify(e.message || 'Failed', false);
    } finally {
      setBusy(false);
    }
  }

  async function submitEmailChange(e) {
    e.preventDefault();
    clearNotice();
    setBusy(true);
    try {
      const r = await api.post('/auth/profile', { action: 'email', email: newEmail, password: emailPw });
      if (r.token) setToken(r.token);
      onUserUpdate({ ...user, email: r.email });
      notify('Email updated successfully');
      setNewEmail(''); setEmailPw('');
    } catch (e) {
      notify(e.message || 'Failed', false);
    } finally {
      setBusy(false);
    }
  }

  async function submitNameChange(e) {
    e.preventDefault();
    clearNotice();
    setBusy(true);
    try {
      await api.post('/auth/profile', { action: 'name', name: displayName });
      onUserUpdate({ ...user, name: displayName });
      notify('Name updated successfully');
    } catch (e) {
      notify(e.message || 'Failed', false);
    } finally {
      setBusy(false);
    }
  }

  async function sendResetLink() {
    clearNotice(); setBusy(true);
    try {
      await api.post('/auth/profile', { action: 'send_reset' });
      notify(`Reset link sent to ${user.email}`);
    } catch (e) {
      notify(e.message || 'Failed to send email', false);
    } finally {
      setBusy(false);
    }
  }

  const S = {
    overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 },
    modal: { background:T.surface2, border:`1px solid ${T.border}`, borderRadius:10, width:'100%', maxWidth:400, fontFamily:'monospace', overflow:'hidden' },
    header: { padding:'14px 18px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' },
    tabs: { display:'flex', borderBottom:`1px solid ${T.border}` },
    tab: active => ({
      flex:1, padding:'9px 4px', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8,
      border:'none', cursor:'pointer', fontFamily:'monospace',
      background: active ? `${T.accent}18` : 'none', color: active ? T.accent : T.dim,
      borderBottom: active ? `2px solid ${T.accent}` : '2px solid transparent',
    }),
    body: { padding:18 },
    label: { fontSize:11, color:T.dim, textTransform:'uppercase', letterSpacing:1, fontWeight:700, display:'block', marginBottom:5 },
    input: { width:'100%', background:T.surface, border:`1px solid ${T.border}`, color:T.text, borderRadius:5, padding:'8px 10px', fontSize:13, fontFamily:'monospace', boxSizing:'border-box', marginBottom:12 },
    btn: (kind = 'primary') => ({
      width:'100%', padding:9, borderRadius:5, border:'none', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'monospace',
      background: kind === 'primary' ? T.accent : T.surface, color: kind === 'primary' ? '#000' : T.dim, opacity: busy ? 0.5 : 1,
    }),
    notice: ok => ({ padding:'8px 12px', borderRadius:5, fontSize:12, marginBottom:12, background: ok ? `${T.good}18` : `${T.bad}18`, color: ok ? T.good : T.bad, border:`1px solid ${ok ? T.good + '40' : T.bad + '40'}` }),
  };

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={S.header}>
          <div>
            <div style={{ fontWeight:700, color:T.white, fontSize:15 }}>Profile</div>
            <div style={{ fontSize:11, color:T.dim, marginTop:2 }}>{user?.email}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:T.dim, fontSize:20, cursor:'pointer', lineHeight:1 }}>✕</button>
        </div>

        <div style={S.tabs}>
          {[
            ['password', 'Password'],
            ['email', 'Email'],
            ['name', 'Name'],
            ['display', 'Display'],
            ['privacy', 'Privacy'],
            ['api', 'API'],
            ['shares', 'Links'],
          ].map(([key, label]) => (
            <button key={key} style={S.tab(tab === key)} onClick={() => { setTab(key); clearNotice(); }}>{label}</button>
          ))}
        </div>

        <div style={S.body}>
          {notice && <div style={S.notice(notice.ok)}>{notice.text}</div>}

          {tab === 'shares' && (
            <>
              <div style={{ ...S.label, marginBottom:10 }}>Active share links</div>
              {shareTokens.length === 0 ? (
                <div style={{ fontSize:12, color:T.dim, fontFamily:'monospace', padding:'6px 0 4px', lineHeight:1.6 }}>
                  No active share links. Sharing a report — or copying a comparison that includes a private report — creates one here.
                </div>
              ) : (
                <>
                  <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14, maxHeight:320, overflowY:'auto' }}>
                    {shareTokens.map(tk => (
                      <div key={tk.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', border:`1px solid ${T.border}`, borderRadius:6, background:T.surface }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:T.text, fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {tk.label || 'Untitled'}
                            {tk.private && <span title="Private report" style={{ marginLeft:6, opacity:0.7, fontSize:11 }}>🔒</span>}
                          </div>
                          <a href={`${window.location.origin}${window.location.pathname}?share=${tk.token}`} target="_blank" rel="noopener"
                            style={{ fontSize:11, color:T.accent, fontFamily:'monospace', textDecoration:'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>
                            {`${window.location.origin}${window.location.pathname}?share=${tk.token}`}
                          </a>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await api.del('/share_tokens/' + tk.id);
                              setShareTokens(prev => prev.filter(z => z.id !== tk.id));
                            } catch {}
                          }}
                          title="Clear this link"
                          style={{ flexShrink:0, background:'none', border:`1px solid ${T.border}`, color:T.bad, borderRadius:5, padding:'5px 9px', fontSize:12, cursor:'pointer', fontFamily:'monospace' }}>
                          Clear
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm('Clear all share links? Anyone you have sent these links to will lose access.')) return;
                      try { await api.del('/share_tokens'); setShareTokens([]); } catch {}
                    }}
                    style={{ ...S.btn('secondary'), color:T.bad }}>
                    Clear all links
                  </button>
                </>
              )}
            </>
          )}

          {tab === 'password' && (
            <>
              <form onSubmit={submitPasswordChange}>
                <label style={S.label}>Current Password</label>
                <input style={S.input} type="password" value={curPw} onChange={e => setCurPw(e.target.value)} required />
                <label style={S.label}>New Password</label>
                <input style={S.input} type="password" value={newPw} onChange={e => setNewPw(e.target.value)} minLength={8} required />
                <label style={S.label}>Confirm New Password</label>
                <input style={S.input} type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
                <button style={S.btn()} type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update Password'}</button>
              </form>
              <div style={{ textAlign:'center', marginTop:14 }}>
                <button onClick={sendResetLink} disabled={busy}
                  style={{ background:'none', border:'none', color:T.accent, cursor:'pointer', fontSize:12, textDecoration:'underline', fontFamily:'monospace' }}>
                  Or send a reset link to {user?.email}
                </button>
              </div>
            </>
          )}

          {tab === 'email' && (
            <form onSubmit={submitEmailChange}>
              <label style={S.label}>New Email Address</label>
              <input style={S.input} type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
              <label style={S.label}>Current Password (to confirm)</label>
              <input style={S.input} type="password" value={emailPw} onChange={e => setEmailPw(e.target.value)} required />
              <button style={S.btn()} type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update Email'}</button>
            </form>
          )}

          {tab === 'name' && (
            <form onSubmit={submitNameChange}>
              <label style={S.label}>Display Name</label>
              <input style={S.input} type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
              <button style={S.btn()} type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update Name'}</button>
            </form>
          )}

          {tab === 'api' && <ApiTokens theme={T} onClose={onClose} />}

          {tab === 'display' && (
            <>
              <label style={S.label}>Default list view</label>
              <div style={{ fontSize:12.5, color:T.dim, marginTop:-2, marginBottom:12, lineHeight:1.5 }}>
                Choose how each report list opens. &ldquo;Paginate&rdquo; shows a screenful at a time with page controls. &ldquo;View All&rdquo; shows every matching report in the same card grid, with no paging. Sorting works the same in both.
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:14 }}>
                <span style={{ fontSize:13, color:T.text, fontWeight:600 }}>Explore page</span>
                <select value={viewExplore} disabled={busy} onChange={e => setViewExplore(e.target.value)} style={{ ...S.input, cursor:'pointer' }}>
                  <option value="cards">Paginate</option>
                  <option value="all">View All</option>
                </select>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:16 }}>
                <span style={{ fontSize:13, color:T.text, fontWeight:600 }}>My Reports page</span>
                <select value={viewMyReports} disabled={busy} onChange={e => setViewMyReports(e.target.value)} style={{ ...S.input, cursor:'pointer' }}>
                  <option value="cards">Paginate</option>
                  <option value="all">View All</option>
                </select>
              </div>
              <button
                style={S.btn()} disabled={busy}
                onClick={async () => {
                  clearNotice(); setBusy(true);
                  try {
                    await api.post('/auth/profile', { action: 'views', viewExplore, viewMyReports });
                    notify('Default views saved');
                    onUserUpdate && onUserUpdate({ ...user, viewExplore, viewMyReports });
                  } catch (x) {
                    notify((x && x.message) || 'Failed to save', false);
                  } finally {
                    setBusy(false);
                  }
                }}>
                {busy ? 'Saving…' : 'Save view defaults'}
              </button>
            </>
          )}

          {/* Timezone -- shown under every tab's content, matching the bundle */}
          <div style={{ marginTop:6, paddingTop:16, borderTop:`1px solid ${T.border}` }}>
            <label style={S.label}>Timezone</label>
            <div style={{ fontSize:12.5, color:T.dim, marginTop:-2, marginBottom:12, lineHeight:1.5 }}>
              Dates and times across the site (report timestamps, admin logs, etc.) are shown in this timezone. Defaults to Eastern Time.
            </div>
            <select value={timezone} disabled={busy} onChange={e => setTimezone(e.target.value)} style={{ ...S.input, cursor:'pointer' }}>
              <option value="America/New_York">Eastern Time (US) — default</option>
              <option value="America/Chicago">Central Time (US)</option>
              <option value="America/Denver">Mountain Time (US)</option>
              <option value="America/Los_Angeles">Pacific Time (US)</option>
              <option value="America/Anchorage">Alaska Time</option>
              <option value="Pacific/Honolulu">Hawaii Time</option>
              <option value="UTC">UTC</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris / Berlin / Madrid</option>
              <option value="Asia/Kolkata">India</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Australia/Sydney">Sydney</option>
            </select>
            <button
              style={{ ...S.btn(), marginTop:4 }} disabled={busy}
              onClick={async () => {
                clearNotice(); setBusy(true);
                try {
                  await api.post('/auth/profile', { action: 'timezone', timezone });
                  setTZ(timezone);
                  notify('Timezone saved');
                  onUserUpdate && onUserUpdate({ ...user, timezone });
                } catch (x) {
                  notify((x && x.message) || 'Failed to save', false);
                } finally {
                  setBusy(false);
                }
              }}>
              {busy ? 'Saving…' : 'Save timezone'}
            </button>
          </div>

          {tab === 'privacy' && (
            <>
              <label style={S.label}>Explore visibility</label>
              <label style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer', padding:'4px 0' }}>
                <input type="checkbox" checked={reportsDefaultPrivate} disabled={busy}
                  onChange={e => saveReportsDefaultPrivate(e.target.checked)}
                  style={{ accentColor:T.accent, width:16, height:16, marginTop:2, flexShrink:0 }} />
                <span style={{ fontSize:13.5, color:T.text, lineHeight:1.5 }}>
                  Exclude my new reports from Explore by default
                  <div style={{ fontSize:12, color:T.dim, marginTop:4 }}>
                    New uploads stay private and unlisted. You can still make any individual report public from its page, and existing reports are left unchanged.
                  </div>
                </span>
              </label>

              <div style={{ height:1, background:T.border, margin:'18px 0 4px' }} />

              <label style={S.label}>Your data</label>
              <div style={{ fontSize:12.5, color:T.dim, lineHeight:1.5, marginBottom:10 }}>
                Download everything we hold about your account, or permanently delete your account.
              </div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <button
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true); clearNotice();
                    try {
                      const dt = await api.get('/account/export');
                      const blob = new Blob([JSON.stringify(dt, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'hcri-my-data.json';
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                      notify('Your data has been downloaded.');
                    } catch {
                      notify('Could not export your data. Please try again.', false);
                    } finally {
                      setBusy(false);
                    }
                  }}
                  style={{ background:'none', border:`1px solid ${T.accent}66`, color:T.accent, borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:700, fontFamily:'monospace', cursor:'pointer' }}>
                  ⬇ Export my data
                </button>
                <button
                  disabled={busy}
                  onClick={() => { clearNotice(); setDelOpen(v => !v); }}
                  style={{ background:'none', border:`1px solid ${T.bad}66`, color:T.bad, borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:700, fontFamily:'monospace', cursor:'pointer' }}>
                  Delete my account
                </button>
              </div>

              {delOpen && (
                <div style={{ border:`1px solid ${T.bad}55`, background:`${T.bad}0d`, borderRadius:10, padding:'12px 14px', marginTop:10, display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ fontSize:13, color:T.text, fontWeight:800 }}>This permanently deletes your account.</div>
                  <div style={{ fontSize:12.5, color:T.dim, lineHeight:1.5 }}>
                    Your private reports and personal data are erased and this cannot be undone. Enter your password to confirm.
                  </div>
                  <label style={{ display:'flex', alignItems:'flex-start', gap:8, cursor:'pointer', fontSize:12.5, color:T.text, lineHeight:1.4 }}>
                    <input type="checkbox" checked={delKeep} onChange={e => setDelKeep(e.target.checked)}
                      style={{ accentColor:T.accent, width:15, height:15, marginTop:2, flexShrink:0 }} />
                    Keep my public reports in Explore with my name removed (recommended). Uncheck to delete them too.
                  </label>
                  <input type="password" value={delPw} onChange={e => setDelPw(e.target.value)} placeholder="Your password" autoComplete="current-password"
                    style={{ padding:'9px 11px', borderRadius:8, border:`1px solid ${T.border}`, background:T.surface, color:T.text, fontSize:14, fontFamily:'monospace' }} />
                  <div style={{ display:'flex', gap:8 }}>
                    <button
                      disabled={busy}
                      onClick={async () => {
                        if (!delPw) { notify('Enter your password to confirm.', false); return; }
                        setBusy(true); clearNotice();
                        try {
                          await api.post('/account/delete', { password: delPw, keepPublicReports: delKeep });
                          try { localStorage.removeItem('spd_token'); } catch {}
                          window.location.href = '/';
                        } catch (err) {
                          notify((err && err.message) || 'Could not delete account. Check your password and try again.', false);
                          setBusy(false);
                        }
                      }}
                      style={{ background:T.bad, border:'none', color:T.bg, borderRadius:8, padding:'9px 14px', fontSize:13, fontWeight:800, fontFamily:'monospace', cursor:'pointer' }}>
                      {busy ? 'Deleting…' : 'Permanently delete'}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => { setDelOpen(false); setDelPw(''); }}
                      style={{ background:'none', border:`1px solid ${T.border}`, color:T.dim, borderRadius:8, padding:'9px 14px', fontSize:13, fontWeight:700, fontFamily:'monospace', cursor:'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div style={{ marginTop:14, fontSize:12, color:T.dim }}>
                <a href="/privacy" target="_blank" rel="opener" style={{ color:T.accent, textDecoration:'none' }}>Privacy Policy</a>
                {' · '}
                <a href="/terms" target="_blank" rel="opener" style={{ color:T.accent, textDecoration:'none' }}>Terms</a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
