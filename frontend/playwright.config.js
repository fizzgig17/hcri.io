// playwright.config.js
//
// Frontend smoke/regression tests. These run against a local `vite preview`
// server (see webServer below) serving the real production build, with the
// backend PHP API mocked via Playwright route interception (tests/mockApi.js)
// -- there is no PHP/MySQL backend available in CI or most dev machines, and
// the tests don't need one: they're checking that the React app renders
// correctly for a given API response shape, not that the PHP backend itself
// is correct.
//
// Run with: npm test  (builds first, then runs the suite)
//       or: npx playwright test  (if a build already exists in ../assets or
//           dist/, and you just want to re-run the tests)

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], viewport: { width: 1400, height: 900 } } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // test:preview serves the throwaway test-dist/ build (vite.config.test.js),
    // never the real assets/ directory -- see that file for why.
    command: 'npm run test:preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
