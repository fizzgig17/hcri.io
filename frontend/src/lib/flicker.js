// frontend/src/lib/flicker.js
//
// Shared helpers for flicker readings (from the hCRI Companion app).
// The risk bands are the same ones the app uses (IEEE 1789-style):
//   <= 8 Hz : high 0.2 %,      low 0.1 %
//   <= 90 Hz: high 0.025 * f,  low = high / 2.5
//   >  90 Hz: high 0.08  * f,  low 0.0333 * f
// "none" = below the low line (No Risk), "low" = between, "high" = above (High Risk).

import { SERIES_COLORS } from './compareExport';

/** The colour used for the i-th reading in comparisons. */
export const flickerColor = (i) => SERIES_COLORS[i % SERIES_COLORS.length];

export function riskLimits(freqHz) {
  if (freqHz <= 8) return { high: 0.2, low: 0.1 };
  if (freqHz <= 90) { const high = 0.025 * freqHz; return { high, low: high / 2.5 }; }
  return { high: 0.08 * freqHz, low: 0.0333 * freqHz };
}

export function flickerRisk(freqHz, percent) {
  if (freqHz == null || percent == null || !(freqHz > 0)) return null;
  const { high, low } = riskLimits(freqHz);
  return percent <= low ? 'none' : percent <= high ? 'low' : 'high';
}

export const RISK_LABEL = { none: 'No Risk', low: 'Low Risk', high: 'High Risk' };
export function riskColor(T, risk) {
  return risk === 'none' ? T.good : risk === 'low' ? T.warn : risk === 'high' ? T.bad : T.dim;
}

/** Is span_ms a believable time base for this reading? (Same sanity check the app uses.) */
export function spanUsable(r) {
  return !!(r && r.spanMs > 0 && r.cycleMs > 0 && r.spanMs >= r.cycleMs * 0.9 && r.spanMs <= r.cycleMs * 400);
}

export function fmtNum(v, digits = 1) {
  if (v == null || !isFinite(v)) return '—';
  const a = Math.abs(v);
  if (a >= 1000) return String(Math.round(v));
  if (a >= 100) return v.toFixed(Math.max(0, digits - 1));
  return v.toFixed(a < 1 ? Math.max(digits, 2) : digits);
}
export const fmtHz = (v) => (v == null ? '—' : fmtNum(v, 1) + ' Hz');
export const fmtPct = (v) => (v == null ? '—' : fmtNum(v, 1) + ' %');
export const fmtMs = (v) => (v == null ? '—' : fmtNum(v, 2) + ' ms');

/** Rough duty estimate from the waveform: the share of samples above the half-way level. */
export function dutyEstimate(wave) {
  if (!wave || wave.length < 2) return null;
  const mx = Math.max(...wave), mn = Math.min(...wave);
  if (!(mx > mn)) return null;
  const mid = (mx + mn) / 2;
  return (wave.filter((v) => v > mid).length / wave.length) * 100;
}

/**
 * Samples of one reading laid out for plotting: x in cycles (0..) when a time base exists,
 * y normalised to the reading's own peak (like the stock app).
 */
export function waveSeries(r) {
  const w = r.waveform || [];
  const mx = Math.max(...w, 1e-9);
  const usable = spanUsable(r);
  const dt = usable ? r.spanMs / w.length : null; // ms per sample
  return w.map((v, i) => ({
    i,
    ms: usable ? i * dt : null,
    cyc: usable ? (i * dt) / r.cycleMs : null,
    y: v / mx,
  }));
}

export function readingTitle(r) {
  return (r && r.label) || 'Untitled flicker';
}

export function fmtWhen(s) {
  if (!s) return '';
  const d = new Date(String(s).replace(' ', 'T') + 'Z');
  return isNaN(d) ? String(s) : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
