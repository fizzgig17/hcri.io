// frontend/src/components/FlickerCharts.jsx
//
// Charts + table for flicker readings:
//   FlickerWaveChart  one reading's waveform, drawn on the stock meter app's scale
//   FlickerOverlay    several readings overlaid (per cycle, or on a shared time axis)
//   FlickerRiskChart  frequency vs flicker %, over the IEEE-1789-style risk bands
//   FlickerTable      the numbers side by side
// All are plain inline SVG/HTML so they follow the site theme.

import { useMemo, useState } from 'react';
import {
  riskLimits, flickerRisk, RISK_LABEL, riskColor, spanUsable, waveSeries,
  fmtNum, fmtHz, fmtPct, fmtMs, dutyEstimate, readingTitle, flickerColor,
} from '../lib/flicker';

function niceTicks(lo, hi, n = 5) {
  const span = hi - lo || 1;
  const raw = span / n;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || raw;
  const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-6; v += step) out.push(+v.toFixed(10));
  return out;
}
const tickLabel = (v) => (Math.abs(v) >= 1000 ? String(Math.round(v)) : String(+v.toFixed(2)));

const W = 720;

function Frame({ T, H, children, label, xLabel, yLabel }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}
      style={{ width: '100%', maxWidth: 820, height: 'auto', display: 'block', background: T.chartBg, borderRadius: 6, border: `1px solid ${T.border}` }}>
      {children}
      {xLabel && <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="11" fill={T.axisLabel} fontFamily="monospace">{xLabel}</text>}
      {yLabel && <text transform={`translate(11 ${H / 2}) rotate(-90)`} textAnchor="middle" fontSize="11" fill={T.axisLabel} fontFamily="monospace">{yLabel}</text>}
    </svg>
  );
}

/** One reading's waveform, on the stock scale: y = sample / max, from (min/max)*0.8 up to 1.2. */
export function FlickerWaveChart({ r, T, color }) {
  const H = 270, L = 50, R = 14, Tp = 14, B = 38;
  const s = useMemo(() => waveSeries(r), [r]);
  if (!s.length) return <div style={{ color: T.dim, fontSize: 13 }}>No waveform stored for this reading.</div>;
  const usable = spanUsable(r);
  const ys = s.map((p) => p.y);
  const lo = Math.min(...ys) * 0.8, hi = 1.2;
  const xMax = usable ? r.spanMs : s.length - 1;
  const px = (p) => L + ((usable ? p.ms : p.i) / xMax) * (W - L - R);
  const py = (y) => Tp + (1 - (y - lo) / (hi - lo)) * (H - Tp - B);
  const d = s.map((p, i) => `${i ? 'L' : 'M'}${px(p).toFixed(1)} ${py(p.y).toFixed(1)}`).join('');
  const yT = niceTicks(lo, hi, 5);
  const xT = niceTicks(0, xMax, 6);
  const mean = ys.reduce((a, b) => a + b, 0) / ys.length;
  const cycles = usable ? r.spanMs / r.cycleMs : 0;
  return (
    <Frame T={T} H={H} label={`Flicker waveform for ${readingTitle(r)}`} xLabel={usable ? 'Time (ms)' : 'Sample'} yLabel="Relative level">
      {yT.map((v) => (
        <g key={'y' + v}>
          <line x1={L} x2={W - R} y1={py(v)} y2={py(v)} stroke={T.gridLine} />
          <text x={L - 6} y={py(v) + 4} textAnchor="end" fontSize="10" fill={T.axisLabel} fontFamily="monospace">{tickLabel(v)}</text>
        </g>
      ))}
      {xT.map((v) => (
        <g key={'x' + v}>
          <line x1={L + (v / xMax) * (W - L - R)} x2={L + (v / xMax) * (W - L - R)} y1={Tp} y2={H - B} stroke={T.gridLine} />
          <text x={L + (v / xMax) * (W - L - R)} y={H - B + 14} textAnchor="middle" fontSize="10" fill={T.axisLabel} fontFamily="monospace">{tickLabel(v)}</text>
        </g>
      ))}
      {cycles >= 1 && cycles <= 40 && Array.from({ length: Math.floor(cycles) }, (_, k) => (
        <line key={'c' + k} x1={L + (((k + 1) * r.cycleMs) / xMax) * (W - L - R)} x2={L + (((k + 1) * r.cycleMs) / xMax) * (W - L - R)}
          y1={Tp} y2={H - B} stroke={T.axisBorder} strokeDasharray="2 4" />
      ))}
      <line x1={L} x2={W - R} y1={py(mean)} y2={py(mean)} stroke={T.dim} strokeDasharray="5 4" opacity="0.6" />
      <rect x={L} y={Tp} width={W - L - R} height={H - Tp - B} fill="none" stroke={T.axisBorder} />
      <path d={d} fill="none" stroke={color || T.accent} strokeWidth="1.8" strokeLinejoin="round" />
    </Frame>
  );
}

/**
 * Several readings overlaid. mode 'cycle': each one starts at its own rising mean-crossing and shows two cycles,
 * so shapes and depths can be compared whatever the frequency. mode 'time': a shared millisecond axis
 * (as long as the shortest recording). Levels are each reading's own peak = 1.
 */
export function FlickerOverlay({ readings, T, mode = 'cycle', colors }) {
  const H = 300, L = 50, R = 14, Tp = 14, B = 38;
  const usable = readings.filter(spanUsable);
  const traces = useMemo(() => {
    return readings.map((r, idx) => {
      if (!spanUsable(r)) return null;
      const s = waveSeries(r);
      const mean = s.reduce((a, p) => a + p.y, 0) / s.length;
      let k0 = 0;
      for (let i = 1; i < s.length; i++) if (s[i - 1].y < mean && s[i].y >= mean) { k0 = i; break; }
      const t0 = s[k0].ms;
      return { idx, r, pts: s.slice(k0).map((p) => ({ x: mode === 'cycle' ? (p.ms - t0) / r.cycleMs : p.ms - t0, y: p.y })) };
    });
  }, [readings, mode]);
  if (!usable.length) return <div style={{ color: T.dim, fontSize: 13 }}>These readings have no usable time base, so they can't be overlaid.</div>;
  const xMax = mode === 'cycle' ? 2 : Math.max(0.01, Math.min(...usable.map((r) => r.spanMs)));
  const px = (x) => L + (x / xMax) * (W - L - R);
  const py = (y) => Tp + (1 - y / 1.05) * (H - Tp - B);
  const xT = mode === 'cycle' ? [0, 0.5, 1, 1.5, 2] : niceTicks(0, xMax, 6);
  return (
    <Frame T={T} H={H} label="Flicker waveforms overlaid" xLabel={mode === 'cycle' ? 'Cycles' : 'Time (ms)'} yLabel="Level (each reading's peak = 1)">
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <g key={'y' + v}>
          <line x1={L} x2={W - R} y1={py(v)} y2={py(v)} stroke={T.gridLine} />
          <text x={L - 6} y={py(v) + 4} textAnchor="end" fontSize="10" fill={T.axisLabel} fontFamily="monospace">{v}</text>
        </g>
      ))}
      {xT.map((v) => (
        <g key={'x' + v}>
          <line x1={px(v)} x2={px(v)} y1={Tp} y2={H - B} stroke={T.gridLine} />
          <text x={px(v)} y={H - B + 14} textAnchor="middle" fontSize="10" fill={T.axisLabel} fontFamily="monospace">{tickLabel(v)}</text>
        </g>
      ))}
      <rect x={L} y={Tp} width={W - L - R} height={H - Tp - B} fill="none" stroke={T.axisBorder} />
      {traces.filter(Boolean).map((t) => {
        const d = t.pts.filter((p) => p.x <= xMax).map((p, i) => `${i ? 'L' : 'M'}${px(p.x).toFixed(1)} ${py(p.y).toFixed(1)}`).join('');
        return <path key={t.idx} d={d} fill="none" stroke={(colors || flickerColor)(t.idx)} strokeWidth="1.7" strokeLinejoin="round" opacity="0.92" />;
      })}
    </Frame>
  );
}

/** Frequency vs flicker %, log-log, over the No / Low / High risk bands. points: [{freq, pct, color, n, label}] */
export function FlickerRiskChart({ points, T }) {
  const H = 300, L = 54, R = 14, Tp = 14, B = 38;
  const fMin = 1, fMax = 10000, pMin = 0.01, pMax = 100;
  const lx = (f) => L + ((Math.log10(Math.min(fMax, Math.max(fMin, f))) - Math.log10(fMin)) / (Math.log10(fMax) - Math.log10(fMin))) * (W - L - R);
  const ly = (p) => Tp + (1 - (Math.log10(Math.min(pMax, Math.max(pMin, p))) - Math.log10(pMin)) / (Math.log10(pMax) - Math.log10(pMin))) * (H - Tp - B);
  const fs = Array.from({ length: 161 }, (_, i) => Math.pow(10, Math.log10(fMin) + (i / 160) * (Math.log10(fMax) - Math.log10(fMin))));
  const lowLine = fs.map((f) => [lx(f), ly(riskLimits(f).low)]);
  const highLine = fs.map((f) => [lx(f), ly(riskLimits(f).high)]);
  const poly = (a) => a.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
  const bottom = H - B, top = Tp, left = L, right = W - R;
  const green = `${poly(lowLine)}L${right} ${bottom}L${left} ${bottom}Z`;
  const amber = `${poly(highLine)}${[...lowLine].reverse().map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('')}Z`;
  const red = `${poly(highLine)}L${right} ${top}L${left} ${top}Z`;
  const decadesX = [1, 10, 100, 1000, 10000];
  const decadesY = [0.01, 0.1, 1, 10, 100];
  return (
    <Frame T={T} H={H} label="Flicker risk chart" xLabel="Frequency (Hz)" yLabel="Flicker (%)">
      <path d={red} fill={T.bad} opacity="0.16" />
      <path d={amber} fill={T.warn} opacity="0.18" />
      <path d={green} fill={T.good} opacity="0.16" />
      {decadesX.map((v) => (
        <g key={'x' + v}>
          <line x1={lx(v)} x2={lx(v)} y1={top} y2={bottom} stroke={T.gridLine} />
          <text x={lx(v)} y={bottom + 14} textAnchor="middle" fontSize="10" fill={T.axisLabel} fontFamily="monospace">{v}</text>
        </g>
      ))}
      {decadesY.map((v) => (
        <g key={'y' + v}>
          <line x1={left} x2={right} y1={ly(v)} y2={ly(v)} stroke={T.gridLine} />
          <text x={left - 6} y={ly(v) + 4} textAnchor="end" fontSize="10" fill={T.axisLabel} fontFamily="monospace">{v}</text>
        </g>
      ))}
      <path d={poly(lowLine)} fill="none" stroke={T.good} strokeWidth="1.2" />
      <path d={poly(highLine)} fill="none" stroke={T.bad} strokeWidth="1.2" />
      <rect x={left} y={top} width={right - left} height={bottom - top} fill="none" stroke={T.axisBorder} />
      <text x={right - 6} y={bottom - 6} textAnchor="end" fontSize="10" fill={T.good} fontFamily="monospace">No risk</text>
      <text x={right - 6} y={top + 14} textAnchor="end" fontSize="10" fill={T.bad} fontFamily="monospace">High risk</text>
      {points.filter((p) => p.freq > 0 && p.pct != null).map((p, i) => (
        <g key={i}>
          <circle cx={lx(p.freq)} cy={ly(Math.max(p.pct, pMin))} r="8" fill={p.color} stroke={T.bg} strokeWidth="1.5" />
          {p.n != null && <text x={lx(p.freq)} y={ly(Math.max(p.pct, pMin)) + 3.5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="monospace">{p.n}</text>}
          <title>{`${p.label || ''} ${fmtHz(p.freq)}, ${fmtPct(p.pct)}`}</title>
        </g>
      ))}
    </Frame>
  );
}

export function RiskBadge({ r, T, small }) {
  const risk = flickerRisk(r.frequencyHz, r.percentFlicker);
  if (!risk) return null;
  const c = riskColor(T, risk);
  return (
    <span style={{ display: 'inline-block', padding: small ? '1px 7px' : '3px 10px', borderRadius: 999, fontSize: small ? 11 : 12, fontWeight: 700,
      color: c, border: `1.5px solid ${c}`, background: `${c}22`, whiteSpace: 'nowrap' }}>
      {RISK_LABEL[risk]}
    </span>
  );
}

/** Side-by-side numbers. onOpen(reading) makes the title a link; extra(r) renders a trailing cell. */
export function FlickerTable({ readings, T, onOpen, colors, withWave = true }) {
  const th = { textAlign: 'right', padding: '6px 8px', color: T.dim, fontWeight: 600, fontSize: 11, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap' };
  const td = { textAlign: 'right', padding: '7px 8px', fontSize: 12.5, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap', color: T.text };
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: 'left' }}>#</th>
            <th style={{ ...th, textAlign: 'left' }}>Reading</th>
            <th style={th}>Frequency</th>
            <th style={th}>Flicker</th>
            <th style={th}>Index</th>
            <th style={th}>Cycle</th>
            {withWave && <th style={th}>Duty ≈</th>}
            <th style={{ ...th, textAlign: 'left' }}>Risk</th>
          </tr>
        </thead>
        <tbody>
          {readings.map((r, i) => (
            <tr key={r.id}>
              <td style={{ ...td, textAlign: 'left' }}>
                <span style={{ display: 'inline-block', width: 18, height: 18, lineHeight: '18px', borderRadius: 9, textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: '#fff', background: (colors || flickerColor)(i) }}>{i + 1}</span>
              </td>
              <td style={{ ...td, textAlign: 'left', whiteSpace: 'normal', minWidth: 140 }}>
                {onOpen
                  ? <a href="#open" onClick={(e) => { e.preventDefault(); onOpen(r); }} style={{ color: T.accent, textDecoration: 'none', fontWeight: 700 }}>{readingTitle(r)}</a>
                  : <span style={{ fontWeight: 700 }}>{readingTitle(r)}</span>}
              </td>
              <td style={td}>{fmtHz(r.frequencyHz)}</td>
              <td style={td}>{fmtPct(r.percentFlicker)}</td>
              <td style={td}>{r.flickerIndex == null ? '—' : fmtNum(r.flickerIndex, 3)}</td>
              <td style={td}>{fmtMs(r.cycleMs)}</td>
              {withWave && <td style={td}>{r.waveform ? (dutyEstimate(r.waveform) == null ? '—' : Math.round(dutyEstimate(r.waveform)) + ' %') : '—'}</td>}
              <td style={{ ...td, textAlign: 'left' }}><RiskBadge r={r} T={T} small /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Overlay + risk chart + table for a set of readings (used by the report section and the Flicker tab's Compare). */
export function FlickerComparison({ readings, T, onOpen }) {
  const [mode, setMode] = useState('cycle');
  const pill = (id, label) => (
    <button key={id} onClick={() => setMode(id)} style={{ background: mode === id ? `${T.accent}30` : 'none', border: `1px solid ${mode === id ? T.accent : T.border}`,
      color: mode === id ? T.accent : T.dim, borderRadius: 999, padding: '3px 12px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer' }}>{label}</button>
  );
  const pts = readings.map((r, i) => ({ freq: r.frequencyHz, pct: r.percentFlicker, color: flickerColor(i), n: i + 1, label: readingTitle(r) }));
  const unusable = readings.filter((r) => !spanUsable(r)).length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FlickerTable readings={readings} T={T} onOpen={onOpen} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))', gap: 20, alignItems: 'start' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: T.dim, fontFamily: 'monospace', fontWeight: 700 }}>WAVEFORMS</span>
          {pill('cycle', 'Per cycle')}{pill('time', 'Time (ms)')}
        </div>
        <FlickerOverlay readings={readings} T={T} mode={mode} />
        {unusable > 0 && <div style={{ fontSize: 11.5, color: T.dim, marginTop: 6 }}>{unusable} reading{unusable > 1 ? 's' : ''} without a usable time base {unusable > 1 ? 'are' : 'is'} left out of the overlay.</div>}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', minHeight: 26, marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: T.dim, fontFamily: 'monospace', fontWeight: 700 }}>RISK</span>
        </div>
        <FlickerRiskChart points={pts} T={T} />
        <div style={{ fontSize: 11.5, color: T.dim, marginTop: 6 }}>Bands follow IEEE 1789-style limits. Indicative only: these readings aren't from a certified flicker meter.</div>
      </div>
      </div>
    </div>
  );
}
