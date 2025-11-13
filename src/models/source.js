/**
 * Source Model
 * Reliable data provider or website for event information
 */

export class Source {
  constructor({ name, url, reliability, eventTypes, rateLimit, category }) {
    this.name = name;
    this.url = url;
    this.reliability = reliability;
    this.eventTypes = eventTypes;
    this.rateLimit = rateLimit;
    this.category = category;
    this.validate();
  }

  validate() {
    // Validate name
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('name is required and must be a string');
    }

    // Validate URL
    if (!this.url || typeof this.url !== 'string') {
      throw new Error('url is required and must be a string');
    }
    if (!this.url.match(/^https?:\/\//)) {
      throw new Error('url must be a valid HTTP/HTTPS URL');
    }

    // Validate reliability (1-5)
    if (
      !this.reliability ||
      typeof this.reliability !== 'number' ||
      this.reliability < 1 ||
      this.reliability > 5
    ) {
      throw new Error('reliability must be a number between 1 and 5');
    }

    // Validate eventTypes
    if (!this.eventTypes || !Array.isArray(this.eventTypes)) {
      throw new Error('eventTypes is required and must be an array');
    }
    if (this.eventTypes.length === 0) {
      throw new Error('eventTypes must contain at least one event type');
    }
  }

  toJSON() {
    return {
      name: this.name,
      url: this.url,
      reliability: this.reliability,
      eventTypes: this.eventTypes,
      rateLimit: this.rateLimit,
      category: this.category,
    };
  }
}
