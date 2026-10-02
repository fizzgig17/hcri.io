// tests/refresh-persists-view.spec.js
//
// Regression test: refreshing the browser should always leave you where
// you were -- only clicking the hCRI.io logo should take you back to the
// root. Several "places" inside Explore used to fail that:
//
// 1. Opening a report (from either guest or logged-in Explore) never
//    touched the URL, only an in-memory history marker -- a refresh lost
//    the open report entirely and dropped you on the bare listing.
// 2. Opening a folder in My Reports never touched the URL either (despite
//    a `?folder=` param already being read on mount -- it was just never
//    written), so the same thing happened: refresh silently exited the
//    folder.
// 3. The logo click's "return to the last browse/myreports tab" always
//    pushed a bare pathname with no `?explore=...` suffix, so refreshing
//    right after landed back on "browse" instead of wherever it actually
//    put you.
//
// Fixed by tagging each of those with an identifying URL (`?rid=`,
// `&folder=`, `?explore=mine`/`=insights`) in addition to the history
// marker, and having Explore resolve `?rid=`/`?folder=` back into state
// on mount -- the same way `tab` already did for `?explore=...`. See
// src/lib/panelHistory.js's claimPanel for how a restored (not freshly
// opened) report avoids pushing a redundant entry.

import { test, expect } from '@playwright/test';
import { installMockApi } from './mockApi.js';
import { fixtures } from './fixtures.js';
import { captureConsoleErrors } from './helpers.js';

const VISIBLE_LOGO = '[style*="z-index: 1500"] >> text=hCRI.io';

test('refreshing while a report is open (guest Explore) stays on that report', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await installMockApi(page, { loggedIn: false });
  await page.goto('/?explore');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });

  const label = fixtures.explore.reports[0].label;
  await page.getByText(label).first().click();
  await expect(page.getByRole('button', { name: '← Back to Explore' })).toBeVisible({ timeout: 10000 });
  expect(page.url()).toContain('rid=');

  await page.reload();
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });
  await expect(page.getByRole('button', { name: '← Back to Explore' })).toBeVisible({ timeout: 10000 });

  // The restored report is still a normal, closeable panel: clicking
  // "← Back to Explore" (not the back button) should leave you on the
  // grid, not strand you or take you off-site -- see claimPanel's comment
  // for why this path is different from a report opened by a click.
  await page.getByRole('button', { name: '← Back to Explore' }).click();
  await expect(page.getByText(label).first()).toBeVisible();

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

test('refreshing while on My Reports > a folder stays inside that folder', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await installMockApi(page, { loggedIn: true });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });

  await page.getByRole('button', { name: 'My Reports' }).click();
  const folderName = fixtures.folders[0].name;
  await expect(page.getByText(folderName)).toBeVisible({ timeout: 10000 });
  await page.getByText(folderName).click();
  await expect(page.getByText('← My Reports')).toBeVisible({ timeout: 10000 });
  expect(page.url()).toContain('folder=');

  await page.reload();
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });
  await expect(page.getByText('← My Reports')).toBeVisible({ timeout: 10000 });

  // Leaving the folder the normal way strips `folder` back out of the URL.
  await page.getByText('← My Reports').click();
  await expect(page.getByText('← My Reports')).toHaveCount(0);
  expect(page.url()).not.toContain('folder=');

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

test('refreshing after a logo click back to My Reports stays on My Reports, not Explore', async ({ page }) => {
  await installMockApi(page, { loggedIn: true });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });

  await page.getByRole('button', { name: 'My Reports' }).click();
  await expect(page.getByText('+ New Folder')).toBeVisible();
  await page.getByRole('button', { name: 'Insights', exact: true }).click();
  await expect(page.getByText('+ New Folder')).toHaveCount(0);

  // The logo returns to whichever of browse/myreports was last visited --
  // here, My Reports.
  await page.locator(VISIBLE_LOGO).click();
  await expect(page.getByText('+ New Folder')).toBeVisible({ timeout: 5000 });
  expect(page.url()).toContain('explore=mine');

  await page.reload();
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });
  await expect(page.getByText('+ New Folder')).toBeVisible({ timeout: 10000 });
});

test('clicking the logo always still goes home, even from inside a folder', async ({ page }) => {
  await installMockApi(page, { loggedIn: true });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });

  await page.getByRole('button', { name: 'My Reports' }).click();
  const folderName = fixtures.folders[0].name;
  await page.getByText(folderName).click();
  await expect(page.getByText('← My Reports')).toBeVisible({ timeout: 10000 });

  await page.locator(VISIBLE_LOGO).click();
  await expect(page.getByText('← My Reports')).toHaveCount(0);
});
