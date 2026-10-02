// tests/explore.spec.js
//
// Regression test for the Explore filter-sidebar bug: on desktop the filter
// panel must be a fixed 270px-wide sidebar beside the results grid, not a
// full-width block that pushes the results below it (see the "search box
// on dev is full width" report this test was written in response to --
// frontend/src/components/Explore.jsx's FilterPanel `width` prop).

import { test, expect } from '@playwright/test';
import { installMockApi } from './mockApi.js';
import { captureConsoleErrors } from './helpers.js';

test('guest Explore page renders with no console errors', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await installMockApi(page, { loggedIn: false });

  await page.goto('/?explore');
  await expect(page.getByText('⚙ Filters')).toBeVisible({ timeout: 10000 });

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

test('filter sidebar is a fixed-width desktop sidebar, not full width', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop-only layout assertion; see the mobile test below');
  await installMockApi(page, { loggedIn: false });
  await page.goto('/?explore');

  const filtersLabel = page.getByText('⚙ Filters');
  await expect(filtersLabel).toBeVisible({ timeout: 10000 });

  // "⚙ Filters" -> header row div -> the FilterPanel's own outer div.
  const panel = filtersLabel.locator('..').locator('..');
  const box = await panel.boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeCloseTo(270, 0);

  // The results grid should occupy the rest of the row, not be pushed
  // below the filter panel (which is what width:100% on the panel used
  // to cause).
  const viewport = page.viewportSize();
  expect(box.x + box.width).toBeLessThan(viewport.width * 0.5);
});

test('filter sidebar is full width on mobile, shown via the Filter toggle', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile-only; desktop covered above');
  await installMockApi(page, { loggedIn: false });
  await page.goto('/?explore');

  // On mobile the filter panel starts hidden behind a "⚙ Filter" toggle.
  await page.getByRole('button', { name: '⚙ Filter' }).click();

  const filtersLabel = page.getByText('⚙ Filters');
  await expect(filtersLabel).toBeVisible({ timeout: 10000 });

  const panel = filtersLabel.locator('..').locator('..');
  const box = await panel.boundingBox();
  const viewport = page.viewportSize();
  expect(box.width).toBeGreaterThan(viewport.width * 0.9);
});

test('collapse arrow toggles the desktop filter sidebar', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the collapse arrow only exists on desktop');
  await installMockApi(page, { loggedIn: false });
  await page.goto('/?explore');

  await expect(page.getByText('⚙ Filters')).toBeVisible({ timeout: 10000 });
  await page.getByTitle('Hide filters').click();
  await expect(page.getByText('⚙ Filters')).toHaveCount(0);
  await page.getByTitle('Show filters').click();
  await expect(page.getByText('⚙ Filters')).toBeVisible();
});
