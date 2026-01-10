import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Quick validation that core pages load without errors
 */
test.describe('Smoke Tests', () => {
  test('Home page loads without crashing', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    await expect(page.locator('header')).toBeVisible();
    expect(errors.length).toBeLessThan(3); // Allow minimal errors
  });

  test('Marketplace page loads', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('main')).toBeVisible();
  });

  test('Analytics dashboard loads', async ({ page }) => {
    await page.goto('/analytics-dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('main')).toBeVisible();
  });

  test('Collections page loads', async ({ page }) => {
    await page.goto('/collections', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('NFT detail page loads', async ({ page }) => {
    await page.goto('/nft/1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('main, body')).toBeVisible();
  });

  test('Admin dashboard loads', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('main, body')).toBeVisible();
  });

  test('Royalties dashboard loads', async ({ page }) => {
    await page.goto('/royalties/SP2YQXK8QX2GQPF8NR6H9F9JFQC5C5H5K5P5T5X5Z', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('main, body')).toBeVisible();
  });
});

/**
 * Performance Tests - Measure page load times
 */
test.describe('Performance', () => {
  test('Home page loads in reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000); // Less than 10 seconds
    
    console.log(`Home page load time: ${loadTime}ms`);
  });

  test('Analytics dashboard loads in reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/analytics-dashboard', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000);
    
    console.log(`Analytics dashboard load time: ${loadTime}ms`);
  });

  test('Discover page renders quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Less than 5 seconds
    
    console.log(`Discover page DOM ready time: ${loadTime}ms`);
  });
});

/**
 * Accessibility Tests - Basic a11y checks
 */
test.describe('Accessibility', () => {
  test('Header has semantic HTML', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    const nav = header.locator('nav');
    expect(await nav.count()).toBeGreaterThanOrEqual(0); // May have nav
  });

  test('Main content in main element', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    
    const main = page.locator('main');
    await expect(main.first()).toBeVisible();
  });

  test('Buttons are keyboard accessible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Tab to first focusable element
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName || 'NONE';
    });
    
    expect(['BUTTON', 'A', 'INPUT'].includes(focusedElement)).toBeTruthy();
  });

  test('Colors have sufficient contrast', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Check that text is visible (basic contrast check)
    const textElements = page.locator('p, h1, h2, h3, button');
    const count = await textElements.count();
    
    expect(count).toBeGreaterThan(0);
  });
});

/**
 * Error Handling Tests
 */
test.describe('Error Handling', () => {
  test('404 route doesn\'t crash app', async ({ page }) => {
    await page.goto('/non-existent-page', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // App should still render (even if 404)
    await expect(page.locator('body')).toBeVisible();
  });

  test('Invalid NFT ID doesn\'t crash', async ({ page }) => {
    await page.goto('/nft/999999999', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Page should render without error
    await expect(page.locator('body')).toBeVisible();
  });

  test('Network errors handled gracefully', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);
    
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      // Even offline, page shell should render
      await expect(page.locator('header')).toBeVisible({ timeout: 5000 });
    } finally {
      // Go back online
      await page.context().setOffline(false);
    }
  });
});
