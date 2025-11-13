/**
 * SearchResult Model
 * Outcome of searching a specific source for a specific event type
 */

export class SearchResult {
  constructor({ source, eventType, status, events, error, duration }) {
    this.source = source;
    this.eventType = eventType;
    this.status = status;
    this.events = events;
    this.error = error;
    this.duration = duration;
    this.validate();
  }

  validate() {
    // Validate source
    if (!this.source || typeof this.source !== 'string') {
      throw new Error('source is required and must be a string');
    }

    // Validate eventType
    if (!this.eventType || typeof this.eventType !== 'string') {
      throw new Error('eventType is required and must be a string');
    }

    // Validate status
    if (!['success', 'failed', 'timeout'].includes(this.status)) {
      throw new Error('status must be success, failed, or timeout');
    }

    // Validate events (required if status is success)
    if (this.status === 'success') {
      if (!Array.isArray(this.events)) {
        throw new Error('events must be an array when status is success');
      }
    }

    // Validate error (required if status is failed or timeout)
    if (['failed', 'timeout'].includes(this.status)) {
      if (!this.error || typeof this.error !== 'string') {
        throw new Error('error is required and must be a string when status is failed or timeout');
      }
    }

    // Validate duration
    if (typeof this.duration !== 'number' || this.duration < 0) {
      throw new Error('duration is required and must be a non-negative number');
    }
  }

  toJSON() {
    const result = {
      source: this.source,
      eventType: this.eventType,
      status: this.status,
      duration: this.duration,
    };

    if (this.events) {
      result.events = this.events;
    }

    if (this.error) {
      result.error = this.error;
    }

    return result;
  }
}
