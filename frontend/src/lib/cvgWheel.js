// frontend/src/lib/cvgWheel.js
//
// Reconstructed from assets/app.js (minified __hcriIsDesktop/__cvgPts/
// __refVal, plus the __DS0/__DS1/__DS2 CIE daylight basis-function tables
// they depend on). Small helpers supporting the TM-30 color vector graphic
// (CVG) wheel chart's reference-locus overlay:
//
//  - isDesktop(): a plain matchMedia check (duplicates useIsMobile's intent
//    but as a one-shot boolean rather than a hook, for code that isn't a
//    component -- e.g. deciding chart sizing/label density at module or
//    render-calc time).
//  - cvgPoints(report): turns a report's cvgTest [x,y] pairs (or, if
//    absent, its rcsBins/rhsBins chroma/hue shift bins) into the 16 [x,y]
//    vector-endpoint coordinates the wheel plots, clamping radius to
//    [0.05, 1.45] so a wild outlier doesn't blow out the chart.
//  - referenceSpectrumValue(wavelength, cct): the reference illuminant's
//    relative spectral power at one wavelength for a given CCT -- a
//    Planckian blackbody below 4000K, CIE daylight (reconstructed from the
//    S0/S1/S2 basis functions) at/above 5000K, and a linear blend of the
//    two in between. Used to draw the reference curve under a test SPD.
export function __hcriIsDesktop() {
  try {
    if (typeof window === 'undefined') return false;
    return window.matchMedia ? window.matchMedia('(min-width: 769px)').matches : window.innerWidth > 768;
  } catch (e) {
    return false;
  }
}
export const isDesktop = __hcriIsDesktop;

export function __cvgPts(report) {
  const cvgTest = report && report.cvgTest;
  if (cvgTest && cvgTest.length === 16) {
    return cvgTest.map(p => {
      const r = Math.max(0.05, Math.min(1.45, Math.hypot(p[0], p[1])));
      const a = Math.atan2(p[1], p[0]);
      return [r * Math.cos(a), r * Math.sin(a)];
    });
  }
  const rcsBins = report && report.rcsBins;
  const rhsBins = report && report.rhsBins;
  if (rcsBins && rcsBins.length === 16) {
    return rcsBins.map((v, i) => {
      const r = Math.max(0.05, Math.min(1.45, 1 + (+v || 0)));
      const a = ((i * 22.5 + 11.25 + (rhsBins && rhsBins.length === 16 ? +rhsBins[i] || 0 : 0)) * Math.PI) / 180;
      return [r * Math.cos(a), r * Math.sin(a)];
    });
  }
  return null;
}
export const cvgPoints = __cvgPts;

// CIE daylight basis functions S1, S2 (S0 is implicit as the "mean" term),
// tabulated every 10nm from 300nm, used by __refVal to reconstruct a CIE
// daylight illuminant's relative SPD for any CCT without a big lookup table
// per color temperature.
const __DS0 = [
  0.04, 6.0, 29.6, 55.3, 57.3, 61.8, 61.5, 68.8, 63.4, 65.8, 94.8, 104.8,
  105.9, 96.8, 113.9, 125.6, 125.5, 121.3, 121.3, 113.5, 113.1, 110.8, 106.5,
  108.8, 105.3, 104.4, 100.0, 96.0, 95.1, 89.1, 90.5, 90.3, 88.4, 84.0, 85.1,
  81.9, 82.6, 84.9, 81.3, 71.9, 74.3, 76.4, 63.3, 71.7, 77.0, 65.2, 47.7,
  68.6, 65.0, 66.0, 61.0, 53.3, 58.9, 61.9,
];
const __DS1 = [
  0.02, 4.5, 22.4, 42.0, 40.6, 41.6, 38.0, 42.4, 38.5, 35.0, 43.4, 46.3, 43.9,
  37.1, 36.7, 35.9, 32.6, 27.9, 24.3, 20.1, 16.2, 13.2, 8.6, 6.1, 4.2, 1.9,
  0.0, -1.6, -3.5, -3.5, -5.8, -7.2, -8.6, -9.5, -10.9, -10.7, -12.0, -14.0,
  -13.6, -12.0, -13.3, -12.9, -10.6, -11.6, -12.2, -10.2, -7.8, -11.2, -10.4,
  -10.6, -9.7, -8.3, -9.3, -9.8,
];
const __DS2 = [
  0.0, 2.0, 4.0, 8.5, 7.8, 6.7, 5.3, 6.1, 2.0, 1.2, -1.1, -0.5, -0.7, -1.2,
  -2.6, -2.9, -2.8, -2.6, -2.6, -1.8, -1.5, -1.3, -1.2, -1.0, -0.5, -0.3, 0.0,
  0.2, 0.5, 2.1, 3.2, 4.1, 4.7, 5.1, 6.7, 7.3, 8.6, 9.8, 10.2, 8.3, 9.6, 8.5,
  7.0, 7.6, 8.0, 6.7, 5.2, 7.4, 6.8, 7.0, 6.4, 5.5, 6.1, 6.5,
];

export function __refVal(wavelengthNm, cctK) {
  const bb = w => 1 / ((w * 1e-9) ** 5 * (Math.exp((6626e-37 * 3e8) / (w * 1e-9 * 1381e-26 * cctK)) - 1));
  if (cctK <= 4000) return bb(wavelengthNm);

  const day = w => {
    const Td = Math.max(4000, Math.min(25000, cctK));
    const xD = Td <= 7000
      ? -4.607e9 / (Td * Td * Td) + 2.9678e6 / (Td * Td) + 0.09911e3 / Td + 0.244063
      : -2.0064e9 / (Td * Td * Td) + 1.9018e6 / (Td * Td) + 0.24748e3 / Td + 0.23704;
    const yD = -3 * xD * xD + 2.87 * xD - 0.275;
    const M = 0.0241 + 0.2562 * xD - 0.7341 * yD;
    const M1 = (-1.3515 - 1.7703 * xD + 5.9114 * yD) / M;
    const M2 = (0.03 - 31.4424 * xD + 30.0717 * yD) / M;
    const idx = (w - 300) / 10;
    let i = Math.floor(idx);
    let fr = idx - i;
    if (i < 0) { i = 0; fr = 0; }
    if (i >= __DS0.length - 1) { i = __DS0.length - 2; fr = 1; }
    return (
      __DS0[i] + fr * (__DS0[i + 1] - __DS0[i]) +
      M1 * (__DS1[i] + fr * (__DS1[i + 1] - __DS1[i])) +
      M2 * (__DS2[i] + fr * (__DS2[i + 1] - __DS2[i]))
    );
  };
  if (cctK >= 5000) return day(wavelengthNm);

  // 4000-5000K: linear blend of blackbody and daylight, each normalized to
  // its own value at 560nm.
  const wt = (cctK - 4000) / 1000;
  const b5 = bb(560), d5 = day(560);
  return (1 - wt) * (b5 > 0 ? bb(wavelengthNm) / b5 : 0) + wt * (d5 > 0 ? day(wavelengthNm) / d5 : 0);
}
export const referenceSpectrumValue = __refVal;
