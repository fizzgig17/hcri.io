// frontend/src/components/LERChart.jsx
//
// Luminous Efficacy of Radiation: the spectrum S(λ) with the eye's photopic sensitivity V(λ) over it, and the part of the
// spectrum the eye actually counts (S·V) filled in. LER = 683.002 · ∫V·S / ∫S, in lm per optical watt, over 380-780 nm.
// Props: wls/vals (the SPD), ler/lerLo/lerHi/lerPartial (from the server), theme.

import { useMemo } from 'react';
import { vLambda } from './SPDChart.jsx';

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
  const svRuns = seg((w, s) => (s / d.mx) * vLambda(w));
  const vPath = (() => { const r = []; for (let w = 380; w <= 780; w += 2) r.push([w, vLambda(w)]); return line(r); })();
  const accent = C.accent || '#58a6ff', dim = C.dim || '#888', border = C.border || '#444', text = C.text || '#ddd';
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
        {svRuns.map((r, i) => <path key={'v' + i} d={area(r)} fill={accent} opacity="0.6" />)}
        {sRuns.map((r, i) => <path key={'l' + i} d={line(r)} fill="none" stroke={text} strokeWidth="1.3" />)}
        <path d={vPath} fill="none" stroke={accent} strokeWidth="1.2" strokeDasharray="4 3" />
        {ler != null && (
          <text x={W - R - 4} y={T + 16} fontSize="17" fontWeight="700" fill={text} textAnchor="end" fontFamily="monospace">{ler} lm/W</text>
        )}
      </svg>
      <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.5, marginTop: 2 }}>
        <span style={{ color: accent }}>■</span> counted by the eye (spectrum × V(λ)) &nbsp; <span style={{ opacity: 0.8 }}>■</span> the rest of the spectrum &nbsp; <span style={{ color: accent }}>┄</span> V(λ)
        {lerPartial && <div style={{ color: C.warn || '#d29922' }}>Partial: only {lerLo}–{lerHi} nm was measured, so this reads higher than a full 380–780 nm value would.</div>}
      </div>
    </div>
  );
}
