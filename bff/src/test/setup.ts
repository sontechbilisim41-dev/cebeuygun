import { beforeAll, afterAll } from 'vitest';
import { config } from '@/config/index';

// Mock Redis client
const mockRedisClient = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  exists: vi.fn(),
  expire: vi.fn(),
  incr: vi.fn(),
  decr: vi.fn(),
  hget: vi.fn(),
  hset: vi.fn(),
  hdel: vi.fn(),
  sadd: vi.fn(),
  srem: vi.fn(),
  smembers: vi.fn(),
  quit: vi.fn(),
};

// Mock service clients
const mockServiceClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

// Mock Socket.IO
const mockSocketIO = {
  to: vi.fn().mockReturnThis(),
  emit: vi.fn(),
  on: vi.fn(),
  use: vi.fn(),
  join: vi.fn(),
  leave: vi.fn(),
};

beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  
  // Mock external dependencies
  vi.mock('redis', () => ({
    createClient: () => mockRedisClient,
  }));
  
  vi.mock('socket.io', () => ({
    Server: vi.fn(() => mockSocketIO),
  }));
});

afterAll(() => {
  vi.clearAllMocks();
});