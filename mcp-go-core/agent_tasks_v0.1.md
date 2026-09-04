# AGENT_TASKS.md

# mcp-go-core Agent Tasks v0.1

## 0. Agent Operating Rules

本文件是 Coding Agent 的執行規範。

Agent 必須：

1. 嚴格依照 Task 順序執行。
2. 每完成一個 Task 必須執行指定驗證。
3. 不得自行擴大 scope。
4. 不得修改已完成 Artifact 的 architecture contract。
5. 不得為了讓 test 通過而降低 acceptance criteria。
6. 不得把 build-time logic 移入 runtime。
7. 不得建立 runtime `FeatureManager`。
8. 不得建立 `ConfigureAll()` 類型的 umbrella runtime initialization。
9. 不得加入未被 Task 要求的 dependency。
10. 發現 specification conflict 時必須停止並報告，而不是自行決定。

---

# 1. Artifact Locking Rules

以下文件屬於 architecture contract：

```text
ARCHITECTURE.md
FEATURE_GRAPH_SPEC.md
BUILD_PIPELINE_SPEC.md
IMPLEMENTATION_PLAN.md
AGENT_TASKS.md
```

以下 artifact 一旦完成，不得任意修改：

```text
Feature Graph schema
Feature Lock schema
Build Manifest schema
Generated code contract
Module dependency contract
CLI command contract
```

如果實作發現 specification 不合理：

```text
STOP
↓
Report Conflict
↓
提出修改建議
↓
等待批准
```

禁止：

```text
Modify Spec silently
```

---

# 2. Execution Protocol

每個 Task 必須依序：

```text
READ
 ↓
IMPLEMENT
 ↓
TEST
 ↓
VERIFY
 ↓
REPORT
 ↓
NEXT TASK
```

每個 Task completion report 至少包含：

```text
Task:
Status:
Files Changed:
Tests:
Verification:
Known Issues:
```

---

# 3. Phase P0 — Bootstrap

## TASK-001 — Initialize Go Module

### Objective

建立 Go project。

### Requirements

建立：

```text
go.mod
cmd/mcp-go-core/
core/
modules/
internal/
templates/
examples/
benchmarks/
tests/
docs/
```

### Acceptance

```bash
go test ./...
go build ./...
```

成功。

### Forbidden

不得加入與 MCP core 無關的大型 dependency。

---

## TASK-002 — CLI Skeleton

建立：

```bash
mcp-go-core
```

Commands：

```text
init
analyze
generate
build
test
benchmark
doctor
overview
clean
```

初期 command 可以 stub。

### Acceptance

```bash
mcp-go-core --help
```

成功。

---

## TASK-003 — Example Application

建立：

```text
examples/minimal/
```

至少包含：

```text
1 MCP server
1 tool
stdio
```

### Acceptance

Example 可以 compile。

---

# 4. Phase P1 — Core

## TASK-010 — Core Protocol Types

建立：

```text
core/protocol
core/request
core/response
core/error
```

### Acceptance

```bash
go test ./core/...
```

---

## TASK-011 — Tool API

建立 typed Tool API。

至少支援：

```text
Name
Description
Input
Handler
```

不得依賴 reflection 作為主要 dispatch mechanism。

---

## TASK-012 — Resource API

建立 Resource API。

---

## TASK-013 — Prompt API

建立 Prompt API。

---

## TASK-014 — Router

建立：

```text
core/router
```

功能：

```text
tool dispatch
resource dispatch
prompt dispatch
```

### Critical

request path 不得查 Feature Graph。

---

## TASK-015 — Server Lifecycle

建立：

```text
NewServer
RegisterTool
RegisterResource
RegisterPrompt
Start
Shutdown
```

### Acceptance

minimal MCP server 可以啟動與 shutdown。

---

# 5. Phase P2 — Transport Modules

## TASK-020 — Module Boundary

定義：

```text
modules/
```

package boundary。

每個 module 必須：

- 可獨立 import
- 明確 dependency
- 不依賴 umbrella modules

---

## TASK-021 — stdio Module

建立：

```text
modules/transport/stdio
```

### Acceptance

minimal example 使用 stdio 成功。

---

## TASK-022 — HTTP Module

建立：

```text
modules/transport/http
```

### Acceptance

HTTP MCP server 可啟動。

---

## TASK-023 — SSE Module

建立 SSE module skeleton。

若底層 MCP implementation 不支援該 capability：

```text
STOP
REPORT
```

不得自行發明 protocol implementation。

---

# 6. Phase P2 — Security

## TASK-030 — Auth Interface

建立：

```go
type Authenticator interface {
    Authenticate(ctx context.Context, req *Request) (*Identity, error)
}
```

Core 不得依賴 concrete auth implementation。

---

## TASK-031 — API Key

建立：

```text
modules/security/api_key
```

---

## TASK-032 — JWT

建立：

```text
modules/security/jwt
```

JWT 不得因 package import 自動引入：

```text
OAuth
OTel
Kubernetes
```

---

# 7. Phase P2 — Middleware

## TASK-040 — Middleware Contract

建立 middleware abstraction。

至少：

```text
logging
recovery
```

Metrics / tracing 可以先建立 descriptor，不要求完整 implementation。

---

# 8. Phase P3 — Feature Graph

## TASK-050 — Feature Descriptor

建立：

```go
type FeatureDescriptor struct {
    Name         string
    Version      string
    Description  string
    Module       string
    Dependencies []Dependency
    Conflicts    []string
    Implies      []string
    Default      bool
    Optional     bool
    BuildOnly    bool
    Runtime     bool
}
```

---

## TASK-051 — Module Descriptor

建立：

```go
type ModuleDescriptor struct {
    Name         string
    Version      string
    Category     string
    Features     []string
    Dependencies []string
    Package      string
    RuntimeInit  string
}
```

---

## TASK-052 — Feature Registry

建立 internal registry。

位置：

```text
internal/featuregraph
```

### Critical

Registry 僅允許：

```text
CLI
Analyzer
Resolver
Generator
Verifier
```

使用。

不得被 runtime import。

---

## TASK-053 — Graph Validation

實作：

```text
duplicate detection
missing dependency
missing feature
missing module
cycle detection
conflict validation
```

---

## TASK-054 — Dependency Resolution

實作：

```text
explicit enable
explicit disable
inferred feature
implies
hard dependency
transitive dependency
```

---

## TASK-055 — Explicit Disable Validation

Case：

```text
A → B
```

User：

```text
enable A
disable B
```

必須：

```text
FEATURE_REQUIRED
```

---

## TASK-056 — Deterministic Resolution

相同 input：

```text
Config
Profile
Application Metadata
```

必須產生 byte-equivalent resolution result。

---

## TASK-057 — Feature Lock

產生：

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

# 9. Phase P4 — Analyzer

## TASK-060 — Explicit Configuration Analyzer

優先讀取：

```text
mcp.yaml
```

---

## TASK-061 — Generated Metadata Analyzer

讀取 application generated metadata。

---

## TASK-062 — Known API Usage Analyzer

偵測：

```text
http.Configure
jwt.Configure
stdio.Configure
```

等 known API。

---

## TASK-063 — Go AST Analyzer

僅做 v0.1 最小實作。

至少能偵測：

```text
known module imports
known feature APIs
```

不得實作完整 Go compiler。

---

## TASK-064 — Analyzer Output

產生：

```text
.mcp/inferred-features.json
```

結果必須 deterministic。

---

# 10. Phase P5 — Generator

## TASK-070 — Generator Interface

建立：

```go
type Generator interface {
    Generate(ctx context.Context, resolution Resolution) error
}
```

---

## TASK-071 — Generated Features

產生：

```text
.mcp/generated/features.go
```

內容只包含 metadata。

---

## TASK-072 — Static Module Composition

產生：

```text
.mcp/generated/modules.go
```

例如：

```go
func Configure(server *core.Server) {
    stdio.Configure(server)
    jwt.Configure(server)
}
```

### Critical

只允許 resolved modules 出現。

---

## TASK-073 — Generated Server

產生：

```text
server.go
```

---

## TASK-074 — Generated Router

產生：

```text
router.go
```

---

## TASK-075 — Build Info

產生：

```text
buildinfo.go
```

至少包含：

```text
framework version
build profile
feature lock hash
build timestamp
git commit
```

---

## TASK-076 — Generated Code Check

實作：

```bash
mcp-go-core generate --check
```

若 generated code 與 source resolution 不一致：

```text
FAIL
```

---

# 11. Phase P6 — Build Pipeline

## TASK-080 — Build Context

建立：

```go
type BuildContext struct {
    Config
    Resolution
    Manifest
    GeneratedDir
    OutputPath
}
```

---

## TASK-081 — Pipeline Interface

建立：

```go
type Stage interface {
    Name() string
    Run(context.Context, *BuildContext) error
}
```

---

## TASK-082 — Config Stage

實作 config loading。

---

## TASK-083 — Analyze Stage

執行 analyzer。

---

## TASK-084 — Resolve Stage

執行 Feature Graph resolver。

---

## TASK-085 — Lock Stage

產生 Feature Lock。

---

## TASK-086 — Generate Stage

產生 static composition。

---

## TASK-087 — Compile Stage

執行：

```bash
go build
```

production mode：

```bash
go build -trimpath -ldflags="-s -w"
```

---

## TASK-088 — Build Manifest

產生：

```text
dist/build-manifest.json
```

至少包含：

```text
application
version
profile
features
modules
go_version
framework_version
git_commit
feature_lock_hash
binary_size
```

---

# 12. Phase P7 — Binary Audit

## TASK-090 — Binary Metadata Reader

讀取：

```text
binary size
symbols
linked packages
```

---

## TASK-091 — Expected Module Verification

Input：

```text
Feature Lock
```

Expected：

```text
core
http
jwt
```

Actual binary 必須 match。

---

## TASK-092 — Unexpected Module Detection

Example：

```text
Expected:
core,http,jwt

Actual:
core,http,jwt,otel
```

必須：

```text
UNEXPECTED_MODULE
```

並使 verification fail。

---

## TASK-093 — Binary Audit CLI

建立：

```bash
mcp-go-core doctor
```

至少可以：

```text
inspect binary
show enabled features
show modules
detect unexpected dependency
```

---

# 13. Phase P8 — Runtime Verification

## TASK-100 — Smoke Test

Build 後執行：

```text
start server
send initialize
call tool
shutdown
```

---

## TASK-101 — Minimal Profile Test

測試：

```text
core + stdio
```

確認：

```text
HTTP 不存在
JWT 不存在
OAuth 不存在
OTel 不存在
K8s 不存在
```

---

## TASK-102 — HTTP Profile Test

測試：

```text
core + http
```

確認：

```text
stdio optional
JWT absent
OAuth absent
OTel absent
```

---

## TASK-103 — Secure Profile Test

測試：

```text
core
http
jwt
```

確認：

```text
OAuth absent
OTel absent
K8s absent
```

---

# 14. Phase P8 — Benchmark

## TASK-110 — Dispatch Benchmark

建立：

```text
BenchmarkToolDispatch
```

測量：

```text
ns/op
allocs/op
B/op
```

---

## TASK-111 — Throughput Benchmark

測試：

```text
100k+ requests/sec
```

是否達標以實際 benchmark 為準。

---

## TASK-112 — Startup Benchmark

測量：

```text
process start
MCP initialize
ready
```

---

## TASK-113 — Memory Benchmark

測量：

```text
RSS
heap
allocations
```

---

## TASK-114 — Binary Size Benchmark

建立 profiles：

```text
minimal
production
secure
full
```

比較：

```text
binary size
startup
RSS
```

---

# 15. Phase P9 — CI

## TASK-120 — Full Test

CI：

```bash
go test ./...
```

---

## TASK-121 — Generate Check

CI：

```bash
mcp-go-core generate --check
```

---

## TASK-122 — Feature Lock Check

CI 必須確認：

```text
features.lock
```

與 source/config 一致。

---

## TASK-123 — Build Verification

CI：

```bash
mcp-go-core build \
  --profile production \
  --verify
```

---

## TASK-124 — Binary Dependency Gate

Unexpected dependency：

```text
FAIL
```

---

## TASK-125 — Benchmark Regression

初始 threshold：

```text
10%
```

任何主要 KPI 超過 regression threshold：

```text
FAIL
```

---

# 16. Phase P10 — Documentation

## TASK-130 — README

README 必須說明：

```text
What is mcp-go-core
Why it exists
Build Complete, Deploy Minimal
Quick Start
Architecture
CLI
Examples
Benchmark
```

---

## TASK-131 — Architecture Documentation

描述：

```text
Core
Module
Feature Graph
Generator
Build Pipeline
Binary Audit
```

---

## TASK-132 — Example Documentation

提供：

```text
minimal
http
secure
production
```

---

# 17. Mandatory Test Matrix

Agent 必須建立以下測試。

| Test | Expected |
|---|---|
| Basic dependency | PASS |
| Transitive dependency | PASS |
| Conflict | FAIL |
| Cycle | FAIL |
| Explicit disable | FAIL when hard dependency |
| Required dependency | PASS |
| Deterministic resolution | PASS |
| Minimal resolution | PASS |
| Profile resolution | PASS |
| Generated code | PASS |
| Stale generated code | FAIL |
| Binary unexpected module | FAIL |
| Binary expected modules | PASS |
| Minimal runtime | PASS |
| HTTP runtime | PASS |
| Secure runtime | PASS |

---

# 18. Critical Negative Tests

Agent 不只需要測試「能工作」。

必須測試「不應該工作」。

## N001

```text
enable A
disable hard dependency B
```

Expected:

```text
FEATURE_REQUIRED
```

---

## N002

```text
A → B
B → A
```

Expected:

```text
FEATURE_CYCLE
```

---

## N003

Feature conflict：

```text
A conflicts B
enable A
enable B
```

Expected:

```text
FEATURE_CONFLICT
```

---

## N004

Binary contains unexpected module。

Expected：

```text
UNEXPECTED_MODULE
```

---

## N005

Generated source stale。

Expected：

```text
GENERATED_CODE_STALE
```

---

# 19. Forbidden Architecture

Agent 絕對不得建立以下架構：

## 19.1 Runtime Feature Manager

禁止：

```go
featureManager.IsEnabled(...)
```

進入 request path。

---

## 19.2 Runtime Dependency Injection Container

禁止建立大型：

```text
ServiceContainer
DependencyContainer
ModuleContainer
```

作為 runtime feature selection。

---

## 19.3 Configure All

禁止：

```go
modules.ConfigureAll(server)
```

---

## 19.4 Reflection-Based Module Discovery

禁止：

```go
reflect
plugin
runtime module scanning
```

作為 feature selection mechanism。

---

## 19.5 Runtime Feature Registry

禁止：

```go
registry.Register(...)
registry.Resolve(...)
```

作為 production request path 的 feature mechanism。

---

## 19.6 Full Framework Import

禁止：

```go
import "mcp-go-core/modules/all"
```

---

# 20. Required Directory Ownership

| Directory | Owner |
|---|---|
| `core/` | Runtime MCP Kernel |
| `modules/` | Optional capabilities |
| `internal/featuregraph/` | Build-time resolver |
| `internal/analyzer/` | Build-time analysis |
| `internal/generator/` | Static composition |
| `internal/builder/` | Compilation |
| `internal/manifest/` | Build metadata |
| `templates/` | Generated source |
| `benchmarks/` | Performance |
| `examples/` | Developer usage |

---

# 21. Task Completion Gate

每個 Phase 必須滿足：

```text
Implementation
+
Unit Tests
+
Integration Tests
+
Negative Tests
+
Build Verification
```

才能進入下一 Phase。

---

# 22. Final v0.1 Acceptance

Agent 最終必須能執行：

```bash
mcp-go-core init
mcp-go-core analyze
mcp-go-core generate
mcp-go-core build --profile minimal --verify
mcp-go-core doctor
mcp-go-core benchmark
```

並產生：

```text
dist/
├── server
├── build-manifest.json
├── features.lock
└── checksums.txt
```

---

# 23. Final Proof

最終必須證明：

### Case A — Minimal

```text
Application
  ↓
stdio
  ↓
1 Tool
```

Binary：

```text
Core
stdio
Application
```

---

### Case B — HTTP

```text
Application
  ↓
HTTP
  ↓
1 Tool
```

Binary：

```text
Core
HTTP
Application
```

---

### Case C — Secure HTTP

```text
Application
  ↓
HTTP
JWT
  ↓
1 Tool
```

Binary：

```text
Core
HTTP
JWT
Application
```

---

### Case D — Unused Feature

Application 沒有使用：

```text
OAuth
OTel
Kubernetes
Storage
Task
```

則這些 capability：

```text
不得被初始化
不得被 generated code import
不得進入 production binary
```

---

# 24. Final Success Criterion

本專案不是以：

```text
"所有 module 都可以 compile"
```

作為成功標準。

真正成功標準是：

```text
Full Framework
      ↓
Feature Analysis
      ↓
Dependency Resolution
      ↓
Feature Pruning
      ↓
Static Composition
      ↓
Go Compiler / Linker
      ↓
Minimal Binary
```

並且能用 automated verification 證明：

```text
Unused Feature
        =
No Generated Import
        =
No Runtime Initialization
        =
No Production Binary Dependency
```

這是 `mcp-go-core` v0.1 最重要的 architecture invariant。