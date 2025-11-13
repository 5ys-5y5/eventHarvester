# Implementation Plan: Stock Event Harvesting API

**Branch**: `001-stock-event-api` | **Date**: 2025-11-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-stock-event-api/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

A JSON-only web API deployed on Render.com that detects significant stock market events within user-specified date ranges (using relative natural number offsets) and returns NDJSON-formatted event bundles containing [ticker, event classification, impact analysis summary, evidence links]. The API searches across comprehensive event taxonomy from docs/eventsByTypeList.md (Common types: perfGuide, macroCal, mktStruct, treasury, geoRisk + sector-specific Unique categories for 11+ sectors), targets 15 US exchanges defined in docs/targetCriteria.md (XNYS, XNAS, XASE, LTSE, ARCX, XCIS, XCHI, XBOS, XPSX, BATY, BATS, EDGA, EDGX, IEXG, MEMX, EPRL), uses official sources from docs/sourceBookmarks.md, deduplicates events from multiple sources, and provides full search coverage transparency through a checklist.

## Technical Context

**Language/Version**: Node.js 18+ (selected for 40-60% faster concurrent HTTP handling, native async I/O, and superior scalability for I/O-bound workloads)
**Primary Dependencies**:
- Fastify (web framework - fastest Node.js framework, JSON-first design)
- got (HTTP client - advanced timeout config, built-in retries, HTTP/2 support)
- marked (markdown parser - 15.6M weekly downloads, fastest for simple parsing, needed for docs/eventsByTypeList.md and docs/sourceBookmarks.md which are in Korean with English technical terms)
- sentiment (sentiment analysis - 2x faster than alternatives, AFINN-based lexicon)
**Storage**: Session-only (in-memory); configuration files in docs/ folder (docs/eventsByTypeList.md, docs/sourceBookmarks.md, docs/targetCriteria.md)
**Testing**: Vitest (10-20x faster than Jest, modern ESM support, Jest-compatible API)
**Target Platform**: Render.com web service (Linux container, Node.js 18+ runtime)
**Project Type**: Single web API service
**Performance Goals**:
- 30-60 second response time for 30-day queries (target 30s, extend to 60s max)
- 100 concurrent requests without degradation
- 90%+ event type search coverage per query
**Constraints**:
- 10-15 second timeout per source request
- 60 second maximum overall request timeout
- Session-only data storage (no persistence)
- NDJSON output format
- Preserve exact field names: eventsByTypeList, sourceBookmarks, targetCriteria, outputSchema
- Configuration files are in Korean with English technical terms in docs/ folder
- Configuration files (docs/targetCriteria.md, docs/eventsByTypeList.md, docs/sourceBookmarks.md) change frequently and must be loaded dynamically; NO hard-coding of exchanges, event types, or sources allowed
**Scale/Scope**:
- Support comprehensive event taxonomy from docs/eventsByTypeList.md across 11+ sectors (IT, Comms, ConsDisc, ConsStaples, Bio, MedDev, Energy, IndTransDef, Materials, Financials, REITs, Utilities)
- Target 15 US exchanges from docs/targetCriteria.md with MIC codes
- Handle multiple concurrent source searches across official government/institutional sources from docs/sourceBookmarks.md
- Process markdown configuration files dynamically (files in Korean with English technical terms)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Library-First ✅ PASS

- **Compliance**: API will be structured as standalone libraries:
  - Event search/deduplication library
  - Source fetching/timeout management library
  - Configuration parser library (markdown → structured data, handles Korean text with English technical terms from docs/ folder)
  - Impact analysis/sentiment extraction library
  - NDJSON formatter library
- Each library independently testable with clear singular purpose
- API layer orchestrates library calls

### Principle II: Multi-Interface Design ⚠️ PARTIAL

- **Current**: JSON API only (programmatic interface)
- **Constitutional Requirement**: Must also expose CLI interface
- **Remediation Plan**: Add CLI wrapper accepting same date parameters, outputting NDJSON to stdout
- **Justification**: Spec explicitly states "JSON-only web API" but constitution requires multi-interface
- **Action**: Phase 1 will design CLI interface alongside API contracts

### Principle III: Test-First Development (NON-NEGOTIABLE) ✅ WILL COMPLY

- **Commitment**: TDD will be strictly followed during implementation
- **Test Strategy**:
  - Unit tests for each library (date parsing, deduplication logic, sentiment extraction, markdown parsing of Korean text with English terms)
  - Integration tests for source fetching with timeouts from docs/sourceBookmarks.md sources
  - Contract tests for API endpoints and CLI interface
  - End-to-end tests for full query → response flow with actual configuration from docs/ folder

### Principle IV: Integration Testing ✅ WILL COMPLY

- **Contract Tests**: Required for:
  - Event schema validation (outputSchema compliance)
  - Configuration file format (docs/eventsByTypeList.md, docs/sourceBookmarks.md, docs/targetCriteria.md - Korean with English technical terms)
  - External source response handling from official government/institutional sources
- **Inter-Service**: N/A (single service)
- **Shared Schemas**: outputSchema validation across all event bundles

### Principle V: Observability ✅ WILL COMPLY

- **Structured Logging**: JSON-formatted logs for:
  - Search coverage per request (which sources from docs/sourceBookmarks.md attempted/succeeded/failed)
  - Timeout events (per-source and overall)
  - Deduplication statistics
  - Configuration reload events (docs/eventsByTypeList.md, docs/sourceBookmarks.md, docs/targetCriteria.md)
- **CLI Debuggability**: CLI interface provides text stream visibility
- **Error Context**: All errors include correlation ID, timestamp, relevant event type/source

### Principle VI: Versioning & Breaking Changes ✅ WILL COMPLY

- **Initial Version**: 1.0.0
- **Semantic Versioning**:
  - MAJOR: Changes to outputSchema structure, removal of event types from docs/eventsByTypeList.md
  - MINOR: New event types added to docs/eventsByTypeList.md, new sources in docs/sourceBookmarks.md, new exchanges in docs/targetCriteria.md
  - PATCH: Bug fixes in deduplication, sentiment analysis improvements, markdown parsing fixes
- **Changelog**: Maintained for each release

### Principle VII: Simplicity & YAGNI ✅ PASS

- **Simple Approach**:
  - Direct HTTP requests to sources (no complex retry frameworks initially)
  - Markdown file parsing (no database)
  - In-memory deduplication (no external cache)
  - Basic language pattern matching for sentiment (no ML models initially)
- **Complexity Deferred**:
  - Parallel source searching (start sequential, parallelize if needed)
  - Advanced sentiment analysis (start with keyword matching)
  - Caching layer (session-only as specified)
- **Note on Dynamic Configuration**: Configuration parser (Phase 2) is CRITICAL PATH - must be complete and tested before any search implementation begins, as configuration files change frequently and are the SINGLE SOURCE OF TRUTH

### Principle VIII: Security-First Design ✅ WILL COMPLY

- **Secure Defaults**: API key authentication, HTTPS only on Render.com
- **Input Validation**: All date parameters validated (positive integers, range limits)
- **Threat Model**:
  - Source URL injection (validate docs/sourceBookmarks.md contains only whitelisted official government/institutional domains)
  - DoS via large date ranges (enforce 365-day limits)
  - Sensitive data exposure (ensure no API keys/credentials in logs)
  - Malicious configuration files (validate markdown structure from docs/ folder)
- **Security Testing**: Tests for input validation, timeout enforcement, error message leakage

**Gate Status**: ⚠️ ONE ISSUE - Multi-Interface requirement partially met
**Action Required**: Design CLI interface in Phase 1 alongside API contracts

## Project Structure

### Documentation (this feature)

```text
specs/001-stock-event-api/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── api.openapi.yaml # REST API contract
│   └── cli.md           # CLI interface contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── models/
│   ├── event.py         # Event entity (ticker, type, date, summary, evidence links)
│   ├── search_result.py # Source search outcome
│   └── coverage.py      # Search coverage checklist
├── services/
│   ├── config/
│   │   ├── parser.py    # Markdown config file parser
│   │   └── watcher.py   # File change detection (5-minute reload)
│   ├── search/
│   │   ├── fetcher.py   # Source HTTP client with timeout
│   │   ├── deduplicator.py # Event deduplication logic
│   │   └── coordinator.py  # Orchestrates multi-source search
│   ├── analysis/
│   │   ├── extractor.py # Key facts extraction
│   │   └── sentiment.py # Sentiment classification
│   └── formatter/
│       └── ndjson.py    # NDJSON output formatter
├── api/
│   ├── server.py        # Web framework setup
│   ├── routes.py        # API endpoints
│   └── middleware.py    # Logging, auth, error handling
├── cli/
│   └── main.py          # CLI interface wrapper
└── lib/
    └── date_utils.py    # Relative date offset calculations

tests/
├── contract/
│   ├── test_api_schema.py
│   ├── test_cli_interface.py
│   └── test_event_schema.py
├── integration/
│   ├── test_source_fetching.py
│   ├── test_config_reload.py
│   └── test_timeout_handling.py
└── unit/
    ├── test_deduplication.py
    ├── test_sentiment.py
    ├── test_date_parsing.py
    └── test_markdown_parser.py

docs/
├── eventsByTypeList.md  # Event taxonomy configuration (Korean with English technical terms)
├── sourceBookmarks.md   # Source URLs and metadata (Korean with English technical terms, official sources)
└── targetCriteria.md    # Target exchange list with MIC codes (Korean with English technical terms)
```

**Structure Decision**: Single project structure selected because this is a standalone web API service with supporting libraries. The structure separates models, services (business logic libraries), API layer, CLI interface, and shared utilities. Testing follows the constitutional requirement for unit, integration, and contract tests.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Multi-Interface partial compliance | Spec specified "JSON-only web API" | CLI interface will be added in Phase 1 to comply with Constitution Principle II - necessary for debugging and scripting capabilities per constitutional rationale |
