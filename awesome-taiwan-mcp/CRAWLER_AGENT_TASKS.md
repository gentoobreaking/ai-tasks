# `CRAWLER_AGENT_TASKS.md`

# Taiwan MCP Crawler
## Coding Agent Task Specification v0.1

---

# 1. Agent Rules

Coding Agent 必須遵守：

```text
1. 不得自行修改 Architecture
2. 不得自行新增外部 dependency，除非 Task 明確要求
3. 不得執行 discovered MCP code
4. 不得 npm install / pip install discovered repository
5. 不得修改已完成 Task 的 public API
6. 所有 schema change 必須同步 migration
7. 所有 crawler stage 必須可測試
8. 所有外部資料必須保留 source/evidence
9. 所有 deterministic scoring 必須可重現
10. 不得用 LLM 取代 deterministic logic
```

---

# 2. Execution Order

Agent 必須依序：

```text
TASK-001
TASK-002
TASK-003
...
```

不可跳過 dependency。

---

# 3. TASK-001 — Project Bootstrap

建立：

```text
cmd/crawler/main.go
go.mod
README.md
Dockerfile
```

Acceptance：

```bash
go build ./...
go test ./...
```

必須成功。

---

# 4. TASK-002 — Domain Models

建立：

```text
internal/models/
```

Models：

```text
MCPServer
Repository
Endpoint
Tool
Resource
Prompt
DataSource
Health
Quality
Evidence
DiscoverySource
SecurityFinding
```

Acceptance：

```text
所有 model 可 marshal/unmarshal JSON
```

---

# 5. TASK-003 — JSON Schema

建立：

```text
schema/mcp-server.json
schema/registry.json
```

要求：

```text
schema_version
required fields
enum validation
nested objects
```

Acceptance：

```text
valid record → PASS
invalid record → FAIL
```

---

# 6. TASK-004 — SQLite

建立：

```text
internal/storage/
migrations/
```

Tables：

```text
mcp_servers
repositories
endpoints
tools
resources
prompts
data_sources
server_data_sources
sources
server_sources
health_checks
quality_scores
security_findings
evidence
crawl_runs
```

Acceptance：

```text
fresh database
migration
insert
update
query
```

全部成功。

---

# 7. TASK-005 — Source Adapter Interface

建立：

```go
type SourceAdapter interface {
    Name() string
    Discover(ctx context.Context) ([]RawCandidate, error)
    Fetch(ctx context.Context, candidate RawCandidate) (*RawRecord, error)
}
```

建立：

```text
internal/sources/
```

Acceptance：

至少提供：

```text
mock adapter
```

用於測試 pipeline。

---

# 8. TASK-006 — GitHub Adapter

建立：

```text
internal/sources/github/
```

支援：

```text
repository search
repository metadata
README
topics
license
commit information
```

Keyword：

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

Acceptance：

```text
github search → RawCandidate
```

---

# 9. TASK-007 — GitHub Rate Limit

實作：

```text
rate limiter
retry
429 handling
timeout
context cancellation
```

Acceptance：

```text
429 不會造成 crawler crash
```

---

# 10. TASK-008 — Normalizer

建立：

```text
internal/normalize/
```

支援：

```text
GitHub RawRecord
```

輸出：

```text
MCPServer
```

處理：

```text
repository URL
name
description
README
manifest
endpoint
runtime
license
```

---

# 11. TASK-009 — Manifest Detector

支援偵測：

```text
package.json
pyproject.toml
go.mod
Cargo.toml
server.json
mcp.json
manifest
```

不要執行 package manager。

只做 static parsing。

---

# 12. TASK-010 — Identity Engine

建立：

```text
internal/dedupe/
```

實作：

```text
CanonicalIdentity()
ServerID()
```

Priority：

```text
repository
package
registry ID
endpoint
name + author
```

Hash：

```text
SHA256
```

Acceptance：

同一 repo：

```text
same ID
```

不同 repo：

```text
different ID
```

---

# 13. TASK-011 — Deduplication Engine

輸入：

```text
[]MCPServer
```

輸出：

```text
[]MCPServer
```

要求：

```text
duplicate records merged
sources merged
evidence merged
tools merged
```

---

# 14. TASK-012 — Taiwan Keyword Engine

建立：

```text
config/keywords.yaml
internal/classify/rules.go
```

分類：

```text
government
finance
real-estate
payment
language
weather
transport
etc.
```

所有 keyword 必須 config-driven。

不要 hard-code。

---

# 15. TASK-013 — Taiwan Domain Engine

建立：

```text
config/domains.yaml
```

至少：

```text
twse.com.tw
tpex.org.tw
taifex.com.tw
cwa.gov.tw
moi.gov.tw
moea.gov.tw
moj.gov.tw
ly.gov.tw
judicial.gov.tw
data.gov.tw
```

支援：

```text
official
government
financial
```

classification。

---

# 16. TASK-014 — Taiwan Scoring

建立：

```text
internal/classify/
```

Score：

```text
official Taiwan domain +40
government API +40
financial API +35
Taiwan dataset +30
Taiwan keyword +20
Taiwan language +15
Taiwan company/service +15
README mention +5
```

Threshold：

```text
70 → T5
55 → T4
40 → T3
20 → T2
5  → T1
<5 → T0
```

Acceptance：

```text
same input = same result
```

---

# 17. TASK-015 — Evidence Engine

每個 scoring rule 必須產生：

```text
rule
source
location
matched value
score
timestamp
content hash
```

禁止只保存：

```text
score = 40
```

---

# 18. TASK-016 — Official Registry Adapter

建立：

```text
internal/sources/registry/
```

支援：

```text
Official MCP Registry discovery
fetch metadata
normalize
```

Source name：

```text
official-registry
```

---

# 19. TASK-017 — Glama Adapter

建立：

```text
internal/sources/glama/
```

功能：

```text
discover
fetch
normalize
```

要求：

```text
failure isolated
rate limited
retryable
```

---

# 20. TASK-018 — PulseMCP Adapter

建立：

```text
internal/sources/pulsemcp/
```

同樣要求：

```text
discover
fetch
normalize
```

---

# 21. TASK-019 — MCP.so Adapter

建立：

```text
internal/sources/mcpso/
```

支援：

```text
discover
fetch
normalize
```

---

# 22. TASK-020 — Source Aggregation

同一 MCP：

```text
GitHub
Glama
PulseMCP
MCP.so
Registry
```

必須合併。

輸出：

```json
{
  "sources": [
    "github",
    "glama",
    "pulsemcp",
    "mcpso"
  ]
}
```

---

# 23. TASK-021 — Repository Verification

建立：

```text
internal/verify/repository.go
```

檢查：

```text
HTTP
Git
README
manifest
MCP implementation
archived
last commit
```

結果：

```text
ACTIVE
MAINTENANCE
STALE
DORMANT
ARCHIVED
DELETED
UNKNOWN
```

---

# 24. TASK-022 — MCP Protocol Verification

建立：

```text
internal/verify/protocol.go
```

支援：

```text
initialize
tools/list
resources/list
prompts/list
```

只允許 protocol-level communication。

禁止：

```text
execute tool
```

---

# 25. TASK-023 — Endpoint Health

建立：

```text
internal/verify/endpoint.go
```

檢查：

```text
DNS
TLS
HTTP
MCP initialize
latency
```

Status：

```text
HEALTHY
DEGRADED
UNAVAILABLE
INVALID
UNKNOWN
```

---

# 26. TASK-024 — Tool Extraction

從：

```text
tools/list
```

取得：

```text
name
description
input schema
annotations
```

保存至：

```text
tools
```

---

# 27. TASK-025 — Quality Engine

建立：

```text
internal/scoring/
```

實作：

```text
Data Source 20
Maintenance 15
Documentation 10
MCP Compliance 15
Tool Schema 10
Health 10
Repository 5
License 5
Security 5
Community 5
```

輸出：

```text
0–100
A–F
```

---

# 28. TASK-026 — Security Scanner

建立：

```text
internal/verify/security.go
```

Static scan：

```text
exec
shell
eval
subprocess
filesystem write
credential collection
arbitrary URL
RCE
hardcoded secrets
```

輸出：

```text
LOW
MEDIUM
HIGH
CRITICAL
UNKNOWN
```

---

# 29. TASK-027 — Registry Persistence

把 pipeline：

```text
discover
→ normalize
→ dedupe
→ classify
→ verify
→ score
```

寫入 SQLite。

要求：

```text
idempotent
```

同一 crawl 執行兩次不得產生 duplicate server。

---

# 30. TASK-028 — JSON Export

建立：

```text
internal/export/
```

輸出：

```text
registry.json
registry.min.json
categories.json
sources.json
statistics.json
health.json
```

---

# 31. TASK-029 — Crawl Coordinator

建立：

```text
internal/crawler/coordinator.go
```

Pipeline：

```text
Source
 ↓
Discover
 ↓
Fetch
 ↓
Normalize
 ↓
Dedup
 ↓
Classify
 ↓
Verify
 ↓
Score
 ↓
Persist
```

---

# 32. TASK-030 — Crawl Run

每次 crawler execution 建立：

```text
crawl_id
started_at
finished_at
sources
candidates
normalized
duplicates
taiwan_candidates
verified
failed
errors
```

---

# 33. TASK-031 — CLI

提供：

```bash
crawler crawl
crawler crawl --source github
crawler crawl --source all

crawler verify
crawler dedupe
crawler score
crawler export
crawler stats

crawler search twse
crawler search real-estate
crawler search --level T5
```

---

# 34. TASK-032 — Incremental Crawl

實作：

```text
ETag
Last-Modified
pushed_at
updated_at
last_seen
```

避免重複下載未變更內容。

---

# 35. TASK-033 — Retry / Backoff

所有 network adapter：

```text
timeout
retry
backoff
rate limit
```

統一 implementation。

不要每個 adapter 自己重新實作。

---

# 36. TASK-034 — Metrics

建立：

```text
internal/observability/
```

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

---

# 37. TASK-035 — LLM Classifier

建立：

```text
internal/classify/llm.go
```

只有：

```text
ambiguous score
```

才能進入 LLM。

LLM 必須輸出 structured JSON。

LLM 不可修改 factual metadata。

---

# 38. TASK-036 — Search API

建立：

```text
internal/api/
```

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

# 39. TASK-037 — Capability Search

Query：

```text
Taiwan stock
Taiwan real estate
Taiwan weather
Taiwan government data
```

搜尋：

```text
name
description
category
tools
resources
data sources
```

---

# 40. TASK-038 — Test Fixtures

建立：

```text
tests/fixtures/
```

包含：

```text
Taiwan MCP
Non-Taiwan MCP
Duplicate MCP
Archived MCP
Dead endpoint
Invalid MCP
Official API MCP
Scraping MCP
```

---

# 41. TASK-039 — Unit Tests

Coverage target：

```text
>= 80%
```

至少：

```text
identity
dedup
classification
scoring
normalization
security
```

---

# 42. TASK-040 — Integration Tests

測試：

```text
GitHub adapter
Registry adapter
SQLite
MCP handshake
```

Network tests 使用 mock server。

---

# 43. TASK-041 — End-to-End Test

執行：

```text
discover
→ normalize
→ dedupe
→ classify
→ verify
→ score
→ persist
→ export
```

Acceptance：

```text
registry.json generated
SQLite populated
statistics generated
```

---

# 44. TASK-042 — Docker

建立：

```text
Dockerfile
docker-compose.yaml
```

要求：

```text
non-root
read-only filesystem where possible
no privileged
no Docker socket
resource limits
```

---

# 45. TASK-043 — Security Boundary

確認 crawler：

```text
NEVER executes discovered MCP
NEVER installs discovered dependencies
NEVER executes README commands
NEVER executes arbitrary shell
NEVER runs Docker from discovered repo
```

這是 **Hard Requirement**。

---

# 46. TASK-044 — Documentation

README 必須包含：

```text
Architecture
Installation
Configuration
CLI
Database
Registry
Security
Development
Testing
Troubleshooting
```

---

# 47. TASK-045 — Final Verification

執行：

```bash
go test ./...
go vet ./...
go build ./...
```

並執行：

```bash
crawler crawl --source github
crawler crawl --source all
crawler export
crawler stats
```

確認：

```text
registry.json exists
SQLite exists
no duplicate IDs
T0–T5 valid
quality score valid
evidence exists
```

---

# 48. Agent Stop Conditions

Agent 必須停止並回報，而不是自行決策：

```text
Architecture conflict
Schema breaking change
Security boundary violation
Unknown external API contract
Authentication requirement
Data model ambiguity
Protocol ambiguity
```

格式：

```text
BLOCKED

Task:
Reason:
Evidence:
Impact:
Recommended Decision:
```

---

# 49. Agent Commit Strategy

每個 Task：

```text
one logical change
```

建議：

```text
feat: add registry domain models
feat: add github source adapter
feat: add taiwan classifier
feat: add dedup engine
feat: add protocol verifier
test: add classification fixtures
```

不要：

```text
一個 commit 完成 10 個 task
```

---

# 50. Definition of Done

每一個 Task 必須同時滿足：

```text
Implementation
+
Unit Test
+
Error Handling
+
Logging
+
Documentation
```

如果只有 code：

```text
NOT DONE
```

---

# 51. Global Acceptance Criteria

Crawler v0.1：

```text
Discovery      PASS
Normalization  PASS
Dedup          PASS
Classification PASS
Verification   PASS
Scoring        PASS
Persistence    PASS
Export         PASS
CLI            PASS
Testing        PASS
Security       PASS
```

KPI：

```text
Recall >= 80%
Precision >= 85%
Duplicate rate < 5%
Repository verification >= 98%
False positive <= 5%
```

---

# 52. Final Agent Instruction

整個系統的核心原則：

```text
Discover broadly.
Normalize deterministically.
Deduplicate aggressively.
Classify with evidence.
Verify safely.
Score deterministically.
Persist everything important.
Never execute untrusted MCP code.
```

Agent 不應把 crawler 做成單純的：

```text
web scraper
```

而應實作成：

```text
Taiwan MCP Discovery + Verification + Registry Pipeline
```

最終產物：

```text
                 ┌─────────────────────┐
                 │ Taiwan MCP Registry  │
                 └──────────┬──────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
      Machine Discovery             Human Search
              │
              ▼
        mcp-go-core
              │
      ┌───────┼────────┐
      ▼       ▼        ▼
 Capability  Health  Auto Enable
   Match     Check    / Disable
```

此 Registry 將成為後續 `mcp-go-core` Feature Graph 與 Runtime Profile 的外部 Capability Discovery Layer。