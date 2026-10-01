// frontend/src/components/Chromaticity.jsx
//
// Reconstructed from assets/app.js (minified fns L, ne, Q1, H). Entirely
// new -- the stale ReportView.jsx this replaces had no chromaticity-diagram
// view at all. Draws the CIE 1931 (x,y) / 1960 (u,v) / 1976 (u',v') horseshoe
// diagrams plus a MacAdam-ellipse (SDCM) panel, each a white canvas with the
// visible gamut painted inside the spectral locus, isotherm ticks along the
// Planckian locus, and the report's own point marked.
//
// ChromaticityMini (Q1) is a single CIE1931-only diagram. ChromaticityPanel
// (H) is the full 4-panel view (1931/1960/1976/SDCM) plus a metrics strip.

import { useEffect, useRef } from 'react';
import { useTheme } from '../lib/ThemeContext.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';
import HelpTip from './HelpTip.jsx';
import {
  SPECTRAL_LOCUS_X, SPECTRAL_LOCUS_Y, PLANCK_LOCUS_X, PLANCK_LOCUS_Y,
  ISOTHERMS_1931, ISOTHERMS_1960, ISOTHERMS_1976, WAVELENGTH_LABELS,
  SDCM_ELLIPSES, xyToSrgb, xyToUv, uvToXy, upvpToXy,
} from '../lib/colorimetry.js';

// Low-level horseshoe-diagram renderer shared by all three xy/uv/u'v'
// panels: grid + axis labels, gamut fill (clipped to the locus, painted
// pixel-by-pixel via xyToSrgb), isotherm ticks, locus + Planckian-locus
// strokes, wavelength tick labels, and the report's own point.
function drawDiagram(canvas, {
  hsSX, hsSY, sx, sy, px, py, pixToXY,
  xmin, xmax, ymin, ymax, title, xlabel, ylabel,
  dotX, dotY, isotherms, wlLabels,
}) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = canvas.clientWidth, H = canvas.clientHeight;
  if (!W || !H) return;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const padL = 42, padR = 62, padT = 30, padB = 44;
  const cW = W - padL - padR, cH = H - padT - padB;
  const xOf = (v) => padL + ((v - xmin) / (xmax - xmin)) * cW;
  const yOf = (v) => padT + cH - ((v - ymin) / (ymax - ymin)) * cH;
  const X = (v) => xOf(v) * dpr, Y = (v) => yOf(v) * dpr;

  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = dpr * 0.5;
  for (let i = 0; i <= 6; i++) {
    const v = xmin + (i * (xmax - xmin)) / 6;
    ctx.beginPath(); ctx.moveTo(X(v), Y(ymin)); ctx.lineTo(X(v), Y(ymax)); ctx.stroke();
  }
  for (let i = 0; i <= 7; i++) {
    const v = ymin + (i * (ymax - ymin)) / 7;
    ctx.beginPath(); ctx.moveTo(X(xmin), Y(v)); ctx.lineTo(X(xmax), Y(v)); ctx.stroke();
  }

  const fs = Math.round(W * 0.03) * dpr;
  ctx.font = `${fs}px sans-serif`; ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.textAlign = 'center';
  for (let i = 1; i < 6; i++) {
    const v = xmin + (i * (xmax - xmin)) / 6;
    if (v > xmin + 0.01) ctx.fillText(v.toFixed(1), X(v), (padT + cH + fs + 2) * dpr / dpr);
  }
  ctx.textAlign = 'right';
  for (let i = 1; i <= 7; i++) {
    const v = ymin + (i * (ymax - ymin)) / 7;
    if (v < ymax - 0.01) ctx.fillText(v.toFixed(1), 38 * dpr, Y(v) + fs * 0.35);
  }

  ctx.fillStyle = 'rgba(0,0,120,0.85)';
  ctx.font = `bold ${Math.round(W * 0.04) * dpr}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(title, X((xmin + xmax) / 2), 25 * dpr);

  if (pixToXY && sx && sy) {
    ctx.save();
    ctx.beginPath(); ctx.rect(padL * dpr, padT * dpr, cW * dpr, cH * dpr); ctx.clip();
    const n = sx.length;
    const ax = sx.map((_, i) => xOf(hsSX[i]) - padL);
    const ay = sy.map((_, i) => yOf(hsSY[i]) - padT);
    const inside = (tx, ty) => {
      let c = false;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = ax[i], yi = ay[i], xj = ax[j], yj = ay[j];
        if (yi > ty !== yj > ty && tx < ((xj - xi) * (ty - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    const pw = Math.round(cW), ph = Math.round(cH);
    const off = document.createElement('canvas');
    off.width = pw; off.height = ph;
    const octx = off.getContext('2d');
    const img = octx.createImageData(pw, ph);
    const data = img.data;
    const step = Math.max(1, Math.round(cW / 260));
    for (let py2 = 0; py2 < ph; py2 += step) {
      for (let px2 = 0; px2 < pw; px2 += step) {
        if (!inside(px2 + 0.5, py2 + 0.5)) continue;
        const [vx, vy] = pixToXY((px2 / cW) * (xmax - xmin) + xmin, ((ph - py2) / ph) * (ymax - ymin) + ymin);
        const [r, g, b] = xyToSrgb(vx, vy);
        for (let dy = 0; dy < step && py2 + dy < ph; dy++) {
          for (let dx = 0; dx < step && px2 + dx < pw; dx++) {
            const idx = ((py2 + dy) * pw + (px2 + dx)) * 4;
            data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255;
          }
        }
      }
    }
    octx.putImageData(img, 0, 0);
    ctx.drawImage(off, padL * dpr, padT * dpr, cW * dpr, cH * dpr);
  }

  if (isotherms) {
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = dpr * 0.9;
    for (const e of isotherms) {
      ctx.beginPath(); ctx.moveTo(X(e.x1), Y(e.y1)); ctx.lineTo(X(e.x2), Y(e.y2)); ctx.stroke();
    }
  }

  // Spectral locus (horseshoe) stroke
  ctx.strokeStyle = 'rgba(0,0,0,0.65)'; ctx.lineWidth = dpr * 1.2;
  ctx.beginPath(); ctx.moveTo(X(hsSX[0]), Y(hsSY[0]));
  for (let i = 1; i < hsSX.length; i++) ctx.lineTo(X(hsSX[i]), Y(hsSY[i]));
  ctx.stroke();
  // Planckian locus stroke
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = dpr * 1.2;
  ctx.beginPath(); ctx.moveTo(X(sx[0]), Y(sy[0]));
  for (let i = 1; i < sx.length; i++) ctx.lineTo(X(sx[i]), Y(sy[i]));
  ctx.closePath(); ctx.stroke();

  // Wavelength labels along the locus (1931 panel only)
  const cx0 = X((xmin + xmax) * 0.38), cy0 = Y((ymin + ymax) * 0.38);
  if (wlLabels) {
    for (const { wl, i } of wlLabels) {
      if (i >= sx.length) continue;
      const x = X(sx[i]), y = Y(sy[i]);
      let ox = x - cx0, oy = y - cy0;
      const len = Math.sqrt(ox * ox + oy * oy) || 1;
      ox /= len; oy /= len;
      const [r, g, b] = xyToSrgb(hsSX[i] ?? sx[i], hsSY[i] ?? sy[i]);
      const col = `rgb(${Math.max(0, r - 40)},${Math.max(0, g - 40)},${Math.max(0, b - 40)})`;
      ctx.strokeStyle = col; ctx.lineWidth = dpr * 1.2;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + ox * 5 * dpr, y + oy * 5 * dpr); ctx.stroke();
      ctx.fillStyle = col; ctx.font = `${Math.round(W * 0.026) * dpr}px sans-serif`; ctx.textAlign = 'center';
      const lx = x + ox * 22 * dpr, ly = y + oy * 22 * dpr + Math.round(W * 0.026) * dpr * 0.35;
      if (lx < (W - padR - 2) * dpr) ctx.fillText(wl, lx, ly);
    }
  }

  // Report's point
  if (dotX != null && dotY != null) {
    const x = X(dotX), y = Y(dotY);
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = dpr * 0.5;
    ctx.setLineDash([3 * dpr, 3 * dpr]);
    ctx.beginPath(); ctx.moveTo(x, Y(ymin)); ctx.lineTo(x, Y(ymax)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(xmin), y); ctx.lineTo(X(xmax), y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(x, y, 5 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(30,80,220,0.85)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = dpr * 1.2; ctx.stroke();
  }

  // Isotherm CCT labels, right margin
  if (isotherms) {
    const fs2 = Math.round(W * 0.024) * dpr;
    ctx.font = `${fs2}px monospace`; ctx.textAlign = 'left';
    const labels = isotherms
      .map((e) => ({ cct: e.cct, ly: Y(e.y0) }))
      .filter((t) => t.ly > padT * dpr + fs2 && t.ly < (padT + cH) * dpr - fs2);
    const minGap = fs2 * 1.35;
    for (let pass = 0; pass < 30; pass++) {
      for (let i = 1; i < labels.length; i++) {
        const gap = labels[i].ly - labels[i - 1].ly;
        if (gap < minGap) { labels[i - 1].ly -= (minGap - gap) / 2; labels[i].ly += (minGap - gap) / 2; }
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    labels.forEach(({ cct, ly }) => {
      ctx.fillText(cct >= 1000 ? cct / 1000 + 'k' : String(cct), (W - padR + 4) * dpr, ly + fs2 * 0.35);
    });
  }

  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.font = `bold ${Math.round(W * 0.03) * dpr}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(xlabel, X((xmin + xmax) / 2), (H - 2) * dpr);
  ctx.save();
  ctx.translate(11 * dpr, Y((ymin + ymax) / 2));
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(ylabel, 0, 0);
  ctx.restore();
}

// SDCM (MacAdam ellipse) panel renderer. Draws a 5- and 10-step ellipse
// around whichever reference CCT point is closest to the report, plus the
// report's own (x,y). No-ops (blank) while SDCM_ELLIPSES is empty -- see
// the TODO in lib/colorimetry.js.
function drawSDCM(canvas, report) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = canvas.clientWidth, H = canvas.clientHeight;
  if (!W || !H || !report?.x || !report?.y || !SDCM_ELLIPSES.length) return;
  const { x, y } = report;
  let nearest = SDCM_ELLIPSES[0], best = Infinity;
  for (const e of SDCM_ELLIPSES) {
    const d = Math.hypot(e.cx - x, e.cy - y);
    if (d < best) { best = d; nearest = e; }
  }
  const spanX = Math.max(nearest.xspan * 1.6, 0.012);
  const spanY = Math.max(nearest.yspan * 1.6, 0.01);
  const xmin = nearest.cx - spanX, xmax = nearest.cx + spanX;
  const ymin = nearest.cy - spanY, ymax = nearest.cy + spanY;
  const padL = 44, padR = 14, padT = 34, padB = 44;
  const cW = W - padL - padR, cH = H - padT - padB;
  const xOf = (v) => padL + ((v - xmin) / (xmax - xmin)) * cW;
  const yOf = (v) => padT + cH - ((v - ymin) / (ymax - ymin)) * cH;
  const X = (v) => xOf(v) * dpr, Y = (v) => yOf(v) * dpr;

  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(0,0,0,0.10)'; ctx.lineWidth = dpr * 0.5;
  for (let i = 0; i <= 8; i++) {
    const vx = xmin + (i * (xmax - xmin)) / 8, vy = ymin + (i * (ymax - ymin)) / 8;
    ctx.beginPath(); ctx.moveTo(X(vx), Y(ymin)); ctx.lineTo(X(vx), Y(ymax)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(xmin), Y(vy)); ctx.lineTo(X(xmax), Y(vy)); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(0,0,120,0.85)';
  ctx.font = `bold ${Math.round(W * 0.04) * dpr}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('SDCM', X((xmin + xmax) / 2), 28 * dpr);
  ctx.save();
  ctx.beginPath(); ctx.rect(padL * dpr, padT * dpr, cW * dpr, cH * dpr); ctx.clip();
  for (const e of SDCM_ELLIPSES) {
    if (e.cx < xmin - 0.01 || e.cx > xmax + 0.01 || e.cy < ymin - 0.01 || e.cy > ymax + 0.01) continue;
    ctx.strokeStyle = 'rgba(200,150,0,0.9)'; ctx.lineWidth = dpr * 2;
    ctx.beginPath(); e.xs.forEach((vx, i) => (i === 0 ? ctx.moveTo(X(vx), Y(e.ys[i])) : ctx.lineTo(X(vx), Y(e.ys[i]))));
    ctx.closePath(); ctx.stroke();
    ctx.strokeStyle = 'rgba(30,80,200,0.75)'; ctx.lineWidth = dpr * 1.6;
    ctx.beginPath(); e.xb.forEach((vx, i) => (i === 0 ? ctx.moveTo(X(vx), Y(e.yb[i])) : ctx.lineTo(X(vx), Y(e.yb[i]))));
    ctx.closePath(); ctx.stroke();
  }
  ctx.restore();
  if (x >= xmin && x <= xmax && y >= ymin && y <= ymax) {
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = dpr * 0.5; ctx.setLineDash([3 * dpr, 3 * dpr]);
    ctx.beginPath(); ctx.moveTo(X(x), Y(ymin)); ctx.lineTo(X(x), Y(ymax)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(xmin), Y(y)); ctx.lineTo(X(xmax), Y(y)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(X(x), Y(y), 5 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220,0,0,0.9)'; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = dpr; ctx.stroke();
  }
  ctx.font = `${Math.round(W * 0.024) * dpr}px monospace`; ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillText(`x=${x.toFixed(4)}  y=${y.toFixed(4)}`, (padL + cW - 4) * dpr, (padT + cH - 6) * dpr);
}

// Single CIE1931-only diagram (e.g. for a compact card or share preview).
export function ChromaticityMini({ report, noHelp }) {
  const { theme } = useTheme();
  const ref = useRef();

  useEffect(() => {
    if (!report || report.x == null || report.y == null) return;
    let t;
    const draw = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (ref.current) {
          drawDiagram(ref.current, {
            hsSX: SPECTRAL_LOCUS_X, hsSY: SPECTRAL_LOCUS_Y,
            sx: SPECTRAL_LOCUS_X, sy: SPECTRAL_LOCUS_Y,
            px: PLANCK_LOCUS_X, py: PLANCK_LOCUS_Y,
            pixToXY: (x, y) => [x, y],
            xmin: 0, xmax: 0.8, ymin: 0, ymax: 0.9,
            title: 'CIE 1931', xlabel: 'x', ylabel: 'y',
            dotX: report.x, dotY: report.y,
            isotherms: ISOTHERMS_1931, wlLabels: WAVELENGTH_LABELS,
          });
        }
      }, 30);
    };
    draw();
    const ro = new ResizeObserver(draw);
    if (ref.current) ro.observe(ref.current);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [report, theme]);

  if (!report || report.x == null || report.y == null) return null;
  return (
    <div style={{ maxWidth: 480, width: '100%', margin: '0 auto', position: 'relative' }}>
      <div style={{ border: `1px solid ${theme.border}`, borderRadius: 6, overflow: 'hidden', background: '#fff' }}>
        <canvas ref={ref} style={{ width: '100%', aspectRatio: '1/1', display: 'block' }} />
      </div>
      {!noHelp && (
        <span style={{ position: 'absolute', top: 6, right: 6, zIndex: 6 }}>
          <HelpTip text={'CIE 1931 CHROMATICITY\n\n\n\nThe horseshoe outlines every color the eye can see; the inner curve is the Planckian (blackbody) locus of white points by temperature. The dot is this source’s (x, y); Duv is its distance above or below that locus.'} />
        </span>
      )}
    </div>
  );
}

// Full 4-panel chromaticity view: CIE1931, CIE1960, CIE1976, SDCM, plus a
// row of x/y/u'/v'/u/v/Duv metric chips above them.
export default function ChromaticityPanel({ report }) {
  const { theme } = useTheme();
  const isMobile = useIsMobile(768);
  const refs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (!report?.x || !report?.y) return;
    const { x, y, cct } = report;
    const uv = xyToUv(x, y);
    const hsU = SPECTRAL_LOCUS_X.map((_, i) => xyToUv(SPECTRAL_LOCUS_X[i], SPECTRAL_LOCUS_Y[i]).u);
    const hsV = SPECTRAL_LOCUS_X.map((_, i) => xyToUv(SPECTRAL_LOCUS_X[i], SPECTRAL_LOCUS_Y[i]).v);
    const hsUp = SPECTRAL_LOCUS_X.map((_, i) => xyToUv(SPECTRAL_LOCUS_X[i], SPECTRAL_LOCUS_Y[i]).up);
    const hsVp = SPECTRAL_LOCUS_X.map((_, i) => xyToUv(SPECTRAL_LOCUS_X[i], SPECTRAL_LOCUS_Y[i]).vp);
    const plU = PLANCK_LOCUS_X.map((_, i) => xyToUv(PLANCK_LOCUS_X[i], PLANCK_LOCUS_Y[i]).u);
    const plV = PLANCK_LOCUS_X.map((_, i) => xyToUv(PLANCK_LOCUS_X[i], PLANCK_LOCUS_Y[i]).v);
    const plUp = PLANCK_LOCUS_X.map((_, i) => xyToUv(PLANCK_LOCUS_X[i], PLANCK_LOCUS_Y[i]).up);
    const plVp = PLANCK_LOCUS_X.map((_, i) => xyToUv(PLANCK_LOCUS_X[i], PLANCK_LOCUS_Y[i]).vp);

    let t;
    const draw = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (refs[0].current) {
          drawDiagram(refs[0].current, {
            hsSX: SPECTRAL_LOCUS_X, hsSY: SPECTRAL_LOCUS_Y, sx: SPECTRAL_LOCUS_X, sy: SPECTRAL_LOCUS_Y,
            px: PLANCK_LOCUS_X, py: PLANCK_LOCUS_Y, pixToXY: (x2, y2) => [x2, y2],
            xmin: 0, xmax: 0.8, ymin: 0, ymax: 0.9, title: 'CIE 1931', xlabel: 'x', ylabel: 'y',
            dotX: x, dotY: y, isotherms: ISOTHERMS_1931, wlLabels: WAVELENGTH_LABELS,
          });
        }
        if (refs[1].current) {
          drawDiagram(refs[1].current, {
            hsSX: hsU, hsSY: hsV, sx: hsU, sy: hsV, px: plU, py: plV,
            pixToXY: (u, v) => uvToXy(u, v),
            xmin: 0, xmax: 0.65, ymin: 0, ymax: 0.45, title: 'CIE 1960', xlabel: 'u', ylabel: 'v',
            dotX: uv.u, dotY: uv.v, isotherms: ISOTHERMS_1960,
          });
        }
        if (refs[2].current) {
          drawDiagram(refs[2].current, {
            hsSX: hsUp, hsSY: hsVp, sx: hsUp, sy: hsVp, px: plUp, py: plVp,
            pixToXY: (up, vp) => upvpToXy(up, vp),
            xmin: 0, xmax: 0.65, ymin: 0, ymax: 0.62, title: "CIE 1976", xlabel: "u'", ylabel: "v'",
            dotX: uv.up, dotY: uv.vp, isotherms: ISOTHERMS_1976,
          });
        }
        if (refs[3].current) drawSDCM(refs[3].current, report);
      }, 30);
    };
    draw();
    const ro = new ResizeObserver(draw);
    refs.forEach((r) => r.current && ro.observe(r.current));
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [report, theme]);

  if (!report) return null;
  const T = theme;
  const uv = report.x && report.y ? xyToUv(report.x, report.y) : null;
  const chips = [
    ['CCT', report.cct ? report.cct + 'K' : null, T.accent],
    ['x', report.x?.toFixed(4), T.text],
    ['y', report.y?.toFixed(4), T.text],
    ["u'", uv?.up.toFixed(4), T.text],
    ["v'", uv?.vp.toFixed(4), T.text],
    ['u', uv?.u.toFixed(4), T.dim],
    ['v', uv?.v.toFixed(4), T.dim],
    ['Duv', report.duv == null ? null : (report.duv >= 0 ? '+' : '') + report.duv.toFixed(4),
      Math.abs(report.duv ?? 1) < 0.006 ? T.good : Math.abs(report.duv ?? 1) < 0.012 ? T.warn : T.bad],
  ].filter(([, v]) => v != null);

  return (
    <div style={{ overflowY: 'auto', height: '100%', background: T.bg }}>
      <div style={{ padding: '8px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {chips.map(([label, value, color]) => (
          <div key={label} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 4, padding: '3px 9px' }}>
            <span style={{ fontSize: 10, color: T.dim, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700, marginRight: 5 }}>{label}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color, fontFamily: 'monospace' }}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 6, padding: 8, maxWidth: 800, margin: '0 auto' }}>
        {refs.map((r, i) => (
          <div key={i} style={{ border: `1px solid ${T.border}`, borderRadius: 6, overflow: 'hidden', background: '#fff' }}>
            <canvas ref={r} style={{ width: '100%', aspectRatio: '1/1', display: 'block' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
