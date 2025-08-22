import { beforeAll, afterAll, vi } from 'vitest';

// Mock PostgreSQL pool
const mockPgPool = {
  query: vi.fn(),
  connect: vi.fn(),
  end: vi.fn(),
};

// Mock Kafka
const mockKafkaConsumer = {
  connect: vi.fn(),
  subscribe: vi.fn(),
  run: vi.fn(),
  disconnect: vi.fn(),
};

const mockKafkaProducer = {
  connect: vi.fn(),
  send: vi.fn(),
  disconnect: vi.fn(),
};

// Mock Puppeteer
const mockPuppeteer = {
  launch: vi.fn(() => ({
    newPage: vi.fn(() => ({
      setContent: vi.fn(),
      pdf: vi.fn(),
    })),
    close: vi.fn(),
  })),
};

beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = 'localhost';
  process.env.DB_NAME = 'test_earnings';
  process.env.KAFKA_BROKERS = 'localhost:9092';
  
  // Mock external dependencies
  vi.mock('pg', () => ({
    Pool: vi.fn(() => mockPgPool),
  }));
  
  vi.mock('kafkajs', () => ({
    Kafka: vi.fn(() => ({
      consumer: vi.fn(() => mockKafkaConsumer),
      producer: vi.fn(() => mockKafkaProducer),
      admin: vi.fn(() => ({
        connect: vi.fn(),
        fetchTopicMetadata: vi.fn(),
        disconnect: vi.fn(),
      })),
    })),
  }));

  vi.mock('puppeteer', () => ({
    default: mockPuppeteer,
  }));
});

afterAll(() => {
  vi.clearAllMocks();
});