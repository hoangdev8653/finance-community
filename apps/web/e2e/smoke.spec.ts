import { test, expect } from '@playwright/test';

test.describe('public web smoke tests', () => {
  test('home page renders without horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);

    const overflowing = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflowing).toBe(false);
  });

  test('login page is reachable on mobile', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input').first()).toBeVisible();
  });
});
