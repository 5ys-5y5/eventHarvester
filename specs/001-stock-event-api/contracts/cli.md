# CLI Interface Contract: Stock Event Harvesting API

## Overview

The CLI interface provides command-line access to the Stock Event Harvesting API, enabling scripting, automation, and debugging workflows. It wraps the API functionality with text I/O protocol (stdin/args → stdout, errors → stderr).

## Constitutional Compliance

This CLI interface satisfies **Constitution Principle II: Multi-Interface Design** which requires:
- CLI interface using text I/O protocol
- JSON and human-readable output formats
- Clear and actionable error messages
- Concrete usage examples

## Command Syntax

```bash
event-harvest query [OPTIONS]
```

## Arguments

### Required

- `--start-date <N>` or `-s <N>`: Relative offset from today in days (natural number, 1-365)
- `--end-date <N>` or `-e <N>`: Duration of search window in days (natural number, 1-365)

### Optional

- `--format <FORMAT>` or `-f <FORMAT>`: Output format (default: `ndjson`)
  - `ndjson`: NDJSON format (one JSON object per line)
  - `json`: Pretty-printed JSON array
  - `table`: Human-readable table format
- `--api-key <KEY>`: API key for authentication (or use `EVENT_HARVEST_API_KEY` environment variable)
- `--base-url <URL>`: API base URL (default: `https://event-harvester.onrender.com`)
- `--verbose` or `-v`: Enable verbose logging to stderr
- `--help` or `-h`: Display help message
- `--version`: Display version information

## Output Formats

### NDJSON Format (Default)

One JSON object per line, suitable for streaming processing with tools like `jq`.

```bash
$ event-harvest query -s 3 -e 4

{"type":"event","data":{"ticker":"AAPL","eventType":"earnGuide","eventDate":"2025-11-15","impactSummary":{"keyFacts":["Q4 revenue beat expectations by 5%"],"sentiment":"positive"},"evidenceLinks":["https://sec.gov/..."]}}
{"type":"event","data":{"ticker":"MSFT","eventType":"aiDcCapex","eventDate":"2025-11-16","impactSummary":{"keyFacts":["$10B datacenter expansion announced"],"sentiment":"positive"},"evidenceLinks":["https://microsoft.com/..."]}}
{"type":"coverage","data":{"queryId":"550e8400-e29b-41d4-a716-446655440000","dateRange":{"startDate":3,"endDate":4,"computedStart":"2025-11-15","computedEnd":"2025-11-18"},"summary":{"totalEventTypes":50,"successfulSearches":47,"failedSearches":2,"timeoutSearches":1,"coveragePercentage":94.00}}}
```

### JSON Format

Pretty-printed JSON for readability.

```bash
$ event-harvest query -s 3 -e 4 --format json

{
  "events": [
    {
      "ticker": "AAPL",
      "eventType": "earnGuide",
      "eventDate": "2025-11-15",
      "impactSummary": {
        "keyFacts": ["Q4 revenue beat expectations by 5%"],
        "sentiment": "positive"
      },
      "evidenceLinks": ["https://sec.gov/..."]
    }
  ],
  "coverage": {
    "queryId": "550e8400-e29b-41d4-a716-446655440000",
    "dateRange": {
      "startDate": 3,
      "endDate": 4,
      "computedStart": "2025-11-15",
      "computedEnd": "2025-11-18"
    },
    "summary": {
      "totalEventTypes": 50,
      "successfulSearches": 47,
      "failedSearches": 2,
      "timeoutSearches": 1,
      "coveragePercentage": 94.00
    }
  }
}
```

### Table Format

Human-readable table for quick visual inspection.

```bash
$ event-harvest query -s 3 -e 4 --format table

Stock Event Harvesting Results
Query Date Range: Nov 15 - Nov 18, 2025 (from today +3 days, 4-day duration)

┌────────┬─────────────┬────────────┬────────────┬──────────────────────────────────────────┐
│ Ticker │ Event Type  │ Date       │ Sentiment  │ Key Facts                                │
├────────┼─────────────┼────────────┼────────────┼──────────────────────────────────────────┤
│ AAPL   │ earnGuide   │ 2025-11-15 │ positive   │ Q4 revenue beat expectations by 5%       │
│        │             │            │            │ iPhone sales up 12% YoY                  │
├────────┼─────────────┼────────────┼────────────┼──────────────────────────────────────────┤
│ MSFT   │ aiDcCapex   │ 2025-11-16 │ positive   │ $10B datacenter expansion announced      │
└────────┴─────────────┴────────────┴────────────┴──────────────────────────────────────────┘

Search Coverage: 94.00% (47/50 event types successfully searched)
- Successful: 47
- Failed: 2
- Timeout: 1
- Request ID: 550e8400-e29b-41d4-a716-446655440000
```

## Error Handling

All errors are written to **stderr** with clear messages and exit codes.

### Exit Codes

- `0`: Success
- `1`: Invalid arguments
- `2`: Authentication failure
- `3`: API error (4xx/5xx response)
- `4`: Network error
- `5`: Timeout

### Error Output Examples

**Invalid Arguments**:
```bash
$ event-harvest query -s 0 -e 4
Error: Invalid argument 'start-date'
startDate must be a positive integer between 1 and 365

Usage: event-harvest query [OPTIONS]
Run 'event-harvest query --help' for more information.
Exit code: 1
```

**Authentication Failure**:
```bash
$ event-harvest query -s 3 -e 4
Error: Authentication required
API key not provided. Set EVENT_HARVEST_API_KEY environment variable or use --api-key option.

Exit code: 2
```

**API Error**:
```bash
$ event-harvest query -s 3 -e 4
Error: API request failed (HTTP 429)
Rate limit exceeded. Please retry after 60 seconds.

Request ID: 550e8400-e29b-41d4-a716-446655440000
Exit code: 3
```

## Verbose Logging

When `--verbose` flag is used, detailed logs are written to stderr while results go to stdout.

```bash
$ event-harvest query -s 3 -e 4 --verbose

[2025-11-12T10:30:00Z] INFO: Initializing query...
[2025-11-12T10:30:00Z] INFO: Date range: 2025-11-15 to 2025-11-18
[2025-11-12T10:30:01Z] INFO: Loading configuration...
[2025-11-12T10:30:01Z] INFO: Found 50 event types in eventsByTypeList
[2025-11-12T10:30:01Z] INFO: Found 12 sources in sourceBookmarks
[2025-11-12T10:30:02Z] INFO: Searching source 'sec-edgar' for 'earnGuide'...
[2025-11-12T10:30:04Z] INFO: Source 'sec-edgar' returned 3 events (2.1s)
[2025-11-12T10:30:15Z] WARN: Source 'bloomberg' timed out after 15s
[2025-11-12T10:30:45Z] INFO: Deduplicating events...
[2025-11-12T10:30:45Z] INFO: Search complete. Coverage: 94.00%

{"type":"event","data":{...}}
...
```

## Piping and Integration

### With jq

Extract specific fields:
```bash
$ event-harvest query -s 3 -e 4 | jq -r 'select(.type=="event") | .data.ticker'
AAPL
MSFT
```

Count events by sentiment:
```bash
$ event-harvest query -s 3 -e 4 | jq -s '[.[] | select(.type=="event") | .data.impactSummary.sentiment] | group_by(.) | map({sentiment: .[0], count: length})'
[
  {"sentiment": "positive", "count": 15},
  {"sentiment": "neutral", "count": 5},
  {"sentiment": "negative", "count": 3}
]
```

### With grep

Filter events for specific ticker:
```bash
$ event-harvest query -s 3 -e 4 | grep '"ticker":"AAPL"'
```

### In Bash Scripts

```bash
#!/bin/bash

# Query events and check coverage
RESPONSE=$(event-harvest query -s 7 -e 14)
COVERAGE=$(echo "$RESPONSE" | jq -r 'select(.type=="coverage") | .data.summary.coveragePercentage')

if (( $(echo "$COVERAGE < 90" | bc -l) )); then
  echo "Warning: Low search coverage ($COVERAGE%)" >&2
  exit 1
fi

echo "Coverage OK: $COVERAGE%"
```

## Environment Variables

- `EVENT_HARVEST_API_KEY`: API key for authentication (avoids passing key in command line)
- `EVENT_HARVEST_BASE_URL`: Override default API base URL
- `EVENT_HARVEST_TIMEOUT`: Override default request timeout in seconds (default: 60)

## Help Output

```bash
$ event-harvest query --help

event-harvest query - Query stock events by date range

USAGE:
    event-harvest query [OPTIONS]

OPTIONS:
    -s, --start-date <N>     Relative offset from today in days (1-365) [required]
    -e, --end-date <N>       Duration of search window in days (1-365) [required]
    -f, --format <FORMAT>    Output format: ndjson, json, table [default: ndjson]
        --api-key <KEY>      API key for authentication (or use EVENT_HARVEST_API_KEY)
        --base-url <URL>     API base URL [default: https://event-harvester.onrender.com]
    -v, --verbose            Enable verbose logging to stderr
    -h, --help               Display this help message
        --version            Display version information

EXAMPLES:
    # Query events from 3 days after today for a 4-day duration (NDJSON output)
    $ event-harvest query -s 3 -e 4

    # Same query with pretty-printed JSON
    $ event-harvest query -s 3 -e 4 --format json

    # Human-readable table format
    $ event-harvest query -s 3 -e 4 --format table

    # Extract tickers using jq
    $ event-harvest query -s 3 -e 4 | jq -r 'select(.type=="event") | .data.ticker'

    # Verbose mode with custom API URL
    $ event-harvest query -s 7 -e 14 --verbose --base-url http://localhost:3000

AUTHENTICATION:
    Set the EVENT_HARVEST_API_KEY environment variable:
    $ export EVENT_HARVEST_API_KEY=your-api-key-here
    $ event-harvest query -s 3 -e 4

    Or pass directly:
    $ event-harvest query -s 3 -e 4 --api-key your-api-key-here

For more information, visit: https://github.com/yourusername/eventHarvester
```

## Testing Contract

### Unit Tests

```bash
# Test valid arguments
$ event-harvest query -s 3 -e 4 --dry-run
✓ Arguments validated successfully

# Test invalid start date
$ event-harvest query -s 0 -e 4
✗ Error: startDate must be >= 1
Exit code: 1

# Test missing required argument
$ event-harvest query -s 3
✗ Error: Missing required argument: --end-date
Exit code: 1
```

### Integration Tests

```bash
# Test against local API
$ export EVENT_HARVEST_BASE_URL=http://localhost:3000
$ event-harvest query -s 3 -e 4 --format json
✓ Successfully retrieved events

# Test authentication
$ unset EVENT_HARVEST_API_KEY
$ event-harvest query -s 3 -e 4
✗ Error: Authentication required
Exit code: 2
```

## Implementation Notes

The CLI is a thin wrapper around the API client library:

1. Parse and validate command-line arguments
2. Call API client with parameters
3. Format response according to `--format` flag
4. Write to stdout (results) and stderr (errors/logs)
5. Exit with appropriate code

**Dependencies**:
- `commander` or `yargs` for argument parsing
- `cli-table3` for table formatting
- API client library (shared with programmatic interface)
