import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../e2e-setup';
import jwt from 'jsonwebtoken';

describe('Feed API E2E Tests', () => {
  let authToken: string;
  let mockUser = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    role: 'CUSTOMER',
  };

  beforeEach(() => {
    // Generate test JWT token
    authToken = jwt.sign(mockUser, process.env.JWT_SECRET!, { expiresIn: '1h' });
    
    // Mock service responses
    vi.mocked(app.services.catalog.get).mockResolvedValue({
      success: true,
      data: {
        products: [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Test Product',
            description: 'Test Description',
            price: { currency: 'TRY', amount: 2500 },
            imageUrl: 'https://example.com/image.jpg',
            rating: 4.5,
            reviewCount: 10,
            sellerId: '123e4567-e89b-12d3-a456-426614174002',
            sellerName: 'Test Seller',
            categoryId: '123e4567-e89b-12d3-a456-426614174003',
            isAvailable: true,
            preparationTime: 15,
            tags: ['fast', 'popular'],
          },
        ],
        categories: [
          {
            id: '123e4567-e89b-12d3-a456-426614174003',
            name: 'Test Category',
            imageUrl: 'https://example.com/category.jpg',
            productCount: 5,
          },
        ],
      },
    });

    vi.mocked(app.services.promotion.get).mockResolvedValue({
      success: true,
      data: {
        campaigns: [
          {
            id: '123e4567-e89b-12d3-a456-426614174004',
            title: 'Test Campaign',
            description: 'Test Campaign Description',
            imageUrl: 'https://example.com/campaign.jpg',
            discountPercentage: 20,
            validUntil: new Date(Date.now() + 86400000).toISOString(),
            productIds: ['123e4567-e89b-12d3-a456-426614174001'],
          },
        ],
      },
    });

    vi.mocked(app.services.pricing.get).mockResolvedValue({
      success: true,
      data: {},
    });

    vi.mocked(app.services.inventory.get).mockResolvedValue({
      success: true,
      data: {},
    });
  });

  it('should return feed data successfully', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/feed',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('featuredProducts');
    expect(body.data).toHaveProperty('campaigns');
    expect(body.data).toHaveProperty('categories');
    expect(body.data).toHaveProperty('nearbyProducts');
    
    expect(body.data.featuredProducts).toHaveLength(1);
    expect(body.data.campaigns).toHaveLength(1);
    expect(body.data.categories).toHaveLength(1);
  });

  it('should require authentication', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/feed',
    });

    expect(response.statusCode).toBe(401);
    
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Authentication Required');
  });

  it('should handle service failures gracefully', async () => {
    // Mock service failure
    vi.mocked(app.services.catalog.get).mockRejectedValue(new Error('Service unavailable'));

    const response = await app.inject({
      method: 'GET',
      url: '/api/feed',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.data.featuredProducts).toHaveLength(0);
  });

  it('should validate query parameters', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/feed?limit=invalid',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.statusCode).toBe(400);
    
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Validation Error');
  });

  it('should handle location-based queries', async () => {
    const location = {
      latitude: 41.0082,
      longitude: 28.9784,
      address: 'Test Address',
      city: 'Istanbul',
      district: 'Beyoğlu',
    };

    vi.mocked(app.services.catalog.post).mockResolvedValue({
      success: true,
      data: {
        products: [
          {
            id: '123e4567-e89b-12d3-a456-426614174005',
            name: 'Nearby Product',
            description: 'Nearby Description',
            price: { currency: 'TRY', amount: 1500 },
            imageUrl: 'https://example.com/nearby.jpg',
            rating: 4.0,
            reviewCount: 5,
            sellerId: '123e4567-e89b-12d3-a456-426614174002',
            sellerName: 'Nearby Seller',
            categoryId: '123e4567-e89b-12d3-a456-426614174003',
            isAvailable: true,
            preparationTime: 10,
            tags: ['nearby'],
          },
        ],
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/feed?location=${encodeURIComponent(JSON.stringify(location))}`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.data.nearbyProducts).toHaveLength(1);
    expect(body.data.nearbyProducts[0].name).toBe('Nearby Product');
  });
});