// frontend/src/components/AnnexEModal.jsx
//
// Reconstructed from assets/app.js (minified fn `ie`). The "TM-30 Report"
// action (see ReportActionsMenu) opens this: a full-screen modal that
// renders an IES TM-30-18 "Annex E" style report onto one big canvas
// (SPD, local chroma/hue/fidelity bars, CVG wheel, CES-99 bars, metric
// tiles, chromaticity/CRI mini-panel) and offers PNG and server-rendered
// PDF downloads. Entirely new -- the stale ReportView.jsx this replaces
// had its PDF download button present but disabled ("hidden for now") and
// no client-side preview at all.
//
// If the report has no rcsBins yet (an older report that predates the
// bin-level TM-30 analysis), it POSTs to /api/reports/:id/recalc once on
// open to backfill them before drawing.

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../lib/ThemeContext.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { getToken } from '../lib/api.js';
import { fmtTZ } from '../lib/tz.js';
import { xTicks, cvgPolygonPoints, referenceSpectrum } from '../lib/colorimetry.js';

// Approximate color for a hue angle (degrees), used to tint the
// chroma/hue/fidelity bars, CVG wheel sectors, and CES-99 bars.
function hueToRGB(h) {
  return [
    Math.max(30, Math.min(240, Math.round(128 + 127 * Math.cos((h * Math.PI) / 180)))),
    Math.max(30, Math.min(240, Math.round(128 + 127 * Math.cos(((h - 120) * Math.PI) / 180)))),
    Math.max(30, Math.min(240, Math.round(128 + 127 * Math.cos(((h + 120) * Math.PI) / 180)))),
  ];
}

export default function AnnexEModal({ report, onClose }) {
  const canvasRef = useRef();
  const { theme: T } = useTheme();
  const [ready, setReady] = useState(false);
  const [data, setData] = useState(report);
  const [pdfBusy, setPdfBusy] = useState(false);
  const isMobile = useIsMobile(768);

  useEffect(() => {
    if ((!data.rcsBins || data.rcsBins.length === 0) && data.id) {
      fetch(`./index.php/api/reports/${data.id}/recalc`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` } })
        .then((r) => r.json())
        .then((r) => { if (r.rcsBins) setData((d) => ({ ...d, ...r })); })
        .catch(() => {});
    }
  }, [data.id]);

  const PAGE_H = 1070;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const r = data;
    try {
      const dark = (() => { try { return (localStorage.getItem('hcri_theme') || 'dark') === 'dark'; } catch { return false; } })();
      const colText = dark ? '#9fc4e8' : '#1a3a5c';
      const colAccent = dark ? '#7fb4e6' : '#2d6a9f';
      const colBorder = dark ? '#3a4d66' : '#c8d4e0';
      const colDim = dark ? '#7d8fa6' : '#888';
      const colStrong = dark ? '#e4ecf7' : '#222';

      canvas.width = 825 * 2; canvas.height = PAGE_H * 2;
      canvas.style.width = '825px'; canvas.style.height = '1070px';
      const c = canvas.getContext('2d');
      c.scale(2, 2);

      let rfBins = r.rfBins || Array(16).fill(r.Rf || 75);
      let rcsBins = r.rcsBins || Array(16).fill(0);
      let rhsBins = r.rhsBins || Array(16).fill(0);
      const Rf = r.Rf ?? null, Rg = r.Rg ?? null, cct = r.cct ?? null, duv = r.duv ?? null;
      const ra = r.ra ?? null, r9 = r.r9 ?? null;
      let wls = r.wls || [], vals = r.vals || [];
      const breakIdx = wls.findIndex((w, k) => k > 0 && w < wls[k - 1]);
      if (breakIdx > 0) { wls = wls.slice(0, breakIdx); vals = vals.slice(0, breakIdx); }

      const fidelityColor = (v) =>
        v == null ? (dark ? '#8496ad' : '#aaa')
        : v >= 90 ? (dark ? '#4ecb78' : '#1a7a3a')
        : v >= 80 ? (dark ? '#7fce4a' : '#3a7a1a')
        : v >= 70 ? (dark ? '#e8b445' : '#9a6600')
        : (dark ? '#ff5c5c' : '#c0001a');

      // Header band
      c.fillStyle = dark ? '#0b1019' : '#fafbfc'; c.fillRect(0, 0, 825, PAGE_H);
      c.fillStyle = dark ? '#16203a' : colText; c.fillRect(0, 0, 825, 48);
      c.fillStyle = dark ? '#e8f0fa' : '#ffffff'; c.font = 'bold 16px sans-serif';
      c.textAlign = 'left'; c.textBaseline = 'middle';
      c.fillText('IES TM-30-18', 22, 20);
      c.fillStyle = dark ? 'rgba(14,20,32,0.65)' : 'rgba(255,255,255,0.65)'; c.font = '11px sans-serif';
      c.fillText('Color Rendition Report', 22, 35);
      c.textAlign = 'right';
      c.fillStyle = dark ? 'rgba(14,20,32,0.9)' : 'rgba(255,255,255,0.9)'; c.font = 'bold 13px sans-serif';
      c.fillText('hcri.io', 803, 20);
      c.fillStyle = dark ? 'rgba(14,20,32,0.5)' : 'rgba(255,255,255,0.5)'; c.font = '10px sans-serif';
      c.fillText(fmtTZ((r.createdAt || '').replace(' ', 'T'), { year: 'numeric', month: 'short', day: 'numeric' }, true), 803, 35);

      c.fillStyle = dark ? '#161f30' : '#f0f4f8'; c.fillRect(0, 52, 825, 34);
      c.strokeStyle = colBorder; c.lineWidth = 0.5;
      c.beginPath(); c.moveTo(0, 86); c.lineTo(825, 86); c.stroke();

      // Source / category strip
      const cat = (k) => ((r.categories && r.categories[k]) || []).map((x) => x && x.value).filter(Boolean).join(', ');
      const cols = [['SOURCE', r.label || '—']];
      [
        ['LIGHT', [cat('light_brand'), cat('light_model')].filter(Boolean).join(' ')],
        ['LED', [cat('led_brand'), cat('led_model')].filter(Boolean).join(' ')],
        ['CCT', cat('led_cct')],
        ['OPTIC', cat('optic')],
      ].forEach((p) => p[1] && cols.push(p));
      const colW = 825 / cols.length;
      cols.forEach(([k, v], i) => {
        const x = i * colW + 16;
        c.fillStyle = colDim; c.font = 'bold 8px sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top';
        c.fillText(k, x, 57);
        c.fillStyle = colStrong; c.font = '11px sans-serif'; c.textBaseline = 'top';
        let txt = v, avail = colW - 20;
        while (c.measureText(txt).width > avail && txt.length > 3) txt = txt.slice(0, -1);
        if (txt !== v) txt += '…';
        c.fillText(txt, x, 68);
        if (i > 0) { c.strokeStyle = colBorder; c.lineWidth = 0.5; c.beginPath(); c.moveTo(i * colW, 58); c.lineTo(i * colW, 80); c.stroke(); }
      });

      c.fillStyle = dark ? '#111a29' : '#ffffff'; c.fillRect(0, 86, 825, 52);
      c.strokeStyle = colBorder; c.lineWidth = 0.5;
      c.beginPath(); c.moveTo(0, 138); c.lineTo(825, 138); c.stroke();

      // Metric tiles
      const tiles = [
        ['Rf', Rf == null ? '—' : String(Rf), fidelityColor(Rf), 'Color Fidelity'],
        ['Rg', Rg == null ? '—' : String(Rg), Math.abs((Rg || 100) - 100) <= 8 ? (dark ? '#4ecb78' : '#1a7a3a') : (dark ? '#e8b445' : '#9a6600'), 'Gamut Index'],
        ['CCT', cct == null ? '—' : cct + ' K', colAccent, 'Color Temp.'],
        ['Duv', duv == null ? '—' : (duv >= 0 ? '+' : '') + duv.toFixed(4), Math.abs(duv || 0) < 0.006 ? (dark ? '#4ecb78' : '#1a7a3a') : (dark ? '#e8b445' : '#9a6600'), 'Planckian Dist.'],
        ['Ra', ra == null ? '—' : String(Math.round(ra)), fidelityColor(ra), 'CRI (CIE 13.3)'],
        ['R9', r9 == null ? '—' : String(Math.round(r9)), r9 >= 50 ? (dark ? '#4ecb78' : '#1a7a3a') : r9 >= 0 ? (dark ? '#e8b445' : '#9a6600') : (dark ? '#ff5c5c' : '#c0001a'), 'Sat. Red'],
      ];
      const tw = 825 / tiles.length;
      tiles.forEach(([label, val, color, sub], i) => {
        const cxp = i * tw + tw / 2;
        c.textAlign = 'center'; c.fillStyle = colDim; c.font = 'bold 8px sans-serif'; c.textBaseline = 'top';
        c.fillText(label, cxp, 93);
        c.fillStyle = color; c.font = `bold ${val.length > 5 ? 17 : 21}px sans-serif`; c.textBaseline = 'middle';
        c.fillText(val, cxp, 115);
        c.fillStyle = dark ? '#8496ad' : '#aaa'; c.font = '8px sans-serif'; c.textBaseline = 'bottom';
        c.fillText(sub, cxp, 136);
        if (i > 0) { c.strokeStyle = colBorder; c.lineWidth = 0.5; c.beginPath(); c.moveTo(i * tw, 96); c.lineTo(i * tw, 128); c.stroke(); }
      });

      function sectionLabel(text, x, y) {
        c.fillStyle = colText; c.font = 'bold 8.5px sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top';
        c.fillText(text, x, y);
        c.strokeStyle = colAccent; c.lineWidth = 1;
        c.beginPath(); c.moveTo(x, y + 11); c.lineTo(x + c.measureText(text).width + 2, y + 11); c.stroke();
      }
      function boxBorder(x0, x1, y0, y1) {
        c.strokeStyle = dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.18)'; c.lineWidth = 0.6;
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0, y1); c.lineTo(x1, y1); c.stroke();
      }

      // SPD panel
      sectionLabel('Spectral Power Distribution', 308, 148);
      boxBorder(336, 807, 161, 273);
      c.save(); c.translate(316, 217); c.rotate(-Math.PI / 2);
      c.fillStyle = colDim; c.font = '7.5px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('Relative Power', 0, 0);
      c.restore();

      if (wls.length > 1) {
        // Reference illuminant (blackbody/daylight at the report's own CCT),
        // sampled every 5nm and normalized to its own peak -- drawn as a
        // dashed curve behind the solid test-SPD curve below.
        const refCct = cct || 4000;
        const refWl = [], refRaw = [];
        for (let w = 380; w <= 780; w += 5) { refWl.push(w); refRaw.push(referenceSpectrum(w, refCct)); }
        const refPeak = Math.max(...refRaw);
        const refNorm = refRaw.map((v) => v / refPeak);
        // Linear interpolation of the (xs,ys) reference curve at an
        // arbitrary wavelength, clamped at the ends.
        const interp = (xs, ys, wl) => {
          if (wl <= xs[0]) return ys[0];
          if (wl >= xs[xs.length - 1]) return ys[ys.length - 1];
          for (let k = 0; k < xs.length - 1; k++) {
            if (xs[k] <= wl && xs[k + 1] >= wl) {
              const frac = (wl - xs[k]) / (xs[k + 1] - xs[k]);
              return ys[k] + frac * (ys[k + 1] - ys[k]);
            }
          }
          return 0;
        };
        const minWl = Math.min(...wls), maxWl = Math.max(...wls), maxV = Math.max(...vals);
        const xOf = (w) => 336 + ((w - minWl) / (maxWl - minWl)) * 471;
        const yOf = (v) => 273 - v * 112 * 0.9;
        wls.forEach((w, i) => {
          if (i === 0) return;
          const x1 = xOf(wls[i - 1]), x2 = xOf(w);
          const frac = (vals[i] + vals[i - 1]) / (2 * maxV);
          const mid = (w + wls[i - 1]) / 2;
          let rgb;
          if (mid < 440) { const t = (mid - 380) / 60; rgb = [0, 0, Math.round(100 + 155 * t)]; }
          else if (mid < 490) { const t = (mid - 440) / 50; rgb = [0, Math.round(200 * t), 220]; }
          else if (mid < 510) { const t = (mid - 490) / 20; rgb = [0, 200, Math.round(220 * (1 - t))]; }
          else if (mid < 580) { const t = (mid - 510) / 70; rgb = [Math.round(220 * t), Math.round(170 + 50 * (1 - t)), 0]; }
          else if (mid < 645) { const t = (mid - 580) / 65; rgb = [220, Math.round(150 * (1 - t)), 0]; }
          else { rgb = [Math.round(220 * (1 - ((mid - 645) / 135) * 0.4)), 0, 0]; }
          c.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.55)`;
          c.fillRect(x1, yOf(frac), Math.max(0.5, x2 - x1), 273 - yOf(frac));
        });
        // Dashed reference curve, interpolated onto the test wavelengths.
        c.beginPath(); c.setLineDash([3, 3]);
        c.strokeStyle = dark ? 'rgba(170,185,205,0.55)' : 'rgba(80,80,80,0.5)'; c.lineWidth = 1;
        wls.forEach((w, i) => {
          const y = yOf(interp(refWl, refNorm, w));
          i === 0 ? c.moveTo(xOf(w), y) : c.lineTo(xOf(w), y);
        });
        c.stroke();
        c.setLineDash([]);
        // Solid test-SPD curve, drawn on top of the reference.
        c.beginPath(); c.strokeStyle = dark ? 'rgba(255,98,86,0.95)' : 'rgba(160,15,15,0.85)'; c.lineWidth = 1.6;
        wls.forEach((w, i) => {
          const y = yOf(vals[i] / maxV);
          i === 0 ? c.moveTo(xOf(w), y) : c.lineTo(xOf(w), y);
        });
        c.stroke();
        c.fillStyle = colDim; c.font = '7.5px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'top';
        const ticks = xTicks(minWl, maxWl);
        ticks.forEach((w, i) => {
          c.textAlign = i === 0 ? 'left' : i === ticks.length - 1 ? 'right' : 'center';
          c.fillText(w, xOf(w), 276);
        });
        c.textAlign = 'center'; c.fillText('Wavelength (nm)', 571.5, 285);
        c.font = '8px sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
        c.strokeStyle = dark ? 'rgba(255,98,86,0.95)' : 'rgba(160,15,15,0.85)'; c.lineWidth = 1.5;
        c.setLineDash([]);
        c.beginPath(); c.moveTo(717, 168); c.lineTo(731, 168); c.stroke();
        c.fillStyle = dark ? '#9aabc2' : '#666'; c.fillText('Test', 734, 168);
        c.setLineDash([3, 3]);
        c.strokeStyle = dark ? 'rgba(170,185,205,0.55)' : 'rgba(80,80,80,0.5)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(755, 168); c.lineTo(769, 168); c.stroke();
        c.setLineDash([]);
        c.fillText('Ref.', 772, 168);
      } else {
        c.fillStyle = dark ? '#93a4bb' : '#bbb'; c.font = '11px sans-serif';
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('No spectral data', 571.5, 217);
      }

      // Hue-bin bar panels: chroma shift / hue shift / fidelity
      function binPanel(values, y, h, lo, hi, refLine, label, axisFmt, barLabelFmt) {
        const p0 = y + 13, p1 = y + h - 14, binW = 471 / 16;
        const zeroY = p1 - ((0 - lo) / (hi - lo)) * (p1 - p0);
        sectionLabel(label, 308, y);
        const gridVals = lo < 0 ? [lo, lo / 2, 0, hi / 2, hi] : [0, 25, 50, 75, 100];
        gridVals.forEach((v) => {
          const gy = p1 - ((v - lo) / (hi - lo)) * (p1 - p0);
          c.strokeStyle = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'; c.lineWidth = 0.4;
          c.beginPath(); c.moveTo(336, gy); c.lineTo(807, gy); c.stroke();
          c.fillStyle = colDim; c.font = '7.5px sans-serif'; c.textAlign = 'right'; c.textBaseline = 'middle';
          c.fillText(axisFmt(v), 332, gy);
        });
        if (lo < 0) {
          c.strokeStyle = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.25)'; c.lineWidth = 0.7;
          c.beginPath(); c.moveTo(336, zeroY); c.lineTo(807, zeroY); c.stroke();
        }
        if (refLine != null) {
          const ry = p1 - ((refLine - lo) / (hi - lo)) * (p1 - p0);
          c.strokeStyle = colAccent; c.lineWidth = 0.8; c.setLineDash([3, 2]);
          c.beginPath(); c.moveTo(336, ry); c.lineTo(807, ry); c.stroke(); c.setLineDash([]);
        }
        values.forEach((raw, i) => {
          const [rr, gg, bb] = hueToRGB(i * 22.5 + 11.25);
          const clamped = Math.max(lo, Math.min(hi, raw));
          // Positive bars rise from the zero line (or the baseline for fidelity); negative bars hang below it.
          // (They used to be drawn 1px tall, so the negative chroma/hue shifts showed as a number with no bar.)
          const top = clamped >= 0 ? p1 - (clamped / (hi - lo)) * (p1 - p0) : zeroY;
          const bottom = clamped >= 0 ? p1 : zeroY + (Math.abs(clamped) / (hi - lo)) * (p1 - p0);
          const x = 336 + i * binW + 1;
          c.fillStyle = `rgba(${rr},${gg},${bb},0.88)`;
          c.fillRect(x, top, binW - 2, Math.max(1, bottom - top));
          const lab = barLabelFmt(raw);
          if (lab) {
            c.fillStyle = colStrong; c.font = 'bold 7px sans-serif'; c.textAlign = 'center';
            c.textBaseline = clamped >= 0 ? 'bottom' : 'top';
            c.fillText(lab, x + binW / 2 - 0.5, clamped >= 0 ? top - 1 : bottom + 1);
          }
          c.fillStyle = colDim; c.font = '7px sans-serif'; c.textBaseline = 'top'; c.textAlign = 'center';
          c.fillText(i + 1, x + binW / 2 - 0.5, p1 + 2);
        });
        boxBorder(336, 807, p0, p1);
        c.fillStyle = colDim; c.font = '7.5px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'top';
        c.fillText('Hue-Angle Bin (j)', 571.5, p1 + 12);
      }
      binPanel(rcsBins, 284, 102, -0.4, 0.4, null, 'Local Chroma Shift, Rcs,hj',
        (v) => v * 100 + '%',
        (v) => { const p = Math.round(v * 100); return Math.abs(p) >= 2 ? (p > 0 ? '+' : '') + p + '%' : ''; });
      binPanel(rhsBins.map((v) => v / 50), 394, 102, -0.5, 0.5, null, 'Local Hue Shift, Rhs,hj',
        (v) => v.toFixed(2),
        (v) => { const p = v * 50; return Math.abs(p) >= 2 ? p.toFixed(2) : ''; });
      binPanel(rfBins, 504, 118, 0, 100, Rf, 'Local Color Fidelity, Rf,hj',
        (v) => String(v),
        (v) => (v == null ? '' : String(Math.round(v))));

      // CVG wheel
      sectionLabel('Color Vector Graphic (CVG)', 18, 148);
      const A = 244 * 0.4, wcx = 156, wcy = 390;
      for (let i = 0; i < 16; i++) {
        const a1 = ((90 - i * 22.5) * Math.PI) / 180, a2 = ((90 - (i + 1) * 22.5) * Math.PI) / 180;
        const [rr, gg, bb] = hueToRGB(i * 22.5 + 11.25);
        c.beginPath(); c.moveTo(wcx, wcy); c.arc(wcx, wcy, A * 1.09, a2, a1); c.closePath();
        c.fillStyle = `rgba(${rr},${gg},${bb},0.22)`; c.fill();
      }
      [0.25, 0.5, 0.75, 1].forEach((f) => {
        c.beginPath(); c.arc(wcx, wcy, A * f, 0, Math.PI * 2);
        c.strokeStyle = f === 1 ? (dark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.35)') : (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)');
        c.lineWidth = f === 1 ? 1 : 0.4; c.stroke();
      });
      for (let i = 0; i < 16; i++) {
        const a = ((90 - i * 22.5) * Math.PI) / 180;
        c.beginPath();
        c.moveTo(wcx + A * 0.05 * Math.cos(a), wcy - A * 0.05 * Math.sin(a));
        c.lineTo(wcx + A * Math.cos(a), wcy - A * Math.sin(a));
        c.strokeStyle = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'; c.lineWidth = 0.4; c.stroke();
      }
      c.beginPath(); c.arc(wcx, wcy, A, 0, Math.PI * 2);
      c.fillStyle = dark ? 'rgba(14,20,32,0.82)' : 'rgba(255,255,255,0.82)'; c.fill();
      const pts = (cvgPolygonPoints(r) || []).map((p) => [wcx + A * p[0], wcy - A * p[1]]);
      if (pts.length) {
        c.beginPath(); c.moveTo(...pts[0]);
        pts.slice(1).forEach((p) => c.lineTo(...p));
        c.closePath();
        c.fillStyle = dark ? 'rgba(255,98,86,0.14)' : 'rgba(175,12,12,0.10)'; c.fill();
        c.strokeStyle = dark ? 'rgba(255,98,86,0.95)' : 'rgba(165,10,10,0.88)'; c.lineWidth = 1.8; c.stroke();
        pts.forEach(([px, py]) => {
          c.beginPath(); c.arc(px, py, 2.2, 0, Math.PI * 2);
          c.fillStyle = dark ? 'rgba(255,112,98,0.95)' : 'rgba(150,8,8,0.9)'; c.fill();
        });
      }
      c.beginPath(); c.arc(wcx, wcy, A, 0, Math.PI * 2);
      c.strokeStyle = dark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.5)'; c.lineWidth = 1.1; c.stroke();
      for (let i = 0; i < 16; i++) {
        const a = ((90 - i * 22.5) * Math.PI) / 180, lr = A * 1.18;
        c.fillStyle = dark ? 'rgba(200,215,235,0.75)' : 'rgba(40,40,60,0.7)';
        c.font = 'bold 8px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(i + 1, wcx + lr * Math.cos(a), wcy - lr * Math.sin(a));
      }

      // Rf / Rg above the wheel
      c.font = 'bold 24px sans-serif'; c.textBaseline = 'top';
      c.fillStyle = fidelityColor(Rf); c.textAlign = 'left';
      c.fillText(Rf ?? '—', 22, 162);
      c.font = '9px sans-serif'; c.fillStyle = colDim; c.fillText('Rf', 22, 188);
      c.font = 'bold 24px sans-serif';
      c.fillStyle = Math.abs((Rg || 100) - 100) <= 8 ? (dark ? '#4ecb78' : '#1a7a3a') : (dark ? '#e8b445' : '#9a6600');
      c.textAlign = 'right'; c.fillText(Rg ?? '—', 290, 162);
      c.font = '9px sans-serif'; c.fillStyle = colDim; c.textAlign = 'right'; c.fillText('Rg', 290, 188);

      const M = 434.896;
      c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      c.fillStyle = colText; c.font = 'bold 11px sans-serif';
      c.fillText(cct ? cct + ' K' : '—', 156, M);
      c.fillStyle = colDim; c.font = '8px sans-serif'; c.fillText('CCT', 156, M - 13);
      c.fillStyle = Math.abs(duv || 0) < 0.006 ? (dark ? '#4ecb78' : '#1a7a3a') : (dark ? '#e8b445' : '#9a6600');
      c.font = 'bold 10px sans-serif';
      c.fillText(duv == null ? '—' : (duv >= 0 ? '+' : '') + duv.toFixed(4), 156, 450.896);
      c.fillStyle = colDim; c.font = '8px sans-serif'; c.fillText('Duv', 156, 459.896);

      // CES-99 bars
      const N = 765 / 99;
      sectionLabel('Color Sample Fidelity, Rf,CES', 18, 636);
      [0, 25, 50, 75, 100].forEach((v) => {
        const y = 756 - (v / 100) * 108;
        c.strokeStyle = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'; c.lineWidth = 0.4;
        c.beginPath(); c.moveTo(42, y); c.lineTo(807, y); c.stroke();
        c.fillStyle = colDim; c.font = '7.5px sans-serif'; c.textAlign = 'right'; c.textBaseline = 'middle';
        c.fillText(v, 38, y);
      });
      Array.from({ length: 99 }, (_, i) => {
        const n = (i / 99) * 16, b0 = Math.floor(n) % 16, b1 = (b0 + 1) % 16, frac = n - Math.floor(n);
        return rfBins[b0] * (1 - frac) + rfBins[b1] * frac;
      }).forEach((v, i) => {
        const [rr, gg, bb] = hueToRGB((i / 99) * 360);
        const h = (Math.max(0, v) / 100) * 108;
        c.fillStyle = `rgba(${rr},${gg},${bb},0.85)`;
        c.fillRect(42 + i * N + 0.3, 756 - h, 7.427272727272728, h);
      });
      [1, 9, 17, 25, 33, 41, 49, 57, 65, 73, 81, 89, 97].forEach((n) => {
        c.fillStyle = colDim; c.font = '7.5px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'top';
        c.fillText(n, 42 + (n - 0.5) * N, 759);
      });
      c.fillStyle = colDim; c.font = '8px sans-serif'; c.textAlign = 'center'; c.fillText('CES Color', 424.5, 769);
      boxBorder(42, 807, 648, 756);

      // Chromaticity + CRI mini-panel
      c.fillStyle = dark ? '#141c2b' : '#f4f7fb'; c.fillRect(607, 771, 200, 76);
      c.strokeStyle = colBorder; c.lineWidth = 0.5; c.strokeRect(607, 771, 200, 76);
      c.strokeStyle = colText; c.lineWidth = 2;
      c.beginPath(); c.moveTo(607, 771); c.lineTo(607, 847); c.stroke();
      c.font = 'bold 8.5px sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = colText;
      c.fillText('CIE Chromaticity', 621, 779);
      c.fillStyle = colDim; c.font = '8px sans-serif';
      [
        ['x', r.x?.toFixed(4) || '—'],
        ['y', r.y?.toFixed(4) || '—'],
        ["u'", r.x && r.y ? ((4 * r.x) / (-2 * r.x + 12 * r.y + 3)).toFixed(4) : '—'],
        ["v'", r.x && r.y ? ((9 * r.y) / (-2 * r.x + 12 * r.y + 3)).toFixed(4) : '—'],
      ].forEach(([k, v], i) => {
        c.fillStyle = colDim; c.fillText(k, 621, 793 + i * 15);
        c.fillStyle = colStrong; c.font = 'bold 8.5px monospace'; c.fillText(v, 637, 793 + i * 15);
        c.font = '8px sans-serif';
      });
      c.fillStyle = colText; c.font = 'bold 8.5px sans-serif'; c.fillText('CIE 13.3-1995 (CRI)', 715, 779);
      c.fillStyle = colDim; c.font = '8px sans-serif';
      [
        ['Ra', ra == null ? '—' : String(Math.round(ra)), fidelityColor(ra)],
        ['R9', r9 == null ? '—' : String(Math.round(r9)), r9 >= 50 ? (dark ? '#4ecb78' : '#1a7a3a') : r9 >= 0 ? (dark ? '#e8b445' : '#9a6600') : (dark ? '#ff5c5c' : '#c0001a')],
      ].forEach(([k, v, col], i) => {
        c.fillStyle = colDim; c.fillText(k, 715, 793 + i * 30);
        c.fillStyle = col; c.font = 'bold 16px sans-serif'; c.textBaseline = 'top';
        c.fillText(v, 733, 791 + i * 30);
        c.font = '8px sans-serif'; c.textBaseline = 'top';
      });
      if (r.notes) {
        c.fillStyle = colDim; c.font = 'bold 8px sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top';
        c.fillText('Notes:', 18, 779);
        c.fillStyle = colStrong; c.font = '9px sans-serif';
        c.fillText(r.notes.slice(0, 80), 18, 791);
      }

      // Footer
      const footerY = PAGE_H - 20;
      c.strokeStyle = colBorder; c.lineWidth = 0.5;
      c.beginPath(); c.moveTo(18, footerY - 4); c.lineTo(807, footerY - 4); c.stroke();
      c.fillStyle = dark ? '#8496ad' : '#aaa'; c.font = '8px sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
      c.fillText('Colors are for visual orientation purposes only.', 18, 1054);
      c.textAlign = 'right'; c.fillText('Generated by hcri.io  ·  IES TM-30-18', 807, 1054);
      setReady(true);
    } catch (e) {
      console.error('AnnexE render error:', e);
    }
  }, [data]);

  function downloadPng() {
    const a = document.createElement('a');
    a.href = canvasRef.current.toDataURL('image/png');
    a.download = (data.label || 'report').replace(/[^a-zA-Z0-9_-]/g, '_') + '_TM30_AnnexE.png';
    a.click();
  }

  async function downloadPdf() {
    setPdfBusy(true);
    try {
      const png = canvasRef.current.toDataURL('image/png');
      const name = (data.label || 'report').replace(/[^a-zA-Z0-9_-]/g, '_');
      const res = await fetch('./index.php/api/annexe_pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ png, name }),
      });
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name + '_TM30_AnnexE.pdf'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('PDF download failed: ' + e.message);
    } finally {
      setPdfBusy(false);
    }
  }

  const canvasBg = (() => { try { return (localStorage.getItem('hcri_theme') || 'dark') === 'dark'; } catch { return false; } })() ? '#0b1019' : 'white';

  if (isMobile) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 2147483647, background: T.bg, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, background: T.surface2, borderBottom: `1px solid ${T.border}`, padding: 'calc(env(safe-area-inset-top) + 10px) 12px 10px', boxSizing: 'border-box' }}>
          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: T.white, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            TM-30-18<span style={{ fontSize: 11, color: T.dim, fontWeight: 400, marginLeft: 6 }}>{data.label}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, width: '100%', boxSizing: 'border-box' }}>
            <button onClick={downloadPng} style={{ background: `${T.accent}15`, border: `1px solid ${T.accent}50`, color: T.accent, borderRadius: 6, padding: '12px 8px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, flex: '1 1 0', minWidth: 0 }}>↓ PNG</button>
            <button onClick={downloadPdf} disabled={pdfBusy} style={{ background: `${T.good}15`, border: `1px solid ${T.good}50`, color: T.good, borderRadius: 6, padding: '12px 8px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, opacity: pdfBusy ? 0.4 : 1, flex: '1 1 0', minWidth: 0 }}>{pdfBusy ? '…' : '↓ PDF'}</button>
            <button onClick={onClose} style={{ background: 'none', border: `1px solid ${T.border}`, color: T.dim, borderRadius: 6, padding: '12px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, flexShrink: 0 }}>✕ Close</button>
          </div>
        </div>
        <div style={{ flex: '1 1 auto', minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: 10, boxSizing: 'border-box' }}>
          <div style={{ overflowX: 'auto', background: canvasBg, borderRadius: 6 }}>
            <canvas ref={canvasRef} style={{ display: 'block' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2147483647, background: 'rgba(0,0,0,0.92)', overflowY: 'scroll', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ padding: 16, minHeight: '100%', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 865, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, padding: '10px 16px', gap: 6 }}>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: T.white, fontSize: 15 }}>
              TM-30-18<span style={{ fontSize: 11, color: T.dim, fontWeight: 400, marginLeft: 6 }}>{data.label}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={downloadPng} style={{ background: `${T.accent}15`, border: `1px solid ${T.accent}50`, color: T.accent, borderRadius: 6, padding: '7px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>↓ PNG</button>
              <button onClick={downloadPdf} disabled={pdfBusy} style={{ background: `${T.good}15`, border: `1px solid ${T.good}50`, color: T.good, borderRadius: 6, padding: '7px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, opacity: pdfBusy ? 0.4 : 1 }}>{pdfBusy ? '…' : '↓ PDF'}</button>
              <button onClick={onClose} style={{ background: 'none', border: `1px solid ${T.border}`, color: T.dim, borderRadius: 6, padding: '7px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', flexShrink: 0 }}>✕</button>
            </div>
          </div>
          <div style={{ overflowX: 'scroll', overflowY: 'visible', WebkitOverflowScrolling: 'touch', background: canvasBg, borderRadius: 6, boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
            <canvas ref={canvasRef} style={{ display: 'block' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
