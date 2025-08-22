import { beforeAll, afterAll, beforeEach } from 'vitest';
import { buildApp } from '@/server';
import { FastifyInstance } from 'fastify';

let app: FastifyInstance;

beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.REDIS_URL = 'redis://localhost:6379/1'; // Use test database
  
  // Build the application
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  if (app) {
    await app.close();
  }
});

beforeEach(() => {
  // Clear any mocks between tests
  vi.clearAllMocks();
});

export { app };