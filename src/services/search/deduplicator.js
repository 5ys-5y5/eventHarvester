/**
 * Event Deduplication Service
 * Deduplicates events by (ticker + eventType + eventDate)
 */

import { Event } from '../../models/event.js';

/**
 * Deduplicate array of events
 * Merges events with same ticker, eventType, and eventDate
 * @param {Array<Event>} events - Array of Event objects
 * @returns {Array<Event>} Deduplicated events
 */
export function deduplicateEvents(events) {
  const eventMap = new Map();

  for (const event of events) {
    const key = event.getUniqueKey();

    if (eventMap.has(key)) {
      // Merge with existing event
      const existing = eventMap.get(key);
      existing.mergeWith(event);
    } else {
      // Add new event
      eventMap.set(key, event);
    }
  }

  return Array.from(eventMap.values());
}
