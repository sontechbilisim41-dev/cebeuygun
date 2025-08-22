import { beforeAll, afterAll, vi } from 'vitest';

// Mock PostgreSQL pool
const mockPgPool = {
  query: vi.fn(),
  connect: vi.fn(),
  end: vi.fn(),
};

// Mock Redis client
const mockRedisClient = {
  connect: vi.fn(),
  get: vi.fn(),
  setEx: vi.fn(),
  publish: vi.fn(),
  subscribe: vi.fn(),
  quit: vi.fn(),
  on: vi.fn(),
};

// Mock Kafka
const mockKafkaConsumer = {
  connect: vi.fn(),
  subscribe: vi.fn(),
  run: vi.fn(),
  disconnect: vi.fn(),
};

// Mock Bull queue
const mockBullQueue = {
  add: vi.fn(),
  process: vi.fn(),
  getWaiting: vi.fn(() => []),
  getActive: vi.fn(() => []),
  getCompleted: vi.fn(() => []),
  getFailed: vi.fn(() => []),
  clean: vi.fn(),
  close: vi.fn(),
  on: vi.fn(),
};

// Mock Firebase Admin
const mockFirebaseAdmin = {
  initializeApp: vi.fn(),
  messaging: vi.fn(() => ({
    sendMulticast: vi.fn(() => ({
      successCount: 1,
      failureCount: 0,
      responses: [{ messageId: 'mock-message-id' }],
    })),
  })),
  credential: {
    cert: vi.fn(),
  },
};

beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = 'localhost';
  process.env.DB_NAME = 'test_notification';
  process.env.REDIS_URL = 'redis://localhost:6379/1';
  process.env.KAFKA_BROKERS = 'localhost:9092';
  
  // Mock external dependencies
  vi.mock('pg', () => ({
    Pool: vi.fn(() => mockPgPool),
  }));
  
  vi.mock('ioredis', () => vi.fn(() => mockRedisClient));
  
  vi.mock('kafkajs', () => ({
    Kafka: vi.fn(() => ({
      consumer: vi.fn(() => mockKafkaConsumer),
      admin: vi.fn(() => ({
        connect: vi.fn(),
        fetchTopicMetadata: vi.fn(),
        disconnect: vi.fn(),
      })),
    })),
  }));

  vi.mock('bull', () => vi.fn(() => mockBullQueue));

  vi.mock('firebase-admin', () => mockFirebaseAdmin);

  vi.mock('twilio', () => ({
    Twilio: vi.fn(() => ({
      messages: {
        create: vi.fn(() => ({
          sid: 'mock-sms-id',
        })),
      },
    })),
  }));

  vi.mock('@sendgrid/mail', () => ({
    setApiKey: vi.fn(),
    send: vi.fn(() => [{ headers: { 'x-message-id': 'mock-email-id' } }]),
  }));
});

afterAll(() => {
  vi.clearAllMocks();
});