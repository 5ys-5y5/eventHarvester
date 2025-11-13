/**
 * Event Model
 * Represents a corporate or market event that significantly impacted stock prices.
 * Unique by combination of (ticker, eventType, eventDate)
 */

export class Event {
  constructor({ ticker, eventType, eventDate, impactSummary, evidenceLinks }) {
    this.ticker = ticker;
    this.eventType = eventType;
    this.eventDate = eventDate;
    this.impactSummary = impactSummary;
    this.evidenceLinks = evidenceLinks;
    this.validate();
  }

  validate() {
    // Validate ticker
    if (!this.ticker || typeof this.ticker !== 'string') {
      throw new Error('ticker is required and must be a string');
    }
    if (!/^[A-Z]{1,5}$/.test(this.ticker)) {
      throw new Error('ticker must be uppercase letters only, max 5 characters');
    }

    // Validate eventType
    if (!this.eventType || typeof this.eventType !== 'string') {
      throw new Error('eventType is required and must be a string');
    }

    // Validate eventDate (ISO 8601 format YYYY-MM-DD)
    if (!this.eventDate || typeof this.eventDate !== 'string') {
      throw new Error('eventDate is required and must be a string');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(this.eventDate)) {
      throw new Error('eventDate must be in ISO 8601 format (YYYY-MM-DD)');
    }

    // Validate impactSummary
    if (!this.impactSummary || typeof this.impactSummary !== 'object') {
      throw new Error('impactSummary is required and must be an object');
    }
    if (!this.impactSummary.keyFacts || !Array.isArray(this.impactSummary.keyFacts)) {
      throw new Error('impactSummary.keyFacts is required and must be an array');
    }
    if (this.impactSummary.keyFacts.length === 0) {
      throw new Error('impactSummary.keyFacts must contain at least one item');
    }
    if (!['positive', 'negative', 'neutral'].includes(this.impactSummary.sentiment)) {
      throw new Error(
        'impactSummary.sentiment is required and must be positive, negative, or neutral'
      );
    }

    // Validate evidenceLinks
    if (!this.evidenceLinks || !Array.isArray(this.evidenceLinks)) {
      throw new Error('evidenceLinks is required and must be an array');
    }
    if (this.evidenceLinks.length === 0) {
      throw new Error('evidenceLinks must contain at least one URL');
    }
    this.evidenceLinks.forEach((url) => {
      if (typeof url !== 'string' || !url.match(/^https?:\/\//)) {
        throw new Error('All evidenceLinks must be valid HTTP/HTTPS URLs');
      }
    });
  }

  /**
   * Get unique key for this event (used for deduplication)
   */
  getUniqueKey() {
    return `${this.ticker}|${this.eventType}|${this.eventDate}`;
  }

  /**
   * Merge another event into this one (combine evidence links)
   */
  mergeWith(otherEvent) {
    if (this.getUniqueKey() !== otherEvent.getUniqueKey()) {
      throw new Error('Cannot merge events with different unique keys');
    }

    // Merge evidence links (union)
    this.evidenceLinks = [...new Set([...this.evidenceLinks, ...otherEvent.evidenceLinks])];

    // Merge key facts (union, deduplicate)
    this.impactSummary.keyFacts = [
      ...new Set([...this.impactSummary.keyFacts, ...otherEvent.impactSummary.keyFacts]),
    ];
  }

  /**
   * Convert to plain object for JSON serialization
   */
  toJSON() {
    return {
      ticker: this.ticker,
      eventType: this.eventType,
      eventDate: this.eventDate,
      impactSummary: {
        keyFacts: this.impactSummary.keyFacts,
        sentiment: this.impactSummary.sentiment,
      },
      evidenceLinks: this.evidenceLinks,
    };
  }
}
