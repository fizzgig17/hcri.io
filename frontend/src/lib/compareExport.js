// frontend/src/lib/compareExport.js
//
// Reconstructed from assets/app.js (minified SERIES_COLORS/TINT/tintKey/
// tintInfo/roundRect/wlRGB/compareShareCard/compareExportPNG). Non-component
// helpers behind the comparison tool's "share card" and "export PNG"
// features.
//
// compareShareCard(data, view, theme) draws a themed canvas (not React --
// it's handed to a caller that turns it into an image, e.g. for copying or
// previewing a shareable card) for either an "overlay" view (one spectral
// plot with all reports' curves) or the default "cards" view (up to 3
// per-report cards with their own SPD plot + metric tiles), matching the
// current theme's colors.
//
// compareExportPNG(data) is a separate, fixed-dark-theme canvas render
// (not theme-aware -- always the dark palette) that always lays the
// reports out as one overlay plot plus a metrics table underneath, then
// immediately triggers a download of "hcri-comparison.png". This is a
// CLIENT-side export distinct from the server-side OG image generators in
// api/og_compare.php / api/og_image*.php (those render share-link preview
// images server-side for social/link unfurling; this one is a
// user-initiated "Export PNG" button that needs no server round-trip and
// works for logged-out/guest comparisons too).
import { fmtTZ } from './tz';

export const SERIES_COLORS = [
  '#58a6ff', '#3fb978', '#e0719b', '#d29922', '#a371f7', '#2ec4b6',
  '#f85149', '#ff9f40', '#8ddb5e', '#c97bd6', '#22d3ee', '#818cf8',
];

const TINT = {
  rosy: { label: 'Rosy', color: '#e0719b' },
  neutral: { label: 'Neutral', color: '#8a96a3' },
  green: { label: 'Green', color: '#9bbf3a' },
};

// Duv-based tint classification shared by the explore report card, the
// comparison card, and the share-card/export renderers below.
export function tintKey(d) {
  return d == null ? null : d < -0.002 ? 'rosy' : d > 0.002 ? 'green' : 'neutral';
}

export function tintInfo(d) {
  const k = tintKey(d);
  return k ? { key: k, label: TINT[k].label, color: TINT[k].color } : null;
}

// Rounded-rect path helper used by all the canvas drawing below.
export function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

// Approximate visible-spectrum wavelength -> rgb() string, with a dimming
// factor ("q") at the violet/deep-red edges. Used for the SPD gradient
// fills in CompareCard and the share-card plots.
export function wlRGB(wl) {
  if (wl < 380 || wl > 750) return 'rgb(70,75,85)';
  let r, g, b;
  if (wl < 440) { r = -(wl - 440) / 60; g = 0; b = 1; }
  else if (wl < 490) { r = 0; g = (wl - 440) / 50; b = 1; }
  else if (wl < 510) { r = 0; g = 1; b = -(wl - 510) / 20; }
  else if (wl < 580) { r = (wl - 510) / 70; g = 1; b = 0; }
  else if (wl < 645) { r = 1; g = -(wl - 645) / 65; b = 0; }
  else { r = 1; g = 0; b = 0; }
  const q = wl < 420 ? 0.3 + (0.7 * (wl - 380)) / 40
    : wl > 700 ? 0.3 + (0.7 * (750 - wl)) / 50
    : 1;
  return `rgb(${Math.round(255 * r * q)},${Math.round(255 * g * q)},${Math.round(255 * b * q)})`;
}

function metricColor(TX, GD, WN, BAD, k, v) {
  if (v == null) return TX;
  if (k === 'Ra') return v >= 90 ? GD : v >= 80 ? WN : BAD;
  if (k === 'R9') return v >= 80 ? GD : v >= 50 ? WN : BAD;
  if (k === 'Rf') return v >= 90 ? GD : v >= 80 ? WN : BAD;
  if (k === 'Rg') return v >= 95 && v <= 105 ? GD : v >= 90 && v <= 110 ? WN : BAD;
  return TX;
}

// Draws a themed canvas for the comparison "share card" -- either a single
// overlay plot ("overlay" view) or up to 3 stacked per-report cards
// (anything else). Returns the <canvas>; the caller decides what to do
// with it (copy to clipboard, show a preview, etc).
export function compareShareCard(data, view, theme) {
  const d = (data || []).filter(Boolean);
  if (!d.length) return null;

  const dark = theme && theme.name === 'dark';
  const BG = (theme && theme.bg) || (dark ? '#0d1117' : '#ffffff');
  const SF = (theme && theme.surface) || (dark ? '#161b22' : '#f4f6f8');
  const BD = (theme && theme.border) || (dark ? '#303841' : '#d5dce3');
  const TX = (theme && theme.text) || (dark ? '#e6edf3' : '#0d1117');
  const DM = (theme && theme.dim) || (dark ? '#8a96a3' : '#5a6673');
  const AC = (theme && theme.accent) || '#58a6ff';
  const GD = (theme && theme.good) || '#3fb978';
  const WN = '#d29922';
  const BAD = '#f85149';

  const W = view === 'overlay' ? 820 : 440;
  const pad = 20;
  const now = fmtTZ(undefined, undefined, true);
  const headH = 68;
  const mc = (k, v) => metricColor(TX, GD, WN, BAD, k, v);

  const brand = c => {
    c.textBaseline = 'alphabetic';
    c.textAlign = 'left';
    c.fillStyle = TX; c.font = '800 26px monospace'; c.fillText('hCRI', pad, pad + 22);
    c.fillStyle = AC; c.fillText('.io', pad + 62, pad + 22);
    c.fillStyle = DM; c.font = '400 11px monospace'; c.fillText('LED  ·  TM-30  ·  COLOR RENDERING', pad, pad + 40);
    c.textAlign = 'right';
    c.fillStyle = DM; c.font = '400 12px monospace'; c.fillText(now, W - pad, pad + 14);
    c.fillStyle = TX; c.font = '700 13px monospace';
    c.fillText(d.length + ' light' + (d.length > 1 ? 's' : '') + ' compared', W - pad, pad + 34);
    c.textAlign = 'left';
    c.fillStyle = BD; c.fillRect(pad, pad + 52, W - pad * 2, 1);
  };

  const foot = (c, H) => {
    c.textAlign = 'left';
    c.fillStyle = AC; c.font = '700 13px monospace'; c.fillText('hCRI.io', pad, H - 16);
    c.fillStyle = DM; c.font = '400 11px monospace'; c.fillText('High-CRI LED & flashlight spectral analysis', pad + 70, H - 16);
  };

  const drawPlot = (c, px, py, pw, phh) => {
    c.fillStyle = SF; roundRect(c, px, py, pw, phh, 10); c.fill();
    c.strokeStyle = BD; c.lineWidth = 1; roundRect(c, px, py, pw, phh, 10); c.stroke();
    const mL = 44, mB = 26, ax0 = px + mL, ay0 = py + 14, aw = pw - mL - 16, ah = phh - mB - 14, x0 = 380, x1 = 780;
    const X = wl => ax0 + ((wl - x0) / (x1 - x0)) * aw;
    const Y = v => ay0 + (1 - v) * ah;
    c.strokeStyle = BD; c.fillStyle = DM; c.font = '400 10px monospace';
    [0, 0.5, 1].forEach(v => {
      c.globalAlpha = 0.5; c.beginPath(); c.moveTo(ax0, Y(v)); c.lineTo(ax0 + aw, Y(v)); c.stroke(); c.globalAlpha = 1;
      c.textAlign = 'right'; c.fillText(String(v), ax0 - 6, Y(v) + 3);
    });
    [400, 500, 600, 700].forEach(wl => {
      c.globalAlpha = 0.3; c.beginPath(); c.moveTo(X(wl), ay0); c.lineTo(X(wl), ay0 + ah); c.stroke(); c.globalAlpha = 1;
      c.textAlign = 'center'; c.fillText(String(wl), X(wl), py + phh - 9);
    });
    c.fillStyle = DM; c.textAlign = 'center'; c.fillText('wavelength (nm)', ax0 + aw / 2, py + phh);
    d.forEach((rp, i) => {
      const wls = rp.wls || [], vals = rp.vals || [], n = Math.min(wls.length, vals.length);
      if (n < 2) return;
      const vmax = Math.max.apply(null, vals) || 1;
      c.strokeStyle = SERIES_COLORS[i % SERIES_COLORS.length]; c.lineWidth = 2; c.lineJoin = 'round';
      c.beginPath();
      for (let j = 0; j < n; j++) {
        const xx = X(wls[j]), yy = Y(Math.max(0, vals[j]) / vmax);
        j ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
      }
      c.stroke();
    });
    const ly = ay0 + 4;
    c.textAlign = 'right'; c.font = '400 11px monospace';
    d.forEach((rp, i) => {
      const yy = ly + i * 16;
      c.fillStyle = SERIES_COLORS[i % SERIES_COLORS.length]; c.fillRect(ax0 + aw - 140, yy - 7, 11, 4);
      c.fillStyle = TX;
      let nm = rp.label || 'Untitled';
      if (nm.length > 16) nm = nm.slice(0, 15) + '…';
      c.fillText(nm + (rp.cct ? '  ' + rp.cct + 'K' : ''), ax0 + aw - 6, yy);
    });
  };

  const drawCard = (c, rp, i, cx, cy, cw, cardH) => {
    c.fillStyle = SF; roundRect(c, cx, cy, cw, cardH, 12); c.fill();
    c.strokeStyle = BD; c.lineWidth = 1; roundRect(c, cx, cy, cw, cardH, 12); c.stroke();

    const ix = cx + 16;
    c.fillStyle = SERIES_COLORS[i % SERIES_COLORS.length];
    c.beginPath(); c.arc(ix + 5, cy + 22, 5, 0, 7); c.fill();

    c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.fillStyle = TX; c.font = '700 16px monospace';
    let nm = rp.label || 'Untitled';
    if (nm.length > 36) nm = nm.slice(0, 35) + '…';
    c.fillText(nm, ix + 16, cy + 27);

    const duv = rp.duv;
    const tint = duv == null ? '' : duv < -0.002 ? 'Rosy' : duv > 0.002 ? 'Green' : 'Neutral';
    if (tint) {
      c.font = '700 10px monospace';
      const tw = c.measureText(tint).width + 14, ty = cy + 37;
      c.fillStyle = dark ? '#3a2230' : '#fde7f0'; roundRect(c, ix, ty, tw, 17, 8); c.fill();
      c.fillStyle = '#e0719b'; c.fillText(tint, ix + 7, ty + 12);
    }

    const sx = ix, sy = cy + 62, sw = cw - 32, sh = 108;
    c.fillStyle = (theme && theme.surface2) || (theme && theme.bg) || (dark ? '#0d1117' : '#ffffff');
    roundRect(c, sx, sy, sw, sh, 8); c.fill();
    c.strokeStyle = BD; c.lineWidth = 1; roundRect(c, sx, sy, sw, sh, 8); c.stroke();

    c.fillStyle = DM; c.font = '700 9px monospace'; c.textAlign = 'left';
    c.fillText('SPECTRAL POWER DISTRIBUTION', sx + 10, sy + 15);

    const wls = rp.wls || [], vals = rp.vals || [], n = Math.min(wls.length, vals.length);
    const px = sx + 10, pw = sw - 20, py = sy + 22, ph = sh - 42;
    const x0 = n ? Math.min(350, Math.floor(Math.min.apply(null, wls) / 50) * 50) : 350;
    const x1 = n ? Math.max(800, Math.ceil(Math.max.apply(null, wls) / 50) * 50) : 800;
    const X = wl => px + ((wl - x0) / (x1 - x0)) * pw;
    const vmax = n ? Math.max.apply(null, vals) || 1 : 1;
    const Y = v => py + ph - (Math.max(0, v) / vmax) * ph;

    if (n > 1) {
      // A fixed rainbow gradient (not wlRGB-sampled like CompareCard's SVG
      // version) spanning roughly violet->red across the visible range,
      // used only as a canvas fillRect clipped to the area under the curve.
      const grad = c.createLinearGradient(X(380), 0, X(720), 0);
      grad.addColorStop(0, '#6a2fb5'); grad.addColorStop(0.12, '#2b3bff'); grad.addColorStop(0.28, '#00b3ff');
      grad.addColorStop(0.42, '#00d05a'); grad.addColorStop(0.55, '#8ede00'); grad.addColorStop(0.66, '#ffe000');
      grad.addColorStop(0.8, '#ff7a00'); grad.addColorStop(1, '#e0203a');

      // Clip to the closed curve-and-baseline path, then flood-fill that
      // clipped region with the gradient -- canvas has no "fill under a
      // path" primitive, so clip+fillRect stands in for it.
      c.save();
      c.beginPath(); c.moveTo(X(wls[0]), py + ph);
      for (let j = 0; j < n; j++) c.lineTo(X(wls[j]), Y(vals[j]));
      c.lineTo(X(wls[n - 1]), py + ph); c.closePath(); c.clip();
      c.globalAlpha = 0.62; c.fillStyle = grad; c.fillRect(px, py, pw, ph); c.globalAlpha = 1;
      c.restore();

      // Stroke the curve itself on top, clipped to a 1px-padded plot
      // rectangle so the line doesn't bleed past the card's edges.
      c.save();
      c.beginPath(); c.rect(px, py - 1, pw, ph + 2); c.clip();
      c.strokeStyle = TX; c.lineWidth = 1.3; c.lineJoin = 'round';
      c.beginPath();
      for (let j = 0; j < n; j++) {
        const xx = X(wls[j]), yy = Y(vals[j]);
        j ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
      }
      c.stroke();
      c.restore();

      let pk = wls[0], pv = -1;
      for (let j = 0; j < n; j++) if (vals[j] > pv) { pv = vals[j]; pk = wls[j]; }

      c.strokeStyle = AC; c.setLineDash([3, 3]);
      c.beginPath(); c.moveTo(X(pk), py); c.lineTo(X(pk), py + ph); c.stroke(); c.setLineDash([]);

      c.fillStyle = AC; c.font = '700 9px monospace'; c.textAlign = 'center';
      c.fillText('peak ' + Math.round(pk) + 'nm', sx + sw / 2, sy + sh - 5);
    }

    c.fillStyle = DM; c.font = '400 9px monospace'; c.textAlign = 'left';
    c.fillText(x0 + 'nm', sx + 10, sy + sh - 5);
    c.textAlign = 'right'; c.fillText(x1 + 'nm', sx + sw - 10, sy + sh - 5);

    const mg = 8, my0 = sy + sh + 16, colW = (cw - 32 - mg * 2) / 3, boxH = 48;
    const rows = [
      [['CCT', rp.cct, 'K'], ['Duv', rp.duv, ''], ['Ra', rp.ra, '']],
      [['R9', rp.r9, ''], ['Rf', rp.Rf, ''], ['Rg', rp.Rg, '']],
    ];
    rows.forEach((row, ri) => {
      row.forEach((m, ci) => {
        const [k, v, u] = m;
        const bx = ix + ci * (colW + mg), by = my0 + ri * (boxH + mg);
        c.strokeStyle = BD; c.lineWidth = 1; roundRect(c, bx, by, colW, boxH, 8); c.stroke();
        c.textAlign = 'left'; c.fillStyle = DM; c.font = '700 10px monospace'; c.fillText(k, bx + 10, by + 17);
        c.fillStyle = k === 'CCT' ? AC : k === 'Duv' ? TX : mc(k, v);
        c.font = '800 18px monospace';
        const vs = v == null ? '—' : k === 'Duv' ? (v > 0 ? '+' : '') + Number(v).toFixed(4) : String(Math.round(v));
        c.fillText(vs, bx + 10, by + 39);
        if (u && v != null) {
          const vw = c.measureText(vs).width;
          c.fillStyle = DM; c.font = '400 9px monospace'; c.fillText(u, bx + 10 + vw + 3, by + 39);
        }
      });
    });
  };

  if (view === 'overlay') {
    const plotH = 380, H = headH + plotH + 54;
    const cv = document.createElement('canvas');
    cv.width = W * 2; cv.height = H * 2;
    const c = cv.getContext('2d'); c.scale(2, 2);
    c.fillStyle = BG; c.fillRect(0, 0, W, H);
    brand(c);
    drawPlot(c, pad, headH + 6, W - pad * 2, plotH);
    foot(c, H);
    return cv;
  }

  const cards = d.slice(0, 3), cardH = 304, gap = 14;
  const cardsBlock = cards.length * (cardH + gap);
  const H = headH + 6 + cardsBlock + 34;
  const cv = document.createElement('canvas');
  cv.width = W * 2; cv.height = H * 2;
  const c = cv.getContext('2d'); c.scale(2, 2);
  c.fillStyle = BG; c.fillRect(0, 0, W, H);
  brand(c);
  const cy0 = headH + 10;
  cards.forEach((rp, i) => drawCard(c, rp, i, pad, cy0 + i * (cardH + gap), W - pad * 2, cardH));
  foot(c, H);
  return cv;
}

// Fixed dark-theme canvas export: one overlay plot + a metrics table,
// downloaded immediately as "hcri-comparison.png". Unlike compareShareCard
// this ignores the app's current theme (it always renders in dark colors)
// and always triggers a download rather than returning the canvas.
export function compareExportPNG(data) {
  if (typeof window !== 'undefined' && window.track) window.track('compare_export');
  const d = (data || []).filter(Boolean);
  if (!d.length) return;

  const BG = '#0d1117', SF = '#161b22', BD = '#303841', TX = '#e6edf3', DM = '#8a96a3', AC = '#58a6ff';
  const W = 1200, pad = 48, plotH = 400, rowH = 40, nMetrics = 6;
  const tableTop = pad + 44 + plotH + 30;
  const H = tableTop + (nMetrics + 1) * rowH + 62;

  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  c.fillStyle = BG; c.fillRect(0, 0, W, H);
  c.textBaseline = 'alphabetic';
  c.fillStyle = TX; c.font = '700 30px monospace'; c.textAlign = 'left';
  c.fillText('hCRI.io  Comparison', pad, pad + 12);
  c.fillStyle = DM; c.font = '400 16px monospace';
  c.fillText(d.length + ' light' + (d.length > 1 ? 's' : ''), pad, pad + 36);

  const px = pad, py = pad + 46, pw = W - pad * 2, phh = plotH, mL = 54, mB = 34;
  c.fillStyle = SF; roundRect(c, px, py, pw, phh, 12); c.fill();
  c.strokeStyle = BD; c.lineWidth = 1; roundRect(c, px, py, pw, phh, 12); c.stroke();

  const ax0 = px + mL, ay0 = py + 16, aw = pw - mL - 18, ah = phh - mB - 16, x0 = 380, x1 = 780;
  const X = wl => ax0 + ((wl - x0) / (x1 - x0)) * aw;
  const Y = v => ay0 + (1 - v) * ah;

  c.strokeStyle = BD; c.fillStyle = DM; c.font = '400 12px monospace';
  [0, 0.5, 1].forEach(v => {
    c.globalAlpha = 0.6; c.beginPath(); c.moveTo(ax0, Y(v)); c.lineTo(ax0 + aw, Y(v)); c.stroke(); c.globalAlpha = 1;
    c.textAlign = 'right'; c.fillText(String(v), ax0 - 8, Y(v) + 4);
  });
  [400, 500, 600, 700].forEach(wl => {
    c.globalAlpha = 0.4; c.beginPath(); c.moveTo(X(wl), ay0); c.lineTo(X(wl), ay0 + ah); c.stroke(); c.globalAlpha = 1;
    c.textAlign = 'center'; c.fillText(String(wl), X(wl), py + phh - 12);
  });
  c.textAlign = 'center'; c.fillStyle = DM; c.fillText('wavelength (nm)', ax0 + aw / 2, py + phh);

  d.forEach((r, i) => {
    const wls = r.wls || [], vals = r.vals || [], n = Math.min(wls.length, vals.length);
    if (n < 2) return;
    const vmax = Math.max.apply(null, vals) || 1;
    c.strokeStyle = SERIES_COLORS[i % SERIES_COLORS.length]; c.lineWidth = 2.4; c.lineJoin = 'round';
    c.beginPath();
    for (let j = 0; j < n; j++) {
      const xx = X(wls[j]), yy = Y(Math.max(0, vals[j]) / vmax);
      j ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
    }
    c.stroke();
  });

  const lx = ax0 + aw, ly = ay0 + 8;
  c.textAlign = 'right'; c.font = '400 13px monospace';
  d.forEach((r, i) => {
    const yy = ly + i * 20;
    c.fillStyle = SERIES_COLORS[i % SERIES_COLORS.length]; c.fillRect(lx - 156, yy - 9, 14, 4);
    c.fillStyle = TX;
    let nm = r.label || 'Untitled';
    if (nm.length > 20) nm = nm.slice(0, 19) + '…';
    c.fillText(nm + (r.cct ? `  ${r.cct}K` : ''), lx - 8, yy);
  });

  const cols = d.length, labW = 120, colW = (W - pad * 2 - labW) / cols;
  const fmt = v => (v == null ? '—' : String(Math.round(v)));

  c.textAlign = 'left'; c.font = '700 14px monospace';
  d.forEach((r, i) => {
    c.fillStyle = SERIES_COLORS[i % SERIES_COLORS.length];
    let nm = r.label || 'Untitled';
    if (nm.length > 16) nm = nm.slice(0, 15) + '…';
    c.fillText(nm, pad + labW + i * colW, tableTop - 10);
  });

  const rows = [
    ['CCT', r => (r.cct == null ? '—' : r.cct + 'K'), () => AC],
    ['Duv', r => (r.duv == null ? '—' : (r.duv >= 0 ? '+' : '') + r.duv.toFixed(4)), () => TX],
    ['Ra', r => fmt(r.ra), r => metricColor(TX, '#3fb978', '#d29922', '#f85149', 'Ra', r.ra)],
    ['R9', r => fmt(r.r9), r => metricColor(TX, '#3fb978', '#d29922', '#f85149', 'R9', r.r9)],
    ['Rf', r => fmt(r.Rf), r => metricColor(TX, '#3fb978', '#d29922', '#f85149', 'Rf', r.Rf)],
    ['Rg', r => fmt(r.Rg), r => metricColor(TX, '#3fb978', '#d29922', '#f85149', 'Rg', r.Rg)],
  ];
  rows.forEach((row, ri) => {
    const ry = tableTop + ri * rowH;
    c.fillStyle = ri % 2 ? '#11161d' : SF;
    c.fillRect(pad, ry, W - pad * 2, rowH);
    c.fillStyle = DM; c.font = '700 14px monospace'; c.textAlign = 'left';
    c.fillText(row[0], pad + 12, ry + rowH / 2 + 5);
    c.font = '700 15px monospace';
    d.forEach((r, i) => {
      c.fillStyle = row[2](r);
      c.fillText(String(row[1](r)), pad + labW + i * colW, ry + rowH / 2 + 5);
    });
  });

  c.fillStyle = AC; c.font = '700 16px monospace'; c.textAlign = 'left';
  c.fillText('hCRI.io', pad, H - 22);
  c.fillStyle = DM; c.font = '400 13px monospace';
  c.fillText('High-CRI LED & flashlight spectral analysis', pad + 86, H - 22);

  try {
    const a = document.createElement('a');
    a.download = 'hcri-comparison.png';
    a.href = cv.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (e) {}
}
