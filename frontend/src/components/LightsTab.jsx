// frontend/src/components/LightsTab.jsx
//
// Explore > Lights: group several readings (reports) under one light. A light is an overview card (latest reading as the headline,
// per-metric range / change / sparkline) with a sub-card per reading, a spectra overlay and enlargeable trend charts. A report can
// belong to several lights; it is linked after the fact ("Add to light" on My Reports). Deleting a light never deletes readings.
// API: GET/POST /api/lights, GET/PATCH/DELETE /api/lights/:id, POST /api/lights/:id/reports, PATCH/DELETE /api/lights/:id/reports/:rid

import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../lib/api';

export const METRICS = [
  ['cct', 'CCT', 0, 'K'], ['duv', 'Duv', 4, ''], ['ra', 'Ra', 1, ''], ['r9', 'R9', 1, ''],
  ['rf', 'Rf', 0, ''], ['rg', 'Rg', 0, ''], ['lux', 'Lux', 0, ''],
];
const fmtN = (v, d = 0) => (v == null || Number.isNaN(v) ? '–' : Number(v).toFixed(d));
const fmtD = (v, d = 0) => (v == null ? '–' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d));
const when = (s) => { const d = new Date(String(s).replace(' ', 'T') + 'Z'); return isNaN(d) ? s : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }); };
const epoch = (s) => { const t = new Date(String(s).replace(' ', 'T') + 'Z').getTime(); return isNaN(t) ? 0 : t; };
const PALETTE = ['#4ea1ff', '#f5a623', '#7ed957', '#e66ba8', '#a98bff', '#37c6c0', '#ff7b54', '#c0c84a'];

// x positions for the chosen axis: 'time' (real timestamps), 'order' (reading 1, 2, 3…), 'elapsed' (minutes since the first reading).
function xs(readings, axis) {
  if (axis === 'order') return readings.map((_, i) => i);
  const t0 = readings.length ? epoch(readings[0].createdAt) : 0;
  return readings.map((r) => (epoch(r.createdAt) - t0) / (axis === 'elapsed' ? 60000 : 1));
}

export function Sparkline({ values, x, color, w = 110, h = 28, onDot, big = false, dec = 0, T }) {
  const pts = values.map((v, i) => [x ? x[i] : i, v]).filter((p) => p[1] != null);
  if (pts.length < 1) return <div style={{ width: w, height: h }} />;
  const padX = big ? 38 : 3, padY = big ? 14 : 4, padB = big ? 22 : 4;
  const xmin = Math.min(...pts.map((p) => p[0])), xmax = Math.max(...pts.map((p) => p[0]));
  let ymin = Math.min(...pts.map((p) => p[1])), ymax = Math.max(...pts.map((p) => p[1]));
  if (ymax === ymin) { ymax += 1; ymin -= 1; }
  const sx = (v) => padX + (xmax === xmin ? (w - 2 * padX) / 2 : ((v - xmin) / (xmax - xmin)) * (w - 2 * padX));
  const sy = (v) => padY + (1 - (v - ymin) / (ymax - ymin)) * (h - padY - padB);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', maxWidth: '100%' }}>
      {big && [ymin, (ymin + ymax) / 2, ymax].map((v, i) => (
        <g key={i}>
          <line x1={padX} x2={w - 4} y1={sy(v)} y2={sy(v)} stroke={T.border} strokeWidth="1" />
          <text x={padX - 4} y={sy(v) + 4} textAnchor="end" fontSize="10" fill={T.dim}>{v.toFixed(dec)}</text>
        </g>
      ))}
      <path d={d} fill="none" stroke={color} strokeWidth={big ? 2 : 1.5} strokeLinejoin="round" />
      {values.map((v, i) => v == null ? null : (
        <circle key={i} cx={sx(x ? x[i] : i)} cy={sy(v)} r={big ? 5 : (i === values.length - 1 ? 2.8 : 1.6)} fill={color}
          style={onDot ? { cursor: 'pointer' } : undefined} onClick={onDot ? () => onDot(i) : undefined}><title>{v.toFixed(dec)}</title></circle>
      ))}
    </svg>
  );
}

function SpectraOverlay({ readings, T }) {
  const withSpd = readings.filter((r) => r.spd && r.spd.length);
  if (!withSpd.length) return null;
  const W = 520, H = 170, p = { l: 8, r: 8, t: 8, b: 20 };
  const all = withSpd.flatMap((r) => r.spd.map((q) => q[0]));
  const lo = Math.min(...all), hi = Math.max(...all);
  const sx = (w) => p.l + ((w - lo) / (hi - lo || 1)) * (W - p.l - p.r);
  const sy = (v) => p.t + (1 - v) * (H - p.t - p.b);
  const path = (r) => r.spd.map((q, i) => `${i ? 'L' : 'M'}${sx(q[0]).toFixed(1)},${sy(q[1]).toFixed(1)}`).join(' ');
  const first = withSpd[0], last = withSpd[withSpd.length - 1];
  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: 10, marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 6 }}>Spectra overlay <span style={{ color: T.dim, fontWeight: 400 }}>(normalised; first and latest highlighted)</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
        {withSpd.slice(1, -1).map((r) => <path key={r.id} d={path(r)} fill="none" stroke={T.dim} strokeOpacity="0.35" strokeWidth="1" />)}
        <path d={path(first)} fill="none" stroke="#f5a623" strokeWidth="2" />
        {withSpd.length > 1 && <path d={path(last)} fill="none" stroke="#4ea1ff" strokeWidth="2" />}
        {[400, 500, 600, 700].filter((w) => w >= lo && w <= hi).map((w) => <text key={w} x={sx(w)} y={H - 5} fontSize="10" textAnchor="middle" fill={T.dim}>{w}</text>)}
      </svg>
      <div style={{ fontSize: 11, color: T.dim }}><span style={{ color: '#f5a623' }}>■</span> first &nbsp;<span style={{ color: '#4ea1ff' }}>■</span> latest</div>
    </div>
  );
}

// Draws the enlarged trend at the width of its container so text stays readable on phones and fills the card on desktop.
function FitChart(props) {
  const ref = useRef(null);
  const [w, setW] = useState(560);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const f = () => setW(Math.max(260, Math.floor(el.clientWidth)));
    f();
    const ro = new ResizeObserver(f); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return <div ref={ref} style={{ width: '100%' }}><Sparkline {...props} w={w} h={200} /></div>;
}

const box = (T, extra) => ({ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, ...extra });
const btnS = (T, kind) => ({ background: kind === 'primary' ? T.accent : 'none', color: kind === 'primary' ? (T.name === 'dark' ? '#06121f' : '#fff') : kind === 'bad' ? T.bad : T.text, border: kind === 'primary' ? 'none' : `1px solid ${kind === 'bad' ? T.bad : T.border}`, borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', cursor: 'pointer' });
const inputS = (T) => ({ width: '100%', boxSizing: 'border-box', background: T.bg || T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: '7px 9px', color: T.text, fontSize: 13, fontFamily: 'monospace' });

// ── Overview card (list) ─────────────────────────────────────────────────────
function LightCard({ light, T, onOpen }) {
  const l = light.latest;
  return (
    <div onClick={onOpen} style={{ ...box(T), cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.white || T.text }}>{light.name}</div>
          <div style={{ fontSize: 11, color: T.dim }}>{[light.brand, light.model].filter(Boolean).join(' · ') || 'No brand / model'}</div>
        </div>
        <div style={{ fontSize: 11, color: T.dim, textAlign: 'right' }}>{light.count} reading{light.count === 1 ? '' : 's'}{l ? <><br />latest {when(l.createdAt)}</> : null}</div>
      </div>
      {light.count === 0 ? <div style={{ fontSize: 12, color: T.dim, fontStyle: 'italic' }}>No readings yet. Select reports in My Reports and choose “Add to light”.</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
          {METRICS.filter(([k]) => light.stats[k]).map(([k, lab, d, unit], i) => {
            const s = light.stats[k];
            return (
              <div key={k} style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 8px' }}>
                <div style={{ fontSize: 10, color: T.dim, textTransform: 'uppercase', letterSpacing: 0.6 }}>{lab}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{fmtN(s.latest, d)}<span style={{ fontSize: 10, color: T.dim }}> {unit}</span></div>
                {s.n > 1 && <div style={{ fontSize: 10, color: T.dim }}>{fmtD(s.change, d)} since first</div>}
                <Sparkline values={light.series[k]} color={PALETTE[i % PALETTE.length]} w={110} h={24} dec={d} T={T} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Detail ───────────────────────────────────────────────────────────────────
function LightDetail({ id, T, onBack, onChanged }) {
  const [light, setLight] = useState(null);
  const [err, setErr] = useState('');
  const [edit, setEdit] = useState(null);
  const [big, setBig] = useState(null);      // metric key being enlarged
  const [axis, setAxis] = useState('time');
  const [labelEdit, setLabelEdit] = useState({});
  const cardRefs = useRef({});

  const load = useCallback(() => api.get(`/lights/${id}`).then(setLight).catch((e) => setErr(e.message)), [id]);
  useEffect(() => { load(); }, [load]);
  if (err) return <div style={{ color: T.bad, fontSize: 13 }}>{err}</div>;
  if (!light) return <div style={{ color: T.dim, fontSize: 13 }}>Loading…</div>;

  const R = light.readings;
  const jump = (i) => { const el = cardRefs.current[R[i].id]; if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.style.outline = `2px solid ${T.accent}`; setTimeout(() => { el.style.outline = 'none'; }, 1500); } };
  const saveEdit = async () => { try { setLight(await api.patch(`/lights/${id}`, edit)); setEdit(null); onChanged(); } catch (e) { setErr(e.message); } };
  const del = async () => {
    if (!window.confirm(`Delete the light “${light.name}”? Its ${light.count} reading${light.count === 1 ? '' : 's'} stay in My Reports; only the grouping is removed.`)) return;
    try { await api.del(`/lights/${id}`); onChanged(); onBack(); } catch (e) { setErr(e.message); }
  };
  const remove = async (r) => { if (!window.confirm('Remove this reading from the light? The report itself is kept.')) return; await api.del(`/lights/${id}/reports/${r.id}`); load(); onChanged(); };
  const saveLabel = async (r) => { const v = labelEdit[r.id]; if (v == null) return; await api.patch(`/lights/${id}/reports/${r.id}`, { label: v }); setLabelEdit((c) => { const n = { ...c }; delete n[r.id]; return n; }); load(); };
  const bigDef = big && METRICS.find((m) => m[0] === big);
  const X = xs(R, axis);

  return (
    <div>
      <button onClick={onBack} style={{ ...btnS(T), marginBottom: 12 }}>← All lights</button>
      <div style={{ ...box(T), marginBottom: 14 }}>
        {edit ? (
          <div style={{ display: 'grid', gap: 8 }}>
            {['name', 'brand', 'model'].map((k) => <input key={k} placeholder={k[0].toUpperCase() + k.slice(1)} value={edit[k]} maxLength={160} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} style={inputS(T)} />)}
            <textarea placeholder="Notes" value={edit.notes} rows={3} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} style={inputS(T)} />
            <div style={{ display: 'flex', gap: 8 }}><button onClick={saveEdit} style={btnS(T, 'primary')}>Save</button><button onClick={() => setEdit(null)} style={btnS(T)}>Cancel</button></div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.white || T.text }}>{light.name}</div>
                <div style={{ fontSize: 12, color: T.dim }}>{[light.brand, light.model].filter(Boolean).join(' · ')}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <button onClick={() => setEdit({ name: light.name, brand: light.brand, model: light.model, notes: light.notes })} style={btnS(T)}>Edit</button>
                <button onClick={del} style={btnS(T, 'bad')}>Delete light</button>
              </div>
            </div>
            {light.notes && <div style={{ fontSize: 12, color: T.text, marginTop: 8, whiteSpace: 'pre-wrap' }}>{light.notes}</div>}
          </>
        )}
      </div>

      {R.length === 0 ? <div style={{ color: T.dim, fontSize: 13, fontStyle: 'italic' }}>No readings in this light yet.</div> : (
        <>
          <div style={{ fontSize: 12, color: T.dim, marginBottom: 6 }}>
            Headline is the latest reading ({when(light.latest.createdAt)}). Tap a trend to enlarge it.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 8, marginBottom: 14 }}>
            {METRICS.filter(([k]) => light.stats[k]).map(([k, lab, d, unit], i) => {
              const s = light.stats[k];
              return (
                <div key={k} onClick={() => setBig(big === k ? null : k)} style={{ ...box(T, { padding: 10, cursor: 'pointer' }), borderColor: big === k ? T.accent : T.border }}>
                  <div style={{ fontSize: 10, color: T.dim, textTransform: 'uppercase', letterSpacing: 0.6 }}>{lab}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>{fmtN(s.latest, d)}<span style={{ fontSize: 11, color: T.dim }}> {unit}</span></div>
                  <div style={{ fontSize: 11, color: T.dim }}>range {fmtN(s.min, d)}–{fmtN(s.max, d)}</div>
                  {s.n > 1 && <div style={{ fontSize: 11, color: T.dim }}>{fmtD(s.change, d)} since first · median {fmtN(s.median, d)}</div>}
                  <Sparkline values={light.series[k]} color={PALETTE[i % PALETTE.length]} w={150} h={30} dec={d} T={T} />
                </div>
              );
            })}
          </div>
          {bigDef && (
            <div style={{ ...box(T), marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{bigDef[1]} trend <span style={{ color: T.dim, fontWeight: 400 }}>· tap a dot to jump to that reading</span></div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[['time', 'Time'], ['order', 'Reading #'], ['elapsed', 'Elapsed min']].map(([a, lab]) => (
                    <button key={a} onClick={() => setAxis(a)} style={{ ...btnS(T), padding: '3px 8px', fontWeight: axis === a ? 700 : 400, borderColor: axis === a ? T.accent : T.border }}>{lab}</button>
                  ))}
                </div>
              </div>
              <FitChart big values={light.series[big]} x={X} color={PALETTE[METRICS.findIndex((m) => m[0] === big) % PALETTE.length]} dec={bigDef[2]} onDot={jump} T={T} />
            </div>
          )}
          <SpectraOverlay readings={R} T={T} />
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 8 }}>Readings ({R.length})</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {R.map((r, i) => (
              <div key={r.id} ref={(el) => { cardRefs.current[r.id] = el; }} style={{ ...box(T, { padding: 10 }), borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 13, color: T.text, fontWeight: 700 }}>
                    <span style={{ color: T.dim, fontWeight: 400 }}>#{i + 1} </span>
                    <a href={`?explore=mine&rid=${r.id}`} style={{ color: T.accent, textDecoration: 'none' }}>{r.label}</a>
                    {r.linkLabel && <span style={{ marginLeft: 8, fontSize: 11, border: `1px solid ${T.border}`, borderRadius: 10, padding: '1px 7px', color: T.dim, fontWeight: 400 }}>{r.linkLabel}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: T.dim }}>{when(r.createdAt)}</div>
                </div>
                <div style={{ fontSize: 12, color: T.text, margin: '4px 0' }}>
                  {METRICS.filter(([k]) => r[k] != null).map(([k, lab, d, unit]) => `${lab} ${fmtN(r[k], d)}${unit ? ' ' + unit : ''}`).join(' · ')}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input placeholder="Label (e.g. Turbo, after 10 min)" maxLength={80}
                    value={labelEdit[r.id] ?? r.linkLabel} onChange={(e) => setLabelEdit({ ...labelEdit, [r.id]: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveLabel(r); }}
                    style={{ ...inputS(T), flex: '1 1 180px', width: 'auto', padding: '4px 8px', fontSize: 12 }} />
                  {labelEdit[r.id] != null && labelEdit[r.id] !== r.linkLabel && <button onClick={() => saveLabel(r)} style={btnS(T, 'primary')}>Save label</button>}
                  <button onClick={() => remove(r)} style={btnS(T)}>Remove from light</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── The tab ──────────────────────────────────────────────────────────────────
export default function LightsTab({ T }) {
  const [lights, setLights] = useState(null);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(() => { try { const v = new URLSearchParams(window.location.search).get('light'); return v ? parseInt(v, 10) || null : null; } catch { return null; } });
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: '', brand: '', model: '', notes: '' });

  const load = useCallback(() => api.get('/lights').then((d) => { setLights(d); setErr(''); }).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);
  const go = (id) => { setOpen(id); try { const u = new URL(window.location.href); if (id) u.searchParams.set('light', id); else u.searchParams.delete('light'); window.history.replaceState(window.history.state, '', u); } catch {} };

  const create = async () => {
    if (!draft.name.trim()) return;
    try { const l = await api.post('/lights', draft); setCreating(false); setDraft({ name: '', brand: '', model: '', notes: '' }); await load(); go(l.id); } catch (e) { setErr(e.message); }
  };

  if (open) return <div style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}><LightDetail id={open} T={T} onBack={() => go(null)} onChanged={load} /></div>;
  return (
    <div style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.white || T.text }}>Lights</div>
          <div style={{ fontSize: 12, color: T.dim }}>Group several readings of the same light. Add reports from My Reports with “Add to light”.</div>
        </div>
        <button onClick={() => setCreating(true)} style={btnS(T, 'primary')}>+ New light</button>
      </div>
      {creating && (
        <div style={{ ...box(T), marginBottom: 12, display: 'grid', gap: 8 }}>
          {['name', 'brand', 'model'].map((k) => <input key={k} autoFocus={k === 'name'} placeholder={k[0].toUpperCase() + k.slice(1)} value={draft[k]} maxLength={160} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} style={inputS(T)} />)}
          <textarea placeholder="Notes (optional)" rows={2} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} style={inputS(T)} />
          <div style={{ display: 'flex', gap: 8 }}><button onClick={create} style={btnS(T, 'primary')}>Create</button><button onClick={() => setCreating(false)} style={btnS(T)}>Cancel</button></div>
        </div>
      )}
      {err && <div style={{ color: T.bad, fontSize: 13 }}>{err}</div>}
      {!lights && !err && <div style={{ color: T.dim, fontSize: 13 }}>Loading…</div>}
      {lights && lights.length === 0 && !creating && <div style={{ color: T.dim, fontSize: 13, fontStyle: 'italic' }}>No lights yet. Create one, or select reports in My Reports and choose “Add to light”.</div>}
      <div style={{ display: 'grid', gap: 10 }}>
        {(lights || []).map((l) => <LightCard key={l.id} light={l} T={T} onOpen={() => go(l.id)} />)}
      </div>
    </div>
  );
}

// ── "Add to light" modal, used from My Reports ───────────────────────────────
export function AddToLightModal({ T, reportIds, onClose, onDone }) {
  const [lights, setLights] = useState(null);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => { api.get('/lights').then(setLights).catch((e) => setMsg(e.message)); }, []);
  const addTo = async (l) => {
    setBusy(true);
    try { const d = await api.post(`/lights/${l.id}/reports`, { reportIds }); setMsg(`Added ${d.added} reading${d.added === 1 ? '' : 's'} to “${l.name}”${d.added < reportIds.length ? ` (${reportIds.length - d.added} already there)` : ''}.`); onDone && onDone(); }
    catch (e) { setMsg(e.message); }
    setBusy(false);
  };
  const createAndAdd = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    try { const l = await api.post('/lights', { name: newName.trim(), reportIds }); setMsg(`Created “${l.name}” with ${l.count} reading${l.count === 1 ? '' : 's'}.`); setNewName(''); onDone && onDone(); }
    catch (e) { setMsg(e.message); }
    setBusy(false);
  };
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ ...box(T), width: '100%', maxWidth: 420, maxHeight: '85dvh', overflowY: 'auto', fontFamily: 'monospace' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, color: T.white || T.text }}>Add {reportIds.length} reading{reportIds.length === 1 ? '' : 's'} to a light</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.dim, fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        {msg && <div style={{ fontSize: 12, color: T.good || T.accent, marginBottom: 8 }}>{msg}</div>}
        <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
          {lights === null ? <div style={{ color: T.dim, fontSize: 12 }}>Loading…</div> : lights.length === 0 ? <div style={{ color: T.dim, fontSize: 12 }}>No lights yet; create one below.</div> :
            lights.map((l) => (
              <button key={l.id} disabled={busy} onClick={() => addTo(l)} style={{ ...btnS(T), textAlign: 'left', fontWeight: 400, padding: '8px 10px' }}>
                <b>{l.name}</b> <span style={{ color: T.dim }}>{[l.brand, l.model].filter(Boolean).join(' · ')} · {l.count} reading{l.count === 1 ? '' : 's'}</span>
              </button>
            ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input placeholder="New light name" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') createAndAdd(); }} style={inputS(T)} />
          <button disabled={busy || !newName.trim()} onClick={createAndAdd} style={btnS(T, 'primary')}>Create</button>
        </div>
      </div>
    </div>
  );
}
