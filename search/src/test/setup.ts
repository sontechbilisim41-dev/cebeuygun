import { beforeAll, afterAll, vi } from 'vitest';

// Mock Elasticsearch client
const mockElasticsearchClient = {
  ping: vi.fn(),
  indices: {
    exists: vi.fn(),
    create: vi.fn(),
  },
  index: vi.fn(),
  delete: vi.fn(),
  search: vi.fn(),
  cluster: {
    health: vi.fn(),
  },
  info: vi.fn(),
};

// Mock Kafka client
const mockKafkaConsumer = {
  connect: vi.fn(),
  subscribe: vi.fn(),
  run: vi.fn(),
  disconnect: vi.fn(),
};

// Mock Redis client
const mockRedisClient = {
  connect: vi.fn(),
  get: vi.fn(),
  setEx: vi.fn(),
  on: vi.fn(),
};

beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.ELASTICSEARCH_URL = 'http://localhost:9200';
  process.env.KAFKA_BROKERS = 'localhost:9092';
  process.env.REDIS_URL = 'redis://localhost:6379';
  
  // Mock external dependencies
  vi.mock('@elastic/elasticsearch', () => ({
    Client: vi.fn(() => mockElasticsearchClient),
  }));
  
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

  vi.mock('redis', () => ({
    createClient: vi.fn(() => mockRedisClient),
  }));
});

afterAll(() => {
  vi.clearAllMocks();
});