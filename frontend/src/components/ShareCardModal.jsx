// frontend/src/components/ShareCardModal.jsx
//
// Reconstructed from the deployed assets/app.js (minified function Oe).
// A full-screen (mobile) / centered (desktop) overlay that renders a
// shareable PNG summary card for a report entirely on a <canvas> --
// logo, Rf/Rg tiles, CCT/Duv/Ra/R9 tiles, the SPD curve, a CVG wheel, a
// source/notes strip and a local-fidelity bar strip -- then offers it as a
// "↓ Download" PNG (filename: "<label>_hcri.png").
//
// Uses two small helpers duplicated from elsewhere in the bundle for pure
// canvas math (not worth sharing a module for): hueToRGB (16-sector hue
// wheel tint) and wlToRGB (visible-spectrum wavelength tint). Also uses
// __refVal/__cvgPts, which compute the reference-illuminant SPD curve and
// the 16 TM-30 CVG vector endpoints respectively -- these were not inside
// this reconstruction batch's line range; if they don't already exist as
// shared helpers, they need to be sourced from wherever the SPD/CVG math
// lives (likely api/_core/spd.php's client-side mirror, or lib/spd.js).

import { useRef, useEffect, useState } from 'react';
import { useTheme } from '../lib/ThemeContext.jsx';
import { useIsMobile } from '../hooks/useIsMobile';
import { fmtTZ } from '../lib/tz';
import { __refVal, __cvgPts } from '../lib/cvgWheel';

function hueToRGB(h) {
  return [
    Math.max(30, Math.min(240, Math.round(128 + 127 * Math.cos((h * Math.PI) / 180)))),
    Math.max(30, Math.min(240, Math.round(128 + 127 * Math.cos(((h - 120) * Math.PI) / 180)))),
    Math.max(30, Math.min(240, Math.round(128 + 127 * Math.cos(((h + 120) * Math.PI) / 180)))),
  ];
}

function wlToRGB(wl) {
  if (wl < 440) { const t = (wl - 380) / 60; return [0, 0, Math.min(255, Math.round(130 + 125 * t))]; }
  if (wl < 490) { const t = (wl - 440) / 50; return [0, Math.round(255 * t), 255]; }
  if (wl < 510) { const t = (wl - 490) / 20; return [0, 255, Math.round(255 * (1 - t))]; }
  if (wl < 580) { const t = (wl - 510) / 70; return [Math.round(255 * t), Math.round(200 + 55 * (1 - t)), 0]; }
  if (wl < 645) { const t = (wl - 580) / 65; return [255, Math.round(180 * (1 - t)), 0]; }
  return [Math.round(255 * (1 - ((wl - 645) / 135) * 0.3)), 0, 0];
}

// Rounded rect path, filled or stroked depending on `mode`.
function roundRect(ctx, x, y, w, h, r, mode) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  mode === 'fill' ? ctx.fill() : ctx.stroke();
}

export default function ShareCardModal({ report, onClose }) {
  const n = useRef();
  const { theme: r } = useTheme();
  const d = useIsMobile(768);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const canvas = n.current;
    if (!canvas || !report) return;
    try {
      const e = report;
      const dark = r.name === 'dark';
      const bins = e.rfBins || Array(16).fill(e.Rf || 75);
      const Rf = e.Rf, Rg = e.Rg, cct = e.cct, duv = e.duv, ra = e.ra, r9 = e.r9;
      const bgTop = dark ? '#0a1628' : '#f0f4f8';
      const bgBot = dark ? '#060a0f' : '#e4eaf2';
      const gridLine = dark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,80,0.04)';
      const headerBg = dark ? `${r.accent}14` : `${r.accent}12`;
      const headerBorder = dark ? `${r.accent}35` : `${r.accent}45`;
      const tileBg = dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)';
      const tileBorder = dark ? 'rgba(80,140,200,0.18)' : 'rgba(40,90,160,0.22)';
      const textCol = dark ? '#ffffff' : r.text;
      const dimCol = dark ? 'rgba(140,190,230,0.75)' : r.dim;
      const rfCol = Rf != null && Rf >= 85 ? (dark ? '#00e888' : '#007a3a') : Rf != null && Rf >= 70 ? (dark ? '#ffcc33' : '#996600') : (dark ? '#ff4466' : '#cc1133');
      const rgCol = Rg != null && Math.abs(Rg - 100) <= 8 ? (dark ? '#00e888' : '#007a3a') : (dark ? '#ffcc33' : '#996600');
      const rfLabel = Rf >= 90 ? 'Excellent' : Rf >= 80 ? 'Good' : Rf >= 70 ? 'Moderate' : 'Low';
      const rgLabel = Rg > 110 ? 'Expanded' : Rg >= 98 ? 'Normal' : 'Compressed';
      const rfTileBg = dark ? 'rgba(0,232,136,0.08)' : 'rgba(0,180,100,0.08)';
      const rfTileBorder = dark ? 'rgba(0,232,136,0.22)' : 'rgba(0,160,80,0.3)';
      const rfTileText = dark ? 'rgba(180,255,220,0.95)' : 'rgba(0,100,50,0.9)';
      const rgTileBg = dark ? 'rgba(120,80,220,0.1)' : 'rgba(100,60,200,0.07)';
      const rgTileBorder = dark ? 'rgba(160,120,255,0.22)' : 'rgba(120,80,220,0.3)';
      const rgTileText = dark ? 'rgba(220,200,255,0.95)' : 'rgba(80,40,160,0.9)';
      const fidelityLabelCol = dark ? 'rgba(240,240,240,0.9)' : 'rgba(10,10,10,0.8)';
      const footerBg = dark ? `${r.accent}08` : `${r.accent}10`;
      const footerBorder = dark ? `${r.accent}20` : `${r.accent}40`;

      // Extra identity fields the original left blank placeholders for
      // (model/manufacturer/led -- not currently surfaced on the card).
      const model = '', mfr = '', led = '';
      const notes = e.notes || '';
      const hasIdentityOrNotes = model || mfr || led || notes;

      let cardH = 944;
      if (hasIdentityOrNotes) cardH += 16 + (model || mfr || led ? 34 : 0) + (notes ? 28 : 0);

      canvas.width = 540 * 2;
      canvas.height = cardH * 2;
      canvas.style.width = '540px';
      canvas.style.height = cardH + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);

      let y = 0;
      const grad = ctx.createLinearGradient(0, 0, 0, cardH);
      grad.addColorStop(0, bgTop);
      grad.addColorStop(1, bgBot);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 540, cardH);
      ctx.strokeStyle = gridLine;
      ctx.lineWidth = 1;
      for (let gy = 0; gy < cardH; gy += 36) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(540, gy); ctx.stroke(); }

      // Header band
      ctx.fillStyle = headerBg;
      ctx.fillRect(0, 0, 540, 80);
      ctx.strokeStyle = headerBorder;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, 80); ctx.lineTo(540, 80); ctx.stroke();
      ctx.textBaseline = 'middle';
      ctx.fillStyle = textCol;
      ctx.font = 'bold 30px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('hCRI', 20, 30);
      const logoW = ctx.measureText('hCRI').width;
      ctx.fillStyle = r.accent;
      ctx.fillText('.io', 20 + logoW, 30);
      ctx.fillStyle = dimCol;
      ctx.font = '10px monospace';
      ctx.fillText('LED  ·  TM-30  ·  COLOR RENDERING', 20, 56);
      ctx.textAlign = 'right';
      ctx.fillStyle = dimCol;
      ctx.font = '11px monospace';
      ctx.fillText(fmtTZ((e.createdAt || '').replace(' ', 'T'), undefined, true), 524, 28);
      ctx.fillStyle = textCol;
      ctx.font = 'bold 13px monospace';
      ctx.fillText(e.label || '', 524, 50);
      if (mfr || model) {
        ctx.fillStyle = dimCol;
        ctx.font = '10px monospace';
        ctx.fillText([mfr, model].filter(Boolean).join(' · '), 524, 66);
      }

      // Rf / Rg tiles
      y = 90;
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      roundRect(ctx, 16, y, 252, 108, 8, 'fill');
      ctx.fillStyle = rfTileBg;
      roundRect(ctx, 16, y, 252, 108, 8, 'fill');
      ctx.strokeStyle = rfTileBorder;
      ctx.lineWidth = 0.8;
      roundRect(ctx, 16, y, 252, 108, 8, 'stroke');
      ctx.fillStyle = rfTileText;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Rf  FIDELITY', 26, y + 10);
      ctx.fillStyle = rfCol;
      ctx.font = 'bold 52px monospace';
      ctx.fillText(Rf ?? '—', 26, y + 24);
      ctx.fillStyle = rfTileText;
      ctx.font = 'bold 12px monospace';
      ctx.textBaseline = 'top';
      ctx.fillText(rfLabel, 26, y + 108 - 22);

      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      roundRect(ctx, 272, y, 252, 108, 8, 'fill');
      ctx.fillStyle = rgTileBg;
      roundRect(ctx, 272, y, 252, 108, 8, 'fill');
      ctx.strokeStyle = rgTileBorder;
      ctx.lineWidth = 0.8;
      roundRect(ctx, 272, y, 252, 108, 8, 'stroke');
      ctx.fillStyle = rgTileText;
      ctx.font = 'bold 11px monospace';
      ctx.textBaseline = 'top';
      ctx.fillText('Rg  GAMUT', 282, y + 10);
      ctx.fillStyle = rgCol;
      ctx.font = 'bold 52px monospace';
      ctx.fillText(Rg ?? '—', 282, y + 24);
      ctx.fillStyle = rgTileText;
      ctx.font = 'bold 12px monospace';
      ctx.textBaseline = 'top';
      ctx.fillText(rgLabel, 282, y + 108 - 22);

      y += 120;

      // CCT / Duv / Ra / R9 strip
      [
        ['CCT', cct == null ? '—' : cct + 'K', r.accent],
        ['Duv', duv == null ? '—' : (duv >= 0 ? '+' : '') + duv.toFixed(4), Math.abs(duv ?? 1) < 0.006 ? '#00e888' : '#ffcc33'],
        ['Ra (CRI)', ra == null ? '—' : String(Math.round(ra)), textCol],
        ['R9', r9 == null ? '—' : String(Math.round(r9)), r9 != null && r9 >= 50 ? '#00e888' : r9 != null && r9 >= 0 ? '#ffcc33' : '#ff4466'],
      ].forEach(([label, val, color], i) => {
        const x = 16 + i * 127;
        ctx.fillStyle = tileBg;
        roundRect(ctx, x + 1, y, 125, 52, 5, 'fill');
        ctx.strokeStyle = tileBorder;
        ctx.lineWidth = 0.5;
        roundRect(ctx, x + 1, y, 125, 52, 5, 'stroke');
        ctx.fillStyle = dimCol;
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(label, x + 7, y + 7);
        ctx.fillStyle = color;
        ctx.font = `bold ${val.length > 6 ? 15 : 19}px monospace`;
        ctx.textBaseline = 'top';
        ctx.fillText(val, x + 7, y + 20);
      });
      y += 60;

      // SPD
      ctx.fillStyle = dimCol;
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('SPECTRAL POWER DISTRIBUTION', 16, y + 12);
      y += 16;
      ctx.fillStyle = tileBg;
      roundRect(ctx, 16, y, 508, 134, 6, 'fill');
      if (e.wls && e.vals) {
        const wls = e.wls, vals = e.vals;
        const maxV = Math.max(...vals), minWl = Math.min(...wls), span = Math.max(1, Math.max(...wls) - minWl);
        const cTop = y + 10, cBot = y + 134 - 12, cH = cBot - cTop;
        ctx.strokeStyle = gridLine;
        ctx.lineWidth = 0.5;
        [450, 500, 550, 600, 650, 700].forEach((wl) => {
          const gx = 24 + ((wl - minWl) / span) * 492;
          ctx.beginPath(); ctx.moveTo(gx, cTop); ctx.lineTo(gx, cBot); ctx.stroke();
        });
        wls.forEach((wl, i) => {
          if (i === 0) return;
          const x1 = 24 + ((wls[i - 1] - minWl) / span) * 492;
          const x2 = 24 + ((wl - minWl) / span) * 492;
          const avgH = ((vals[i - 1] + vals[i]) / 2 / maxV) * cH * 0.92;
          const [cr, cg, cb] = wlToRGB(Math.round((wl + wls[i - 1]) / 2));
          const rr = Math.min(255, Math.round(185 + (cr - 185) * 0.55));
          const gg = Math.min(255, Math.round(185 + (cg - 185) * 0.55));
          const bb = Math.min(255, Math.round(185 + (cb - 185) * 0.55));
          ctx.fillStyle = `rgba(${Math.max(0, rr)},${Math.max(0, gg)},${Math.max(0, bb)},${dark ? 0.9 : 0.85})`;
          ctx.fillRect(x1, cBot - avgH, Math.max(0.5, x2 - x1), avgH);
        });
        ctx.beginPath();
        wls.forEach((wl, i) => {
          const px = 24 + ((wl - minWl) / span) * 492;
          const py = cBot - (vals[i] / maxV) * cH * 0.92;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        });
        ctx.strokeStyle = dark ? 'rgba(210,30,30,0.85)' : 'rgba(170,10,10,0.9)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        if (cct && cct > 0) {
          const refVals = wls.map((wl) => __refVal(wl, cct));
          const refMax = Math.max(...refVals);
          ctx.beginPath();
          wls.forEach((wl, i) => {
            const px = 24 + ((wl - minWl) / span) * 492;
            const py = cBot - (refVals[i] / refMax) * cH * 0.92;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          });
          ctx.strokeStyle = dark ? 'rgba(180,180,180,0.5)' : 'rgba(80,80,80,0.45)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.fillStyle = dimCol;
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        [400, 500, 600, 700].forEach((wl) => {
          const gx = 24 + ((wl - minWl) / span) * 492;
          ctx.fillText(wl, gx, cBot + 3);
        });
      }
      y += 134;

      // CVG
      ctx.fillStyle = dimCol;
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('COLOR VECTOR GRAPHIC', 16, y + 12);
      y += 18;

      const cvgR = 220 * 0.36;
      ctx.textBaseline = 'top';
      ctx.fillStyle = rfCol;
      ctx.font = 'bold 25px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(Rf ?? '—', 16, y);
      ctx.fillStyle = dimCol;
      ctx.font = '11px monospace';
      ctx.fillText('Rf', 16, y + 25 + 2);
      ctx.fillStyle = rgCol;
      ctx.font = 'bold 25px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(Rg ?? '—', 524, y);
      ctx.fillStyle = dimCol;
      ctx.font = '11px monospace';
      ctx.fillText('Rg', 524, y + 25 + 2);

      const cvgCy = y + 39 + cvgR + 10;
      for (let h = 0; h < 16; h++) {
        const a1 = ((90 - h * 22.5) * Math.PI) / 180;
        const a2 = ((90 - (h + 1) * 22.5) * Math.PI) / 180;
        const [hr, hg, hb] = hueToRGB(h * 22.5 + 11.25);
        const mix = dark ? 0.4 : 0.35;
        const lr = Math.min(255, Math.round(160 + (hr - 160) * mix));
        const lg = Math.min(255, Math.round(160 + (hg - 160) * mix));
        const lb = Math.min(255, Math.round(160 + (hb - 160) * mix));
        ctx.beginPath();
        ctx.moveTo(270, cvgCy);
        ctx.arc(270, cvgCy, cvgR + 220 * 0.36 * 0.3194, a2, a1);
        ctx.closePath();
        ctx.fillStyle = `rgb(${lr},${lg},${lb})`;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(270, cvgCy, cvgR, 0, Math.PI * 2);
      ctx.fillStyle = dark ? 'rgba(240,244,250,1)' : 'rgba(255,255,255,1)';
      ctx.fill();
      [0.25, 0.5, 0.75, 1].forEach((f) => {
        ctx.beginPath();
        ctx.arc(270, cvgCy, cvgR * f, 0, Math.PI * 2);
        ctx.strokeStyle = f === 1 ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.1)';
        ctx.lineWidth = f === 1 ? 1.2 : 0.4;
        ctx.stroke();
      });
      ctx.strokeStyle = 'rgba(0,0,0,0.07)';
      ctx.lineWidth = 0.3;
      for (let h = 0; h < 16; h++) {
        const a = ((90 - h * 22.5) * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(270 + 11 * Math.cos(a), cvgCy - 11 * Math.sin(a));
        ctx.lineTo(270 + cvgR * Math.cos(a), cvgCy - cvgR * Math.sin(a));
        ctx.stroke();
      }
      const cvgPts = __cvgPts(e) || [];
      const scaled = cvgPts.map((p) => [270 + cvgR * p[0], cvgCy - cvgR * p[1]]);
      if (scaled.length) {
        ctx.beginPath();
        ctx.moveTo(...scaled[0]);
        scaled.slice(1).forEach((p) => ctx.lineTo(...p));
        ctx.closePath();
        ctx.fillStyle = 'rgba(200,30,30,0.1)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(190,25,25,0.9)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        scaled.forEach(([px, py]) => {
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(170,15,15,0.9)';
          ctx.fill();
        });
      }
      ctx.beginPath();
      ctx.arc(270, cvgCy, cvgR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = 'rgba(20,20,20,0.8)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let h = 0; h < 16; h++) {
        const a = ((90 - h * 22.5) * Math.PI) / 180;
        const lr = 101.2;
        ctx.fillText(h + 1, 270 + lr * Math.cos(a), cvgCy - lr * Math.sin(a));
      }

      const ccY = cvgCy + cvgR * 0.52;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('CCT', 270 - cvgR * 0.82, ccY);
      ctx.fillStyle = '#0a0a0a';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(cct ? cct + ' K' : '—', 270 - cvgR * 0.82, ccY + 16 + 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('Duv', 334.944, ccY);
      ctx.fillStyle = '#0a0a0a';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(duv == null ? '—' : (duv >= 0 ? '+' : '') + duv.toFixed(4), 334.944, ccY + 16 + 2);

      y = cvgCy + cvgR + 220 * 0.13;

      // Identity / notes strip
      if (hasIdentityOrNotes) {
        y += 10;
        const idLine = [mfr, model, led].filter(Boolean).join('  ·  ');
        if (idLine) {
          ctx.fillStyle = tileBg;
          roundRect(ctx, 16, y, 508, 32, 5, 'fill');
          ctx.strokeStyle = tileBorder;
          ctx.lineWidth = 0.5;
          roundRect(ctx, 16, y, 508, 32, 5, 'stroke');
          ctx.fillStyle = dimCol;
          ctx.font = '10px monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText('SOURCE', 24, y + 10);
          ctx.fillStyle = textCol;
          ctx.font = 'bold 12px monospace';
          ctx.fillText(idLine, 24, y + 24);
        }
        if (notes) {
          const ny = idLine ? y + 36 : y;
          ctx.fillStyle = tileBg;
          roundRect(ctx, 16, ny, 508, 26, 5, 'fill');
          ctx.fillStyle = dimCol;
          ctx.font = '10px monospace';
          ctx.textBaseline = 'middle';
          ctx.fillText('NOTES  ' + notes, 24, ny + 13);
        }
        y += idLine && notes ? 62 : idLine ? 32 : notes ? 26 : 0;
      }

      // Local fidelity strip
      y += 10;
      ctx.fillStyle = dimCol;
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('LOCAL COLOR FIDELITY  (Rf,hj)', 16, y + 12);
      y += 16;
      ctx.fillStyle = tileBg;
      roundRect(ctx, 16, y, 508, 74, 5, 'fill');
      const binW = 508 / 16;
      bins.forEach((v, h) => {
        const barH = (v / 100) * 58 * 0.95;
        const [hr, hg, hb] = hueToRGB(h * 22.5 + 11.25);
        ctx.fillStyle = `rgb(${hr},${hg},${hb})`;
        ctx.fillRect(16 + h * binW + 1, y + 74 - 8 - barH, binW - 2, barH);
        ctx.fillStyle = fidelityLabelCol;
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(Math.round(v), 16 + h * binW + binW / 2, y + 74 - 10 - barH);
      });
      y += 74;

      // Footer
      y += 10;
      ctx.fillStyle = footerBg;
      ctx.fillRect(0, y, 540, 36);
      ctx.strokeStyle = footerBorder;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(540, y); ctx.stroke();
      ctx.fillStyle = r.accent;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('hcri.io  ·  LED Color Rendering Analysis', 540 / 2, y + 18);

      setRendered(true);
    } catch (err) {
      console.error('Share card render error:', err);
    } finally {
      setRendered(true);
    }
  }, [report, r.name]);

  function download() {
    const a = document.createElement('a');
    a.href = n.current.toDataURL('image/png');
    a.download = (report.label || 'report').replace(/[^a-zA-Z0-9_-]/g, '_') + '_hcri.png';
    a.click();
  }

  if (d) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 2147483647, background: r.bg, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, background: r.surface2, borderBottom: `1px solid ${r.border}`, padding: 'calc(env(safe-area-inset-top) + 10px) 12px 10px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: r.text, fontFamily: 'monospace' }}>Share Card</div>
          <div style={{ display: 'flex', gap: 8, width: '100%', boxSizing: 'border-box' }}>
            <button
              onClick={download}
              disabled={!rendered}
              style={{
                background: r.accent, color: r.name === 'dark' ? '#06121f' : '#ffffff', border: 'none', borderRadius: 6,
                padding: '12px 8px', fontSize: 13, fontWeight: 700, cursor: rendered ? 'pointer' : 'default', fontFamily: 'monospace',
                opacity: rendered ? 1 : 0.4, flex: '1 1 0', minWidth: 0,
              }}
            >
              ↓ Download
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: `1px solid ${r.border}`, color: r.dim, borderRadius: 6, padding: '12px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, flexShrink: 0 }}
            >
              ✕ Close
            </button>
          </div>
        </div>
        <div style={{ flex: '1 1 auto', minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: 10, boxSizing: 'border-box' }}>
          <canvas ref={n} style={{ borderRadius: 8, display: 'block' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2147483647, background: 'rgba(0,0,0,0.88)', overflowY: 'scroll', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ padding: 16, minHeight: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: r.surface, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%', maxWidth: 580, alignSelf: 'flex-start', border: `1px solid ${r.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', paddingBottom: 8, borderBottom: `1px solid ${r.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: r.text, fontFamily: 'monospace' }}>Share Card</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                onClick={download}
                disabled={!rendered}
                style={{
                  background: r.accent, color: r.name === 'dark' ? '#06121f' : '#ffffff', border: 'none', borderRadius: 8,
                  padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: rendered ? 'pointer' : 'default', fontFamily: 'monospace', opacity: rendered ? 1 : 0.4,
                }}
              >
                ↓ Download
              </button>
              <button onClick={onClose} style={{ background: r.surface2, border: `1px solid ${r.border}`, color: r.dim, borderRadius: 8, padding: '8px 14px', fontSize: 14, cursor: 'pointer', lineHeight: 1 }}>
                ✕
              </button>
            </div>
          </div>
          <div style={{ width: '100%', overflowX: 'scroll', overflowY: 'visible', WebkitOverflowScrolling: 'touch' }}>
            <canvas ref={n} style={{ borderRadius: 8, display: 'block' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
