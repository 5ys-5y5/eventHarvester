/**
 * Fastify Middleware
 * Authentication, logging, and error handling
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Authentication middleware - API key validation via X-API-Key header
 */
export async function authenticationMiddleware(request, reply) {
  const apiKey = request.headers['x-api-key'];
  const expectedKey = process.env.EVENT_HARVEST_API_KEY;

  if (!expectedKey) {
    // If no API key is configured, allow all requests (development mode)
    return;
  }

  if (!apiKey || apiKey !== expectedKey) {
    reply.code(401).send({
      error: 'Unauthorized',
      message: 'Missing or invalid API key',
      code: 'INVALID_API_KEY',
    });
  }
}

/**
 * Logging middleware - structured JSON logging with correlation IDs
 */
export async function loggingMiddleware(request, reply) {
  // Generate correlation ID
  const correlationId = uuidv4();
  request.correlationId = correlationId;
  request.startTime = Date.now();

  // Set correlation ID in response header
  reply.header('X-Request-ID', correlationId);

  // Log request
  console.log(
    JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      correlationId,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    })
  );
}

/**
 * Error handling middleware - standardized error responses
 */
export function errorHandler(error, request, reply) {
  const correlationId = request.correlationId || 'unknown';

  // Log error
  console.error(
    JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      correlationId,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
      },
      method: request.method,
      url: request.url,
    })
  );

  // Determine status code
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let errorMessage = 'An internal server error occurred';

  if (error.statusCode) {
    statusCode = error.statusCode;
  }

  if (error.validation) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    errorMessage = error.message;
  }

  // Send error response
  reply.code(statusCode).send({
    error: statusCode === 500 ? 'Internal Server Error' : 'Bad Request',
    message: errorMessage,
    code: errorCode,
    requestId: correlationId,
  });
}

/**
 * Not Found handler
 */
export function notFoundHandler(request, reply) {
  reply.code(404).send({
    error: 'Not Found',
    message: `Route ${request.method} ${request.url} not found`,
    code: 'NOT_FOUND',
    requestId: request.correlationId || 'unknown',
  });
}
