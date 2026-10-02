// tests/no-redundant-history.spec.js
//
// Regression test: clicking a nav target you're already viewing (a tab
// you're already on, the logo/home link while already at that root) used
// to still push a new history entry even though nothing on screen changed.
// That's confusing on its own, and it's also why pressing the browser back
// button sometimes appeared to do nothing: the "current" entry and the
// "previous" entry it pushed over both rendered the same screen, so a
// single back press looked like a no-op even though history.length did
// shrink by one (reported as "clicking explore adds to the url but doesn't
// change the page... but clicking back on it stays on the same page").
//
// Fixed by guarding each pushState call site (Explore.jsx's tab bar and
// logo click, App.jsx's goHome/openExplore/goRoot/openReport) to bail out
// before doing anything -- including the pushState -- when the target is
// already the current view. See the "already there" comments at each
// call site.

import { test, expect } from '@playwright/test';
import { installMockApi } from './mockApi.js';
import { fixtures } from './fixtures.js';
import { captureConsoleErrors } from './helpers.js';

// Logged-in Explore renders inside a z-index:1500 overlay on top of the
// (hidden but still present) Sidebar/home screen behind it, which has its
// own "hCRI.io" logo -- same ambiguity as admin.spec.js's Admin button.
// Scope to the visible, logged-in Explore instance.
const VISIBLE_LOGO = '[style*="z-index: 1500"] >> text=hCRI.io';

test('clicking the already-active tab does not push a new history entry', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await installMockApi(page, { loggedIn: true });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });
  await expect(page.getByRole('button', { name: 'Explore', exact: true })).toBeVisible({ timeout: 10000 });

  const lenAtStart = await page.evaluate(() => window.history.length);

  // Clicking the tab we're already on (the implicit "browse" landing) --
  // should be a complete no-op for history.
  await page.getByRole('button', { name: 'Explore', exact: true }).click();
  expect(await page.evaluate(() => window.history.length)).toBe(lenAtStart);

  // Switch tabs for real -- this SHOULD push.
  await page.getByRole('button', { name: 'My Reports' }).click();
  await expect(page.getByText('+ New Folder')).toBeVisible();
  const lenAfterSwitch = await page.evaluate(() => window.history.length);
  expect(lenAfterSwitch).toBe(lenAtStart + 1);

  // Clicking "My Reports" again while already on it -- no-op.
  await page.getByRole('button', { name: 'My Reports' }).click();
  expect(await page.evaluate(() => window.history.length)).toBe(lenAfterSwitch);

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

test('clicking the logo while already at the explore root does not push a new history entry', async ({ page }) => {
  // Logged in: guests always exit Explore entirely on a logo click (that's
  // the existing, unrelated "take me back to the landing page" behavior --
  // see Explore.jsx's `if (!n && onHomeFn)` branch). Only the logged-in
  // path falls into the "already at root" guard this test is for.
  await installMockApi(page, { loggedIn: true });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });
  await expect(page.locator(VISIBLE_LOGO)).toBeVisible({ timeout: 10000 });

  const lenAtStart = await page.evaluate(() => window.history.length);

  await page.locator(VISIBLE_LOGO).click();
  expect(await page.evaluate(() => window.history.length)).toBe(lenAtStart);

  // The logo always goes to the browse root -- so switch to My Reports
  // (a real change from browse), then click it: it should land back on
  // browse, confirming the guard isn't just disabling the pushState
  // outright.
  await page.getByRole('button', { name: 'My Reports' }).click();
  await expect(page.getByText('+ New Folder')).toBeVisible();
  const lenOnMyReports = await page.evaluate(() => window.history.length);
  expect(lenOnMyReports).toBe(lenAtStart + 1);

  await page.locator(VISIBLE_LOGO).click();
  await expect(page.getByText('+ New Folder')).toHaveCount(0);
  expect(await page.evaluate(() => window.history.length)).toBe(lenOnMyReports + 1);
});

test('reloading straight onto Explore, then clicking Explore again, leaves back working normally', async ({ page }) => {
  // This is the exact symptom reported: load the site landing on Explore,
  // click the already-active "Explore" nav target (which used to silently
  // push a redundant entry), then press back -- back used to look like it
  // did nothing because both entries rendered the same screen.
  await installMockApi(page, { loggedIn: false });
  await page.goto('/?explore');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });

  const label = fixtures.explore.reports[0].label;
  await expect(page.getByText(label).first()).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: 'Explore', exact: true }).click();

  // Open a report so there's something for back to meaningfully undo, then
  // confirm a single back press closes it (would need two presses on the
  // old, buggy code if the redundant entry had been pushed).
  await page.getByText(label).first().click();
  await expect(page.getByRole('button', { name: '← Back to Explore' })).toBeVisible({ timeout: 10000 });

  await page.goBack();
  await expect(page.getByRole('button', { name: '← Back to Explore' })).toHaveCount(0);
  await expect(page.getByText(label).first()).toBeVisible();
});
