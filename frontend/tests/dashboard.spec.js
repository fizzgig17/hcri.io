// tests/dashboard.spec.js
//
// Smoke test: logging in lands the user on Explore (auto-opened by
// App.jsx's post-login useEffect -- a plain login does NOT show the old
// Sidebar + "Saved Reports" list UI; that screen is on the list to be
// removed in an upcoming frontend revamp, so it intentionally gets no
// dedicated coverage here).

import { test, expect } from '@playwright/test';
import { installMockApi } from './mockApi.js';
import { fixtures } from './fixtures.js';
import { captureConsoleErrors } from './helpers.js';

test('logged-in landing page (Explore, auto-opened after login) renders the report list with no console errors', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await installMockApi(page, { loggedIn: true });

  // The app reads its session token from localStorage (see lib/api.js's
  // setToken) before anything mounts.
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');

  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });
  for (const r of fixtures.explore.reports) {
    await expect(page.getByText(r.label)).toBeVisible();
  }

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});
