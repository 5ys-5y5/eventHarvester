/**
 * ImpactAnalysis Model
 * Analysis summary extracted from event sources
 */

export class ImpactAnalysis {
  constructor({ keyFacts, sentiment }) {
    this.keyFacts = keyFacts;
    this.sentiment = sentiment;
    this.validate();
  }

  validate() {
    // Validate keyFacts
    if (!this.keyFacts || !Array.isArray(this.keyFacts)) {
      throw new Error('keyFacts is required and must be an array');
    }
    if (this.keyFacts.length === 0) {
      throw new Error('keyFacts must contain at least one item');
    }
    this.keyFacts.forEach((fact) => {
      if (typeof fact !== 'string') {
        throw new Error('All keyFacts must be strings');
      }
      if (fact.length > 500) {
        throw new Error('Each keyFact must be max 500 characters');
      }
    });

    // Validate sentiment
    if (!['positive', 'negative', 'neutral'].includes(this.sentiment)) {
      throw new Error('sentiment must be positive, negative, or neutral');
    }
  }

  toJSON() {
    return {
      keyFacts: this.keyFacts,
      sentiment: this.sentiment,
    };
  }
}
