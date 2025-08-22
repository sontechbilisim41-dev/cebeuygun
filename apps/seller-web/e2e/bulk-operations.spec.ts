import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Bulk Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'seller@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should upload CSV file for products', async ({ page }) => {
    await page.goto('/bulk-operations');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="bulk-operations-tabs"]');
    
    // Click on products tab
    await page.click('[data-testid="products-tab"]');
    
    // Download template first
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-template"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('products_template.csv');
    
    // Upload CSV file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'products.csv'));
    
    // Wait for upload to complete
    await page.waitForSelector('[data-testid="upload-success"]', { timeout: 30000 });
    
    // Check if operation appears in operations list
    await page.click('[data-testid="operations-tab"]');
    await expect(page.locator('[data-testid="operation-row"]').first()).toBeVisible();
  });

  test('should show upload progress', async ({ page }) => {
    await page.goto('/bulk-operations');
    await page.click('[data-testid="inventory-tab"]');
    
    // Mock large file upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'large-inventory.csv'));
    
    // Check if progress bar appears
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
    
    // Wait for completion
    await page.waitForSelector('[data-testid="upload-complete"]', { timeout: 60000 });
  });

  test('should handle upload errors gracefully', async ({ page }) => {
    await page.goto('/bulk-operations');
    await page.click('[data-testid="products-tab"]');
    
    // Upload invalid CSV file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'invalid.csv'));
    
    // Check if error message appears
    await expect(page.locator('.ant-message-error')).toBeVisible();
  });

  test('should display operation results and errors', async ({ page }) => {
    await page.goto('/bulk-operations');
    await page.click('[data-testid="operations-tab"]');
    
    // Wait for operations to load
    await page.waitForSelector('[data-testid="operations-table"]');
    
    // Click on an operation with errors
    const errorButton = page.locator('[data-testid="view-errors"]').first();
    if (await errorButton.isVisible()) {
      await errorButton.click();
      
      // Check if error modal opens
      await expect(page.locator('[data-testid="error-modal"]')).toBeVisible();
      
      // Check if error details are shown
      await expect(page.locator('[data-testid="error-list"]')).toBeVisible();
    }
  });

  test('should retry failed operations', async ({ page }) => {
    await page.goto('/bulk-operations');
    await page.click('[data-testid="operations-tab"]');
    
    // Wait for operations to load
    await page.waitForSelector('[data-testid="operations-table"]');
    
    // Click retry on a failed operation
    const retryButton = page.locator('[data-testid="retry-operation"]').first();
    if (await retryButton.isVisible()) {
      await retryButton.click();
      
      // Check if operation status changes to processing
      await expect(page.locator('[data-testid="operation-status"]').first()).toContainText('İşleniyor');
    }
  });
});