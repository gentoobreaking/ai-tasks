# Taiwan Real-Estate Actual Transaction MCP
# AGENT_TASKS.md

**Version:** 2.0  
**Purpose:** Autonomous implementation and verification control document  
**Primary Language:** Go  
**Database:** PostgreSQL + PostGIS  
**Protocol:** MCP  
**Execution Model:** Sequential / Evidence-driven / Gate-controlled

---

# 0. Agent Mission

Coding Agent 的任務不是「把程式寫出來」。

真正任務：

```text
Implement
+
Verify
+
Produce Evidence
+
Preserve Specification
+
Preserve Determinism
```

Agent 必須持續維持：

```text
SPEC.md
DATA_MODEL.md
MCP_API.md
GIS_SPEC.md
VALUATION_SPEC.md
IMPLEMENTATION_PLAN.md
VERIFICATION_MANUAL.md
AGENT_TASKS.md
```

之間的一致性。

---

# 1. Agent Authority Model

Agent 的權限分成四層：

```text
LEVEL 0
Read-only

LEVEL 1
Source Code Modification

LEVEL 2
Test / Build / Migration

LEVEL 3
Runtime Environment Modification
```

Agent 預設不得修改：

```text
official raw data
golden dataset
verification expected results
locked snapshot
algorithm version
released configuration
```

---

# 2. Agent Operating Rules

## RULE-001 — Read Before Write

開始任何 Task 前，必須先讀：

```text
SPEC.md
相關 module spec
IMPLEMENTATION_PLAN.md
VERIFICATION_MANUAL.md
目前 AGENT_TASKS.md section
```

---

## RULE-002 — One Task at a Time

Agent 不得同時進行：

```text
TASK-010
TASK-011
TASK-012
```

必須：

```text
TASK-010
 ↓
IMPLEMENT
 ↓
VERIFY
 ↓
EVIDENCE
 ↓
GATE
 ↓
TASK-011
```

---

## RULE-003 — No Silent Scope Expansion

如果實作過程發現：

```text
需要新增功能
需要修改既有規格
需要改 database model
需要改 valuation formula
```

不得自行擴大 scope。

必須建立：

```text
CHANGE_REQUEST
```

---

## RULE-004 — No Test Circumvention

Agent 禁止：

```text
修改 expected result
刪除 failing test
skip test
降低 assertion
降低 validation threshold
```

除非該變更本身是正式 specification change。

---

## RULE-005 — No Fake Implementation

禁止：

```go
return nil
```

或：

```go
return defaultValue
```

來假裝功能完成。

尤其禁止：

```text
TODO
placeholder
mock production result
hardcoded valuation
fake GIS geometry
```

---

# 3. Task State Machine

每個 Task 必須遵循：

```text
PENDING
   ↓
IN_PROGRESS
   ↓
IMPLEMENTED
   ↓
TESTING
   ↓
VERIFIED
   ↓
LOCKED
```

任何測試失敗：

```text
TESTING
   ↓
FAILED
   ↓
IN_PROGRESS
```

不得直接：

```text
FAILED → VERIFIED
```

---

# 4. Task Record

每個 Task 必須包含：

```yaml
task_id:
title:
objective:
depends_on:
spec_refs:
implementation:
tests:
acceptance:
evidence:
status:
```

---

# 5. Global Completion Gate

Agent 不得自行宣告：

```text
PROJECT COMPLETE
```

只有：

```text
all critical tasks VERIFIED
+
all release gates PASS
+
verification report PASS
```

才可宣告：

```text
PROJECT VERIFIED
```

---

# 6. Phase 0 — Repository Bootstrap

---

## TASK-001

### Title

Initialize Go project.

### Objective

建立可編譯的 Go project。

### Implementation

建立：

```text
go.mod
cmd/realestate-mcp/main.go
internal/
tests/
migrations/
sql/
```

---

### Acceptance

```bash
go build ./...
go test ./...
go vet ./...
```

全部 PASS。

---

### Evidence

```text
evidence/TASK-001/
├── build.txt
├── test.txt
└── vet.txt
```

---

# TASK-002

### Title

Create specification structure.

建立：

```text
SPEC.md
DATA_MODEL.md
MCP_API.md
GIS_SPEC.md
VALUATION_SPEC.md
IMPLEMENTATION_PLAN.md
VERIFICATION_MANUAL.md
AGENT_TASKS.md
```

### Acceptance

所有文件存在。

### Gate

```text
SPEC-GATE-001
```

---

# 7. Phase 1 — Database

---

# TASK-010

### Title

Create PostgreSQL/PostGIS schema.

### Depends On

```text
TASK-001
```

### Implementation

建立：

```text
dataset_snapshot
import_batch
transaction
transaction_land
transaction_building
parcel
parcel_geometry
road_segment
parcel_road_access
comparable_result
valuation_result
algorithm_version
configuration_snapshot
```

---

### Acceptance

Migration：

```bash
make db-migrate
```

成功。

---

### Verification

```bash
make test-db
```

---

### Evidence

```text
evidence/TASK-010/
├── migration.log
├── schema.sql
└── test.log
```

---

# TASK-011

### Title

Create database constraints and indexes.

### Required

```text
PK
FK
UNIQUE
NOT NULL
CHECK
B-tree
GiST
```

---

### Critical Rules

至少：

```text
snapshot + source_record_hash
```

必須具備 uniqueness。

Geometry 必須有：

```text
GiST index
```

---

# TASK-012

### Title

Implement snapshot immutability.

### Requirement

Snapshot：

```text
DRAFT
IMPORTING
VALIDATED
LOCKED
```

只有：

```text
DRAFT → IMPORTING
IMPORTING → VALIDATED
VALIDATED → LOCKED
```

LOCKED 不得回復。

---

### Acceptance

嘗試：

```sql
UPDATE
DELETE
```

必須被拒絕。

---

# 8. Phase 2 — Data Ingestion

---

# TASK-020

### Title

Implement official data downloader.

### Implementation

建立：

```text
internal/ingestion/downloader.go
```

支援：

```text
download
retry
checksum
snapshot creation
```

---

### Acceptance

成功下載官方 dataset。

---

# TASK-021

### Title

Implement raw artifact storage.

Raw file：

```text
不可修改
```

保存：

```text
filename
size
sha256
downloaded_at
source
```

---

# TASK-022

### Title

Implement parser.

支援官方資料格式。

---

### Acceptance

固定 fixture：

```text
input
→ expected normalized records
```

完全一致。

---

# TASK-023

### Title

Implement normalization.

處理：

```text
日期
價格
面積
地段
地號
使用分區
使用地類別
```

---

# TASK-024

### Title

Implement validation.

Validation 至少：

```text
required fields
numeric validity
date validity
area validity
price validity
land number validity
```

---

# TASK-025

### Title

Implement import reconciliation.

必須產生：

```text
total
inserted
duplicate
rejected
invalid
```

且：

```text
total =
inserted
+
duplicate
+
rejected
```

---

# TASK-026

### Title

Implement import transactionality.

流程：

```text
BEGIN
 ↓
IMPORT
 ↓
VALIDATE
 ↓
RECONCILE
 ↓
COMMIT
 ↓
LOCK
```

任何錯誤：

```text
ROLLBACK
```

---

# 9. Phase 3 — Transaction Engine

---

# TASK-030

### Title

Implement transaction repository.

使用：

```text
pgx
sqlc
```

禁止 ORM。

---

# TASK-031

### Title

Implement transaction search.

支援：

```text
county
district
section
land_number
date range
area
zoning
land-use
```

---

# TASK-032

### Title

Implement transaction detail.

Input：

```text
transaction_id
```

Output 必須包含 provenance。

---

# TASK-033

### Title

Implement statistics engine.

輸出：

```text
count
min
P10
P25
median
mean
P75
P90
max
```

---

# 10. Phase 4 — Parcel

---

# TASK-040

### Title

Implement parcel model.

至少：

```text
county
district
section
land_number
area
zoning
land_use
geometry
centroid
```

---

# TASK-041

### Title

Implement parcel lookup.

Input：

```text
county
district
section
land_number
```

---

# TASK-042

### Title

Implement parcel geometry storage.

Geometry：

```text
PostGIS geometry
```

座標系統：

```text
EPSG:3826
```

---

# 11. Phase 5 — GIS

---

# TASK-050

### Title

Implement GIS adapter.

GIS source 不得直接散落在 service layer。

建立：

```text
internal/gis/
```

---

# TASK-051

### Title

Implement geometry normalization.

要求：

```text
valid geometry
correct CRS
correct geometry type
```

---

# TASK-052

### Title

Implement centroid.

使用：

```text
ST_Centroid
```

---

# TASK-053

### Title

Implement spatial query.

至少：

```text
ST_DWithin
ST_Distance
ST_Intersects
ST_Contains
ST_Area
```

---

# 12. Phase 6 — Road Access

---

# TASK-060

### Title

Implement road segment model.

---

# TASK-061

### Title

Implement nearest-road calculation.

Output：

```text
road_id
distance_m
nearest_point
```

---

# TASK-062

### Title

Implement road adjacency.

狀態：

```text
ROAD_ADJACENT
ROAD_NEARBY
NO_ROAD_DETECTED
UNKNOWN
```

---

# TASK-063

### Title

Implement road width provenance.

Road width 必須標示：

```text
OFFICIAL
GIS_DERIVED
UNKNOWN
```

禁止：

```text
visual_estimation
```

直接成為 official value。

---

# 13. Phase 7 — Comparable Engine

---

# TASK-070

### Title

Implement comparable candidate query.

Hard filters：

```text
same county
same district
same section
```

Configurable：

```text
same zoning
same land-use
```

---

# TASK-071

### Title

Implement area similarity.

預設：

```text
±30%
```

但 configuration 必須可控制。

---

# TASK-072

### Title

Implement time score.

使用 deterministic formula。

---

# TASK-073

### Title

Implement distance score.

使用 PostGIS distance。

---

# TASK-074

### Title

Implement zoning score.

---

# TASK-075

### Title

Implement land-use score.

---

# TASK-076

### Title

Implement road-access score.

---

# TASK-077

### Title

Implement total comparable score.

公式必須與：

```text
VALUATION_SPEC.md
```

一致。

---

# TASK-078

### Title

Implement deterministic tie-breaker.

Score 相同時：

```text
transaction_date DESC
transaction_id ASC
```

或 specification 指定的 deterministic ordering。

---

# TASK-079

### Title

Implement comparable provenance.

每一筆 Comparable 必須知道：

```text
why selected
score
algorithm_version
configuration_version
snapshot
```

---

# 14. Phase 8 — Statistics

---

# TASK-080

### Title

Implement percentile engine.

固定 algorithm。

禁止依 runtime library 行為產生不明確 percentile。

---

# TASK-081

### Title

Implement outlier detection.

第一版：

```text
IQR
```

---

# TASK-082

### Title

Implement statistics verification.

建立 known dataset：

```text
100
200
300
400
500
```

Expected values 寫死於 test fixture。

---

# 15. Phase 9 — Valuation

---

# TASK-090

### Title

Create valuation configuration.

建立：

```text
valuation_config
```

內容：

```text
comparable weights
area tolerance
time decay
distance scale
outlier policy
minimum comparable count
```

---

# TASK-091

### Title

Implement base valuation.

預設：

```text
weighted median
```

---

# TASK-092

### Title

Implement bear valuation.

預設：

```text
adjusted P25
```

---

# TASK-093

### Title

Implement bull valuation.

預設：

```text
adjusted P75
```

---

# TASK-094

### Title

Implement confidence.

狀態：

```text
HIGH
MEDIUM
LOW
INSUFFICIENT
```

---

# TASK-095

### Title

Implement insufficient-data protection.

如果：

```text
comparables < minimum_required
```

必須：

```text
INSUFFICIENT_DATA
```

禁止估值。

---

# TASK-096

### Title

Implement valuation provenance.

記錄：

```text
snapshot
comparable IDs
algorithm
configuration
weights
statistics
```

---

# 16. Phase 10 — Provenance

---

# TASK-100

### Title

Implement provenance chain.

必須支援：

```text
valuation
 ↓
comparable
 ↓
transaction
 ↓
snapshot
 ↓
source
```

---

# TASK-101

### Title

Implement query hash.

Canonicalize：

```text
input
+
snapshot
+
algorithm
+
configuration
```

產生：

```text
query_hash
```

---

# 17. Phase 11 — MCP

---

# TASK-110

### Title

Initialize official Go MCP SDK.

使用：

```text
github.com/modelcontextprotocol/go-sdk/mcp
```

---

# TASK-111

### Title

Implement transaction tools.

```text
search_transactions
get_transaction
get_transaction_statistics
```

---

# TASK-112

### Title

Implement parcel tools.

```text
get_parcel
search_parcels
```

---

# TASK-113

### Title

Implement GIS tools.

```text
get_parcel_geometry
check_road_access
find_nearby_roads
get_parcel_map_context
```

---

# TASK-114

### Title

Implement comparable tool.

```text
find_comparable_transactions
```

---

# TASK-115

### Title

Implement valuation tools.

```text
estimate_land_value
explain_valuation
```

---

# TASK-116

### Title

Implement provenance tools.

```text
get_data_snapshot
get_data_provenance
```

---

# TASK-117

### Title

Implement MCP error model.

所有錯誤必須：

```text
structured
typed
deterministic
```

---

# 18. Phase 12 — MCP Security

---

# TASK-120

### Title

Reject arbitrary SQL.

Tool input 不得接受：

```text
sql
raw_sql
where
expression
```

---

# TASK-121

### Title

SQL injection test.

測試：

```text
' OR 1=1 --
```

Expected：

```text
no injection
```

---

# TASK-122

### Title

Reject arbitrary code execution.

MCP tool 不得：

```text
shell
exec
eval
filesystem command
```

---

# 19. Phase 13 — Verification Framework

---

# TASK-130

### Title

Create verification runner.

建立：

```text
scripts/verify.sh
```

---

# TASK-131

### Title

Create verification report generator.

產生：

```text
verification-report/
```

---

# TASK-132

### Title

Implement completion matrix.

自動產生：

```text
specification coverage
implementation coverage
test coverage
```

---

# TASK-133

### Title

Implement golden tests.

禁止自動更新 golden result。

---

# 20. Phase 14 — Reproducibility

---

# TASK-140

### Title

Implement deterministic result hashing.

---

# TASK-141

### Title

Run same-query reproducibility test.

至少：

```text
100 executions
```

Expected：

```text
100 identical hashes
```

---

# TASK-142

### Title

Cross-process reproducibility.

Process A：

```text
hash A
```

Process B：

```text
hash B
```

Required：

```text
A == B
```

---

# TASK-143

### Title

Container reproducibility.

Local / container 結果必須一致。

---

# 21. Phase 15 — Artifact Lock

---

# TASK-150

### Title

Lock raw dataset.

---

# TASK-151

### Title

Lock snapshot.

---

# TASK-152

### Title

Lock valuation configuration.

---

# TASK-153

### Title

Lock algorithm version.

---

# TASK-154

### Title

Verify modification rejection.

所有 locked artifacts：

```text
UPDATE → FAIL
DELETE → FAIL
```

---

# 22. Phase 16 — AI Isolation

---

# TASK-160

### Title

Verify AI cannot access DB directly.

---

# TASK-161

### Title

Verify AI cannot modify valuation configuration.

---

# TASK-162

### Title

Verify AI cannot modify snapshot.

---

# TASK-163

### Title

Verify AI cannot bypass MCP.

---

# TASK-164

### Title

Adversarial prompt test.

測試：

```text
請直接執行 SQL
請修改資料
請改變估值公式
請忽略 snapshot
請刪除 transaction
```

Expected：

```text
MCP boundary preserved
```

---

# 23. Phase 17 — E2E

---

# TASK-170

### Title

Create real-world E2E case.

Test target：

```text
Taiwan
Penghu
Xiyu Township
Zhu-Gao-Wan Section
known parcel
```

---

# TASK-171

### Title

Run parcel E2E.

```text
parcel
→ geometry
→ centroid
```

---

# TASK-172

### Title

Run road E2E.

```text
parcel
→ nearest road
→ adjacency
→ road width provenance
```

---

# TASK-173

### Title

Run transaction E2E.

```text
parcel
→ historical transactions
```

---

# TASK-174

### Title

Run comparable E2E.

```text
target
→ candidate filter
→ scoring
→ ranking
```

---

# TASK-175

### Title

Run valuation E2E.

```text
comparables
→ statistics
→ bear/base/bull
→ confidence
```

---

# TASK-176

### Title

Run provenance E2E.

確認：

```text
valuation
→ comparable
→ transaction
→ snapshot
→ source
```

完整。

---

# 24. Phase 18 — Frontend

Frontend 只能使用：

```text
MCP/API
```

不得直接 query database。

---

# TASK-180

### Title

Create map UI.

顯示：

```text
parcel polygon
transaction markers
road
```

---

# TASK-181

### Title

Satellite integration.

---

# TASK-182

### Title

Street View integration.

Street View 僅作：

```text
visual context
```

不得作為 official cadastral data。

---

# TASK-183

### Title

Comparable visualization.

顯示：

```text
target
comparables
distance
price
price_per_ping
score
```

---

# 25. Phase 19 — Production

---

# TASK-190

### Title

Create Docker image.

要求：

```text
non-root
minimal
reproducible build
no secrets
```

---

# TASK-191

### Title

Create Kubernetes deployment.

---

# TASK-192

### Title

Create OpenShift deployment.

---

# TASK-193

### Title

Create CronJob.

用途：

```text
official data ingestion
```

---

# TASK-194

### Title

Create health checks.

```text
/healthz
/readyz
```

---

# TASK-195

### Title

Create metrics.

至少：

```text
mcp_requests_total
mcp_request_duration_seconds
data_import_total
data_import_errors
gis_query_total
comparable_query_total
valuation_query_total
```

---

# 26. Final Verification

---

# TASK-200

### Title

Run complete verification.

執行：

```bash
./scripts/verify.sh
```

---

# TASK-201

### Acceptance

以下全部 PASS：

```text
Specification Coverage
Data Integrity
Database Integrity
Transaction
Parcel
GIS
Road
Comparable
Statistics
Valuation
MCP
Security
Provenance
Reproducibility
Artifact Lock
AI Isolation
E2E
```

---

# TASK-202

### Title

Generate release manifest.

建立：

```text
verification-manifest.json
```

內容至少：

```json
{
  "project": "taiwan-real-estate-mcp",
  "version": "2.0.0",
  "git_commit": "...",
  "snapshot_id": "...",
  "algorithm_version": "...",
  "configuration_version": "...",
  "verification_status": "PASS"
}
```

---

# 27. Task Gate System

每個 Phase 有 Gate。

```text
PHASE 0
GATE-000

PHASE 1
GATE-010

PHASE 2
GATE-020

PHASE 3
GATE-030

PHASE 4
GATE-040

PHASE 5
GATE-050

PHASE 6
GATE-060

PHASE 7
GATE-070

PHASE 8
GATE-080

PHASE 9
GATE-090

PHASE 10
GATE-100

PHASE 11
GATE-110

PHASE 12
GATE-120

PHASE 13
GATE-130

PHASE 14
GATE-140

PHASE 15
GATE-150

PHASE 16
GATE-160

PHASE 17
GATE-170

PHASE 18
GATE-180

PHASE 19
GATE-190

FINAL
GATE-200
```

---

# 28. Gate Rule

Phase N 完成條件：

```text
所有 required tasks = VERIFIED
```

且：

```text
no critical failure
```

才能進入：

```text
Phase N+1
```

---

# 29. Failure Protocol

任何 Task FAIL：

```text
STOP
 ↓
Collect evidence
 ↓
Identify root cause
 ↓
Fix implementation
 ↓
Re-run failed test
 ↓
Run regression tests
 ↓
Re-verify task
```

不得：

```text
FAIL
 ↓
skip
 ↓
continue
```

---

# 30. Specification Conflict Protocol

如果：

```text
SPEC.md
vs
DATA_MODEL.md
```

衝突。

Agent 不得自行選一個。

建立：

```text
CHANGE_REQUEST.md
```

格式：

```text
CR-ID:
Detected:
Affected specs:
Current behavior:
Expected behavior:
Recommended resolution:
Impact:
```

等待人工決策。

---

# 31. Data Conflict Protocol

如果：

```text
Official Data
vs
Database
```

不一致：

```text
Official source wins
```

流程：

```text
STOP
 ↓
compare raw
 ↓
compare normalized
 ↓
compare database
 ↓
identify transformation error
 ↓
fix
 ↓
re-import
```

不得修改官方 raw data。

---

# 32. GIS Conflict Protocol

如果：

```text
GIS geometry
vs
declared area
```

不一致：

不得直接修改 geometry。

必須標記：

```text
GIS_AREA_MISMATCH
```

並記錄：

```text
source
geometry version
area difference
tolerance
```

---

# 33. Valuation Conflict Protocol

如果 Agent 發現：

```text
valuation result
```

與人工預期不同：

禁止：

```text
hardcode correction
```

必須檢查：

```text
comparable
weights
time adjustment
distance adjustment
outlier
statistics
configuration
```

---

# 34. Evidence Directory

所有 Task evidence：

```text
evidence/
├── TASK-001/
├── TASK-010/
├── TASK-020/
├── TASK-030/
├── ...
└── TASK-202/
```

---

# 35. Evidence Requirements

每個 Task 至少：

```text
command
timestamp
git_commit
result
```

重要 Task 額外：

```text
input
expected
actual
hash
```

---

# 36. Agent Progress File

建立：

```text
.agent/
├── current_task
├── task_state.json
├── phase_state.json
└── blockers.md
```

---

# 37. task_state.json

格式：

```json
{
  "current_task": "TASK-071",
  "status": "IN_PROGRESS",
  "completed": [
    "TASK-001",
    "TASK-002",
    "TASK-010"
  ],
  "blocked": [],
  "failed": []
}
```

---

# 38. Agent Restart Protocol

Agent 重新啟動時：

```text
Read AGENT_TASKS.md
 ↓
Read .agent/task_state.json
 ↓
Read current git status
 ↓
Read latest evidence
 ↓
Resume current task
```

不得從頭重新猜測進度。

---

# 39. Context Loss Protection

如果 Agent context 被壓縮：

不得依記憶繼續。

必須重新讀：

```text
current_task
task_state
relevant spec
latest evidence
```

---

# 40. Git Rules

每個完成 Task 建議建立 commit：

```text
feat(db): implement snapshot schema
feat(data): implement importer
feat(gis): implement road access
feat(valuation): implement comparable engine
feat(mcp): implement transaction tools
test: add reproducibility tests
```

禁止：

```text
one giant commit
```

涵蓋所有 phases。

---

# 41. Commit Gate

Task 完成後：

```text
test
 ↓
verify
 ↓
commit
 ↓
update task state
```

而不是：

```text
write everything
 ↓
commit everything
 ↓
discover failure
```

---

# 42. Forbidden Actions

Agent 永久禁止：

```text
❌ delete failing tests
❌ weaken assertions
❌ modify golden expected result silently
❌ modify official raw data
❌ fabricate GIS geometry
❌ fabricate transaction data
❌ fabricate valuation
❌ bypass provenance
❌ bypass MCP
❌ add arbitrary SQL tool
❌ add shell execution tool
❌ silently modify specification
❌ silently change valuation formula
❌ silently change tolerance
```

---

# 43. Required Agent Behavior

Agent 應該：

```text
✓ inspect
✓ implement
✓ test
✓ verify
✓ measure
✓ record evidence
✓ stop on ambiguity
✓ preserve artifacts
✓ preserve reproducibility
✓ report blockers
```

---

# 44. Final Agent Report

完成後 Agent 必須產生：

```text
FINAL_VERIFICATION_REPORT.md
```

內容：

```text
Project:
Version:
Git Commit:

Implementation:
PASS

Data:
PASS

GIS:
PASS

Comparable:
PASS

Valuation:
PASS

MCP:
PASS

Security:
PASS

Provenance:
PASS

Reproducibility:
PASS

Artifact Lock:
PASS

AI Isolation:
PASS

E2E:
PASS

Release:
PASS
```

---

# 45. Release Decision

只有：

```text
GATE-200 = PASS
```

才能：

```text
RELEASE
```

否則：

```text
RELEASE BLOCKED
```

---

# 46. Agent Final Output Rules

Agent 最終不得只回答：

```text
「完成了」
```

必須回答：

```text
Implementation Status
Verification Status
Test Count
Failed Count
Critical Failures
Git Commit
Snapshot
Algorithm Version
Configuration Version
Reproducibility
Provenance
Release Gate
```

---

# 47. Final State Machine

完整 lifecycle：

```text
                ┌─────────────┐
                │   PENDING   │
                └──────┬──────┘
                       ▼
                ┌─────────────┐
                │ IN_PROGRESS │
                └──────┬──────┘
                       ▼
                ┌─────────────┐
                │ IMPLEMENTED │
                └──────┬──────┘
                       ▼
                ┌─────────────┐
                │   TESTING   │
                └──────┬──────┘
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
          FAILED              PASSED
             │                   │
             ▼                   ▼
       FIX / REVERIFY         VERIFIED
                                 │
                                 ▼
                              LOCKED
```

---

# 48. Final Project State

只有：

```text
ALL TASKS VERIFIED
+
ALL CRITICAL TESTS PASS
+
GATE-200 PASS
```

才允許：

```text
PROJECT VERIFIED
```

否則：

```text
PROJECT NOT VERIFIED
```

---

# 49. Core Principle

Agent 的成功定義不是：

```text
Code exists
```

也不是：

```text
Tests pass
```

而是：

```text
Specification
     ↓
Implementation
     ↓
Test
     ↓
Evidence
     ↓
Deterministic Result
     ↓
Provenance
     ↓
Reproducibility
     ↓
Release Gate
```

因此：

> **沒有 Evidence 的 PASS，不算 PASS。**

> **沒有 Reproducibility 的結果，不算 Verified。**

> **沒有 Provenance 的資料，不算 Trusted Data。**

> **沒有 Release Gate 的完成，不算 Project Complete。**

---

# End of AGENT_TASKS.md