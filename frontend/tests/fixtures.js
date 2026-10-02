// tests/fixtures.js
//
// Canned API response data for the mocked backend (see mockApi.js). Shapes
// are copied from the real PHP handlers:
//   user      -> api/auth/me.php
//   reports   -> api/reports_list.php's fmt()
//   explore   -> api/explore.php's final json_out()
//   categories-> api/categories.php
// Keep these in sync if those handlers' output shape changes -- a test
// passing against a stale shape is worse than no test.

export const fixtures = {
  user: {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    is_admin: 0,
    created_at: '2026-01-01 00:00:00',
    reportsDefaultPrivate: false,
    viewExplore: 'cards',
    viewMyReports: 'cards',
    timezone: 'America/New_York',
  },

  reports: [
    {
      id: 101, label: 'HT70 #1', sourceType: 'csv', cct: 5000, duv: -0.001,
      x: 0.345, y: 0.355, Rf: 92, Rg: 102, rfBins: null, ra: 94, r9: 88,
      notes: '', shareToken: null, isPublic: false, createdAt: '2026-09-01 10:00:00',
    },
    {
      id: 102, label: 'IF25A #1', sourceType: 'csv', cct: 4000, duv: 0.002,
      x: 0.38, y: 0.38, Rf: 88, Rg: 98, rfBins: null, ra: 90, r9: 70,
      notes: '', shareToken: null, isPublic: true, createdAt: '2026-09-02 10:00:00',
    },
  ],

  spd: {
    wls: Array.from({ length: 41 }, (_, i) => 380 + i * 10),
    vals: Array.from({ length: 41 }, (_, i) => Math.max(0, Math.sin((i / 40) * Math.PI) * 100)),
  },

  rcsBins: Array.from({ length: 16 }, (_, i) => ({ bin: i, rfBin: 90 + (i % 5), angle: i * 22.5 })),

  notices: [],

  categories: {
    light_brand: ['Acebeam', 'Emisar', 'Sofirn'],
    light_model: ['D7F', 'HT70', 'IF25A'],
    led_brand: ['Nichia', 'Luminus', 'Osram'],
    led_cct: ['2700K', '4000K', '5000K'],
    led_model: ['519A', 'SST-20'],
    optic: ['TIR', 'Reflector'],
  },

  explore: {
    categoryOptions: { light_brand: ['Acebeam', 'Emisar'], light_model: ['D7F', 'HT70'] },
    userOptions: [{ id: 1, name: 'Test User' }],
    ranges: { cct: [1200, 8000], duv: [-0.218, 0.004], rf: [0, 100], rg: [59, 115], r9: [-373, 97], ra: [-25, 98] },
    reports: [
      { id: 101, label: 'HT70 #1', userName: 'Test User', cct: 5000, duv: -0.001, Rf: 92, Rg: 102, ra: 94, r9: 88, createdAt: '2026-09-01 10:00:00' },
      { id: 102, label: 'IF25A #1', userName: 'Test User', cct: 4000, duv: 0.002, Rf: 88, Rg: 98, ra: 90, r9: 70, createdAt: '2026-09-02 10:00:00' },
    ],
    total: 2, page: 1, pages: 1,
  },

  exploreStats: {
    count: 2, avgRa: 92, avgCct: 4500, highCriPct: 50, votes: 0,
    cct: [], ra: [], r9: [], duv: [], ledModels: [], lightBrands: [], overTime: [],
  },
};
