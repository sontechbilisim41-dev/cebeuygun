import { beforeAll, afterAll, vi } from 'vitest';

// Mock Redis client
const mockRedisClient = {
  connect: vi.fn(),
  get: vi.fn(),
  setEx: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  exists: vi.fn(),
  incr: vi.fn(),
  expire: vi.fn(),
  mGet: vi.fn(),
  quit: vi.fn(),
  on: vi.fn(),
};

// Mock PostgreSQL pool
const mockPgPool = {
  query: vi.fn(),
  connect: vi.fn(),
  end: vi.fn(),
};

beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = 'localhost';
  process.env.DB_NAME = 'test_promotion';
  process.env.REDIS_URL = 'redis://localhost:6379/1';
  
  // Mock external dependencies
  vi.mock('redis', () => ({
    createClient: vi.fn(() => mockRedisClient),
  }));
  
  vi.mock('pg', () => ({
    Pool: vi.fn(() => mockPgPool),
  }));
});

afterAll(() => {
  vi.clearAllMocks();
});