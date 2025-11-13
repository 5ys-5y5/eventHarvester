# Tasks: Stock Event Harvesting API

**Input**: Design documents from `/specs/001-stock-event-api/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Branch**: `001-stock-event-api`

**Tests**: This project follows Test-Driven Development (TDD) per Constitutional Principle III (NON-NEGOTIABLE). All test tasks MUST be completed BEFORE implementation tasks, following the Red-Green-Refactor cycle.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Project structure follows single web API service pattern:
- `src/` - Source code at repository root
- `tests/` - Test files at repository root
- `docs/` - Configuration files at repository root (eventsByTypeList.md, sourceBookmarks.md, targetCriteria.md - Korean with English technical terms)

## ⚠️ CRITICAL: Dynamic Configuration Requirement

**The three configuration files in docs/ are the SINGLE SOURCE OF TRUTH and change frequently**:
- docs/targetCriteria.md (which exchanges to search)
- docs/eventsByTypeList.md (which events are significant)
- docs/sourceBookmarks.md (where to search for events)

**Implementation Requirements**:
- Load these files dynamically (never hard-code exchanges, event types, or sources)
- Validate configuration before each search
- Use cache with short TTL (5 minutes) to handle frequent changes
- Current file contents show FORMAT structure; actual values will be added/modified frequently

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per plan.md specifications

- [X] T001 Create project directory structure: src/{models,services/{config,search,analysis,formatter},api,cli,lib}, tests/{contract,integration,unit} (docs/ folder already exists with configuration files)
- [X] T002 Initialize Node.js 18+ project with package.json and configure ES modules
- [X] T003 [P] Install Fastify framework and configure basic server setup
- [X] T004 [P] Install core dependencies: got (HTTP client), marked (markdown parser), sentiment (sentiment analysis), uuid (correlation IDs)
- [X] T005 [P] Install Vitest testing framework and configure test scripts in package.json
- [X] T006 [P] Configure ESLint and Prettier for code quality
- [X] T007 [P] Create .gitignore with Node.js patterns and environment files
- [X] T008 [P] Verify configuration files exist in docs/ folder: docs/eventsByTypeList.md (Korean with English terms, contains Common types and Unique sector-specific types), docs/sourceBookmarks.md (Korean with English terms, contains official government/institutional sources), docs/targetCriteria.md (Korean with English terms, contains 15 US exchanges with MIC codes)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create Event model with validation in src/models/event.js (ticker, eventType, eventDate, impactSummary, evidenceLinks)
- [ ] T010 [P] Create ImpactAnalysis model with validation in src/models/impact_analysis.js (keyFacts, sentiment)
- [ ] T011 [P] Create EventType model in src/models/event_type.js (name, category, sector, description)
- [ ] T012 [P] Create Source model in src/models/source.js (name, url, reliability, eventTypes, rateLimit)
- [ ] T013 [P] Create SearchResult model in src/models/search_result.js (source, eventType, status, events, error, duration)
- [ ] T014 [P] Create SearchCoverageChecklist model in src/models/coverage.js (queryId, dateRange, eventTypeCoverage, summary)
- [ ] T015 Implement date utility functions in src/lib/date_utils.js (relative offset calculations, date range validation)
- [ ] T016 Implement markdown parser for docs/eventsByTypeList.md in src/services/config/parser.js (parse Korean text with English technical terms, extract Common and Unique event types across 11+ sectors) ⚠️ CRITICAL: Do NOT hard-code any values; implementation must parse dynamically as configuration changes frequently
- [ ] T017 Implement markdown parser for docs/sourceBookmarks.md in src/services/config/parser.js (parse Korean text with English technical terms, extract official government/institutional source URLs by category) ⚠️ CRITICAL: Do NOT hard-code any values; implementation must parse dynamically as configuration changes frequently
- [ ] T018 Implement markdown parser for docs/targetCriteria.md in src/services/config/parser.js (parse Korean text with English technical terms, extract US exchanges with MIC codes) ⚠️ CRITICAL: Do NOT hard-code any values; implementation must parse dynamically as configuration changes frequently
- [ ] T018a Implement configuration file watcher in src/services/config/watcher.js (5-minute reload cycle for all three docs/ files) ⚠️ CRITICAL: This ensures system always uses current configuration as files change frequently
- [ ] T019 Implement NDJSON formatter in src/services/formatter/ndjson.js (streaming event output)
- [ ] T020 Setup Fastify server with routing structure in src/api/server.js
- [ ] T021 [P] Implement authentication middleware in src/api/middleware.js (API key validation via X-API-Key header)
- [ ] T022 [P] Implement logging middleware in src/api/middleware.js (structured JSON logging with correlation IDs)
- [ ] T023 [P] Implement error handling middleware in src/api/middleware.js (standardized error responses)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel
**⚠️ Configuration parsers (T016-T018) are CRITICAL PATH** - they must work correctly as configuration files change frequently and are the SINGLE SOURCE OF TRUTH

---

## Phase 3: User Story 1 - Query Events by Date Range (Priority: P1) 🎯 MVP

**Goal**: Enable financial analysts to query significant corporate events within a specified date range, receiving NDJSON-formatted event bundles with ticker symbols, event classifications, impact summaries, and evidence links.

**Independent Test**: Send API request with relative date offsets (startDate=3, endDate=4) and receive NDJSON output containing deduplicated events with all required fields.

### Tests for User Story 1 (TDD - WRITE FIRST)

> **CRITICAL: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T024 [P] [US1] Contract test for GET /api/v1/events schema validation in tests/contract/test_events_schema.test.js
- [ ] T025 [P] [US1] Contract test for NDJSON output format compliance in tests/contract/test_ndjson_format.test.js
- [ ] T026 [P] [US1] Unit test for date offset calculation in tests/unit/test_date_parsing.test.js
- [ ] T027 [P] [US1] Unit test for event deduplication logic in tests/unit/test_deduplication.test.js
- [ ] T028 [P] [US1] Unit test for sentiment analysis in tests/unit/test_sentiment.test.js
- [ ] T029 [P] [US1] Integration test for source fetching with timeout in tests/integration/test_source_fetching.test.js
- [ ] T030 [US1] Integration test for end-to-end event query flow in tests/integration/test_event_query.test.js

### Implementation for User Story 1

- [ ] T031 [US1] Implement HTTP source fetcher with 10-15s timeout in src/services/search/fetcher.js (depends on got library from T004, fetches from official government/institutional URLs from docs/sourceBookmarks.md)
- [ ] T032 [US1] Implement key facts extractor from HTML/text sources in src/services/analysis/extractor.js
- [ ] T033 [US1] Implement sentiment classifier using AFINN-based analysis in src/services/analysis/sentiment.js
- [ ] T034 [US1] Implement event deduplication algorithm in src/services/search/deduplicator.js (merge by ticker+eventType+eventDate, combine evidence links from multiple sources)
- [ ] T035 [US1] Implement search coordinator orchestrating multi-source searches in src/services/search/coordinator.js (60s overall timeout, searches across event types from docs/eventsByTypeList.md using sources from docs/sourceBookmarks.md, filters by exchanges from docs/targetCriteria.md) ⚠️ MUST load current configuration from docs/ files (never use hard-coded values); configuration changes frequently
- [ ] T036 [US1] Implement GET /api/v1/events route handler in src/api/routes.js (validate startDate/endDate, call coordinator, stream NDJSON)
- [ ] T037 [US1] Add input validation for date parameters in src/api/routes.js (positive integers, 1-365 range)
- [ ] T038 [US1] Add error handling for malformed requests in src/api/routes.js (400 Bad Request responses)
- [ ] T039 [US1] Add logging for query operations with correlation ID in src/api/routes.js (log which event types from docs/eventsByTypeList.md were searched, which sources from docs/sourceBookmarks.md were used)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can query events and receive NDJSON responses with deduplicated events

---

## Phase 4: User Story 2 - Validate Search Coverage (Priority: P2)

**Goal**: Provide transparency about search completeness by returning a checklist showing which event types were searched, which sources were used, and success/failure status for each.

**Independent Test**: Make any event query and verify the response includes a comprehensive checklist with eventsByTypeList coverage, source attempts, and success/failure status.

### Tests for User Story 2 (TDD - WRITE FIRST)

- [ ] T040 [P] [US2] Contract test for SearchCoverageChecklist schema in tests/contract/test_coverage_schema.test.js
- [ ] T041 [P] [US2] Unit test for coverage percentage calculation in tests/unit/test_coverage_calculation.test.js
- [ ] T042 [US2] Integration test for partial failure handling in tests/integration/test_partial_failures.test.js

### Implementation for User Story 2

- [ ] T043 [P] [US2] Implement SearchResult tracking in src/services/search/coordinator.js (record status, duration, errors per source from docs/sourceBookmarks.md for each event type from docs/eventsByTypeList.md)
- [ ] T044 [US2] Implement SearchCoverageChecklist generation in src/services/search/coordinator.js (aggregate SearchResults by eventType, show which sources from docs/sourceBookmarks.md were attempted for each event type)
- [ ] T045 [US2] Implement coverage summary calculation in src/services/search/coordinator.js (totalEventTypes from docs/eventsByTypeList.md, successful/failed/timeout counts, coverage percentage)
- [ ] T046 [US2] Update NDJSON formatter to append coverage checklist as final line in src/services/formatter/ndjson.js
- [ ] T047 [US2] Update GET /api/v1/events to include coverage in response in src/api/routes.js
- [ ] T048 [US2] Add logging for search coverage statistics in src/api/routes.js (which event types had full/partial/no coverage)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users receive event data with full transparency about search coverage

---

## Phase 5: User Story 3 - Dynamic Configuration Updates (Priority: P3)

**Goal**: Enable system administrators to add new event types or update source bookmarks without code deployment, allowing the service to adapt to changing market conditions.

**Independent Test**: Update eventsByTypeList.md or sourceBookmarks.md and verify subsequent API requests reflect changes without service restart.

### Tests for User Story 3 (TDD - WRITE FIRST)

- [ ] T049 [P] [US3] Unit test for markdown configuration parsing in tests/unit/test_markdown_parser.test.js
- [ ] T050 [P] [US3] Integration test for configuration file reload in tests/integration/test_config_reload.test.js
- [ ] T051 [US3] Integration test for hot-reload without service restart in tests/integration/test_hot_reload.test.js

### Implementation for User Story 3

- [ ] T052 [US3] Implement file change detection in src/services/config/watcher.js (monitor docs/eventsByTypeList.md, docs/sourceBookmarks.md, and docs/targetCriteria.md)
- [ ] T053 [US3] Implement 5-minute polling interval for configuration reload in src/services/config/watcher.js (check all three docs/ files)
- [ ] T054 [US3] Implement configuration cache invalidation on file changes in src/services/config/watcher.js
- [ ] T055 [US3] Add error handling for malformed configuration files in src/services/config/parser.js (log errors, keep previous valid config, handle Korean text encoding issues)
- [ ] T056 [US3] Add logging for configuration reload events in src/services/config/watcher.js (log which file was reloaded, new counts for event types/sources/exchanges)
- [ ] T057 [US3] Update search coordinator to use latest configuration in src/services/search/coordinator.js (dynamically reload event types, sources, and target exchanges)

**Checkpoint**: All user stories should now be independently functional - the service dynamically adapts to configuration changes

---

## Phase 6: CLI Interface (Constitutional Requirement)

**Goal**: Provide CLI wrapper to satisfy Constitutional Principle II (Multi-Interface Design)

**Independent Test**: Run CLI command with date parameters and verify NDJSON output to stdout, errors to stderr.

### Tests for CLI Interface (TDD - WRITE FIRST)

- [ ] T058 [P] Contract test for CLI argument parsing in tests/contract/test_cli_interface.test.js
- [ ] T059 [P] Unit test for CLI output formatting in tests/unit/test_cli_format.test.js
- [ ] T060 Integration test for CLI end-to-end flow in tests/integration/test_cli_e2e.test.js

### Implementation for CLI Interface

- [ ] T061 [P] Implement CLI argument parser in src/cli/main.js (--start-date, --end-date, --format, --api-key, --base-url, --verbose)
- [ ] T062 [P] Implement CLI output formatters in src/cli/main.js (ndjson, json, table formats)
- [ ] T063 Implement CLI API client in src/cli/main.js (call local or remote API endpoint)
- [ ] T064 Add CLI help text and version display in src/cli/main.js
- [ ] T065 Add CLI error handling with appropriate exit codes in src/cli/main.js (0=success, 1=invalid args, 2=auth failure, 3=API error, 4=network error, 5=timeout)
- [ ] T066 Add verbose logging to stderr when --verbose flag is used in src/cli/main.js
- [ ] T067 Create CLI executable script and update package.json bin field

**Checkpoint**: Both API and CLI interfaces are fully functional per constitutional requirements

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and prepare for production deployment

- [ ] T068 [P] Implement GET /health endpoint in src/api/routes.js (status, version, uptime)
- [ ] T069 [P] Add rate limiting middleware in src/api/middleware.js (prevent abuse)
- [ ] T070 [P] Implement request timeout enforcement (60s max) in src/api/middleware.js
- [ ] T071 [P] Add security headers (CORS, CSP) in src/api/middleware.js
- [ ] T072 [P] Verify docs/eventsByTypeList.md contains all Common event types (perfGuide, macroCal, mktStruct, treasury, geoRisk) and Unique sector-specific types across 11+ sectors
- [ ] T073 [P] Verify docs/sourceBookmarks.md contains comprehensive official government/institutional sources organized by category (Disclosure/Market Structure, Monetary Policy/Macro, Energy/Commodities/Disasters, Healthcare, Transportation, Communications, Utilities, Indices/Options, Treasury, Automotive, Trade/Export)
- [ ] T073a [P] Verify docs/targetCriteria.md contains all 15 US exchanges with correct MIC codes (XNYS, XNAS, XASE, LTSE, ARCX, XCIS, XCHI, XBOS, XPSX, BATY, BATS, EDGA, EDGX, IEXG, MEMX, EPRL)
- [ ] T074 [P] Add environment variable configuration for API keys and base URLs
- [ ] T075 [P] Create Render.com deployment configuration (render.yaml)
- [ ] T076 [P] Update README.md with quickstart instructions
- [ ] T077 [P] Add JSDoc documentation to all public functions
- [ ] T078 Code review and refactoring pass across all modules
- [ ] T079 Performance optimization review (parallel source fetching opportunities)
- [ ] T080 Security audit (input validation, API key handling, error message leakage)
- [ ] T081 Run full test suite and verify 100% pass rate
- [ ] T082 Validate quickstart.md instructions work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **CLI Interface (Phase 6)**: Can start after User Story 1 (P1) is complete
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 coordinator but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances configuration loading but independently testable

### Within Each User Story (TDD Workflow)

1. **RED Phase**: Write tests FIRST (T024-T030 for US1, etc.) - verify they FAIL
2. **GREEN Phase**: Implement code (T031-T039 for US1, etc.) - make tests PASS
3. **REFACTOR Phase**: Clean up code while keeping tests green
4. **Checkpoint**: Verify story works independently before moving to next priority

### Parallel Opportunities

- **Phase 1**: Tasks T003-T008 can all run in parallel
- **Phase 2**: Tasks T010-T014 (models) can run in parallel; T021-T023 (middleware) can run in parallel
- **US1 Tests**: Tasks T024-T029 can all run in parallel (write all tests together)
- **US1 Models/Services**: Tasks T032-T033 (analysis services) can run in parallel
- **US2 Tests**: Tasks T040-T041 can run in parallel
- **US2 Implementation**: Task T043-T044 can be combined in same file
- **US3 Tests**: Tasks T049-T050 can run in parallel
- **Phase 6 Tests**: Tasks T058-T059 can run in parallel
- **Phase 6 Implementation**: Tasks T061-T062 can run in parallel
- **Phase 7**: Most polish tasks T068-T077 can run in parallel
- **Cross-Story Parallelism**: Different team members can work on US1, US2, US3 simultaneously after Phase 2

---

## Parallel Example: User Story 1

```bash
# RED PHASE: Launch all tests for User Story 1 together (should FAIL):
Task: "Contract test for GET /api/v1/events schema validation in tests/contract/test_events_schema.test.js"
Task: "Contract test for NDJSON output format compliance in tests/contract/test_ndjson_format.test.js"
Task: "Unit test for date offset calculation in tests/unit/test_date_parsing.test.js"
Task: "Unit test for event deduplication logic in tests/unit/test_deduplication.test.js"
Task: "Unit test for sentiment analysis in tests/unit/test_sentiment.test.js"
Task: "Integration test for source fetching with timeout in tests/integration/test_source_fetching.test.js"

# GREEN PHASE: Launch analysis services together (different files):
Task: "Implement key facts extractor from HTML/text sources in src/services/analysis/extractor.js"
Task: "Implement sentiment classifier using AFINN-based analysis in src/services/analysis/sentiment.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T023) - CRITICAL BLOCKER
3. Complete Phase 3: User Story 1 (T024-T039)
   - RED: Write tests first (T024-T030), verify FAIL
   - GREEN: Implement code (T031-T039), make tests PASS
   - REFACTOR: Clean up while keeping tests green
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - this is your MVP!

### Incremental Delivery

1. **Foundation** (Setup + Foundational) → Test infrastructure works
2. **MVP** (+ User Story 1) → Test independently → Deploy/Demo
3. **Transparency** (+ User Story 2) → Test independently → Deploy/Demo
4. **Flexibility** (+ User Story 3) → Test independently → Deploy/Demo
5. **Multi-Interface** (+ CLI) → Test independently → Deploy/Demo
6. **Production Ready** (+ Polish) → Full validation → Production deploy

Each increment adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers after Foundational phase completes:

1. **Team completes Setup + Foundational together** (T001-T023)
2. **Once Foundational is done**:
   - Developer A: User Story 1 (T024-T039)
   - Developer B: User Story 2 (T040-T048)
   - Developer C: User Story 3 (T049-T057)
3. **After US1 complete**:
   - Developer D: CLI Interface (T058-T067)
4. **Team converges on Polish** (T068-T082)

Stories complete and integrate independently due to user story organization.

---

## TDD Compliance (Constitutional Principle III)

This task list enforces Test-Driven Development as a NON-NEGOTIABLE requirement:

1. **Test tasks explicitly listed FIRST** in each user story phase
2. **Implementation tasks depend on tests** being written and failing
3. **Red-Green-Refactor cycle** enforced through task ordering:
   - RED: Write test tasks (e.g., T024-T030)
   - GREEN: Implement code tasks (e.g., T031-T039)
   - REFACTOR: Within implementation tasks as tests pass
4. **Checkpoint validation** after each user story ensures tests pass

**Constitutional Compliance**: ✅ SATISFIES Principle III (Test-First Development)

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- Each user story should be **independently completable and testable**
- **TDD MANDATORY**: Write tests first, verify FAIL, then implement
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **File paths are absolute** from repository root
- **All field names preserved**: eventsByTypeList, sourceBookmarks, targetCriteria, outputSchema (per FR-015)
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence

---

## Total Task Count: 82 tasks

### Tasks by User Story:
- **Setup (Phase 1)**: 8 tasks
- **Foundational (Phase 2)**: 15 tasks (BLOCKS all stories)
- **User Story 1 (P1) - MVP**: 16 tasks (7 tests + 9 implementation)
- **User Story 2 (P2)**: 9 tasks (3 tests + 6 implementation)
- **User Story 3 (P3)**: 9 tasks (3 tests + 6 implementation)
- **CLI Interface (Phase 6)**: 10 tasks (3 tests + 7 implementation)
- **Polish (Phase 7)**: 15 tasks

### Parallel Opportunities Identified:
- **28 tasks marked [P]** can run in parallel within their phases
- **3 user stories** can be developed in parallel after Foundational phase
- **Test writing** can be fully parallelized within each story (Red phase)
- **Different modules** (models, services, analysis) can be developed concurrently

### Independent Test Criteria:
- **US1**: Send GET /api/v1/events?startDate=3&endDate=4 → receive valid NDJSON with events filtered by 15 exchanges from docs/targetCriteria.md
- **US2**: Examine NDJSON response → verify final line contains coverage checklist with all event types from docs/eventsByTypeList.md and source attempts from docs/sourceBookmarks.md
- **US3**: Update docs/eventsByTypeList.md → wait 5 minutes → query API → verify new event type appears (or update docs/sourceBookmarks.md to add new source, or update docs/targetCriteria.md to add new exchange)
- **CLI**: Run `event-harvest query -s 3 -e 4` → verify NDJSON output to stdout with events from official sources

### Suggested MVP Scope:
**Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (User Story 1)**
- Total: 39 tasks
- Delivers core value: Query events by date range with NDJSON output
- Independently testable and deployable
- Satisfies primary user need from spec.md
