// tests/explore-overlay-scroll-lock.spec.js
//
// On mobile, the Explore overlay (`position:fixed; inset:0; zIndex:1500`,
// see App.jsx) renders *on top of* the logged-in dashboard (Sidebar +
// ReportDetail) rather than replacing it -- the dashboard stays mounted
// underneath for an instant close. The mobile stylesheet override in
// index.php intentionally sets `html, body, #root { height: auto;
// overflow: visible }` so that dashboard (the Sidebar's own, potentially
// very long, "Saved Reports" list) can scroll on its own when it's the
// thing actually showing.
//
// With Explore's fixed overlay then sitting on top of that still-tall,
// still-scrollable document, a scroll/rubber-band gesture on iOS Safari
// and Firefox can fall through to it once the overlay's own inner scroll
// (overflowY:auto) bottoms out -- surfacing the old Sidebar list behind
// the overlay. Reported as "an artifact at the bottom of the screen under
// the OS overlay bar" / "it's like there's a page under the current one
// and the current one doesn't reach the full length."
//
// First attempt at a fix: App.jsx locks <html> (via the pre-existing but
// previously no-op "app-locked" class -- it had a useEffect applying it
// but no CSS ever defined it, see index.css) whenever Explore is open on
// mobile, removing the scrollable surface behind the overlay via
// overflow:hidden. That shipped, but the bleed-through was still reported
// in production afterward (real iOS Safari, My Reports, bulk-select mode)
// -- iOS has a long-standing quirk where overflow:hidden on an ancestor
// doesn't reliably stop touch-scrolling, which this test's simulated wheel
// event doesn't reproduce.
//
// The actual fix: App.jsx also gives the dashboard's mobile content wrapper
// `display:none` (not just the app-locked overflow:hidden) while Explore is
// open, so there's no layout box behind the overlay at all -- nothing for
// any scroll mechanism, real or simulated, to reach. Kept mounted rather
// than unmounted so state survives and closing Explore is still instant.
// The app-locked overflow:hidden lock stays too, as a second, independent
// layer (also covers the brief instant before/after exploreOpen toggles).

import { test, expect } from '@playwright/test';
import { installMockApi } from './mockApi.js';
import { fixtures } from './fixtures.js';

// Enough reports that the Sidebar's own list (rendered behind Explore)
// would be taller than the viewport if it weren't locked -- mirrors the
// real-world report (a 47-report account).
const manyReports = Array.from({ length: 40 }, (_, i) => ({
  ...fixtures.reports[0],
  id: 1000 + i,
  label: `Legacy sidebar report #${i}`,
  createdAt: '2026-09-01 10:00:00',
}));

test('Explore overlay locks <html> on mobile so the dashboard behind it cannot be scrolled into view', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'desktop never unlocks html/body/#root in the first place (no mobile stylesheet override) -- not under test here');

  await installMockApi(page, { loggedIn: true, reports: manyReports });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');

  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });
  // Login auto-opens Explore (dashboard.spec.js) -- wait for its content.
  await expect(page.getByText(fixtures.explore.reports[0].label).first()).toBeVisible({ timeout: 10000 });

  const html = page.locator('html');
  await expect(html).toHaveClass(/app-locked/);

  const { overflow, scrollHeight, clientHeight } = await html.evaluate((el) => ({
    overflow: getComputedStyle(el).overflow,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
  }));
  expect(overflow).toBe('hidden');
  // No extra scrollable height behind the overlay -- if the dashboard's
  // long Sidebar list behind it were still contributing to document
  // height, scrollHeight would run well past clientHeight.
  expect(scrollHeight).toBeLessThanOrEqual(clientHeight + 2);

  // With html/body/#root locked there's nothing left to scroll -- a wheel
  // gesture should leave window.scrollY at 0. (Not a visibility check on
  // the legacy Sidebar label: Playwright's toBeVisible doesn't account for
  // an ancestor's overflow:hidden clipping an off-screen element, so an
  // off-screen-but-unclipped-by-itself node still reads as "visible" --
  // scrollY staying put is what actually proves it's unreachable.)
  await page.mouse.wheel(0, 5000);
  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBe(0);

  // The real fix, not just defense-in-depth: the dashboard behind Explore
  // (the legacy Sidebar list) is display:none, not merely clipped by
  // overflow:hidden -- confirmed in production that overflow:hidden alone
  // (the app-locked class above) does NOT reliably stop real iOS Safari
  // from touch-scrolling an ancestor into view regardless of what this
  // emulated/CDP environment's wheel-event check says, so the assertion
  // that actually matters is that there's no layout box for it to reach at
  // all. Unlike the overflow:hidden case, Playwright's toBeVisible() DOES
  // see through display:none (it's not just a clip), so this is a real
  // regression guard.
  await expect(page.getByText('Legacy sidebar report #0')).not.toBeVisible();
});

test('closing Explore releases the lock', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'lock only ever engages on mobile');

  await installMockApi(page, { loggedIn: true, reports: manyReports });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');

  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });
  await expect(page.getByText(fixtures.explore.reports[0].label).first()).toBeVisible({ timeout: 10000 });
  await expect(page.locator('html')).toHaveClass(/app-locked/);

  // Back out of Explore to the dashboard (hamburger/back control shown in
  // App.jsx's mobile header -- "✕" toggles Explore/dashboard via the same
  // control that opens it, through onBack/goHome wiring).
  await page.goBack();

  await expect(page.locator('html')).not.toHaveClass(/app-locked/);
});
