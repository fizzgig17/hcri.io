// frontend/src/components/ReportCharts.jsx
//
// Reconstructed from assets/app.js (minified fns le, ue, de).
//  - BinBarChart (le): the chroma/hue/fidelity-shift bar charts. Unlike the
//    stale version this replaces, chroma/hue bar scale is now DATA-DRIVEN
//    (rounds up to the next 0.05/5° that fits the largest real bin) instead
//    of a fixed ±40%/±0.5 range, and each chart takes its own help text.
//  - CESBars (ue): the 99-color-sample fidelity strip. Uses the report's
//    real per-sample rfSamples/sampleHues when the instrument/analysis
//    provided them (real=true), falling back to interpolating the 16
//    hue-bin averages the way the stale version always did.
//  - (The "Raw Instrument Data" panel and its CSV download were removed on purpose: report pages no longer show or hand
//    out the raw instrument headers or the wavelength table.)

import { useRef, useEffect, useState } from 'react';
import HelpTip from './HelpTip.jsx';

// Approximate color for a hue angle (degrees), used to tint each of the
// 16 hue-bin bars / 99 CES-sample bars by its own hue.
function hueToRGB(h) {
  return [
    Math.max(30, Math.min(240, Math.round(128 + 127 * Math.cos((h * Math.PI) / 180)))),
    Math.max(30, Math.min(240, Math.round(128 + 127 * Math.cos(((h - 120) * Math.PI) / 180)))),
    Math.max(30, Math.min(240, Math.round(128 + 127 * Math.cos(((h + 120) * Math.PI) / 180)))),
  ];
}

// Shared resize-observer hook: re-renders charts when their canvas is
// resized by a layout change (e.g. mobile/desktop grid switch), not just
// on data change.
function useElementSize(ref) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

// BinBarChart: one of the three 16-hue-bin bar charts (chroma shift, hue
// shift, or fidelity). `mode` picks the layout: 'fidelity' draws plain
// 0-100 bars against rfBins; any other mode draws signed bars centered on
// a zero line against `data`, scaled to whichever of chroma(±%)/hue(±°)
// fits the largest real bin (rounded up to the next 0.05/5°).
export function BinBarChart({ title, rfBins, mode, theme: T = {}, tip, data, noHelp }) {
  const ref = useRef();
  const size = useElementSize(ref);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = devicePixelRatio || 1;
    const W = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 400;
    const H = canvas.offsetHeight || canvas.parentElement?.offsetHeight || 150;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const pL = 36, pR = 8, pT = 8, pB = 20, cW = W - pL - pR, cH = H - pT - pB;
    ctx.fillStyle = T.chartBg || 'rgba(0,0,0,0.2)'; ctx.fillRect(pL, pT, cW, cH);
    const bw = cW / 16;

    if (mode === 'fidelity') {
      ctx.strokeStyle = T.gridLine || 'rgba(255,255,255,0.07)'; ctx.lineWidth = 0.5;
      [25, 50, 75, 100].forEach((v) => {
        const gy = pT + cH - (v / 100) * cH;
        ctx.beginPath(); ctx.moveTo(pL, gy); ctx.lineTo(pL + cW, gy); ctx.stroke();
      });
      rfBins.forEach((v, h) => {
        const bh = (v / 100) * cH * 0.95;
        const [r, g, b] = hueToRGB(h * 22.5 + 11.25);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(pL + h * bw + 1, pT + cH - bh, bw - 2, bh);
        ctx.font = 'bold 11px monospace'; ctx.fillStyle = T.text || '#e8f4ff'; ctx.textAlign = 'center';
        ctx.fillText(Math.round(v), pL + h * bw + bw / 2, pT + cH - bh - 2);
        ctx.fillStyle = '#7aaccc';
        ctx.fillText(h + 1, pL + h * bw + bw / 2, pT + cH + 14);
      });
      ctx.font = '11px monospace'; ctx.fillStyle = T.dim || '#7aaccc'; ctx.textAlign = 'center';
      ctx.fillText('Hue-Angle Bin (j)', pL + cW / 2, H - 2);
      ctx.textAlign = 'right';
      ['100', '75', '50', '25'].forEach((l, i) => ctx.fillText(l, pL - 3, pT + (i / 4) * cH + 4));
    } else {
      const cen = pT + cH / 2;
      const arr = data && data.length ? data : Array(16).fill(0);
      const MAX = mode === 'chroma'
        ? Math.max(0.1, Math.ceil(Math.max(0.001, ...arr.map((v) => Math.abs(+v || 0))) / 0.05) * 0.05)
        : Math.max(5, Math.ceil(Math.max(0.001, ...arr.map((v) => Math.abs(+v || 0))) / 5) * 5);
      const scale = (v) => (cH / 2) * 0.9 * Math.min(1, Math.abs(v) / MAX);
      ctx.strokeStyle = 'rgba(100,140,180,0.5)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(pL, cen); ctx.lineTo(pL + cW, cen); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 0.5;
      [-0.5, -0.25, 0.25, 0.5].forEach((f) => {
        const gy = cen - (cH / 2) * f * 0.9;
        ctx.beginPath(); ctx.moveTo(pL, gy); ctx.lineTo(pL + cW, gy); ctx.stroke();
      });
      arr.forEach((raw, h) => {
        const a = +raw || 0, bh = scale(a);
        const [r, g, b] = hueToRGB(h * 22.5 + 11.25);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        a >= 0 ? ctx.fillRect(pL + h * bw + 1, cen - bh, bw - 2, bh) : ctx.fillRect(pL + h * bw + 1, cen, bw - 2, bh);
        ctx.font = 'bold 10px monospace'; ctx.fillStyle = T.text || '#e8f4ff'; ctx.textAlign = 'center';
        const py = a >= 0 ? cen - bh - 2 : cen + bh + 7;
        const label = mode === 'chroma' ? Math.round(a * 100) + '%' : (Math.round(a * 10) / 10).toFixed(1) + '°';
        ctx.fillText(label, pL + h * bw + bw / 2, py);
        ctx.fillStyle = T.dim || '#7aaccc'; ctx.font = '10px monospace';
        ctx.fillText(h + 1, pL + h * bw + bw / 2, pT + cH + 14);
      });
      const labs = mode === 'chroma'
        ? [Math.round(MAX * 100) + '%', '0%', '-' + Math.round(MAX * 100) + '%']
        : [MAX + '°', '0', '-' + MAX + '°'];
      ctx.textAlign = 'right'; ctx.font = '11px monospace'; ctx.fillStyle = T.dim || '#7aaccc';
      labs.forEach((l, i) => ctx.fillText(l, pL - 3, pT + (i / 2) * cH + 4));
    }
    ctx.strokeStyle = T.axisBorder || 'rgba(80,140,200,0.2)'; ctx.lineWidth = 0.5; ctx.strokeRect(pL, pT, cW, cH);
  }, [rfBins, mode, data, T?.name, size]);

  return (
    <div style={{ position: 'relative' }}>
      {/* The bundle colors this label from an always-empty module-level
          theme stand-in (so `.dim` is undefined there too) -- the title
          renders in whatever color it inherits, not the theme's dim gray.
          Reproduced here by leaving `color` unset rather than using T.dim. */}
      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, fontWeight: 700, fontFamily: 'monospace' }}>
        {title}
      </div>
      <canvas ref={ref} style={{ width: '100%', height: 150, display: 'block' }} />
      {tip && !noHelp && (
        <span style={{ position: 'absolute', top: 6, right: 6, zIndex: 6 }}>
          <HelpTip text={tip} />
        </span>
      )}
    </div>
  );
}

// CESBars: fidelity for each of the 99 individual CIE test-color samples.
// Uses the report's own per-sample rfSamples/sampleHues when present
// (`real`); otherwise interpolates the 16 hue-bin averages (rfBins) onto
// 99 evenly-spaced hue positions as a fallback.
export function CESBars({ rfBins, rfSamples, sampleHues, theme: T = {}, noHelp }) {
  const ref = useRef();
  const size = useElementSize(ref);
  const real = Array.isArray(rfSamples) && rfSamples.length === 99;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = devicePixelRatio || 1;
    const W = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 800;
    const H = canvas.offsetHeight || canvas.parentElement?.offsetHeight || 80;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const pL = 36, pR = 8, pT = 8, pB = 20, cW = W - pL - pR, cH = H - pT - pB;
    ctx.fillStyle = T.chartBg || 'rgba(0,0,0,0.2)'; ctx.fillRect(pL, pT, cW, cH);
    const bw = cW / 99;
    ctx.strokeStyle = T.gridLine || 'rgba(255,255,255,0.07)'; ctx.lineWidth = 0.5;
    [25, 50, 75, 100].forEach((v) => {
      const gy = pT + cH - (v / 100) * cH;
      ctx.beginPath(); ctx.moveTo(pL, gy); ctx.lineTo(pL + cW, gy); ctx.stroke();
    });
    for (let i = 0; i < 99; i++) {
      let bh, hue;
      if (real) {
        bh = (Math.min(100, Math.max(0, +rfSamples[i] || 0)) / 100) * cH * 0.95;
        hue = Array.isArray(sampleHues) && sampleHues.length === 99 ? +sampleHues[i] || 0 : (i / 99) * 360;
      } else {
        const n = (i / 99) * 16, b0 = Math.floor(n), b1 = Math.min(15, b0 + 1), frac = n - b0;
        bh = (Math.min(100, Math.max(0, (rfBins[b0] ?? 75) * (1 - frac) + (rfBins[b1] ?? 75) * frac)) / 100) * cH * 0.95;
        hue = (i / 99) * 360;
      }
      const [r, g, b] = hueToRGB(hue);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(pL + i * bw, pT + cH - bh, Math.max(0.5, bw), bh);
    }
    ctx.font = '11px monospace'; ctx.fillStyle = T.dim || '#7aaccc'; ctx.textAlign = 'center';
    [1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77, 81, 85, 89, 93, 97].forEach((n) => {
      ctx.fillText(n, pL + (n - 1) * bw + bw / 2, pT + cH + 12);
    });
    ctx.fillStyle = T.dim || '#7aaccc'; ctx.fillText('CES Color', pL + cW / 2, H - 1);
    ctx.textAlign = 'right'; ctx.font = '11px monospace'; ctx.fillStyle = T.dim || '#7aaccc';
    ['100', '50', '0'].forEach((l, i) => ctx.fillText(l, pL - 3, pT + (i / 2) * cH + 4));
    ctx.strokeStyle = T.axisBorder || 'rgba(80,140,200,0.2)'; ctx.lineWidth = 0.5; ctx.strokeRect(pL, pT, cW, cH);
  }, [rfBins, rfSamples, sampleHues, T?.name, size]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Same unset-color quirk as BinBarChart's title -- see comment there. */}
      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, fontWeight: 700, fontFamily: 'monospace' }}>
        Color Sample Fidelity, R<sub>f,CES</sub>
      </div>
      <canvas ref={ref} style={{ width: '100%', height: 80, display: 'block' }} />
      {!noHelp && (
        <span style={{ position: 'absolute', top: 6, right: 6, zIndex: 6 }}>
          <HelpTip text={'COLOR SAMPLE FIDELITY, RF,CES\n\n\n\nFidelity for each of the 99 individual CIE test-color samples used in TM-30, rather than the 16 hue-angle averages above. A dip here shows exactly which color is hardest for this source to render, even if its hue bin looks fine on average.'} />
        </span>
      )}
    </div>
  );
}
