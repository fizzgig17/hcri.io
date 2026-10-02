// frontend/src/components/CVGWheel.jsx
//
// Reconstructed from assets/app.js (minified fn `fe`). Differs from the
// stale version this replaces: the polygon is now the REAL TM-30 Color
// Vector Graphic -- radius is the chroma ratio C_test/C_ref from the
// report's own `cvgTest` vectors (falling back to rcsBins/rhsBins, then a
// flat circle), not a made-up shape. Rf/Rg/CCT/Duv are drawn directly onto
// the canvas so they stay pixel-aligned with the wheel at any size, and an
// optional help tooltip explains the chart.

import { useRef, useEffect } from 'react';
import HelpTip from './HelpTip.jsx';
import { cvgPolygonPoints } from '../lib/colorimetry.js';

// Approximate color for a hue angle (degrees), used to tint the wheel's
// 16 sector wedges and bin-number labels.
function hueToRGB(h) {
  return [
    Math.max(30, Math.min(240, Math.round(128 + 127 * Math.cos((h * Math.PI) / 180)))),
    Math.max(30, Math.min(240, Math.round(128 + 127 * Math.cos(((h - 120) * Math.PI) / 180)))),
    Math.max(30, Math.min(240, Math.round(128 + 127 * Math.cos(((h + 120) * Math.PI) / 180)))),
  ];
}

// CVGWheel: the TM-30 Color Vector Graphic -- a 16-sector polar chart
// showing how far the source's chroma/hue shifts push each hue bin from
// the reference (polygon from cvgPolygonPoints), with Rf/Rg/CCT/Duv drawn
// directly on the canvas so they stay pixel-aligned with the wheel.
// `report` supplies the actual vectors (via cvgPolygonPoints); `rfBins`/
// `Rf`/`Rg`/`cct`/`duv` are the already-computed summary values to label it
// with; `size` is the wheel's diameter in CSS px (padding is added around it).
export default function CVGWheel({ report, rfBins, Rg, Rf, cct, duv, size = 280, theme: T = {}, noHelp }) {
  const ref = useRef();
  const pad = Math.round(size * 0.14);
  const total = size + pad * 2;
  const cx = total / 2, cy = total / 2;
  const rRef = size * 0.36;
  const rIn = size * 0.05;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = devicePixelRatio || 1;
    canvas.width = total * dpr; canvas.height = total * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    for (let h = 0; h < 16; h++) {
      const a1 = ((90 - h * 22.5) * Math.PI) / 180;
      const a2 = ((90 - (h + 1) * 22.5) * Math.PI) / 180;
      const [r, g, b] = hueToRGB(h * 22.5 + 11.25);
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, rRef + size * 0.055, a2, a1);
      ctx.closePath();
      ctx.fillStyle = `rgb(${Math.min(255, Math.round(160 + (r - 160) * 0.4))},${Math.min(255, Math.round(160 + (g - 160) * 0.4))},${Math.min(255, Math.round(160 + (b - 160) * 0.4))})`;
      ctx.fill();
    }

    ctx.beginPath(); ctx.arc(cx, cy, rRef, 0, Math.PI * 2);
    ctx.fillStyle = T.cvgInner || 'rgb(240,244,250)'; ctx.fill();

    [0.25, 0.5, 0.75, 1].forEach((f) => {
      ctx.beginPath(); ctx.arc(cx, cy, rRef * f, 0, Math.PI * 2);
      ctx.strokeStyle = f === 1 ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.12)';
      ctx.lineWidth = f === 1 ? 1.2 : 0.5; ctx.stroke();
    });

    ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 0.4;
    for (let h = 0; h < 16; h++) {
      const a = ((90 - h * 22.5) * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(cx + rIn * Math.cos(a), cy - rIn * Math.sin(a));
      ctx.lineTo(cx + rRef * Math.cos(a), cy - rRef * Math.sin(a));
      ctx.stroke();
    }

    const pts = (cvgPolygonPoints(report) || []).map((p) => [cx + rRef * p[0], cy - rRef * p[1]]);
    if (pts.length) {
      ctx.beginPath(); ctx.moveTo(...pts[0]);
      pts.slice(1).forEach((p) => ctx.lineTo(...p));
      ctx.closePath();
      ctx.fillStyle = 'rgba(200,30,30,0.12)'; ctx.fill();
      ctx.strokeStyle = 'rgba(190,25,25,0.9)'; ctx.lineWidth = 1.6; ctx.stroke();
      pts.forEach(([px, py]) => {
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(170,15,15,0.9)'; ctx.fill();
      });
    }

    ctx.beginPath(); ctx.arc(cx, cy, rRef, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.65)'; ctx.lineWidth = 1.3; ctx.stroke();

    ctx.font = `bold ${Math.round(size * 0.044)}px monospace`;
    ctx.fillStyle = (T.name || 'dark') === 'dark' ? 'rgba(210,226,240,0.92)' : 'rgba(20,20,20,0.9)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let h = 0; h < 16; h++) {
      const a = ((90 - h * 22.5) * Math.PI) / 180;
      const lr = rRef + size * 0.115;
      ctx.fillText(h + 1, cx + lr * Math.cos(a), cy - lr * Math.sin(a));
    }

    const rfVal = Rf == null ? '—' : String(Rf);
    const rgVal = Rg == null ? '—' : String(Rg);
    const dark = (T.name || 'dark') === 'dark';
    const rfColor = Rf == null ? (T.dim || '#6a9ab8') : Rf >= 85 ? (dark ? '#00e888' : '#007a3a') : Rf >= 70 ? (dark ? '#ffcc33' : '#996600') : (dark ? '#ff4466' : '#cc1133');
    const rgColor = Rg == null ? (T.dim || '#6a9ab8') : Math.abs(Rg - 100) <= 8 ? (dark ? '#00e888' : '#007a3a') : (dark ? '#ffcc33' : '#996600');

    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.font = `900 ${Math.round(size * 0.115)}px monospace`;
    ctx.fillStyle = rfColor;
    ctx.fillText(rfVal, pad * 0.12, pad * 0.08);
    ctx.font = `${Math.round(size * 0.05)}px monospace`;
    ctx.fillStyle = '#6a9ab8';
    ctx.fillText('Rf', pad * 0.12, pad * 0.08 + Math.round(size * 0.115) + 2);

    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.font = `900 ${Math.round(size * 0.115)}px monospace`;
    ctx.fillStyle = rgColor;
    ctx.fillText(rgVal, total - pad * 0.12, pad * 0.08);
    ctx.font = `${Math.round(size * 0.05)}px monospace`;
    ctx.fillStyle = '#6a9ab8';
    ctx.fillText('Rg', total - pad * 0.12, pad * 0.08 + Math.round(size * 0.115) + 2);

    const bY = cy + rRef * 0.62;
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = `bold ${Math.round(size * 0.042)}px monospace`;
    ctx.fillStyle = T.cvgSubText || 'rgba(30,30,30,0.55)';
    ctx.fillText('CCT', cx - rRef * 0.78, bY);
    ctx.font = `bold ${Math.round(size * 0.058)}px monospace`;
    ctx.fillStyle = T.cvgText || 'rgba(10,10,10,0.85)';
    ctx.fillText(cct ? cct + ' K' : '—', cx - rRef * 0.78, bY + size * 0.065);

    ctx.textAlign = 'right';
    ctx.font = `bold ${Math.round(size * 0.042)}px monospace`;
    ctx.fillStyle = T.cvgSubText || 'rgba(30,30,30,0.55)';
    ctx.fillText('Duv', cx + rRef * 0.78, bY);
    ctx.font = `bold ${Math.round(size * 0.058)}px monospace`;
    ctx.fillStyle = T.cvgText || 'rgba(10,10,10,0.85)';
    ctx.fillText(duv == null ? '—' : (duv >= 0 ? '+' : '') + duv.toFixed(4), cx + rRef * 0.78, bY + size * 0.065);
  }, [report, rfBins, Rg, Rf, cct, duv, size, T?.name]);

  return (
    <div style={{ flexShrink: 0, position: 'relative' }}>
      <canvas ref={ref} style={{ width: total, height: total, display: 'block' }} />
      {!noHelp && (
        <span style={{ position: 'absolute', top: -8, right: -8, zIndex: 6 }}>
          <HelpTip text={'COLOR VECTOR GRAPHIC\n\n\n\nShows how the source shifts the hue and saturation of 16 color groups versus a reference: points pushed outward render more saturated, inward less. Rf rates overall fidelity; Rg rates average saturation (100 = reference).'} />
        </span>
      )}
    </div>
  );
}
