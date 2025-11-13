# Quickstart Guide: Stock Event Harvesting API

## Installation

```bash
# Clone repository
git clone https://github.com/yourusername/eventHarvester.git
cd eventHarvester

# Install dependencies
npm install

# Configuration files are already in docs/ folder (Korean with English technical terms)
# docs/eventsByTypeList.md - Event taxonomy (Common + Unique sector-specific types)
# docs/sourceBookmarks.md - Official government/institutional sources
# docs/targetCriteria.md - 15 US exchanges with MIC codes
```

## Understanding Dynamic Configuration

⚠️ **CRITICAL**: The three configuration files in docs/ are the SINGLE SOURCE OF TRUTH and change frequently:
- **docs/targetCriteria.md**: Defines which US exchanges to search (current format shows structure; actual exchanges may be added/removed)
- **docs/eventsByTypeList.md**: Defines which events are significant (current format shows structure; actual event types may be added/removed/modified)
- **docs/sourceBookmarks.md**: Defines where to search for events (current format shows structure; actual sources may be added/removed/modified)

The system loads these files:
- Before each search operation (or from cache refreshed every 5 minutes)
- To determine what to search, where to search, and which events to return
- Without requiring code deployment or service restart

**Never hard-code** exchanges, event types, or source URLs in application code.

## Configuration

### 1. Set API Key

```bash
export EVENT_HARVEST_API_KEY=your-api-key-here
```

### 2. Review Configuration Files

⚠️ **Note**: These files define the current search scope and sources. Review them to understand what the system will search for. Values shown are current format; they may change frequently.

Review `docs/eventsByTypeList.md` which contains the event taxonomy (Korean with English technical terms):
- Format shows Common types (all sectors) and Unique types (sector-specific)
- Current contents show structure; actual event types may be added/removed/modified frequently

Review `docs/sourceBookmarks.md` which contains official government/institutional sources (Korean with English technical terms):
- Format shows sources organized by category: Disclosure/Market Structure, Monetary Policy/Macro, Energy/Commodities/Disasters, Healthcare, Transportation, Communications, Utilities, Indices/Options, Treasury, Automotive, Trade/Export
- Current contents show structure; actual sources may be added/removed/modified frequently

Review `docs/targetCriteria.md` which defines US exchanges with MIC codes:
- Format shows exchanges with their MIC codes (e.g., XNYS, XNAS, XASE, LTSE, etc.)
- Current contents show structure; actual exchange list may be added/removed frequently

## Running Locally

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Run tests (TDD - write tests first!)
npm test

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:contract
```

## API Usage

### REST API

```bash
# Query events
curl "http://localhost:3000/api/v1/events?startDate=3&endDate=4" \
  -H "X-API-Key: $EVENT_HARVEST_API_KEY"

# Health check
curl "http://localhost:3000/health"
```

### CLI

```bash
# NDJSON output (default)
npm run cli -- query -s 3 -e 4

# JSON output
npm run cli -- query -s 3 -e 4 --format json

# Table output
npm run cli -- query -s 3 -e 4 --format table

# With jq
npm run cli -- query -s 3 -e 4 | jq -r 'select(.type=="event") | .data.ticker'
```

## Deployment to Render.com

### 1. Create Render Web Service

```bash
# In Render dashboard:
# - New Web Service
# - Connect GitHub repository
# - Build Command: npm install && npm run build
# - Start Command: npm start
# - Environment: Node 18
```

### 2. Set Environment Variables

```
EVENT_HARVEST_API_KEY=your-production-key
NODE_ENV=production
```

### 3. Deploy

```bash
git push origin main
# Render auto-deploys on push
```

## Testing Strategy (TDD Workflow)

### 1. Write Tests First (Red Phase)

```javascript
// tests/unit/test_deduplication.test.js
import { describe, it, expect } from 'vitest';
import { deduplicateEvents } from '../src/services/search/deduplicator.js';

describe('Event Deduplication', () => {
  it('should merge events with same ticker, type, and date', () => {
    const events = [
      { ticker: 'AAPL', eventType: 'earnGuide', eventDate: '2025-11-15', evidenceLinks: ['https://sec.gov'] },
      { ticker: 'AAPL', eventType: 'earnGuide', eventDate: '2025-11-15', evidenceLinks: ['https://apple.com'] }
    ];

    const result = deduplicateEvents(events);

    expect(result).toHaveLength(1);
    expect(result[0].evidenceLinks).toEqual(['https://sec.gov', 'https://apple.com']);
  });
});

// Run test - should FAIL
// npm test
```

### 2. Implement (Green Phase)

```javascript
// src/services/search/deduplicator.js
export function deduplicateEvents(events) {
  const map = new Map();

  for (const event of events) {
    const key = `${event.ticker}|${event.eventType}|${event.eventDate}`;

    if (map.has(key)) {
      const existing = map.get(key);
      existing.evidenceLinks = [...new Set([...existing.evidenceLinks, ...event.evidenceLinks])];
    } else {
      map.set(key, { ...event });
    }
  }

  return Array.from(map.values());
}

// Run test - should PASS
// npm test
```

### 3. Refactor (Refactor Phase)

```javascript
// Optimize if needed while keeping tests green
```

## Key Files

```
src/
├── models/           # Data models (Event, SearchResult, etc.)
├── services/
│   ├── config/       # Config file parsing (docs/eventsByTypeList.md, docs/sourceBookmarks.md, docs/targetCriteria.md)
│   ├── search/       # Event searching, deduplication, coordination
│   ├── analysis/     # Key facts extraction, sentiment analysis
│   └── formatter/    # NDJSON formatting
├── api/              # Fastify server, routes, middleware
├── cli/              # CLI interface
└── lib/              # Shared utilities (date calculations)

docs/
├── eventsByTypeList.md   # Event taxonomy (Korean with English technical terms)
├── sourceBookmarks.md    # Official sources (Korean with English technical terms)
└── targetCriteria.md     # 15 US exchanges with MIC codes (Korean with English technical terms)

tests/
├── contract/         # Schema validation tests
├── integration/      # Source fetching, config reload tests
└── unit/             # Deduplication, sentiment, date parsing, markdown parsing tests
```

## Common Tasks

### Add New Event Type

1. Edit `docs/eventsByTypeList.md` (add new event code in appropriate sector section, using Korean with English technical terms)
2. Wait 5 minutes for auto-reload (or restart service)
3. Verify with CLI: `npm run cli -- query -s 1 -e 1 --format table`

### Add New Source

1. Edit `docs/sourceBookmarks.md` (add official government/institutional URL in appropriate category, using Korean with English technical terms)
2. Wait 5 minutes for auto-reload
3. Test source connectivity: `npm run test:integration -- test_source_fetching.test.js`

### Add New Exchange

1. Edit `docs/targetCriteria.md` (add exchange with MIC code, using Korean with English technical terms)
2. Wait 5 minutes for auto-reload (or restart service)
3. Verify exchange filtering works correctly

### Debug Timeout Issues

```bash
# Enable verbose logging
npm run cli -- query -s 3 -e 4 --verbose 2>&1 | tee debug.log

# Check timeout duration per source
grep "duration" debug.log
```

## Troubleshooting

### Tests Failing

```bash
# Run with verbose output
npm test -- --reporter=verbose

# Run specific test file
npm test tests/unit/test_deduplication.test.js

# Clear cache and re-run
npm run test:clean
```

### Source Timeouts

- Check `sourceBookmarks.md` URLs are accessible
- Verify timeout settings (10-15s per source)
- Check network connectivity
- Review logs for rate limiting

### Configuration Not Loading

- Verify markdown file syntax (files are in Korean with English technical terms)
- Check file paths point to docs/ folder (not config/)
- Verify all three configuration files exist: docs/eventsByTypeList.md, docs/sourceBookmarks.md, docs/targetCriteria.md
- Restart service to force reload
- Review logs for parsing errors (especially related to Korean text encoding)

## Next Steps

- Read [data-model.md](./data-model.md) for entity schemas
- Review [contracts/api.openapi.yaml](./contracts/api.openapi.yaml) for API specification
- Review [contracts/cli.md](./contracts/cli.md) for CLI interface
- Follow TDD workflow for all new features
- Write contract tests for schema validation

## Resources

- [Fastify Documentation](https://www.fastify.io/)
- [got HTTP Client](https://github.com/sindresorhus/got)
- [Vitest Testing Framework](https://vitest.dev/)
- [Render.com Deployment Guide](https://render.com/docs/node-express)
