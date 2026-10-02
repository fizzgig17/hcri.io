// tests/back-button.spec.js
//
// Regression test for "the back button takes me off the entire site":
// none of the app's modals/panels (AdminPanel, HelpModal, AccountSettings,
// FeedbackModal, PasteSPDModal, Explore's Compare view and open-report
// detail pane, AdminPanel's own sub-tools, etc.) used to push a history
// entry when opened -- they were just React state toggles rendered as
// fixed overlays. Pressing the browser back button while one was open
// skipped straight past the app to whatever was in browser history
// before the page was ever opened, instead of closing the panel. See
// src/lib/panelHistory.js and src/hooks/usePanelBackClose.js for the fix.
//
// Each test here starts a single, fresh page (Playwright gives every test
// its own browser context with empty history), so if a panel doesn't push
// its own history entry when it opens, there is nothing for the back
// button to land on and pressing it is a no-op -- the panel stays open.
// That's what these tests would see on the old, unfixed code: the "closed"
// assertion below would simply time out.

import { test, expect } from '@playwright/test';
import { installMockApi } from './mockApi.js';
import { fixtures } from './fixtures.js';
import { captureConsoleErrors } from './helpers.js';

const VISIBLE_ADMIN_BTN = '[style*="z-index: 1500"] [title="Admin"]';

test('back button closes the Admin panel and returns to Explore, not off the site', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await installMockApi(page, { loggedIn: true, user: { ...fixtures.user, is_admin: 1 } });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });

  await page.locator(VISIBLE_ADMIN_BTN).click();
  await expect(page.getByText(`${fixtures.adminStats.users} users`)).toBeVisible({ timeout: 10000 });

  await page.goBack();

  await expect(page.getByText(`${fixtures.adminStats.users} users`)).toHaveCount(0);
  // Still on the app, not navigated away -- the toolbar/explore chrome is
  // still there and still interactive.
  await expect(page.locator(VISIBLE_ADMIN_BTN)).toBeVisible();

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

test('back button closes a report opened from Explore and returns to the results grid', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await installMockApi(page, { loggedIn: false });
  await page.goto('/?explore');

  const label = fixtures.explore.reports[0].label;
  await expect(page.getByText(label).first()).toBeVisible({ timeout: 10000 });
  await page.getByText(label).first().click();
  await expect(page.getByRole('button', { name: '← Back to Explore' })).toBeVisible({ timeout: 10000 });

  await page.goBack();

  await expect(page.getByRole('button', { name: '← Back to Explore' })).toHaveCount(0);
  await expect(page.getByText(label).first()).toBeVisible();

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

test('nested panels close one at a time with back, innermost first', async ({ page }) => {
  await installMockApi(page, { loggedIn: true, user: { ...fixtures.user, is_admin: 1 } });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });

  await page.locator(VISIBLE_ADMIN_BTN).click();
  await expect(page.getByText(`${fixtures.adminStats.users} users`)).toBeVisible({ timeout: 10000 });

  // Open a sub-tool nested inside the Admin panel.
  await page.getByRole('button', { name: '★ Featured' }).click();
  await expect(page.getByText('Featured Reports')).toBeVisible({ timeout: 10000 });

  // One back press closes only the innermost (Featured Reports) panel --
  // the Admin panel underneath stays open.
  await page.goBack();
  await expect(page.getByText('Featured Reports')).toHaveCount(0);
  await expect(page.getByText(`${fixtures.adminStats.users} users`)).toBeVisible();

  // A second back press closes the Admin panel itself.
  await page.goBack();
  await expect(page.getByText(`${fixtures.adminStats.users} users`)).toHaveCount(0);
});

test('closing a panel with its own close button, then pressing back, does not reopen it', async ({ page }) => {
  await installMockApi(page, { loggedIn: true, user: { ...fixtures.user, is_admin: 1 } });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });

  await page.locator(VISIBLE_ADMIN_BTN).click();
  await expect(page.getByText(`${fixtures.adminStats.users} users`)).toBeVisible({ timeout: 10000 });

  // Close it the normal way (its own "X"/close affordance) rather than
  // with the back button -- this should consume the history entry the
  // panel pushed when it opened, so a later back press doesn't land on a
  // dangling entry that silently reopens it. Scoped to AdminPanel's own
  // z-index:3000 overlay -- on mobile there's also an unrelated "✕"
  // button elsewhere in the app chrome.
  await page.locator('[style*="z-index: 3000"] >> role=button[name="✕"]').click();
  await expect(page.getByText(`${fixtures.adminStats.users} users`)).toHaveCount(0);

  await page.goBack();
  await expect(page.getByText(`${fixtures.adminStats.users} users`)).toHaveCount(0);
});
