# mcp-go-core Feature Graph Specification v0.1

**Project:** mcp-go-core  
**Version:** v0.1  
**Status:** Implementation Ready  
**Purpose:** Compile-time feature resolution and dependency optimization

---

# 1. Objective

Feature Graph 是 `mcp-go-core` 的核心機制之一。

它負責將：

```text
Developer Configuration
        +
Application Usage
        +
Selected Runtime Profile
        +
Module Dependencies
        +
Feature Conflicts
```

解析成：

```text
Final Feature Set
        ↓
Build Composition
        ↓
Generated Go Code
        ↓
Minimal Production Binary
```

核心目標：

> **讓開發者可以使用完整 Framework，但 production binary 只包含實際需要的能力。**

---

# 2. Design Goals

Feature Graph 必須達成：

1. Deterministic
2. Reproducible
3. Dependency-aware
4. Conflict-aware
5. Compile-time oriented
6. No runtime feature discovery
7. No unnecessary module initialization
8. Human-readable
9. Machine-readable
10. CI-verifiable

---

# 3. Core Concepts

Feature Graph 包含五種主要 Entity：

```text
Feature
Module
Dependency
Conflict
Profile
```

關係：

```text
Profile
   ↓
Feature
   ↓
Module
   ↓
Dependency
```

---

# 4. Feature

Feature 是開發者可以使用或 Framework 可以推導的能力。

Example:

```text
stdio
streamable-http
sse

jwt
oauth
mtls

logging
metrics
tracing

tasks
sessions

filesystem-storage
external-storage
```

---

# 5. Feature State

Feature 支援以下狀態：

```text
AUTO
ENABLED
DISABLED
REQUIRED
INFERRED
```

## AUTO

由 profile / resolver 決定。

## ENABLED

使用者明確要求。

## DISABLED

使用者明確禁止。

## REQUIRED

由 dependency graph 強制啟用。

## INFERRED

由 application usage 推導。

---

# 6. Feature Descriptor

推薦資料結構：

```go
type FeatureDescriptor struct {
    Name         string
    Version      string
    Description  string

    Module       string

    Dependencies []string
    Conflicts    []string
    Implies      []string

    Default      bool
    Optional     bool

    BuildOnly    bool
    Runtime      bool
}
```

---

# 7. Module Descriptor

```go
type ModuleDescriptor struct {
    Name         string
    Version      string
    Category     string

    Features     []string
    Dependencies []string

    Package      string

    RuntimeInit  bool
}
```

Example:

```yaml
name: security-jwt
category: security

features:
  - jwt

dependencies:
  - security

package: github.com/example/mcp-go-core/modules/security/jwt

runtime_init: true
```

---

# 8. Graph Model

Graph 必須為 DAG。

Example：

```text
streamable-http
       │
       ▼
transport-http
       │
       ▼
      core
```

JWT：

```text
jwt
 │
 ▼
security
 │
 ▼
core
```

Tracing：

```text
tracing
   │
   ▼
otel
   │
   ▼
middleware
   │
   ▼
core
```

---

# 9. Dependency Types

支援：

```text
HARD
OPTIONAL
IMPLICIT
```

## HARD

沒有 dependency 就不能 build。

```text
jwt → security
```

## OPTIONAL

只有使用特定能力時才需要。

## IMPLICIT

Framework 自動加入。

Example：

```text
streamable-http
    → session
```

---

# 10. Conflict

Feature 可以定義互斥能力。

Example：

```text
stdio
conflicts:
  - streamable-http
```

或：

```text
transport-stdio
conflicts:
  - transport-http
```

如果 conflict 被觸發：

```text
ERROR FEATURE_CONFLICT

features:
  stdio
  streamable-http

reason:
  incompatible transport selection
```

---

# 11. Implies

`implies` 表示啟用 A 時自動啟用 B。

Example:

```yaml
name: streamable-http

implies:
  - http-transport
```

結果：

```text
streamable-http
        ↓
http-transport
```

---

# 12. Feature Resolution

Resolver 必須依照固定順序：

```text
1. Load profile
2. Load mcp.yaml
3. Load explicit feature selection
4. Analyze application
5. Infer features
6. Expand implies
7. Expand dependencies
8. Validate conflicts
9. Apply explicit disables
10. Validate dependency closure
11. Generate final feature set
12. Generate feature lock
```

---

# 13. Resolution Algorithm

Pseudo-code：

```text
resolve():

    features = profile.features

    features += config.enabled

    features += analyzer.inferred

    repeat:
        features += implies(features)
        features += dependencies(features)
    until no_change

    validate_conflicts(features)

    features -= config.disabled

    validate_required_dependencies(features)

    return sort_deterministically(features)
```

---

# 14. Disable Semantics

這是 Feature Graph 最重要的規則之一。

假設：

```text
streamable-http
    ↓
http
    ↓
core
```

使用者：

```yaml
streamable-http: true
http: false
```

結果必須：

```text
ERROR FEATURE_REQUIRED

http is required by:
streamable-http
```

不能默默忽略。

---

# 15. Explicit Disable Priority

Priority：

```text
REQUIRED
    >
EXPLICIT DISABLE
    >
EXPLICIT ENABLE
    >
INFERRED
    >
AUTO
```

但：

> `DISABLED` 不得覆蓋真正的 HARD dependency。

因此：

```text
jwt ENABLED
security DISABLED
```

必須報錯，而不是偷偷重新啟用。

---

# 16. Application Feature Detection

Analyzer 可以分析：

```text
mcp.yaml
Go imports
Framework API usage
Generated metadata
CLI options
```

Example:

```go
mcp.WithJWT(...)
```

Analyzer 推導：

```text
jwt
security
```

Example:

```go
http.NewTransport(...)
```

推導：

```text
http
streamable-http
```

---

# 17. Static Analysis Boundary

v0.1 不要求完整 AST inference。

優先順序：

```text
Explicit Configuration
        >
Generated Metadata
        >
Known API Usage
        >
Go AST Analysis
```

不要讓 v0.1 因為「自動分析所有 Go code」而變得過度複雜。

---

# 18. Feature Lock

Resolver 必須產生：

```text
.mcp/features.lock
```

Example:

```yaml
version: 1

profile: production

enabled:
  - core
  - http
  - streamable-http
  - security
  - jwt
  - logging

disabled:
  - stdio
  - sse
  - oauth
  - mtls
  - tracing
  - metrics
  - tasks

inferred:
  - http
  - security

hash:
  algorithm: sha256
  value: "..."
```

---

# 19. Deterministic Ordering

Feature lock 必須 deterministic。

相同：

```text
mcp.yaml
source
profile
framework version
```

必須產生相同 Feature Graph。

排序：

```text
category
→ name
```

或固定 topological ordering。

---

# 20. Feature Graph Output

CLI：

```bash
mcp-go-core analyze
```

應輸出：

```text
Feature Graph

core
 ├── protocol
 ├── router
 └── lifecycle

transport
 └── http
      └── streamable-http

security
 └── jwt

middleware
 └── logging
```

---

# 21. Machine-readable Output

支援：

```bash
mcp-go-core analyze --format=json
```

Output：

```json
{
  "profile": "production",
  "enabled": [
    "core",
    "http",
    "streamable-http",
    "security",
    "jwt",
    "logging"
  ],
  "disabled": [
    "stdio",
    "sse",
    "oauth",
    "mtls",
    "tracing",
    "metrics",
    "tasks"
  ]
}
```

---

# 22. Build Manifest

Feature Resolver 必須產生：

```text
.mcp/manifest.json
```

Example:

```json
{
  "profile": "production",
  "features": [
    "core",
    "http",
    "streamable-http",
    "security",
    "jwt",
    "logging"
  ],
  "modules": [
    "core",
    "transport-http",
    "security-jwt",
    "middleware-logging"
  ]
}
```

---

# 23. Feature Graph Validation

必須驗證：

```text
✓ duplicate feature
✓ missing feature
✓ missing module
✓ missing dependency
✓ dependency cycle
✓ feature conflict
✓ invalid disable
✓ invalid profile
✓ unsupported feature
```

---

# 24. Cycle Detection

使用 DFS / Kahn's algorithm。

Example：

```text
A → B
B → C
C → A
```

必須輸出：

```text
FEATURE_DEPENDENCY_CYCLE

A → B → C → A
```

Build 必須 fail。

---

# 25. Dependency Closure

Resolver 必須保證：

```text
For every enabled feature F:

all HARD dependencies of F
must also be enabled.
```

Invariant：

```text
∀ F ∈ Enabled:
Dependencies(F) ⊆ Enabled
```

---

# 26. Minimality

Resolver 必須滿足：

```text
No unnecessary feature is enabled.
```

定義：

```text
Enabled =
Explicit
+
Inferred
+
Required Dependencies
```

而不是：

```text
Enabled = Full Framework
```

---

# 27. Feature Graph Invariants

### INV-001

Core 永遠存在。

### INV-002

所有 enabled feature 的 dependency 必須存在。

### INV-003

Disabled feature 不得被初始化。

### INV-004

Feature Graph 不得有 cycle。

### INV-005

Conflict 不得同時存在。

### INV-006

相同 input 必須產生相同 graph。

### INV-007

Feature Graph 不得依賴 runtime state。

---

# 28. Runtime Independence

Feature resolution 發生於：

```text
Build Time
```

而不是：

```text
Request Time
```

禁止：

```go
if featureRegistry.IsEnabled("tracing") {
    tracing.Trace(...)
}
```

作為 production hot path 的主要 feature selection 機制。

---

# 29. Feature Graph API

Internal API：

```go
type Graph struct {
    Features map[string]*FeatureDescriptor
}

type Resolver struct {
    Graph *Graph
}

type Resolution struct {
    Enabled  []string
    Disabled []string
    Required []string
    Inferred []string
}
```

Methods：

```go
func (r *Resolver) Resolve(
    cfg Config,
) (*Resolution, error)

func (g *Graph) Validate() error

func (g *Graph) Dependencies(
    feature string,
) []string

func (g *Graph) TopologicalOrder() []string
```

---

# 30. Feature Registry

Registry 可以使用：

```go
map[string]FeatureDescriptor
```

但只存在於：

```text
CLI
Analyzer
Generator
Build Time
```

不得進入 production request path。

---

# 31. Generated Feature Composition

Resolver 最終應產生：

```go
package generated

func ConfigureServer(s *mcp.Server) {
    configureTransport(s)
    configureSecurity(s)
    configureMiddleware(s)
}
```

而非：

```go
func ConfigureServer(s *mcp.Server) {
    if config.TransportHTTP {
        ...
    }

    if config.JWT {
        ...
    }

    if config.OTel {
        ...
    }
}
```

---

# 32. Feature Graph Testing

測試必須至少包含：

```text
TestBasicDependency
TestTransitiveDependency
TestConflict
TestCycle
TestExplicitDisable
TestRequiredDependency
TestDeterministicResolution
TestMinimalResolution
TestProfileResolution
```

---

# 33. Acceptance Criteria

Feature Graph v0.1 完成條件：

```text
✓ Feature registry
✓ Dependency graph
✓ Dependency resolver
✓ Conflict detection
✓ Cycle detection
✓ Explicit enable
✓ Explicit disable
✓ Auto inference
✓ Feature lock
✓ Deterministic output
✓ JSON output
✓ Generated build manifest
✓ Unit tests
✓ Integration tests
```

---

# 34. Key Principle

Feature Graph 的真正目的不是：

> 「讓使用者可以開關功能。」

而是：

> **把 Framework 的功能集合轉換成一個最小化的 static dependency graph。**

最終：

```text
Full Framework
      ↓
Feature Graph
      ↓
Required Closure
      ↓
Minimal Dependency Graph
      ↓
Generated Go
      ↓
Go Compiler
```

這才是 `mcp-go-core` 與單純 configuration-based framework 的核心差異。