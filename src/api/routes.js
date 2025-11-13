/**
 * API Routes
 * Defines all API endpoints
 */

import { calculateDateRange } from '../lib/date_utils.js';
import { coordinateSearch } from '../services/search/coordinator.js';
import { formatNDJSON } from '../services/formatter/ndjson.js';

/**
 * Register all routes
 * @param {FastifyInstance} fastify - Fastify instance
 */
export async function registerRoutes(fastify) {
  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'healthy',
      version: '1.0.0',
      uptime: process.uptime(),
    };
  });

  // Events query endpoint
  fastify.get('/api/v1/events', async (request, reply) => {
    try {
      // Extract and validate query parameters
      const { startDate, endDate } = request.query;

      // Validate parameters are present
      if (!startDate || !endDate) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'startDate and endDate parameters are required',
          code: 'MISSING_PARAMETERS',
          requestId: request.correlationId,
        });
      }

      // Parse to integers
      const startDateInt = parseInt(startDate, 10);
      const endDateInt = parseInt(endDate, 10);

      // Validate they are valid integers in range 1-365
      if (
        isNaN(startDateInt) ||
        isNaN(endDateInt) ||
        startDateInt < 1 ||
        startDateInt > 365 ||
        endDateInt < 1 ||
        endDateInt > 365 ||
        !Number.isInteger(parseFloat(startDate)) ||
        !Number.isInteger(parseFloat(endDate))
      ) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'startDate and endDate must be positive integers between 1 and 365',
          code: 'INVALID_DATE_PARAMS',
          requestId: request.correlationId,
        });
      }

      // Calculate date range (will throw if invalid)
      let dateRange;
      try {
        dateRange = calculateDateRange(startDateInt, endDateInt);
      } catch (error) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: error.message,
          code: 'INVALID_DATE_PARAMS',
          requestId: request.correlationId,
        });
      }

      console.log(
        JSON.stringify({
          level: 'info',
          timestamp: new Date().toISOString(),
          correlationId: request.correlationId,
          message: 'Processing event query',
          startDate: startDateInt,
          endDate: endDateInt,
          dateRange,
        })
      );

      // Coordinate search across sources
      const { events, coverage } = await coordinateSearch(
        dateRange.searchStartDate,
        dateRange.searchEndDate,
        startDateInt,
        endDateInt
      );

      // Format as NDJSON
      const ndjson = formatNDJSON(events, coverage);

      // Content negotiation based on Accept header
      const accept = String(request.headers.accept || '').toLowerCase();
      const isBrowserView = accept.includes('text/html') || accept.includes('text/plain');

      if (isBrowserView) {
        // Browser request: structured format for human/LLM/code readability
        const lines = ndjson.trim().split('\n');
        const parsedLines = lines.map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        }).filter(Boolean);

        // Separate events and coverage
        const eventObjects = parsedLines.filter((obj) => obj.type === 'event');
        const coverageObject = parsedLines.find((obj) => obj.type === 'coverage');

        // Build structured output
        const outputParts = [];

        // Header with metadata
        outputParts.push('='.repeat(80));
        outputParts.push('EVENT HARVEST API RESPONSE');
        outputParts.push('='.repeat(80));

        if (coverageObject) {
          outputParts.push(`Query ID: ${coverageObject.data.queryId}`);
          outputParts.push(`Date Range: ${coverageObject.data.dateRange.computedStart} to ${coverageObject.data.dateRange.computedEnd}`);
          outputParts.push(`Request Parameters: startDate=${coverageObject.data.dateRange.startDate}, endDate=${coverageObject.data.dateRange.endDate}`);
        }

        outputParts.push(`Total Events: ${eventObjects.length}`);
        outputParts.push(`Timestamp: ${new Date().toISOString()}`);
        outputParts.push('');

        // Events section
        if (eventObjects.length > 0) {
          outputParts.push('-'.repeat(80));
          outputParts.push('EVENTS SECTION');
          outputParts.push('-'.repeat(80));
          outputParts.push('');

          eventObjects.forEach((eventObj, index) => {
            const event = eventObj.data;
            outputParts.push(`--- EVENT #${index + 1}: ${event.ticker} (${event.eventType}) ---`);
            outputParts.push(`Date: ${event.eventDate}`);
            outputParts.push(`Sentiment: ${event.impactSummary.sentiment.toUpperCase()}`);
            outputParts.push('');
            outputParts.push(JSON.stringify(eventObj, null, 2));
            outputParts.push('');
          });
        } else {
          outputParts.push('--- NO EVENTS FOUND ---');
          outputParts.push('');
        }

        // Coverage section
        if (coverageObject) {
          outputParts.push('-'.repeat(80));
          outputParts.push('COVERAGE REPORT');
          outputParts.push('-'.repeat(80));
          outputParts.push(`Coverage: ${coverageObject.data.summary.coveragePercentage.toFixed(2)}%`);
          outputParts.push(`Successful: ${coverageObject.data.summary.successfulSearches}/${coverageObject.data.summary.totalEventTypes}`);
          outputParts.push(`Failed: ${coverageObject.data.summary.failedSearches}`);
          outputParts.push(`Timeouts: ${coverageObject.data.summary.timeoutSearches}`);
          outputParts.push('');
          outputParts.push(JSON.stringify(coverageObject, null, 2));
          outputParts.push('');
        }

        // Footer
        outputParts.push('='.repeat(80));
        outputParts.push('END OF RESPONSE');
        outputParts.push('='.repeat(80));

        const prettyOutput = outputParts.join('\n');

        reply.header('Content-Type', 'text/plain; charset=utf-8');
        reply.header('Content-Disposition', 'inline');
        return reply.send(prettyOutput);
      } else {
        // API/script request: serve as NDJSON
        reply.header('Content-Type', 'application/x-ndjson; charset=utf-8');
        reply.header('Content-Disposition', 'inline');
        return reply.send(ndjson);
      }

    } catch (error) {
      console.error(
        JSON.stringify({
          level: 'error',
          timestamp: new Date().toISOString(),
          correlationId: request.correlationId,
          error: {
            message: error.message,
            stack: error.stack,
          },
        })
      );

      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while processing your request',
        code: 'INTERNAL_ERROR',
        requestId: request.correlationId,
      });
    }
  });
}
