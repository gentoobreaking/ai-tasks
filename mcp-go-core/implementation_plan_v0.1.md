# IMPLEMENTATION_PLAN.md

# mcp-go-core Implementation Plan v0.1

## 1. Purpose

本文件定義 `mcp-go-core` v0.1 的實作順序、階段目標、依賴關係、驗收條件與禁止事項。

核心目標：

> **Build Complete, Deploy Minimal**

開發階段提供完整 MCP Framework 能力。

Production Build 階段則透過：

```text
Application
    ↓
Application Analysis
    ↓
Feature Resolution
    ↓
Dependency Closure
    ↓
Feature Lock
    ↓
Code Generation
    ↓
Static Composition
    ↓
Go Compiler / Linker
    ↓
Binary Audit
    ↓
Minimal MCP Binary
```

產生只包含實際需要能力的 MCP Server。

---

# 2. Implementation Principles

## 2.1 Compile-Time First

所有 feature selection 優先在 build time 完成。

禁止在 request path 判斷：

```go
if feature.Enabled("jwt") {
    ...
}
```

或：

```go
if runtimeConfig.EnableMetrics {
    ...
}
```

Feature selection 必須在 build 時完成。

---

## 2.2 Runtime Must Not Know the Feature Graph

Feature Graph 屬於：

```text
CLI
Analyzer
Resolver
Generator
Builder
Verifier
```

不得成為 runtime dependency。

Runtime binary 不應包含：

```text
Feature Registry
Feature Resolver
Dependency Graph
Build Analyzer
Generator
```

除非 application 明確需要相關 metadata。

---

## 2.3 Static Composition

Generated code 必須直接 import 實際需要的 modules。

例如：

```go
import (
    "github.com/project/mcp-go-core/core"
    "github.com/project/mcp-go-core/modules/transport/http"
    "github.com/project/mcp-go-core/modules/security/jwt"
)
```

禁止：

```go
import "github.com/project/mcp-go-core/modules"
```

再由 runtime 決定啟用哪些功能。

---

## 2.4 Existing MCP Implementation First

MCP protocol implementation 不重新發明。

優先評估並整合成熟 Go MCP implementation。

Framework 自己主要負責：

```text
Core API
Module Architecture
Feature Graph
Build Analysis
Code Generation
Static Composition
Binary Verification
Benchmark
```

而不是重新實作完整 MCP protocol stack。

---

# 3. Phase Overview

| Phase | Name | Main Output |
|---|---|---|
| P0 | Project Bootstrap | 可編譯的 repository |
| P1 | Core Kernel | MCP Core API |
| P2 | Module System | Optional Modules |
| P3 | Feature Graph | Deterministic Resolver |
| P4 | Application Analyzer | Feature inference |
| P5 | Code Generator | Static Composition |
| P6 | Build Pipeline | Automated Build |
| P7 | Binary Audit | Dependency verification |
| P8 | Benchmark | Performance baseline |
| P9 | CI / Verification | Regression protection |
| P10 | Documentation | Developer documentation |

實作順序不得任意調換。

---

# 4. P0 — Project Bootstrap

## Objective

建立 repository 基礎結構與 Go module。

## Tasks

- 初始化 Go module
- 建立 directory structure
- 建立 CLI skeleton
- 建立基本 test infrastructure
- 建立 `.mcp/`
- 建立 example application

## Expected Structure

```text
mcp-go-core/
├── cmd/
│   └── mcp-go-core/
├── core/
├── modules/
├── internal/
├── templates/
├── examples/
├── benchmarks/
├── tests/
├── docs/
├── go.mod
├── mcp.yaml
└── README.md
```

## Acceptance

```bash
go test ./...
go build ./...
```

必須成功。

---

# 5. P1 — Core Kernel

## Objective

建立最小 MCP runtime kernel。

## Scope

Core 只負責：

```text
Protocol
Server
Router
Tool
Resource
Prompt
Request
Response
Lifecycle
Error
```

## Requirements

Core 不得依賴：

```text
JWT
OAuth
OpenTelemetry
Kubernetes
Filesystem
HTTP framework
Cloud SDK
```

## Acceptance

建立最小 server：

```text
stdio transport
+
1 tool
+
request dispatch
```

並能：

```bash
go test ./core/...
```

成功。

---

# 6. P2 — Module System

## Objective

建立 optional module package architecture。

## Initial Modules

### Transport

```text
stdio
http
sse
```

### Security

```text
api-key
jwt
oauth
mtls
```

### Middleware

```text
logging
recovery
metrics
tracing
```

### Runtime

```text
task
session
```

### Storage

```text
memory
filesystem
external
```

### Observability

```text
logging
metrics
tracing
```

v0.1 不需要全部完成。

優先：

```text
stdio
http
api-key
logging
```

---

# 7. P3 — Feature Graph

## Objective

建立 deterministic feature resolution engine。

Input：

```text
mcp.yaml
profile
explicit features
application metadata
module descriptors
```

Output：

```text
Enabled Features
Disabled Features
Required Features
Inferred Features
Dependency Graph
```

## Required Properties

### Deterministic

相同 input 必須產生完全相同 output。

### Dependency Closure

若：

```text
A → B → C
```

啟用 A 時：

```text
A
B
C
```

全部必須存在。

### Conflict Detection

例如：

```text
http
stdio-only
```

若互斥則 build fail。

### Explicit Disable

若 feature 是 hard dependency：

```text
streamable-http
    ↓
http
```

使用者：

```yaml
disable:
  - http
```

必須產生：

```text
FEATURE_REQUIRED
```

不能偷偷重新啟用，也不能產生 invalid build。

---

# 8. P4 — Application Analyzer

## Objective

從 application 判斷實際使用的 framework capabilities。

Inference priority：

```text
Explicit Configuration
        ↓
Generated Metadata
        ↓
Known API Usage
        ↓
Go AST Analysis
```

v0.1 不要求完整 Go semantic analysis。

---

# 9. P5 — Code Generator

## Objective

把 resolved feature set 轉換成 static Go composition。

Input：

```text
Resolution
```

Output：

```text
.mcp/generated/
├── features.go
├── modules.go
├── router.go
├── server.go
└── buildinfo.go
```

## Critical Requirement

Generated code 只能 import enabled modules。

Example：

```go
func ConfigureServer() *core.Server {
    server := core.NewServer()

    http.Configure(server)
    jwt.Configure(server)

    return server
}
```

而不是：

```go
modules.ConfigureAll(server)
```

---

# 10. P6 — Build Pipeline

Pipeline：

```text
Config
 ↓
Analyze
 ↓
Resolve
 ↓
Lock
 ↓
Generate
 ↓
Compile
 ↓
Verify
 ↓
Benchmark
```

CLI：

```bash
mcp-go-core build \
  --profile production \
  --output dist/server \
  --verify \
  --benchmark
```

---

# 11. P7 — Binary Audit

## Objective

確認 build 結果與 feature resolution 一致。

Example expected:

```text
core
http
jwt
```

Actual：

```text
core
http
jwt
otel
```

必須：

```text
UNEXPECTED_MODULE
```

並使 build fail。

## Checks

至少包含：

- binary exists
- executable
- binary size
- linked packages
- unexpected modules
- expected modules
- feature lock hash
- build manifest

---

# 12. P8 — Benchmark

建立：

```text
benchmarks/
├── dispatch_test.go
├── startup_test.go
├── memory_test.go
└── binary_test.go
```

## Initial Baseline

以下為工程初始 target，不是產品保證：

| Metric | Target |
|---|---:|
| Minimal dispatch P50 | < 10 µs |
| Minimal dispatch P99 | < 100 µs |
| Synthetic throughput | > 100k req/s |
| Minimal RSS | < 20 MB |
| Minimal startup | < 50 ms |
| Dispatch allocations | ≈ 0 |

實際 target 必須以 benchmark baseline 為準。

---

# 13. P9 — CI / Verification

CI 必須驗證：

```text
go test
feature graph
generated code
feature lock
build
binary audit
smoke test
benchmark regression
```

## Regression Threshold

初始：

```text
10%
```

例如 baseline：

```text
P99 = 80 µs
```

新版本：

```text
P99 > 88 µs
```

則 regression。

---

# 14. P10 — Documentation

至少完成：

```text
README.md
ARCHITECTURE.md
FEATURE_GRAPH_SPEC.md
BUILD_PIPELINE_SPEC.md
IMPLEMENTATION_PLAN.md
AGENT_TASKS.md
```

另外提供：

```text
examples/minimal
examples/http
examples/secure
examples/production
```

---

# 15. Dependency Order

```text
P0
 ↓
P1
 ↓
P2
 ↓
P3
 ↓
P4
 ↓
P5
 ↓
P6
 ↓
P7
 ↓
P8
 ↓
P9
 ↓
P10
```

其中：

```text
P3 → P5
P4 → P5
P5 → P6
P6 → P7
P7 → P8
P8 → P9
```

不可跳過。

---

# 16. Definition of Done

v0.1 完成必須同時滿足：

### Functional

- MCP server 可運作
- Tool 可註冊
- Resource 可註冊
- 至少 stdio / HTTP transport
- optional module 可獨立啟用

### Build

- Feature Graph 可 deterministic resolve
- Dependency closure 正確
- Conflict detection 正確
- Feature Lock 可產生
- Static composition 可產生
- Production binary 可產生

### Optimization

- 未使用 module 不被 import
- 未使用 module 不進入 production binary
- Runtime 不執行 feature resolution

### Verification

- Binary dependency audit
- Smoke test
- Benchmark baseline
- CI regression gate

---

# 17. Explicit Non-Goals

v0.1 不實作：

```text
AI Agent Runtime
LLM orchestration
Workflow Engine
Kubernetes Operator
Cloud Abstraction
Distributed Scheduler
Mandatory OpenTelemetry
Mandatory Authentication
Custom Go Compiler
Custom Linker
```

---

# 18. Final Architecture Goal

最終產物必須符合：

```text
             DEVELOPMENT

        Full MCP Framework
                │
                ▼
       Application Analysis
                │
                ▼
          Feature Graph
                │
                ▼
       Dependency Resolution
                │
                ▼
         Feature Pruning
                │
                ▼
       Static Code Generation
                │
                ▼
             go build
                │
                ▼

              PRODUCTION

        Minimal MCP Binary
```

核心成功標準不是：

> Framework 有多少功能。

而是：

> **Framework 能提供多少功能，同時 production binary 可以只留下真正需要的功能。**