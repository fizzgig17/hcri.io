// tests/mobile-safe-area.spec.js
//
// On iOS, Safari's and Firefox's bottom toolbar is translucent, so
// whatever page content sits directly behind it stays legible as the
// page scrolls or the toolbar collapses -- reported as "an artifact at
// the bottom of the screen under the OS overlay bar" (the last report
// card's title/delete icon showing through). Two parts to the fix:
//
// 1. The viewport meta needs `viewport-fit=cover`, or env(safe-area-
//    inset-*) always resolves to 0 and nothing can actually reserve
//    space for the safe area (checked here via frontend/index.html,
//    which is what this test's build is generated from -- the deployed
//    site's real shell is index.php, not this file, but they're kept in
//    sync by hand).
// 2. The results grid needs real bottom padding on mobile so the last
//    card never sits flush against the true bottom of the screen.

import { test, expect } from '@playwright/test';
import { installMockApi } from './mockApi.js';
import { fixtures } from './fixtures.js';

test('the viewport meta declares viewport-fit=cover', async ({ page }) => {
  await installMockApi(page, { loggedIn: false });
  await page.goto('/?explore');
  const content = await page.locator('meta[name="viewport"]').getAttribute('content');
  expect(content).toContain('viewport-fit=cover');
});

test('the mobile results grid reserves real bottom padding below the last card', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'desktop has its own (non-safe-area) padding, not under test here');
  await installMockApi(page, { loggedIn: false });
  await page.goto('/?explore');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });

  const label = fixtures.explore.reports[0].label;
  await expect(page.getByText(label).first()).toBeVisible({ timeout: 10000 });

  const grid = page.locator('[data-expgrid]');
  const paddingBottom = await grid.evaluate((el) => parseFloat(getComputedStyle(el.parentElement).paddingBottom));
  expect(paddingBottom).toBeGreaterThanOrEqual(28);
});
