// frontend/src/components/SPDChart.jsx
//
// Reconstructed from assets/app.js (minified fn `ce`). Differs from the
// stale version this replaces: draws a dashed reference-illuminant curve
// (blackbody below 4000K, CIE daylight above) scaled to match the test
// curve's integrated power, truncates any trailing wavelength points that
// go backwards (duplicate/garbage tail some instrument exports have), and
// adds a crosshair + value tooltip on hover. Theme-aware (dark/light).

import { useEffect, useRef, useState } from 'react';
import { xTicks, referenceSpectrum } from '../lib/colorimetry.js';

function wlToRGB(wl) {
  if (wl < 380) return [80, 0, 130];
  if (wl < 440) { const t = (wl - 380) / 60; return [0, 0, Math.min(255, Math.round(130 + 125 * t))]; }
  if (wl < 490) { const t = (wl - 440) / 50; return [0, Math.round(255 * t), 255]; }
  if (wl < 510) { const t = (wl - 490) / 20; return [0, 255, Math.round(255 * (1 - t))]; }
  if (wl < 580) { const t = (wl - 510) / 70; return [Math.round(255 * t), Math.round(255 * (1 - t * 0.2)), 0]; }
  if (wl < 645) { const t = (wl - 580) / 65; return [255, Math.round(180 * (1 - t)), 0]; }
  if (wl <= 780) { const t = (wl - 645) / 135; return [Math.round(255 * (1 - t * 0.3)), 0, 0]; }
  return [80, 0, 0];
}

// Visible-light luminous-efficiency weights (CIE V(λ)), 380-780nm @5nm --
// used to scale the reference curve to the same *visual* brightness as
// the test curve rather than raw integrated power.
const V_LAMBDA = [
  0.000039,0.000064,0.00012,0.000217,0.000396,0.00064,0.00121,0.00218,0.004,0.0073,0.0116,0.01684,0.023,0.0298,0.038,0.048,
  0.06,0.0739,0.09098,0.1126,0.13902,0.1693,0.20802,0.2586,0.323,0.4073,0.503,0.6082,0.71,0.7932,0.862,0.91485,0.954,
  0.9803,0.99495,1,0.995,0.9786,0.952,0.9154,0.87,0.8163,0.757,0.6949,0.631,0.5668,0.503,0.4412,0.381,0.321,0.265,0.217,
  0.175,0.1382,0.107,0.0816,0.061,0.04458,0.032,0.0232,0.017,0.01192,0.00821,0.005723,0.004102,0.002929,0.002091,0.001484,
  0.001047,0.00074,0.00052,0.000361,0.000249,0.000172,0.00012,0.0000848,0.00006,0.0000424,0.00003,0.0000212,0.0000149,
];
function vLambda(wl) {
  if (wl <= 380) return V_LAMBDA[0];
  if (wl >= 780) return V_LAMBDA[V_LAMBDA.length - 1];
  const x = (wl - 380) / 5, k = Math.floor(x), q = x - k;
  return V_LAMBDA[k] * (1 - q) + (V_LAMBDA[k + 1] ?? V_LAMBDA[k]) * q;
}

export default function SPDChart({ wls, vals, cct, theme: T = {} }) {
  const ref = useRef();
  const geomRef = useRef(null);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !wls?.length) return;
    let w = wls, v = vals;
    const breakIdx = w.findIndex((x, i) => i > 0 && x < w[i - 1]);
    if (breakIdx > 0) { w = w.slice(0, breakIdx); v = v.slice(0, breakIdx); }

    const dpr = devicePixelRatio || 1;
    const W = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 400;
    const H = canvas.offsetHeight || canvas.parentElement?.offsetHeight || 160;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const pL = 42, pR = 12, pT = 10, pB = 32;
    const cW = W - pL - pR, cH = H - pT - pB;
    const minWl = Math.min(...w), span = Math.max(1, Math.max(...w) - minWl);

    // Reference illuminant curve, scaled to match the test curve's
    // visually-weighted power.
    let ref_ = null;
    if (cct && cct > 0) {
      const rawRef = w.map((wl) => referenceSpectrum(wl, cct));
      const weights = w.map((wl) => vLambda(wl));
      const powTest = w.reduce((s, _, i) => s + v[i] * weights[i], 0);
      const powRef = w.reduce((s, _, i) => s + rawRef[i] * weights[i], 0);
      const scale = powRef > 0 ? powTest / powRef : 1;
      ref_ = rawRef.map((x) => x * scale);
    }

    const maxV = Math.max(...v);
    const maxAll = ref_ ? Math.max(maxV, ...ref_) : maxV;
    const M = maxAll > 0 ? maxAll : 1;
    geomRef.current = { minWl, span, cW, left: pL };

    ctx.fillStyle = T.chartBg || 'rgba(0,0,0,0.2)'; ctx.fillRect(pL, pT, cW, cH);
    ctx.strokeStyle = T.gridLine || 'rgba(255,255,255,0.07)'; ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const gy = pT + cH - (i / 4) * cH;
      ctx.beginPath(); ctx.moveTo(pL, gy); ctx.lineTo(pL + cW, gy); ctx.stroke();
    }
    xTicks(minWl, minWl + span).forEach((wl) => {
      const gx = pL + ((wl - minWl) / span) * cW;
      if (gx < pL || gx > pL + cW) return;
      ctx.beginPath(); ctx.moveTo(gx, pT); ctx.lineTo(gx, pT + cH); ctx.stroke();
    });

    // Colored fill under the test curve
    w.forEach((wl, i) => {
      if (i === 0) return;
      const mid = (wl + w[i - 1]) / 2;
      const [r, g, b] = wlToRGB(Math.round(mid));
      const x1 = pL + ((w[i - 1] - minWl) / span) * cW, x2 = pL + ((wl - minWl) / span) * cW;
      const avgH = ((v[i - 1] + v[i]) / 2 / M) * cH * 0.95;
      ctx.fillStyle = `rgba(${Math.min(255, Math.round(180 + (r - 180) * 0.55))},${Math.min(255, Math.round(180 + (g - 180) * 0.55))},${Math.min(255, Math.round(180 + (b - 180) * 0.55))},0.9)`;
      ctx.fillRect(x1, pT + cH - avgH, Math.max(0.5, x2 - x1), avgH);
    });

    // Test curve
    ctx.beginPath();
    w.forEach((wl, i) => {
      const px = pL + ((wl - minWl) / span) * cW, py = pT + cH - (v[i] / M) * cH * 0.95;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.strokeStyle = T.spdCurve || 'rgba(220,40,40,0.9)'; ctx.lineWidth = 1.5; ctx.stroke();

    // Reference curve (dashed)
    if (ref_) {
      ctx.beginPath();
      w.forEach((wl, i) => {
        const px = pL + ((wl - minWl) / span) * cW, py = pT + cH - (ref_[i] / M) * cH * 0.95;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.strokeStyle = T.name === 'dark' ? 'rgba(200,200,200,0.55)' : 'rgba(80,80,80,0.55)';
      ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
    }

    ctx.strokeStyle = T.axisBorder || 'rgba(100,140,180,0.4)'; ctx.lineWidth = 0.8; ctx.strokeRect(pL, pT, cW, cH);
    ctx.font = '12px monospace'; ctx.fillStyle = T.axisLabel || 'rgba(160,200,230,0.9)'; ctx.textAlign = 'center';
    const ticks = xTicks(minWl, minWl + span);
    ticks.forEach((wl, i) => {
      const gx = pL + ((wl - minWl) / span) * cW;
      if (gx < pL || gx > pL + cW) return;
      ctx.textAlign = i === 0 ? 'left' : i === ticks.length - 1 ? 'right' : 'center';
      ctx.fillText(wl, gx, pT + cH + 14);
    });
    ctx.textAlign = 'center'; ctx.fillStyle = T.dim || '#7aaccc'; ctx.font = '11px monospace';
    ctx.fillText('Wavelength (nm)', pL + cW / 2, H - 4);
    ctx.textAlign = 'right'; ctx.font = '11px monospace';
    ['0', '0.5', '1.0'].forEach((l, i) => ctx.fillText(l, pL - 4, pT + cH - (i / 2) * cH + 3));

    ctx.font = 'bold 12px monospace'; ctx.textAlign = 'left';
    ctx.strokeStyle = 'rgba(220,40,40,0.9)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(pL + 8, pT + 8); ctx.lineTo(pL + 22, pT + 8); ctx.stroke();
    ctx.fillStyle = '#e8f4ff'; ctx.fillText('Test', pL + 26, pT + 12);
    ctx.strokeStyle = 'rgba(180,180,180,0.6)'; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(pL + 55, pT + 8); ctx.lineTo(pL + 69, pT + 8); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = T.spdDimText || '#7aaccc'; ctx.fillText('Reference', pL + 73, pT + 12);
  }, [wls, vals, cct, T?.name]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 160 }}>
      <canvas
        ref={ref}
        style={{ width: '100%', height: 160, display: 'block', cursor: 'crosshair' }}
        onMouseMove={(ev) => {
          const g = geomRef.current;
          if (!g || !wls?.length) return;
          const rect = ref.current.getBoundingClientRect();
          const mx = ev.clientX - rect.left;
          if (mx < g.left || mx > g.left + g.cW) { setHover(null); return; }
          const wl = g.minWl + ((mx - g.left) / g.cW) * g.span;
          let bestK = 0, bestD = Infinity;
          for (let k = 0; k < wls.length; k++) {
            const d = Math.abs(wls[k] - wl);
            if (d < bestD) { bestD = d; bestK = k; }
          }
          const v = +vals[bestK];
          const vs = Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 1 ? v.toFixed(2) : v.toFixed(4);
          setHover({ x: mx, wl: Math.round(wls[bestK]), vs, flip: mx > rect.width * 0.6 });
        }}
        onMouseLeave={() => setHover(null)}
      />
      {hover && (
        <div style={{ position: 'absolute', left: hover.x, top: 10, height: 118, width: 1, background: T.spdCurve || 'rgba(220,40,40,0.5)', pointerEvents: 'none' }} />
      )}
      {hover && (
        <div style={{
          position: 'absolute', top: 6, left: hover.x,
          transform: hover.flip ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
          pointerEvents: 'none', background: T.surface || 'rgba(15,18,26,0.96)',
          border: `1px solid ${T.border || 'rgba(255,255,255,0.18)'}`, borderRadius: 6,
          padding: '4px 8px', fontSize: 12, fontFamily: 'monospace', color: T.text || '#e8f4ff',
          whiteSpace: 'nowrap', zIndex: 5, boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}>
          <span>{hover.wl} nm</span>
          <span style={{ color: T.dim || '#7aaccc', marginLeft: 8 }}>{hover.vs}</span>
        </div>
      )}
    </div>
  );
}
