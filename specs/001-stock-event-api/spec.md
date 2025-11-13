# Feature Specification: Stock Event Harvesting API

**Feature Branch**: `001-stock-event-api`
**Created**: 2025-11-12
**Status**: Ready for Planning
**Input**: User description: "Render.com에 배포된 JSON 전용 웹 API로, 사용자가 지정한 날짜 범위 안에서 주가에 유의미한 영향을 준 공식 이벤트를 탐지해 [티커, 이벤트 분류, 영향 분석 요약, 근거 링크] 번들을 반환합니다. 날짜 범위는 자연수로 제공되며 startDate=3, endDate=4라면 오늘로부터 3일 후부터 4일 이내 기간을 의미합니다."

## Clarifications

### Session 2025-11-12

- Q: When the same event is found in multiple sources (e.g., an earnings announcement appears in both SEC filings and financial news), how should the system handle it? → A: Deduplicate by (ticker + event type + date) and merge into single event bundle, noting all sources in evidence links
- Q: When searching external sources for event data, what timeout should be enforced for each individual source request? → A: 10-15 seconds per source
- Q: What should happen if the overall 30-second request timeout (from SC-001) is exceeded before all sources have been searched? → A: Automatically extend the timeout up to 60 seconds to maximize source coverage before returning results
- Q: What criteria should determine if an event had a significant impact on stock prices? → A: Events are significant by definition if listed in docs/eventsByTypeList.md; the file contains comprehensive taxonomy with Common events (all sectors: perfGuide, macroCal, mktStruct, treasury, geoRisk) and Unique sector-specific events for IT (earnGuide, aiDcCapex, nodeBench, exportCfius, secIncidents, bisEntity, chipsGuard, custCapexRoadmap, foundryCycle, ipLit), Communications (adCycle, subsArpu, spectrum, netOutage, fccReview, contentRights), Consumer Discretionary (sssTraffic, promoReturns, seasonal, supplyChain, brandEvents), Consumer Staples (inputCosts, recalls, pricingPower, supplyChain, brandEvents), Biotech (pdufaAdcom, clinicalTopline, patentBiosim, coverageCms, safetyWarn, hcpcs, dealsMna), Medical Devices (fda510kPma, recalls, coverageCoding, adcomVote, hcpcs, dealsMna), Energy (opec, eiaWeekly, refMargins, stormAccident, jmmc, blmNepa, opsRefPipe), Industrials/Transportation/Defense (ordersBacklog, faaOpsCert, fuelRatesCap, laborStrikes, defBudgetDeals, ntsb, faaTypeCert, orderCancel, supplyChain), Materials (commodityPx, mineOps, permitsEis, tariffsExport, mineralPolicyUsgs, blmNepa), Financials (ratesCurveNim, deposLiquidity, creditLoss, ccarCapital, natCat, payCyber, dealsMna), REITs (ratesCoC, ffoNoiLease, assetRefi, devPipeline), and Utilities (stateRoe, majorOutage, fuelPass, pucCapex, gridRenew)
- Q: How should the "impact analysis summary" be generated for each event bundle? → A: Extract key facts from event source (announcement details, reported metrics) + basic sentiment (positive/negative/neutral) based on language patterns

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Query Events by Date Range (Priority: P1)

A financial analyst needs to identify significant corporate events that affected stock prices during a specific time period to support their investment research and decision-making.

**Why this priority**: This is the core value proposition of the API. Without the ability to query and retrieve event data, the system provides no value. This represents the minimum viable product.

**Independent Test**: Can be fully tested by sending an API request with relative date offsets (natural numbers) and receiving NDJSON-formatted event data containing ticker symbols, event classifications, impact summaries, and evidence links.

**Acceptance Scenarios**:

1. **Given** valid relative date offsets (startDate and endDate as natural numbers), **When** the user calls the API endpoint with these values, **Then** the system returns NDJSON output containing all significant events within the computed date range
2. **Given** a date range where multiple events occurred (e.g., startDate=3, endDate=7), **When** the user requests events for that period, **Then** each event bundle includes ticker symbol, event classification, impact analysis summary, and evidence link
3. **Given** a date range with no significant events, **When** the user queries that period, **Then** the system returns an empty result set with appropriate status indication
4. **Given** the same relative date offsets in sequential requests made on different days, **When** the user makes multiple queries, **Then** each request searches different absolute date ranges based on the current day

---

### User Story 2 - Validate Search Coverage (Priority: P2)

A financial analyst wants to verify that the event search was comprehensive and understand which event types were successfully searched versus which failed, to assess the completeness and reliability of the results.

**Why this priority**: This provides transparency and trustworthiness to the API results. Users need to know if certain event types couldn't be searched due to source unavailability. However, basic functionality (P1) must work first.

**Independent Test**: Can be tested independently by making any event query and verifying that the response includes a checklist showing which event types from eventsByTypeList were searched, which sources were used, and success/failure status for each.

**Acceptance Scenarios**:

1. **Given** any valid date range query, **When** the system completes the search, **Then** the response includes a checklist showing each item from docs/eventsByTypeList.md
2. **Given** the search checklist, **When** examining each event type entry, **Then** each entry shows which sources from docs/sourceBookmarks.md were attempted, success/failure status, and either results or failure reason
3. **Given** a source that is temporarily unavailable, **When** the search attempts to use that source, **Then** the checklist marks that search as failed with a clear failure reason
4. **Given** multiple sources for one event type, **When** the primary source fails, **Then** the checklist shows both the failed primary attempt and any successful fallback attempts

---

### User Story 3 - Dynamic Configuration Updates (Priority: P3)

System administrators need to add new event types or update source bookmarks without deploying new code, allowing the service to adapt to new data sources and event categories as market conditions evolve.

**Why this priority**: This enables operational flexibility and reduces maintenance burden. While important for long-term scalability, the system can launch with a static configuration initially.

**Independent Test**: Can be tested by updating the docs/eventsByTypeList.md or docs/sourceBookmarks.md markdown files and verifying that subsequent API requests reflect the changes without restarting the service.

**Acceptance Scenarios**:

1. **Given** the docs/eventsByTypeList.md markdown file is updated with a new event type, **When** a user queries for events, **Then** the system searches for and returns events of the new type
2. **Given** the docs/sourceBookmarks.md markdown file is updated with a new source, **When** the system searches for events, **Then** the new source is included in the search attempts
3. **Given** an event type is removed from docs/eventsByTypeList.md, **When** subsequent queries are made, **Then** that event type is no longer searched or returned
4. **Given** configuration files are updated, **When** the changes are loaded, **Then** the search coverage checklist reflects the current configuration state

---

### Edge Cases

- What happens when startDate or endDate is zero?
- What happens when startDate or endDate is negative?
- How does the system handle very large offset values (e.g., startDate=1000)?
- How does the system handle very large duration values (e.g., endDate=1000)?
- What happens when the computed date range spans multiple years?
- What happens when startDate + endDate exceeds the maximum allowed range?
- What happens when all sourceBookmarks for a particular event type are unavailable?
- How does the system handle partial failures (some sources work, others fail)?
- What happens when a source returns malformed data?
- How does the system handle rate limiting from external sources?
- Same event found in multiple sources: System deduplicates by (ticker + event type + date) and merges into single bundle with all source URLs in evidence links array
- How are events handled that span multiple days (e.g., multi-day conferences)?
- What happens when a user queries on a weekend or market holiday?
- What happens when the search window falls entirely on non-trading days?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept API requests with startDate and endDate parameters as natural numbers (positive integers)
- **FR-002**: System MUST interpret date parameters as follows: startDate represents the offset in days from today (the starting point), and endDate represents the duration in days (the length of the search window). Example: if today is November 12 and startDate=3, endDate=4, the system searches from November 15 (today + 3 days) through November 18 (a 4-day period starting from November 15)
- **FR-003**: System MUST calculate the absolute date range as: searchStartDate = today + startDate days, searchEndDate = searchStartDate + (endDate - 1) days, where both boundaries are inclusive
- **FR-004**: System MUST validate that startDate and endDate are positive integers and reject invalid inputs
- **FR-005**: System MUST load and review the three configuration files (docs/targetCriteria.md, docs/eventsByTypeList.md, docs/sourceBookmarks.md) BEFORE starting each search operation to ensure it uses the most current configuration; these files change frequently and are the SINGLE SOURCE OF TRUTH for which exchanges to search, which events are significant, and where to find event information
- **FR-005a**: System MUST validate that all three configuration files are readable and properly formatted before proceeding with search; if any configuration file is missing or malformed, return clear error message indicating which file has issues
- **FR-005b**: System MUST NOT hard-code any exchanges, event types, or source URLs in the application code; all such values MUST be loaded dynamically from the configuration files in docs/ folder
- **FR-006**: System MUST search only for events affecting US-listed companies based on the exchanges listed in docs/targetCriteria.md (format defines structure; actual exchange list may change frequently)
- **FR-007**: System MUST search for all event types defined in the docs/eventsByTypeList.md configuration file (format defines structure; actual event types may change frequently)
- **FR-008**: System MUST use docs/sourceBookmarks.md configuration to determine reliable sources for event data (format defines structure; actual sources may change frequently)
- **FR-009**: System MUST enforce a timeout of 10-15 seconds for each individual source request; if a source does not respond within this period, mark it as failed in the search coverage checklist and continue with remaining sources
- **FR-010**: System MUST allow overall request processing time to extend up to 60 seconds maximum to maximize source coverage; the system should target 30 seconds for typical queries but may extend to 60 seconds when additional time is needed to complete all source searches
- **FR-011**: System MUST return results in NDJSON format conforming to the outputSchema specification
- **FR-012**: System MUST include in each event bundle: ticker symbol, event classification, impact analysis summary, and evidence link(s)
- **FR-013**: System MUST generate the impact analysis summary by extracting key facts from the event source (announcement details, reported metrics, material changes) and appending basic sentiment classification (positive/negative/neutral) determined through language pattern analysis
- **FR-014**: System MUST deduplicate events by combining (ticker symbol + event type + event date) as the uniqueness key; when duplicates are found across multiple sources, merge them into a single event bundle with all source URLs included in the evidence links array
- **FR-015**: System MUST return a search coverage checklist showing which event types were searched, which sources were used, and success/failure status
- **FR-016**: System MUST preserve the exact field names: eventsByTypeList, sourceBookmarks, targetCriteria, and outputSchema throughout the system
- **FR-017**: System MUST load eventsByTypeList and sourceBookmarks from markdown files in docs/ folder (docs/eventsByTypeList.md, docs/sourceBookmarks.md) that can be updated independently of code deployments; files are in Korean with English technical terms
- **FR-018**: System MUST reflect updates to docs/eventsByTypeList.md and docs/sourceBookmarks.md configuration files in subsequent API requests
- **FR-019**: System MUST store session data only in memory and MUST NOT persist data to disk or databases
- **FR-020**: System MUST process requests in the order: event detection → result output (no result caching or pre-processing)
- **FR-021**: System MUST handle source unavailability gracefully and continue searching remaining sources
- **FR-022**: System MUST provide clear error messages when API requests are malformed or dates are invalid

### Key Entities

- **Event**: Represents a corporate or market event that significantly impacted stock prices. Contains ticker symbol, event classification (from eventsByTypeList), impact analysis summary (key facts extracted from source + sentiment classification), evidence links (array of source URLs), and event date. Events are uniquely identified by the combination of ticker symbol, event type, and event date.

- **Event Type**: A category of events that can affect stock prices (e.g., earnGuide, pdufaAdcom, opec, faaOpsCert). Defined in docs/eventsByTypeList.md configuration with Common types (perfGuide, macroCal, mktStruct, treasury, geoRisk) and Unique sector-specific types.

- **Source**: A reliable data provider or website for event information. Defined in docs/sourceBookmarks.md configuration with metadata about reliability and coverage, organized into categories: Disclosure/Market Structure (SEC EDGAR, Form 8-K, Regulation FD), Monetary Policy/Macro (Fed FOMC, BLS, BEA, Census, ISM PMI, Conference Board, Michigan surveys), Energy/Commodities/Disasters (EIA, OPEC, USGS minerals, BLM NEPA, NOAA, NIFC, USGS earthquakes), Healthcare (FDA advisory committees, Drugs@FDA, 510(k)/PMA databases, MAUDE, CMS coverage, HCPCS, ClinicalTrials.gov), Transportation (FAA airworthiness directives, NTSB CAROL, BTS), Communications (FCC auctions, ECFS, NORS, DIRS), Utilities (NARUC, state PUCs), Indices/Options (S&P DJI, FTSE Russell, MSCI, OCC, Cboe, NYSE/Nasdaq calendars, FINRA), Treasury (Quarterly Refunding, auction schedules, yield curves), Automotive (NHTSA recalls/defects), and Trade/Export (BIS EAR, Entity List, Federal Register, CHIPS.gov).

- **Search Result**: The outcome of searching a specific source for a specific event type. Contains success/failure status and either event data or failure reason.

- **Search Coverage Checklist**: A comprehensive report showing for each event type from docs/eventsByTypeList.md: which sources from docs/sourceBookmarks.md were attempted, success/failure status, and results or failure reasons.

- **Target Criteria**: Configuration in docs/targetCriteria.md defining which exchanges and companies are in scope for event searching, currently containing 15 US exchanges with MIC codes (XNYS, XNAS, XASE, LTSE, ARCX, XCIS, XCHI, XBOS, XPSX, BATY, BATS, EDGA, EDGX, IEXG, MEMX, EPRL).

- **Output Schema**: The structured format specification for NDJSON output, ensuring consistent response format.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can query events for any date range and receive results within 30-60 seconds for a 30-day duration (e.g., startDate=1, endDate=30), with typical queries completing in 30 seconds and extended searches allowed up to 60 seconds
- **SC-002**: System successfully searches at least 90% of event types in eventsByTypeList for any given date range query
- **SC-003**: All API responses conform to the outputSchema specification with zero schema validation failures
- **SC-004**: Configuration updates to eventsByTypeList or sourceBookmarks are reflected in API responses within 5 minutes of file changes
- **SC-005**: Search coverage checklist accurately reports success/failure status for 100% of attempted source searches
- **SC-006**: System handles at least 100 concurrent API requests without response time degradation
- **SC-007**: 95% of valid API requests complete successfully without errors
- **SC-008**: When sources are unavailable, system completes partial searches and returns available results with appropriate status in checklist within expected time limits

### Assumptions

- **API Authentication**: Standard API key authentication will be used (industry standard for web APIs)
- **Rate Limiting**: API will implement standard rate limiting (e.g., 100 requests per hour per API key) to prevent abuse
- **Date Parameter Limits**: Maximum startDate offset is 365 days, maximum endDate duration is 365 days to ensure reasonable response times and data availability
- **Relative Date Calculation**: "Today" is determined by the server's current date at request time (not user's timezone)
- **Date Calculation Formula**: searchStartDate = today + startDate, searchEndDate = searchStartDate + (endDate - 1), where both boundaries are inclusive. Example: startDate=3, endDate=4 creates a 4-day window from day 3 through day 6 after today
- **US Market Focus**: "US-listed companies" refers to 15 exchanges defined in docs/targetCriteria.md with MIC codes: XNYS (New York Stock Exchange), XNAS (Nasdaq Stock Market), XASE (NYSE American, former AMEX), LTSE (Long-Term Stock Exchange), ARCX (NYSE Arca - primarily ETP listing/trading), XCIS (NYSE National), XCHI (NYSE Texas, formerly NYSE Chicago), XBOS (Nasdaq BX), XPSX (Nasdaq PSX), BATY (Cboe BYX), BATS (Cboe BZX), EDGA (Cboe EDGA), EDGX (Cboe EDGX), IEXG (Investors Exchange, IEX - has listing authority), MEMX, EPRL (MIAX Pearl Equities - equity-specific MIC)
- **Event Significance**: Events are considered "significant" by definition if they are listed in eventsByTypeList; significance is type-based rather than outcome-based (no price movement threshold required)
- **Event Type Taxonomy**: docs/eventsByTypeList.md follows a two-tier structure: (A) Common events applicable to all sectors (perfGuide with surprise/guideRev/kpi sub-types, macroCal with fomc/cpiJobs/ismPmi/gdp/retailSales/durablesHousing, mktStruct with opexWitch/idxRebal/etfFlows, treasury with qra/auctions/realCurve, geoRisk with disasters/warSanctions/cyber), and (B) Unique sector-specific events with actual event codes per sector as listed in docs/eventsByTypeList.md
- **Session Storage**: Session data refers to in-memory caching of search results during request processing, cleared after response is sent
- **Configuration File Format**: Configuration files in docs/ folder are the SINGLE SOURCE OF TRUTH and change frequently; system must load them dynamically before each search operation. Files contain format definitions with values that will be added/modified frequently. Current file contents show structure; actual values will change. Files are markdown format in Korean with English technical terms; use structured format with official government/institutional sources organized by category (Disclosure/Market Structure, Monetary Policy/Macro, Energy/Commodities/Disasters, Healthcare, Transportation, Communications, Utilities, Indices/Options, Treasury, Automotive, Trade/Export)
- **NDJSON Format**: Each line in the output is a valid JSON object representing one event or one checklist entry
- **Evidence Links**: All evidence links must be publicly accessible URLs to verifiable sources
- **Deployment Platform**: Render.com provides sufficient compute resources and uptime for production API hosting
- **Natural Numbers**: "Natural numbers" for date parameters means positive integers only (1, 2, 3, ...), zero and negative values are invalid
- **Timeout Extension**: System targets 30-second response time but may automatically extend up to 60 seconds to maximize source coverage and completeness
