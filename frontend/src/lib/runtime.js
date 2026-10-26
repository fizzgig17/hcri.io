// frontend/src/lib/runtime.js
//
// Helpers for output-over-time ("runtime") curves: a light's output sampled at a fixed interval.

export const MARKS = [1, 5, 10, 30];

/** Value at a given minute, or null if the curve is shorter than that. */
export function valueAt(c, min) {
  const v = c.values || [];
  if (!v.length || !c.intervalSeconds) return null;
  const i = Math.round((min * 60) / c.intervalSeconds);
  return i < v.length ? v[i] : null;
}

export const durationMin = (c) => (((c.values || []).length - 1) * c.intervalSeconds) / 60;

export function stats(c) {
  const v = (c.values || []).filter((x) => Number.isFinite(x));
  if (!v.length) return null;
  const start = v[0];
  const pct = (x) => (x == null || !start ? null : (x / start) * 100);
  const at = {};
  MARKS.forEach((m) => { const x = valueAt(c, m); at[m] = { v: x, pct: pct(x) }; });
  const end = v[v.length - 1];
  return { start, end, endPct: pct(end), peak: Math.max(...v), min: Math.min(...v), at, durationMin: durationMin(c) };
}

/** Minutes until output first falls below `frac` of the starting value (null if it never does). */
export function timeToFraction(c, frac) {
  const v = c.values || [];
  if (!v.length || !v[0]) return null;
  for (let i = 1; i < v.length; i++) if (v[i] < v[0] * frac) return (i * c.intervalSeconds) / 60;
  return null;
}

export const fmtVal = (x) => (x == null ? '–' : Math.abs(x) >= 100 ? String(Math.round(x)) : String(+x.toFixed(1)));
export const fmtPctV = (x) => (x == null ? '–' : `${Math.round(x)}%`);
export const fmtMin = (m) => (m == null ? '–' : m >= 10 ? `${Math.round(m)} min` : `${+m.toFixed(1)} min`);
