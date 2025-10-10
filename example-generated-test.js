// Example of generated Playwright code from the RecordingService

import { test, expect } from '@playwright/test';

test('recorded test', async ({ page }) => {
  await page.goto('https://example.com');
  await page.click('#header-search');
  await page.fill('#search-input', 'Playwright testing');
  await page.click('button[type="submit"]');
  await page.click('a.result-link:nth-of-type(1)');
  // Navigate to https://docs.playwright.dev
});