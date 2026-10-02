// tests/admin-submodals-mobile.spec.js
//
// The admin panel's three sub-tools (Categories, Notices, Featured --
// AdminCats.jsx/AdminNotices.jsx/AdminFeatured.jsx) each popped up as a
// small centered dialog with rounded corners and backdrop margins, even
// on a phone-width viewport -- unlike AdminPanel itself (and every other
// panel in the app), which already goes full-bleed/edge-to-edge on
// mobile. Part of the "mobile rework" to dock panels instead of leaving
// them as small floating overlays. Desktop keeps the centered-dialog look.

import { test, expect } from '@playwright/test';
import { installMockApi } from './mockApi.js';
import { fixtures } from './fixtures.js';
import { captureConsoleErrors } from './helpers.js';

const VISIBLE_ADMIN_BTN = '[style*="z-index: 1500"] [title="Admin"]';

async function loginAsAdmin(page) {
  await installMockApi(page, { loggedIn: true, user: { ...fixtures.user, is_admin: 1 } });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });
  await page.locator(VISIBLE_ADMIN_BTN).click();
  await expect(page.getByText(`${fixtures.adminStats.users} users`)).toBeVisible({ timeout: 10000 });
}

// A "docked" panel fills the viewport: its card sits flush against the
// window edges (no backdrop gap visible around it). A "floating" dialog
// leaves a visible gap/margin on at least one side.
async function isDocked(page, cardLocator) {
  const box = await cardLocator.boundingBox();
  const vp = page.viewportSize();
  return box.x <= 1 && box.width >= vp.width - 2;
}

test('Categories tool is docked full-bleed on mobile, a centered dialog on desktop', async ({ page, isMobile }) => {
  const errors = captureConsoleErrors(page);
  await loginAsAdmin(page);

  await page.getByRole('button', { name: '🏷 Categories' }).click();
  await expect(page.getByText('Manage Categories')).toBeVisible({ timeout: 10000 });

  const card = page.getByText('Manage Categories').locator('xpath=ancestor::div[2]');
  expect(await isDocked(page, card)).toBe(!!isMobile);

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

test('Notices tool is docked full-bleed on mobile, a centered dialog on desktop', async ({ page, isMobile }) => {
  const errors = captureConsoleErrors(page);
  await loginAsAdmin(page);

  await page.getByRole('button', { name: '🔔 Notices' }).click();
  await expect(page.getByText('Notices', { exact: true })).toBeVisible({ timeout: 10000 });

  const card = page.getByText('Notices', { exact: true }).locator('xpath=ancestor::div[2]');
  expect(await isDocked(page, card)).toBe(!!isMobile);

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

test('Featured Reports tool is docked full-bleed on mobile, a centered dialog on desktop', async ({ page, isMobile }) => {
  const errors = captureConsoleErrors(page);
  await loginAsAdmin(page);

  await page.getByRole('button', { name: '★ Featured' }).click();
  await expect(page.getByText('Featured Reports')).toBeVisible({ timeout: 10000 });

  const card = page.getByText('Featured Reports').locator('xpath=ancestor::div[2]');
  expect(await isDocked(page, card)).toBe(!!isMobile);

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});
