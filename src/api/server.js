#!/usr/bin/env node

/**
 * Fastify Server
 * Main server entry point
 */

import Fastify from 'fastify';
import { registerRoutes } from './routes.js';
import {
  authenticationMiddleware,
  loggingMiddleware,
  errorHandler,
  notFoundHandler,
} from './middleware.js';
import { getConfigurationWatcher } from '../services/config/watcher.js';

// Create Fastify instance
const fastify = Fastify({
  logger: false, // We use custom logging middleware
  requestIdLogLabel: 'correlationId',
});

// Register middleware hooks
fastify.addHook('onRequest', loggingMiddleware);
fastify.addHook('preHandler', authenticationMiddleware);

// Register error handler
fastify.setErrorHandler(errorHandler);

// Register not found handler
fastify.setNotFoundHandler(notFoundHandler);

// Register routes
await registerRoutes(fastify);

// Start configuration watcher
const configWatcher = getConfigurationWatcher('./docs');
configWatcher.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  configWatcher.stop();
  await fastify.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  configWatcher.stop();
  await fastify.close();
  process.exit(0);
});

// Start server
const start = async () => {
  try {
    const host = process.env.HOST || '0.0.0.0';
    const port = process.env.PORT || 3000;

    await fastify.listen({ host, port });

    console.log(`Server listening on ${host}:${port}`);
    console.log(`Health check: http://${host}:${port}/health`);
    console.log(`API endpoint: http://${host}:${port}/api/v1/events`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start();
