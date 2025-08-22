import { beforeAll, afterAll, vi } from 'vitest';

// Mock Redis client
const mockRedisClient = {
  connect: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  incr: vi.fn(),
  incrByFloat: vi.fn(),
  expire: vi.fn(),
  exists: vi.fn(),
  quit: vi.fn(),
  on: vi.fn(),
};

// Mock Kafka producer
const mockKafkaProducer = {
  connect: vi.fn(),
  send: vi.fn(),
  disconnect: vi.fn(),
};

// Mock Stripe
const mockStripe = {
  paymentIntents: {
    create: vi.fn(),
    confirm: vi.fn(),
    retrieve: vi.fn(),
  },
  paymentMethods: {
    create: vi.fn(),
  },
  refunds: {
    create: vi.fn(),
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
};

beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.ENCRYPTION_KEY = 'test-32-char-encryption-key-here';
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';
  
  // Mock external dependencies
  vi.mock('redis', () => ({
    createClient: vi.fn(() => mockRedisClient),
  }));
  
  vi.mock('kafkajs', () => ({
    Kafka: vi.fn(() => ({
      producer: vi.fn(() => mockKafkaProducer),
      admin: vi.fn(() => ({
        connect: vi.fn(),
        fetchTopicMetadata: vi.fn(),
        disconnect: vi.fn(),
      })),
    })),
  }));

  vi.mock('stripe', () => ({
    default: vi.fn(() => mockStripe),
  }));
});

afterAll(() => {
  vi.clearAllMocks();
});