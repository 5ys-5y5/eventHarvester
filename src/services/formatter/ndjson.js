/**
 * NDJSON Formatter
 * Formats events and coverage checklist as NDJSON (Newline Delimited JSON)
 */

/**
 * Format a single event as NDJSON line
 * @param {Event} event - Event object
 * @returns {string} NDJSON line (JSON + newline)
 */
export function formatEventLine(event) {
  const line = {
    type: 'event',
    data: event.toJSON ? event.toJSON() : event,
  };
  return JSON.stringify(line) + '\n';
}

/**
 * Format coverage checklist as NDJSON line
 * @param {SearchCoverageChecklist} coverage - Coverage checklist object
 * @returns {string} NDJSON line (JSON + newline)
 */
export function formatCoverageLine(coverage) {
  const line = {
    type: 'coverage',
    data: coverage.toJSON ? coverage.toJSON() : coverage,
  };
  return JSON.stringify(line) + '\n';
}

/**
 * Format array of events as complete NDJSON output
 * @param {Array} events - Array of Event objects
 * @param {SearchCoverageChecklist} coverage - Coverage checklist object
 * @returns {string} Complete NDJSON output (events + coverage)
 */
export function formatNDJSON(events, coverage) {
  let output = '';

  // Add event lines
  events.forEach((event) => {
    output += formatEventLine(event);
  });

  // Add coverage line as final line
  if (coverage) {
    output += formatCoverageLine(coverage);
  }

  return output;
}

/**
 * Stream NDJSON events
 * Generator function that yields NDJSON lines one at a time
 * @param {Array} events - Array of Event objects
 * @param {SearchCoverageChecklist} coverage - Coverage checklist object
 * @yields {string} NDJSON lines
 */
export function* streamNDJSON(events, coverage) {
  // Yield event lines
  for (const event of events) {
    yield formatEventLine(event);
  }

  // Yield coverage line as final line
  if (coverage) {
    yield formatCoverageLine(coverage);
  }
}

/**
 * Parse NDJSON input (for testing)
 * @param {string} ndjson - NDJSON string
 * @returns {Array} Array of parsed objects
 */
export function parseNDJSON(ndjson) {
  return ndjson
    .trim()
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}
