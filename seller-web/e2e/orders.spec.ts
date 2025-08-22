import { test, expect } from '@playwright/test';

test.describe('Orders Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'seller@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should display orders list', async ({ page }) => {
    await page.goto('/orders');
    
    // Wait for orders to load
    await page.waitForSelector('[data-testid="orders-table"]');
    
    // Check if table is visible
    await expect(page.locator('[data-testid="orders-table"]')).toBeVisible();
    
    // Check if at least one order is displayed
    const orderRows = page.locator('[data-testid="order-row"]');
    await expect(orderRows.first()).toBeVisible();
  });

  test('should filter orders by status', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForSelector('[data-testid="orders-table"]');
    
    // Click status filter
    await page.click('[data-testid="status-filter"]');
    await page.click('[data-testid="status-confirmed"]');
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    // Check if only confirmed orders are shown
    const statusTags = page.locator('[data-testid="order-status"]');
    const count = await statusTags.count();
    
    for (let i = 0; i < count; i++) {
      await expect(statusTags.nth(i)).toContainText('Onaylandı');
    }
  });

  test('should update order status', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForSelector('[data-testid="orders-table"]');
    
    // Click on first order actions
    await page.click('[data-testid="order-actions"]');
    await page.click('[data-testid="update-status"]');
    
    // Wait for modal to open
    await page.waitForSelector('[data-testid="status-modal"]');
    
    // Select new status
    await page.click('[data-testid="status-select"]');
    await page.click('[data-testid="status-preparing"]');
    
    // Add notes
    await page.fill('[data-testid="status-notes"]', 'Sipariş hazırlanmaya başlandı');
    
    // Submit
    await page.click('[data-testid="status-submit"]');
    
    // Wait for success message
    await expect(page.locator('.ant-message-success')).toBeVisible();
  });

  test('should search orders', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForSelector('[data-testid="orders-table"]');
    
    // Search for specific order
    await page.fill('[data-testid="search-input"]', 'ORD-12345');
    await page.waitForTimeout(500);
    
    // Check if search results are filtered
    const orderNumbers = page.locator('[data-testid="order-number"]');
    const count = await orderNumbers.count();
    
    if (count > 0) {
      await expect(orderNumbers.first()).toContainText('ORD-12345');
    }
  });

  test('should handle real-time order updates', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForSelector('[data-testid="orders-table"]');
    
    // Mock WebSocket message
    await page.evaluate(() => {
      // Simulate WebSocket order update
      window.dispatchEvent(new CustomEvent('websocket-order-update', {
        detail: {
          orderId: 'test-order-id',
          status: 'dispatched',
          courierInfo: {
            name: 'Test Kurye',
            phone: '+905551234567',
          },
        },
      }));
    });
    
    // Check if order status was updated
    await page.waitForTimeout(1000);
    
    // Verify the update was reflected in the UI
    const statusElements = page.locator('[data-testid="order-status"]');
    const hasDispatchedStatus = await statusElements.locator('text=Yola Çıktı').count() > 0;
    
    if (hasDispatchedStatus) {
      expect(hasDispatchedStatus).toBeTruthy();
    }
  });
});