/**
 * SearchCoverageChecklist Model
 * Comprehensive report showing search coverage
 */

export class SearchCoverageChecklist {
  constructor({ queryId, dateRange, eventTypeCoverage, summary }) {
    this.queryId = queryId;
    this.dateRange = dateRange;
    this.eventTypeCoverage = eventTypeCoverage;
    this.summary = summary;
    this.validate();
  }

  validate() {
    // Validate queryId (UUID format)
    if (!this.queryId || typeof this.queryId !== 'string') {
      throw new Error('queryId is required and must be a string');
    }
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(this.queryId)
    ) {
      throw new Error('queryId must be a valid UUID');
    }

    // Validate dateRange
    if (!this.dateRange || typeof this.dateRange !== 'object') {
      throw new Error('dateRange is required and must be an object');
    }
    if (
      typeof this.dateRange.startDate !== 'number' ||
      typeof this.dateRange.endDate !== 'number'
    ) {
      throw new Error('dateRange must contain startDate and endDate as numbers');
    }
    if (
      typeof this.dateRange.computedStart !== 'string' ||
      typeof this.dateRange.computedEnd !== 'string'
    ) {
      throw new Error('dateRange must contain computedStart and computedEnd as strings');
    }

    // Validate eventTypeCoverage
    if (!Array.isArray(this.eventTypeCoverage)) {
      throw new Error('eventTypeCoverage must be an array');
    }

    // Validate summary
    if (!this.summary || typeof this.summary !== 'object') {
      throw new Error('summary is required and must be an object');
    }
    const requiredSummaryFields = [
      'totalEventTypes',
      'successfulSearches',
      'failedSearches',
      'timeoutSearches',
      'coveragePercentage',
    ];
    requiredSummaryFields.forEach((field) => {
      if (typeof this.summary[field] !== 'number') {
        throw new Error(`summary.${field} is required and must be a number`);
      }
    });

    if (this.summary.coveragePercentage < 0 || this.summary.coveragePercentage > 100) {
      throw new Error('summary.coveragePercentage must be between 0 and 100');
    }
  }

  toJSON() {
    return {
      queryId: this.queryId,
      dateRange: this.dateRange,
      eventTypeCoverage: this.eventTypeCoverage,
      summary: this.summary,
    };
  }
}

export class DateRange {
  constructor({ startDate, endDate, computedStart, computedEnd }) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.computedStart = computedStart;
    this.computedEnd = computedEnd;
  }

  toJSON() {
    return {
      startDate: this.startDate,
      endDate: this.endDate,
      computedStart: this.computedStart,
      computedEnd: this.computedEnd,
    };
  }
}

export class CoverageSummary {
  constructor({
    totalEventTypes,
    successfulSearches,
    failedSearches,
    timeoutSearches,
    coveragePercentage,
  }) {
    this.totalEventTypes = totalEventTypes;
    this.successfulSearches = successfulSearches;
    this.failedSearches = failedSearches;
    this.timeoutSearches = timeoutSearches;
    this.coveragePercentage = coveragePercentage;
  }

  toJSON() {
    return {
      totalEventTypes: this.totalEventTypes,
      successfulSearches: this.successfulSearches,
      failedSearches: this.failedSearches,
      timeoutSearches: this.timeoutSearches,
      coveragePercentage: Number(this.coveragePercentage.toFixed(2)),
    };
  }
}
