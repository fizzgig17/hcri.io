// tests/flicker.spec.js
//
// Flicker readings: the Explore > Flicker tab (list, select, compare, a reading's own page),
// and the flicker section near the bottom of a report. The backend is mocked (see mockApi.js).

import { test, expect } from '@playwright/test';
import { installMockApi } from './mockApi.js';
import { captureConsoleErrors } from './helpers.js';
import { fixtures } from './fixtures.js';

async function openFlickerTab(page) {
  await installMockApi(page, { loggedIn: true });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/?explore=flicker');
  await expect(page.getByRole('heading', { name: 'Flicker readings' })).toBeVisible({ timeout: 10000 });
}

test('flicker tab lists readings and filters attached / standalone', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await openFlickerTab(page);
  await expect(page.getByText('Warm LED bulb - no dimming')).toBeVisible();
  await expect(page.getByText('Incandescent 60W')).toBeVisible();
  await page.getByRole('button', { name: 'Standalone', exact: true }).click();
  await expect(page.getByText('Warm LED bulb - no dimming')).toHaveCount(0);
  await expect(page.getByText('Flicker-free panel')).toBeVisible();
  await page.getByRole('button', { name: 'On a report', exact: true }).click();
  await expect(page.getByText('Incandescent 60W')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('select two readings and compare: table, overlay and risk chart', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await openFlickerTab(page);
  const boxes = page.getByTitle('Select to compare');
  await boxes.nth(0).check();
  await expect(page.getByRole('button', { name: 'Compare →' })).toBeDisabled();
  await boxes.nth(2).check();
  await page.getByRole('button', { name: 'Compare →' }).click();
  await expect(page.getByText('Compare flicker')).toBeVisible();
  await expect(page.getByRole('img', { name: 'Flicker waveforms overlaid' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Flicker risk chart' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '120 Hz' }).first()).toBeVisible();
  await page.screenshot({ path: 'test-results/flicker-compare.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('a reading has its own page: edit the title, back button returns to the list', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await openFlickerTab(page);
  await page.getByText('Incandescent 60W').click();
  await expect(page).toHaveURL(/fid=3/);
  await expect(page.getByRole('img', { name: /Flicker waveform for Incandescent 60W/ })).toBeVisible();
  await expect(page.getByText('Not attached to a report.')).toBeVisible();
  await page.screenshot({ path: 'test-results/flicker-detail.png', fullPage: true });
  await page.getByRole('heading', { name: /Incandescent 60W/ }).click();
  const input = page.locator('input').first();
  await input.fill('Bedside lamp');
  await input.press('Enter');
  await expect(page.getByRole('heading', { name: /Bedside lamp/ })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Flicker readings' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('attach a standalone reading to a report from its page', async ({ page }) => {
  await openFlickerTab(page);
  await page.getByText('Flicker-free panel').click();
  await page.getByRole('button', { name: 'Attach to a report…' }).click();
  await page.getByText('HT70 #1').click();
  await expect(page.getByText(/Attached to/)).toBeVisible();
});

test('a report shows its flicker readings compared near the bottom', async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await installMockApi(page, { loggedIn: true });
  await page.addInitScript(() => localStorage.setItem('spd_token', 'mock-token'));
  await page.goto('/?explore=mine');
  await page.getByText('HT70 #1').first().click();
  const section = page.getByTestId('flicker-section');
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByText(/2 readings/)).toBeVisible();
  await expect(section.getByRole('img', { name: 'Flicker waveforms overlaid' })).toBeVisible();
  await expect(section.getByRole('img', { name: 'Flicker risk chart' })).toBeVisible();
  await expect(section.getByRole('button', { name: '＋ Attach flicker' })).toBeVisible();
  await section.screenshot({ path: 'test-results/flicker-report-section.png' });
  expect(errors).toEqual([]);
});

test('a report with no flicker shows no section to other viewers', async ({ page }) => {
  await installMockApi(page, { loggedIn: false, flicker: [] });
  await page.goto('/?explore');
  const label = fixtures.explore.reports[0].label;
  await page.getByText(label).first().click();
  await expect(page.getByRole('button', { name: '← Back to Explore' })).toBeVisible({ timeout: 10000 });
  await expect(page.getByTestId('flicker-section')).toHaveCount(0);
});
