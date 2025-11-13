/**
 * Contract Test: NDJSON Output Format Compliance
 * Ensures output follows NDJSON specification: one JSON object per line
 */

import { describe, it, expect } from 'vitest';
import { parseNDJSON } from '../../src/services/formatter/ndjson.js';

describe('Contract: NDJSON output format compliance', () => {
  it('should parse valid NDJSON with event and coverage lines', () => {
    const ndjson = `{"type":"event","data":{"ticker":"AAPL","eventType":"earnGuide","eventDate":"2025-11-15","impactSummary":{"keyFacts":["Q4 revenue beat"],"sentiment":"positive"},"evidenceLinks":["https://sec.gov"]}}\n{"type":"coverage","data":{"queryId":"550e8400-e29b-41d4-a716-446655440000","dateRange":{"startDate":3,"endDate":4,"computedStart":"2025-11-15","computedEnd":"2025-11-18"},"summary":{"totalEventTypes":50,"successfulSearches":47,"failedSearches":2,"timeoutSearches":1,"coveragePercentage":94.00}}}\n`;

    const parsed = parseNDJSON(ndjson);

    expect(parsed).toHaveLength(2);
    expect(parsed[0].type).toBe('event');
    expect(parsed[1].type).toBe('coverage');
  });

  it('should have event type as first line type', () => {
    const ndjson = `{"type":"event","data":{"ticker":"AAPL","eventType":"earnGuide","eventDate":"2025-11-15","impactSummary":{"keyFacts":["test"],"sentiment":"positive"},"evidenceLinks":["https://test.com"]}}\n`;

    const parsed = parseNDJSON(ndjson);

    expect(parsed[0].type).toBe('event');
    expect(parsed[0].data).toHaveProperty('ticker');
    expect(parsed[0].data).toHaveProperty('eventType');
    expect(parsed[0].data).toHaveProperty('eventDate');
    expect(parsed[0].data).toHaveProperty('impactSummary');
    expect(parsed[0].data).toHaveProperty('evidenceLinks');
  });

  it('should have coverage type as last line type', () => {
    const ndjson = `{"type":"event","data":{"ticker":"AAPL","eventType":"earnGuide","eventDate":"2025-11-15","impactSummary":{"keyFacts":["test"],"sentiment":"positive"},"evidenceLinks":["https://test.com"]}}\n{"type":"coverage","data":{"queryId":"550e8400-e29b-41d4-a716-446655440000","dateRange":{"startDate":3,"endDate":4,"computedStart":"2025-11-15","computedEnd":"2025-11-18"},"summary":{"totalEventTypes":1,"successfulSearches":1,"failedSearches":0,"timeoutSearches":0,"coveragePercentage":100.00}}}\n`;

    const parsed = parseNDJSON(ndjson);
    const lastLine = parsed[parsed.length - 1];

    expect(lastLine.type).toBe('coverage');
    expect(lastLine.data).toHaveProperty('queryId');
    expect(lastLine.data).toHaveProperty('dateRange');
    expect(lastLine.data).toHaveProperty('summary');
  });

  it('should validate event data structure', () => {
    const ndjson = `{"type":"event","data":{"ticker":"MSFT","eventType":"aiDcCapex","eventDate":"2025-11-16","impactSummary":{"keyFacts":["$10B datacenter expansion"],"sentiment":"positive"},"evidenceLinks":["https://microsoft.com"]}}\n`;

    const parsed = parseNDJSON(ndjson);
    const event = parsed[0].data;

    expect(event.ticker).toMatch(/^[A-Z]{1,5}$/);
    expect(event.eventDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(event.impactSummary).toHaveProperty('keyFacts');
    expect(Array.isArray(event.impactSummary.keyFacts)).toBe(true);
    expect(['positive', 'negative', 'neutral']).toContain(event.impactSummary.sentiment);
    expect(Array.isArray(event.evidenceLinks)).toBe(true);
    expect(event.evidenceLinks.length).toBeGreaterThan(0);
  });

  it('should validate coverage data structure', () => {
    const ndjson = `{"type":"coverage","data":{"queryId":"550e8400-e29b-41d4-a716-446655440000","dateRange":{"startDate":3,"endDate":4,"computedStart":"2025-11-15","computedEnd":"2025-11-18"},"summary":{"totalEventTypes":50,"successfulSearches":47,"failedSearches":2,"timeoutSearches":1,"coveragePercentage":94.00}}}\n`;

    const parsed = parseNDJSON(ndjson);
    const coverage = parsed[0].data;

    expect(coverage.queryId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(coverage.dateRange).toHaveProperty('startDate');
    expect(coverage.dateRange).toHaveProperty('endDate');
    expect(coverage.dateRange).toHaveProperty('computedStart');
    expect(coverage.dateRange).toHaveProperty('computedEnd');
    expect(coverage.summary).toHaveProperty('totalEventTypes');
    expect(coverage.summary).toHaveProperty('successfulSearches');
    expect(coverage.summary).toHaveProperty('failedSearches');
    expect(coverage.summary).toHaveProperty('timeoutSearches');
    expect(coverage.summary).toHaveProperty('coveragePercentage');
    expect(coverage.summary.coveragePercentage).toBeGreaterThanOrEqual(0);
    expect(coverage.summary.coveragePercentage).toBeLessThanOrEqual(100);
  });
});
