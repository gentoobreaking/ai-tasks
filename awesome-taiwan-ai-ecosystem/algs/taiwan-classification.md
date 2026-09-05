# Algorithm: Taiwan Relevance Classification

## Purpose

Determine Taiwan relevance for each MCP candidate (§14, §15, §17).
First phase is fully deterministic. LLM only for ambiguous cases (§18).

## Data Structures

```go
type TaiwanRelevance struct {
    Score      float64  // deterministic points
    Level      string   // T0–T5
    Evidence   []Evidence
    Confidence  float64 // 0.0–1.0
}

type Evidence struct {
    Type         string  // official_domain, repository_keyword, data_source, etc.
    Source       string  // README, package.json, manifest, mcp_protocol, etc.
    Location     string  // file path or URL
    ContentHash  string  // sha256 of matched text
    MatchedText  string
    Rule         string  // scoring rule name
    Score        float64 // points contributed
    Timestamp    time.Time
}
```

## Deterministic Scoring Rules (§17)

| Rule | Points | Evidence Type |
|------|--------|---------------|
| official Taiwan domain match | +40 | official_domain |
| Taiwan government API detected | +40 | official_gov_api |
| Taiwan financial API detected | +35 | taiwan_financial_api |
| Taiwan-specific dataset detected | +30 | taiwan_dataset |
| Taiwan-specific keyword found | +20 | repository_keyword |
| Taiwan language detected | +15 | taiwan_language |
| Taiwan company/service detected | +15 | taiwan_company |
| README Taiwan mention | +5 | readme_mention |

### Rule Details

**official_domain (§30, §10.4 Registry Schema)**
- Check repository URL, endpoint URLs, data source URLs against `official_domains` config
- Config `config/domains.yaml` must contain at minimum:
  ```
  twse.com.tw, tpex.org.tw, taifex.com.tw, cwa.gov.tw, moi.gov.tw,
  moea.gov.tw, moj.gov.tw, ly.gov.tw, judicial.gov.tw, data.gov.tw
  ```
- Also scan README, source code, configs for domain references
- Also scan data source URLs

**Taiwan government API (§29 Data Source Detection)**
- Scan README and source code for: CWA, MOI, MOEA, MOL, MOF, PCC, LY, Judicial Yuan, data.gov.tw, gov.tw

**Taiwan financial API (§29)**
- Scan for: TWSE, TPEx, TAIFEX, TDCC, FinMind, Fugle, 台股, 上市, 上櫃

**Taiwan-specific dataset (§29)**
- Scan for: 實價登錄, LVR, land.moi.gov.tw, 房價, 房地產, 土地, 預售屋

**Taiwan payment (§29)**
- Scan for: ECPay, NewebPay, 綠界, 藍新

**Taiwan-specific keyword (§5.1)**
- Keywords: Taiwan, Taiwanese, 台灣, 臺灣, TW
- Search in: repository name, README, description, source code

**Taiwan language (§5.1)**
- Keywords: zh-TW, 繁體中文, 繁體, Traditional Chinese, Taiwan Mandarin, 注音, TOCFL

**Taiwan company/service (§5.1)**
- Keywords: SHOPLINE, 台灣 (in context of service)

**README Taiwan mention (§5.1)**
- Any Taiwan mention in README that doesn't match above specific rules → +5

### Official Data Sources (§30)
```yaml
official_domains:
  - twse.com.tw
  - tpex.org.tw
  - taifex.com.tw
  - cwa.gov.tw
  - moi.gov.tw
  - moea.gov.tw
  - moj.gov.tw
  - ly.gov.tw
  - judicial.gov.tw
  - data.gov.tw
```

## Scoring Algorithm
```go
func Score(server MCPServer) TaiwanRelevance {
    var score float64
    var evidence []Evidence

    // Rule 1: official_domain (+40)
    if matches := matchOfficialDomains(server); len(matches) > 0 {
        score += 40
        for _, m := range matches {
            evidence = append(evidence, Evidence{
                Type: "official_domain", Value: m, Weight: 1.0, Score: 40,
                Source: "repository_url", Timestamp: now,
                ContentHash: sha256(m),
            })
        }
    }

    // Rule 2: government API (+40)
    if matches := matchGovernmentAPIs(server); len(matches) > 0 {
        score += 40
        // add evidence...
    }

    // Rule 3: financial API (+35)
    if matches := matchFinancialAPIs(server); len(matches) > 0 {
        score += 35
    }

    // Rule 4: Taiwan dataset (+30)
    if matches := matchTaiwanDatasets(server); len(matches) > 0 {
        score += 30
    }

    // Rule 5: Taiwan keyword (+20)
    if matches := matchTaiwanKeywords(server); len(matches) > 0 {
        score += 20
    }

    // Rule 6: Taiwan language (+15)
    if matches := matchTaiwanLanguage(server); len(matches) > 0 {
        score += 15
    }

    // Rule 7: Taiwan company/service (+15)
    if matches := matchTaiwanCompany(server); len(matches) > 0 {
        score += 15
    }

    // Rule 8: README mention (+5)
    if hasTaiwanMentionInReadme(server) {
        score += 5
    }

    return TaiwanRelevance{
        Score: score,
        Level: thresholdToLevel(score),
        Evidence: evidence,
        Confidence: 1.0, // deterministic = full confidence
    }
}
```

## Level Thresholds
```text
score >= 70  → T5 (Taiwan Critical / Core Service)
score >= 55  → T4 (Taiwan official-data)
score >= 40  → T3 (Taiwan-specific)
score >= 20  → T2 (Taiwan-compatible)
score >= 5   → T1 (Taiwan mention only)
score < 5    → T0 (Unrelated)
```

## Relevance Levels (§15)
- **T5**: TWSE, CWA, MOI LVR, 立法院, 司法院, 政府 OpenData
- **T4**: FinMind, TDCC, 公司登記, 政府採購
- **T3**: Taiwan Payroll, Taiwan Mandarin, Taiwan Logistics, 台股, 台灣房價
- **T2**: Taiwan language support, Taiwan-compatible API, Taiwan user support
- **T1**: "Available for users in Taiwan" only
- **T0**: Purely unrelated

## LLM Classification (§18, only for ambiguous)
LLM is invoked ONLY when: `20 <= score <= 55` (ambiguous zone)

### LLM Output Schema
```json
{
  "taiwan_relevance": "T3",
  "confidence": 0.91,
  "categories": ["finance", "taiwan-stock"],
  "reason": "Provides Taiwan stock market data..."
}
```

### LLM Constraints (§2.3 LLM Isolation)
LLM MUST NOT modify:
- stars, last_commit, license, tool_count
- repository_url, endpoint, health_status

LLM can only provide:
- Taiwan relevance classification
- Description normalization
- Category classification
- Ambiguous source interpretation

## Category Classification (§19 Category Taxonomy)
Controlled vocabulary — must validate against allowed list:
```text
finance, stock, etf, banking, insurance,
real-estate, land, housing,
government, open-data, legislative, judicial, procurement,
weather, earthquake,
transport, traffic, railway, metro, bus,
logistics, payment, invoice, tax,
company, business,
healthcare, education,
agriculture, food, tourism, geography, gis,
language, traditional-chinese, culture,
ecommerce, devops, news
```

## Determinism (§TST-018)
- Same input MUST always produce the same score and classification
- 100 iterations MUST yield `unique(scores) = 1`
- 100 iterations MUST yield `unique(classification) = 1`

## Evidence Completeness (§TST-019)
Every scored rule MUST produce corresponding evidence record with:
- rule name
- source
- location
- matched value
- content hash
- score/weight
- timestamp
