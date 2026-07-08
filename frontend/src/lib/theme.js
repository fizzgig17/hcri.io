// ── Theme definitions ─────────────────────────────────────────────────────────
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
    // Canvas / chart colours
    gridLine:    'rgba(255,255,255,0.07)',
    axisBorder:  'rgba(80,140,180,0.4)',
    axisLabel:   'rgba(160,200,230,0.9)',
    chartBg:     'rgba(0,0,0,0.2)',
    // CVG
    cvgInner:    'rgba(240,244,250,1)',
    cvgSectorMix: 0.4,   // how much to mix hue colour toward white
    cvgText:     'rgba(20,20,20,0.9)',
    cvgSubText:  'rgba(30,30,30,0.55)',
    // SPD chart
    spdCurve:    'rgba(220,40,40,0.9)',
    spdRef:      'rgba(180,180,180,0.5)',
    spdRefText:  '#e8f4ff',
    spdDimText:  '#7aaccc',
  },
  light: {
    name: 'light',
    bg:       '#f0f4f8',
    surface:  '#ffffff',
    surface2: '#e8eef5',
    surface3: '#dde6f0',
    border:   'rgba(60,120,180,0.2)',
    text:     '#1a2a3a',
    dim:      '#4a6a8a',
    accent:   '#0070cc',
    good:     '#1a8a40',
    warn:     '#cc8800',
    bad:      '#cc2244',
    white:    '#ffffff',
    // Canvas / chart colours
    gridLine:    'rgba(0,0,0,0.06)',
    axisBorder:  'rgba(60,120,180,0.3)',
    axisLabel:   'rgba(40,80,120,0.9)',
    chartBg:     'rgba(255,255,255,0.6)',
    // CVG
    cvgInner:    'rgba(255,255,255,1)',
    cvgSectorMix: 0.3,
    cvgText:     'rgba(20,20,20,0.9)',
    cvgSubText:  'rgba(30,30,30,0.6)',
    // SPD chart
    spdCurve:    'rgba(190,20,20,0.9)',
    spdRef:      'rgba(100,100,100,0.5)',
    spdRefText:  '#1a2a3a',
    spdDimText:  '#4a6a8a',
  }
};

export function getTheme(name) {
  return themes[name] || themes.dark;
}
