// tests/admin.spec.js
//
// Smoke test for the admin panel (AdminPanel.jsx). Only visible to admin
// users, so this logs in as a mocked admin.
//
// Two different "Admin" (title="Admin") buttons exist in the DOM at once
// for a logged-in admin: Sidebar.jsx's (always rendered underneath, even
// though logged-in users are auto-redirected to Explore after login --
// see App.jsx's post-login useEffect) and Explore.jsx's own toolbar
// button. Both report as CSS-"visible" (neither is display:none), so
// `getByTitle('Admin')` and even a `:visible` filter are ambiguous --
// only an actual z-index/overlap check (or a human eye) can tell they
// aren't both reachable. The real, clickable one is the one inside
// App.jsx's `position: fixed; z-index: 1500` Explore overlay, so scope
// to that container explicitly rather than guessing by DOM order.
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
}

test('non-admin users do not see the Admin button', async ({ page }) => {
  await installMockApi(page, { loggedIn: true, user: { ...fixtures.user, is_admin: 0 } });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });

  await expect(page.getByTitle('Admin')).toHaveCount(0);
});

test('admin panel opens and shows stats + the user list, no console errors', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await loginAsAdmin(page);

  await page.locator(VISIBLE_ADMIN_BTN).click();

  await expect(page.getByText(`${fixtures.adminStats.users} users`)).toBeVisible({ timeout: 10000 });
  for (const u of fixtures.adminUsers) {
    await expect(page.getByText(u.name, { exact: true })).toBeVisible();
  }

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

test('the Featured Reports tool opens and shows the mocked featured list', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await loginAsAdmin(page);
  await page.locator(VISIBLE_ADMIN_BTN).click();
  await expect(page.getByText(`${fixtures.adminStats.users} users`)).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: '★ Featured' }).click();
  await expect(page.getByText('Featured Reports')).toBeVisible();

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

test('toggling admin status on a user calls the PATCH endpoint', async ({ page }) => {
  await loginAsAdmin(page);
  await page.locator(VISIBLE_ADMIN_BTN).click();
  await expect(page.getByText(`${fixtures.adminStats.users} users`)).toBeVisible({ timeout: 10000 });

  // The per-user admin actions (Make Admin, Recalc, etc.) live in the
  // detail pane on the right, not inline in the user-list row -- selecting
  // a user from the list is what populates it.
  const otherUser = fixtures.adminUsers.find((u) => !u.isAdmin);
  await page.getByText(otherUser.email, { exact: true }).click();

  const patchRequest = page.waitForRequest(
    (req) => req.url().includes(`/admin/users/${otherUser.id}`) && req.method() === 'PATCH'
  );
  await page.getByRole('button', { name: 'Make Admin' }).click();
  const req = await patchRequest;
  expect(JSON.parse(req.postData())).toEqual({ isAdmin: true });
});
