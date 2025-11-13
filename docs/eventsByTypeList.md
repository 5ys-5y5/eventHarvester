## 유형별 이벤트 타입 확인

- format
    - event.{scope}.{group}.{eventDetails}
        - {scope}: common | unique
        - {group}
            - scope=common일 때: perfGuide | macroCal | mktStruct | treasury | geoRisk
            - scope=unique일 때: IT | Comms | ConsDisc | ConsStaples | Bio | MedDev | Energy | IndTransDef | Materials | Financials | REITs | Utilities
        - {eventDetails}: 각 그룹에 속한 세부 이벤트(아래 목록)

- event
    - Common (common to all sectors)
        - **perfGuide** (performance/guidance, including pre-earnings): `surprise` (compared to consensus), `guideRev` (upward/downward guidance), `kpi` (sales/margin/cash flow/SSS/NRR/ARR, etc.), `earnCal`
        - **macroCal** (macro calendar): `fomc`, `cpiJobs` (BLS), `ismPmi` (manufacturing/services), `gdp`, `retailSales`, `durablesHousing`
        - **mktStruct** (market structure/supply/demand): `opexWitch` (options expiration/witching), `idxRebal` (FTSE Russell/S&P), `etfFlows`
        - **treasury** (financial/government bonds): `qra` (quarterly refunding), `auctions` (bid results), `realCurve` (real interest rate/spread)
        - **geoRisk** (major accidents/disasters/geopolitics): `disasters`, `warSanctions`, `cyber`
    - Unique (by sector/product type)
        - **IT** (semiconductors/hardware/SaaS): `earnGuide`, `aiDcCapex`, `nodeBench`, `exportCfius`, `secIncidents`, `bisEntity`, `chipsGuard`, `custCapexRoadmap`, `foundryCycle`, `ipLit`
        - **Comms** (communications/telecommunications): `adCycle`, `subsArpu`, `spectrum`, `netOutage`, `fccReview`, `contentRights`
        - **ConsDisc** (consumer discretionary): `sssTraffic`, `promoReturns`, `seasonal`, `supplyChain`, `brandEvents` 
        - **ConsStaples** (required for consumer products): `inputCosts`, `recalls`, `pricingPower`, `supplyChain`, `brandEvents` 
        - **Bio** (Bio): `pdufaAdcom`, `clinicalTopline`, `patentBiosim`, `coverageCms`, `safetyWarn`, `hcpcs`, `dealsMna` 
        - **MedDev** (medical devices): `fda510kPma`, `recalls`, `coverageCoding`, `adcomVote`, `hcpcs`, `dealsMna` 
        - **Energy**: `opec`, `eiaWeekly`, `refMargins`, `stormAccident`, `jmmc`, `blmNepa`, `opsRefPipe` 
        - **IndTransDef** (Industry, Transportation, Defense): `ordersBacklog`, `faaOpsCert`, `fuelRatesCap`, `laborStrikes`, `defBudgetDeals`, `ntsb`, `faaTypeCert`, `orderCancel`, `supplyChain`
        - **Materials** (Materials, Mining/Chemicals): `commodityPx`, `mineOps`, `permitsEis`, `tariffsExport`, `mineralPolicyUsgs`, `blmNepa`
        - **Financials** (Financials): `ratesCurveNim`, `deposLiquidity`, `creditLoss`, `ccarCapital`, `natCat`, `payCyber`, `dealsMna`
        - **REITs**: `ratesCoC`, `ffoNoiLease`, `assetRefi`, `devPipeline` - **Utilities**: `stateRoe`, `majorOutage`, `fuelPass`, `pucCapex`, `gridRenew`
