import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../e2e-setup';
import jwt from 'jsonwebtoken';

describe('Checkout API E2E Tests', () => {
  let authToken: string;
  let mockUser = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    role: 'CUSTOMER',
  };

  const validCheckoutData = {
    items: [
      {
        productId: '123e4567-e89b-12d3-a456-426614174001',
        quantity: 2,
        notes: 'Extra spicy',
      },
    ],
    deliveryAddress: {
      latitude: 41.0082,
      longitude: 28.9784,
      address: 'Test Address 123',
      city: 'Istanbul',
      district: 'Beyoğlu',
    },
    paymentMethodId: 'pm_test_123',
    couponCode: 'SAVE20',
    notes: 'Please ring the bell',
  };

  beforeEach(() => {
    authToken = jwt.sign(mockUser, process.env.JWT_SECRET!, { expiresIn: '1h' });
    
    // Mock successful service responses
    vi.mocked(app.services.catalog.post).mockResolvedValue({
      success: true,
      data: { valid: true },
    });

    vi.mocked(app.services.pricing.post).mockResolvedValue({
      success: true,
      data: {
        totalAmount: { currency: 'TRY', amount: 5000 },
        subtotal: { currency: 'TRY', amount: 4000 },
        deliveryFee: { currency: 'TRY', amount: 800 },
        taxes: { currency: 'TRY', amount: 200 },
        discounts: { currency: 'TRY', amount: 0 },
      },
    });

    vi.mocked(app.services.inventory.post).mockResolvedValue({
      success: true,
      data: { available: true },
    });

    vi.mocked(app.services.order.post).mockImplementation((path) => {
      if (path === '/orders') {
        return Promise.resolve({
          success: true,
          data: {
            id: '123e4567-e89b-12d3-a456-426614174010',
            status: 'pending',
            estimatedDeliveryTime: 30,
          },
        });
      }
      if (path === '/payments/process') {
        return Promise.resolve({
          success: true,
          data: { status: 'completed' },
        });
      }
      return Promise.resolve({ success: true, data: {} });
    });
  });

  it('should process checkout successfully', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/checkout',
      headers: {
        authorization: `Bearer ${authToken}`,
        'content-type': 'application/json',
      },
      payload: validCheckoutData,
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('orderId');
    expect(body.data).toHaveProperty('totalAmount');
    expect(body.data).toHaveProperty('estimatedDeliveryTime');
    expect(body.data).toHaveProperty('paymentStatus');
    
    expect(body.data.orderId).toBe('123e4567-e89b-12d3-a456-426614174010');
    expect(body.data.paymentStatus).toBe('completed');
  });

  it('should require authentication', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/checkout',
      headers: {
        'content-type': 'application/json',
      },
      payload: validCheckoutData,
    });

    expect(response.statusCode).toBe(401);
    
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Authentication Required');
  });

  it('should validate request body', async () => {
    const invalidData = {
      items: [], // Empty items array should fail validation
      deliveryAddress: {
        latitude: 41.0082,
        longitude: 28.9784,
        address: 'Test Address',
        city: 'Istanbul',
        district: 'Beyoğlu',
      },
      paymentMethodId: 'pm_test_123',
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/checkout',
      headers: {
        authorization: `Bearer ${authToken}`,
        'content-type': 'application/json',
      },
      payload: invalidData,
    });

    expect(response.statusCode).toBe(400);
    
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Validation Error');
  });

  it('should handle product validation failure', async () => {
    vi.mocked(app.services.catalog.post).mockRejectedValue(new Error('Product not found'));

    const response = await app.inject({
      method: 'POST',
      url: '/api/checkout',
      headers: {
        authorization: `Bearer ${authToken}`,
        'content-type': 'application/json',
      },
      payload: validCheckoutData,
    });

    expect(response.statusCode).toBe(400);
    
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Product validation failed');
  });

  it('should handle inventory check failure', async () => {
    vi.mocked(app.services.inventory.post).mockRejectedValue(new Error('Out of stock'));

    const response = await app.inject({
      method: 'POST',
      url: '/api/checkout',
      headers: {
        authorization: `Bearer ${authToken}`,
        'content-type': 'application/json',
      },
      payload: validCheckoutData,
    });

    expect(response.statusCode).toBe(400);
    
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Inventory check failed');
  });

  it('should handle pricing calculation failure', async () => {
    vi.mocked(app.services.pricing.post).mockRejectedValue(new Error('Pricing service unavailable'));

    const response = await app.inject({
      method: 'POST',
      url: '/api/checkout',
      headers: {
        authorization: `Bearer ${authToken}`,
        'content-type': 'application/json',
      },
      payload: validCheckoutData,
    });

    expect(response.statusCode).toBe(400);
    
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Pricing calculation failed');
  });

  it('should process checkout without payment method', async () => {
    const dataWithoutPayment = { ...validCheckoutData };
    delete dataWithoutPayment.paymentMethodId;

    const response = await app.inject({
      method: 'POST',
      url: '/api/checkout',
      headers: {
        authorization: `Bearer ${authToken}`,
        'content-type': 'application/json',
      },
      payload: dataWithoutPayment,
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.data.paymentStatus).toBe('pending');
  });

  it('should handle order creation failure', async () => {
    vi.mocked(app.services.order.post).mockImplementation((path) => {
      if (path === '/orders') {
        return Promise.resolve({
          success: false,
          message: 'Order creation failed',
        });
      }
      return Promise.resolve({ success: true, data: {} });
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/checkout',
      headers: {
        authorization: `Bearer ${authToken}`,
        'content-type': 'application/json',
      },
      payload: validCheckoutData,
    });

    expect(response.statusCode).toBe(400);
    
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Order creation failed');
  });
});