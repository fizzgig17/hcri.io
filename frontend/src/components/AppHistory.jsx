// frontend/src/components/AppHistory.jsx
//
// "App history": the readings and flickers a person's hCRI Companion app has backed up to their account
// (private -- never shown on a public page). Used in two places:
//   - Account settings, "App history" tab:  <AppHistory theme={T} />                (the signed-in person's own)
//   - Admin panel, a user's detail panel:   <AppHistory theme={t} userId={u.id} />  (any user's, admins only)
// Backend: GET /api/account/app_history and GET /api/admin/users/:id/app_history (api/_core/companion_backup.php).
// The list is newest first and loads 50 at a time; a reading's spectrum is fetched only when its row is opened.

import { useState, useEffect, useMemo, useCallback } from 'react';
import { basePath, getToken } from '../lib/api';
import { fmtTZ } from '../lib/tz';

const PAGE = 50;

function Spectrum({ points, o }) {
  if (!points || points.length < 2) return null;
  const w = 520, h = 110, pad = 6;
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y1 = Math.max(...ys) || 1;
  const px = (x) => pad + ((x - x0) / (x1 - x0 || 1)) * (w - 2 * pad);
  const py = (y) => h - pad - (Math.max(0, y) / y1) * (h - 2 * pad);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${px(p[0]).toFixed(1)},${py(p[1]).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', maxWidth: 520, height: 'auto', background: o.bg, border: `1px solid ${o.border}`, borderRadius: 6 }}>
      <path d={d} fill="none" stroke={o.good} strokeWidth="1.6" />
      <text x={pad} y={h - 1} fontSize="9" fill={o.dim}>{Math.round(x0)} nm</text>
      <text x={w - pad} y={h - 1} fontSize="9" fill={o.dim} textAnchor="end">{Math.round(x1)} nm</text>
    </svg>
  );
}

const fmt = (v, d = 0) => (v === null || v === undefined || Number.isNaN(v) ? '–' : Number(v).toFixed(d));

export default function AppHistory({ theme: o, userId = null }) {
  const canDelete = !userId;   // only people can delete their own history; admins just view
  const [items, setItems] = useState([]);
  const [next, setNext] = useState(null);
  const [total, setTotal] = useState(0);
  const [maxPer, setMaxPer] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);        // id of the expanded row
  const [spectra, setSpectra] = useState({});    // id -> points

  const base = userId
    ? `${basePath()}index.php/api/admin/users/${userId}/app_history`
    : `${basePath()}index.php/api/account/app_history`;
  const headers = { Authorization: `Bearer ${getToken()}` };

  const load = useCallback((after) => {
    setLoading(true); setErr('');
    const url = `${base}?limit=${PAGE}${after ? `&after=${encodeURIComponent(after)}` : ''}`;
    fetch(url, { headers })
      .then((r) => r.json())
      .then((d) => {
        if (!Array.isArray(d.items)) { setErr(d.error || 'Could not load'); return; }
        setItems((cur) => (after ? [...cur, ...d.items] : d.items));
        setNext(d.next || null); setTotal(d.total || 0); if (d.maxPerUser) setMaxPer(d.maxPerUser);
      })
      .catch(() => setErr('Could not load'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  useEffect(() => { setItems([]); setNext(null); setOpen(null); setSpectra({}); load(null); }, [load]);

  const toggle = (it) => {
    const id = it.id;
    setOpen((cur) => (cur === id ? null : id));
    if (it.hasSpectrum && !spectra[id]) {
      fetch(`${base}?spectrum=${encodeURIComponent(id)}`, { headers })
        .then((r) => r.json())
        .then((d) => { if (Array.isArray(d.spectrum)) setSpectra((s) => ({ ...s, [id]: d.spectrum })); })
        .catch(() => {});
    }
  };

  const remove = (it) => {
    if (!window.confirm(`Delete “${it.label || 'this item'}” from your backed-up history? This removes it from hCRI.io only; reports you uploaded are not affected. This cannot be undone.`)) return;
    fetch(`${base}/${encodeURIComponent(it.id)}`, { method: 'DELETE', headers })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setErr(d.error); return; }
        setItems((cur) => cur.filter((x) => x.id !== it.id));
        setTotal((n) => Math.max(0, n - 1));
        setOpen(null);
      })
      .catch(() => setErr('Could not delete'));
  };

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) =>
      [it.label, it.device, ...(it.leds || []), ...Object.values(it.categories || {})].join(' ').toLowerCase().includes(s));
  }, [items, q]);

  const chip = { display: 'inline-block', border: `1px solid ${o.border}`, borderRadius: 10, padding: '1px 8px', fontSize: 11, color: o.dim, marginRight: 6 };
  const kv = { fontSize: 12, color: o.dim };

  return (
    <div style={{ fontFamily: 'monospace', color: o.text }}>
      <div style={{ fontSize: 12, color: o.dim, marginBottom: 10, lineHeight: 1.5 }}>
        {userId ? 'This user’s' : 'Your'} hCRI Companion history, as backed up to {userId ? 'their' : 'your'} account: <b style={{ color: o.text }}>{total}</b> item{total === 1 ? '' : 's'} (the account keeps up to {maxPer.toLocaleString()}).
        The app itself shows only its latest 100 readings, but backed-up readings stay here after they scroll off the app.
        {!userId && ' Only you can see this page, and only you can delete items from it: the Companion app can never remove anything stored here.'}
      </div>
      <input
        value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter loaded items by name, device, LED or category"
        style={{ width: '100%', boxSizing: 'border-box', background: o.bg, border: `1px solid ${o.border}`, borderRadius: 6, padding: '7px 10px', color: o.text, fontSize: 13, fontFamily: 'monospace', marginBottom: 10 }}
      />
      {err && <div style={{ color: o.bad, fontSize: 12, marginBottom: 8 }}>{err}</div>}
      {!loading && !err && items.length === 0 && (
        <div style={{ color: o.dim, fontSize: 13, fontStyle: 'italic' }}>
          Nothing backed up yet. In the Companion app, turn on cloud backup (Settings) while signed in with an API token.
        </div>
      )}
      <div style={{ border: items.length ? `1px solid ${o.border}` : 'none', borderRadius: 8, overflow: 'hidden' }}>
        {shown.map((it) => {
          const isOpen = open === it.id;
          return (
            <div key={it.id} style={{ borderBottom: `1px solid ${o.border}` }}>
              <div onClick={() => toggle(it)} style={{ display: 'flex', gap: 10, alignItems: 'baseline', padding: '8px 10px', cursor: 'pointer', background: isOpen ? `${o.border}55` : 'transparent', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: o.dim, minWidth: 128 }}>{fmtTZ(it.savedAt, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                <span style={{ fontSize: 13, color: o.white, flex: '1 1 160px', minWidth: 120, wordBreak: 'break-word' }}>
                  {it.kind === 'flicker' && <span style={chip}>flicker</span>}{it.label || '(unnamed)'}
                </span>
                {it.kind === 'reading' ? (
                  <span style={{ fontSize: 12 }}>
                    {fmt(it.cct)} K · Duv {fmt(it.duv, 4)} · Ra {fmt(it.ra)} · R9 {fmt(it.r9)}
                  </span>
                ) : (
                  <span style={{ fontSize: 12 }}>{fmt(it.flicker?.hz, 1)} Hz · {fmt(it.flicker?.percent, 1)}%</span>
                )}
                <span style={{ fontSize: 11, color: o.dim }}>{isOpen ? '▾' : '▸'}</span>
              </div>
              {isOpen && (
                <div style={{ padding: '6px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {it.device && <div style={kv}>Meter: <span style={{ color: o.text }}>{it.device}</span></div>}
                  {it.kind === 'reading' && (
                    <div style={kv}>
                      {fmt(it.lux, 1) !== '–' && <>Lux {fmt(it.lux, 1)} · </>}
                      {it.rf != null && <>Rf {fmt(it.rf)} · Rg {fmt(it.rg)} · </>}
                      <span title="Report id on hCRI.io">{it.reportId ? `Uploaded as report #${it.reportId}${it.reportIsPublic === false ? ' (private)' : ''}` : 'Not uploaded as a report'}</span>
                    </div>
                  )}
                  {it.flicker && it.kind === 'reading' && <div style={kv}>Flicker: {fmt(it.flicker.hz, 1)} Hz · {fmt(it.flicker.percent, 1)}% · index {fmt(it.flicker.index, 3)}</div>}
                  {it.rIndices?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {it.rIndices.map((v, i) => <span key={i} style={{ ...chip, marginRight: 0 }}>R{i + 1} {fmt(v)}</span>)}
                    </div>
                  )}
                  {it.leds?.length > 0 && <div style={kv}>LED: <span style={{ color: o.text }}>{it.leds.join(' · ')}</span></div>}
                  {it.categories && Object.keys(it.categories).length > 0 && (
                    <div style={kv}>{Object.entries(it.categories).map(([k, v]) => `${k.replace('_', ' ')}: ${v}`).join(' · ')}</div>
                  )}
                  {canDelete && (
                    <div>
                      <button onClick={() => remove(it)} style={{ background: 'none', border: `1px solid ${o.bad}`, color: o.bad, borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>Delete from my history</button>
                    </div>
                  )}
                  {it.hasSpectrum && (spectra[it.id] ? <Spectrum points={spectra[it.id]} o={o} /> : <div style={kv}>Loading spectrum…</div>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {next && (
        <button onClick={() => load(next)} disabled={loading} style={{ marginTop: 10, background: 'none', border: `1px solid ${o.border}`, color: o.dim, borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
          {loading ? 'Loading…' : `Load more (${items.length} of ${total})`}
        </button>
      )}
      {!next && loading && <div style={{ color: o.dim, fontSize: 12, marginTop: 8 }}>Loading…</div>}
    </div>
  );
}
