// tests/compare-bar-mobile.spec.js
//
// The floating selection bar that appears over My Reports/Explore when
// one or more report cards are selected (cmpSel) was cramped on mobile --
// up to five controls (count, Clear, Compare, Categorize, Delete) packed
// into a small centered pill. Clear and Delete (My Reports only) are now
// icon-only buttons on mobile (🚫 / 🗑) instead of full text labels, to
// give the bar some room; desktop keeps the text labels.

import { test, expect } from '@playwright/test';
import { installMockApi } from './mockApi.js';
import { captureConsoleErrors } from './helpers.js';

test('the selection bar uses icon-only Clear/Delete buttons on mobile, text labels on desktop', async ({ page, isMobile }) => {
  const errors = captureConsoleErrors(page);
  await installMockApi(page, { loggedIn: true });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });

  await page.getByRole('button', { name: 'My Reports' }).click();
  await page.getByRole('button', { name: /Select all/ }).click();
  await expect(page.getByText('/12 selected')).toBeVisible({ timeout: 10000 });

  if (isMobile) {
    await expect(page.getByRole('button', { name: 'Clear selection' })).toBeVisible();
    await expect(page.getByText('Clear', { exact: true })).toHaveCount(1); // the smaller "Clear" link above the grid, not a second one in the bar
    await expect(page.getByRole('button', { name: 'Delete selected reports' })).toBeVisible();
    await expect(page.getByText(/^Delete \d/)).toHaveCount(0);

    // Icon buttons still work.
    await page.getByRole('button', { name: 'Clear selection' }).click();
    await expect(page.getByText('/12 selected')).toHaveCount(0);
  } else {
    await expect(page.getByRole('button', { name: 'Clear', exact: true })).toHaveCount(2); // the one above the grid, and the bar's own
    await expect(page.getByText(/^Delete \d/)).toBeVisible();
  }

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});
