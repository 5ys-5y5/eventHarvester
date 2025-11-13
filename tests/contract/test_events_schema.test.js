/**
 * Contract Test: GET /api/v1/events Schema Validation
 * Ensures API response conforms to the outputSchema specification
 */

import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { registerRoutes } from '../../src/api/routes.js';
import { loggingMiddleware } from '../../src/api/middleware.js';

describe('Contract: GET /api/v1/events schema validation', () => {
  it('should return NDJSON format with correct content-type header', async () => {
    const fastify = Fastify();
    fastify.addHook('onRequest', loggingMiddleware);
    await registerRoutes(fastify);

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/events?startDate=3&endDate=4',
      headers: {
        'X-API-Key': 'test-key',
      },
    });

    expect(response.headers['content-type']).toContain('application/x-ndjson');
  });

  it('should validate startDate parameter is required', async () => {
    const fastify = Fastify();
    fastify.addHook('onRequest', loggingMiddleware);
    await registerRoutes(fastify);

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/events?endDate=4',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toHaveProperty('error');
  });

  it('should validate endDate parameter is required', async () => {
    const fastify = Fastify();
    fastify.addHook('onRequest', loggingMiddleware);
    await registerRoutes(fastify);

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/events?startDate=3',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toHaveProperty('error');
  });

  it('should validate startDate is positive integer (1-365)', async () => {
    const fastify = Fastify();
    fastify.addHook('onRequest', loggingMiddleware);
    await registerRoutes(fastify);

    const invalidValues = [0, -1, 366, 'abc', 3.5];

    for (const value of invalidValues) {
      const response = await fastify.inject({
        method: 'GET',
        url: `/api/v1/events?startDate=${value}&endDate=4`,
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
    }
  });

  it('should validate endDate is positive integer (1-365)', async () => {
    const fastify = Fastify();
    fastify.addHook('onRequest', loggingMiddleware);
    await registerRoutes(fastify);

    const invalidValues = [0, -1, 366, 'xyz', 4.2];

    for (const value of invalidValues) {
      const response = await fastify.inject({
        method: 'GET',
        url: `/api/v1/events?startDate=3&endDate=${value}`,
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
    }
  });

  it('should include X-Request-ID header in response', async () => {
    const fastify = Fastify();
    fastify.addHook('onRequest', loggingMiddleware);
    await registerRoutes(fastify);

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/events?startDate=3&endDate=4',
    });

    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });
});
