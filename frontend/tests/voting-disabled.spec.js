// tests/voting-disabled.spec.js
//
// Voting (thumbs up/down on a report) is paused -- it wasn't being used.
// Explore.jsx and ReportDetail.jsx each hide their Votes widget behind a
// VOTING_ENABLED = false flag (the component/API are left in place so
// it's a one-line flip to restore), and ExploreStats.jsx drops the
// aggregate "Votes" tile. This just checks the thumbs are gone from the
// three places they used to show up.

import { test, expect } from '@playwright/test';
import { installMockApi } from './mockApi.js';
import { fixtures } from './fixtures.js';
import { captureConsoleErrors } from './helpers.js';

test('no thumbs-up/down voting UI on Explore report cards', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await installMockApi(page, { loggedIn: false });
  await page.goto('/?explore');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });

  const label = fixtures.explore.reports[0].label;
  await expect(page.getByText(label).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByTitle('Good report')).toHaveCount(0);
  await expect(page.getByTitle('Not a good report')).toHaveCount(0);

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

test('no "Rate this report" row on the report detail view', async ({ page }) => {
  // A guest's click-through from Explore renders ReportDetail's compact
  // "preview" card (a different branch entirely, with no Votes row either
  // way), so this needs an owner viewing their own saved report -- the
  // full, non-preview detail view -- to exercise the real VOTING_ENABLED
  // guard.
  const errors = captureConsoleErrors(page);
  await installMockApi(page, { loggedIn: true });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });

  await page.getByRole('button', { name: 'My Reports' }).click();
  const label = fixtures.explore.reports[0].label;
  const card = page.getByText(label).first();
  await expect(card).toBeVisible({ timeout: 10000 });
  await card.click();
  await expect(page.getByRole('button', { name: '← Back to My Reports' })).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Rate this report')).toHaveCount(0);
  await expect(page.getByTitle('Good report')).toHaveCount(0);

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

test('no aggregate "Votes" tile on the Insights stats page', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await installMockApi(page, { loggedIn: false });
  await page.goto('/?explore=insights');
  await expect(page.getByText('Loading…')).toHaveCount(0, { timeout: 10000 });

  await expect(page.getByText('Reports', { exact: true })).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Votes', { exact: true })).toHaveCount(0);

  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
});
