// tests/dashboard.spec.js
//
// Smoke test: the logged-in dashboard (Sidebar + report list) boots with a
// mocked session and report list, with no console errors.

import { test, expect } from '@playwright/test';
import { installMockApi } from './mockApi.js';
import { fixtures } from './fixtures.js';
import { captureConsoleErrors } from './helpers.js';

test('logged-in dashboard renders the report list with no console errors', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await installMockApi(page, { loggedIn: true });

  // The app reads its session token from localStorage (see lib/api.js's
  // setToken) before anything mounts.
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');

  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });
  for (const r of fixtures.reports) {
    await expect(page.getByText(r.label)).toBeVisible();
  }

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

test('opening a report renders its detail view with no console errors', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await installMockApi(page, { loggedIn: true });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');

  // force:true -- on mobile, selecting a report transitions the sidebar
  // list out and the detail pane in (the single-pane mobile layout), which
  // can make Playwright's actionability retry loop chase a moving target.
  await page.getByText(fixtures.reports[0].label).click({ force: true });

  // CCT is rendered as part of the report's metric tiles.
  await expect(page.getByText(String(fixtures.reports[0].cct))).toBeVisible({ timeout: 10000 });

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});
