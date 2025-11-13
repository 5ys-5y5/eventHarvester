/**
 * Unit Test: Event Deduplication Logic
 * Tests event deduplication by (ticker + eventType + eventDate)
 */

import { describe, it, expect } from 'vitest';
import { Event } from '../../src/models/event.js';

describe('Unit: Event deduplication logic', () => {
  it('should merge events with same ticker, type, and date', () => {
    const event1 = new Event({
      ticker: 'AAPL',
      eventType: 'earnGuide',
      eventDate: '2025-11-15',
      impactSummary: {
        keyFacts: ['Q4 revenue beat expectations by 5%'],
        sentiment: 'positive',
      },
      evidenceLinks: ['https://sec.gov'],
    });

    const event2 = new Event({
      ticker: 'AAPL',
      eventType: 'earnGuide',
      eventDate: '2025-11-15',
      impactSummary: {
        keyFacts: ['iPhone sales up 12% YoY'],
        sentiment: 'positive',
      },
      evidenceLinks: ['https://apple.com'],
    });

    event1.mergeWith(event2);

    expect(event1.evidenceLinks).toHaveLength(2);
    expect(event1.evidenceLinks).toContain('https://sec.gov');
    expect(event1.evidenceLinks).toContain('https://apple.com');
    expect(event1.impactSummary.keyFacts).toHaveLength(2);
  });

  it('should deduplicate evidence links during merge', () => {
    const event1 = new Event({
      ticker: 'AAPL',
      eventType: 'earnGuide',
      eventDate: '2025-11-15',
      impactSummary: {
        keyFacts: ['Fact 1'],
        sentiment: 'positive',
      },
      evidenceLinks: ['https://sec.gov', 'https://apple.com'],
    });

    const event2 = new Event({
      ticker: 'AAPL',
      eventType: 'earnGuide',
      eventDate: '2025-11-15',
      impactSummary: {
        keyFacts: ['Fact 2'],
        sentiment: 'positive',
      },
      evidenceLinks: ['https://apple.com', 'https://bloomberg.com'],
    });

    event1.mergeWith(event2);

    // Should have 3 unique links, not 4
    expect(event1.evidenceLinks).toHaveLength(3);
    expect(event1.evidenceLinks).toContain('https://sec.gov');
    expect(event1.evidenceLinks).toContain('https://apple.com');
    expect(event1.evidenceLinks).toContain('https://bloomberg.com');
  });

  it('should deduplicate key facts during merge', () => {
    const event1 = new Event({
      ticker: 'AAPL',
      eventType: 'earnGuide',
      eventDate: '2025-11-15',
      impactSummary: {
        keyFacts: ['Revenue beat', 'iPhone sales up'],
        sentiment: 'positive',
      },
      evidenceLinks: ['https://sec.gov'],
    });

    const event2 = new Event({
      ticker: 'AAPL',
      eventType: 'earnGuide',
      eventDate: '2025-11-15',
      impactSummary: {
        keyFacts: ['iPhone sales up', 'Services revenue grew'],
        sentiment: 'positive',
      },
      evidenceLinks: ['https://apple.com'],
    });

    event1.mergeWith(event2);

    // Should have 3 unique facts, not 4
    expect(event1.impactSummary.keyFacts).toHaveLength(3);
    expect(event1.impactSummary.keyFacts).toContain('Revenue beat');
    expect(event1.impactSummary.keyFacts).toContain('iPhone sales up');
    expect(event1.impactSummary.keyFacts).toContain('Services revenue grew');
  });

  it('should generate unique key from ticker, eventType, and eventDate', () => {
    const event = new Event({
      ticker: 'AAPL',
      eventType: 'earnGuide',
      eventDate: '2025-11-15',
      impactSummary: {
        keyFacts: ['Test'],
        sentiment: 'positive',
      },
      evidenceLinks: ['https://test.com'],
    });

    const key = event.getUniqueKey();

    expect(key).toBe('AAPL|earnGuide|2025-11-15');
  });

  it('should not merge events with different tickers', () => {
    const event1 = new Event({
      ticker: 'AAPL',
      eventType: 'earnGuide',
      eventDate: '2025-11-15',
      impactSummary: {
        keyFacts: ['Test'],
        sentiment: 'positive',
      },
      evidenceLinks: ['https://sec.gov'],
    });

    const event2 = new Event({
      ticker: 'MSFT',
      eventType: 'earnGuide',
      eventDate: '2025-11-15',
      impactSummary: {
        keyFacts: ['Test'],
        sentiment: 'positive',
      },
      evidenceLinks: ['https://microsoft.com'],
    });

    expect(() => event1.mergeWith(event2)).toThrow('Cannot merge events with different unique keys');
  });

  it('should not merge events with different event types', () => {
    const event1 = new Event({
      ticker: 'AAPL',
      eventType: 'earnGuide',
      eventDate: '2025-11-15',
      impactSummary: {
        keyFacts: ['Test'],
        sentiment: 'positive',
      },
      evidenceLinks: ['https://sec.gov'],
    });

    const event2 = new Event({
      ticker: 'AAPL',
      eventType: 'aiDcCapex',
      eventDate: '2025-11-15',
      impactSummary: {
        keyFacts: ['Test'],
        sentiment: 'positive',
      },
      evidenceLinks: ['https://apple.com'],
    });

    expect(() => event1.mergeWith(event2)).toThrow('Cannot merge events with different unique keys');
  });

  it('should not merge events with different dates', () => {
    const event1 = new Event({
      ticker: 'AAPL',
      eventType: 'earnGuide',
      eventDate: '2025-11-15',
      impactSummary: {
        keyFacts: ['Test'],
        sentiment: 'positive',
      },
      evidenceLinks: ['https://sec.gov'],
    });

    const event2 = new Event({
      ticker: 'AAPL',
      eventType: 'earnGuide',
      eventDate: '2025-11-16',
      impactSummary: {
        keyFacts: ['Test'],
        sentiment: 'positive',
      },
      evidenceLinks: ['https://apple.com'],
    });

    expect(() => event1.mergeWith(event2)).toThrow('Cannot merge events with different unique keys');
  });
});
