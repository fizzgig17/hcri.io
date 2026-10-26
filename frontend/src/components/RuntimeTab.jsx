// frontend/src/components/RuntimeTab.jsx
//
// Explore > Runtime: your private output-over-time curves (a light's output sampled at a fixed interval).
// Grouped list with a sparkline and retention at 1/5/10/30 min; tick lights to overlay them; click one for its
// own chart. Upload a CSV (first column minutes, one column per light) or delete curves. Curves are private to you.
// History: a light's page is `?explore=runtime&rt=<id>`, so Back and refresh work like the rest of the app.

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { MARKS, stats, valueAt, timeToFraction, fmtVal, fmtPctV, fmtMin } from '../lib/runtime';

const PALETTE = ['#4aa3ff', '#ff8a3d', '#3dd68c', '#e5539b', '#f2c94c', '#9b7bff', '#2fc4c4', '#ff5d5d', '#a3c43a', '#c08a5a', '#7f8fa6', '#d36bff'];
const rtFromUrl = () => { try { return new URLSearchParams(window.location.search).get('rt') || null; } catch { return null; } };

function ticks(lo, hi, n = 5) {
  const span = hi - lo || 1;
  const raw = span / n;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || raw;
  const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-6; v += step) out.push(+v.toFixed(10));
  return out;
}

function Spark({ c, T, w = 110, h = 30 }) {
  const v = c.values || [];
  if (v.length < 2) return null;
  const hi = Math.max(...v) || 1;
  const d = v.map((y, i) => `${i ? 'L' : 'M'}${((i / (v.length - 1)) * w).toFixed(1)} ${(h - 2 - (y / hi) * (h - 4)).toFixed(1)}`).join('');
  return <svg width={w} height={h} style={{ flexShrink: 0 }} aria-hidden="true"><path d={d} fill="none" stroke={T.accent} strokeWidth="1.5" /></svg>;
}

/** One or more curves on a shared minutes axis. mode 'abs' = real values, 'pct' = % of each curve's starting value. */
export function RuntimeChart({ curves, T, mode, height = 300 }) {
  const W = 720, L = 52, R = 14, Tp = 14, B = 38;
  const [hover, setHover] = useState(null);
  const series = useMemo(() => curves.map((c, k) => {
    const v = c.values || [];
    const base = mode === 'pct' ? (v[0] || 1) / 100 : 1;
    return { c, color: PALETTE[k % PALETTE.length], pts: v.map((y, i) => ({ x: (i * c.intervalSeconds) / 60, y: y / base })) };
  }), [curves, mode]);
  const xMax = Math.max(1e-6, ...series.map((s) => (s.pts.length ? s.pts[s.pts.length - 1].x : 0)));
  const yMaxRaw = Math.max(1e-6, ...series.flatMap((s) => s.pts.map((p) => p.y)));
  const yMax = mode === 'pct' ? Math.max(100, yMaxRaw) * 1.04 : yMaxRaw * 1.06;
  const px = (x) => L + (x / xMax) * (W - L - R);
  const py = (y) => Tp + (1 - y / yMax) * (height - Tp - B);
  const yT = ticks(0, yMax, 5), xT = ticks(0, xMax, 6);
  const unit = curves[0] && curves[0].unit;
  const onMove = (ev) => {
    const r = ev.currentTarget.getBoundingClientRect();
    const x = ((ev.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(xMax, ((x - L) / (W - L - R)) * xMax)));
  };
  const at = (s, x) => { const i = Math.round((x * 60) / s.c.intervalSeconds); return s.pts[Math.min(i, s.pts.length - 1)]; };
  return (
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Output over time"
      onMouseMove={onMove} onMouseLeave={() => setHover(null)}
      style={{ width: '100%', maxWidth: 820, height: 'auto', display: 'block', background: T.chartBg, borderRadius: 6, border: `1px solid ${T.border}` }}>
      {yT.map((v) => (
        <g key={'y' + v}>
          <line x1={L} x2={W - R} y1={py(v)} y2={py(v)} stroke={T.gridLine} />
          <text x={L - 6} y={py(v) + 4} textAnchor="end" fontSize="11" fill={T.axisLabel} fontFamily="monospace">{mode === 'pct' ? `${v}%` : fmtVal(v)}</text>
        </g>
      ))}
      {xT.map((v) => (
        <g key={'x' + v}>
          <line x1={px(v)} x2={px(v)} y1={Tp} y2={height - B} stroke={T.gridLine} />
          <text x={px(v)} y={height - B + 15} textAnchor="middle" fontSize="11" fill={T.axisLabel} fontFamily="monospace">{v}</text>
        </g>
      ))}
      {series.map((s) => (
        <path key={s.c.id} fill="none" stroke={s.color} strokeWidth="1.8" strokeLinejoin="round"
          d={s.pts.map((p, i) => `${i ? 'L' : 'M'}${px(p.x).toFixed(1)} ${py(p.y).toFixed(1)}`).join('')} />
      ))}
      {hover != null && (
        <g>
          <line x1={px(hover)} x2={px(hover)} y1={Tp} y2={height - B} stroke={T.dim} strokeDasharray="3 3" />
          {series.map((s) => { const p = at(s, hover); return p ? <circle key={s.c.id} cx={px(p.x)} cy={py(p.y)} r="3.5" fill={s.color} /> : null; })}
          <text x={px(hover) > W / 2 ? px(hover) - 6 : px(hover) + 6} y={Tp + 12} textAnchor={px(hover) > W / 2 ? 'end' : 'start'} fontSize="11" fill={T.text} fontFamily="monospace">
            {fmtMin(hover)}{series.length <= 4 ? '  ' + series.map((s) => { const p = at(s, hover); return p ? (mode === 'pct' ? fmtPctV(p.y) : fmtVal(p.y)) : '–'; }).join(' / ') : ''}
          </text>
        </g>
      )}
      <text x={W / 2} y={height - 4} textAnchor="middle" fontSize="11" fill={T.axisLabel} fontFamily="monospace">Minutes</text>
      <text transform={`translate(11 ${height / 2}) rotate(-90)`} textAnchor="middle" fontSize="11" fill={T.axisLabel} fontFamily="monospace">
        {mode === 'pct' ? '% of starting output' : `Output${unit ? ` (${unit})` : ''}`}
      </text>
    </svg>
  );
}

function Legend({ curves, T }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', margin: '8px 0 0', fontSize: 12 }}>
      {curves.map((c, k) => (
        <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: T.text }}>
          <span style={{ width: 12, height: 3, background: PALETTE[k % PALETTE.length], display: 'inline-block' }} />{c.label}
        </span>
      ))}
    </div>
  );
}

export default function RuntimeTab({ T }) {
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [sel, setSel] = useState([]);
  const [q, setQ] = useState('');
  const [mode, setMode] = useState('pct');
  const [rt, setRt] = useState(rtFromUrl);
  const [comparing, setComparing] = useState(false);
  const [showUp, setShowUp] = useState(false);
  const [upGroup, setUpGroup] = useState('');
  const [upUnit, setUpUnit] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const load = useCallback(() => api.get('/runtime?full=1').then((d) => { setList(d.items || []); setErr(''); }).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const on = () => { setRt(rtFromUrl()); setComparing(false); };
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, []);

  const push = (extra, url) => { try { window.history.pushState({ hcri: 1, view: 'explore', etab: 'runtime', ...extra }, '', url); } catch { /* history unavailable */ } };
  const open = (id) => { push({ rt: id }, `${window.location.pathname}?explore=runtime&rt=${encodeURIComponent(id)}`); setRt(id); };
  const back = () => { push({}, `${window.location.pathname}?explore=runtime`); setRt(null); setComparing(false); };

  const btn = (color = 'accent', off) => ({
    background: `${T[color] || T.accent}20`, border: `1.5px solid ${T[color] || T.accent}`, color: T[color] || T.accent,
    borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: off ? 'default' : 'pointer', fontFamily: 'monospace', fontWeight: 700, opacity: off ? 0.45 : 1,
  });
  const pill = (id, label) => (
    <button key={id} onClick={() => setMode(id)} style={{ background: mode === id ? `${T.accent}30` : 'none', border: `1px solid ${mode === id ? T.accent : T.border}`,
      color: mode === id ? T.accent : T.dim, borderRadius: 999, padding: '3px 12px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer' }}>{label}</button>
  );
  const wrap = { maxWidth: 980, margin: '0 auto', padding: '16px 16px 90px', fontFamily: 'monospace', color: T.text };

  const upload = async (file) => {
    if (!file) return;
    setBusy(true); setErr(''); setMsg('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (upGroup.trim()) fd.append('group', upGroup.trim());
      if (upUnit.trim()) fd.append('unit', upUnit.trim());
      const r = await api.upload('/runtime', fd);
      setMsg(`Saved ${r.saved} light${r.saved === 1 ? '' : 's'}${r.skipped && r.skipped.length ? `, skipped ${r.skipped.length} (${r.skipped.slice(0, 3).map((s) => `${s.label || '?'}: ${s.reason}`).join('; ')}${r.skipped.length > 3 ? '…' : ''})` : ''}.`);
      setShowUp(false);
      await load();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };
  const remove = async (ids) => {
    if (!window.confirm(ids.length === 1 ? 'Delete this runtime curve?' : `Delete ${ids.length} runtime curves?`)) return;
    try {
      for (const id of ids) await api.del('/runtime?id=' + encodeURIComponent(id));
      setSel((s) => s.filter((x) => !ids.includes(x)));
      setMsg(`Deleted ${ids.length}.`);
      await load();
      if (rt && ids.includes(rt)) back();
    } catch (e) { setErr(e.message); }
  };

  const byId = useMemo(() => Object.fromEntries((list || []).map((c) => [c.id, c])), [list]);

  // ── One light ────────────────────────────────────────────────────────────
  if (rt && list) {
    const c = byId[rt];
    if (!c) return <div style={wrap}><button style={btn('dim')} onClick={back}>← Back to runtime</button><p style={{ color: T.dim }}>That curve no longer exists.</p></div>;
    const st = stats(c);
    const t90 = timeToFraction(c, 0.9), t50 = timeToFraction(c, 0.5);
    return (
      <div style={wrap}>
        <button style={{ ...btn('dim'), marginBottom: 14 }} onClick={back}>← Back to runtime</button>
        <h2 style={{ margin: '0 0 4px', fontSize: 18 }}>{c.label}</h2>
        <div style={{ color: T.dim, fontSize: 12, marginBottom: 12 }}>{c.group || 'Ungrouped'} · {c.points} samples every {+c.intervalSeconds.toFixed(2)} s · {fmtMin(st && st.durationMin)}</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>{pill('pct', '% of start')}{pill('abs', c.unit ? `Absolute (${c.unit})` : 'Absolute')}</div>
        <RuntimeChart curves={[c]} T={T} mode={mode} />
        {st && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 8, margin: '14px 0' }}>
            {[['Start', fmtVal(st.start)], ...MARKS.map((m) => [`@ ${m} min`, st.at[m].v == null ? '–' : `${fmtVal(st.at[m].v)} (${fmtPctV(st.at[m].pct)})`]),
              ['End', `${fmtVal(st.end)} (${fmtPctV(st.endPct)})`], ['Peak', fmtVal(st.peak)], ['Minimum', fmtVal(st.min)],
              ['Below 90%', t90 == null ? 'never' : fmtMin(t90)], ['Below 50%', t50 == null ? 'never' : fmtMin(t50)]].map(([k, v]) => (
              <div key={k} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 11, color: T.dim }}>{k}</div><div style={{ fontWeight: 800, fontSize: 14 }}>{v}</div>
              </div>
            ))}
          </div>
        )}
        <button style={btn('bad')} onClick={() => remove([c.id])}>Delete</button>
      </div>
    );
  }

  // ── Overlay ──────────────────────────────────────────────────────────────
  if (comparing) {
    const cs = sel.map((id) => byId[id]).filter(Boolean);
    return (
      <div style={wrap}>
        <button style={{ ...btn('dim'), marginBottom: 14 }} onClick={() => setComparing(false)}>← Back to runtime</button>
        <h2 style={{ margin: '0 0 10px', fontSize: 18 }}>Compare runtime <span style={{ color: T.dim, fontWeight: 400 }}>({cs.length})</span></h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>{pill('pct', '% of start')}{pill('abs', 'Absolute')}</div>
        <RuntimeChart curves={cs} T={T} mode={mode} />
        <Legend curves={cs} T={T} />
        <div style={{ overflowX: 'auto', marginTop: 16 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
            <thead><tr style={{ color: T.dim, textAlign: 'right' }}>
              <th style={{ textAlign: 'left', padding: '4px 8px' }}>Light</th><th style={{ padding: '4px 8px' }}>Start</th>
              {MARKS.map((m) => <th key={m} style={{ padding: '4px 8px' }}>@{m} min</th>)}<th style={{ padding: '4px 8px' }}>End</th>
            </tr></thead>
            <tbody>
              {cs.map((c, k) => { const st = stats(c); return (
                <tr key={c.id} style={{ borderTop: `1px solid ${T.border}`, textAlign: 'right' }}>
                  <td style={{ textAlign: 'left', padding: '5px 8px', color: PALETTE[k % PALETTE.length], fontWeight: 700 }}>{c.label}</td>
                  <td style={{ padding: '5px 8px' }}>{fmtVal(st.start)}</td>
                  {MARKS.map((m) => <td key={m} style={{ padding: '5px 8px' }}>{st.at[m].v == null ? '–' : `${fmtVal(st.at[m].v)} · ${fmtPctV(st.at[m].pct)}`}</td>)}
                  <td style={{ padding: '5px 8px' }}>{fmtVal(st.end)} · {fmtPctV(st.endPct)}</td>
                </tr>); })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── List ─────────────────────────────────────────────────────────────────
  const needle = q.trim().toLowerCase();
  const shown = (list || []).filter((c) => !needle || c.label.toLowerCase().includes(needle) || (c.group || '').toLowerCase().includes(needle));
  const groups = {};
  shown.forEach((c) => { (groups[c.group || 'Ungrouped'] = groups[c.group || 'Ungrouped'] || []).push(c); });
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 12 ? s : [...s, id]));
  const input = { background: T.surface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 6, padding: '6px 10px', fontSize: 13, fontFamily: 'monospace' };

  return (
    <div style={wrap}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18, flex: 1 }}>Runtime <span style={{ color: T.dim, fontWeight: 400, fontSize: 13 }}>output over time · private to you</span></h2>
        <input style={{ ...input, width: 170 }} placeholder="Search lights…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button style={btn('accent')} onClick={() => setShowUp((v) => !v)}>Upload CSV</button>
      </div>
      {showUp && (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 13, lineHeight: 1.6 }}>
          <div style={{ color: T.dim, marginBottom: 8 }}>CSV with minutes in the first column and one column per light (the header is the light’s name). Re-uploading a light replaces it.</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input style={{ ...input, width: 150 }} placeholder="Group (optional)" value={upGroup} onChange={(e) => setUpGroup(e.target.value)} />
            <input style={{ ...input, width: 110 }} placeholder="Unit, e.g. lm" value={upUnit} onChange={(e) => setUpUnit(e.target.value)} />
            <button style={btn('accent', busy)} disabled={busy} onClick={() => fileRef.current && fileRef.current.click()}>{busy ? 'Uploading…' : 'Choose file…'}</button>
            <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={(e) => { upload(e.target.files[0]); e.target.value = ''; }} />
          </div>
        </div>
      )}
      {err && <div style={{ color: T.bad, fontSize: 13, marginBottom: 10 }}>{err}</div>}
      {msg && <div style={{ color: T.good, fontSize: 13, marginBottom: 10 }}>{msg}</div>}
      {list == null && !err && <div style={{ color: T.dim }}>Loading…</div>}
      {list && !list.length && (
        <div style={{ color: T.dim, fontSize: 14, lineHeight: 1.6, padding: '30px 0' }}>
          No runtime curves yet. Upload a CSV (or send them with your API token to <code>/api/v1/runtime</code>); they will show up here, private to you.
        </div>
      )}
      {Object.keys(groups).sort().map((g) => (
        <div key={g} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: T.dim, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 6px' }}>{g} <span style={{ fontWeight: 400 }}>({groups[g].length})</span></div>
          {groups[g].map((c) => {
            const on = sel.includes(c.id);
            const st = stats(c);
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', marginBottom: 6, background: T.surface, border: `1px solid ${on ? T.accent : T.border}`, borderRadius: 8 }}>
                <input type="checkbox" checked={on} onChange={() => toggle(c.id)} title="Select to compare" style={{ width: 18, height: 18, flexShrink: 0, accentColor: T.accent }} />
                <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => open(c.id)}>
                  <div style={{ fontWeight: 800, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</div>
                  {st && <div style={{ fontSize: 12, color: T.dim, marginTop: 3 }}>
                    {fmtVal(st.start)}{c.unit ? ' ' + c.unit : ''} start · {MARKS.filter((m) => valueAt(c, m) != null && m <= 10).map((m) => `${fmtPctV(st.at[m].pct)} @${m}m`).join(' · ')} · {fmtPctV(st.endPct)} @{Math.round(st.durationMin)}m
                  </div>}
                </div>
                <Spark c={c} T={T} />
              </div>
            );
          })}
        </div>
      ))}
      {sel.length > 0 && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 20, display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center',
          padding: '10px 14px calc(10px + env(safe-area-inset-bottom))', background: T.surface2, borderTop: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 13, color: T.dim }}>{sel.length} selected</span>
          <button style={btn('dim')} onClick={() => setSel([])}>Clear</button>
          <button style={btn('bad')} onClick={() => remove(sel)}>Delete</button>
          <button style={btn('accent', sel.length < 2)} disabled={sel.length < 2} onClick={() => setComparing(true)}>Compare →</button>
        </div>
      )}
    </div>
  );
}
