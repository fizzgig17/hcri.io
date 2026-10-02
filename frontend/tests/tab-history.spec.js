// tests/tab-history.spec.js
//
// Regression test: switching between Explore's "Explore" and "My Reports"
// tabs, then pressing back, should return to the previous tab -- not stay
// on the one you just left (reported after the back-button fix in
// back-button.spec.js shipped).
//
// Root cause (two bugs, both in Explore.jsx):
//
// 1. Every tab-bar click calls __hcriResetListView() -> __hcriClearFolderUrl(),
//    which replaceState()s the CURRENT (about-to-be-left) history entry to
//    strip a stale `folder` param -- but it hardcoded `etab: 'myreports'`
//    into that entry's state regardless of which tab was actually being
//    left, corrupting the entry you'd land back on.
//
// 2. App.jsx remounts the whole <Explore> component (bumps exploreKey) on
//    every popstate that lands back on an "explore" view, so `tab`'s
//    useState INITIALIZER -- not just its popstate listener -- is what
//    actually determines which tab you see after a back/forward press.
//    That initializer only read the URL's `?explore=...` query, which the
//    implicit "browse" entry (created when Explore auto-opens right after
//    login) never has -- it's a bare `/` -- so going back to it fell
//    through to a last-viewed-tab localStorage heuristic instead, which by
//    then pointed at whatever tab was just left.
//
// Both are fixed now: the entry's own history.state.etab (bug 1, now
// tagged correctly) is consulted by the tab initializer (bug 2's fix)
// before that localStorage fallback.

import { test, expect } from '@playwright/test';
import { installMockApi } from './mockApi.js';
import { captureConsoleErrors } from './helpers.js';

async function activeTab(page, label) {
  const btn = page.getByRole('button', { name: label, exact: true });
  const color = await btn.evaluate((el) => getComputedStyle(el).borderBottomColor);
  return color.includes('212, 255'); // the accent color used for the active tab's underline
}

test('back/forward between Explore and My Reports restores the correct tab each way', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await installMockApi(page, { loggedIn: true });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });

  // Implicit landing: Explore's own "Explore" (browse) tab, auto-opened
  // after login, with no explicit tab click yet.
  await expect(page.getByRole('button', { name: 'Explore', exact: true })).toBeVisible({ timeout: 10000 });
  expect(await activeTab(page, 'Explore')).toBe(true);

  await page.getByRole('button', { name: 'My Reports' }).click();
  expect(await activeTab(page, 'My Reports')).toBe(true);
  // "+ New Folder" only renders on the My Reports tab -- confirms the tab
  // actually switched, not just its underline color.
  await expect(page.getByText('+ New Folder')).toBeVisible();

  await page.getByRole('button', { name: 'Explore', exact: true }).click();
  expect(await activeTab(page, 'Explore')).toBe(true);
  await expect(page.getByText('+ New Folder')).toHaveCount(0);

  // Back once: Explore -> My Reports.
  await page.goBack();
  await expect(page.getByText('+ New Folder')).toBeVisible({ timeout: 5000 });
  expect(await activeTab(page, 'My Reports')).toBe(true);

  // Back again: My Reports -> the implicit browse landing.
  await page.goBack();
  await expect(page.getByText('+ New Folder')).toHaveCount(0);
  expect(await activeTab(page, 'Explore')).toBe(true);

  // Forward: browse -> My Reports again.
  await page.goForward();
  await expect(page.getByText('+ New Folder')).toBeVisible({ timeout: 5000 });
  expect(await activeTab(page, 'My Reports')).toBe(true);

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});
