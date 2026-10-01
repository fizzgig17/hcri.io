// frontend/src/components/OverlaySPD.jsx
//
// Reconstructed from assets/app.js (minified function OverlaySPD, plus the
// module-level SERIES_COLORS array it shares with CompareCard/compareExport).
// Overlays several reports' spectral power distributions on one inline-SVG
// chart (used by the comparison tool's "overlay" view) -- each series
// normalized to its own peak, a shared hover crosshair reading out every
// series' value at the hovered wavelength, and a swatch legend above the
// plot. In light theme, series colors are darkened (55%) so they stay
// legible on a white background.
import { useState } from 'react';
import { SERIES_COLORS } from '../lib/compareExport';

export default function OverlaySPD({ data, T: t }) {
  const [hoverWl, setHoverWl] = useState(null);
  const W = 900, H = 340, mL = 46, mR = 14, mT = 14, mB = 34;
  const pw = W - mL - mR, ph = H - mT - mB;
  const x0 = 380, x1 = 780;
  const X = wl => mL + ((wl - x0) / (x1 - x0)) * pw;
  const Y = v => mT + (1 - v) * ph;

  const darken = c => {
    if (!t || t.name === 'dark') return c;
    const mm = /([0-9a-f]{6})/i.exec(c);
    if (!mm) return c;
    const v = parseInt(mm[1], 16);
    return `rgb(${Math.round(((v >> 16) & 255) * 0.55)},${Math.round(((v >> 8) & 255) * 0.55)},${Math.round((v & 255) * 0.55)})`;
  };

  const series = (data || []).map((r, i) => {
    let wls = r.wls || [], vals = r.vals || [];
    let n = Math.min(wls.length, vals.length);
    // Stop at the first non-monotonic wavelength (defends against
    // malformed/concatenated SPD data).
    for (let j = 1; j < n; j++) {
      if (wls[j] < wls[j - 1]) { n = j; break; }
    }
    wls = wls.slice(0, n);
    vals = vals.slice(0, n);
    const color = darken(SERIES_COLORS[i % SERIES_COLORS.length]);
    if (n < 2) return { r, i, pts: [], wls: [], vals: [], vmax: 1, color };
    const vmax = Math.max.apply(null, vals) || 1;
    const pts = [];
    for (let j = 0; j < n; j++) pts.push([wls[j], Math.max(0, vals[j]) / vmax]);
    return { r, i, wls, vals, vmax, pts, color };
  });

  const path = s => (s.pts.length ? 'M' + s.pts.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' L') : '');

  // Linear-interpolate a series' normalized value at an arbitrary
  // wavelength (the hovered one, which rarely lands exactly on a sample),
  // clamping to the series' end values outside its own measured range.
  const valAt = (s, wl) => {
    if (!s.pts || s.pts.length < 2) return null;
    const ws = s.wls, vs = s.vals, n = ws.length;
    if (wl <= ws[0]) return s.pts[0][1];
    if (wl >= ws[n - 1]) return s.pts[n - 1][1];
    let j = 0;
    while (j < n - 1 && ws[j + 1] < wl) j++; // find the bracketing sample pair
    const fr = (wl - ws[j]) / (ws[j + 1] - ws[j] || 1); // 0..1 fraction between them
    return (Math.max(0, vs[j]) + (Math.max(0, vs[j + 1]) - Math.max(0, vs[j])) * fr) / s.vmax;
  };

  // Convert the pointer's pixel position (relative to the SVG's own
  // rendered size, which can differ from the W×H viewBox) into a
  // wavelength, and clear the crosshair once the cursor leaves the plot
  // area on either side.
  const onMove = ev => {
    const rc = ev.currentTarget.getBoundingClientRect();
    const px = ((ev.clientX - rc.left) / rc.width) * W;
    const wl = x0 + ((px - mL) / pw) * (x1 - x0);
    if (wl < x0 || wl > x1) { setHoverWl(null); return; }
    setHoverWl(wl);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginBottom: 10 }}>
        {series.map(s => (
          <span key={s.i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.dim, fontFamily: 'monospace' }}>
            <span style={{ width: 14, height: 3, background: s.color, borderRadius: 2, display: 'inline-block' }} />
            {s.r.label || 'Untitled'}{s.r.cct ? ` · ${s.r.cct}K` : ''}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block', touchAction: 'none' }}
        onMouseMove={onMove}
        onMouseLeave={() => setHoverWl(null)}
      >
        {[0, 0.5, 1].map((v, i) => (
          <g key={`y${i}`}>
            <line x1={mL} y1={Y(v)} x2={W - mR} y2={Y(v)} stroke={t.border} strokeWidth={1} />
            <text x={mL - 7} y={Y(v) + 3} textAnchor="end" fontSize={10} fill={t.dim} fontFamily="monospace">{v}</text>
          </g>
        ))}
        {[400, 500, 600, 700].map((wl, i) => (
          <g key={`x${i}`}>
            <line x1={X(wl)} y1={mT} x2={X(wl)} y2={mT + ph} stroke={t.border} strokeWidth={1} opacity={0.45} />
            <text x={X(wl)} y={H - 12} textAnchor="middle" fontSize={10} fill={t.dim} fontFamily="monospace">{wl}</text>
          </g>
        ))}
        {series.map(s => (
          <path key={`p${s.i}`} d={path(s)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        ))}
        {hoverWl != null && (
          <line x1={X(hoverWl)} y1={mT} x2={X(hoverWl)} y2={mT + ph} stroke={t.text} strokeWidth={1} opacity={0.4} />
        )}
        {hoverWl != null && series.map(s => {
          const v = valAt(s, hoverWl);
          return v == null ? null : <circle key={`d${s.i}`} cx={X(hoverWl)} cy={Y(v)} r={3.5} fill={s.color} />;
        })}
        <text x={mL + pw / 2} y={H - 1} textAnchor="middle" fontSize={10} fill={t.dim} fontFamily="monospace">wavelength (nm)</text>
      </svg>

      {hoverWl != null && (
        <div style={{ marginTop: 8, fontSize: 12, fontFamily: 'monospace', display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
          <span style={{ color: t.dim }}>{Math.round(hoverWl)} nm</span>
          {series.map(s => {
            const v = valAt(s, hoverWl);
            return v == null ? null : <span key={`r${s.i}`} style={{ color: s.color }}>{s.r.label || '?'} {v.toFixed(2)}</span>;
          })}
        </div>
      )}
    </div>
  );
}
