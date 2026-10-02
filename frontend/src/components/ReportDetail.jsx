// frontend/src/components/ReportDetail.jsx
//
// Reconstructed from the deployed assets/app.js. This is the public-facing
// report page used by the Explore browsing experience: a logged-out
// visitor viewing a public report (via Explore or a share link), and the
// signed-in owner viewing one of their own reports from the "My Reports"
// side of the app that this batch covers. It is a sibling to (but distinct
// from, and NOT the same component as) the private-dashboard
// ReportView.jsx -- that file is the signed-in app's main report pane;
// this one is what the public Explore pages render, and additionally
// supports:
//   - a compact "preview" mode (prop `preview`, defaulting to true for
//     guests / false for owners) used for an embedded/share preview card
//   - the public share-link toggle (enable/disable + copy link)
//   - the "Exclude report from Explore" (isPublic) checkbox
//   - Votes (thumbs up/down) and the category chips/editor (CategoryEditor.jsx)
//   - a downloadable PNG "Share Card" (ShareCardModal)
//
// Minified names -> what they turned out to be:
//   __riOf   -> normalizeRi            (robust R1-R15 lookup/normalization)
//   Dg       -> DraggableChartsRow     (SPD + chroma/hue/fidelity bars, user-reorderable)
//   Dh       -> DraggableTopRow        (CVG wheel + CRI bars + CIE chart, user-reorderable)
//   _e       -> ReportDetail (default export of this file)
//   ye       -> CRIBars                (canvas bar chart of R1-R15)
//   Se       -> MetricGrid             (user-customizable draggable metric tiles)
//   Ce       -> KeyMetric              (single metric tile, used only by the mobile layout below -- NOT by MetricGrid, which renders its own tiles inline)
//   we/Te/Ee -> interpretFidelity/interpretGamut/interpretDuv (plain-language blurbs)
//   Oe       -> ShareCardModal (split into its own file, see ShareCardModal.jsx)
//   Cat      -> CategoryEditor.jsx (reconstructed by this batch; rendered
//               indirectly here, nested inside MetaEditor/`ge` -- see below)
//
// Dependencies reconstructed by OTHER batches, already landed and wired
// up here by their real names/paths:
//   ce -> SPDChart.jsx (default)                  {wls, vals, cct, theme}
//   le -> ReportCharts.jsx: BinBarChart            {title, tip, rfBins, mode, data, theme, noHelp}
//   ue -> ReportCharts.jsx: CESBars                {rfBins, rfSamples, sampleHues, theme, noHelp}
//   de -> ReportCharts.jsx: RawDataPanel           {headers, wls, vals, label, C}
//   fe -> CVGWheel.jsx (default)                   {report, rfBins, Rg, Rf, cct, duv, size, theme, noHelp}
//   Q1 -> Chromaticity.jsx: ChromaticityMini        {report, noHelp}
//   H  -> Chromaticity.jsx: ChromaticityPanel (default) {report} -- the "cie" tab's 3D/4-panel plot
//   re -> HelpTip.jsx (default)                    {text, children}
//   O  -> HelpModal.jsx (default)                  {onClose}
//   me -> MetaEditor.jsx: RenameField               {value, onSave, disabled} -- used
//         directly in the header bar, for the report title
//   ge -> MetaEditor.jsx (default export)           {report, isGuest, onSave} -- the
//         "Source Details" block (Title + Notes click-to-edit fields, plus a
//         nested CategoryEditor). NOTE: a prior pass in this file rendered
//         CategoryEditor directly here and dropped the Notes field and the
//         "Source Details" wrapper entirely -- fixed in this pass to render
//         MetaEditor (which renders CategoryEditor itself), matching the bundle.
//

import { useState, useEffect, useRef, useMemo } from 'react';
import { getToken } from '../lib/api';
import { useTheme } from '../lib/ThemeContext.jsx';
import { useIsMobile } from '../hooks/useIsMobile';
import { fmtTZ } from '../lib/tz';
import { ReportNotices } from './Notices.jsx';
import Votes from './Votes.jsx';
import ShareCardModal from './ShareCardModal.jsx';

import SPDChart from './SPDChart.jsx';
import { BinBarChart, CESBars, RawDataPanel } from './ReportCharts.jsx';
import CVGWheel from './CVGWheel.jsx';
import ChromaticityPanel, { ChromaticityMini } from './Chromaticity.jsx';
import HelpTip from './HelpTip.jsx';
import HelpModal from './HelpModal.jsx';
import MetaEditor, { RenameField } from './MetaEditor.jsx';
// TM30Modal (minified `ie`, app.js ~line 19676) is a full canvas-rendered
// TM-30 report modal -- reconstructed by the Batch C1 pass as AnnexEModal.jsx
// (the "TM-30 Report" action); imported here under that real name.
import AnnexEModal from './AnnexEModal.jsx';
import usePanelBackClose from '../hooks/usePanelBackClose';

const sHead = { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, fontWeight: 700 };

// Holds the "current theme colors" object for KeyMetric below, which --
// in the original bundle -- reads it from this module-level variable (set
// by ReportDetail on every render) instead of taking it as a prop at all.
let _lastTheme = {};

// ── normalizeRi ──────────────────────────────────────────────────────────
// Robust R1-R15 lookup: tries report.ri in a few shapes (r1/R1/1/"1"), then
// falls back to report.rawHeaders (R1..R15 / r1..r15) if nothing usable was
// found in `ri`. Returns null if there's simply no per-sample CRI data.
export function normalizeRi(report) {
  let out = {}, n = 0;
  const ri = report && report.ri;
  if (ri && typeof ri === 'object') {
    for (let i = 1; i <= 15; i++) {
      let v = ri['r' + i];
      if (v == null) v = ri['R' + i];
      if (v == null) v = ri[i];
      if (v == null) v = ri[String(i)];
      if (v != null && v !== '' && !isNaN(+v)) { out['r' + i] = Math.round(+v); n++; }
    }
  }
  if (n) return out;
  const h = (report && report.rawHeaders) || {};
  out = {}; n = 0;
  for (let i = 1; i <= 15; i++) {
    let v = h['R' + i];
    if (v == null) v = h['r' + i];
    if (v != null && v !== '' && !isNaN(+v)) { out['r' + i] = Math.round(+v); n++; }
  }
  return n ? out : null;
}

// ── CRIBars ───────────────────────────────────────────────────────────────
// Canvas bar chart of R1-R15 (test-colour-sample fidelity), each bar tinted
// to its TCS swatch's approximate colour.
const TCS_COLORS = {
  1: '#c08878', 2: '#b09858', 3: '#8a9a60', 4: '#4a7848', 5: '#60989a',
  6: '#6890b8', 7: '#8878a8', 8: '#c07898', 9: '#cc2828', 10: '#d4b424',
  11: '#3e8850', 12: '#1e3ea8', 13: '#d49878', 14: '#4e6030', 15: '#c08868',
};

export function CRIBars({ ri, C, noHelp }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ri) return;
    const draw = () => {
      const r = canvasRef.current;
      if (!r) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = r.clientWidth, H = r.clientHeight;
      if (!W || !H) return;
      r.width = Math.round(W * dpr);
      r.height = Math.round(H * dpr);
      const ctx = r.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const items = [];
      for (let i = 1; i <= 15; i++) {
        const v = ri['r' + i];
        if (v != null && !isNaN(v)) items.push({ i, v: +v });
      }
      if (!items.length) return;

      const txt = C.dim || 'rgba(150,160,175,0.85)';
      const fs = Math.max(11, Math.min(13, Math.round(W * 0.018)));
      const ML = Math.round(fs * 3) + 8, MR = 8, MT = fs + 12, MB = 6;
      const cw = W - ML - MR, ch = H - MT - MB;
      const lo = Math.min(0, ...items.map((d) => d.v));
      const hi = 100;
      const xOf = (v) => ML + ((v - lo) / (hi - lo)) * cw;

      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'center';
      ctx.font = `${fs - 1}px monospace`;
      for (let tk = Math.ceil(lo / 20) * 20; tk <= hi; tk += 20) {
        const gx = xOf(tk);
        ctx.strokeStyle = 'rgba(128,128,128,0.16)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(gx, MT); ctx.lineTo(gx, MT + ch); ctx.stroke();
        ctx.fillStyle = txt;
        ctx.fillText(String(tk), gx, MT - 5);
      }

      const rowH = ch / items.length;
      const barH = Math.min(rowH * 0.62, 16);
      const pill = (px, py, pw, ph, pr) => {
        pr = Math.min(pr, ph / 2, pw / 2);
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, pr);
        else {
          ctx.moveTo(px + pr, py);
          ctx.arcTo(px + pw, py, px + pw, py + ph, pr);
          ctx.arcTo(px + pw, py + ph, px, py + ph, pr);
          ctx.arcTo(px, py + ph, px, py, pr);
          ctx.arcTo(px, py, px + pw, py, pr);
          ctx.closePath();
        }
      };
      const onColor = (hex) => {
        const m = hex.replace('#', '');
        const rr = parseInt(m.slice(0, 2), 16), gg = parseInt(m.slice(2, 4), 16), bb = parseInt(m.slice(4, 6), 16);
        return (0.299 * rr + 0.587 * gg + 0.114 * bb) / 255 > 0.6 ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.96)';
      };

      items.forEach((d, idx) => {
        const cy = MT + rowH * (idx + 0.5);
        const by = cy - barH / 2;
        const x0 = xOf(lo);
        const bw = Math.max(barH, xOf(d.v) - x0);
        const col = TCS_COLORS[d.i] || '#888';

        ctx.fillStyle = col;
        pill(x0, by, bw, barH, barH / 2);
        ctx.fill();

        ctx.fillStyle = txt;
        ctx.font = `bold ${fs}px monospace`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('R' + d.i, ML - 6, cy);

        const lab = String(Math.round(d.v));
        const tw = ctx.measureText(lab).width;
        if (bw > tw + 16) {
          ctx.fillStyle = onColor(col);
          ctx.textAlign = 'right';
          ctx.fillText(lab, x0 + bw - 9, cy);
        } else {
          ctx.fillStyle = C.text || 'rgba(230,240,255,0.95)';
          ctx.textAlign = 'left';
          ctx.fillText(lab, x0 + bw + 6, cy);
        }
      });
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [ri, C]);

  const keys = ri && typeof ri === 'object' ? Object.keys(ri) : [];
  if (!keys.some((k) => /^r\d+$/.test(k))) return null;
  const rows = keys.filter((k) => /^r\d+$/.test(k)).length || 15;
  const h = Math.max(220, rows * 22 + 28);

  return (
    <div style={{ marginTop: 12, maxWidth: 480, position: 'relative' }}>
      <div style={{ fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>
        CRI R1–R15
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: h, display: 'block' }} />
      {!noHelp && (
        <span style={{ position: 'absolute', top: 6, right: 6, zIndex: 6 }}>
          <HelpTip text={'CRI R1–R15\n\n\n\nEach bar rates how faithfully the source renders one test color, 0–100. R1–R8 average to Ra (general CRI); R9–R15 add saturated red, yellow, green, blue, skin tones and foliage. Instrument values are used when present, otherwise computed from the spectrum.'} />
        </span>
      )}
    </div>
  );
}

// ── DraggableChartsRow (Dg) ───────────────────────────────────────────────
// SPD + the three per-bin shift charts, in a 2x2 grid the viewer can
// reorder by drag-and-drop; the order is remembered per-report in
// localStorage ("chartorder_<id>").
export function DraggableChartsRow({ report, theme }) {
  const rfBins = report.rfBins || Array(16).fill(report.Rf || 75);
  const storageKey = `chartorder_${report.id}`;
  const DEFAULT_ORDER = ['spd', 'chroma', 'hue', 'fidelity'];

  const [order, setOrder] = useState(() => {
    try {
      const v = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(v) && v.length === 4 ? v : DEFAULT_ORDER;
    } catch { return DEFAULT_ORDER; }
  });
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(order)); } catch {}
  }, [order]);

  const [dragging, setDragging] = useState(null);
  const [over, setOver] = useState(null);

  const move = (a, b) => {
    if (!a || a === b) return;
    const n = [...order];
    const i = n.indexOf(a), j = n.indexOf(b);
    if (i < 0 || j < 0) return;
    n.splice(i, 1); n.splice(j, 0, a);
    setOrder(n);
  };

  const TIPS = {
    spd: 'SPECTRAL POWER DISTRIBUTION\n\n\n\nShows how much light is emitted at each wavelength. The colored fill represents the hue at each wavelength. The red line is the test source; the grey dashed line is the reference illuminant.',
    chroma: 'LOCAL CHROMA SHIFT\n\n\n\nChroma shift per hue bin. + = more vivid, - = less saturated.',
    hue: 'LOCAL HUE SHIFT\n\n\n\nHue rotation per bin, in degrees. + = toward yellow, - = toward blue.',
    fidelity: 'LOCAL COLOR FIDELITY\n\n\n\nColor fidelity per hue bin (0-100). Higher = more accurate rendering in that hue range.',
  };

  const chart = (id) => {
    if (id === 'spd') {
      return (
        <div>
          <div style={{ fontSize: 12, color: theme.dim, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, fontFamily: 'monospace', marginBottom: 6 }}>
            Spectral Power Distribution
          </div>
          {report.wls && report.vals ? (
            <SPDChart wls={report.wls} vals={report.vals} cct={report.cct} theme={theme} />
          ) : (
            <div style={{ height: 160, background: theme.surface2, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.dim, fontSize: 11 }}>
              No spectral data
            </div>
          )}
        </div>
      );
    }
    if (id === 'chroma') {
      return <BinBarChart title="Local Chroma Shift (Rcs,hj)" tip={TIPS.chroma} rfBins={rfBins} mode="chroma" data={report.rcsBins} theme={theme} noHelp />;
    }
    if (id === 'hue') {
      return <BinBarChart title="Local Hue Shift (Rhs,hj)" tip={TIPS.hue} rfBins={rfBins} mode="hue" data={report.rhsBins} theme={theme} noHelp />;
    }
    return <BinBarChart title="Local Color Fidelity (Rf,hj)" tip={TIPS.fidelity} rfBins={rfBins} mode="fidelity" theme={theme} noHelp />;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '16px 22px', borderBottom: `1px solid ${theme.border}` }}>
      {order.map((id) => (
        <div
          key={id}
          draggable
          onDragStart={(ev) => { ev.dataTransfer.effectAllowed = 'move'; setDragging(id); }}
          onDragOver={(ev) => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'move'; setOver(id); }}
          onDrop={(ev) => { ev.preventDefault(); move(dragging, id); setDragging(null); setOver(null); }}
          onDragEnd={() => { setDragging(null); setOver(null); }}
          style={{
            background: theme.surface,
            border: `1px solid ${over === id ? theme.accent : theme.border}`,
            borderRadius: 8,
            padding: '10px 12px',
            opacity: dragging === id ? 0.4 : 1,
            cursor: 'grab',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            transition: 'border-color .15s,opacity .15s',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ opacity: 0.4, fontSize: 13, color: theme.dim, cursor: 'grab' }} title="Drag to reorder">⠿</span>
            <span style={{ position: 'absolute', top: 8, right: 8, zIndex: 6 }}>
              <HelpTip text={TIPS[id]} />
            </span>
          </div>
          {chart(id)}
        </div>
      ))}
    </div>
  );
}

// ── DraggableTopRow (Dh) ──────────────────────────────────────────────────
// CVG wheel + CRI bars + CIE chromaticity chart, also user-reorderable
// ("toprow_<id>" in localStorage).
export function DraggableTopRow({ report, theme }) {
  const rfBins = report.rfBins || Array(16).fill(report.Rf || 75);
  const storageKey = `toprow_${report.id}`;
  const DEFAULT_ORDER = ['cvg', 'cri', 'cie'];

  const [order, setOrder] = useState(() => {
    try {
      const v = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(v) && v.length === 3 ? v : DEFAULT_ORDER;
    } catch { return DEFAULT_ORDER; }
  });
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(order)); } catch {}
  }, [order]);

  const [dragging, setDragging] = useState(null);
  const [over, setOver] = useState(null);

  const move = (a, b) => {
    if (!a || a === b) return;
    const n = [...order];
    const i = n.indexOf(a), j = n.indexOf(b);
    if (i < 0 || j < 0) return;
    n.splice(i, 1); n.splice(j, 0, a);
    setOrder(n);
  };

  const TIPS = {
    cvg: 'COLOR VECTOR GRAPHIC\n\n\n\nShows how the source shifts the hue and saturation of 16 color groups versus a reference: points pushed outward render more saturated, inward less. Rf rates overall fidelity; Rg rates average saturation (100 = reference).',
    cri: 'CRI R1–R15\n\n\n\nEach bar rates how faithfully the source renders one test color, 0–100. R1–R8 average to Ra (general CRI); R9–R15 add saturated red, yellow, green, blue, skin tones and foliage. Instrument values are used when present, otherwise computed from the spectrum.',
    cie: 'CIE 1931 CHROMATICITY\n\n\n\nThe horseshoe outlines every color the eye can see; the inner curve is the Planckian (blackbody) locus of white points by temperature. The dot is this source’s (x, y); Duv is its distance above or below that locus.',
  };

  const chart = (id) => {
    if (id === 'cvg') {
      return (
        <CVGWheel report={report} rfBins={rfBins} Rg={report.Rg || 100} Rf={report.Rf || 80} cct={report.cct} duv={report.duv} size={260} theme={theme} noHelp />
      );
    }
    if (id === 'cri') {
      const ri = normalizeRi(report);
      return ri && Object.keys(ri).length > 0 ? <CRIBars ri={ri} C={theme} noHelp /> : null;
    }
    return <ChromaticityMini report={report} noHelp />;
  };

  return (
    <div style={{ padding: '16px 22px', borderBottom: `1px solid ${theme.border}`, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16, alignItems: 'start' }}>
      {order.map((id) => (
        <div
          key={id}
          draggable
          onDragStart={(ev) => { ev.dataTransfer.effectAllowed = 'move'; setDragging(id); }}
          onDragOver={(ev) => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'move'; setOver(id); }}
          onDrop={(ev) => { ev.preventDefault(); move(dragging, id); setDragging(null); setOver(null); }}
          onDragEnd={() => { setDragging(null); setOver(null); }}
          style={{
            minWidth: 0,
            background: theme.surface,
            border: `1px solid ${over === id ? theme.accent : theme.border}`,
            borderRadius: 8,
            padding: '8px 10px',
            opacity: dragging === id ? 0.4 : 1,
            cursor: 'grab',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            transition: 'border-color .15s,opacity .15s',
            position: 'relative',
          }}
        >
          <span style={{ opacity: 0.4, fontSize: 13, color: theme.dim, cursor: 'grab' }} title="Drag to reorder">⠿</span>
          <span style={{ position: 'absolute', top: 8, right: 8, zIndex: 6 }}>
            <HelpTip text={TIPS[id]} />
          </span>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>{chart(id)}</div>
        </div>
      ))}
    </div>
  );
}

// ── KeyMetric (Ce) ────────────────────────────────────────────────────────
// A single labeled metric tile, used by ReportDetail's mobile layout.
// Verified against the bundle: this component takes NO `theme` prop at
// all -- it always reads colors off the module-level `_lastTheme`, which
// ReportDetail reassigns to the current theme on every render before
// rendering any KeyMetric. Kept that way for fidelity (every call site
// below used to also pass `theme={U}`, which the original silently
// ignored since `Ce` never destructured it).
export function KeyMetric({ label, value, color, tip }) {
  const U = _lastTheme;
  return (
    <div style={{ background: U.surface, border: `1px solid ${U.border}`, borderRadius: 6, padding: '10px 12px', position: 'relative' }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: U.dim, marginBottom: 5, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || U.text }}>{value ?? '—'}</div>
      {tip && (
        <span style={{ position: 'absolute', top: 6, right: 6, zIndex: 6 }}>
          <HelpTip text={tip} />
        </span>
      )}
    </div>
  );
}

// ── Plain-language interpretation helpers ────────────────────────────────
export function interpretFidelity(rf) {
  if (rf == null) return 'No data.';
  if (rf >= 90) return 'Excellent fidelity. Colors appear nearly identical to a reference illuminant.';
  if (rf >= 80) return 'Good fidelity. Minor color differences under close comparison.';
  if (rf >= 70) return 'Moderate fidelity. Noticeable shifts in some hues.';
  return 'Low fidelity. Significant color distortion likely.';
}

export function interpretGamut(rg) {
  if (rg == null) return 'No data.';
  if (rg > 110) return 'Gamut significantly expanded — colors appear more vivid/saturated.';
  if (rg > 102) return 'Slightly expanded gamut. Objects may appear marginally more vivid.';
  if (rg >= 98) return 'Gamut closely matches the reference — natural color saturation.';
  if (rg >= 90) return 'Slightly reduced gamut. Colors may appear less saturated.';
  return 'Gamut significantly reduced — colors appear notably desaturated.';
}

export function interpretDuv(duv) {
  if (duv == null) return 'No data.';
  const abs = Math.abs(duv);
  if (duv < 0) {
    if (abs < 0.002) return 'Extremely close to the Planckian locus.';
    if (abs < 0.005) return 'Slightly rosy — a faint pink tint below the blackbody locus. Within acceptable limits.';
    if (abs < 0.01) return 'Moderately rosy — a noticeable pink tint below the blackbody locus.';
    return 'Very rosy — a strong pink tint, well below the blackbody locus.';
  }
  const dir = 'above BBL (slight green tint)';
  if (abs < 0.002) return 'Extremely close to the Planckian locus.';
  if (abs < 0.006) return `Very close (${dir}). Within acceptable limits.`;
  if (abs < 0.012) return `Moderate deviation ${dir}.`;
  return `Large deviation ${dir}.`;
}

// ── MetricGrid (Se) ───────────────────────────────────────────────────────
// A user-customizable row of metric tiles with drag-to-reorder, remove, and
// an "Add Metric" menu that includes every numeric field found in the raw
// instrument headers. Layout/custom choices persist per-report
// ("metricgrid_<id>_order" / "_custom" in localStorage).
const BASE_METRICS = [
  { id: 'CCT', label: 'CCT', getValue: (e) => `${e.cct}K`, getColor: (e, t) => t.accent, condition: (e) => e.cct != null },
  { id: 'Duv', label: 'Duv', getValue: (e) => (e.duv >= 0 ? '+' : '') + e.duv.toFixed(4),
    getColor: (e, t) => (Math.abs(e.duv) < 0.006 ? t.good : Math.abs(e.duv) < 0.012 ? t.warn : t.bad), condition: (e) => e.duv != null },
  { id: 'Ra', label: 'Ra (CRI)', getValue: (e) => String(Math.round(e.ra)), getColor: (e, t) => t.text, condition: (e) => e.ra != null },
  { id: 'R9', label: 'R9', getValue: (e) => String(Math.round(e.r9)), getColor: (e, t) => (e.r9 >= 50 ? t.good : e.r9 >= 0 ? t.warn : t.bad), condition: (e) => e.r9 != null },
  { id: 'Rf', label: 'Rf', getValue: (e) => String(e.Rf), getColor: (e, t) => (e.Rf >= 85 ? t.good : e.Rf >= 70 ? t.warn : t.bad), condition: (e) => e.Rf != null },
  { id: 'Rg', label: 'Rg', getValue: (e) => String(e.Rg), getColor: (e, t) => t.text, condition: (e) => e.Rg != null },
  { id: 'CIEx', label: 'CIE x', getValue: (e) => e.x?.toFixed(4), getColor: (e, t) => t.text, condition: (e) => e.x != null },
  { id: 'CIEy', label: 'CIE y', getValue: (e) => e.y?.toFixed(4), getColor: (e, t) => t.text, condition: (e) => e.y != null },
];
const DEFAULT_METRIC_ORDER = ['CCT', 'Duv', 'Ra', 'R9', 'CIEx', 'CIEy'];

export function MetricGrid({ report, C: t }) {
  const key = `metricgrid_${report.id}`;
  const [order, setOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key + '_order')) || DEFAULT_METRIC_ORDER; } catch { return DEFAULT_METRIC_ORDER; }
  });
  const [custom, setCustom] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key + '_custom')) || []; } catch { return []; }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [over, setOver] = useState(null);

  useEffect(() => { try { localStorage.setItem(key + '_order', JSON.stringify(order)); } catch {} }, [order]);
  useEffect(() => { try { localStorage.setItem(key + '_custom', JSON.stringify(custom)); } catch {} }, [custom]);

  const rawMetrics = useMemo(
    () =>
      report.rawHeaders
        ? Object.entries(report.rawHeaders)
            .filter(([, v]) => v !== '' && v != null && !isNaN(Number(v)))
            .map(([k, v]) => ({ id: 'raw_' + k, label: k, getValue: () => v, getColor: (e, t) => t.text, condition: () => true, isRaw: true }))
        : [],
    [report.rawHeaders]
  );

  const all = [...BASE_METRICS, ...rawMetrics, ...custom];
  const byId = Object.fromEntries(all.map((m) => [m.id, m]));
  const visible = order.filter((id) => byId[id] && byId[id].condition(report));
  const available = all.filter((m) => !order.includes(m.id) && m.condition(report));

  const onDragStart = (ev, id) => { setDragging(id); ev.dataTransfer.effectAllowed = 'move'; };
  const onDragOver = (ev, id) => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'move'; setOver(id); };
  const onDrop = (ev, id) => {
    ev.preventDefault();
    if (!dragging || dragging === id) { setDragging(null); setOver(null); return; }
    const n = [...order];
    const a = n.indexOf(dragging), b = n.indexOf(id);
    if (a === -1 || b === -1) { setDragging(null); setOver(null); return; }
    n.splice(a, 1); n.splice(b, 0, dragging);
    setOrder(n); setDragging(null); setOver(null);
  };
  const onDragEnd = () => { setDragging(null); setOver(null); };
  const removeMetric = (id) => setOrder((o) => o.filter((x) => x !== id));
  const addMetric = (id) => { if (!order.includes(id)) setOrder((o) => [...o, id]); setMenuOpen(false); };
  const resetMetrics = () => { setOrder(DEFAULT_METRIC_ORDER); setCustom([]); };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {visible.map((id) => {
          const m = byId[id];
          if (!m) return null;
          const value = m.getValue(report);
          const color = m.getColor(report, t);
          return (
            <div
              key={id}
              draggable
              onDragStart={(e) => onDragStart(e, id)}
              onDragOver={(e) => onDragOver(e, id)}
              onDrop={(e) => onDrop(e, id)}
              onDragEnd={onDragEnd}
              style={{
                background: t.surface,
                border: `1px solid ${over === id ? t.accent : t.border}`,
                borderRadius: 6,
                padding: '10px 12px',
                cursor: 'grab',
                userSelect: 'none',
                opacity: dragging === id ? 0.4 : 1,
                transition: 'border-color .15s, opacity .15s',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: t.dim, marginBottom: 5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ opacity: 0.4, fontSize: 10 }}>⠿</span>
                  {m.label}
                </span>
                <button
                  onClick={() => removeMetric(id)}
                  style={{ background: 'none', border: 'none', color: t.dim, cursor: 'pointer', fontSize: 12, padding: '0 2px', opacity: 0.5, lineHeight: 1 }}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: color || t.text }}>{value ?? '—'}</div>
            </div>
          );
        })}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{ width: '100%', height: '100%', minHeight: 68, background: 'none', border: `1px dashed ${t.border}`, borderRadius: 6, color: t.dim, cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <span>+</span>
            <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>Add</span>
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200, background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 8, minWidth: 200, maxHeight: 320, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
              <div style={{ padding: '8px 12px', fontSize: 11, color: t.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between' }}>
                <span>Add Metric</span>
                <button onClick={resetMetrics} style={{ background: 'none', border: 'none', color: t.dim, cursor: 'pointer', fontSize: 10 }}>Reset</button>
              </div>
              {available.length === 0 && (
                <div style={{ padding: '10px 14px', color: t.dim, fontSize: 12 }}>All metrics shown</div>
              )}
              {available.map((m) => (
                <button
                  key={m.id}
                  onClick={() => addMetric(m.id)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 14px', background: 'none', border: 'none', color: t.text, cursor: 'pointer', fontSize: 13, fontFamily: 'monospace' }}
                >
                  {m.label}
                  {m.isRaw && <span style={{ fontSize: 10, color: t.dim, marginLeft: 6 }}>({m.getValue(report)})</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ReportDetail (_e) ─────────────────────────────────────────────────────
export default function ReportDetail({ report, allReports = [], isGuest = false, onMetaSave, onRefresh, isShared = false, preview }) {
  const { theme: T, themeName, toggleTheme } = useTheme();
  const [tab, setTab] = useState('report'); // 'report' | 'cie' -- no in-component UI currently switches this away from 'report'
  const [downloading, setDownloading] = useState(false); // unused in the current UI; kept for fidelity
  const [helpOpen, setHelpOpenLocal] = useState(() => __helpOpenShared);
  const setHelpOpen = (v) => { __helpOpenShared = v; setHelpOpenLocal(v); };
  const [tm30Open, setTm30Open] = useState(false);
  const isMobile = useIsMobile(768);
  const [shareCardOpen, setShareCardOpen] = useState(false);
  // Verified against the bundle: setShareRowOpen is never called anywhere in
  // the original minified source either, so the detailed "Share Link" row
  // below is dead/unreachable there too (the header's "Copy Share Link" /
  // "Revoke Share Link" buttons are the only working share-link UI). Kept
  // as-is for fidelity rather than wired up, since this isn't a
  // reconstruction bug -- it matches the deployed app's actual behavior.
  const [shareRowOpen, setShareRowOpen] = useState(false);
  const [shareToken, setShareToken] = useState(report?.shareToken || null);
  const [isPublic, setIsPublic] = useState(report?.isPublic || false);
  const [publicSaving, setPublicSaving] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  usePanelBackClose(helpOpen, () => setHelpOpen(false));
  usePanelBackClose(tm30Open, () => setTm30Open(false));
  usePanelBackClose(shareCardOpen, () => setShareCardOpen(false));

  const U = {
    bg: T.bg, surface: T.surface, surface2: T.surface2, border: T.border,
    text: T.text, dim: T.dim, accent: T.accent, good: T.good, warn: T.warn, bad: T.bad, red: T.bad,
  };
  _lastTheme = U;

  const linkBtn = {
    background: `${U.accent}18`, border: `1px solid ${U.accent}60`, color: U.accent,
    borderRadius: 5, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 600,
  };

  useEffect(() => {
    setShareToken(report?.shareToken || null);
    setIsPublic(report?.isPublic || false);
  }, [report?.id]);

  if (!report) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: U.dim, fontSize: 13, gap: 6, background: U.bg, fontFamily: 'monospace' }}>
        <div style={{ fontSize: 48, opacity: 0.15 }}>📊</div>
        <div>Select a report from the list to view it</div>
      </div>
    );
  }

  const rfBins = report.rfBins || Array(16).fill(report.Rf || 75);

  async function toggleShare() {
    setShareBusy(true);
    const action = shareToken ? 'disable' : 'enable';
    try {
      const res = await fetch(`./index.php/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ shareAction: action }),
      });
      const r = await res.json();
      if (!res.ok) throw new Error(r.error);
      setShareToken(r.shareToken);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setShareBusy(false);
    }
  }

  function copyLink() {
    const url = isPublic
      ? `${window.location.origin}${window.location.pathname}?report=${report.id}`
      : `${window.location.origin}${window.location.pathname}?share=${shareToken}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  async function saveMeta(fields) {
    if (!report.id) return;
    await fetch(`./index.php/api/reports/${report.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(fields),
    }).then((r) => { if (!r.ok) throw new Error('Save failed'); });
    if (onMetaSave) onMetaSave({ ...report, ...fields });
  }

  const showCompactPreview = (preview === undefined ? isGuest : preview) && !isShared;

  // ── Compact preview card (guest / embedded preview) ────────────────────
  if (showCompactPreview) {
    const KV = (label, value, color, sub) => (
      <div style={{ background: U.surface, border: `1px solid ${U.border}`, borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: U.dim, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 900, color, marginTop: 2 }}>{value}</div>
        <div style={{ fontSize: 10, color: U.dim, marginTop: 2 }}>{sub}</div>
      </div>
    );
    const SEC = (title, desc, body) => (
      <div style={{ padding: isMobile ? '12px 12px' : '16px 22px', borderTop: `1px solid ${U.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: U.text, textTransform: 'uppercase', letterSpacing: 0.6 }}>{title}</div>
        {desc && <div style={{ fontSize: 12, color: U.dim, margin: '3px 0 12px', maxWidth: 660, lineHeight: 1.5 }}>{desc}</div>}
        {body}
      </div>
    );
    const ri = normalizeRi(report);

    return (
      <div className="report-view-root" style={{ display: 'flex', flexDirection: 'column', height: isMobile ? 'auto' : '100%', background: U.bg, fontFamily: 'monospace', overflow: isMobile ? 'visible' : 'auto', color: U.text }}>
        <div style={{ padding: isMobile ? '14px 14px 4px' : '20px 22px 4px' }}>
          <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900, color: U.text, wordBreak: 'break-word' }}>{report.label || 'Untitled'}</div>
          <div style={{ fontSize: 12, color: U.dim, marginTop: 4 }}>Spectral analysis · TM‑30 / CRI · guest preview, not saved</div>
        </div>
        <div style={{ padding: isMobile ? '6px 12px' : '10px 22px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(115px,1fr))', gap: 10 }}>
            {KV('CCT', report.cct ? Math.round(report.cct) + 'K' : '—', U.text, 'Color temperature')}
            {KV('Duv', report.duv == null ? '—' : report.duv.toFixed(4), Math.abs(report.duv || 0) < 0.006 ? U.good : U.warn, 'Tint vs black body')}
            {KV('CRI Ra', report.ra == null ? '—' : Math.round(report.ra), report.ra >= 90 ? U.good : report.ra >= 80 ? U.warn : U.bad, 'Average accuracy')}
            {KV('R9', report.r9 == null ? '—' : Math.round(report.r9), report.r9 >= 80 ? U.good : report.r9 >= 50 ? U.warn : U.bad, 'Deep-red accuracy')}
            {KV('Rf', report.Rf == null ? '—' : Math.round(report.Rf), report.Rf >= 90 ? U.good : report.Rf >= 80 ? U.warn : U.bad, 'TM-30 fidelity')}
            {KV('Rg', report.Rg == null ? '—' : Math.round(report.Rg), Math.abs((report.Rg || 100) - 100) <= 8 ? U.good : U.warn, 'TM-30 gamut')}
          </div>
        </div>

        {SEC(
          'Color rendering',
          "The circle (left) is a TM-30 colour-vector map showing how this light pushes or pulls each hue. The bars (centre) are CRI R1–R15 — how faithfully it renders 15 standard test colours, scored 0–100, where R9–R15 cover deep red, skin tones and foliage. The diagram (right) plots its colour point on the CIE 1931 chart.",
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 16, alignItems: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'center', background: U.surface, border: `1px solid ${U.border}`, borderRadius: 8, padding: 12 }}>
              <CVGWheel report={report} rfBins={rfBins} Rg={report.Rg || 100} Rf={report.Rf || 80} cct={report.cct} duv={report.duv} size={260} theme={T} noHelp />
            </div>
            <div style={{ background: U.surface, border: `1px solid ${U.border}`, borderRadius: 8, padding: 12 }}>
              {ri && Object.keys(ri).length > 0
                ? <CRIBars ri={ri} C={U} noHelp />
                : <div style={{ color: U.dim, fontSize: 12 }}>No per-sample CRI data.</div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', background: U.surface, border: `1px solid ${U.border}`, borderRadius: 8, padding: 12 }}>
              <ChromaticityMini report={report} noHelp />
            </div>
          </div>
        )}

        <div style={{ padding: isMobile ? '12px 12px' : '16px 22px', borderTop: `1px solid ${U.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: U.text, textTransform: 'uppercase', letterSpacing: 0.6 }}>Spectral power distribution</div>
              <div style={{ fontSize: 12, color: U.dim, margin: '3px 0 12px', lineHeight: 1.5 }}>
                The raw amount of light at each wavelength — the source’s fingerprint. Gaps here are what cause poor colour rendering.
              </div>
              {report.wls && report.vals ? (
                <div style={{ background: U.surface, border: `1px solid ${U.border}`, borderRadius: 8, padding: 12 }}>
                  <SPDChart wls={report.wls} vals={report.vals} cct={report.cct} theme={T} />
                </div>
              ) : (
                <div style={{ color: U.dim, fontSize: 12 }}>No spectral curve in this file.</div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: U.text, textTransform: 'uppercase', letterSpacing: 0.6 }}>Local colour fidelity</div>
              <div style={{ fontSize: 12, color: U.dim, margin: '3px 0 12px', lineHeight: 1.5 }}>
                How faithfully each hue is rendered, bin by bin. Bars near 100 mean colours look natural; lower bars mean that hue is distorted.
              </div>
              <div style={{ background: U.surface, border: `1px solid ${U.border}`, borderRadius: 8, padding: 12 }}>
                <BinBarChart title="Local Color Fidelity (Rf,hj)" rfBins={rfBins} mode="fidelity" theme={T} />
              </div>
            </div>
          </div>
        </div>

        {SEC(
          'See it in a photo',
          'Preview how this light would render colours in a real scene. Drop in your own photo — it stays in your browser and is never uploaded.',
          <div
            style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${U.border}`, padding: 10, background: U.surface }}
            ref={(el) => window.HCRIPhoto && window.HCRIPhoto.attach(el, () => ({
              theme: U, rfBins: report.rfBins, Rf: report.Rf, Rg: report.Rg,
              rcsBins: report.rcsBins, rhsBins: report.rhsBins, rlsBins: report.rlsBins,
              cct: report.cct, duv: report.duv,
            }))}
          />
        )}
      </div>
    );
  }

  // ── Full report page ─────────────────────────────────────────────────
  return (
    <>
      <div className="report-view-root" style={{ display: 'flex', flexDirection: 'column', height: isMobile ? 'auto' : '100%', background: U.bg, fontFamily: 'monospace', overflow: isMobile ? 'visible' : 'hidden', color: U.text }}>
        <div style={{ padding: isMobile ? '8px 12px' : '14px 22px', borderBottom: `1px solid ${U.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexShrink: 0, background: U.surface3, flexWrap: 'wrap' }}>
          <div>
            <RenameField
              value={report.label}
              disabled={isGuest || !report.id}
              onSave={async (val) => {
                if (!report.id || !val.trim()) return;
                await fetch(`./index.php/api/reports/${report.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                  body: JSON.stringify({ label: val, notes: report.notes }),
                });
                onMetaSave && onMetaSave({ ...report, label: val });
              }}
            />
            <div style={{ fontSize: 13, color: U.dim, fontWeight: 500, fontFamily: 'monospace' }}>
              {report.sourceType?.toUpperCase()} · {fmtTZ((report.createdAt || '').replace(' ', 'T'))}
              {report.instrumentModel && (
                <span style={{ marginLeft: 8, fontSize: 11, opacity: 0.8 }}>
                  · {report.instrumentModel}{report.instrumentVersion ? ` v${report.instrumentVersion}` : ''}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', minWidth: 0 }}>
            <button
              onClick={() => setTm30Open(true)}
              style={{ background: `${U.accent}15`, border: `1px solid ${U.accent}40`, color: U.accent, borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}
            >
              TM-30
            </button>
            {(!isGuest || isPublic) && (
              <button
                onClick={async () => {
                  if (isPublic) { copyLink(); return; }
                  if (shareToken) {
                    try {
                      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?share=${shareToken}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    } catch (err) { alert('Error: ' + err.message); }
                    return;
                  }
                  setShareBusy(true);
                  try {
                    const res = await fetch(`./index.php/api/reports/${report.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                      body: JSON.stringify({ shareAction: 'enable' }),
                    });
                    const r = await res.json();
                    if (!res.ok) throw new Error(r.error);
                    setShareToken(r.shareToken);
                    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?share=${r.shareToken}`).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    });
                  } catch (err) { alert('Error: ' + err.message); } finally { setShareBusy(false); }
                }}
                disabled={shareBusy}
                style={{
                  background: copied ? `${U.good}20` : `${U.accent}15`,
                  border: `1px solid ${copied ? U.good : U.accent}40`,
                  color: copied ? U.good : U.accent,
                  borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700,
                }}
              >
                {copied ? '✓ Copied' : shareBusy ? '…' : '🔗 Copy Share Link'}
              </button>
            )}
            {!isGuest && !isPublic && shareToken && (
              <button
                onClick={toggleShare}
                disabled={shareBusy}
                style={{ background: `${U.bad}15`, border: `1px solid ${U.bad}40`, color: U.bad, borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}
              >
                {shareBusy ? '…' : 'Revoke Share Link'}
              </button>
            )}
            <button
              onClick={() => setShareCardOpen(true)}
              style={{ background: `${U.accent}15`, border: `1px solid ${U.accent}40`, color: U.accent, borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}
            >
              ↗ Share Card
            </button>
          </div>
        </div>

        {shareRowOpen && (!isGuest || isPublic) && (
          <div style={{ padding: '12px 22px', background: isPublic || shareToken ? `${U.good}08` : U.surface2, borderBottom: `1px solid ${isPublic || shareToken ? U.good + '30' : U.border}`, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: U.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Share Link</div>
            {isPublic ? (
              <>
                <div style={{ flex: 1, background: U.bg, border: `1px solid ${U.border}`, borderRadius: 5, padding: '6px 10px', fontSize: 12, color: U.text, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                  {`${window.location.origin}${window.location.pathname}?report=${report.id}`}
                </div>
                <button onClick={copyLink} style={{ ...linkBtn, whiteSpace: 'nowrap', background: copied ? `${U.good}20` : undefined, color: copied ? U.good : U.accent }}>
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
              </>
            ) : shareToken ? (
              <>
                <div style={{ flex: 1, background: U.bg, border: `1px solid ${U.border}`, borderRadius: 5, padding: '6px 10px', fontSize: 12, color: U.text, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                  {`${window.location.origin}${window.location.pathname}?share=${shareToken}`}
                </div>
                <button onClick={copyLink} style={{ ...linkBtn, whiteSpace: 'nowrap', background: copied ? `${U.good}20` : undefined, color: copied ? U.good : U.accent }}>
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
                {!isGuest && (
                  <button onClick={toggleShare} disabled={shareBusy} style={{ ...linkBtn, background: 'none', color: U.bad, border: `1px solid ${U.bad}40`, whiteSpace: 'nowrap' }}>
                    {shareBusy ? '…' : 'Revoke'}
                  </button>
                )}
              </>
            ) : (
              <>
                <div style={{ flex: 1, fontSize: 13, color: U.dim }}>Generate a private link anyone with it can view.</div>
                <button
                  onClick={() => { window.track && window.track('share_report'); toggleShare(); }}
                  disabled={shareBusy}
                  style={{ ...linkBtn, whiteSpace: 'nowrap' }}
                >
                  {shareBusy ? 'Generating…' : 'Enable Sharing'}
                </button>
              </>
            )}
          </div>
        )}

        {tab === 'report' ? (
          <div style={{ flex: isMobile ? 'none' : 1, overflowY: isMobile ? 'visible' : 'auto', display: isMobile ? 'block' : 'flex', flexDirection: 'column' }}>
            {/* "Source Details" block: Title + Notes (click-to-edit) plus the
                structured category tags (CategoryEditor is nested inside it). */}
            <MetaEditor report={report} isGuest={isGuest} onSave={saveMeta} />

            {report?.id && (
              <div style={{ padding: '10px 22px', borderBottom: `1px solid ${U.border}`, display: 'flex', alignItems: 'center', gap: 12, background: U.surface }}>
                <span style={{ fontSize: 11, color: U.dim, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, fontFamily: 'monospace' }}>Rate this report</span>
                <Votes reportId={report.id} theme={U} />
              </div>
            )}

            {!isGuest && report?.id && (
              <div style={{ padding: '6px 22px 10px', borderBottom: `1px solid ${U.border}`, display: 'flex', alignItems: 'center', gap: 10, background: U.surface }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={!isPublic}
                    disabled={publicSaving}
                    onChange={async (ev) => {
                      const excluded = !ev.target.checked; // checkbox = "excluded"; isPublic is the inverse
                      setPublicSaving(true);
                      try {
                        const r = await (await fetch('./index.php/api/explore', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                          body: JSON.stringify({ id: report.id, public: !excluded }),
                        })).json();
                        setIsPublic(r.public);
                      } catch {} finally { setPublicSaving(false); }
                    }}
                    style={{ accentColor: U.accent, width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 12, color: isPublic ? U.dim : U.warn, fontFamily: 'monospace', fontWeight: isPublic ? 400 : 700 }}>
                    {publicSaving ? 'Saving…' : 'Exclude Report From Explore'}
                  </span>
                </label>
              </div>
            )}

            {report?.id && !isShared && <ReportNotices theme={U} />}

            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${U.border}`, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  <KeyMetric label="CCT" value={report.cct ? report.cct + 'K' : null} color={U.accent} />
                  <KeyMetric
                    label="Duv"
                    value={report.duv == null ? null : (report.duv >= 0 ? '+' : '') + report.duv.toFixed(4)}
                    color={Math.abs(report.duv ?? 1) < 0.006 ? U.good : Math.abs(report.duv ?? 1) < 0.012 ? U.warn : U.bad}
                  />
                  <KeyMetric label="Ra" value={report.ra == null ? null : Math.round(report.ra)} />
                  <KeyMetric label="CIE x" value={report.x?.toFixed(4)} />
                  <KeyMetric label="CIE y" value={report.y?.toFixed(4)} />
                  <KeyMetric label="R9" value={report.r9 == null ? null : Math.round(report.r9)} />
                </div>

                <div style={{ padding: 16, borderBottom: `1px solid ${U.border}`, display: 'flex', justifyContent: 'center' }}>
                  <CVGWheel report={report} rfBins={rfBins} Rg={report.Rg || 100} Rf={report.Rf || 80} cct={report.cct} duv={report.duv} size={280} theme={T} />
                </div>

                {(() => {
                  const ri = normalizeRi(report);
                  return ri && Object.keys(ri).length > 0 && (
                    <div style={{ padding: '12px 14px', borderBottom: `1px solid ${U.border}` }}>
                      <CRIBars ri={ri} C={U} />
                    </div>
                  );
                })()}

                <div style={{ padding: '12px 14px' }}>
                  <ChromaticityMini report={report} />
                </div>

                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${U.border}` }}>
                  <div style={{ ...sHead, color: U.dim, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    Spectral Power Distribution
                    <HelpTip text={'SPECTRAL POWER DISTRIBUTION\n\n\n\nShows how much light is emitted at each wavelength (380–780nm). The colored fill represents the hue at each wavelength. The red line is the test source; the grey dashed line is the reference illuminant.'} />
                  </div>
                  {report.wls && report.vals ? (
                    <SPDChart wls={report.wls} vals={report.vals} cct={report.cct} theme={T} />
                  ) : (
                    <div style={{ height: 120, background: U.surface, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: U.dim, fontSize: 11 }}>
                      No spectral data
                    </div>
                  )}
                </div>

                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${U.border}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <BinBarChart
                    title="Local Color Fidelity (Rf,hj)"
                    tip={'LOCAL COLOR FIDELITY\n\n\n\nColor fidelity per hue bin (0-100). Higher = more accurate rendering in that hue range.'}
                    rfBins={rfBins} mode="fidelity" theme={T}
                  />
                  <BinBarChart
                    title="Local Chroma Shift (Rcs,hj)"
                    tip={'LOCAL CHROMA SHIFT\n\n\n\nChroma shift per hue bin. + = more vivid, - = less saturated.'}
                    rfBins={rfBins} mode="chroma" data={report.rcsBins} theme={T}
                  />
                  <BinBarChart
                    title="Local Hue Shift (Rhs,hj)"
                    tip={'LOCAL HUE SHIFT\n\n\n\nHue rotation per bin, in degrees. + = toward yellow, - = toward blue.'}
                    rfBins={rfBins} mode="hue" data={report.rhsBins} theme={T}
                  />
                </div>

                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${U.border}` }}>
                  <div style={{ ...sHead, color: U.dim, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    See it on a photo
                    <span onClick={() => window.HCRIPlayground && window.HCRIPlayground.open()} style={{ fontSize: 11, fontWeight: 400, color: U.accent, cursor: 'pointer' }}>
                      Playground →
                    </span>
                  </div>
                  <div style={{ fontSize: 12, lineHeight: 1.6, color: U.dim, margin: '0 0 10px' }}>
                    The left side of each swatch is the true (reference) colour; the right side is how this light renders it. Drag the divider to compare, or load your own photo. Photos are only used in your browser and are never uploaded.
                  </div>
                  <div
                    style={{ borderRadius: 6, overflow: 'hidden', border: `1px solid ${U.border}`, padding: 10 }}
                    ref={(el) => window.HCRIPhoto && window.HCRIPhoto.attach(el, () => ({
                      theme: U, rfBins: report.rfBins, Rf: report.Rf, Rg: report.Rg,
                      rcsBins: report.rcsBins, rhsBins: report.rhsBins, rlsBins: report.rlsBins,
                      cct: report.cct, duv: report.duv,
                    }))}
                  />
                </div>

                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${U.border}` }}>
                  <div style={{ ...sHead, color: U.dim, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    Analysis
                    <HelpTip text={"ANALYSIS\n\n\n\nA plain-language read of this light's white point, colour fidelity, saturation, deep reds and per-hue colour shifts, with suggested uses."} />
                  </div>
                  <div
                    style={{ color: U.text }}
                    ref={(el) => window.HCRIAnalysis && window.HCRIAnalysis.attach(el, () => ({
                      mode: 'report', theme: themeName,
                      report: { id: report.id, label: report.label, cct: report.cct, duv: report.duv, ra: report.ra, r9: report.r9, Rf: report.Rf, Rg: report.Rg, rcsBins: report.rcsBins, rhsBins: report.rhsBins },
                    }))}
                  />
                </div>

                <div style={{ padding: '12px 14px', paddingBottom: 'env(safe-area-inset-bottom, 40px)' }}>
                  <CESBars rfBins={rfBins} rfSamples={report.rfSamples} sampleHues={report.sampleHues} theme={T} />
                  <div style={{ height: 40 }} />
                </div>

                {report.rawHeaders && Object.keys(report.rawHeaders).length > 0 && (
                  <div style={{ padding: '0 14px 40px' }}>
                    <RawDataPanel headers={report.rawHeaders} wls={report.wls} vals={report.vals} label={report.label} C={U} />
                  </div>
                )}
              </div>
            ) : (
              <>
                <div style={{ padding: '16px 22px 0' }}>
                  <MetricGrid report={report} C={U} />
                </div>
                <DraggableTopRow report={report} theme={T} />
                <DraggableChartsRow report={report} theme={T} />

                <div style={{ background: U.surface, border: `1px solid ${U.border}`, borderRadius: 6, padding: '12px 16px', margin: '14px 22px' }}>
                  <div style={{ ...sHead, color: U.dim, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    See it on a photo
                    <span onClick={() => window.HCRIPlayground && window.HCRIPlayground.open()} style={{ fontSize: 11, fontWeight: 400, color: U.accent, cursor: 'pointer' }}>
                      Playground →
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.6, color: U.dim, margin: '2px 0 10px' }}>
                    The left side of each swatch is the true (reference) colour; the right side is how this light renders it. Drag the divider to compare, or load your own photo. Photos are only used in your browser and are never uploaded.
                  </div>
                  <div
                    style={{ borderRadius: 6, overflow: 'hidden', border: `1px solid ${U.border}`, padding: 10 }}
                    ref={(el) => window.HCRIPhoto && window.HCRIPhoto.attach(el, () => ({
                      theme: U, rfBins: report.rfBins, Rf: report.Rf, Rg: report.Rg,
                      rcsBins: report.rcsBins, rhsBins: report.rhsBins, rlsBins: report.rlsBins,
                      cct: report.cct, duv: report.duv,
                    }))}
                  />
                </div>

                <div style={{ padding: '0 22px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: U.surface, border: `1px solid ${U.border}`, borderRadius: 6, padding: '10px 14px', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: 6, right: 6, zIndex: 6 }}>
                      <HelpTip text={"ANALYSIS\n\n\n\nA plain-language read of this light's white point, colour fidelity, saturation, deep reds and per-hue colour shifts, with suggested uses."} />
                    </span>
                    <div style={{ ...sHead, color: U.dim }}>Analysis</div>
                    <div
                      style={{ color: U.text }}
                      ref={(el) => window.HCRIAnalysis && window.HCRIAnalysis.attach(el, () => ({
                        mode: 'report', theme: themeName,
                        report: { id: report.id, label: report.label, cct: report.cct, duv: report.duv, ra: report.ra, r9: report.r9, Rf: report.Rf, Rg: report.Rg, rcsBins: report.rcsBins, rhsBins: report.rhsBins },
                      }))}
                    />
                  </div>
                  <div style={{ fontSize: 12, color: U.dim, textAlign: 'center', fontStyle: 'italic', opacity: 0.8 }}>
                    Colors are for visual orientation purposes only.
                  </div>
                </div>

                <div style={{ padding: '16px 22px 32px' }}>
                  <CESBars rfBins={rfBins} rfSamples={report.rfSamples} sampleHues={report.sampleHues} theme={T} />
                  <RawDataPanel headers={report.rawHeaders} wls={report.wls} vals={report.vals} label={report.label} C={U} />
                </div>
              </>
            )}
          </div>
        ) : tab === 'cie' ? (
          <div style={{ flex: isMobile ? 'none' : 1, overflow: isMobile ? 'visible' : 'auto', display: 'flex', flexDirection: 'column' }}>
            <ChromaticityPanel report={report} />
          </div>
        ) : (
          <div style={{ flex: isMobile ? 'none' : 1, overflow: isMobile ? 'visible' : 'hidden', display: 'flex', flexDirection: 'column' }} />
        )}
      </div>

      {shareCardOpen && <ShareCardModal report={report} onClose={() => setShareCardOpen(false)} />}
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
      {tm30Open && <AnnexEModal report={report} onClose={() => setTm30Open(false)} />}
    </>
  );
}

// Mirrors the original bundle's module-level `__helpOpen`: the help modal's
// open/closed state is kept outside React state so it survives whatever
// remounted ReportDetail across renders/navigations.
let __helpOpenShared = false;
