// tests/guest-landing.spec.js
//
// Smoke test: the logged-out landing page (AuthScreen) boots cleanly.
// This is the very first thing any visitor sees, so a regression here is
// as severe as they come -- it's also exactly the kind of thing that broke
// during the frontend/src reconstruction (see the develop branch history
// around commit 250ea5c for that incident).

import { test, expect } from '@playwright/test';
import { installMockApi } from './mockApi.js';
import { captureConsoleErrors } from './helpers.js';

test('logged-out landing page renders with no console errors', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await installMockApi(page, { loggedIn: false });

  await page.goto('/');

  // Auth check resolves (mocked /auth/me 401) and the real landing page
  // replaces the "Loading…" placeholder.
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });
  await expect(page.getByText('Try it free', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

test('logged-out landing page is usable at mobile width', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'desktop covered by the test above');
  const errors = captureConsoleErrors(page);
  await installMockApi(page, { loggedIn: false });

  await page.goto('/');
  await expect(page.getByText('Try it free', { exact: true })).toBeVisible();

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});
