/**
 * Search Coordinator
 * Orchestrates multi-source event searches
 * ⚠️ MVP Implementation: Demonstrates architecture with mock data
 * ⚠️ MUST load current configuration from docs/ files (never use hard-coded values)
 */

import { v4 as uuidv4 } from 'uuid';
import { Event } from '../../models/event.js';
import { SearchResult } from '../../models/search_result.js';
import { SearchCoverageChecklist, DateRange, CoverageSummary } from '../../models/coverage.js';
import { deduplicateEvents } from './deduplicator.js';
import { getConfigurationWatcher } from '../config/watcher.js';

/**
 * Coordinate event search across multiple sources
 * @param {string} searchStartDate - Start date (ISO format)
 * @param {string} searchEndDate - End date (ISO format)
 * @param {number} startDateOffset - Original startDate parameter
 * @param {number} endDateDuration - Original endDate parameter
 * @returns {Promise<Object>} { events: Event[], coverage: SearchCoverageChecklist }
 */
export async function coordinateSearch(
  searchStartDate,
  searchEndDate,
  startDateOffset,
  endDateDuration
) {
  const queryId = uuidv4();
  const searchStartTime = Date.now();

  // Load current configuration (CRITICAL: never hard-code)
  const configWatcher = getConfigurationWatcher('./docs');
  const config = configWatcher.getConfigurationWithTTL();

  console.log(`Starting search with queryId: ${queryId}`);
  console.log(`  Date range: ${searchStartDate} to ${searchEndDate}`);
  console.log(`  Configuration: ${config.eventTypes.length} event types, ${config.sources.length} sources, ${config.exchanges.length} exchanges`);

  // MVP: Create mock events to demonstrate the system working
  // In production, this would fetch from actual sources
  const mockEvents = createMockEvents(searchStartDate, searchEndDate);

  // Deduplicate events
  const deduplicatedEvents = deduplicateEvents(mockEvents);

  // Create search results (MVP: mock successful searches)
  const searchResults = createMockSearchResults(config);

  // Build coverage checklist
  const coverage = buildCoverageChecklist(
    queryId,
    startDateOffset,
    endDateDuration,
    searchStartDate,
    searchEndDate,
    searchResults,
    config
  );

  const searchDuration = Date.now() - searchStartTime;
  console.log(`Search completed in ${searchDuration}ms`);
  console.log(`  Events found: ${deduplicatedEvents.length}`);
  console.log(`  Coverage: ${coverage.summary.coveragePercentage}%`);

  return {
    events: deduplicatedEvents,
    coverage,
  };
}

/**
 * Create mock events for MVP demonstration
 * Generates realistic volume of events based on date range
 * In production, this would fetch from actual sources from docs/sourceBookmarks.md
 */
function createMockEvents(startDate, endDate) {
  const events = [];

  // Sample tickers for mock data
  const tickers = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'AMD',
    'INTC', 'NFLX', 'DIS', 'BA', 'JPM', 'BAC', 'WMT', 'KO', 'PEP',
    'XOM', 'CVX', 'UNH', 'JNJ', 'PFE', 'MRK', 'ABBV', 'LLY',
  ];

  // Event types with expected frequency (events per day)
  const eventTypes = [
    { type: 'earnGuide', frequency: 0.5 },      // ~15 events per 30 days
    { type: 'earnCal', frequency: 3 },          // ~90 events per 30 days
    { type: 'guideRev', frequency: 2 },         // ~60 events per 30 days
    { type: 'perfGuide', frequency: 2.5 },      // ~75 events per 30 days
    { type: 'aiDcCapex', frequency: 0.3 },      // ~9 events per 30 days
    { type: 'macroCal', frequency: 1 },         // ~30 events per 30 days
    { type: 'divAnn', frequency: 0.8 },         // ~24 events per 30 days
    { type: 'mergerAcq', frequency: 0.2 },      // ~6 events per 30 days
  ];

  // Calculate number of days in range
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Generate events for each day
  for (let day = 0; day < daysDiff; day++) {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + day);
    const dateStr = currentDate.toISOString().split('T')[0];

    // Generate events for this day based on frequency
    eventTypes.forEach((eventConfig) => {
      const eventsToday = Math.floor(eventConfig.frequency + Math.random());

      for (let i = 0; i < eventsToday; i++) {
        const ticker = tickers[Math.floor(Math.random() * tickers.length)];
        const sentiment = Math.random() > 0.4 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative';

        // Generate event-specific content
        let keyFacts = [];
        let evidenceLinks = [];

        switch (eventConfig.type) {
          case 'earnGuide':
            keyFacts = [
              `${ticker} ${sentiment === 'positive' ? 'beats' : sentiment === 'negative' ? 'misses' : 'meets'} earnings expectations`,
              `Revenue ${sentiment === 'positive' ? 'up' : sentiment === 'negative' ? 'down' : 'flat'} ${Math.floor(Math.random() * 20)}% YoY`,
            ];
            evidenceLinks = [`https://sec.gov/edgar/${ticker.toLowerCase()}-${day}`, `https://investor.${ticker.toLowerCase()}.com/news`];
            break;

          case 'earnCal':
            keyFacts = [`${ticker} earnings call scheduled`, `Q${Math.ceil(Math.random() * 4)} ${new Date().getFullYear()} results`];
            evidenceLinks = [`https://investor.${ticker.toLowerCase()}.com/calendar`];
            break;

          case 'guideRev':
            keyFacts = [
              `${ticker} revises guidance ${sentiment === 'positive' ? 'upward' : sentiment === 'negative' ? 'downward' : ''}`,
              `Updated forecast for ${new Date().getFullYear()}`,
            ];
            evidenceLinks = [`https://sec.gov/edgar/${ticker.toLowerCase()}-guide-${day}`];
            break;

          case 'perfGuide':
            keyFacts = [
              `${ticker} performance surprise: ${sentiment === 'positive' ? '+' : sentiment === 'negative' ? '-' : ''}${Math.floor(Math.random() * 15)}%`,
              `Analyst expectations ${sentiment === 'positive' ? 'exceeded' : sentiment === 'negative' ? 'missed' : 'met'}`,
            ];
            evidenceLinks = [`https://seeking alpha.com/${ticker.toLowerCase()}-surprise`];
            break;

          case 'aiDcCapex':
            keyFacts = [`${ticker} announces $${Math.floor(Math.random() * 20)}B AI/datacenter investment`, 'Infrastructure expansion plans'];
            evidenceLinks = [`https://${ticker.toLowerCase()}.com/news/ai-investment`];
            break;

          case 'macroCal':
            keyFacts = [`Fed meeting scheduled`, `Interest rate decision expected`];
            evidenceLinks = [`https://federalreserve.gov/calendar`];
            break;

          case 'divAnn':
            keyFacts = [`${ticker} announces dividend of $${(Math.random() * 2).toFixed(2)}/share`, `Payment date: ${dateStr}`];
            evidenceLinks = [`https://investor.${ticker.toLowerCase()}.com/dividends`];
            break;

          case 'mergerAcq':
            keyFacts = [`${ticker} acquisition activity reported`, `Deal value: $${Math.floor(Math.random() * 100)}B`];
            evidenceLinks = [`https://sec.gov/edgar/m-a-${ticker.toLowerCase()}`];
            break;

          default:
            keyFacts = [`${ticker} event on ${dateStr}`];
            evidenceLinks = [`https://example.com/${ticker.toLowerCase()}`];
        }

        events.push(
          new Event({
            ticker,
            eventType: eventConfig.type,
            eventDate: dateStr,
            impactSummary: {
              keyFacts,
              sentiment,
            },
            evidenceLinks,
          })
        );
      }
    });
  }

  return events;
}

/**
 * Create mock search results for MVP demonstration
 * In production, this would track actual source fetch attempts
 */
function createMockSearchResults(config) {
  const results = [];

  // Create successful search results for demonstration
  const eventTypesToSearch = Math.min(config.eventTypes.length || 5, 10);

  for (let i = 0; i < eventTypesToSearch; i++) {
    const eventType = config.eventTypes[i]?.name || `mockEventType${i}`;

    results.push(
      new SearchResult({
        source: 'mock-source-official',
        eventType,
        status: 'success',
        events: [],
        duration: Math.random() * 5000 + 1000, // 1-6 seconds
      })
    );
  }

  // Add one failed result for demonstration
  results.push(
    new SearchResult({
      source: 'mock-source-unavailable',
      eventType: 'macroCal',
      status: 'failed',
      error: 'Source temporarily unavailable',
      duration: 15000,
    })
  );

  return results;
}

/**
 * Build coverage checklist from search results
 */
function buildCoverageChecklist(
  queryId,
  startDateOffset,
  endDateDuration,
  computedStart,
  computedEnd,
  searchResults,
  config
) {
  // Calculate summary statistics
  const totalEventTypes = Math.max(config.eventTypes.length, searchResults.length);
  const successfulSearches = searchResults.filter((r) => r.status === 'success').length;
  const failedSearches = searchResults.filter((r) => r.status === 'failed').length;
  const timeoutSearches = searchResults.filter((r) => r.status === 'timeout').length;
  const coveragePercentage = (successfulSearches / totalEventTypes) * 100;

  const dateRange = new DateRange({
    startDate: startDateOffset,
    endDate: endDateDuration,
    computedStart,
    computedEnd,
  });

  const summary = new CoverageSummary({
    totalEventTypes,
    successfulSearches,
    failedSearches,
    timeoutSearches,
    coveragePercentage,
  });

  // Build event type coverage
  const eventTypeCoverage = searchResults.map((result) => ({
    eventType: result.eventType,
    sourcesAttempted: [result.source],
    results: [result],
  }));

  return new SearchCoverageChecklist({
    queryId,
    dateRange,
    eventTypeCoverage,
    summary,
  });
}
