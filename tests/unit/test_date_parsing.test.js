/**
 * Unit Test: Date Offset Calculation
 * Tests relative date offset calculations per FR-002 and FR-003
 */

import { describe, it, expect } from 'vitest';
import { calculateDateRange, formatToISO, addDays, isValidISODate } from '../../src/lib/date_utils.js';

describe('Unit: Date offset calculation', () => {
  it('should calculate date range per FR-003 formula', () => {
    // Example from spec: startDate=3, endDate=4 -> search from day 3 through day 6 (4-day period)
    // If today is 2025-11-12:
    // searchStartDate = 2025-11-12 + 3 days = 2025-11-15
    // searchEndDate = 2025-11-15 + (4 - 1) days = 2025-11-18
    const baseDate = new Date('2025-11-12');
    const result = calculateDateRange(3, 4, baseDate);

    expect(result.searchStartDate).toBe('2025-11-15');
    expect(result.searchEndDate).toBe('2025-11-18');
  });

  it('should calculate 1-day duration correctly', () => {
    const baseDate = new Date('2025-11-12');
    const result = calculateDateRange(1, 1, baseDate);

    // startDate=1, endDate=1 -> day 1 through day 1 (1-day period)
    // searchStartDate = 2025-11-12 + 1 = 2025-11-13
    // searchEndDate = 2025-11-13 + (1 - 1) = 2025-11-13
    expect(result.searchStartDate).toBe('2025-11-13');
    expect(result.searchEndDate).toBe('2025-11-13');
  });

  it('should handle 30-day duration', () => {
    const baseDate = new Date('2025-11-12');
    const result = calculateDateRange(1, 30, baseDate);

    expect(result.searchStartDate).toBe('2025-11-13');
    expect(result.searchEndDate).toBe('2025-12-12'); // 30 days from start
  });

  it('should reject zero startDate', () => {
    const baseDate = new Date('2025-11-12');

    expect(() => calculateDateRange(0, 4, baseDate)).toThrow('startDate must be a positive integer between 1 and 365');
  });

  it('should reject negative startDate', () => {
    const baseDate = new Date('2025-11-12');

    expect(() => calculateDateRange(-1, 4, baseDate)).toThrow('startDate must be a positive integer between 1 and 365');
  });

  it('should reject zero endDate', () => {
    const baseDate = new Date('2025-11-12');

    expect(() => calculateDateRange(3, 0, baseDate)).toThrow('endDate must be a positive integer between 1 and 365');
  });

  it('should reject negative endDate', () => {
    const baseDate = new Date('2025-11-12');

    expect(() => calculateDateRange(3, -1, baseDate)).toThrow('endDate must be a positive integer between 1 and 365');
  });

  it('should reject startDate > 365', () => {
    const baseDate = new Date('2025-11-12');

    expect(() => calculateDateRange(366, 4, baseDate)).toThrow('startDate must be a positive integer between 1 and 365');
  });

  it('should reject endDate > 365', () => {
    const baseDate = new Date('2025-11-12');

    expect(() => calculateDateRange(3, 366, baseDate)).toThrow('endDate must be a positive integer between 1 and 365');
  });

  it('should reject non-integer startDate', () => {
    const baseDate = new Date('2025-11-12');

    expect(() => calculateDateRange(3.5, 4, baseDate)).toThrow('startDate must be a positive integer');
  });

  it('should format dates to ISO 8601 (YYYY-MM-DD)', () => {
    const date = new Date('2025-11-15T10:30:00Z');
    const formatted = formatToISO(date);

    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(formatted).toBe('2025-11-15');
  });

  it('should add days correctly', () => {
    const baseDate = new Date('2025-11-12');
    const result = addDays(baseDate, 5);

    expect(formatToISO(result)).toBe('2025-11-17');
  });

  it('should validate ISO date format', () => {
    expect(isValidISODate('2025-11-15')).toBe(true);
    expect(isValidISODate('2025-02-29')).toBe(false); // 2025 is not leap year
    expect(isValidISODate('2024-02-29')).toBe(true); // 2024 is leap year
    expect(isValidISODate('2025-13-01')).toBe(false); // Invalid month
    expect(isValidISODate('2025-11-32')).toBe(false); // Invalid day
    expect(isValidISODate('not-a-date')).toBe(false);
  });
});
