# Data Model: Stock Event Harvesting API

## Overview

This document defines the core data structures for the Stock Event Harvesting API. All models are designed for in-memory session storage with JSON serialization for NDJSON output.

## Core Entities

### Event

Represents a corporate or market event that significantly impacted stock prices.

**Identity**: Unique by combination of (ticker, eventType, eventDate)

**Fields**:
```typescript
interface Event {
  ticker: string;              // Stock ticker symbol (e.g., "AAPL", "MSFT")
  eventType: string;           // Event classification from docs/eventsByTypeList.md (e.g., earnGuide, pdufaAdcom, opec)
  eventDate: string;           // ISO 8601 date (YYYY-MM-DD)
  impactSummary: ImpactAnalysis; // Extracted facts + sentiment
  evidenceLinks: string[];     // Array of source URLs from docs/sourceBookmarks.md
}
```

**Validation Rules**:
- `ticker`: Non-empty string, uppercase letters only, max 5 characters
- `eventType`: Must exist in docs/eventsByTypeList.md configuration (Common types: perfGuide, macroCal, mktStruct, treasury, geoRisk + Unique sector-specific types)
- `eventDate`: Valid ISO 8601 date within query range
- `impactSummary`: Must contain keyFacts (non-empty) and sentiment (positive|negative|neutral)
- `evidenceLinks`: Non-empty array, all elements must be valid HTTP/HTTPS URLs from official government/institutional sources in docs/sourceBookmarks.md

**Relationships**:
- Has one `ImpactAnalysis`
- Has one or more evidence links (source URLs)
- Belongs to one `EventType` category

---

### ImpactAnalysis

Analysis summary extracted from event sources.

**Fields**:
```typescript
interface ImpactAnalysis {
  keyFacts: string[];          // Extracted announcement details, metrics, material changes
  sentiment: 'positive' | 'negative' | 'neutral'; // Sentiment classification
}
```

**Validation Rules**:
- `keyFacts`: Non-empty array of strings, each max 500 characters
- `sentiment`: Must be one of three literal values

**Generation Logic**:
- Extract key facts from source HTML/text (announcement details, reported metrics)
- Apply sentiment analysis library to source text
- Classify as positive/negative/neutral based on AFINN-165 lexicon score

---

### EventType

Category of events that can affect stock prices.

**Fields**:
```typescript
interface EventType {
  name: string;                // Unique identifier (e.g., "perfGuide", "earnGuide", "pdufaAdcom", "opec")
  category: 'common' | 'unique'; // Common (all sectors) or Unique (sector-specific)
  sector?: string;             // Required if category='unique' (e.g., "IT", "Bio", "Energy")
  description: string;         // Human-readable description (in Korean with English technical terms)
}
```

**Validation Rules**:
- `name`: Non-empty, lowercase, alphanumeric only (camelCase)
- `category`: Must be 'common' or 'unique'
- `sector`: Required when category='unique', must match known sector codes (IT, Comms, ConsDisc, ConsStaples, Bio, MedDev, Energy, IndTransDef, Materials, Financials, REITs, Utilities)
- `description`: Non-empty, max 200 characters

**Source**: Loaded from `docs/eventsByTypeList.md` configuration file (Korean with English technical terms)

**Categories**:
- **Common**: perfGuide (surprise, guideRev, kpi), macroCal (fomc, cpiJobs, ismPmi, gdp, retailSales, durablesHousing), mktStruct (opexWitch, idxRebal, etfFlows), treasury (qra, auctions, realCurve), geoRisk (disasters, warSanctions, cyber)
- **Unique (IT)**: earnGuide, aiDcCapex, nodeBench, exportCfius, secIncidents, bisEntity, chipsGuard, custCapexRoadmap, foundryCycle, ipLit
- **Unique (Comms)**: adCycle, subsArpu, spectrum, netOutage, fccReview, contentRights
- **Unique (ConsDisc)**: sssTraffic, promoReturns, seasonal, supplyChain, brandEvents
- **Unique (ConsStaples)**: inputCosts, recalls, pricingPower, supplyChain, brandEvents
- **Unique (Bio)**: pdufaAdcom, clinicalTopline, patentBiosim, coverageCms, safetyWarn, hcpcs, dealsMna
- **Unique (MedDev)**: fda510kPma, recalls, coverageCoding, adcomVote, hcpcs, dealsMna
- **Unique (Energy)**: opec, eiaWeekly, refMargins, stormAccident, jmmc, blmNepa, opsRefPipe
- **Unique (IndTransDef)**: ordersBacklog, faaOpsCert, fuelRatesCap, laborStrikes, defBudgetDeals, ntsb, faaTypeCert, orderCancel, supplyChain
- **Unique (Materials)**: commodityPx, mineOps, permitsEis, tariffsExport, mineralPolicyUsgs, blmNepa
- **Unique (Financials)**: ratesCurveNim, deposLiquidity, creditLoss, ccarCapital, natCat, payCyber, dealsMna
- **Unique (REITs)**: ratesCoC, ffoNoiLease, assetRefi, devPipeline
- **Unique (Utilities)**: stateRoe, majorOutage, fuelPass, pucCapex, gridRenew

---

### Source

Reliable data provider or website for event information.

**Fields**:
```typescript
interface Source {
  name: string;                // Source identifier (e.g., "sec-edgar", "fda-advisory", "eia-weekly")
  url: string;                 // Base URL or URL pattern (official government/institutional source)
  reliability: number;         // 1-5 rating (5 = highest, all official sources are 5)
  category: string;            // Source category (e.g., "Healthcare", "Energy/Commodities/Disasters")
  eventTypes: string[];        // Event types this source covers
  rateLimit?: RateLimit;       // Optional rate limiting config
}
```

**Validation Rules**:
- `name`: Non-empty, lowercase, alphanumeric + hyphens only
- `url`: Valid HTTP/HTTPS URL, must be official government/institutional domain
- `reliability`: Integer 1-5 (typically 5 for official sources)
- `category`: Must match one of the official categories (Disclosure/Market Structure, Monetary Policy/Macro, Energy/Commodities/Disasters, Healthcare, Transportation, Communications, Utilities, Indices/Options, Treasury, Automotive, Trade/Export)
- `eventTypes`: Non-empty array of valid event type names from docs/eventsByTypeList.md
- `rateLimit`: If present, must specify requestsPerSecond or requestsPerMinute

**Source**: Loaded from `docs/sourceBookmarks.md` configuration file (Korean with English technical terms)

**Official Source Categories**:
- **Disclosure/Market Structure**: SEC EDGAR, Form 8-K, Regulation FD, NMS Rules
- **Monetary Policy/Macro**: Fed FOMC, BLS, BEA, Census (retail sales, durables, housing), ISM PMI, Conference Board, Michigan surveys
- **Energy/Commodities/Disasters**: EIA (petroleum, natural gas), OPEC, USGS minerals, BLM NEPA, NOAA hurricanes, NIFC wildfires, USGS earthquakes
- **Healthcare**: FDA advisory committees, Drugs@FDA, 510(k)/PMA databases, MAUDE, CMS coverage, HCPCS, ClinicalTrials.gov
- **Transportation**: FAA airworthiness directives, NTSB CAROL, BTS on-time data
- **Communications**: FCC auctions, ECFS docket search, NORS, DIRS
- **Utilities**: NARUC directory, state PUCs (CPUC, NY PSC, PUCT)
- **Indices/Options**: S&P DJI, FTSE Russell, MSCI, OCC expiration calendar, Cboe calendar, NYSE/Nasdaq calendars, FINRA daily list
- **Treasury**: Quarterly Refunding, auction schedules, yield curves (nominal and real)
- **Automotive**: NHTSA recalls and defect investigations
- **Trade/Export**: BIS EAR, Entity List, Federal Register, CHIPS.gov

---

### SearchResult

Outcome of searching a specific source for a specific event type.

**Fields**:
```typescript
interface SearchResult {
  source: string;              // Source name
  eventType: string;           // Event type searched
  status: 'success' | 'failed' | 'timeout'; // Outcome
  events?: Event[];            // Found events (if status='success')
  error?: string;              // Error message (if status='failed' or 'timeout')
  duration: number;            // Search duration in milliseconds
}
```

**Validation Rules**:
- `source`: Must reference valid source name
- `eventType`: Must reference valid event type name
- `status`: Must be one of three literal values
- `events`: Required if status='success', must be array (can be empty)
- `error`: Required if status='failed' or 'timeout'
- `duration`: Non-negative number

**Lifecycle**:
1. Created when source search begins
2. Updated with status='timeout' if 10-15 second timeout exceeded
3. Updated with status='failed' if HTTP error or parsing error
4. Updated with status='success' and events array if successful

---

### SearchCoverageChecklist

Comprehensive report showing search coverage.

**Fields**:
```typescript
interface SearchCoverageChecklist {
  queryId: string;             // Unique request identifier (correlation ID)
  dateRange: DateRange;        // Query date range
  eventTypeCoverage: EventTypeCoverage[]; // Per-event-type results
  summary: CoverageSummary;    // Aggregate statistics
}
```

**Sub-Types**:
```typescript
interface DateRange {
  startDate: number;           // Relative offset (natural number)
  endDate: number;             // Duration (natural number)
  computedStart: string;       // Computed absolute date (ISO 8601)
  computedEnd: string;         // Computed absolute date (ISO 8601)
}

interface EventTypeCoverage {
  eventType: string;           // Event type name
  sourcesAttempted: string[];  // Source names attempted
  results: SearchResult[];     // Results per source
}

interface CoverageSummary {
  totalEventTypes: number;     // Total in eventsByTypeList
  successfulSearches: number;  // Searches that completed successfully
  failedSearches: number;      // Searches that failed
  timeoutSearches: number;     // Searches that timed out
  coveragePercentage: number;  // (successfulSearches / totalEventTypes) * 100
}
```

**Validation Rules**:
- `queryId`: UUID v4 format
- `dateRange`: All fields required, computedStart <= computedEnd
- `eventTypeCoverage`: One entry per event type in eventsByTypeList
- `summary.coveragePercentage`: 0-100, rounded to 2 decimal places

---

### TargetCriteria

Configuration defining which exchanges and companies are in scope.

**Fields**:
```typescript
interface TargetCriteria {
  exchanges: ExchangeInfo[];   // List of exchanges with MIC codes
  excludedTickers?: string[];  // Optional exclusion list
  includedSectors?: string[];  // Optional sector filter
}

interface ExchangeInfo {
  mic: string;                 // Market Identifier Code (e.g., "XNYS", "XNAS")
  name: string;                // Full exchange name (e.g., "New York Stock Exchange")
  notes?: string;              // Additional notes (e.g., "primarily ETP listing/trading")
}
```

**Validation Rules**:
- `exchanges`: Non-empty array of ExchangeInfo objects, must include all 15 exchanges from docs/targetCriteria.md
- `mic`: 4-character uppercase MIC code
- `name`: Non-empty string
- `excludedTickers`: If present, array of uppercase ticker symbols
- `includedSectors`: If present, array of sector names matching EventType sectors

**Source**: Loaded from `docs/targetCriteria.md` configuration file (Korean with English technical terms)

**Actual Exchanges** (15 total):
1. XNYS - New York Stock Exchange
2. XNAS - Nasdaq Stock Market
3. XASE - NYSE American (former AMEX)
4. LTSE - Long-Term Stock Exchange
5. ARCX - NYSE Arca (primarily ETP listing/trading)
6. XCIS - NYSE National
7. XCHI - NYSE Texas (formerly NYSE Chicago)
8. XBOS - Nasdaq BX
9. XPSX - Nasdaq PSX
10. BATY - Cboe BYX
11. BATS - Cboe BZX
12. EDGA - Cboe EDGA
13. EDGX - Cboe EDGX
14. IEXG - Investors Exchange, IEX (has listing authority)
15. MEMX - MEMX
16. EPRL - MIAX Pearl Equities (equity-specific MIC)

---

### OutputSchema

NDJSON output format specification.

**Format**: Each line is a valid JSON object, one of two types:

**Event Line**:
```json
{
  "type": "event",
  "data": {
    "ticker": "AAPL",
    "eventType": "earnGuide",
    "eventDate": "2025-11-15",
    "impactSummary": {
      "keyFacts": ["Q4 revenue beat expectations by 5%", "iPhone sales up 12% YoY"],
      "sentiment": "positive"
    },
    "evidenceLinks": ["https://sec.gov/...", "https://apple.com/newsroom/..."]
  }
}
```

**Checklist Line** (final line):
```json
{
  "type": "coverage",
  "data": {
    "queryId": "550e8400-e29b-41d4-a716-446655440000",
    "dateRange": {
      "startDate": 3,
      "endDate": 4,
      "computedStart": "2025-11-15",
      "computedEnd": "2025-11-18"
    },
    "eventTypeCoverage": [...],
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

---

## Data Flow

⚠️ **CRITICAL**: Configuration files change frequently. System MUST load them fresh for each request or use cache with short TTL (e.g., 5 minutes). Never hard-code exchanges, event types, or sources.

```
1. API Request
   ↓
2. Load Configuration (CRITICAL - ALWAYS FIRST)
   a. Read docs/targetCriteria.md → ExchangeList
   b. Read docs/eventsByTypeList.md → EventTypeList
   c. Read docs/sourceBookmarks.md → SourceList
   d. Validate all configurations are readable and properly formatted
   ↓
3. Parse & Validate (startDate, endDate) → DateRange
   ↓
4. For each EventType in loaded EventTypeList:
   a. Find applicable Sources from loaded SourceList by category
   b. For each Source:
      - Create SearchResult (status=pending)
      - Fetch with timeout (10-15s) from official government/institutional URL
      - Parse response → Event[] (filter by exchanges from loaded ExchangeList)
      - Update SearchResult (status=success|failed|timeout)
   ↓
5. Deduplicate Events by (ticker, eventType, eventDate)
   ↓
6. Generate SearchCoverageChecklist
   ↓
7. Format as NDJSON:
   - One line per Event
   - Final line: SearchCoverageChecklist
   ↓
8. Return Response
```

---

## Deduplication Logic

**Input**: Array of Events from multiple sources
**Output**: Deduplicated array with merged evidence links

**Algorithm**:
```
1. Group events by unique key: (ticker + eventType + eventDate)
2. For each group:
   a. Take first event as base
   b. Merge evidenceLinks from all duplicates (union)
   c. Merge keyFacts arrays (union, deduplicate)
   d. Keep sentiment from first event (or majority vote if preferred)
3. Return deduplicated events
```

**Example**:
```
Input:
- Event A: {ticker: "AAPL", type: "earnGuide", date: "2025-11-15", links: ["https://sec.gov/..."]}
- Event B: {ticker: "AAPL", type: "earnGuide", date: "2025-11-15", links: ["https://apple.com/..."]}

Output:
- Event: {ticker: "AAPL", type: "earnGuide", date: "2025-11-15", links: ["https://sec.gov/...", "https://apple.com/..."]}
```

---

## Configuration File Schemas

⚠️ **IMPORTANT**: These schemas show FORMAT structure. Actual values in docs/ files will be added/modified frequently. System must parse dynamically.

### docs/eventsByTypeList.md Structure (Korean with English technical terms)

```markdown
## 유형별 이벤트 타입 확인

### A) Common — 모든 섹터 공통
- **perfGuide**(실적·가이던스, 프리어닝스 포함): `surprise`(컨센서스 대비), `guideRev`(가이던스 상·하향), `kpi`(매출/마진/현금흐름·SSS·NRR/ARR 등)
- **macroCal**(매크로 캘린더): `fomc`, `cpiJobs`(BLS), `ismPmi`(제조·서비스), `gdp`, `retailSales`, `durablesHousing`
- **mktStruct**(마켓 구조·수급): `opexWitch`(옵션 만기/위칭), `idxRebal`(FTSE Russell·S&P), `etfFlows`
- **treasury**(재정/국채): `qra`(분기 Refunding), `auctions`(입찰결과), `realCurve`(실질금리/스프레드)
- **geoRisk**(대형 사고·재난/지정학): `disasters`, `warSanctions`, `cyber`

### B) Unique — 섹터·제품 유형별
- **IT**(반도체·하드웨어·SaaS): `earnGuide`, `aiDcCapex`, `nodeBench`, `exportCfius`, `secIncidents`, `bisEntity`, `chipsGuard`, `custCapexRoadmap`, `foundryCycle`, `ipLit`
- **Comms**(커뮤니케이션·통신): `adCycle`, `subsArpu`, `spectrum`, `netOutage`, `fccReview`, `contentRights`
- **ConsDisc**(소비재 임의): `sssTraffic`, `promoReturns`, `seasonal`, `supplyChain`, `brandEvents`
- **ConsStaples**(소비재 필수): `inputCosts`, `recalls`, `pricingPower`, `supplyChain`, `brandEvents`
- **Bio**(바이오): `pdufaAdcom`, `clinicalTopline`, `patentBiosim`, `coverageCms`, `safetyWarn`, `hcpcs`, `dealsMna`
- **MedDev**(의료기기): `fda510kPma`, `recalls`, `coverageCoding`, `adcomVote`, `hcpcs`, `dealsMna`
- **Energy**: `opec`, `eiaWeekly`, `refMargins`, `stormAccident`, `jmmc`, `blmNepa`, `opsRefPipe`
- **IndTransDef**(산업·운송·방산): `ordersBacklog`, `faaOpsCert`, `fuelRatesCap`, `laborStrikes`, `defBudgetDeals`, `ntsb`, `faaTypeCert`, `orderCancel`, `supplyChain`
- **Materials**(소재·광업/화학): `commodityPx`, `mineOps`, `permitsEis`, `tariffsExport`, `mineralPolicyUsgs`, `blmNepa`
- **Financials**(금융): `ratesCurveNim`, `deposLiquidity`, `creditLoss`, `ccarCapital`, `natCat`, `payCyber`, `dealsMna`
- **REITs**: `ratesCoC`, `ffoNoiLease`, `assetRefi`, `devPipeline`
- **Utilities**: `stateRoe`, `majorOutage`, `fuelPass`, `pucCapex`, `gridRenew`
```

### docs/sourceBookmarks.md Structure (Korean with English technical terms)

```markdown
## 이벤트 타입별 신뢰 소스 확인(모니터링 경로)

> **원문·공식 경로만 사용**합니다. 필요 시 각 카테고리에서 해당 기관/거래소/지수사업자/부처의 페이지를 1차 소스로 링크하세요.

### 공시/시장구조
- [SEC EDGAR Company Filings(기업 검색)](https://www.sec.gov/edgar/searchedgar/companysearch)
- [SEC EDGAR 고급검색(Full-Text Search)](https://www.sec.gov/edgar/search/)
- [SEC Form 8-K 안내](https://www.sec.gov/forms/form-8-k)

### 통화정책/매크로
- [연준(FOMC) 일정](https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm)
- [BLS 경제지표 발표 캘린더](https://www.bls.gov/schedule/)
- [ISM 제조업 PMI(Reports On Business)](https://www.ismworld.org/supply-management-news-and-reports/reports/ism-report-on-business/pmi/)

### 에너지/원자재/재난
- [EIA 주간 석유상황 보고서(WPSR)](https://www.eia.gov/petroleum/supply/weekly/)
- [OPEC 보도자료(Press Releases)](https://www.opec.org/opec_web/en/press_room/28.htm)

### 헬스케어
- [FDA 자문위(Advisory Committee) 캘린더](https://www.fda.gov/advisory-committees/advisory-committee-calendar)
- [CMS Coverage Database](https://www.cms.gov/medicare-coverage-database/)

[... additional categories ...]
```

### docs/targetCriteria.md Structure (Korean with English technical terms)

```markdown
## 대상 거래소 확인

- 대상
    - New York Stock Exchange (XNYS)
    - Nasdaq Stock Market (XNAS)
    - NYSE American, 구 AMEX (XASE)
    - Long-Term Stock Exchange (LTSE)
    - NYSE Arca (ARCX) - 주로 ETP 상장/거래
    - NYSE National (XCIS)
    - NYSE Texas (XCHI) - NYSE Chicago의 개칭/재편
    - Nasdaq BX (XBOS)
    - Nasdaq PSX (XPSX)
    - Cboe BYX (BATY)
    - Cboe BZX (BATS)
    - Cboe EDGA (EDGA)
    - Cboe EDGX (EDGX)
    - Investors Exchange, IEX (IEXG) - 상장 권한 보유
    - MEMX (MEMX)
    - MIAX Pearl Equities (EPRL) - 주식 전용 MIC는 EPRL
```

---

## State Transitions

### SearchResult State Machine

```
[Created] → (fetch started)
   ↓
[In Progress] → (waiting for response)
   ↓
   ├─→ [Success] (response received, parsed)
   ├─→ [Timeout] (10-15s exceeded)
   └─→ [Failed] (HTTP error, parse error)
```

---

## Performance Considerations

**In-Memory Storage**:
- All data stored in Node.js process memory during request
- Cleared after response sent (session-only)
- No persistence layer
- Configuration cached at startup, refreshed every 5 minutes

**Deduplication**:
- Use Map with composite key for O(1) lookups
- Process events as they arrive to minimize memory footprint

**NDJSON Streaming**:
- Stream events as they're deduplicated (don't wait for all searches to complete)
- Write coverage checklist as final line
- Enables early transmission for large result sets

---

## Testing Strategy

**Unit Tests**:
- Event validation rules (including MIC code validation against docs/targetCriteria.md)
- Deduplication algorithm with various scenarios
- Date range calculations
- Sentiment classification
- Markdown parsing of Korean text with English technical terms

**Integration Tests**:
- Configuration file parsing (docs/eventsByTypeList.md, docs/sourceBookmarks.md, docs/targetCriteria.md - Korean with English terms)
- Source fetching with timeout simulation from official government/institutional URLs
- Exchange filtering (15 exchanges with MIC codes)
- NDJSON formatting

**Contract Tests**:
- Event schema validation (eventType must be in docs/eventsByTypeList.md)
- SearchCoverageChecklist schema validation
- NDJSON output format validation
- Source URL validation (must be official sources from docs/sourceBookmarks.md)
