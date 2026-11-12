// frontend/src/components/AdminApiLog.jsx
//
// Admin-only toolbar button ("API Log") that opens a modal listing the latest API requests made by
// signed-in accounts: user, date, time, URL (plus method and HTTP status). Backend: GET /api/admin/api_log
// (api/admin.php, table written by api/_core/api_log.php). Newest first, 1000 entries at most.

import { createPortal } from 'react-dom';
import { useState, useEffect, useMemo } from 'react';
import { basePath, getToken } from '../lib/api';
import { fmtTZ } from '../lib/tz';
import usePanelBackClose from '../hooks/usePanelBackClose';
import { useIsMobile } from '../hooks/useIsMobile';

export default function AdminApiLog({ theme: o }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  usePanelBackClose(open, () => setOpen(false));
  const isMobile = useIsMobile(768);

  const load = () => {
    setLoading(true); setErr('');
    fetch(`${basePath()}index.php/api/admin/api_log`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json())
      .then((d) => { setRows(Array.isArray(d.entries) ? d.entries : []); if (!Array.isArray(d.entries)) setErr(d.error || 'Could not load'); })
      .catch(() => setErr('Could not load'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { if (open) load(); }, [open]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => r.user.toLowerCase().includes(s) || r.url.toLowerCase().includes(s) || r.email.toLowerCase().includes(s));
  }, [rows, q]);

  const th = { textAlign: 'left', padding: '6px 8px', color: o.dim, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, position: 'sticky', top: 0, background: o.surface, borderBottom: `1px solid ${o.border}` };
  const td = { padding: '5px 8px', borderBottom: `1px solid ${o.border}`, fontSize: 12, verticalAlign: 'top' };
  const statusColor = (s) => (s >= 500 ? o.bad : s >= 400 ? '#e0a030' : o.good);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ background: 'none', border: `1px solid ${o.border}`, color: o.dim, borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', marginLeft: 8 }}
      >
        API Log
      </button>
      {open && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, background: isMobile ? o.bg : 'rgba(0,0,0,0.7)', zIndex: 3500, display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 20 }}
          onClick={() => { if (!isMobile) setOpen(false); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: o.surface, border: isMobile ? 'none' : `1px solid ${o.border}`, borderRadius: isMobile ? 0 : 12, padding: isMobile ? '14px 12px' : 20, width: '100%', maxWidth: isMobile ? '100%' : 1000, height: isMobile ? '100%' : '85vh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'monospace' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: o.white }}>
                API Log <span style={{ fontSize: 12, color: o.dim, fontWeight: 400 }}>latest {rows.length} requests by signed-in accounts</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={load} disabled={loading} style={{ background: 'none', border: `1px solid ${o.border}`, color: o.dim, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>{loading ? '…' : 'Refresh'}</button>
                <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: o.dim, fontSize: 20, cursor: 'pointer' }}>✕</button>
              </div>
            </div>
            <input
              value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by user or URL"
              style={{ background: o.bg, border: `1px solid ${o.border}`, borderRadius: 6, padding: '7px 10px', color: o.text, fontSize: 13, fontFamily: 'monospace' }}
            />
            {err && <div style={{ color: o.bad, fontSize: 12 }}>{err}</div>}
            <div style={{ overflow: 'auto', flex: 1, border: `1px solid ${o.border}`, borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: o.text }}>
                <thead>
                  <tr><th style={th}>User</th><th style={th}>Date</th><th style={th}>Time</th><th style={th}>URL</th></tr>
                </thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.id}>
                      <td style={{ ...td, whiteSpace: 'nowrap' }} title={r.email}>{r.user}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap', color: o.dim }}>{fmtTZ(r.ts * 1000, { year: 'numeric', month: 'short', day: 'numeric' }, true)}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap', color: o.dim }}>{fmtTZ(r.ts * 1000, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</td>
                      <td style={{ ...td, wordBreak: 'break-all' }}>
                        <span style={{ color: o.dim }}>{r.method}</span> {r.url}{' '}
                        <span style={{ color: statusColor(r.status) }}>{r.status || ''}</span>
                      </td>
                    </tr>
                  ))}
                  {!shown.length && !loading && (
                    <tr><td style={{ ...td, color: o.dim }} colSpan={4}>No requests logged yet. Requests are recorded from now on.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}
