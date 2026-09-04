# VERIFICATION_MANUAL.md

# mcp-go-core Verification Manual v0.1

## 1. Document Purpose

本文件定義 `mcp-go-core` v0.1 的完整驗證程序。

驗證目標不是單純確認：

```text
go test ./...
```

是否成功。

而是完整確認：

```text
Architecture
    ↓
Implementation
    ↓
Feature Graph
    ↓
Dependency Resolution
    ↓
Generated Code
    ↓
Build
    ↓
Binary
    ↓
Runtime
    ↓
Performance
    ↓
Reproducibility
```

全部符合 specification。

---

# 2. Verification Philosophy

本專案的核心特性：

> **Build Complete, Deploy Minimal**

因此 Verification 必須回答五個問題：

### Q1. 功能是否正確？

MCP server 是否真的可以運作？

### Q2. Feature Graph 是否正確？

Feature dependency / conflict / disable 是否正確？

### Q3. Build Pipeline 是否正確？

Build 是否真的按照：

```text
Analyze
→ Resolve
→ Lock
→ Generate
→ Compile
→ Verify
```

執行？

### Q4. Binary 是否真的 Minimal？

未使用的 feature 是否真的沒有進入 production binary？

### Q5. Runtime 是否真的保持 Minimal？

Runtime 是否沒有偷偷重新建立：

```text
Feature Resolver
Module Registry
Dependency Resolver
Dynamic Discovery
```

---

# 3. Verification Levels

驗證分為八層：

```text
V1 Static Verification
V2 Unit Verification
V3 Feature Graph Verification
V4 Build Pipeline Verification
V5 Binary Verification
V6 Runtime Verification
V7 Performance Verification
V8 Reproducibility Verification
```

任何 critical layer 失敗，都不能宣告 v0.1 complete。

---

# 4. Verification Status

每一項使用：

| Status | Meaning |
|---|---|
| PASS | 完全符合要求 |
| FAIL | 不符合要求 |
| BLOCKED | 因外部條件無法驗證 |
| NOT_APPLICABLE | 經確認不適用 |
| WARNING | 不影響功能，但需要記錄 |

禁止使用：

```text
"probably works"
"looks fine"
"should work"
"not tested"
```

作為 PASS。

---

# 5. Environment Baseline

驗證前必須記錄：

```bash
go version
uname -a
git rev-parse HEAD
git status --short
```

另外記錄：

```text
OS
Architecture
Go Version
Compiler
Framework Version
Git Commit
CGO_ENABLED
CPU
Memory
```

---

# 6. Clean Workspace Verification

驗證必須從 clean workspace 開始。

執行：

```bash
git status
```

確認沒有不明修改。

建立 clean build environment：

```bash
go clean -cache
go clean -testcache
```

如有 generated artifacts：

```bash
rm -rf .mcp/generated
rm -rf dist
```

然後重新執行：

```bash
mcp-go-core generate
```

---

# 7. V1 — Static Verification

## V1.1 Repository Structure

確認：

```text
cmd/
core/
modules/
internal/
templates/
examples/
benchmarks/
tests/
docs/
```

存在。

---

## V1.2 Core Isolation

確認 Core 不 import optional modules。

執行：

```bash
go list -deps ./core/... 
```

檢查不得出現：

```text
modules/security
modules/observability
modules/runtime
modules/storage
```

Core 不得依賴：

```text
JWT
OAuth
OpenTelemetry
Kubernetes
Cloud SDK
```

---

## V1.3 Feature Graph Isolation

確認 runtime packages 不 import：

```text
internal/featuregraph
internal/analyzer
internal/generator
internal/builder
```

可使用：

```bash
go list -deps ./core/... 
```

以及：

```bash
go list -deps ./examples/minimal/...
```

進行檢查。

---

## V1.4 Umbrella Package Detection

搜尋：

```bash
grep -R "ConfigureAll" .
grep -R "FeatureManager" .
grep -R "FeatureRegistry" .
```

如果這些名稱存在，Agent 必須人工確認用途。

禁止 runtime 使用：

```text
ConfigureAll
FeatureManager
Runtime Feature Registry
Dynamic Module Resolver
```

---

# 8. V2 — Unit Verification

執行：

```bash
go test ./...
```

Acceptance：

```text
0 failed
0 panic
0 race-related failure
```

---

## V2.1 Race Detection

執行：

```bash
go test -race ./...
```

若環境支援。

任何 data race：

```text
FAIL
```

---

## V2.2 Static Analysis

執行：

```bash
go vet ./...
```

Acceptance：

```text
0 unexpected vet errors
```

---

## V2.3 Formatting

執行：

```bash
gofmt -l .
```

Output 必須為空。

---

# 9. V3 — Feature Graph Verification

Feature Graph 是本專案的 critical component。

---

## FG-001 Basic Dependency

設定：

```text
A → B
```

Enable：

```text
A
```

Expected：

```text
A
B
```

Result：

```text
PASS
```

---

## FG-002 Transitive Dependency

設定：

```text
A → B
B → C
```

Enable：

```text
A
```

Expected：

```text
A
B
C
```

---

## FG-003 Conflict

設定：

```text
A conflicts B
```

Enable：

```text
A
B
```

Expected：

```text
FEATURE_CONFLICT
```

Build 必須 fail。

---

## FG-004 Cycle

設定：

```text
A → B
B → C
C → A
```

Expected：

```text
FEATURE_CYCLE
```

Build 必須 fail。

---

## FG-005 Explicit Disable

設定：

```text
A → B
```

User：

```text
enable A
disable B
```

Expected：

```text
FEATURE_REQUIRED
```

不得：

```text
silently re-enable B
silently disable A
produce invalid graph
```

---

## FG-006 Implies

設定：

```text
A implies B
```

Enable：

```text
A
```

Expected：

```text
A
B
```

---

## FG-007 Determinism

相同 input 執行至少三次：

```bash
mcp-go-core analyze
mcp-go-core analyze
mcp-go-core analyze
```

比較：

```text
inferred-features.json
resolution
features.lock
```

必須 byte-equivalent。

---

# 10. Feature Graph Invariants

以下 invariant 必須永遠成立。

## INV-FG-001

Core always enabled。

---

## INV-FG-002

```text
Enabled Feature
    →
All Hard Dependencies Enabled
```

---

## INV-FG-003

Conflict features 不得同時 enabled。

---

## INV-FG-004

Graph 不得有 cycle。

---

## INV-FG-005

Disabled hard dependency 不得被忽略。

---

## INV-FG-006

Resolution 不得依賴 runtime state。

---

## INV-FG-007

相同 input 必須產生相同 resolution。

---

# 11. V4 — Configuration Verification

建立不同 configuration profiles。

至少：

```text
minimal
production
secure
observable
full
```

---

## CFG-001 Minimal

設定：

```text
stdio
1 tool
```

Expected:

```text
core
stdio
```

---

## CFG-002 HTTP

設定：

```text
http
```

Expected：

```text
core
http
```

不得出現：

```text
jwt
oauth
otel
kubernetes
```

---

## CFG-003 Secure

設定：

```text
http
jwt
```

Expected：

```text
core
http
jwt
```

不得自動加入：

```text
oauth
otel
kubernetes
```

---

# 12. V5 — Analyzer Verification

Analyzer 必須依照：

```text
Explicit Configuration
>
Generated Metadata
>
Known API Usage
>
Go AST Analysis
```

執行。

---

## AN-001 Explicit Configuration

若：

```yaml
features:
  - http
```

Analyzer 必須產生：

```text
http
```

---

## AN-002 Known API Usage

若 application 使用：

```go
http.Configure(...)
```

Analyzer 應能 inference：

```text
http
```

---

## AN-003 Unused Module

Application 未使用：

```text
jwt
```

Analyzer 不得自行加入：

```text
jwt
```

---

## AN-004 Determinism

相同 source + config：

```text
inference result
```

必須一致。

---

# 13. V6 — Code Generation Verification

執行：

```bash
mcp-go-core generate
```

確認產生：

```text
.mcp/generated/
├── features.go
├── modules.go
├── router.go
├── server.go
└── buildinfo.go
```

---

# 14. Generated Code Verification

## GEN-001 Enabled Modules

如果 resolution：

```text
core
http
jwt
```

Generated code 必須包含：

```go
http
jwt
```

---

## GEN-002 Disabled Modules

如果：

```text
oauth
```

未啟用：

Generated code 不得 import OAuth。

---

## GEN-003 Static Composition

Generated code 必須直接呼叫 selected module。

例如：

```go
http.Configure(server)
jwt.Configure(server)
```

禁止：

```go
modules.ConfigureAll(server)
```

---

## GEN-004 Generated Code Determinism

同一 resolution 產生三次：

```bash
mcp-go-core generate
```

比較 checksum。

Expected：

```text
identical
```

---

## GEN-005 Stale Detection

修改 configuration。

不重新 generate。

執行：

```bash
mcp-go-core generate --check
```

Expected：

```text
GENERATED_CODE_STALE
```

---

# 15. V7 — Feature Lock Verification

確認：

```text
.mcp/features.lock
```

至少包含：

```text
framework_version
profile
features
modules
dependency_graph
graph_hash
```

---

## LOCK-001 Deterministic

同一 input：

```text
graph_hash
```

必須相同。

---

## LOCK-002 Configuration Change

修改 feature。

Expected：

```text
graph_hash changed
```

---

## LOCK-003 Dependency Change

修改 dependency graph。

Expected：

```text
graph_hash changed
```

---

# 16. V8 — Build Pipeline Verification

執行：

```bash
mcp-go-core build \
  --profile minimal \
  --verify
```

確認 pipeline：

```text
Config
→ Analyze
→ Resolve
→ Lock
→ Generate
→ Compile
→ Verify
```

每一階段都必須產生可追蹤結果。

---

# 17. Build Artifact Verification

Expected：

```text
dist/
├── server
├── build-manifest.json
├── features.lock
└── checksums.txt
```

---

## BUILD-001 Binary Exists

```bash
test -x dist/server
```

Expected：

```text
PASS
```

---

## BUILD-002 Manifest Exists

```bash
test -f dist/build-manifest.json
```

Expected：

```text
PASS
```

---

## BUILD-003 Feature Lock

確認：

```text
dist/features.lock
```

與 build input 一致。

---

## BUILD-004 Checksum

執行：

```bash
sha256sum dist/server
```

與：

```text
checksums.txt
```

一致。

---

# 18. V9 — Binary Verification

這是本專案最重要的 verification layer。

---

# 19. Binary Dependency Audit

Minimal build：

```text
core
stdio
```

Expected binary dependencies：

```text
core
stdio
application
```

不得包含：

```text
http
jwt
oauth
otel
kubernetes
```

---

## BIN-001 HTTP Absence

Minimal build 中：

```text
http
```

不得存在。

---

## BIN-002 JWT Absence

Minimal build 中：

```text
jwt
```

不得存在。

---

## BIN-003 OAuth Absence

Minimal build 中：

```text
oauth
```

不得存在。

---

## BIN-004 OTel Absence

Minimal build 中：

```text
otel
```

不得存在。

---

## BIN-005 Kubernetes Absence

Minimal build 中：

```text
kubernetes
```

不得存在。

---

# 20. Binary Audit Method

優先使用：

```bash
go tool nm dist/server
```

或：

```bash
go version -m dist/server
```

以及：

```bash
go list -deps
```

進行交叉驗證。

如果 framework 自己提供：

```bash
mcp-go-core doctor dist/server
```

則以 framework audit 為主要結果，再以 Go tooling 交叉確認。

---

# 21. Unexpected Dependency Test

建立：

```text
Expected:
core
http
jwt
```

故意讓 binary 包含：

```text
otel
```

Expected：

```text
UNEXPECTED_MODULE
```

且 verification 必須：

```text
FAIL
```

這個測試是 mandatory。

---

# 22. Binary Size Verification

建立：

```text
minimal
production
secure
observable
full
```

測量：

```text
binary size
```

產生：

```text
binary-size-report.json
```

---

## Important Rule

不要硬編碼：

```text
binary must < X MB
```

作為唯一判定。

原因：

Go version、stdlib、linker、dependency version 都可能影響 binary size。

真正重要的是：

```text
Profile → Expected Dependency Set → Actual Binary
```

一致。

Binary size 主要用於：

```text
Regression Detection
```

---

# 23. V10 — Runtime Verification

---

## RT-001 Startup

執行：

```bash
./dist/server
```

確認：

```text
process starts
```

---

## RT-002 MCP Initialize

送出 MCP initialize request。

Expected：

```text
valid initialize response
```

---

## RT-003 Tool Discovery

確認 tool list 正確。

---

## RT-004 Tool Call

呼叫 test tool。

Expected：

```text
correct result
```

---

## RT-005 Shutdown

確認：

```text
graceful shutdown
```

---

# 24. Minimal Runtime Verification

Minimal server：

```text
stdio
1 tool
```

runtime 不得：

```text
initialize HTTP
initialize JWT
initialize OAuth
initialize OTel
initialize Kubernetes
```

---

# 25. Runtime Feature Graph Check

Production binary 中不得發生：

```text
ResolveFeature()
ResolveDependency()
LoadModule()
DiscoverModule()
```

等 runtime feature selection 行為。

Feature resolution 應已在 build time 完成。

---

# 26. V11 — Security Verification

API Key：

```text
valid key
invalid key
missing key
```

至少測試：

| Case | Expected |
|---|---|
| Valid | PASS |
| Invalid | Reject |
| Missing | Reject |

JWT：

```text
valid token
expired token
invalid signature
missing token
```

---

# 27. V12 — Performance Verification

Benchmark：

```bash
go test ./benchmarks/... -bench=. -benchmem
```

---

# 28. Dispatch Performance

Measure：

```text
ns/op
B/op
allocs/op
```

Initial target：

```text
P50 < 10 µs
P99 < 100 µs
```

注意：

Go benchmark 通常提供平均 operation cost，因此 P50/P99 需要額外 benchmark harness 或 runtime measurement。

不得把：

```text
ns/op
```

直接宣稱為：

```text
P99
```

---

# 29. Allocation Verification

Minimal dispatch：

```text
allocs/op ≈ 0
```

若無法達成：

必須記錄：

```text
allocation source
reason
impact
future optimization
```

不得為了達到 0 allocation 而破壞 API correctness。

---

# 30. Throughput Verification

Synthetic target：

```text
>100k requests/sec
```

測試必須固定：

```text
CPU
GOMAXPROCS
payload
tool handler
transport
concurrency
```

否則 benchmark 不具可比較性。

---

# 31. Startup Verification

測量：

```text
process start
→ MCP ready
```

Initial target：

```text
< 50 ms
```

必須至少測試 10 次。

報告：

```text
min
median
p95
max
```

---

# 32. Memory Verification

測量：

```text
RSS
Heap
Allocations
```

Initial target：

```text
Minimal RSS < 20 MB
Production RSS < 30 MB
```

注意：

OS、runtime、allocator、container environment 都會影響 RSS。

因此：

```text
baseline
+
regression
```

比單一絕對值更重要。

---

# 33. V13 — Reproducibility Verification

這是 production build 的重要驗證。

---

## REP-001 Same Source

同一 git commit。

Build：

```text
A
B
```

比較：

```text
features.lock
generated source
build manifest
binary checksum
```

---

## REP-002 Same Configuration

相同：

```text
mcp.yaml
profile
Go version
dependency lock
```

Expected：

```text
same feature graph
same generated composition
```

Binary 是否 byte-identical 應視 build metadata 與 timestamp 是否被嵌入而定。

---

# 34. Build Metadata Reproducibility

如果：

```text
build timestamp
```

導致 binary checksum 不一致：

應確認 timestamp 是否必要。

Production build 優先：

```text
source
config
commit
feature lock
```

作為 reproducibility identity。

---

# 35. V14 — Profile Verification Matrix

建立完整矩陣：

| Profile | Core | stdio | HTTP | JWT | OAuth | OTel | K8s |
|---|---:|---:|---:|---:|---:|---:|---:|
| minimal | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| production | ✓ | ? | ✓ | ? | ✗ | ? | ✗ |
| secure | ✓ | ? | ✓ | ✓ | ✗ | ✗ | ✗ |
| observable | ✓ | ? | ✓ | ? | ✗ | ✓ | ✗ |
| full | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ? |

`?` 必須依最終 profile specification 決定。

Agent 不得自行假設。

---

# 36. V15 — Negative Verification

Negative tests 是 mandatory。

至少：

```text
invalid config
unknown feature
missing dependency
conflicting feature
dependency cycle
explicit disable of required feature
stale generated code
unexpected binary module
invalid authentication
runtime startup failure
```

每一項都必須：

```text
fail correctly
with deterministic error
```

---

# 37. Error Verification

Error 必須具備：

```text
machine-readable code
human-readable message
context
```

例如：

```text
FEATURE_REQUIRED
Feature "http" is required by "streamable-http"
```

不要只回傳：

```text
invalid configuration
```

---

# 38. V16 — Full End-to-End Verification

執行：

```bash
rm -rf .mcp dist

mcp-go-core analyze

mcp-go-core generate

mcp-go-core build \
  --profile minimal \
  --verify

mcp-go-core doctor

mcp-go-core benchmark
```

然後執行：

```bash
go test ./...
go test -race ./...
go vet ./...
```

---

# 39. Full Acceptance Scenario

## Scenario A — Minimal

Application：

```text
1 Tool
stdio
```

Expected:

```text
Feature Graph:
core
stdio
```

Generated imports：

```text
core
stdio
```

Binary：

```text
core
stdio
application
```

Runtime：

```text
starts
initialize
tool call
shutdown
```

---

# 40. Scenario B — HTTP

Application：

```text
1 Tool
HTTP
```

Expected：

```text
core
http
```

Must NOT contain:

```text
jwt
oauth
otel
kubernetes
```

---

# 41. Scenario C — Secure HTTP

Application：

```text
HTTP
JWT
```

Expected:

```text
core
http
jwt
```

Must NOT contain:

```text
oauth
otel
kubernetes
```

---

# 42. Scenario D — Observability

Application：

```text
HTTP
Metrics
Tracing
```

Expected:

```text
core
http
metrics
tracing
```

Must NOT automatically introduce unrelated modules.

---

# 43. Scenario E — Invalid Dependency

Configuration：

```text
enable:
  - streamable-http

disable:
  - http
```

Expected:

```text
FEATURE_REQUIRED
```

Build：

```text
FAIL
```

No binary should be generated.

---

# 44. Scenario F — Unexpected Dependency

Expected:

```text
core
http
jwt
```

Actual binary intentionally includes:

```text
otel
```

Expected:

```text
UNEXPECTED_MODULE
```

Build verification：

```text
FAIL
```

---

# 45. Completion Matrix

Final report 必須建立：

| Category | Tests | Passed | Failed | Blocked |
|---|---:|---:|---:|---:|
| Static | | | | |
| Unit | | | | |
| Feature Graph | | | | |
| Analyzer | | | | |
| Generator | | | | |
| Build | | | | |
| Binary | | | | |
| Runtime | | | | |
| Security | | | | |
| Performance | | | | |
| Reproducibility | | | | |

---

# 46. Critical Acceptance Criteria

以下任何一項 FAIL：

```text
Feature Graph correctness
Dependency closure
Conflict detection
Generated code correctness
Build pipeline correctness
Binary dependency audit
Runtime smoke test
```

則：

```text
v0.1 = NOT ACCEPTED
```

---

# 47. Performance Acceptance

Performance 若未達 initial target：

```text
P50 < 10 µs
P99 < 100 µs
>100k req/s
RSS target
Startup target
```

不得直接標記 FAIL release。

應分成：

```text
FUNCTIONAL ACCEPTANCE
PERFORMANCE ACCEPTANCE
```

但必須：

```text
record deviation
record baseline
record reason
```

若性能較前一版本 regression >10%，則：

```text
PERFORMANCE REGRESSION
```

---

# 48. Verification Report

Agent 完成驗證後必須產生：

```text
verification/
├── VERIFICATION_REPORT.md
├── feature-graph.json
├── feature-lock.json
├── build-manifest.json
├── binary-audit.json
├── benchmark.json
├── runtime-smoke.json
└── checksums.txt
```

---

# 49. VERIFICATION_REPORT.md Required Format

```text
# Verification Report

## Environment

OS:
Architecture:
Go:
Compiler:
Framework:
Git Commit:
CGO:

## Functional

Status:

## Feature Graph

Status:

## Generator

Status:

## Build

Status:

## Binary Audit

Status:

## Runtime

Status:

## Security

Status:

## Performance

Status:

## Reproducibility

Status:

## Critical Failures

-

## Warnings

-

## Final Decision

ACCEPTED / REJECTED
```

---

# 50. Release Decision

Release decision：

```text
ACCEPTED
```

必須同時滿足：

```text
All Critical Tests PASS
+
No Architecture Violation
+
No Unexpected Binary Dependency
+
Runtime Smoke PASS
+
Feature Graph Deterministic
+
Generated Code Deterministic
```

---

# 51. Architecture Integrity Check

最後由 Agent 人工確認：

### A

Feature Graph 是 build-time。

### B

Generated Composition 是 static。

### C

Runtime 不負責 feature resolution。

### D

Unused modules 不會被 generated import。

### E

Unused modules 不會進 production binary。

### F

Core 不依賴 optional modules。

### G

Optional modules 可以獨立 package。

### H

Binary Audit 可以抓出 unexpected dependency。

### I

同一 input 可以 reproducibly resolve。

### J

Benchmark 可以偵測 regression。

---

# 52. Final Proof of Concept

v0.1 最終必須能證明以下等式：

```text
Unused Feature
        ↓
Not Resolved
        ↓
Not Generated
        ↓
Not Imported
        ↓
Not Initialized
        ↓
Not Linked
        ↓
Not In Production Binary
```

這條鏈若無法被 automated verification 證明：

```text
mcp-go-core
v0.1
```

不得宣稱完成。

---

# 53. Final Verification Command

理想情況下，所有驗證最後應可由：

```bash
mcp-go-core verify
```

一次執行。

其內部流程：

```text
Static Check
     ↓
Unit Test
     ↓
Feature Graph Test
     ↓
Analyzer Test
     ↓
Generator Check
     ↓
Build
     ↓
Binary Audit
     ↓
Runtime Smoke Test
     ↓
Benchmark
     ↓
Reproducibility Check
     ↓
Verification Report
```

最終輸出：

```text
========================================
mcp-go-core Verification
========================================

Static                PASS
Unit                  PASS
Feature Graph         PASS
Analyzer              PASS
Generator             PASS
Build                 PASS
Binary Audit          PASS
Runtime               PASS
Security              PASS
Performance           PASS
Reproducibility       PASS

========================================
FINAL RESULT: ACCEPTED
========================================
```

---

# 54. Definition of Verification Complete

只有當：

```text
Specification
      ↓
Implementation
      ↓
Automated Tests
      ↓
Binary Inspection
      ↓
Runtime Validation
      ↓
Performance Validation
      ↓
Reproducibility Validation
```

全部完成，才稱為：

> **Verified Implementation**

而不是單純：

> **Implemented**