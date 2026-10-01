// frontend/src/components/CompareCard.jsx
//
// Reconstructed from assets/app.js (minified function CompareCard). One
// report's card in the comparison tool: a wavelength-gradient-filled SPD
// mini-plot (inline SVG, gradient stops from wlRGB), a tint badge, and a
// 3-column grid of CCT/Duv/Ra/R9/Rf/Rg metric tiles. Clicking the card (if
// onOpen is given) opens the full report.
import { tintInfo, wlRGB } from '../lib/compareExport';

function metricColor(t, k, v) {
  if (v == null) return t.text;
  if (k === 'Ra') return v >= 90 ? t.good : v >= 80 ? t.warn : t.bad;
  if (k === 'R9') return v >= 80 ? t.good : v >= 50 ? t.warn : t.bad;
  if (k === 'Rf') return v >= 90 ? t.good : v >= 80 ? t.warn : t.bad;
  if (k === 'Rg') return v >= 95 && v <= 105 ? t.good : v >= 90 && v <= 110 ? t.warn : t.bad;
  return t.text;
}
const fmt = v => (v == null ? '—' : String(Math.round(v)));

export default function CompareCard({ r, T: t, color, onOpen }) {
  const label = r.label || 'Untitled';
  let wls = r.wls || [], vals = r.vals || [];
  let n = Math.min(wls.length, vals.length);
  const W = 320, H = 120; // mini-plot's internal SVG coordinate space (viewBox units)
  let pts = [], grad = [], area = '', line = '', peakWl = null, peakXn = 0;

  // Stop at the first non-monotonic wavelength -- defends against
  // malformed/concatenated SPD data the same way OverlaySPD does.
  for (let j = 1; j < n; j++) {
    if (wls[j] < wls[j - 1]) { n = j; break; }
  }

  if (n >= 2) {
    const st = wls[0], en = wls[n - 1], sp = Math.max(1e-9, en - st); // sp: wavelength span, floored to avoid /0
    const vmax = Math.max.apply(null, vals) || 1;
    let pk = 0;
    for (let i = 1; i < n; i++) if (vals[i] > vals[pk]) pk = i;
    peakWl = wls[pk];
    peakXn = (wls[pk] - st) / sp; // peak's x position as a 0..1 fraction of the plot width, for the dashed marker line
    for (let i = 0; i < n; i++) {
      // Map each (wavelength, value) sample onto the W×H SVG box: x by
      // position in the wavelength range, y inverted (SVG y grows downward,
      // but a taller bar means more power) and normalized to the peak value.
      const x = ((wls[i] - st) / sp) * W;
      const y = H - (Math.max(0, vals[i]) / vmax) * H;
      pts.push([x, y]);
    }
    // Sample 20 evenly-spaced wavelengths across the plotted range and turn
    // each into a visible-spectrum color, feeding the <linearGradient> that
    // fills the area under the curve (so the fill looks like the rainbow of
    // the light itself rather than a flat color).
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const wl = st + (sp * i) / steps;
      grad.push({ o: i / steps, c: wlRGB(wl) });
    }
    // `area`: closed path from the x-axis up along the curve and back down,
    // for the gradient fill. `line`: the open curve itself, stroked on top.
    area = `M0,${H} ` + pts.map(p => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ` L${W},${H} Z`;
    line = 'M' + pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L');
  }

  const gid = 'cg' + r.id;
  const sf = t.surface2 || t.bg;
  const tint = tintInfo(r.duv);
  const cells = [
    ['CCT', r.cct == null ? '—' : String(r.cct), 'K', t.accent],
    ['Duv', r.duv == null ? '—' : (r.duv >= 0 ? '+' : '') + r.duv.toFixed(4), '', t.text],
    ['Ra', fmt(r.ra), '', metricColor(t, 'Ra', r.ra)],
    ['R9', fmt(r.r9), '', metricColor(t, 'R9', r.r9)],
    ['Rf', fmt(r.Rf), '', metricColor(t, 'Rf', r.Rf)],
    ['Rg', fmt(r.Rg), '', metricColor(t, 'Rg', r.Rg)],
  ];

  return (
    <div
      onClick={onOpen}
      title={onOpen ? 'Click to view full report' : undefined}
      style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, height: '100%', boxSizing: 'border-box', cursor: onOpen ? 'pointer' : undefined }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, justifyContent: 'space-between', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
          {color && <span style={{ width: 9, height: 9, borderRadius: 9, background: color, flexShrink: 0 }} />}
          <div style={{ fontSize: 16, fontWeight: 800, color: t.text, fontFamily: 'monospace', whiteSpace: 'normal', overflowWrap: 'anywhere', wordBreak: 'break-word', minWidth: 0, lineHeight: 1.3 }}>
            {label}
          </div>
        </div>
        {tint && (
          <span style={{ display: 'inline-block', alignSelf: 'flex-start', background: `${tint.color}22`, border: `1px solid ${tint.color}`, color: tint.color, borderRadius: 4, padding: '2px 8px', fontSize: 10, fontFamily: 'monospace', fontWeight: 700 }}>
            {tint.label}
          </span>
        )}
      </div>

      <div style={{ background: sf, border: `1px solid ${t.border}`, borderRadius: 8, padding: '8px 8px 5px' }}>
        <div style={{ fontSize: 9, color: t.dim, fontFamily: 'monospace', marginBottom: 4, letterSpacing: 0.5, fontWeight: 700 }}>
          SPECTRAL POWER DISTRIBUTION
        </div>
        {n >= 2 ? (
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 90, display: 'block' }}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
                {grad.map((g, i) => <stop key={i} offset={g.o} stopColor={g.c} />)}
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gid})`} opacity={0.62} />
            <path d={line} fill="none" stroke={t.text} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
            {peakWl != null && (
              <line x1={peakXn * W} y1={0} x2={peakXn * W} y2={H} stroke={t.accent} strokeWidth={1} strokeDasharray="3 3" opacity={0.75} vectorEffect="non-scaling-stroke" />
            )}
          </svg>
        ) : (
          <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.dim, fontFamily: 'monospace', fontSize: 11 }}>
            No spectral data
          </div>
        )}
        {n >= 2 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: t.dim, fontFamily: 'monospace', marginTop: 2 }}>
            <span>{Math.round(wls[0])}nm</span>
            {peakWl != null && <span style={{ color: t.accent }}>peak {Math.round(peakWl)}nm</span>}
            <span>{Math.round(wls[n - 1])}nm</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {cells.map((c, i) => (
          <div key={i} style={{ background: sf, border: `1px solid ${t.border}`, borderRadius: 8, padding: '7px 9px' }}>
            <div style={{ fontSize: 9, color: t.dim, fontFamily: 'monospace', fontWeight: 700, letterSpacing: 0.5 }}>{c[0]}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: c[3], fontFamily: 'monospace', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {c[1]}{c[2] && <span style={{ fontSize: 10, color: t.dim, marginLeft: 2, fontWeight: 400 }}>{c[2]}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
