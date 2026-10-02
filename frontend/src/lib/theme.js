// frontend/src/lib/theme.js
//
// Reconstructed from assets/app.js (minified var x/S). The light theme's
// colors differ from the stale version this replaces -- that's not a typo,
// it's what's actually live.

export const themes = {
  dark: {
    name: 'dark',
    bg:       '#060a0f',
    surface:  '#0a1628',
    surface2: '#0b1929',
    surface3: '#0d1e32',
    border:   'rgba(80,160,220,0.25)',
    text:     '#e8f4ff',
    dim:      '#7aaccc',
    accent:   '#00d4ff',
    good:     '#3dff9a',
    warn:     '#ffcc33',
    bad:      '#ff4466',
    white:    '#ffffff',
    gridLine:    'rgba(255,255,255,0.07)',
    axisBorder:  'rgba(80,140,180,0.4)',
    axisLabel:   'rgba(160,200,230,0.9)',
    chartBg:     'rgba(0,0,0,0.2)',
    cvgInner:    'rgba(240,244,250,1)',
    cvgSectorMix: 0.4,
    cvgText:     'rgba(20,20,20,0.9)',
    cvgSubText:  'rgba(30,30,30,0.55)',
    spdCurve:    'rgba(220,40,40,0.9)',
    spdRef:      'rgba(180,180,180,0.5)',
    spdRefText:  '#e8f4ff',
    spdDimText:  '#7aaccc',
  },
  light: {
    name: 'light',
    bg:       '#eef2f7',
    surface:  '#ffffff',
    surface2: '#dce6f0',
    surface3: '#ccd8e8',
    border:   'rgba(40,90,160,0.25)',
    text:     '#0d1f30',
    dim:      '#2a5070',
    accent:   '#005baa',
    good:     '#0a6e2e',
    warn:     '#8a5a00',
    bad:      '#aa1133',
    white:    '#0d1f30',
    gridLine:    'rgba(0,0,50,0.08)',
    axisBorder:  'rgba(40,90,160,0.4)',
    axisLabel:   'rgba(15,50,100,0.9)',
    chartBg:     'rgba(255,255,255,0.8)',
    cvgInner:    'rgba(255,255,255,1)',
    cvgSectorMix: 0.3,
    cvgText:     'rgba(10,10,10,0.95)',
    cvgSubText:  'rgba(20,20,20,0.7)',
    spdCurve:    'rgba(180,10,10,0.9)',
    spdRef:      'rgba(80,80,80,0.6)',
    spdRefText:  '#0d1f30',
    spdDimText:  '#2a5070',
  }
};

// Looks up a theme object by name ('dark' | 'light'), falling back to dark
// for any unrecognized name (including undefined, e.g. before the stored
// preference loads).
export function getTheme(name) {
  return themes[name] || themes.dark;
}
