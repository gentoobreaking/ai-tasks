# `CRAWLER_VERIFICATION_MANUAL.md`

# Taiwan MCP Crawler
## Verification Manual v0.2

---

# 1. Purpose

本文件定義 Taiwan MCP Crawler 的**實際可執行驗證標準**。

本版本將所有主要驗證項目明確定義為：

```text
Test ID
Requirement
Precondition
Input
Procedure
Expected Result
PASS Criteria
FAIL Criteria
Evidence
```

任何測試都不得使用：

```text
works
looks correct
正常
應該可以
沒有明顯問題
```

作為通過標準。

每項測試必須能得到：

```text
PASS
FAIL
BLOCKED
```

三種明確結果。

---

# 2. Global PASS / FAIL Rules

## 2.1 Test PASS

測試只有在：

```text
所有 PASS Criteria 均成立
AND
所有 FAIL Criteria 均未觸發
```

時才算：

```text
PASS
```

---

## 2.2 Test FAIL

只要：

```text
任一必要 PASS Criteria 未成立
OR
任一 FAIL Criteria 被觸發
```

即：

```text
FAIL
```

---

## 2.3 Test BLOCKED

只有在：

```text
測試環境無法建立
外部依賴不可用
測試資料損壞
必要 fixture 缺失
```

才允許：

```text
BLOCKED
```

BLOCKED 不得視為 PASS。

---

# 3. Release-Level Acceptance

## v0.1

必須：

```text
Critical tests       100% PASS
High priority tests  100% PASS
Overall tests        >= 95% PASS
BLOCKED               = 0
P0 defects            = 0
P1 defects            = 0
```

並且：

```text
Recall      >= 80%
Precision   >= 85%
Duplicate   < 5%
False Pos   <= 5%
```

---

## v0.2

必須：

```text
Critical tests       100% PASS
High priority tests  100% PASS
Overall tests        >= 98% PASS
BLOCKED               = 0
P0 defects            = 0
P1 defects            = 0
```

並且：

```text
Recall      >= 90%
Precision   >= 95%
Duplicate   < 5%
False Pos   <= 5%
```

---

# 4. Test Severity

```text
P0 = Security / Data Integrity / Registry Corruption
P1 = Core Functionality
P2 = Secondary Functionality
P3 = Operational / Cosmetic
```

任何：

```text
P0 FAIL
P1 FAIL
```

都：

```text
RELEASE BLOCKED
```

---

# 5. TST-001 — Build Verification

## Requirement

Project 必須能成功編譯。

## Procedure

```bash
go build ./...
```

## PASS Criteria

```text
exit code = 0
binary successfully generated
stderr contains no compilation error
```

## FAIL Criteria

```text
exit code != 0
compile error
link error
missing dependency
```

## Evidence

```text
build.log
binary checksum
git commit
```

---

# 6. TST-002 — Unit Test

## Procedure

```bash
go test ./...
```

## PASS Criteria

```text
all tests PASS
failed tests = 0
panic = 0
race detector = 0
```

若使用：

```bash
go test -race ./...
```

則：

```text
data race = 0
```

## FAIL Criteria

任何 test failure。

---

# 7. TST-003 — Static Analysis

```bash
go vet ./...
```

## PASS Criteria

```text
exit code = 0
vet errors = 0
```

---

# 8. TST-004 — Schema Validation

## Input

建立：

```text
valid.json
invalid.json
missing-required.json
invalid-enum.json
```

## Procedure

對每一個 JSON 執行 schema validation。

## PASS Criteria

```text
valid.json          → ACCEPT
invalid.json        → REJECT
missing-required    → REJECT
invalid-enum        → REJECT
```

結果必須 100% 符合預期。

## FAIL

任何 expected ACCEPT/REJECT 不一致。

---

# 9. TST-005 — Database Migration

## Procedure

```bash
crawler db migrate
crawler db migrate
```

## PASS Criteria

第一次：

```text
migration exit code = 0
```

第二次：

```text
exit code = 0
duplicate migration = 0
schema corruption = 0
```

Required tables：

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

全部存在。

---

# 10. TST-006 — GitHub Discovery

## Input

固定 fixture：

```text
100 Taiwan MCP repositories
100 non-Taiwan repositories
```

## PASS Criteria

Taiwan Ground Truth：

```text
Found >= 80 / 100
```

即：

```text
Recall >= 80%
```

Non-Taiwan：

```text
false positive <= 5%
```

---

# 11. TST-007 — Discovery Recall

公式：

```text
Recall =
TP / (TP + FN)
```

## PASS Criteria

v0.1：

```text
Recall >= 0.80
```

v0.2：

```text
Recall >= 0.90
```

## FAIL

低於 threshold。

---

# 12. TST-008 — Discovery Precision

公式：

```text
Precision =
TP / (TP + FP)
```

## PASS Criteria

v0.1：

```text
Precision >= 0.85
```

v0.2：

```text
Precision >= 0.95
```

---

# 13. TST-009 — Taiwan Keyword Detection

## Input

至少：

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

## PASS Criteria

每一個 keyword：

```text
matched = true
```

不得漏掉任何 mandatory keyword。

---

# 14. TST-010 — Taiwan Domain Detection

Required domains：

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

## PASS Criteria

每個 domain：

```text
recognized = true
classification = Taiwan-related
```

---

# 15. TST-011 — Taiwan T0 Classification

## Input

純非台灣 MCP。

## PASS

```text
taiwan_relevance = T0
```

且：

```text
score < 5
```

---

# 16. TST-012 — Taiwan T1 Classification

## Input

只有：

```text
"Available for users in Taiwan"
```

沒有：

```text
Taiwan-specific data
Taiwan API
Taiwan service
```

## PASS

```text
T1
```

或進入 ambiguous classification。

不得直接：

```text
T3+
```

---

# 17. TST-013 — Taiwan T2 Classification

## Input

具有：

```text
Taiwan language
Taiwan-compatible API
Taiwan user support
```

但沒有 Taiwan-specific dataset。

## PASS

```text
T2
```

---

# 18. TST-014 — Taiwan T3 Classification

## Input

Taiwan-specific：

```text
台股
台灣房價
Taiwan Weather
Taiwan Company Registry
```

## PASS

```text
T3
```

且：

```text
score >= 40
```

---

# 19. TST-015 — Taiwan T4 Classification

## Input

使用 Taiwan official data：

```text
TWSE
CWA
MOEA
MOI
data.gov.tw
```

## PASS

```text
T4
```

且至少存在：

```text
official-source evidence
```

---

# 20. TST-016 — Taiwan T5 Classification

T5 必須由明確規則或人工確認的 Ground Truth 定義。

## PASS

```text
T5
```

並且：

```text
confidence >= configured threshold
```

建議：

```text
>= 0.90
```

---

# 21. TST-017 — Taiwan Score

Rules：

```text
official Taiwan domain     +40
government API             +40
financial API              +35
Taiwan dataset             +30
Taiwan keyword             +20
Taiwan language            +15
Taiwan company/service     +15
README mention              +5
```

## PASS

給定 fixture 的 expected score：

```text
actual_score == expected_score
```

不是 range。

例如：

```text
expected = 75
actual = 75
```

PASS。

```text
actual = 74
```

FAIL。

---

# 22. TST-018 — Score Determinism

同一 input 執行：

```text
100 iterations
```

## PASS

```text
all scores identical
all classifications identical
all categories identical
```

即：

```text
unique(scores) = 1
unique(classification) = 1
```

---

# 23. TST-019 — Evidence Completeness

每一個 score rule 必須保存：

```text
rule
source
location
matched_value
score
timestamp
content_hash
```

## PASS

```text
100% scored rules
have corresponding evidence
```

## FAIL

任何 score：

```text
沒有 evidence
```

---

# 24. TST-020 — Repository Identity

## Input

```text
https://github.com/foo/bar
https://github.com/foo/bar/
https://github.com/foo/bar.git
```

## PASS

若為同一 repository：

```text
same server_id
```

不同 repository：

```text
different server_id
```

---

# 25. TST-021 — Identity Stability

執行：

```text
crawl #1
crawl #2
crawl #3
```

## PASS

同一 MCP：

```text
server_id identical
```

100% match。

---

# 26. TST-022 — Cross-Source Deduplication

同一 MCP 同時存在：

```text
GitHub
Glama
PulseMCP
MCP.so
Official Registry
```

## PASS

Database：

```text
1 mcp_server
```

Source：

```text
>= 2 discovery sources
```

不得產生：

```text
5 mcp_servers
```

---

# 27. TST-023 — Duplicate Rate

公式：

```text
duplicate_rate =
duplicate_records / discovered_records
```

## PASS

```text
< 5%
```

---

# 28. TST-024 — Source Aggregation

## Input

同一 server：

```text
GitHub
Glama
PulseMCP
```

## PASS

Registry：

```json
{
  "sources": [
    "github",
    "glama",
    "pulsemcp"
  ]
}
```

不得遺失 source。

---

# 29. TST-025 — Manifest Parsing

Fixtures：

```text
package.json
pyproject.toml
go.mod
Cargo.toml
server.json
mcp.json
```

## PASS

Valid：

```text
100% correctly parsed
```

Invalid：

```text
100% rejected or marked INVALID
```

且：

```text
executed commands = 0
```

---

# 30. TST-026 — Security Execution Boundary

建立 malicious repository：

```text
postinstall
setup.py
Makefile
Dockerfile
README shell commands
```

## PASS

Crawler：

```text
process execution count = 0
```

允許：

```text
read
parse
hash
classify
```

禁止：

```text
execute
install
build
run
```

任何 discovered code execution：

```text
P0 FAIL
RELEASE BLOCKED
```

---

# 31. TST-027 — MCP Initialize

Mock MCP Server：

```text
initialize → valid response
```

## PASS

```text
HTTP success
valid MCP response
protocol version accepted
server capabilities parsed
```

---

# 32. TST-028 — MCP tools/list

Mock server 回傳：

```text
10 tools
```

## PASS

Database：

```text
10 tools
```

每一 tool：

```text
name != empty
description != empty OR explicitly allowed
input_schema valid
```

---

# 33. TST-029 — resources/list

Mock：

```text
5 resources
```

## PASS

Registry：

```text
5 resources
```

數量完全一致。

---

# 34. TST-030 — prompts/list

Mock：

```text
3 prompts
```

## PASS

Registry：

```text
3 prompts
```

---

# 35. TST-031 — Invalid MCP Response

Mock：

```text
invalid JSON
```

## PASS

Crawler：

```text
does not panic
health != HEALTHY
record remains valid
```

允許：

```text
INVALID
```

---

# 36. TST-032 — Endpoint Timeout

Mock server：

```text
response delay = 60s
```

Crawler timeout：

```text
<= 10s
```

## PASS

```text
request terminated <= configured timeout + 1s
crawl continues
health = UNAVAILABLE
```

---

# 37. TST-033 — HTTP 500

Mock：

```text
HTTP 500
```

## PASS

```text
retry occurs
maximum retries respected
crawl continues
health != HEALTHY
```

---

# 38. TST-034 — HTTP 429

Mock：

```text
HTTP 429
Retry-After
```

## PASS

```text
backoff occurs
rate limit respected
no infinite retry
```

---

# 39. TST-035 — Retry Limit

Mock：

```text
500
500
500
500
500
```

Configured：

```text
max_retry = 3
```

## PASS

實際 request：

```text
<= 4
```

即：

```text
initial + 3 retries
```

不得超過。

---

# 40. TST-036 — Source Isolation

設定：

```text
GitHub = PASS
Glama = FAIL
PulseMCP = PASS
```

## PASS

```text
GitHub processed
PulseMCP processed
Glama marked degraded
overall crawl completed
```

---

# 41. TST-037 — SQLite Idempotency

執行兩次相同 crawl。

## PASS

第二次：

```text
server count unchanged
duplicate primary keys = 0
duplicate server IDs = 0
```

---

# 42. TST-038 — Crawl Run Accounting

假設：

```text
discovered = 100
normalized = 90
duplicates = 10
```

則：

```text
100 discovered
90 normalized
10 duplicates
```

## PASS

所有 counters：

```text
non-negative
internally consistent
```

---

# 43. TST-039 — Registry Export

執行：

```bash
crawler export
```

## PASS

以下全部存在：

```text
registry.json
registry.min.json
categories.json
sources.json
statistics.json
health.json
```

且：

```text
file size > 0
valid JSON
schema validation PASS
```

---

# 44. TST-040 — Registry Consistency

假設：

```text
SQLite = 127 servers
```

則：

```text
registry.json = 127
statistics.json = 127
```

## PASS

三者：

```text
server count identical
server IDs identical
```

---

# 45. TST-041 — Category Validation

## PASS

所有 category：

```text
∈ controlled vocabulary
```

Invalid category：

```text
must be rejected
```

---

# 46. TST-042 — Quality Score Range

所有 MCP：

```text
0 <= score <= 100
```

## PASS

```text
invalid score count = 0
```

---

# 47. TST-043 — Quality Score Determinism

同一 fixture：

```text
100 iterations
```

## PASS

```text
unique(score) = 1
```

---

# 48. TST-044 — Security Finding

Malicious fixture：

```text
shell execution
filesystem write
credential access
RCE
```

## PASS

每個 finding：

```text
type
severity
source
location
evidence
```

全部存在。

---

# 49. TST-045 — License Detection

Fixtures：

```text
MIT
Apache-2.0
GPL
No license
Unknown
```

## PASS

Expected license：

```text
exact match
```

No license：

```text
UNKNOWN
```

不得猜測。

---

# 50. TST-046 — Repository Status

Fixture：

```text
last commit < 90d
90–180d
180–365d
>365d
archived
deleted
```

## PASS

Mapping 必須 100%：

```text
<90d       ACTIVE
90–180d    MAINTENANCE
180–365d   STALE
>365d      DORMANT
archived   ARCHIVED
deleted    DELETED
```

Archived 優先於時間判斷。

---

# 51. TST-047 — Incremental Crawl

第一次：

```text
100 repositories
```

第二次：

```text
0 repositories changed
```

## PASS

第二次：

```text
discovered >= 100
changed_downloads = 0
```

如果 adapter 支援 ETag / Last-Modified：

```text
HTTP body downloads = 0
```

---

# 52. TST-048 — Incremental Changed Repository

第一次：

```text
commit=A
```

第二次：

```text
commit=B
```

## PASS

Changed repository：

```text
reprocessed = true
last_seen updated
last_verified updated
```

Unchanged repositories：

```text
not reprocessed
```

---

# 53. TST-049 — Deleted Repository

第一次：

```text
repository exists
```

第二次：

```text
404
```

## PASS

Registry：

```text
status = DELETED
```

且：

```text
historical record retained
```

不得直接 delete database record。

---

# 54. TST-050 — LLM Bypass

Input：

```text
clear T0
clear T4
```

## PASS

```text
LLM calls = 0
```

---

# 55. TST-051 — LLM Ambiguous Routing

Input：

```text
Taiwan score = 35
```

## PASS

若 threshold：

```text
20 <= score <= 55
```

則：

```text
LLM invoked = true
```

---

# 56. TST-052 — LLM Factual Integrity

LLM 嘗試修改：

```text
repository URL
stars
license
endpoint
tool name
```

## PASS

原始 factual metadata：

```text
100% unchanged
```

---

# 57. TST-053 — LLM Failure

模擬：

```text
timeout
invalid JSON
hallucinated fields
confidence = 0
```

## PASS

Crawler：

```text
does not crash
factual metadata unchanged
fallback executed
```

---

# 58. TST-054 — API Server

測試：

```http
GET /api/v1/servers
GET /api/v1/servers/:id
GET /api/v1/search?q=twse
GET /api/v1/categories
GET /api/v1/sources
GET /api/v1/statistics
GET /api/v1/health
```

## PASS

每 endpoint：

```text
HTTP 2xx
valid JSON
schema valid
```

---

# 59. TST-055 — API Not Found

查詢：

```text
/non-existent-id
```

## PASS

```text
HTTP 404
valid JSON error
```

不得：

```text
HTTP 500
panic
empty response
```

---

# 60. TST-056 — API Filtering

例如：

```text
category=finance
taiwan_relevance=T5
health=HEALTHY
min_score=80
```

## PASS

每一筆結果：

```text
category = finance
relevance = T5
health = HEALTHY
score >= 80
```

違反任一條件：

```text
FAIL
```

---

# 61. TST-057 — API Pagination

資料：

```text
1000 records
```

設定：

```text
limit=50
```

## PASS

每 page：

```text
<=50 records
```

全部 page：

```text
union = 1000
duplicates = 0
missing = 0
```

---

# 62. TST-058 — Capability Search

Query：

```text
Taiwan stock price
```

至少 fixture：

```text
server-A
tool = get_stock_price
```

## PASS

```text
server-A appears in result
```

且 tool capability match：

```text
true
```

---

# 63. TST-059 — Capability Ranking

Given：

```text
Server A = T5 + HEALTHY + score 90
Server B = T3 + HEALTHY + score 95
Server C = T5 + UNAVAILABLE + score 95
```

Query：

```text
Taiwan stock
```

## PASS

Ranking 必須符合：

```text
capability match
+
Taiwan relevance
+
health
+
quality
```

預期：

```text
A ranked above C
```

而不可單純依：

```text
score
```

排序。

---

# 64. TST-060 — Metrics

執行一次 crawl。

## PASS

至少：

```text
crawler_candidates_total > 0
crawler_crawl_duration_seconds > 0
crawler_http_requests_total > 0
```

若發生 verification：

```text
success + failure >= verification attempts
```

---

# 65. TST-061 — Logging

產生一個 source failure。

## PASS

log 必須包含：

```text
crawl_id
source
stage
error
timestamp
```

---

# 66. TST-062 — Performance

Dataset：

```text
10,000 candidates
```

## PASS

純 pipeline benchmark：

```text
< 10 minutes
```

並且：

```text
no OOM
no panic
```

---

# 67. TST-063 — Memory

Dataset：

```text
10k
50k
100k
```

記錄：

```text
RSS
heap
GC
```

## PASS

memory growth 不得呈現明顯 O(N²) scaling。

具體 Gate：

```text
100k dataset memory <= 4 × 10k dataset memory
```

若超過：

```text
FAIL
```

---

# 68. TST-064 — Concurrency Determinism

執行：

```text
workers=1
workers=4
workers=8
```

## PASS

三次結果：

```text
server ID set identical
classification identical
score identical
category identical
```

順序不同允許。

---

# 69. TST-065 — Crash Recovery

在 pipeline 中途 terminate process。

重新執行。

## PASS

```text
registry readable
database readable
no duplicate server IDs
no corrupted JSON
crawl can continue
```

---

# 70. TST-066 — Secret Leakage

Fixture：

```text
API_KEY=TEST_SECRET
PASSWORD=TEST_PASSWORD
TOKEN=TEST_TOKEN
```

執行 crawl。

掃描：

```text
registry.json
SQLite
logs
reports
```

## PASS

以下 secret 出現次數：

```text
0
```

---

# 71. TST-067 — Supply Chain

執行：

```bash
go mod verify
```

## PASS

```text
exit code = 0
```

並且：

```text
unexpected dependency modification = 0
```

---

# 72. TST-068 — Regression Golden Dataset

Dataset：

```text
100 Taiwan
100 non-Taiwan
50 duplicate
30 ambiguous
20 invalid
20 archived
20 unavailable
```

## PASS

Expected output：

```text
classification accuracy = 100%
identity accuracy = 100%
dedup expected cases = 100%
invalid handling = 100%
```

---

# 73. TST-069 — Ground Truth Regression

每次 classifier 修改：

```text
dataset-v0.1
```

重新執行。

## PASS

若沒有明確更新 rule：

```text
previous expected result = actual result
```

100%。

若刻意改變：

必須：

```text
classifier_version changed
expected dataset updated
change documented
```

---

# 74. TST-070 — Full E2E

執行：

```text
discover
→ fetch
→ normalize
→ dedupe
→ classify
→ verify
→ score
→ persist
→ export
```

## PASS

全部：

```text
exit code = 0
```

並：

```text
registry.json valid
database valid
statistics valid
health valid
```

---

# 75. TST-071 — Full Registry Consistency

比較：

```text
SQLite
registry.json
statistics.json
health.json
```

## PASS

Server ID set：

```text
100% identical
```

Count：

```text
100% identical
```

---

# 76. TST-072 — Historical Integrity

執行：

```text
crawl #1
crawl #2
crawl #3
```

## PASS

存在：

```text
3 crawl_runs
```

並且：

```text
health_checks retained
quality_scores retained
evidence retained
```

不得因 latest crawl 將歷史資料全部覆蓋。

---

# 77. TST-073 — Source Failure Recovery

第一次：

```text
Glama = unavailable
```

第二次：

```text
Glama = healthy
```

## PASS

第一次：

```text
source status = DEGRADED
```

第二次：

```text
source recovered
new records processed
```

---

# 78. TST-074 — Full Crawl Stability

連續執行：

```text
10 full crawls
```

## PASS

```text
panic = 0
database corruption = 0
duplicate IDs = 0
schema violations = 0
```

---

# 79. TST-075 — Production Smoke Test

Deploy 後：

```bash
crawler version
crawler stats
crawler crawl --source github
crawler export
```

## PASS

```text
all exit code = 0
new crawl_id generated
registry updated
metrics updated
logs generated
```

---

# 80. KPI Verification

## Recall

```text
>= 80% v0.1
>= 90% v0.2
```

## Precision

```text
>= 85% v0.1
>= 95% v0.2
```

## Duplicate

```text
< 5%
```

## False Positive

```text
<= 5%
```

## Repository Verification

```text
>= 98%
```

## Test Coverage

建議：

```text
>= 80% line coverage
>= 70% branch coverage
```

Critical modules：

```text
classify
dedupe
verify
scoring
storage
```

建議：

```text
>= 90% line coverage
```

---

# 81. Critical Security Gate

以下任一項：

```text
discovered code executed
credential leaked
registry corrupted
cross-server identity incorrectly merged
arbitrary shell execution
```

直接：

```text
P0
FAIL
RELEASE BLOCKED
```

不允許用：

```text
"風險很低"
"測試環境才發生"
"之後修"
```

繞過。

---

# 82. Critical Data Integrity Gate

以下任一：

```text
duplicate server_id
incorrect merge
lost MCP
corrupted registry
SQLite / JSON mismatch
non-deterministic identity
```

直接：

```text
P0/P1 FAIL
```

---

# 83. Test Evidence Requirements

每次正式 verification 必須保存：

```text
test_id
version
git_commit
environment
input_fixture
command
expected
actual
result
timestamp
logs
artifact
```

例如：

```json
{
  "test_id": "TST-022",
  "result": "PASS",
  "expected_server_count": 1,
  "actual_server_count": 1,
  "duplicate_rate": 0.0,
  "git_commit": "abc123",
  "timestamp": "2026-09-04T10:00:00Z"
}
```

---

# 84. Verification Report Format

```text
Taiwan MCP Crawler Verification Report

Version:
Git Commit:
Environment:
Date:

--------------------------------
BUILD
--------------------------------

TST-001 PASS
TST-002 PASS
TST-003 PASS

--------------------------------
DISCOVERY
--------------------------------

Recall: 87.4%
Precision: 91.2%

--------------------------------
DEDUP
--------------------------------

Duplicate Rate: 2.1%

--------------------------------
CLASSIFICATION
--------------------------------

T0 accuracy: 100%
T1 accuracy: 100%
T2 accuracy: 98%
T3 accuracy: 100%
T4 accuracy: 100%
T5 accuracy: 100%

--------------------------------
MCP VERIFICATION
--------------------------------

Initialize: PASS
tools/list: PASS
resources/list: PASS
prompts/list: PASS

--------------------------------
SECURITY
--------------------------------

Code Execution: 0
Secret Leakage: 0
P0: 0
P1: 0

--------------------------------
PERFORMANCE
--------------------------------

10k candidates:
Duration: 7m 12s
Memory: 1.8GB

--------------------------------
REGISTRY
--------------------------------

SQLite Servers: 127
JSON Servers: 127
Mismatch: 0

--------------------------------
FINAL
--------------------------------

Critical Tests: 100% PASS
High Tests: 100% PASS
Overall: 98.7% PASS

RELEASE: APPROVED
```

---

# 85. Final Release Decision

## APPROVED

只有：

```text
P0 = 0
P1 = 0
BLOCKED = 0

Critical = 100% PASS
High = 100% PASS

Overall >= 95% v0.1
Overall >= 98% v0.2

Recall >= target
Precision >= target
Duplicate < target
False Positive <= target
```

才可以：

```text
RELEASE APPROVED
```

---

## CONDITIONALLY APPROVED

只有 P2/P3：

```text
P2/P3 defects documented
workaround documented
risk accepted
```

才可以 Conditional Release。

---

## REJECTED

任一：

```text
P0
P1
Critical Test Failure
KPI below threshold
Registry corruption
Security violation
```

則：

```text
RELEASE REJECTED
```

---

# 86. Verification Philosophy

本手冊最重要的原則：

```text
"Test passed" ≠ "程式沒有報錯"

"Test passed"
=
"實際輸入"
+
"預先定義的 Expected Result"
+
"明確 PASS Threshold"
+
"可保存 Evidence"
```

因此 Coding Agent 不得回報：

```text
"看起來沒問題"
"基本測試通過"
"功能應該正常"
```

而必須回報：

```text
TST-022
Expected: 1 server
Actual: 1 server
Result: PASS
Evidence: ...
```

---

# 87. Final Definition of Done

Taiwan MCP Crawler 只有在：

```text
所有 Critical Tests = PASS
所有 P1 Tests = PASS
Release KPI = PASS
Security Gate = PASS
Registry Integrity = PASS
Regression = PASS
```

之後，才可以標記：

```text
VERIFIED
```

最終狀態：

```text
DISCOVERY        VERIFIED
NORMALIZATION    VERIFIED
DEDUPLICATION    VERIFIED
CLASSIFICATION   VERIFIED
EVIDENCE         VERIFIED
PROTOCOL         VERIFIED
HEALTH           VERIFIED
SECURITY         VERIFIED
SCORING          VERIFIED
PERSISTENCE      VERIFIED
EXPORT           VERIFIED
INCREMENTAL      VERIFIED
API              VERIFIED
PERFORMANCE      VERIFIED
REGRESSION       VERIFIED
```

最終不是證明：

> **Crawler 能跑。**

而是證明：

> **Crawler 在已知輸入、已知環境與明確容許範圍內，能產生可重現、可驗證、可追溯且符合預期的 Registry 結果。**