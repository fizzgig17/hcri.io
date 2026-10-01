// frontend/src/components/AdminPanel.jsx
//
// Reconstructed from the deployed assets/app.js (minified functions
// ke/Ae/je). The full-screen admin modal: a user list sidebar + a detail
// pane for the selected user (their saved reports, admin/super-admin
// toggles, disable/enable, name-masking, a global or per-user metrics
// "Recalc" action, and delete with confirmation), plus header-level admin
// tools (category management, site notices, featured reports) and an
// "Add User" form.
//
// `isFizz` gates the Super Admin toggle to one specific account
// (fizzgig@hcri.io / name "fizzgig") -- preserved exactly as found; this is
// presumably hcri.io's own site-owner account, hardcoded rather than
// driven by a role column.
//
// Backend: everything here goes through /api/admin/* (api/admin.php),
// fetched with adminFetch() below, which always sends the bearer token and
// expects JSON.
//
// Dependencies reconstructed by OTHER batches, already landed and wired up
// here by their real names/paths:
//   AdminCats, AdminNotices   -> category & site-notice admin tools (own files)
//   AdminFeatured             -> frontend/src/components/AdminFeatured.jsx
//   Me (minified)             -> AdminReportModal.jsx (default export): the
//                                modal opened from a user's report row,
//                                showing AdminReportEdit + the full report
//   je (minified, this file's AddUserModal) -> already landed as its own
//                                file, CreateUserModal.jsx -- used here
//                                instead of duplicating it locally.

import { useState, useEffect } from 'react';
import { basePath, getToken } from '../lib/api';
import { fmtTZ } from '../lib/tz';
import { useTheme } from '../lib/ThemeContext.jsx';
import { useIsMobile } from '../hooks/useIsMobile';
import AdminFeatured from './AdminFeatured.jsx';
import AdminNotices from './AdminNotices.jsx';
import AdminCats from './AdminCats.jsx';
import AdminReportModal from './AdminReportModal.jsx';
import CreateUserModal from './CreateUserModal.jsx';

// Thin fetch wrapper for every /api/admin/* call: always sends the bearer
// token + JSON content-type, and throws with the server's error message on
// a non-2xx response.
export function adminFetch(path, opts = {}) {
  return fetch(`${basePath()}index.php/api/admin${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(opts.headers || {}),
    },
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
  });
}

// ── AdminPanel (Ae) ───────────────────────────────────────────────────────
export default function AdminPanel({ onClose, me }) {
  const isFizz = !!(me && ((me.email || '').toLowerCase() === 'fizzgig@hcri.io' || (me.name || '').toLowerCase() === 'fizzgig'));
  const { theme: t } = useTheme();
  const isMobile = useIsMobile(768);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [recalc, setRecalc] = useState(null); // null | 'running' | {done,failed,total,errors}
  const [quickView, setQuickView] = useState(null);

  const S = {
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 3000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: isMobile ? 0 : 16, overflowY: 'scroll', WebkitOverflowScrolling: 'touch',
    },
    panel: {
      background: t.surface, border: `1px solid ${t.border}`, borderRadius: isMobile ? 0 : 12,
      width: '100%', maxWidth: isMobile ? '100%' : 960, height: 'auto', maxHeight: isMobile ? 'none' : '92vh',
      display: 'flex', flexDirection: 'column', overflow: isMobile ? 'visible' : 'hidden',
    },
    head: { padding: isMobile ? '12px 14px' : '16px 20px', borderBottom: `1px solid ${t.border}`, background: t.surface2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
    body: { display: 'flex', flex: isMobile ? 'none' : 1, overflow: isMobile ? 'visible' : 'hidden', flexDirection: isMobile ? 'column' : 'row', minHeight: 0 },
    sidebar: { width: isMobile ? '100%' : 320, flexShrink: 0, borderRight: isMobile ? 'none' : `1px solid ${t.border}`, borderBottom: isMobile ? `1px solid ${t.border}` : 'none', display: 'flex', flexDirection: 'column', overflow: isMobile ? 'visible' : 'hidden', maxHeight: isMobile ? 'auto' : 'none' },
    main: { flex: 1, overflowY: 'auto', padding: 20, minHeight: 0 },
    btn: (color = 'accent') => ({ background: `${t[color]}18`, border: `1px solid ${t[color]}50`, color: t[color], borderRadius: 5, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 600 }),
    input: { background: t.bg, border: `1px solid ${t.border}`, borderRadius: 5, padding: '7px 10px', color: t.text, fontSize: 13, outline: 'none', fontFamily: 'monospace', width: '100%' },
    label: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: t.dim, fontWeight: 700, display: 'block', marginBottom: 4 },
    th: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: t.dim, padding: '6px 10px', textAlign: 'left', fontWeight: 700, borderBottom: `1px solid ${t.border}` },
    td: { fontSize: 13, color: t.text, padding: '8px 10px', borderBottom: `1px solid ${t.border}40`, verticalAlign: 'middle' },
  };

  function notify(msg, type = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    Promise.all([adminFetch(''), adminFetch('/users')])
      .then(([statsRes, usersRes]) => { setStats(statsRes); setUsers(usersRes); })
      .catch((e) => { notify(e.message, 'err'); console.error('Admin load error:', e); })
      .finally(() => setLoading(false));
  }, []);

  async function openQuickView(id) {
    try {
      const t2 = await adminFetch(`/reports/${id}`);
      setQuickView({
        ...t2,
        createdAt: t2.createdAt || new Date().toISOString(),
        rfBins: t2.rfBins || Array(16).fill(t2.Rf || 75),
        shareToken: t2.shareToken || null,
        model: t2.model || null,
        manufacturer: t2.manufacturer || null,
        ledDetails: t2.ledDetails || null,
        notes: t2.notes || null,
        ra: t2.ra ?? null,
        r9: t2.r9 ?? null,
        instrumentModel: t2.instrumentModel || null,
        instrumentVersion: t2.instrumentVersion || null,
        rawHeaders: t2.rawHeaders || null,
      });
    } catch (e) { notify(e.message, 'err'); }
  }

  async function recalcAll() {
    setRecalc('running');
    try {
      setRecalc(await adminFetch('/recalc', { method: 'POST', body: JSON.stringify({}) }));
      setUsers(await adminFetch('/users'));
      if (selectedUser) setUserReports(await adminFetch(`/users/${selectedUser.id}/reports`));
    } catch (e) {
      setRecalc({ done: 0, failed: 0, total: 0, errors: [e.message] });
    }
  }

  async function recalcUser(userId) {
    setRecalc('running');
    try {
      setRecalc(await adminFetch('/recalc', { method: 'POST', body: JSON.stringify({ userId }) }));
      if (selectedUser?.id === userId) setUserReports(await adminFetch(`/users/${userId}/reports`));
    } catch (e) {
      setRecalc({ done: 0, failed: 0, total: 0, errors: [e.message] });
    }
  }

  async function selectUser(u) {
    setSelectedUser(u);
    setReportsLoading(true);
    try {
      setUserReports(await adminFetch(`/users/${u.id}/reports`));
    } catch (e) {
      notify(e.message, 'err');
    } finally {
      setReportsLoading(false);
    }
  }

  async function deleteUser(id) {
    try {
      await adminFetch(`/users/${id}`, { method: 'DELETE' });
      setUsers((u) => u.filter((x) => x.id !== id));
      if (selectedUser?.id === id) { setSelectedUser(null); setUserReports([]); }
      notify('User deleted');
    } catch (e) { notify(e.message, 'err'); }
    setConfirmDelete(null);
  }

  async function deleteReport(userId, reportId) {
    try {
      await adminFetch(`/users/${userId}/reports/${reportId}`, { method: 'DELETE' });
      setUserReports((r) => r.filter((x) => x.id !== reportId));
      setUsers((u) => u.map((x) => (x.id === userId ? { ...x, reportCount: x.reportCount - 1 } : x)));
      notify('Report deleted');
    } catch (e) { notify(e.message, 'err'); }
    setConfirmDelete(null);
  }

  async function toggleAdmin(u) {
    try {
      await adminFetch(`/users/${u.id}`, { method: 'PATCH', body: JSON.stringify({ isAdmin: !u.isAdmin }) });
      setUsers((arr) => arr.map((x) => (x.id === u.id ? { ...x, isAdmin: !u.isAdmin } : x)));
      if (selectedUser?.id === u.id) setSelectedUser((x) => ({ ...x, isAdmin: !x.isAdmin }));
      notify(u.isAdmin ? 'Admin removed' : 'Admin granted');
    } catch (e) { notify(e.message, 'err'); }
  }

  async function toggleSuperAdmin(u) {
    try {
      await adminFetch(`/users/${u.id}`, { method: 'PATCH', body: JSON.stringify({ isSuperAdmin: !u.isSuper }) });
      setUsers((arr) => arr.map((x) => (x.id === u.id ? { ...x, isSuper: !u.isSuper } : x)));
      if (selectedUser?.id === u.id) setSelectedUser((x) => ({ ...x, isSuper: !x.isSuper }));
      notify(u.isSuper ? 'Super admin revoked' : 'Super admin granted');
    } catch (e) { notify(e.message, 'err'); }
  }

  async function toggleDisabled(u) {
    const nv = !u.disabled;
    setSelectedUser({ ...u, disabled: nv });
    setUsers((arr) => arr.map((x) => (x.id === u.id ? { ...x, disabled: nv } : x)));
    notify(nv ? 'Account disabled' : 'Account enabled');
    try {
      await adminFetch(`/users/${u.id}`, { method: 'PATCH', body: JSON.stringify({ disabled: nv }) });
    } catch (e) {
      setSelectedUser({ ...u, disabled: !nv });
      setUsers((arr) => arr.map((x) => (x.id === u.id ? { ...x, disabled: !nv } : x)));
      notify(e.message, 'err');
    }
  }

  async function toggleNameMasked(u) {
    const nv = !u.nameMasked;
    setSelectedUser({ ...u, nameMasked: nv });
    setUsers((arr) => arr.map((x) => (x.id === u.id ? { ...x, nameMasked: nv } : x)));
    notify(nv ? 'Name hidden' : 'Name shown');
    try {
      await adminFetch(`/users/${u.id}`, { method: 'PATCH', body: JSON.stringify({ nameMasked: nv }) });
    } catch (e) {
      setSelectedUser({ ...u, nameMasked: !nv });
      setUsers((arr) => arr.map((x) => (x.id === u.id ? { ...x, nameMasked: !nv } : x)));
      notify(e.message, 'err');
    }
  }

  const u = selectedUser;

  return (
    <div style={S.overlay}>
      <div style={S.panel}>
        <div style={S.head}>
          <div style={{ fontWeight: 900, fontSize: 16, color: t.white, fontFamily: 'monospace' }}>
            Admin Panel
            {stats && (
              <span style={{ fontSize: 12, color: t.dim, fontWeight: 400, marginLeft: 14 }}>
                {stats.users} users · {stats.reports} reports
              </span>
            )}
          </div>
          <AdminCats theme={t} />
          <AdminNotices theme={t} />
          <AdminFeatured theme={t} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.dim, fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={S.body}>
          <div style={S.sidebar}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: t.dim, fontWeight: 700 }}>Users</span>
              <button onClick={() => setAddUserOpen(true)} style={S.btn('accent')}>+ Add User</button>
              <button onClick={recalcAll} disabled={recalc === 'running'} style={{ ...S.btn('warn'), opacity: recalc === 'running' ? 0.5 : 1 }} title="Recompute all metrics (Rf, Rg, Ra, R9, bins) from stored SPD data">
                {recalc === 'running' ? '⟳ Recalculating…' : '⟳ Recalc All'}
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: 20, color: t.dim, fontSize: 13, textAlign: 'center' }}>Loading…</div>
              ) : (
                users.map((usr) => (
                  <div
                    key={usr.id}
                    onClick={() => selectUser(usr)}
                    style={{
                      padding: '10px 14px', cursor: 'pointer',
                      borderLeft: `3px solid ${u?.id === usr.id ? t.accent : 'transparent'}`,
                      background: u?.id === usr.id ? `${t.accent}10` : 'transparent',
                      borderBottom: `1px solid ${t.border}40`, display: 'flex', flexDirection: 'column', gap: 3,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: t.white, fontWeight: 600, fontFamily: 'monospace' }}>{usr.name}</span>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {usr.isSuper && (
                          <span style={{ fontSize: 9, background: `${t.good}20`, color: t.good, border: `1px solid ${t.good}40`, borderRadius: 3, padding: '1px 5px', fontWeight: 700, letterSpacing: 0.5 }}>SUPER</span>
                        )}
                        {usr.isAdmin && (
                          <span style={{ fontSize: 9, background: `${t.accent}20`, color: t.accent, border: `1px solid ${t.accent}40`, borderRadius: 3, padding: '1px 5px', fontWeight: 700, letterSpacing: 0.5 }}>ADMIN</span>
                        )}
                        <span style={{ fontSize: 11, color: t.dim }}>{usr.reportCount} rpt{usr.reportCount === 1 ? '' : 's'}</span>
                        {usr.apiReportCount > 0 && <span style={{ fontSize: 11, color: t.accent }}>{usr.apiReportCount} via API</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: t.dim }}>{usr.email}</span>
                    <span style={{ fontSize: 10, color: `${t.dim}80` }}>{fmtTZ(usr.createdAt.replace(' ', 'T'), undefined, true)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={S.main}>
            {u ? (
              <>
                <div style={{ background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 8, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: t.white, fontFamily: 'monospace', marginBottom: 4 }}>
                        {u.name}
                        {u.disabled && (
                          <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: t.bad, border: `1px solid ${t.bad}`, borderRadius: 4, padding: '1px 6px', verticalAlign: 'middle' }}>
                            DISABLED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: t.dim }}>{u.email}</div>
                      <div style={{ fontSize: 12, color: `${t.dim}80`, marginTop: 2 }}>
                        Joined {fmtTZ(u.createdAt.replace(' ', 'T'), undefined, true)} · {u.reportCount} saved report{u.reportCount === 1 ? '' : 's'}
                        {u.apiReportCount > 0 ? ` (${u.apiReportCount} via API)` : ''}
                      </div>
                      <div style={{ fontSize: 12, color: `${t.dim}80`, marginTop: 2 }}>
                        Last login: {u.lastLoginAt ? fmtTZ(u.lastLoginAt.replace(' ', 'T')) : 'never'}  ·  Last active: {u.lastActiveAt ? fmtTZ(u.lastActiveAt.replace(' ', 'T')) : 'never'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button onClick={() => toggleAdmin(u)} style={S.btn(u.isAdmin ? 'warn' : 'accent')}>
                        {u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                      {isFizz && (
                        <button onClick={() => toggleSuperAdmin(u)} style={S.btn(u.isSuper ? 'warn' : 'good')}>
                          {u.isSuper ? 'Revoke Super' : 'Make Super'}
                        </button>
                      )}
                      <button onClick={() => recalcUser(u.id)} disabled={recalc === 'running'} style={{ ...S.btn('accent'), opacity: recalc === 'running' ? 0.5 : 1 }} title="Recompute metrics for this user's reports">
                        ⟳ Recalc
                      </button>
                      <button onClick={() => toggleDisabled(u)} style={S.btn(u.disabled ? 'accent' : 'warn')}>
                        {u.disabled ? 'Enable' : 'Disable'}
                      </button>
                      <button onClick={() => toggleNameMasked(u)} style={S.btn('accent')}>
                        {u.nameMasked ? 'Unhide' : 'Hide'}
                      </button>
                      <button onClick={() => setConfirmDelete({ type: 'user', id: u.id, label: u.name })} style={S.btn('bad')}>
                        Delete User
                      </button>
                    </div>
                  </div>
                </div>

                {recalc && recalc !== 'running' && (
                  <div style={{
                    background: recalc.failed > 0 ? `${t.warn}18` : `${t.good}18`,
                    border: `1px solid ${recalc.failed > 0 ? t.warn + '60' : t.good + '60'}`,
                    borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: 12, fontFamily: 'monospace',
                    color: recalc.failed > 0 ? t.warn : t.good, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span>
                      ✓ Recalculated {recalc.done}/{recalc.total} reports{recalc.failed > 0 ? ` · ${recalc.failed} failed` : ''}
                    </span>
                    <button onClick={() => setRecalc(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 14 }}>✕</button>
                  </div>
                )}

                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: t.dim, fontWeight: 700, marginBottom: 10 }}>
                  Saved Reports ({userReports.length})
                </div>
                {reportsLoading ? (
                  <div style={{ color: t.dim, fontSize: 13 }}>Loading reports…</div>
                ) : userReports.length === 0 ? (
                  <div style={{ color: t.dim, fontSize: 13, fontStyle: 'italic' }}>No saved reports</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        {['Label', 'CCT', 'Rf', 'Rg', 'Date', ''].map((h) => <th key={h} style={S.th}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {userReports.map((rep) => (
                        <tr
                          key={rep.id}
                          onClick={() => openQuickView(rep.id)}
                          style={{ cursor: 'pointer', transition: 'background .1s' }}
                          onMouseEnter={(ev) => (ev.currentTarget.style.background = `${t.accent}10`)}
                          onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                        >
                          <td style={S.td}>
                            <div style={{ fontWeight: 600, color: t.white }}>{rep.label}</div>
                            {rep.instrumentModel && (
                              <div style={{ fontSize: 11, color: t.dim, opacity: 0.7 }}>
                                {rep.instrumentModel}{rep.instrumentVersion ? ` v${rep.instrumentVersion}` : ''}
                              </div>
                            )}
                          </td>
                          <td style={S.td}>{rep.cct ? rep.cct + 'K' : '—'}</td>
                          <td style={{ ...S.td, color: rep.Rf >= 85 ? t.good : rep.Rf >= 70 ? t.warn : t.bad, fontWeight: 700 }}>{rep.Rf ?? '—'}</td>
                          <td style={S.td}>{rep.Rg ?? '—'}</td>
                          <td style={{ ...S.td, color: t.dim, fontSize: 11 }}>
                            {fmtTZ(rep.createdAt.replace(' ', 'T'), { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </td>
                          <td style={S.td} onClick={(ev) => ev.stopPropagation()}>
                            <button onClick={() => setConfirmDelete({ type: 'report', id: rep.id, userId: u.id, label: rep.label })} style={S.btn('bad')}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.dim, fontSize: 13, fontFamily: 'monospace', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 32, opacity: 0.15 }}>👤</div>
                <div>Select a user to view details</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {addUserOpen && (
        <CreateUserModal
          T={t}
          S={S}
          onClose={() => setAddUserOpen(false)}
          onCreated={(usr) => { setUsers((arr) => [usr, ...arr]); setAddUserOpen(false); notify('User created'); }}
        />
      )}

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: t.surface, border: `1px solid ${t.bad}60`, borderRadius: 10, padding: 24, maxWidth: 380, width: '100%', margin: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: t.white, marginBottom: 8, fontFamily: 'monospace' }}>Confirm Delete</div>
            <div style={{ fontSize: 13, color: t.text, marginBottom: 20, lineHeight: 1.6 }}>
              {confirmDelete.type === 'user' ? (
                <>Delete user <strong>{confirmDelete.label}</strong>? This will also delete all their saved reports. This cannot be undone.</>
              ) : (
                <>Delete report "<strong>{confirmDelete.label}</strong>"? This cannot be undone.</>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={S.btn('accent')}>Cancel</button>
              <button
                onClick={() => (confirmDelete.type === 'user' ? deleteUser(confirmDelete.id) : deleteReport(confirmDelete.userId, confirmDelete.id))}
                style={{ ...S.btn('bad'), background: `${t.bad}25` }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {quickView && <AdminReportModal report={quickView} T={t} onClose={() => setQuickView(null)} />}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: t.surface2,
          border: `1px solid ${toast.type === 'err' ? t.bad + '60' : t.good + '60'}`, color: toast.type === 'err' ? t.bad : t.good,
          borderRadius: 6, padding: '10px 18px', fontSize: 13, zIndex: 5000, fontFamily: 'monospace', fontWeight: 600,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
