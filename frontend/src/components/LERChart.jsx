// frontend/src/components/LERChart.jsx
//
// Luminous Efficacy of Radiation: the spectrum S(λ) with the eye's photopic sensitivity V(λ) over it, and the part of the
// spectrum the eye actually counts (S·V) filled in. LER = 683.002 · ∫V·S / ∫S, in lm per optical watt, over 380-780 nm.
// The curve can be switched: V(λ) (the default, which is LER) or one of the CIE S 026 alpha-opic curves (S, M, L, rods,
// melanopic); the filled part and the readout follow it, and "Show all curves" draws them all over the spectrum.
// Props: wls/vals (the SPD), ler/lerLo/lerHi/lerPartial (from the server), theme.

import { useMemo, useState } from 'react';
import { vLambda } from './SPDChart.jsx';
import { ALPHA_OPIC, alphaAt } from '../lib/alphaOpic.js';

const CURVES = [
  { id: 'V', label: 'V(λ)', full: 'Photopic V(λ)', color: '#e3b341', at: (w) => vLambda(w) },
  ...ALPHA_OPIC.map((a, i) => ({ id: a.id, label: a.label, full: a.label + ' (CIE S 026)', color: ['#8c7bff', '#3fb96b', '#ef5b52', '#97a3b6', '#22b8d8'][i], at: (w) => alphaAt(a.values, w) })),
];
// What each toggle means (title, then text; shown on hover, focus or tap).
const TIPS = {
  V: 'V(λ): HOW BRIGHT LIGHT LOOKS\n\nThe eye\'s brightness sensitivity in normal light, peaking at 555 nm (green-yellow). This is the curve LER uses: the filled part of the spectrum is the part that makes brightness.',
  S: 'S CONE (CYANOPIC)\n\nThe short-wavelength cones, peaking at 448 nm (blue). Shows how much of the light the blue-sensing cones can use.',
  M: 'M CONE (CHLOROPIC)\n\nThe medium-wavelength cones, peaking at 541 nm (green).',
  L: 'L CONE (ERYTHROPIC)\n\nThe long-wavelength cones, peaking at 569 nm (yellow-red).',
  Rod: 'RODS (RHODOPIC)\n\nThe night-vision cells, peaking at 506 nm (blue-green). Related to how bright a light looks in dim conditions.',
  Mel: 'MELANOPIC (ipRGC)\n\nLight-sensitive cells in the eye that help set the body clock and alertness, peaking at 490 nm (cyan). The standard way to judge how circadian-active a light is.',
  all: 'SHOW ALL CURVES\n\nDraws all six sensitivity curves over the spectrum so you can see how each lines up with the light. Every curve peaks at 1. The curve you picked is the thick one and sets the filled area and the number.',
};
const loadPref = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch { return d; } };
const savePref = (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

const W = 640, H = 200, L = 34, R = 10, T = 10, B = 30;

function interpAt(wls, vals, w) {
  const n = wls.length;
  if (n === 0 || w < wls[0] || w > wls[n - 1]) return null; // never extend past what was measured
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (wls[m] <= w) lo = m; else hi = m; }
  const dx = wls[hi] - wls[lo];
  if (dx === 0) return vals[lo];
  const t = (w - wls[lo]) / dx;
  return vals[lo] * (1 - t) + vals[hi] * t;
}

export default function LERChart({ wls, vals, ler, lerLo, lerHi, lerPartial, theme: C = {} }) {
  const d = useMemo(() => {
    if (!wls || !vals || wls.length < 2) return null;
    // keep the first ascending block (some exports wrap back to a lower wavelength)
    let end = wls.length;
    for (let i = 1; i < wls.length; i++) if (wls[i] < wls[i - 1]) { end = i; break; }
    const ws = wls.slice(0, end), vs = vals.slice(0, end);
    const pts = [];
    let mx = 0;
    for (let w = 380; w <= 780; w++) {
      const s = interpAt(ws, vs, w);
      pts.push([w, s == null ? null : Math.max(0, s)]);
      if (s != null && s > mx) mx = s;
    }
    if (mx <= 0) return null;
    return { pts, mx };
  }, [wls, vals]);

  const [main, setMain] = useState(() => { const v = loadPref('hcri_ler_curve', 'V'); return CURVES.some((c) => c.id === v) ? v : 'V'; });
  const [all, setAll] = useState(() => loadPref('hcri_ler_all', '0') === '1');
  const cur = CURVES.find((c) => c.id === main) || CURVES[0];
  const [tip, setTip] = useState(null); // {text, x, y} for the toggle being hovered
  const showTip = (id) => (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const up = r.bottom + 200 > window.innerHeight && r.top > 200; // no room below: open above the toggle
    setTip({ text: TIPS[id], x: Math.max(8, Math.min(r.left, window.innerWidth - 256)), y: up ? r.top - 6 : r.bottom + 6, up });
  };
  const hideTip = () => setTip(null);
  // the share of the spectrum's power the chosen curve counts (for V(λ) this is LER / 683.002)
  const share = useMemo(() => {
    if (!d) return null;
    let num = 0, den = 0;
    for (const [w, sv] of d.pts) if (sv != null) { num += sv * cur.at(w); den += sv; }
    return den > 0 ? (100 * num) / den : null;
  }, [d, cur]);

  if (!d) {
    return <div style={{ height: 160, background: C.surface2, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim, fontSize: 11 }}>No spectral data</div>;
  }
  const x = (w) => L + ((w - 380) / 400) * (W - L - R);
  const y = (v) => T + (1 - v) * (H - T - B);
  const seg = (fn) => {
    // one path per run of measured wavelengths (a gap in the data breaks the line)
    const runs = []; let cur = [];
    for (const [w, s] of d.pts) { if (s == null) { if (cur.length) runs.push(cur); cur = []; } else cur.push([w, fn(w, s)]); }
    if (cur.length) runs.push(cur);
    return runs;
  };
  const line = (r) => r.map(([w, v], i) => `${i ? 'L' : 'M'}${x(w).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const area = (r) => `${line(r)}L${x(r[r.length - 1][0]).toFixed(1)},${y(0)}L${x(r[0][0]).toFixed(1)},${y(0)}Z`;
  const sRuns = seg((w, s) => s / d.mx);
  const svRuns = seg((w, s) => (s / d.mx) * cur.at(w));
  const curvePath = (c) => { const r = []; for (let w = 380; w <= 780; w += 2) r.push([w, c.at(w)]); return line(r); };
  const accent = C.accent || '#58a6ff', dim = C.dim || '#888', border = C.border || '#444', text = C.text || '#ddd';
  const fillColor = cur.color || accent;
  const curveColor = (c) => c.color || accent;
  const ticks = [400, 450, 500, 550, 600, 650, 700, 750];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxHeight: 250 }} role="img" aria-label={`Luminous efficacy of radiation ${ler != null ? ler + ' lumens per optical watt' : ''}`}>
        {[0, 0.5, 1].map((g) => <line key={g} x1={L} x2={W - R} y1={y(g)} y2={y(g)} stroke={border} strokeWidth="0.6" strokeDasharray={g === 0 ? '' : '2 3'} />)}
        {ticks.map((t) => <g key={t}><line x1={x(t)} x2={x(t)} y1={y(0)} y2={y(0) + 3} stroke={dim} strokeWidth="0.8" /><text x={x(t)} y={y(0) + 13} fontSize="9" fill={dim} textAnchor="middle" fontFamily="monospace">{t}</text></g>)}
        <text x={L - 5} y={y(1) + 3} fontSize="9" fill={dim} textAnchor="end" fontFamily="monospace">1</text>
        <text x={L - 5} y={y(0) + 3} fontSize="9" fill={dim} textAnchor="end" fontFamily="monospace">0</text>
        <text x={(L + W - R) / 2} y={H - 3} fontSize="9" fill={dim} textAnchor="middle" fontFamily="monospace">wavelength (nm)</text>
        {sRuns.map((r, i) => <path key={'s' + i} d={area(r)} fill={dim} opacity="0.18" />)}
        {svRuns.map((r, i) => <path key={'v' + i} d={area(r)} fill={fillColor} opacity="0.6" />)}
        {sRuns.map((r, i) => <path key={'l' + i} d={line(r)} fill="none" stroke={text} strokeWidth="1.3" />)}
        {all && CURVES.filter((c) => c.id !== cur.id).map((c) => <path key={'o' + c.id} d={curvePath(c)} fill="none" stroke={curveColor(c)} strokeWidth="1" opacity="0.75" />)}
        <path d={curvePath(cur)} fill="none" stroke={curveColor(cur)} strokeWidth="1.5" strokeDasharray={cur.id === 'V' ? '4 3' : ''} />
        {cur.id === 'V' && ler != null ? (
          <text x={W - R - 4} y={T + 16} fontSize="17" fontWeight="700" fill={text} textAnchor="end" fontFamily="monospace">{ler} lm/W</text>
        ) : share != null && (
          <text x={W - R - 4} y={T + 16} fontSize="17" fontWeight="700" fill={text} textAnchor="end" fontFamily="monospace">{share.toFixed(1)}%</text>
        )}
        {share != null && (
          <text x={W - R - 4} y={T + 30} fontSize="9.5" fill={dim} textAnchor="end" fontFamily="monospace">{cur.id === 'V' ? `${share.toFixed(1)}% of the power counted` : `of the power counted by ${cur.label}`}</text>
        )}
      </svg>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center', margin: '4px 0 2px' }}>
        {CURVES.map((c) => {
          const on = c.id === cur.id;
          return (
            <button key={c.id} type="button" aria-label={c.full} onMouseEnter={showTip(c.id)} onMouseLeave={hideTip} onFocus={showTip(c.id)} onBlur={hideTip} onClick={() => { setMain(c.id); savePref('hcri_ler_curve', c.id); }}
              style={{ cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, padding: '3px 9px', borderRadius: 12, border: `1px solid ${on ? curveColor(c) : border}`, background: on ? `${curveColor(c)}33` : 'transparent', color: on ? text : dim, fontWeight: on ? 700 : 400 }}>
              <span style={{ color: curveColor(c) }}>●</span> {c.label}
            </button>
          );
        })}
        <label onMouseEnter={showTip('all')} onMouseLeave={hideTip} style={{ fontSize: 11, color: dim, marginLeft: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <input type="checkbox" checked={all} onChange={(e) => { setAll(e.target.checked); savePref('hcri_ler_all', e.target.checked ? '1' : '0'); }} /> Show all curves
        </label>
      </div>
      {tip && (
        <div role="tooltip" style={{ position: 'fixed', left: tip.x, top: tip.y, transform: tip.up ? 'translateY(-100%)' : undefined, maxWidth: 240, zIndex: 9999, pointerEvents: 'none', whiteSpace: 'pre-line', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.7, padding: '10px 12px', borderRadius: 7, color: text, background: C.name === 'dark' ? '#1a3050' : '#f8faff', border: `1px solid ${border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          {tip.text}
        </div>
      )}
      <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.5, marginTop: 2 }}>
        <span style={{ color: fillColor }}>■</span> counted by {cur.id === 'V' ? 'the eye (spectrum × V(λ))' : `${cur.label} (spectrum × curve)`} &nbsp; <span style={{ opacity: 0.8 }}>■</span> the rest of the spectrum &nbsp; <span style={{ color: fillColor }}>{cur.id === 'V' ? '┄' : '─'}</span> {cur.id === 'V' ? 'V(λ)' : cur.full + ', peak = 1'}
        {lerPartial && <div style={{ color: C.warn || '#d29922' }}>Partial: only {lerLo}–{lerHi} nm was measured, so this reads higher than a full 380–780 nm value would.</div>}
      </div>
    </div>
  );
}
