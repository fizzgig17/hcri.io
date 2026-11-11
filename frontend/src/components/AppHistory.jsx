// frontend/src/components/AppHistory.jsx
//
// "App history": the readings and flickers a person's hCRI Companion app has backed up to their account
// (private -- never shown on a public page). Used in two places:
//   - Account settings, "App history" tab:  <AppHistory theme={T} />                (the signed-in person's own)
//   - Admin panel, a user's detail panel:   <AppHistory theme={t} userId={u.id} />  (any user's, admins only)
// Backend: GET /api/account/app_history and GET /api/admin/users/:id/app_history (api/_core/companion_backup.php).
// The list is newest first and loads 50 at a time; a reading's spectrum is fetched only when its row is opened.
// Own view only (not the admin view): press and hold a row to select (checkboxes appear), then delete or convert the
// selection to website reports; each item can be renamed; a fading arrow scrolls back to the top.

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { basePath, getToken } from '../lib/api';
import { fmtTZ } from '../lib/tz';

const PAGE = 50;
const HOLD_MS = 450;   // press-and-hold time that starts selecting

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

const btn = (c) => ({ background: 'none', border: `1px solid ${c}`, color: c, borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' });

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
  const [selected, setSelected] = useState(() => new Set());   // ids ticked in select mode
  const [renaming, setRenaming] = useState(null);              // { id, draft }
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [scrollY, setScrollY] = useState({ top: 0, active: false });   // scroll-to-top arrow
  const rootRef = useRef(null);
  const hold = useRef({ timer: null, x: 0, y: 0, fired: false });
  const selecting = selected.size > 0;

  const base = userId
    ? `${basePath()}index.php/api/admin/users/${userId}/app_history`
    : `${basePath()}index.php/api/account/app_history`;
  const headers = { Authorization: `Bearer ${getToken()}` };
  const jsonHeaders = { ...headers, 'Content-Type': 'application/json' };

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

  // Fading "back to top" arrow: follows whichever ancestor scrolls (the settings window's body).
  useEffect(() => {
    if (userId) return undefined;
    let el = rootRef.current?.parentElement;
    while (el && el !== document.body && !(el.scrollHeight > el.clientHeight && /(auto|scroll)/.test(getComputedStyle(el).overflowY))) el = el.parentElement;
    if (!el || el === document.body) el = window;
    const read = () => (el === window ? window.scrollY : el.scrollTop);
    let idle = null;
    const onScroll = () => {
      setScrollY({ top: read(), active: true });
      clearTimeout(idle);
      idle = setTimeout(() => setScrollY((s) => ({ ...s, active: false })), 1500);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    rootRef.current.__scroller = el;
    return () => { el.removeEventListener('scroll', onScroll); clearTimeout(idle); };
  }, [userId, items.length]);
  const toTop = () => {
    const el = rootRef.current?.__scroller;
    (el || window).scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSel = (id) => setSelected((cur) => { const n = new Set(cur); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const clearSel = () => setSelected(new Set());

  // Press and hold starts selecting; moving (scrolling) cancels the hold.
  const holdStart = (e, it) => {
    if (!canDelete) return;
    const h = hold.current;
    h.fired = false; h.x = e.clientX; h.y = e.clientY;
    clearTimeout(h.timer);
    h.timer = setTimeout(() => { h.fired = true; toggleSel(it.id); try { navigator.vibrate?.(15); } catch { /* optional */ } }, HOLD_MS);
  };
  const holdMove = (e) => { const h = hold.current; if (h.timer && (Math.abs(e.clientX - h.x) > 8 || Math.abs(e.clientY - h.y) > 8)) { clearTimeout(h.timer); h.timer = null; } };
  const holdEnd = () => { clearTimeout(hold.current.timer); hold.current.timer = null; };
  const rowClick = (it) => {
    if (hold.current.fired) { hold.current.fired = false; return; }   // the click that ends a long press
    if (selecting) toggleSel(it.id); else toggle(it);
  };

  const api = async (path, method, body) => {
    const r = await fetch(`${base}${path}`, { method, headers: jsonHeaders, body: body ? JSON.stringify(body) : undefined });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.error) throw new Error(d.error || `Error ${r.status}`);
    return d;
  };

  const deleteSelected = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    if (!window.confirm(`Delete ${ids.length} item${ids.length === 1 ? '' : 's'} from your backed-up history? This removes them from hCRI.io only; reports you uploaded are not affected. This cannot be undone.`)) return;
    setBusy(true); setErr(''); setMsg('');
    try {
      await api('/delete', 'POST', { ids });
      const gone = new Set(ids);
      setItems((cur) => cur.filter((x) => !gone.has(x.id)));
      setTotal((n) => Math.max(0, n - ids.length));
      clearSel(); setOpen(null);
      setMsg(`Deleted ${ids.length} item${ids.length === 1 ? '' : 's'}.`);
    } catch (e) { setErr(e.message || 'Could not delete'); }
    setBusy(false);
  };

  const convertSelected = () => convertItems(items.filter((x) => selected.has(x.id)));
  const convertItems = async (pick) => {
    const todo = pick.filter((x) => x.kind === 'reading' && !x.reportId && x.hasSpectrum);
    if (!todo.length) { setMsg('Nothing to convert: flickers, readings without a spectrum, and readings that already have a report are skipped.'); return; }
    if (!window.confirm(`Create ${todo.length} website report${todo.length === 1 ? '' : 's'} from the selected reading${todo.length === 1 ? '' : 's'}? They are added to My Reports using your default visibility.`)) return;
    setBusy(true); setErr(''); setMsg('');
    let done = 0, failed = 0;
    try {
      for (let i = 0; i < todo.length; i += 25) {
        const d = await api('/convert', 'POST', { ids: todo.slice(i, i + 25).map((x) => x.id) });
        const byId = {};
        for (const r of d.results || []) {
          if (r.status === 'converted' || r.status === 'already') { done++; byId[r.id] = r; } else failed++;
        }
        setItems((cur) => cur.map((x) => (byId[x.id] ? { ...x, reportId: byId[x.id].reportId, reportIsPublic: byId[x.id].isPublic } : x)));
      }
      setMsg(`Converted ${done} reading${done === 1 ? '' : 's'} to website reports${failed ? `; ${failed} could not be converted` : ''}. Find them in My Reports.`);
      if (selecting) clearSel();
    } catch (e) { setErr(e.message || 'Could not convert'); }
    setBusy(false);
  };

  const saveRename = async () => {
    if (!renaming) return;
    const label = renaming.draft.trim();
    if (!label) { setRenaming(null); return; }
    setBusy(true); setErr('');
    try {
      const d = await api(`/${encodeURIComponent(renaming.id)}`, 'PATCH', { label });
      setItems((cur) => cur.map((x) => (x.id === renaming.id ? { ...x, label: d.label } : x)));
      setRenaming(null);
    } catch (e) { setErr(e.message || 'Could not rename'); }
    setBusy(false);
  };

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
    <div ref={rootRef} style={{ fontFamily: 'monospace', color: o.text }}>
      <div style={{ fontSize: 12, color: o.dim, marginBottom: 10, lineHeight: 1.5 }}>
        {userId ? 'This user’s' : 'Your'} hCRI Companion history, as backed up to {userId ? 'their' : 'your'} account: <b style={{ color: o.text }}>{total}</b> item{total === 1 ? '' : 's'} (the account keeps up to {maxPer.toLocaleString()}).
        The app itself shows only its latest 100 readings, but backed-up readings stay here after they scroll off the app.
        {!userId && ' Only you can see this page, and only you can delete items from it: the Companion app can never remove anything stored here.'}
      </div>
      {canDelete && (
        <div style={{ position: 'sticky', top: -18, zIndex: 3, background: o.bg, border: `1px solid ${selecting ? o.accent : o.border}`, borderRadius: 8, padding: '8px 10px', marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {selecting ? (
            <>
              <span style={{ fontSize: 12, color: o.white, fontWeight: 700 }}>{selected.size} selected</span>
              <button disabled={busy} onClick={deleteSelected} style={btn(o.bad)}>Delete selected</button>
              <button disabled={busy} onClick={convertSelected} style={btn(o.accent)}>Convert to reports</button>
              <button disabled={busy} onClick={() => setSelected(new Set(shown.map((x) => x.id)))} style={btn(o.dim)}>Select all loaded</button>
              <button disabled={busy} onClick={clearSel} style={btn(o.dim)}>Clear</button>
            </>
          ) : (
            <>
              <span style={{ fontSize: 11, color: o.dim, flex: '1 1 auto' }}>Open an item to convert it to a website report, or press and hold to select several.</span>
              <button onClick={() => { const ids = shown.filter((x) => x.kind === 'reading' && x.hasSpectrum && !x.reportId).map((x) => x.id); setSelected(new Set(ids)); }} style={btn(o.dim)}>Select not-yet-uploaded</button>
            </>
          )}
        </div>
      )}
      {msg && <div style={{ color: o.good, fontSize: 12, marginBottom: 8 }}>{msg}</div>}
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
              <div
                onClick={() => rowClick(it)}
                onPointerDown={(e) => holdStart(e, it)} onPointerMove={holdMove} onPointerUp={holdEnd} onPointerCancel={holdEnd} onPointerLeave={holdEnd}
                onContextMenu={(e) => { if (canDelete) e.preventDefault(); }}
                style={{ display: 'flex', gap: 10, alignItems: 'baseline', padding: '8px 10px', cursor: 'pointer', background: selected.has(it.id) ? `${o.accent}22` : isOpen ? `${o.border}55` : 'transparent', flexWrap: 'wrap', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
                {selecting && (
                  <input type="checkbox" checked={selected.has(it.id)} readOnly aria-label="Selected" style={{ accentColor: o.accent, width: 16, height: 16, alignSelf: 'center', flexShrink: 0, pointerEvents: 'none' }} />
                )}
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
                {!selecting && <span style={{ fontSize: 11, color: o.dim }}>{isOpen ? '▾' : '▸'}</span>}
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      {renaming?.id === it.id ? (
                        <>
                          <input
                            autoFocus value={renaming.draft} maxLength={200}
                            onChange={(e) => setRenaming({ id: it.id, draft: e.target.value })}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setRenaming(null); }}
                            style={{ flex: '1 1 200px', minWidth: 0, background: o.bg, border: `1px solid ${o.border}`, borderRadius: 6, padding: '5px 8px', color: o.text, fontSize: 13, fontFamily: 'monospace' }}
                          />
                          <button disabled={busy} onClick={saveRename} style={btn(o.accent)}>Save</button>
                          <button onClick={() => setRenaming(null)} style={btn(o.dim)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          {it.kind === 'reading' && it.hasSpectrum && !it.reportId && (
                            <button disabled={busy} onClick={() => convertItems([it])} style={btn(o.accent)}>Convert to website report</button>
                          )}
                          <button onClick={() => setRenaming({ id: it.id, draft: it.label || '' })} style={btn(o.dim)}>Rename</button>
                          <button onClick={() => remove(it)} style={btn(o.bad)}>Delete from my history</button>
                        </>
                      )}
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
      {!userId && (
        <div style={{ position: 'sticky', bottom: 6, height: 0, overflow: 'visible', zIndex: 4, pointerEvents: 'none' }}>
          <button
            onClick={toTop} aria-label="Back to top" tabIndex={scrollY.top > 150 ? 0 : -1}
            style={{
              position: 'absolute', right: 0, bottom: 0, width: 40, height: 40, borderRadius: 20, border: `1px solid ${o.accent}`,
              background: o.bg, color: o.accent, fontSize: 20, lineHeight: 1, cursor: 'pointer',
              opacity: scrollY.top > 150 ? (scrollY.active ? 0.95 : 0.4) : 0, transition: 'opacity .35s',
              pointerEvents: scrollY.top > 150 ? 'auto' : 'none',
            }}>↑</button>
        </div>
      )}
    </div>
  );
}
