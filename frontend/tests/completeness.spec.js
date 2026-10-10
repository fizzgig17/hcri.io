// Report cards show a completeness %, a flicker icon when a flicker reading is attached, and (own reports
// only) a "Fill in" button that opens the key-LED-fields dialog.
import { test, expect } from '@playwright/test';
import { installMockApi } from './mockApi.js';
import { fixtures } from './fixtures.js';

const explore = {
  ...fixtures.explore,
  reports: [
    { ...fixtures.explore.reports[0], userId: 1, completeness: 40, missing: ['led_model', 'led_cct', 'notes'], hasFlicker: true },
    { ...fixtures.explore.reports[1], userId: 2, completeness: 100, missing: [], hasFlicker: false },
  ],
};

test('cards show completeness, flicker icon and the Fill in button for own reports', async ({ page }) => {
  await installMockApi(page, { loggedIn: true, explore });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/?explore');
  await expect(page.getByText(explore.reports[0].label).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('40%')).toBeVisible();
  await expect(page.getByText('100%')).toBeVisible();
  await expect(page.locator('svg title', { hasText: 'Has a flicker reading' })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Fill in' })).toHaveCount(1);
});
