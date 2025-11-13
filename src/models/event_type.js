/**
 * EventType Model
 * Category of events that can affect stock prices
 */

export class EventType {
  constructor({ name, category, sector, description }) {
    this.name = name;
    this.category = category;
    this.sector = sector;
    this.description = description;
    this.validate();
  }

  validate() {
    // Validate name
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('name is required and must be a string');
    }
    if (!/^[a-z][a-zA-Z0-9]*$/.test(this.name)) {
      throw new Error('name must start with lowercase letter and contain only alphanumeric');
    }

    // Validate category
    if (!['common', 'unique'].includes(this.category)) {
      throw new Error('category must be common or unique');
    }

    // Validate sector (required if category is unique)
    if (this.category === 'unique' && !this.sector) {
      throw new Error('sector is required when category is unique');
    }

    // Validate description
    if (!this.description || typeof this.description !== 'string') {
      throw new Error('description is required and must be a string');
    }
    if (this.description.length > 200) {
      throw new Error('description must be max 200 characters');
    }
  }

  toJSON() {
    return {
      name: this.name,
      category: this.category,
      sector: this.sector,
      description: this.description,
    };
  }
}
