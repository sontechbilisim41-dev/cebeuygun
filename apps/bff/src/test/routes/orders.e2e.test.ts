import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../e2e-setup';
import jwt from 'jsonwebtoken';

describe('Orders API E2E Tests', () => {
  let customerToken: string;
  let sellerToken: string;
  let courierToken: string;
  
  const mockCustomer = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    role: 'CUSTOMER',
  };
  
  const mockSeller = {
    userId: '123e4567-e89b-12d3-a456-426614174001',
    role: 'SELLER',
  };
  
  const mockCourier = {
    userId: '123e4567-e89b-12d3-a456-426614174002',
    role: 'COURIER',
  };

  const mockOrder = {
    id: '123e4567-e89b-12d3-a456-426614174010',
    customerId: mockCustomer.userId,
    sellerId: mockSeller.userId,
    status: 'confirmed',
    items: [
      {
        productId: '123e4567-e89b-12d3-a456-426614174001',
        productName: 'Test Product',
        quantity: 2,
        price: { currency: 'TRY', amount: 2500 },
      },
    ],
    totalAmount: { currency: 'TRY', amount: 5000 },
    deliveryAddress: {
      latitude: 41.0082,
      longitude: 28.9784,
      address: 'Test Address 123',
      city: 'Istanbul',
      district: 'Beyoğlu',
    },
    estimatedDeliveryTime: new Date(Date.now() + 1800000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    customerToken = jwt.sign(mockCustomer, process.env.JWT_SECRET!, { expiresIn: '1h' });
    sellerToken = jwt.sign(mockSeller, process.env.JWT_SECRET!, { expiresIn: '1h' });
    courierToken = jwt.sign(mockCourier, process.env.JWT_SECRET!, { expiresIn: '1h' });
    
    // Mock service responses
    vi.mocked(app.services.order.get).mockImplementation((path) => {
      if (path.includes('/orders/')) {
        return Promise.resolve({
          success: true,
          data: mockOrder,
        });
      }
      if (path === '/orders') {
        return Promise.resolve({
          success: true,
          data: {
            orders: [mockOrder],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              totalPages: 1,
            },
          },
        });
      }
      return Promise.resolve({ success: true, data: null });
    });

    vi.mocked(app.services.order.patch).mockResolvedValue({
      success: true,
      data: { ...mockOrder, status: 'preparing' },
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return order details for customer', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/orders/${mockOrder.id}`,
        headers: {
          authorization: `Bearer ${customerToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id', mockOrder.id);
      expect(body.data).toHaveProperty('customerId', mockCustomer.userId);
      expect(body.data).toHaveProperty('status', 'confirmed');
    });

    it('should return order details for seller', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/orders/${mockOrder.id}`,
        headers: {
          authorization: `Bearer ${sellerToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id', mockOrder.id);
    });

    it('should deny access to unauthorized customer', async () => {
      const unauthorizedCustomer = jwt.sign(
        { userId: 'different-user-id', role: 'CUSTOMER' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      const response = await app.inject({
        method: 'GET',
        url: `/api/orders/${mockOrder.id}`,
        headers: {
          authorization: `Bearer ${unauthorizedCustomer}`,
        },
      });

      expect(response.statusCode).toBe(403);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Access denied');
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/orders/${mockOrder.id}`,
      });

      expect(response.statusCode).toBe(401);
    });

    it('should handle invalid order ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/orders/invalid-uuid',
        headers: {
          authorization: `Bearer ${customerToken}`,
        },
      });

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Validation Error');
    });

    it('should handle order not found', async () => {
      vi.mocked(app.services.order.get).mockRejectedValue(new Error('Order not found'));

      const response = await app.inject({
        method: 'GET',
        url: `/api/orders/${mockOrder.id}`,
        headers: {
          authorization: `Bearer ${customerToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Order not found');
    });
  });

  describe('GET /api/orders', () => {
    it('should return orders list for customer', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/orders',
        headers: {
          authorization: `Bearer ${customerToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.pagination).toHaveProperty('total', 1);
    });

    it('should handle pagination parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/orders?page=2&limit=10',
        headers: {
          authorization: `Bearer ${customerToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should handle status filter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/orders?status=confirmed',
        headers: {
          authorization: `Bearer ${customerToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should validate query parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/orders?page=0&limit=invalid',
        headers: {
          authorization: `Bearer ${customerToken}`,
        },
      });

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Validation Error');
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('should allow seller to update order status', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/orders/${mockOrder.id}/status`,
        headers: {
          authorization: `Bearer ${sellerToken}`,
          'content-type': 'application/json',
        },
        payload: {
          status: 'preparing',
          notes: 'Started preparation',
        },
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('status', 'preparing');
    });

    it('should allow courier to update order status', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/orders/${mockOrder.id}/status`,
        headers: {
          authorization: `Bearer ${courierToken}`,
          'content-type': 'application/json',
        },
        payload: {
          status: 'dispatched',
          notes: 'On the way',
        },
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should deny access to customers', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/orders/${mockOrder.id}/status`,
        headers: {
          authorization: `Bearer ${customerToken}`,
          'content-type': 'application/json',
        },
        payload: {
          status: 'cancelled',
        },
      });

      expect(response.statusCode).toBe(403);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Access denied');
    });

    it('should validate status values', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/orders/${mockOrder.id}/status`,
        headers: {
          authorization: `Bearer ${sellerToken}`,
          'content-type': 'application/json',
        },
        payload: {
          status: 'invalid_status',
        },
      });

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Validation Error');
    });

    it('should handle service update failure', async () => {
      vi.mocked(app.services.order.patch).mockResolvedValue({
        success: false,
        message: 'Status update failed',
      });

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/orders/${mockOrder.id}/status`,
        headers: {
          authorization: `Bearer ${sellerToken}`,
          'content-type': 'application/json',
        },
        payload: {
          status: 'preparing',
        },
      });

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Status update failed');
    });
  });
});