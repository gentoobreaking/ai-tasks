# `TAIWAN_MCP_CRAWLER_SPEC.md`

**Version:** v0.1
**Status:** Development Specification
**Target:** Taiwan MCP Registry
**Scope:** GitHub / Glama / PulseMCP / MCP.so / Official MCP Registry
**Primary Output:** `taiwan-mcp-registry.json`

---

## 1. 目標

建立一套自動化 crawler，用於持續發現、分析、去重與驗證公開 MCP Server，並判斷其是否屬於：

> **Taiwan-related MCP**

Crawler 必須支援：

```text
GitHub
Glama
PulseMCP
MCP.so
Official MCP Registry
```

並產生統一格式：

```text
Discovery
    ↓
Candidate
    ↓
Normalize
    ↓
Deduplicate
    ↓
Taiwan Relevance Detection
    ↓
Repository / Endpoint Verification
    ↓
Capability Extraction
    ↓
Health Check
    ↓
Quality Scoring
    ↓
Registry
```

---

# 2. 核心設計原則

## 2.1 Source Agnostic

不同來源只能負責：

```text
Discover
Extract
```

不能直接決定最終 Registry schema。

---

## 2.2 Deterministic First

所有可以透過 deterministic rule 判斷的內容，不交給 LLM。

例如：

```text
GitHub repository URL
Repository owner
Stars
Forks
License
Last commit
README
package.json
pyproject.toml
MCP manifest
Transport
Tools
```

全部由 crawler 直接取得。

---

## 2.3 LLM Isolation

LLM 只能負責：

```text
Taiwan relevance classification
Description normalization
Category classification
Ambiguous source interpretation
```

不能修改：

```text
stars
last_commit
license
tool_count
repository_url
endpoint
health_status
```

---

# 3. 系統架構

```text
                    ┌─────────────────────┐
                    │ Scheduler            │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Crawl Coordinator   │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
     GitHub Adapter       Glama Adapter       PulseMCP Adapter
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Candidate Store     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Normalizer          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Dedup Engine        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Taiwan Classifier   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Verification Engine │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
          Metadata         MCP Manifest      Health
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Quality Scorer      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Registry Generator  │
                    └──────────┬──────────┘
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
               JSON Registry  SQLite    Reports
```

---

# 4. Source Adapter

所有資料來源必須實作統一 interface：

```go
type SourceAdapter interface {
    Name() string
    Discover(ctx context.Context) ([]RawCandidate, error)
    Fetch(ctx context.Context, candidate RawCandidate) (*RawRecord, error)
}
```

---

# 5. GitHub Adapter

## 5.1 搜尋策略

不能只搜尋：

```text
"Taiwan MCP"
```

必須建立 keyword matrix。

### Taiwan keywords

```text
Taiwan
Taiwanese
台灣
臺灣
TW
zh-TW
繁體中文
繁體
```

### Government

```text
data.gov.tw
gov.tw
moi.gov.tw
moea.gov.tw
mof.gov.tw
mohw.gov.tw
cwa.gov.tw
ly.gov.tw
judicial.gov.tw
law.moj.gov.tw
```

### Finance

```text
TWSE
TPEx
TAIFEX
TDCC
FinMind
Fugle
台股
上市
上櫃
```

### Real Estate

```text
實價登錄
LVR
land.moi.gov.tw
房價
房地產
土地
預售屋
```

### Payment

```text
ECPay
NewebPay
綠界
藍新
```

### Language

```text
Taiwan Mandarin
Traditional Chinese
zh-TW
注音
TOCFL
```

---

# 6. GitHub Search Query

建立 query generator：

```go
type GitHubQuery struct {
    Query string
    Topic string
    Language string
}
```

例如：

```text
mcp Taiwan
mcp 台灣
mcp 臺灣
mcp TWSE
mcp "實價登錄"
mcp "data.gov.tw"
mcp "立法院"
mcp "Taiwan Legal"
mcp ECPay
mcp NewebPay
mcp SHOPLINE
```

另外搜尋：

```text
topic:mcp Taiwan
topic:model-context-protocol Taiwan
```

---

# 7. GitHub Candidate Extraction

必須取得：

```text
repository_url
owner
name
description

stars
forks
watchers

created_at
updated_at
pushed_at

license

language

topics

default_branch

open_issues

archived

fork

homepage

README

package.json
pyproject.toml
go.mod
Cargo.toml
```

如果存在：

```text
server.json
mcp.json
manifest.json
```

也必須解析。

---

# 8. Glama Adapter

Glama 主要負責：

```text
MCP discovery
Server metadata
Tools
Resources
Prompts
Repository
Transport
Health
```

Normalizer 必須把 Glama 的 metadata 映射成：

```text
source = glama
source_url
repository_url
mcp_endpoint
tools
resources
prompts
transport
```

Glama 是：

> discovery source

而不是：

> source of truth

---

# 9. PulseMCP Adapter

PulseMCP 主要取得：

```text
server_name
description
repository
homepage
transport
tools
remote_endpoint
author
license
stars
last_updated
```

同樣全部轉換成：

```go
RawCandidate
```

---

# 10. MCP.so Adapter

MCP.so 主要作為：

```text
Discovery
Metadata
Remote MCP Endpoint
```

需要特別處理：

```text
server URL
GitHub URL
npm package
Docker image
remote endpoint
```

---

# 11. Official MCP Registry Adapter

Official Registry 必須作為最高可信度的 MCP metadata source 之一。

優先取得：

```text
name
description
repository
version
packages
runtime
transport
registry metadata
```

Registry candidate 必須標記：

```text
official_registry = true
```

---

# 12. Candidate Schema

第一階段資料：

```go
type RawCandidate struct {
    Source        string
    SourceURL     string
    Name          string
    Description   string
    RepositoryURL string
    HomepageURL   string
    Endpoint      string
    Author        string

    RawMetadata map[string]any

    DiscoveredAt time.Time
}
```

---

# 13. Normalized MCP Schema

最終統一：

```go
type MCPServer struct {
    ID string

    Name string
    Slug string

    Description string

    Category []string

    Region []string

    TaiwanRelevance TaiwanRelevance

    Repository RepositoryInfo

    Endpoints []Endpoint

    Transport []string

    Tools []Tool
    Resources []Resource
    Prompts []Prompt

    DataSources []DataSource

    License string

    Status Status

    Quality QualityScore

    Sources []SourceReference

    FirstSeen time.Time
    LastSeen time.Time
    LastVerified time.Time
}
```

---

# 14. Taiwan Relevance

這是整個 crawler 最重要的部分。

不要使用：

```text
is_taiwan = true/false
```

改成：

```go
type TaiwanRelevance struct {
    Score       float64
    Level       string
    Evidence    []Evidence
    Confidence  float64
}
```

---

# 15. Relevance Level

```text
T0 = unrelated

T1 = Taiwan mention only

T2 = Taiwan-compatible

T3 = Taiwan-specific

T4 = Taiwan official-data

T5 = Taiwan critical infrastructure / service
```

### T5

例如：

```text
TWSE
CWA
MOI LVR
立法院
司法院
政府 OpenData
```

### T4

例如：

```text
FinMind
TDCC
公司登記
政府採購
```

### T3

例如：

```text
Taiwan Payroll
Taiwan Mandarin
Taiwan Logistics
```

---

# 16. Taiwan Evidence

每個判定都必須保留 evidence：

```json
{
  "type": "official_domain",
  "value": "cwa.gov.tw",
  "weight": 1.0
}
```

例如：

```json
{
  "type": "repository_keyword",
  "value": "TWSE",
  "weight": 0.8
}
```

或：

```json
{
  "type": "data_source",
  "value": "內政部實價登錄",
  "weight": 1.0
}
```

---

# 17. Deterministic Relevance Score

第一階段：

```text
official Taiwan domain       +40
Taiwan government API        +40
Taiwan financial API         +35
Taiwan-specific dataset      +30
Taiwan-specific keyword      +20
Taiwan language              +15
Taiwan company/service       +15
README Taiwan mention        +5
```

Score：

```text
>= 70     T5
>= 55     T4
>= 40     T3
>= 20     T2
>= 5      T1
< 5       T0
```

---

# 18. LLM Classification

只有以下情況允許 LLM：

```text
score = 20~55
```

也就是：

> ambiguous candidate

LLM 輸出必須是 structured JSON：

```json
{
  "taiwan_relevance": "T3",
  "confidence": 0.91,
  "categories": [
    "finance",
    "taiwan-stock"
  ],
  "reason": "Provides Taiwan stock market data..."
}
```

LLM 不得直接修改 metadata。

---

# 19. Category Taxonomy

建立固定 taxonomy：

```text
finance
stock
etf
banking
insurance

real-estate
land
housing

government
open-data
legislative
judicial
procurement

weather
earthquake

transport
traffic
railway
metro
bus

logistics

payment
invoice
tax

company
business

healthcare

education

agriculture

food

tourism

geography
gis

language
traditional-chinese

culture

ecommerce

devops

news
```

---

# 20. Deduplication

這會是 crawler 的第二個核心問題。

同一 MCP 可能同時出現在：

```text
GitHub
Glama
PulseMCP
MCP.so
Official Registry
```

不能建立五筆。

---

# 21. Deduplication Identity

優先順序：

```text
1. repository URL
2. package identifier
3. official MCP registry name
4. canonical endpoint
5. normalized name + author
```

例如：

```text
https://github.com/asgard-ai-platform/mcp-tw-lvr
```

出現在：

```text
GitHub
Glama
PulseMCP
```

最後：

```text
1 MCP
3 discovery sources
```

---

# 22. Canonical Identity

建立：

```go
type Identity struct {
    CanonicalID string

    GitHubURL string
    PackageName string

    RegistryName string

    Fingerprints []string
}
```

Canonical ID：

```text
sha256(
    normalized_repository_url
)
```

---

# 23. MCP Fingerprint

如果 repository 不存在：

```text
fingerprint =
sha256(
    normalized_name +
    author +
    endpoint +
    sorted_tools
)
```

避免：

```text
same MCP
different directory
```

被重複建立。

---

# 24. Source Aggregation

最後：

```json
{
  "name": "mcp-tw-lvr",

  "sources": [
    {
      "type": "github",
      "url": "..."
    },
    {
      "type": "glama",
      "url": "..."
    },
    {
      "type": "pulsemcp",
      "url": "..."
    }
  ]
}
```

---

# 25. Verification Engine

每一個 candidate 都要驗證。

```text
Repository
      │
      ├── HTTP status
      ├── Git repository exists
      ├── archived?
      ├── last commit
      ├── package exists
      ├── README
      └── MCP implementation
```

Remote MCP：

```text
Endpoint
   │
   ├── DNS
   ├── TLS
   ├── HTTP
   ├── MCP handshake
   ├── initialize
   └── tools/list
```

---

# 26. MCP Health

狀態：

```text
HEALTHY
DEGRADED
UNAVAILABLE
INVALID
UNKNOWN
```

---

# 27. Repository Status

```text
ACTIVE
STALE
ARCHIVED
DELETED
UNKNOWN
```

建議：

```text
last commit < 90 days
    ACTIVE

90 ~ 180
    MAINTENANCE

180 ~ 365
    STALE

>365
    DORMANT
```

---

# 28. Tool Discovery

如果可以取得 MCP protocol metadata：

```text
tools/list
resources/list
prompts/list
```

必須保存。

Schema：

```go
type Tool struct {
    Name        string
    Description string
    InputSchema map[string]any
}
```

---

# 29. Data Source Detection

Crawler 必須分析：

```text
README
source code
configuration
environment variables
documentation
```

辨識：

```text
TWSE
TPEx
TAIFEX
TDCC
CWA
MOI
MOEA
MOL
MOF
PCC
LY
Judicial Yuan
data.gov.tw
ECPay
NewebPay
SHOPLINE
```

---

# 30. Official Source Detection

建立：

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

如果 MCP 直接使用官方 API：

```text
official_data_source = true
```

---

# 31. Quality Score

總分 100：

```text
Data Source         20
Maintenance         15
Documentation       10
MCP Compliance      15
Tool Schema         10
Health              10
Repository          5
License             5
Security             5
Community            5
```

---

# 32. Data Source Score

```text
Official Taiwan API      20
Government OpenData      18
Official company API     15
Known third-party API    10
Web scraping               7
Unknown                    0
```

這個非常重要。

例如：

```text
TWSE official API
```

應該比：

```text
Yahoo Finance scraping
```

高。

---

# 33. Security Assessment

至少檢查：

```text
Hard-coded API keys
Hard-coded passwords
Shell execution
Dynamic eval
Remote code execution
Arbitrary URL fetch
Filesystem write
Credential collection
Browser automation
```

Risk：

```text
LOW
MEDIUM
HIGH
CRITICAL
```

---

# 34. Registry Schema

最終輸出：

```text
registry/
├── registry.json
├── registry.min.json
├── categories.json
├── sources.json
├── statistics.json
└── health.json
```

---

# 35. `registry.json`

範例：

```json
{
  "schema_version": "1.0",

  "generated_at": "2026-09-04T00:00:00Z",

  "servers": [
    {
      "id": "mcp-tw-lvr",

      "name": "mcp-tw-lvr",

      "description": "Taiwan real estate transaction MCP",

      "category": [
        "real-estate",
        "government",
        "open-data"
      ],

      "region": [
        "TW"
      ],

      "taiwan_relevance": {
        "level": "T5",
        "score": 96,
        "confidence": 1.0
      },

      "official_data_source": true,

      "repository": {
        "url": "https://github.com/...",
        "stars": 120,
        "license": "MIT"
      },

      "transport": [
        "stdio"
      ],

      "tools": [],

      "quality": {
        "score": 88
      },

      "status": "ACTIVE"
    }
  ]
}
```

---

# 36. Storage Architecture

v0.1 不需要 Elasticsearch。

建議：

```text
SQLite
    +
JSON export
```

Schema：

```text
servers
sources
repositories
endpoints
tools
resources
prompts
data_sources
health_checks
quality_scores
crawl_runs
evidence
```

---

# 37. Crawl Run

每一次 crawl 都必須有 ID：

```text
crawl_id = 20260904T120000Z
```

保存：

```text
started_at
finished_at

sources_scanned

candidates_found

candidates_normalized

duplicates

taiwan_candidates

verified

failed

errors
```

---

# 38. Incremental Crawl

不能每天重新掃全部。

分：

### Full Crawl

```text
GitHub
Glama
PulseMCP
MCP.so
Registry
```

頻率：

```text
weekly
```

### Incremental Crawl

```text
last_seen
last_updated
ETag
Last-Modified
GitHub pushed_at
```

頻率：

```text
daily
```

---

# 39. Scheduler

建議：

```text
06:00 GitHub incremental
07:00 Official Registry
08:00 Glama
09:00 PulseMCP
10:00 MCP.so

02:00 Sunday
    Full Crawl
```

---

# 40. Rate Limit

每個 source 必須獨立 rate limiter：

```go
type RateLimitConfig struct {
    RequestsPerSecond float64
    Burst             int
    MaxConcurrency    int
}
```

不能因為 GitHub rate limit 導致其他 source 全部停止。

---

# 41. Failure Isolation

單一 source：

```text
timeout
HTTP 500
403
rate limit
schema changed
```

不能讓整個 crawler fail。

狀態：

```text
SOURCE_DEGRADED
```

而不是：

```text
CRAWL_FAILED
```

---

# 42. Observability

必須提供 metrics：

```text
crawler_candidates_total
crawler_candidates_taiwan_total

crawler_duplicates_total

crawler_verification_success_total
crawler_verification_failed_total

crawler_source_errors_total

crawler_crawl_duration_seconds

crawler_http_requests_total
```

---

# 43. Logging

Structured JSON：

```json
{
  "level": "info",
  "component": "github",
  "crawl_id": "20260904",
  "event": "candidate_discovered",
  "repository": "foo/bar"
}
```

禁止：

```text
API Key
OAuth token
password
Authorization header
```

進入 log。

---

# 44. CLI

必須提供：

```bash
taiwan-mcp-crawler crawl
```

```bash
taiwan-mcp-crawler crawl --source github
```

```bash
taiwan-mcp-crawler crawl --source all
```

```bash
taiwan-mcp-crawler verify
```

```bash
taiwan-mcp-crawler dedupe
```

```bash
taiwan-mcp-crawler score
```

```bash
taiwan-mcp-crawler export
```

```bash
taiwan-mcp-crawler stats
```

---

# 45. Query

支援：

```bash
taiwan-mcp-crawler search twse
```

```bash
taiwan-mcp-crawler search real-estate
```

```bash
taiwan-mcp-crawler search government
```

```bash
taiwan-mcp-crawler search --level T5
```

---

# 46. Output

例如：

```text
$ taiwan-mcp-crawler stats

Taiwan MCP Registry
──────────────────────────────

Sources scanned       5
Candidates            1,284
Unique MCP            742

Taiwan relevant       91

T5 Official           18
T4 Government         21
T3 Taiwan-specific    35
T2 Compatible         17

Healthy               68
Degraded              11
Unavailable            9
Unknown                3
```

---

# 47. API

之後可以提供：

```text
GET /api/v1/servers

GET /api/v1/servers/:id

GET /api/v1/categories

GET /api/v1/sources

GET /api/v1/search?q=twse

GET /api/v1/taiwan

GET /api/v1/taiwan?level=T5

GET /api/v1/stats
```

---

# 48. Web UI

v0.1 不要求。

v0.2 可以：

```text
Taiwan MCP Registry
────────────────────────

Search: [____________]

Category:
☐ Finance
☐ Government
☐ Real Estate
☐ Weather
☐ Legal
☐ Payment
☐ Logistics
☐ Language
☐ Agriculture

Taiwan Level:
☐ T5
☐ T4
☐ T3

Status:
☐ Active
☐ Healthy
```

---

# 49. Repository Structure

如果用 Go，我建議：

```text
taiwan-mcp-crawler/
│
├── cmd/
│   └── crawler/
│       └── main.go
│
├── internal/
│   ├── crawler/
│   │   ├── coordinator.go
│   │   └── scheduler.go
│   │
│   ├── sources/
│   │   ├── github/
│   │   ├── glama/
│   │   ├── pulsemcp/
│   │   ├── mcpso/
│   │   └── registry/
│   │
│   ├── normalize/
│   │
│   ├── dedupe/
│   │
│   ├── classify/
│   │   ├── rules.go
│   │   └── llm.go
│   │
│   ├── verify/
│   │   ├── repository.go
│   │   ├── endpoint.go
│   │   └── protocol.go
│   │
│   ├── scoring/
│   │
│   ├── storage/
│   │
│   ├── export/
│   │
│   └── observability/
│
├── schema/
│   ├── mcp-server.json
│   └── registry.json
│
├── config/
│   ├── sources.yaml
│   ├── keywords.yaml
│   ├── domains.yaml
│   └── scoring.yaml
│
├── migrations/
│
├── registry/
│
├── tests/
│
├── Dockerfile
├── docker-compose.yaml
└── README.md
```

---

# 50. Configuration

例如：

```yaml
sources:

  github:
    enabled: true
    rate_limit: 2

  glama:
    enabled: true

  pulsemcp:
    enabled: true

  mcpso:
    enabled: true

  official_registry:
    enabled: true
```

---

# 51. Discovery Strategy

Crawler 不可以只有 keyword search。

必須使用：

```text
Keyword Discovery
        +
Domain Discovery
        +
Repository Topic Discovery
        +
Organization Discovery
        +
Dependency Discovery
        +
Cross-source Discovery
```

例如找到：

```text
FinMind
```

之後反向尋找：

```text
FinMind MCP
FinMind GitHub
FinMind package
FinMind directory entries
```

---

# 52. Recursive Discovery

每個 candidate 可以產生：

```text
Repository
    ↓
Author
    ↓
Organization
    ↓
Other repositories
```

例如：

```text
asgard-ai-platform/mcp-tw-lvr
```

可以繼續掃：

```text
asgard-ai-platform
```

找到：

```text
mcp-tw-company
mcp-tdcc
mcp-newebpay
mcp-shopline
mcp-twfood
```

這會大幅提高 recall。

---

# 53. Cross Source Discovery Graph

最終建立：

```text
               GitHub
                 │
          ┌──────┼──────┐
          ▼      ▼      ▼
       Glama  PulseMCP MCP.so
          │      │      │
          └──────┼──────┘
                 ▼
          Official Registry
```

每個 node：

```text
MCPServer
```

每條 edge：

```text
DISCOVERED_FROM
SAME_REPOSITORY
SAME_ENDPOINT
SAME_PACKAGE
SAME_AUTHOR
```

這其實已經開始接近：

> **MCP Knowledge Graph**

---

# 54. Recall / Precision KPI

Crawler 最重要的不是「找到很多」。

而是：

### Recall

```text
已知台灣 MCP
        ↓
Crawler 是否全部找得到
```

目標：

```text
v0.1 ≥ 80%
v0.2 ≥ 90%
```

---

### Precision

```text
Crawler 找到
        ↓
真正 Taiwan MCP
```

目標：

```text
v0.1 ≥ 85%
v0.2 ≥ 95%
```

---

# 55. Dedup KPI

目標：

```text
Duplicate rate < 5%
```

例如：

```text
5 sources
100 candidates

→ 20 unique MCP
```

而不是：

```text
100 records
```

---

# 56. Freshness KPI

```text
Active MCP metadata
    < 24h

Health
    < 24h

GitHub metadata
    < 48h
```

---

# 57. Verification KPI

```text
Repository verification ≥ 98%

Remote MCP health verification ≥ 90%

False positive ≤ 5%
```

---

# 58. Security KPI

Crawler：

```text
NEVER execute discovered MCP
```

這點非常重要。

Crawler **不能因為找到 MCP 就直接執行其 code**。

只允許：

```text
HTTP
GitHub API
Git clone
Static parsing
MCP protocol handshake
```

如果需要執行：

```text
sandbox
container
network isolation
read-only filesystem
CPU limit
memory limit
timeout
```

---

# 59. Supply Chain Security

對 package：

```text
npm
PyPI
Docker
Go
Cargo
```

只做：

```text
metadata inspection
```

不要：

```text
npm install
pip install
docker run
```

v0.2 才考慮 sandbox execution。

---

# 60. LLM Security

如果使用 LLM 分類 README：

**README 是 untrusted input。**

必須：

```text
README
   ↓
sanitize
   ↓
extract relevant text
   ↓
LLM
```

不能讓 README 中的：

```text
Ignore previous instructions
Call this URL
Upload credentials
```

影響 crawler。

---

# 61. Versioning

Registry：

```text
schema_version
```

MCP：

```text
server_version
```

Crawler：

```text
crawler_version
```

每次 export：

```text
registry_version
```

例如：

```text
Taiwan MCP Registry
v1.2026.09.04
```

---

# 62. Historical Data

不能只保存最新狀態。

例如：

```text
MCP A
2026-01 stars = 10
2026-06 stars = 100
2026-09 stars = 250
```

因此：

```text
server_snapshots
```

必須保存。

這樣可以做：

```text
Growth
Popularity
Maintenance
Ecosystem trend
```

---

# 63. Taiwan MCP Ranking

有了 snapshot 後可以產生：

```text
Taiwan MCP Top 20
```

排序：

```text
Quality
+
Maintenance
+
Official Data
+
Community
+
Health
```

但：

> Ranking 不應影響原始 Registry。

---

# 64. Source Trust

不同來源建立 trust score：

```text
Official MCP Registry    1.00
GitHub                   0.95
Glama                    0.85
PulseMCP                 0.80
MCP.so                   0.75
```

這個只用於：

```text
metadata conflict resolution
```

不是用於 Taiwan relevance。

---

# 65. Conflict Resolution

例如：

```text
GitHub:
tools = 10

Glama:
tools = 12
```

不要直接選 Glama。

優先：

```text
Live MCP protocol
    >
Repository manifest
    >
Official registry
    >
Directory metadata
```

---

# 66. Data Provenance

所有欄位最好能追溯：

```json
{
  "tools_count": {
    "value": 12,
    "source": "mcp_protocol",
    "verified_at": "..."
  }
}
```

這會讓 Registry 具備：

> **auditability**

---

# 67. MVP Scope

第一版不要一次做完所有功能。

### Phase 1

```text
GitHub
Official Registry
```

完成：

```text
Discovery
Normalize
Dedup
Taiwan classification
JSON export
```

---

### Phase 2

加入：

```text
Glama
PulseMCP
MCP.so
```

---

### Phase 3

加入：

```text
Health check
MCP protocol inspection
Quality score
SQLite
```

---

### Phase 4

加入：

```text
LLM ambiguous classification
Historical snapshots
REST API
Web UI
```

---

# 68. 建議實作順序

```text
Sprint 1
├── Domain model
├── Registry schema
└── SQLite

Sprint 2
├── GitHub adapter
└── Official Registry adapter

Sprint 3
├── Normalizer
├── Dedup
└── Identity

Sprint 4
├── Taiwan rule engine
└── Category engine

Sprint 5
├── Glama
├── PulseMCP
└── MCP.so

Sprint 6
├── Verification
├── MCP handshake
└── Health

Sprint 7
├── Quality scoring
└── Evidence

Sprint 8
├── Scheduler
├── Incremental crawl
└── Metrics

Sprint 9
├── LLM classification
└── Ambiguity resolution

Sprint 10
├── API
├── historical snapshots
└── Web UI
```

---

# 69. Acceptance Criteria

Crawler 必須至少做到：

### Discovery

```text
[PASS] GitHub discovery
[PASS] Official Registry discovery
[PASS] Glama discovery
[PASS] PulseMCP discovery
[PASS] MCP.so discovery
```

### Normalization

```text
[PASS] common MCP schema
[PASS] repository normalization
[PASS] endpoint normalization
```

### Dedup

```text
[PASS] same repository → one MCP
[PASS] same endpoint → one MCP
[PASS] multi-source aggregation
```

### Taiwan Classification

```text
[PASS] official Taiwan source
[PASS] Taiwan keyword
[PASS] Taiwan domain
[PASS] ambiguous candidate
```

### Verification

```text
[PASS] repository health
[PASS] endpoint health
[PASS] MCP handshake
[PASS] tools/list
```

### Registry

```text
[PASS] registry.json
[PASS] SQLite
[PASS] source provenance
[PASS] crawl history
```

---

# 70. 最終成果

完成後執行：

```bash
taiwan-mcp-crawler crawl --source all
```

應該得到：

```text
registry/
├── registry.json
├── registry.min.json
├── categories.json
├── sources.json
├── statistics.json
└── health.json
```

並可以：

```bash
taiwan-mcp-crawler search "real estate"
```

得到：

```text
mcp-tw-lvr
mcp-xxx
mcp-yyy
```

以及：

```bash
taiwan-mcp-crawler search --level T5
```

得到：

```text
TWSE MCP
Taiwan Legal DB
Taiwan Legislative Yuan
mcp-tw-lvr
CWA MCP
...
```

---

# 71. 最終架構定位

我會把這個專案定位成：

```text
                 ┌───────────────────────────┐
                 │ Taiwan MCP Ecosystem      │
                 │                           │
                 │       Registry            │
                 └─────────────▲─────────────┘
                               │
                    ┌──────────┴──────────┐
                    │ Taiwan MCP Crawler │
                    └──────────▲──────────┘
                               │
       ┌────────────┬──────────┼──────────┬────────────┐
       │            │          │          │            │
     GitHub       Glama     PulseMCP    MCP.so    Official
                                                    Registry
```

而 Registry 再往上：

```text
                    AI Agent
                       │
                       ▼
                MCP Discovery
                       │
                       ▼
              Taiwan MCP Registry
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      Finance       Government     Real Estate
        │              │              │
      TWSE             LY             LVR
      FinMind          Legal          ...
      TDCC             PCC
```

這樣它就不只是「爬 GitHub 的工具」，而是一個真正的 **Taiwan MCP Discovery / Registry Infrastructure**。

---

