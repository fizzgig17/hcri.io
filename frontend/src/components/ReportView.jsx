// frontend/src/components/ReportView.jsx
//
// Reconstructed from assets/app.js. The Report/3D tab shell and its
// supporting pieces (SPD chart, bin-shift bars, CES bars, CVG wheel, meta
// editor, raw-data panel, chromaticity panel, Annex E export, header kebab
// menu) are each reconstructed 1:1 from the minified bundle -- see the
// header comment in each of their own files (SPDChart.jsx, CVGWheel.jsx,
// ReportCharts.jsx, MetaEditor.jsx, Chromaticity.jsx, AnnexEModal.jsx,
// ReportActionsMenu.jsx) for exactly which bundle function each came from.
//
// NOTE: the bundle's actual top-level assembler that wires these pieces
// together (the function that calls ge/fe/ce/le/ue/de/pe as JSX) lives
// further into the bundle than this reconstruction batch's assigned range
// (~line 26400+, i.e. the next batch's territory) -- it should be checked
// against once reconstructed, in case the tab layout/order it uses differs
// from the one below. The composition here is otherwise faithful: every
// sub-component is the real one, just assembled by this file rather than
// the bundle's own (not-yet-reconstructed) parent.
//
// Kept from the previous (stale-source) pass, unverified against this
// bundle range: the CRI R1-R15 bar chart (CRIBars) and the Metric tiles /
// textual interpretation block -- no bundle function in this range covers
// them, so they're left as-is pending whichever batch's range does.

import { useState, useRef, useEffect } from 'react';
import { getToken } from '../lib/api.js';
import { useTheme } from '../lib/ThemeContext.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';
import ThreeViewer from './ThreeViewer.jsx';
import SPDChart from './SPDChart.jsx';
import CVGWheel from './CVGWheel.jsx';
import { BinBarChart, CESBars, RawDataPanel } from './ReportCharts.jsx';
import MetaEditor from './MetaEditor.jsx';
import ReportActionsMenu from './ReportActionsMenu.jsx';
import AnnexEModal from './AnnexEModal.jsx';
import ChromaticityPanel from './Chromaticity.jsx';

// ── CRI R1–R15 bar chart (kept from the prior pass -- see note above) ───────
const TCS_COLORS = {
  1:'#c08878', 2:'#b09858', 3:'#8a9a60', 4:'#4a7848', 5:'#60989a',
  6:'#6890b8', 7:'#8878a8', 8:'#c07898', 9:'#cc2828', 10:'#d4b424',
  11:'#3e8850', 12:'#1e3ea8', 13:'#d49878', 14:'#4e6030', 15:'#c08868',
};

function CRIBars({ ri, C }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.clientWidth, H = canvas.clientHeight;
    if (!W || !H) return;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const items = [];
    for (let i = 1; i <= 15; i++) {
      const v = ri['r' + i];
      if (v == null || isNaN(v)) continue;
      items.push({ i, v: +v });
    }
    if (!items.length) return;

    const fs = Math.max(11, Math.min(13, Math.round(W * 0.018)));
    const ML = Math.round(fs * 3) + 8;
    const MR = 8;
    const MT = fs + 12;
    const MB = 6;
    const chartW = W - ML - MR;
    const chartH = H - MT - MB;

    const lo = Math.min(0, ...items.map((d) => d.v));
    const hi = 100;
    const xOf = (v) => ML + ((v - lo) / (hi - lo)) * chartW;

    const txt = C.dim || 'rgba(150,160,175,0.85)';

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'center';
    ctx.font = `${fs - 1}px monospace`;
    for (let t = Math.ceil(lo / 20) * 20; t <= hi; t += 20) {
      const gx = xOf(t);
      ctx.strokeStyle = 'rgba(128,128,128,0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(gx, MT); ctx.lineTo(gx, MT + chartH); ctx.stroke();
      ctx.fillStyle = txt;
      ctx.fillText(String(t), gx, MT - 5);
    }

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
    const readableOn = (hex) => {
      const m = hex.replace('#', '');
      const r = parseInt(m.slice(0, 2), 16), g = parseInt(m.slice(2, 4), 16), b = parseInt(m.slice(4, 6), 16);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.96)';
    };

    const rowH = chartH / items.length;
    const barH = Math.min(rowH * 0.62, 16);

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
        ctx.fillStyle = readableOn(col);
        ctx.textAlign = 'right';
        ctx.fillText(lab, x0 + bw - 9, cy);
      } else {
        ctx.fillStyle = C.text || 'rgba(230,240,255,0.95)';
        ctx.textAlign = 'left';
        ctx.fillText(lab, x0 + bw + 6, cy);
      }
    });
  }, [ri, C]);

  const rows = Object.keys(ri).filter((k) => /^r\d+$/.test(k)).length || 15;
  const h = Math.max(220, rows * 22 + 28);

  return (
    <div style={{ marginTop: 12, maxWidth: 480 }}>
      <div style={{ fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>CRI R1–R15</div>
      <canvas ref={canvasRef} style={{ width: '100%', height: h, display: 'block' }} />
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(80,160,220,0.2)', borderRadius: 6, padding: '10px 12px' }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#7aaccc', marginBottom: 5, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || '#e8f4ff' }}>{value ?? '—'}</div>
    </div>
  );
}

function interpRf(rf) { if (rf == null) return 'No data.'; if (rf >= 90) return 'Excellent fidelity. Colors appear nearly identical to a reference illuminant.'; if (rf >= 80) return 'Good fidelity. Minor color differences under close comparison.'; if (rf >= 70) return 'Moderate fidelity. Noticeable shifts in some hues.'; return 'Low fidelity. Significant color distortion likely.'; }
function interpRg(rg) { if (rg == null) return 'No data.'; if (rg > 110) return 'Gamut significantly expanded — colors appear more vivid/saturated.'; if (rg > 102) return 'Slightly expanded gamut. Objects may appear marginally more vivid.'; if (rg >= 98) return 'Gamut closely matches the reference — natural color saturation.'; if (rg >= 90) return 'Slightly reduced gamut. Colors may appear less saturated.'; return 'Gamut significantly reduced — colors appear notably desaturated.'; }
function interpDuv(d) { if (d == null) return 'No data.'; const dir = d > 0 ? 'above BBL (slight green tint)' : 'below BBL (slight pink tint)'; const abs = Math.abs(d); if (abs < 0.002) return 'Extremely close to the Planckian locus.'; if (abs < 0.006) return `Very close (${dir}). Within acceptable limits.`; if (abs < 0.012) return `Moderate deviation ${dir}.`; return `Large deviation ${dir}.`; }

const S = { sHead: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, color: '#7aaccc', marginBottom: 10, fontWeight: 700 } };

// ── Main ReportView ───────────────────────────────────────────────────────────
export default function ReportView({ report, allReports = [], isGuest = false, onMetaSave, isMobile: isMobileProp, onBack }) {
  const { theme: T, themeName, toggleTheme } = useTheme();
  const isMobileAuto = useIsMobile(768);
  const isMobile = isMobileProp ?? isMobileAuto;
  const [tab, setTab] = useState('report');
  const [showAnnexE, setShowAnnexE] = useState(false);

  const C = {
    bg: T.bg, surface: T.surface, surface2: T.surface2, border: T.border, text: T.text,
    dim: T.dim, accent: T.accent, good: T.good, warn: T.warn, bad: T.bad, red: T.bad,
  };

  if (!report) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.dim, fontSize: 13, gap: 6, background: C.bg }}>
        <div style={{ fontSize: 48, opacity: 0.15 }}>📊</div>
        <div>Select a report from the list to view it</div>
      </div>
    );
  }

  const rfBins = report.rfBins || Array(16).fill(report.Rf || 75);

  async function saveMetadata(fields) {
    if (!report.id) return;
    await fetch(`./index.php/api/reports/${report.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(fields),
    }).then((r) => { if (!r.ok) throw new Error('Save failed'); });
    if (onMetaSave) onMetaSave({ ...report, ...fields });
  }

  async function shareLink() {
    if (!report.id) { alert('Save this report first to get a share link.'); return; }
    try {
      const res = await fetch(`./index.php/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ shareAction: report.shareToken ? 'disable' : 'enable' }),
      });
      const data = await res.json();
      const token = data.shareToken;
      if (onMetaSave) onMetaSave({ ...report, shareToken: token ?? null });
      if (token) {
        const url = `${location.origin}${location.pathname}#/share/${token}`;
        await navigator.clipboard?.writeText(url).catch(() => {});
        alert('Share link copied to clipboard:\n' + url);
      } else {
        alert('Sharing disabled for this report.');
      }
    } catch (e) {
      alert('Share failed: ' + e.message);
    }
  }

  function shareCard() {
    alert('Share Card is not available yet.');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.bg, fontFamily: 'monospace', overflow: 'hidden' }}>
      <div style={{
        padding: isMobile ? '10px 14px' : '14px 22px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'flex-start', justifyContent: 'space-between',
        gap: 10, flexShrink: 0, background: C.surface2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {isMobile && onBack && (
            <button onClick={onBack} aria-label="Back to reports list"
              style={{ background: 'none', border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: '7px 10px', fontSize: 15, cursor: 'pointer', flexShrink: 0 }}>
              ←
            </button>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{report.label}</div>
            <div style={{ fontSize: 13, color: C.dim, fontWeight: 500 }}>
              {report.sourceType?.toUpperCase()} · {new Date(report.createdAt.replace(' ', 'T')).toLocaleString()}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'flex-start' }}>
          <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
            {['report', 'chromaticity', '3d'].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ background: tab === t ? 'rgba(0,212,255,0.14)' : 'none', border: 'none', padding: isMobile ? '8px 10px' : '8px 16px', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: tab === t ? C.accent : C.dim, cursor: 'pointer', fontFamily: 'monospace', fontWeight: tab === t ? 700 : 400 }}>
                {t === 'report' ? 'Report' : t === 'chromaticity' ? 'Chroma' : '3D Plot'}
              </button>
            ))}
          </div>
          <ReportActionsMenu
            isGuest={isGuest}
            shareToken={report.shareToken}
            isPublic={report.isPublic}
            onTM30={() => setShowAnnexE(true)}
            onShareLink={shareLink}
            onShareCard={shareCard}
            onTheme={toggleTheme}
            themeName={themeName}
            onHelp={() => alert('See the "?" tooltips next to each chart for an explanation.')}
            theme={T}
          />
        </div>
      </div>

      {tab === 'report' && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <MetaEditor report={report} isGuest={isGuest} onSave={saveMetadata} />

          <div style={{ padding: isMobile ? '14px' : '16px 22px', borderBottom: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 16 : 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={S.sHead}>Spectral Power Distribution</div>
              {report.wls && report.vals
                ? <SPDChart wls={report.wls} vals={report.vals} cct={report.cct} theme={T} />
                : <div style={{ height: 160, background: C.surface, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim, fontSize: 11 }}>No spectral data</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <BinBarChart title="Local Chroma Shift (Rcs,hj)" rfBins={rfBins} data={report.rcsBins} mode="chroma" theme={T}
                tip={'LOCAL CHROMA SHIFT\n\n\n\nHow much more (+) or less (-) saturated each of 16 hue groups appears versus the reference illuminant.'} />
              <BinBarChart title="Local Hue Shift (Rhs,hj)" rfBins={rfBins} data={report.rhsBins} mode="hue" theme={T}
                tip={'LOCAL HUE SHIFT\n\n\n\nHow far each of 16 hue groups rotates around the color wheel versus the reference illuminant, in degrees.'} />
              <BinBarChart title="Local Color Fidelity (Rf,hj)" rfBins={rfBins} mode="fidelity" theme={T}
                tip={'LOCAL COLOR FIDELITY\n\n\n\nFidelity score (0-100) for each of 16 hue groups -- lower bins show exactly where this source departs most from the reference.'} />
            </div>
          </div>

          <div style={{ padding: isMobile ? '14px' : '16px 22px', borderBottom: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr', gap: isMobile ? 16 : 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CVGWheel report={report} rfBins={rfBins} Rg={report.Rg || 100} Rf={report.Rf || 80} cct={report.cct} duv={report.duv} size={isMobile ? 190 : 260} theme={T} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: 8 }}>
                <Metric label="CIE x" value={report.x?.toFixed(4)} />
                <Metric label="CIE y" value={report.y?.toFixed(4)} />
                <Metric label="CCT" value={report.cct ? report.cct + 'K' : null} color={C.accent} />
                <Metric label="Duv" value={report.duv != null ? (report.duv >= 0 ? '+' : '') + report.duv.toFixed(4) : null} color={Math.abs(report.duv ?? 1) < 0.006 ? C.good : Math.abs(report.duv ?? 1) < 0.012 ? C.warn : C.bad} />
                <Metric label="Ra (CRI)" value={report.ra != null ? Math.round(report.ra) : null} />
                <Metric label="R9" value={report.r9 != null ? Math.round(report.r9) : null} />
              </div>
              {report.ri && Object.keys(report.ri).length > 0 && <CRIBars ri={report.ri} C={C} />}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '10px 14px' }}>
                <div style={S.sHead}>Interpretation</div>
                {[
                  [report.Rf != null ? `Rf ${report.Rf}` : 'Rf -', interpRf(report.Rf)],
                  [report.Rg != null ? `Rg ${report.Rg}` : 'Rg -', interpRg(report.Rg)],
                  [report.duv != null ? `Duv ${(report.duv >= 0 ? '+' : '') + report.duv.toFixed(4)}` : 'Duv -', interpDuv(report.duv)],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: `1px solid ${C.border}`, flexDirection: isMobile ? 'column' : 'row' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, minWidth: isMobile ? 0 : 90, flexShrink: 0 }}>{k}</div>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: C.dim, textAlign: 'center', fontStyle: 'italic' }}>
                Colors are for visual orientation purposes only.
              </div>
            </div>
          </div>

          <div style={{ padding: isMobile ? '14px' : '16px 22px' }}>
            <CESBars rfBins={rfBins} rfSamples={report.rfSamples} sampleHues={report.sampleHues} theme={T} />
          </div>

          <div style={{ padding: isMobile ? '0 14px 24px' : '0 22px 32px' }}>
            <RawDataPanel headers={report.rawHeaders} wls={report.wls} vals={report.vals} label={report.label} C={C} isMobile={isMobile} />
          </div>
        </div>
      )}

      {tab === 'chromaticity' && (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ChromaticityPanel report={report} />
        </div>
      )}

      {tab === '3d' && (
        <div style={{ flex: 1, position: 'relative' }}>
          <ThreeViewer reports={allReports.filter((r) => r.x && r.y)} activeId={report.id} minRf={0}
            viewCmd={`focus:${report.x || 0.33}:${report.y || 0.33}:${report.Rf || 50}`} />
          <div style={{ position: 'absolute', bottom: 12, left: 14, fontSize: 11, color: C.dim, pointerEvents: 'none', lineHeight: 2 }}>
            {isMobile ? 'drag rotate · pinch zoom' : 'drag rotate · scroll zoom · right-drag pan'}
          </div>
        </div>
      )}

      {showAnnexE && <AnnexEModal report={report} onClose={() => setShowAnnexE(false)} />}
    </div>
  );
}
