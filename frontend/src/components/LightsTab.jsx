// frontend/src/components/LightsTab.jsx
//
// Explore > Lights: group several readings (reports) under one light. A light is an overview card (latest reading as the headline,
// per-metric range / change / sparkline) with a sub-card per reading, a spectra overlay and enlargeable trend charts. A report can
// belong to several lights; it is linked after the fact ("Add to light" on My Reports). Deleting a light never deletes readings.
// API: GET/POST /api/lights, GET/PATCH/DELETE /api/lights/:id, POST /api/lights/:id/reports, PATCH/DELETE /api/lights/:id/reports/:rid

import { useEffect, useState, useCallback, useRef } from 'react';
import { api, basePath } from '../lib/api';

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

const FIELDS = [['brand', 'Light brand'], ['model', 'Light model'], ['led_brand', 'LED brand'], ['led_model', 'LED model'], ['optic', 'Optic']];
const fromLight = (l) => ({ name: l.name || '', brand: l.brand || '', model: l.model || '', led_brand: l.ledBrand || '', led_model: l.ledModel || '', optic: l.optic || '', notes: l.notes || '' });
function LightFields({ v, set, T, autoFocus }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <input autoFocus={autoFocus} placeholder="Name" value={v.name} maxLength={160} onChange={(e) => set({ ...v, name: e.target.value })} style={inputS(T)} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
        {FIELDS.map(([k, lab]) => <input key={k} placeholder={lab} aria-label={lab} title={lab} value={v[k] || ''} maxLength={120} onChange={(e) => set({ ...v, [k]: e.target.value })} style={inputS(T)} />)}
      </div>
      {'notes' in v && <textarea placeholder="Notes" value={v.notes} rows={2} onChange={(e) => set({ ...v, notes: e.target.value })} style={inputS(T)} />}
    </div>
  );
}
const specLine = (l) => [l.brand, l.model].filter(Boolean).join(' ') + ([l.ledBrand, l.ledModel].some(Boolean) ? ' · LED ' + [l.ledBrand, l.ledModel].filter(Boolean).join(' ') : '') + (l.optic ? ' · ' + l.optic : '');

// ── Overview card (list) ─────────────────────────────────────────────────────
function LightCard({ light, T, onOpen, checked, onCheck }) {
  const l = light.latest;
  return (
    <div onClick={onOpen} style={{ ...box(T), cursor: 'pointer', borderColor: checked ? T.accent : T.border }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <input type="checkbox" checked={!!checked} onClick={(e) => e.stopPropagation()} onChange={onCheck} aria-label="Select to compare" style={{ accentColor: T.accent, width: 18, height: 18, marginTop: 2, cursor: 'pointer' }} />
          <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.white || T.text }}>{light.name}{light.owner == null && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 400, border: `1px solid ${T.border}`, borderRadius: 10, padding: '1px 7px', color: light.isPublic ? T.good || T.accent : T.dim }}>{light.isPublic ? 'public' : 'private'}</span>}</div>
          <div style={{ fontSize: 11, color: T.dim }}>{specLine(light) || 'No brand / model'}{light.owner ? ` · by ${light.owner}` : ''}</div>
          </div>
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
function LightDetail({ id, T, onBack, onChanged, pub }) {
  const base = pub ? `/lights/public/${id}` : `/lights/${id}`;
  const [light, setLight] = useState(null);
  const [err, setErr] = useState('');
  const [edit, setEdit] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [big, setBig] = useState(null);      // metric key being enlarged
  const [axis, setAxis] = useState('time');
  const [labelEdit, setLabelEdit] = useState({});
  const cardRefs = useRef({});

  const load = useCallback(() => api.get(base).then(setLight).catch((e) => setErr(e.message)), [base]);
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
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        {onBack && <button onClick={onBack} style={btnS(T)}>← All lights</button>}
        {(pub || light.isPublic) ? <button onClick={() => setSharing(true)} style={btnS(T, 'primary')}>Share</button> : <span style={{ fontSize: 11, color: T.dim }}>Make at least one reading public to share this light.</span>}
      </div>
      {sharing && <ShareLightsModal T={T} ids={[light.id]} onClose={() => setSharing(false)} />}
      <div style={{ ...box(T), marginBottom: 14 }}>
        {edit ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <LightFields v={edit} set={setEdit} T={T} />
            <div style={{ display: 'flex', gap: 8 }}><button onClick={saveEdit} style={btnS(T, 'primary')}>Save</button><button onClick={() => setEdit(null)} style={btnS(T)}>Cancel</button></div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.white || T.text }}>{light.name}</div>
                <div style={{ fontSize: 12, color: T.dim }}>{specLine(light)}{pub && light.owner ? ` · by ${light.owner}` : ''}</div>
              </div>
              {!pub && <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <button onClick={() => setEdit(fromLight(light))} style={btnS(T)}>Edit</button>
                <button onClick={del} style={btnS(T, 'bad')}>Delete light</button>
              </div>}
            </div>
            {light.notes && <div style={{ fontSize: 12, color: T.text, marginTop: 8, whiteSpace: 'pre-wrap' }}>{light.notes}</div>}
          </>
        )}
      </div>

      {R.length === 0 ? <div style={{ color: T.dim, fontSize: 13, fontStyle: 'italic' }}>No readings in this light yet.</div> : (
        <>
          <div style={{ fontSize: 12, color: T.dim, marginBottom: 6 }}>
            Headline is the latest reading ({when(light.latest.createdAt)}). Tap a trend to enlarge it.{pub ? ' Only public readings are shown.' : (light.isPublic ? ' This light is public; others see only its public readings.' : ' This light is private: none of its readings is public.')}
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
                    <a href={`?explore${pub ? "" : "=mine"}&rid=${r.id}`} style={{ color: T.accent, textDecoration: 'none' }}>{r.label}</a>
                    {!pub && !r.isPublic && <span style={{ marginLeft: 8, fontSize: 11, border: `1px solid ${T.border}`, borderRadius: 10, padding: '1px 7px', color: T.dim, fontWeight: 400 }}>private</span>}
                    {r.linkLabel && <span style={{ marginLeft: 8, fontSize: 11, border: `1px solid ${T.border}`, borderRadius: 10, padding: '1px 7px', color: T.dim, fontWeight: 400 }}>{r.linkLabel}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: T.dim }}>{when(r.createdAt)}</div>
                </div>
                <div style={{ fontSize: 12, color: T.text, margin: '4px 0' }}>
                  {METRICS.filter(([k]) => r[k] != null).map(([k, lab, d, unit]) => `${lab} ${fmtN(r[k], d)}${unit ? ' ' + unit : ''}`).join(' · ')}
                </div>
                {pub ? null : <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input placeholder="Label (e.g. Turbo, after 10 min)" maxLength={80}
                    value={labelEdit[r.id] ?? r.linkLabel} onChange={(e) => setLabelEdit({ ...labelEdit, [r.id]: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveLabel(r); }}
                    style={{ ...inputS(T), flex: '1 1 180px', width: 'auto', padding: '4px 8px', fontSize: 12 }} />
                  {labelEdit[r.id] != null && labelEdit[r.id] !== r.linkLabel && <button onClick={() => saveLabel(r)} style={btnS(T, 'primary')}>Save label</button>}
                  <button onClick={() => remove(r)} style={btnS(T)}>Remove from light</button>
                </div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


// ── Compare lights ───────────────────────────────────────────────────────────
function MultiTrend({ lights, metric, dec, T }) {
  const ref = useRef(null);
  const [w, setW] = useState(560);
  useEffect(() => { const el = ref.current; if (!el) return; const f = () => setW(Math.max(260, Math.floor(el.clientWidth))); f(); const ro = new ResizeObserver(f); ro.observe(el); return () => ro.disconnect(); }, []);
  const h = 200, padL = 40, padR = 8, padT = 10, padB = 20;
  const series = lights.map((l) => l.series[metric].map((v, i) => [i + 1, v]).filter((p) => p[1] != null));
  const all = series.flat();
  if (!all.length) return <div style={{ fontSize: 12, color: T.dim }}>No {metric} data.</div>;
  const xmax = Math.max(...all.map((p) => p[0])), xmin = 1;
  let ymin = Math.min(...all.map((p) => p[1])), ymax = Math.max(...all.map((p) => p[1]));
  if (ymax === ymin) { ymax += 1; ymin -= 1; }
  const sx = (v) => padL + (xmax === xmin ? (w - padL - padR) / 2 : ((v - xmin) / (xmax - xmin)) * (w - padL - padR));
  const sy = (v) => padT + (1 - (v - ymin) / (ymax - ymin)) * (h - padT - padB);
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={w} height={h} style={{ display: 'block' }}>
        {[ymin, (ymin + ymax) / 2, ymax].map((v, i) => (<g key={i}><line x1={padL} x2={w - padR} y1={sy(v)} y2={sy(v)} stroke={T.border} /><text x={padL - 4} y={sy(v) + 4} textAnchor="end" fontSize="10" fill={T.dim}>{v.toFixed(dec)}</text></g>))}
        <text x={w / 2} y={h - 4} textAnchor="middle" fontSize="10" fill={T.dim}>reading #</text>
        {series.map((pts, li) => (
          <g key={li}>
            <path d={pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ')} fill="none" stroke={PALETTE[li % PALETTE.length]} strokeWidth="2" />
            {pts.map((p, i) => <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r="3.5" fill={PALETTE[li % PALETTE.length]}><title>{lights[li].name} #{p[0]}: {p[1].toFixed(dec)}</title></circle>)}
          </g>
        ))}
      </svg>
    </div>
  );
}

function CompareLights({ ids, T, onBack, pub }) {
  const [lights, setLights] = useState(null);
  const [err, setErr] = useState('');
  const [metric, setMetric] = useState('cct');
  const [sharing, setSharing] = useState(false);
  useEffect(() => { Promise.all(ids.map((i) => api.get(pub ? `/lights/public/${i}` : `/lights/${i}`))).then(setLights).catch((e) => setErr(e.message)); }, [ids.join(',')]); // eslint-disable-line
  if (err) return <div style={{ color: T.bad, fontSize: 13 }}>{err}</div>;
  if (!lights) return <div style={{ color: T.dim, fontSize: 13 }}>Loading…</div>;
  const shareIds = lights.filter((l) => pub || l.isPublic).map((l) => l.id);
  const metrics = METRICS.filter(([k]) => lights.some((l) => l.stats[k]));
  const md = METRICS.find((m) => m[0] === metric) || METRICS[0];
  const spd = lights.map((l, i) => ({ l, i, r: [...l.readings].reverse().find((x) => x.spd && x.spd.length) })).filter((x) => x.r);
  const W = 520, H = 170, p = { l: 8, r: 8, t: 8, b: 20 };
  const all = spd.flatMap((x) => x.r.spd.map((q) => q[0]));
  const lo = Math.min(...all), hi = Math.max(...all);
  const sx = (w) => p.l + ((w - lo) / (hi - lo || 1)) * (W - p.l - p.r);
  const sy = (v) => p.t + (1 - v) * (H - p.t - p.b);
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        {onBack && <button onClick={onBack} style={btnS(T)}>← All lights</button>}
        {shareIds.length > 0 ? <button onClick={() => setSharing(true)} style={btnS(T, 'primary')}>Share</button> : <span style={{ fontSize: 11, color: T.dim }}>None of these lights is public, so there is nothing to share.</span>}
      </div>
      {sharing && <ShareLightsModal T={T} ids={shareIds} onClose={() => setSharing(false)} />}
      <div style={{ fontSize: 16, fontWeight: 700, color: T.white || T.text, marginBottom: 4 }}>Compare lights ({lights.length})</div>
      <div style={{ fontSize: 12, color: T.dim, marginBottom: 10 }}>Each light is represented by its latest reading; trends run in reading order.</div>
      <div style={{ overflowX: 'auto', marginBottom: 14 }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 12, minWidth: '100%' }}>
          <thead><tr>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: T.dim }}></th>
            {lights.map((l, i) => (<th key={l.id} style={{ textAlign: 'right', padding: '6px 8px', color: T.text, borderBottom: `2px solid ${PALETTE[i % PALETTE.length]}`, whiteSpace: 'nowrap' }}>{l.name}<div style={{ fontWeight: 400, color: T.dim, fontSize: 10 }}>{l.count} reading{l.count === 1 ? '' : 's'}</div></th>))}
          </tr></thead>
          <tbody>
            {metrics.map(([k, lab, d, unit]) => (
              <tr key={k} style={{ borderTop: `1px solid ${T.border}` }}>
                <td style={{ padding: '6px 8px', color: T.dim }}>{lab}{unit ? ` (${unit})` : ''}</td>
                {lights.map((l) => { const s = l.stats[k]; return (
                  <td key={l.id} style={{ padding: '6px 8px', textAlign: 'right', color: T.text, whiteSpace: 'nowrap' }}>
                    {s ? <>{fmtN(s.latest, d)}<div style={{ fontSize: 10, color: T.dim }}>{s.n > 1 ? `${fmtN(s.min, d)}–${fmtN(s.max, d)} · ${fmtD(s.change, d)}` : ''}</div></> : '–'}
                  </td>); })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {spd.length > 0 && (
        <div style={{ ...box(T), marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 6 }}>Spectra <span style={{ color: T.dim, fontWeight: 400 }}>(latest reading of each light, normalised)</span></div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
            {spd.map((x) => <path key={x.l.id} d={x.r.spd.map((q, i) => `${i ? 'L' : 'M'}${sx(q[0]).toFixed(1)},${sy(q[1]).toFixed(1)}`).join(' ')} fill="none" stroke={PALETTE[x.i % PALETTE.length]} strokeWidth="2" />)}
            {[400, 500, 600, 700].filter((w) => w >= lo && w <= hi).map((w) => <text key={w} x={sx(w)} y={H - 5} fontSize="10" textAnchor="middle" fill={T.dim}>{w}</text>)}
          </svg>
        </div>
      )}
      <div style={{ ...box(T), marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
          {metrics.map(([k, lab]) => <button key={k} onClick={() => setMetric(k)} style={{ ...btnS(T), padding: '3px 9px', borderColor: metric === k ? T.accent : T.border, fontWeight: metric === k ? 700 : 400 }}>{lab}</button>)}
        </div>
        <MultiTrend lights={lights} metric={md[0]} dec={md[2]} T={T} />
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: T.text }}>
        {lights.map((l, i) => <span key={l.id}><span style={{ color: PALETTE[i % PALETTE.length] }}>■</span> {l.name}</span>)}
      </div>
    </div>
  );
}


// ── Share card: one card for a light or for a comparison (the same image the link preview uses) ───────────────────────────────
export function ShareLightsModal({ T, ids, onClose }) {
  const list = ids.join(',');
  const url = `${window.location.origin}${window.location.pathname}?lights=${list}`;
  const img = `${basePath()}index.php/api/og/lights.png?l=${list}&t=${Date.now()}`;
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { window.prompt('Copy this link', url); } };
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ ...box(T), width: '100%', maxWidth: 640, maxHeight: '90dvh', overflowY: 'auto', fontFamily: 'monospace' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, color: T.white || T.text }}>Share {ids.length === 1 ? 'light' : `comparison of ${ids.length} lights`}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.dim, fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <img src={img} alt="Share card" style={{ width: '100%', borderRadius: 8, border: `1px solid ${T.border}`, display: 'block', marginBottom: 10, background: '#0d1117', aspectRatio: '1200 / 630' }} />
        <div style={{ fontSize: 11, color: T.dim, marginBottom: 8 }}>Anyone with the link sees public readings only. This card is also the preview that appears when the link is posted.</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={copy} style={btnS(T, 'primary')}>{copied ? 'Copied ✓' : '🔗 Copy link'}</button>
          <a href={img} download="hcri-lights.png" style={{ ...btnS(T), textDecoration: 'none', display: 'inline-block' }}>↓ Download card</a>
          <a href={url} target="_blank" rel="noreferrer" style={{ ...btnS(T), textDecoration: 'none', display: 'inline-block' }}>Open link</a>
        </div>
      </div>
    </div>
  );
}

// What a shared link (?lights=ID or ?lights=ID,ID,...) shows, signed in or not: one light, or a comparison.
export function SharedLights({ T, ids }) {
  return <div style={{ padding: 16, maxWidth: 900, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
    {ids.length === 1 ? <LightDetail id={ids[0]} pub T={T} onChanged={() => {}} /> : <CompareLights ids={ids} pub T={T} />}
  </div>;
}

// ── The tab ──────────────────────────────────────────────────────────────────
export default function LightsTab({ T }) {
  const [lights, setLights] = useState(null);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(() => { try { const v = new URLSearchParams(window.location.search).get('light'); return v ? parseInt(v, 10) || null : null; } catch { return null; } });
  const [creating, setCreating] = useState(false);
  const [pick, setPick] = useState([]);       // light ids ticked for Compare
  const [comparing, setComparing] = useState(false);
  const [pub, setPub] = useState(() => { try { return new URLSearchParams(window.location.search).get('scope') === 'public'; } catch { return false; } });
  const blank = { name: '', brand: '', model: '', led_brand: '', led_model: '', optic: '', notes: '' };
  const [draft, setDraft] = useState(blank);

  const load = useCallback(() => { setLights(null); return api.get(pub ? '/lights/public' : '/lights').then((d) => { setLights(d); setErr(''); }).catch((e) => setErr(e.message)); }, [pub]);
  useEffect(() => { load(); }, [load]);
  const setScope = (v) => { setPub(v); setPick([]); setOpen(null); setCreating(false); try { const u = new URL(window.location.href); u.searchParams.delete('light'); if (v) u.searchParams.set('scope', 'public'); else u.searchParams.delete('scope'); window.history.replaceState(window.history.state, '', u); } catch {} };
  const go = (id) => { setOpen(id); try { const u = new URL(window.location.href); if (id) u.searchParams.set('light', id); else u.searchParams.delete('light'); window.history.replaceState(window.history.state, '', u); } catch {} };

  const create = async () => {
    if (!draft.name.trim()) return;
    try { const l = await api.post('/lights', draft); setCreating(false); setDraft(blank); await load(); go(l.id); } catch (e) { setErr(e.message); }
  };

  if (comparing) return <div style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}><CompareLights ids={pick} pub={pub} T={T} onBack={() => setComparing(false)} /></div>;
  if (open) return <div style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}><LightDetail id={open} pub={pub} T={T} onBack={() => go(null)} onChanged={load} /></div>;
  return (
    <div style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.white || T.text }}>Lights</div>
          <div style={{ fontSize: 12, color: T.dim }}>Group several readings of the same light. Add reports from My Reports with “Add to light”.</div>
        </div>
        {!pub && <button onClick={() => setCreating(true)} style={btnS(T, 'primary')}>+ New light</button>}
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[[false, 'My lights'], [true, 'Public lights']].map(([v, lab]) => (
          <button key={lab} onClick={() => setScope(v)} style={{ ...btnS(T), borderColor: pub === v ? T.accent : T.border, fontWeight: pub === v ? 700 : 400 }}>{lab}</button>
        ))}
      </div>
      {creating && (
        <div style={{ ...box(T), marginBottom: 12, display: 'grid', gap: 8 }}>
          <LightFields v={draft} set={setDraft} T={T} autoFocus />
          <div style={{ display: 'flex', gap: 8 }}><button onClick={create} style={btnS(T, 'primary')}>Create</button><button onClick={() => setCreating(false)} style={btnS(T)}>Cancel</button></div>
        </div>
      )}
      {err && <div style={{ color: T.bad, fontSize: 13 }}>{err}</div>}
      {!lights && !err && <div style={{ color: T.dim, fontSize: 13 }}>Loading…</div>}
      {lights && lights.length === 0 && !creating && <div style={{ color: T.dim, fontSize: 13, fontStyle: 'italic' }}>{pub ? 'No public lights yet: a light appears here once one of its readings is public.' : 'No lights yet. Create one, or select reports in My Reports and choose “Add to light”.'}</div>}
      <div style={{ display: 'grid', gap: 10 }}>
        {(lights || []).map((l) => <LightCard key={l.id} light={l} T={T} onOpen={() => go(l.id)} checked={pick.includes(l.id)} onCheck={() => setPick((c) => c.includes(l.id) ? c.filter((x) => x !== l.id) : [...c, l.id].slice(-8))} />)}
      </div>
      {pick.length > 0 && (
        <div style={{ position: 'sticky', bottom: 12, marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', boxShadow: '0 6px 24px rgba(0,0,0,0.45)' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text, flex: 1 }}>{pick.length} selected</span>
          <button onClick={() => setPick([])} style={btnS(T)}>Clear</button>
          <button disabled={pick.length < 2} onClick={() => setComparing(true)} style={{ ...btnS(T, 'primary'), opacity: pick.length < 2 ? 0.5 : 1 }}>Compare →</button>
        </div>
      )}
    </div>
  );
}

// ── "Add to light" modal, used from My Reports ───────────────────────────────
export function AddToLightModal({ T, reportIds, onClose, onDone }) {
  const [lights, setLights] = useState(null);
  const [draft, setDraft] = useState({ name: '', brand: '', model: '', led_brand: '', led_model: '', optic: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(null);     // { id, name } of the light just made or added to, so it can be opened straight away
  const [sugShown, setSugShown] = useState(false);
  useEffect(() => { api.get('/lights').then(setLights).catch((e) => setMsg(e.message)); }, []);
  // Suggested details: light brand + model, then LED brand, LED model and CCT, with anything after those (e.g. "- Turbo") dropped.
  useEffect(() => {
    api.post('/lights/suggest', { reportIds }).then((d) => {
      if (!d.name) return;
      setSugShown(true);
      setDraft((cur) => cur.name ? cur : { name: d.name, brand: d.brand || '', model: d.model || '', led_brand: d.ledBrand || '', led_model: d.ledModel || '', optic: d.optic || '' });
    }).catch(() => {});
  }, []); // eslint-disable-line
  const addTo = async (l) => {
    setBusy(true);
    try { const d = await api.post(`/lights/${l.id}/reports`, { reportIds }); setMsg(`Added ${d.added} reading${d.added === 1 ? '' : 's'} to “${l.name}”${d.added < reportIds.length ? ` (${reportIds.length - d.added} already there)` : ''}.`); setDone({ id: l.id, name: l.name }); onDone && onDone(); }
    catch (e) { setMsg(e.message); }
    setBusy(false);
  };
  const createAndAdd = async () => {
    if (!draft.name.trim()) return;
    setBusy(true);
    try { const l = await api.post('/lights', { ...draft, name: draft.name.trim(), reportIds }); setMsg(`Created “${l.name}” with ${l.count} reading${l.count === 1 ? '' : 's'}.`); setDone({ id: l.id, name: l.name }); onDone && onDone(); }
    catch (e) { setMsg(e.message); }
    setBusy(false);
  };
  const openHref = done ? `${window.location.pathname}?explore=lights&light=${done.id}` : '#';
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ ...box(T), width: '100%', maxWidth: 460, maxHeight: '85dvh', overflowY: 'auto', fontFamily: 'monospace' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, color: T.white || T.text }}>Add {reportIds.length} reading{reportIds.length === 1 ? '' : 's'} to a light</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.dim, fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        {msg && <div style={{ fontSize: 12, color: T.good || T.accent, marginBottom: 8 }}>{msg}</div>}
        {done ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a href={openHref} style={{ ...btnS(T, 'primary'), textDecoration: 'none', display: 'inline-block' }}>Open “{done.name}”</a>
            <button onClick={onClose} style={btnS(T)}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
              {lights === null ? <div style={{ color: T.dim, fontSize: 12 }}>Loading…</div> : lights.length === 0 ? <div style={{ color: T.dim, fontSize: 12 }}>No lights yet; create one below.</div> :
                lights.map((l) => (
                  <button key={l.id} disabled={busy} onClick={() => addTo(l)} style={{ ...btnS(T), textAlign: 'left', fontWeight: 400, padding: '8px 10px' }}>
                    <b>{l.name}</b> <span style={{ color: T.dim }}>{specLine(l)} · {l.count} reading{l.count === 1 ? '' : 's'}</span>
                  </button>
                ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 4 }}>Or create a new light</div>
            {sugShown && <div style={{ fontSize: 11, color: T.dim, marginBottom: 4 }}>Suggested from the selected reports; edit anything you like.</div>}
            <LightFields v={draft} set={setDraft} T={T} />
            <button disabled={busy || !draft.name.trim()} onClick={createAndAdd} style={{ ...btnS(T, 'primary'), marginTop: 8, opacity: draft.name.trim() ? 1 : 0.5 }}>Create light</button>
          </>
        )}
      </div>
    </div>
  );
}
