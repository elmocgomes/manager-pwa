import { test, expect } from '@playwright/test';

const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;

test.skip(!EMAIL || !PASSWORD, 'TEST_EMAIL and TEST_PASSWORD env vars required');

test('login → dashboard renders all section banners', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('email@example.com').fill(EMAIL!);
  await page.getByPlaceholder('password').fill(PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText('Manager Dashboard')).toBeVisible({ timeout: 15_000 });
  // Section banners (uppercase tracking) — assert each label exists
  for (const banner of ['Today', 'Bookings vs walk-ins', 'Drinks vs Dining', 'Labor cost ratio', 'Closing notes']) {
    await expect(page.getByText(banner, { exact: true })).toBeVisible();
  }
  // LIVE pill when day=0
  await expect(page.getByRole('status')).toContainText(/LIVE|CLOSED/);
});

test('day toggle switches to Yesterday and back', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('email@example.com').fill(EMAIL!);
  await page.getByPlaceholder('password').fill(PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Manager Dashboard')).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: /Yesterday/i }).click();
  await expect(page).toHaveURL(/[?&]d=1/);
  await expect(page.getByText('CLOSED')).toBeVisible();

  await page.getByRole('button', { name: /Today/i }).click();
  await expect(page).toHaveURL(/[?&]d=0/);
  await expect(page.getByText('LIVE')).toBeVisible();
});
