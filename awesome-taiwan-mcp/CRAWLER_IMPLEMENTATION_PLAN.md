# `CRAWLER_IMPLEMENTATION_PLAN.md`

# Taiwan MCP Crawler
## Implementation Plan v0.1

---

# 1. Objective

實作一套可以持續掃描：

```text
GitHub
Glama
PulseMCP
MCP.so
Official MCP Registry
```

並建立 Taiwan MCP Registry 的 crawler。

核心目標：

```text
High Recall
+
High Precision
+
Deterministic Processing
+
Evidence Based Classification
+
Safe Verification
```

---

# 2. Implementation Strategy

不要一次實作完整系統。

採用：

```text
Phase 1
Data Model

Phase 2
GitHub Discovery

Phase 3
Normalization + Dedup

Phase 4
Taiwan Classification

Phase 5
Other Sources

Phase 6
Verification

Phase 7
Scoring

Phase 8
Incremental Crawl

Phase 9
LLM Classification

Phase 10
Registry API
```

---

# 3. Technology Stack

建議：

```text
Language: Go
Database: SQLite
Config: YAML
Schema: JSON Schema
HTTP: net/http
GitHub: GitHub REST API
MCP: Streamable HTTP / SSE protocol
CLI: cobra
Logging: slog
Metrics: Prometheus
Testing: Go testing
Container: Docker
```

避免 v0.1：

```text
Kubernetes
Kafka
PostgreSQL
Redis
Elasticsearch
LLM mandatory dependency
```

先保持單機可運作。

---

# 4. Repository Structure

```text
taiwan-mcp-crawler/

├── cmd/
│   └── crawler/
│       └── main.go
│
├── internal/
│   ├── crawler/
│   ├── sources/
│   │   ├── github/
│   │   ├── glama/
│   │   ├── pulsemcp/
│   │   ├── mcpso/
│   │   └── registry/
│   │
│   ├── normalize/
│   ├── dedupe/
│   ├── classify/
│   ├── verify/
│   ├── scoring/
│   ├── storage/
│   ├── export/
│   ├── observability/
│   └── models/
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
├── go.mod
└── README.md
```

---

# 5. Phase 1 — Foundation

## Tasks

建立：

```text
models
SQLite
config
logging
CLI
schema
migration
```

CLI：

```bash
taiwan-mcp-crawler version

taiwan-mcp-crawler crawl

taiwan-mcp-crawler export

taiwan-mcp-crawler stats
```

Acceptance：

```text
crawler 可啟動
SQLite 可建立
schema 可驗證
CLI 可執行
```

---

# 6. Phase 2 — GitHub Discovery

第一個真正 discovery source。

GitHub Search：

```text
Taiwan
台灣
臺灣
TWSE
TPEx
TAIFEX
FinMind
CWA
MOI
MOEA
ECPay
NewebPay
實價登錄
繁體中文
zh-TW
```

每個 candidate 保存：

```text
repository
description
README
stars
forks
license
topics
language
homepage
created_at
updated_at
pushed_at
```

Acceptance：

```text
可以取得 > 100 candidates
```

---

# 7. Phase 3 — Normalization

建立：

```go
type Normalizer interface {
    Normalize(RawRecord) (*MCPServer, error)
}
```

處理：

```text
URL normalization
name normalization
description normalization
repository metadata
endpoint extraction
manifest extraction
tool extraction
```

來源：

```text
README
package.json
pyproject.toml
go.mod
Cargo.toml
server.json
mcp.json
manifest
```

---

# 8. Phase 4 — Deduplication

建立 canonical identity。

優先：

```text
Repository URL
Package
Official Registry ID
Endpoint
Name + Author
```

Hash：

```text
SHA256(canonical_identity)
```

同一 MCP 出現在：

```text
GitHub
Glama
PulseMCP
MCP.so
```

必須合併成：

```text
1 MCPServer
4 Discovery Sources
```

---

# 9. Phase 5 — Taiwan Classification

第一版完全 deterministic。

Rules：

```text
official Taiwan domain
government API
Taiwan dataset
Taiwan financial API
Taiwan payment
Taiwan language
Taiwan-specific keyword
```

計算：

```text
taiwan_score
```

Mapping：

```text
>= 70 T5
>= 55 T4
>= 40 T3
>= 20 T2
>= 5  T1
else  T0
```

所有分數必須保存 evidence。

---

# 10. Phase 6 — Source Expansion

依序：

```text
GitHub
↓
Official MCP Registry
↓
Glama
↓
PulseMCP
↓
MCP.so
```

每個 source 都實作：

```go
type SourceAdapter interface {
    Name() string
    Discover(ctx context.Context) ([]RawCandidate, error)
    Fetch(ctx context.Context, candidate RawCandidate) (*RawRecord, error)
}
```

Source failure 不得造成整個 crawler failure。

---

# 11. Phase 7 — Verification

Repository：

```text
HTTP reachable
Git repository reachable
README available
package manifest available
MCP implementation detectable
```

Endpoint：

```text
DNS
TLS
HTTP
MCP initialize
tools/list
resources/list
prompts/list
```

禁止：

```text
execute arbitrary MCP
npm install
pip install
docker run
shell execution
```

Crawler v0.1：

> **Never execute discovered code.**

---

# 12. Phase 8 — Quality Scoring

建立：

```text
Data Source
Maintenance
Documentation
MCP Compliance
Tool Schema
Health
Repository
License
Security
Community
```

產生：

```text
score: 0–100
grade: A–F
```

Score 必須 deterministic。

相同 input：

```text
same score
```

---

# 13. Phase 9 — Security Scanner

Static analysis：

```text
exec
shell
eval
subprocess
child_process
os.system
filesystem write
credential collection
arbitrary URL
browser automation
RCE patterns
hardcoded secrets
```

結果：

```text
LOW
MEDIUM
HIGH
CRITICAL
UNKNOWN
```

不要直接封鎖所有 risky MCP。

只標記。

---

# 14. Phase 10 — Incremental Crawl

保存：

```text
last_seen
last_updated
last_verified
etag
last_modified
pushed_at
```

Daily crawl：

```text
只更新變動 repository
```

Weekly：

```text
Full crawl
```

---

# 15. Phase 11 — LLM Classifier

LLM 只處理：

```text
Ambiguous candidates
```

例如：

```text
Taiwan score 20–55
```

LLM output：

```json
{
  "relevance": "T3",
  "confidence": 0.87,
  "categories": [
    "finance"
  ],
  "reason": "..."
}
```

LLM 不允許：

```text
修改 repository URL
修改 stars
修改 endpoint
修改 tool schema
修改 health
```

---

# 16. Phase 12 — Registry Export

輸出：

```text
registry.json
registry.min.json
categories.json
sources.json
statistics.json
health.json
```

Registry JSON 必須可直接被其他系統讀取。

---

# 17. Phase 13 — Registry API

提供：

```http
GET /api/v1/servers
GET /api/v1/servers/:id
GET /api/v1/search
GET /api/v1/categories
GET /api/v1/sources
GET /api/v1/statistics
GET /api/v1/health
```

---

# 18. Phase 14 — Search Engine

支援：

```bash
search twse

search real-estate

search weather

search government

search --level T5

search --category finance

search --min-score 80
```

Search ranking：

```text
Taiwan relevance
+
capability match
+
health
+
quality
```

---

# 19. Phase 15 — Scheduling

建議：

```text
06:00 GitHub
07:00 Official Registry
08:00 Glama
09:00 PulseMCP
10:00 MCP.so
```

Weekly：

```text
Sunday 02:00 Full Crawl
```

Production 可以改成：

```text
cron
systemd timer
Kubernetes CronJob
```

但 crawler 本身不應依賴 scheduler。

---

# 20. Phase 16 — Observability

Metrics：

```text
crawler_candidates_total
crawler_candidates_taiwan_total
crawler_duplicates_total

crawler_verification_success_total
crawler_verification_failure_total

crawler_source_errors_total

crawler_crawl_duration_seconds
crawler_http_requests_total
```

Logs：

```text
crawl_id
source
candidate_id
server_id
stage
error
```

---

# 21. Error Handling

Pipeline：

```text
source
  ↓
candidate
  ↓
normalize
  ↓
dedupe
  ↓
classify
  ↓
verify
  ↓
score
  ↓
persist
```

每個 stage 必須：

```text
recoverable
observable
retryable
idempotent
```

---

# 22. Retry Policy

HTTP：

```text
429 → exponential backoff
5xx → retry
4xx → usually no retry
timeout → retry
DNS failure → retry
```

建議：

```text
max retries = 3
base delay = 1s
max delay = 30s
```

---

# 23. Concurrency

每個 source 使用獨立 worker pool。

例如：

```text
GitHub     4 workers
Glama      2 workers
PulseMCP   2 workers
MCP.so     2 workers
Registry   2 workers
```

必須有：

```text
rate limiter
context cancellation
timeout
```

---

# 24. Testing Strategy

## Unit

測試：

```text
URL normalization
identity
dedup
Taiwan scoring
category
quality score
security rules
```

## Integration

測試：

```text
GitHub adapter
Registry adapter
SQLite
MCP handshake
```

## End-to-End

：

```text
discover
→ normalize
→ dedupe
→ classify
→ verify
→ score
→ export
```

---

# 25. Test Fixtures

建立：

```text
tests/fixtures/

github/
glama/
pulsemcp/
mcpso/
registry/

taiwan/
non-taiwan/
duplicate/
invalid/
archived/
dead-endpoint/
```

Fixture 必須固定。

避免測試依賴 live Internet。

---

# 26. Milestone

## M1

```text
CLI
SQLite
Schema
GitHub discovery
```

## M2

```text
Normalization
Deduplication
```

## M3

```text
Taiwan classification
Evidence
```

## M4

```text
All sources
```

## M5

```text
Verification
Health
```

## M6

```text
Quality
Security
```

## M7

```text
Incremental
Scheduler
Metrics
```

## M8

```text
LLM classification
Registry API
```

---

# 27. Definition of Done

Crawler v0.1：

```text
✓ GitHub discovery
✓ Official Registry discovery
✓ Normalization
✓ Deduplication
✓ Taiwan T0–T5
✓ Category
✓ Evidence
✓ Repository verification
✓ MCP handshake
✓ Health
✓ Quality score
✓ SQLite
✓ JSON registry
✓ CLI
✓ Tests
```

Crawler v0.2：

```text
✓ Glama
✓ PulseMCP
✓ MCP.so
✓ Incremental crawl
✓ Security scanner
✓ LLM ambiguous classification
✓ Metrics
✓ Registry API
```

---

# 28. Integration With mcp-go-core

Crawler 不應直接成為：

```text
mcp-go-core
```

的一部分。

建議：

```text
taiwan-mcp-crawler
        │
        ▼
Taiwan MCP Registry
        │
        ▼
Registry Client
        │
        ▼
mcp-go-core
        │
        ├── capability match
        ├── health check
        ├── feature graph
        ├── auto enable
        └── runtime profile
```

這樣可以保持：

```text
Discovery Plane
≠
Runtime Plane
```

---

# 29. Final Architecture

```text
                Internet
                   │
        ┌──────────┼───────────┐
        ▼          ▼           ▼
     GitHub      Glama      Registries
        │          │           │
        └──────────┼───────────┘
                   ▼
             Source Adapters
                   │
                   ▼
             Normalization
                   │
                   ▼
              Dedup Engine
                   │
                   ▼
          Taiwan Classifier
                   │
                   ▼
             Verification
                   │
                   ▼
             Quality Score
                   │
                   ▼
           Taiwan MCP Registry
                   │
          ┌────────┴─────────┐
          ▼                  ▼
      REST API          registry.json
          │
          ▼
     mcp-go-core
```

---

# 30. Priority Rule

實作時遵循：

```text
Correctness
    >
Completeness
    >
Performance
    >
Convenience
```

不要為了「找到更多 MCP」而降低 precision。

Registry 的價值不是：

```text
找到最多
```

而是：

```text
找到可信、可驗證、可使用的 Taiwan MCP
```