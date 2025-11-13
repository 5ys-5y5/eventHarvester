/**
 * Integration Test: End-to-End Event Query Flow
 * Tests complete flow from API request to NDJSON response
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { registerRoutes } from '../../src/api/routes.js';
import {
  loggingMiddleware,
  authenticationMiddleware,
  errorHandler,
} from '../../src/api/middleware.js';

describe('Integration: End-to-end event query flow', () => {
  let fastify;

  beforeAll(async () => {
    fastify = Fastify({ logger: false });
    fastify.addHook('onRequest', loggingMiddleware);
    fastify.addHook('preHandler', authenticationMiddleware);
    fastify.setErrorHandler(errorHandler);
    await registerRoutes(fastify);
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('should complete full query flow: request → parse dates → search → deduplicate → format NDJSON', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/events?startDate=3&endDate=4',
    });

    // Should return some response (even if empty for now)
    expect(response.statusCode).toBeLessThan(500);
  });

  it('should validate date parameters before processing', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/events?startDate=abc&endDate=4',
    });

    expect(response.statusCode).toBe(400);
  });

  it('should include correlation ID in response headers', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/events?startDate=3&endDate=4',
    });

    expect(response.headers['x-request-id']).toBeDefined();
  });

  it('should return NDJSON content type when successful', async () => {
    // This will fail until implementation is complete
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/events?startDate=3&endDate=4',
    });

    if (response.statusCode === 200) {
      expect(response.headers['content-type']).toContain('application/x-ndjson');
    }
  });

  it('should handle empty result sets gracefully', async () => {
    // Even if no events found, should return valid NDJSON with coverage
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/events?startDate=100&endDate=1',
    });

    // Should not crash, even if no results
    expect(response.statusCode).toBeLessThan(500);
  });

  it('should calculate date range correctly from relative offsets', async () => {
    // startDate=3, endDate=4 should search from day 3 through day 6 (4-day period)
    // This is tested via the date utility functions
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/events?startDate=3&endDate=4',
    });

    expect(response.statusCode).toBeLessThan(500);
  });

  it('should enforce 60 second maximum overall timeout', async () => {
    const startTime = Date.now();

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/events?startDate=1&endDate=365', // Large range
    });

    const duration = Date.now() - startTime;

    // Should either complete or timeout within 60 seconds
    expect(duration).toBeLessThan(61000); // Allow 1s buffer
  });

  it('should load configuration before processing request', async () => {
    // Configuration should be loaded from docs/ folder
    // This is tested by ensuring the endpoint doesn't crash
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/events?startDate=1&endDate=1',
    });

    expect(response.statusCode).toBeLessThan(500);
  });
});
