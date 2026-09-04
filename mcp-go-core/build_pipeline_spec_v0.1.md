# mcp-go-core Build Pipeline Specification v0.1

**Project:** mcp-go-core  
**Version:** v0.1  
**Status:** Implementation Ready  
**Purpose:** Convert resolved MCP features into a minimal production binary

---

# 1. Objective

Build Pipeline 的目標：

```text
Application
    ↓
Feature Analysis
    ↓
Feature Resolution
    ↓
Code Generation
    ↓
Static Composition
    ↓
Go Build
    ↓
Binary Verification
```

最終產物：

```text
Minimal MCP Service Binary
```

---

# 2. Fundamental Principle

> **Do not optimize a full runtime. Build a smaller runtime.**

不採用：

```text
Full Framework
     ↓
Runtime Config
     ↓
Disable unused features
```

優先採用：

```text
Full Framework
     ↓
Feature Resolver
     ↓
Remove unused composition
     ↓
Go compiler/linker
```

---

# 3. Build Stages

完整 Pipeline：

```text
Stage 01
Configuration

Stage 02
Application Analysis

Stage 03
Feature Resolution

Stage 04
Feature Lock

Stage 05
Code Generation

Stage 06
Static Composition

Stage 07
Go Compilation

Stage 08
Binary Analysis

Stage 09
Runtime Smoke Test

Stage 10
Benchmark
```

---

# 4. Stage 01 — Configuration

Input:

```text
mcp.yaml
```

Example:

```yaml
profile: production

transport:
  streamable-http: true

security:
  jwt: true

observability:
  logging: true
  tracing: false
```

Validate schema before continuing.

---

# 5. Stage 02 — Application Analysis

Analyzer examines:

```text
mcp.yaml
application metadata
generated metadata
known framework APIs
```

Output:

```text
inferred-features.json
```

Example:

```json
{
  "features": [
    "streamable-http",
    "jwt",
    "logging"
  ]
}
```

---

# 6. Stage 03 — Feature Resolution

Input：

```text
profile
+
configuration
+
inferred features
+
feature registry
```

Output：

```text
Resolution
```

Example:

```text
Enabled:

core
http
streamable-http
security
jwt
logging
```

---

# 7. Stage 04 — Feature Lock

Generate:

```text
.mcp/features.lock
```

The lock file must contain:

```text
framework version
profile
features
modules
dependency graph
hash
```

Purpose:

```text
Reproducibility
CI validation
Build auditing
Debugging
```

---

# 8. Stage 05 — Code Generation

Generate:

```text
.mcp/generated/
```

Files:

```text
features.go
modules.go
router.go
server.go
buildinfo.go
```

---

# 9. Generated `features.go`

Example:

```go
package generated

const (
    FeatureHTTP = true
    FeatureJWT  = true
    FeatureOTel = false
)
```

However, these constants should NOT be relied upon as the primary mechanism for removing dependencies.

They are metadata.

The actual optimization mechanism is:

```text
Static imports
+
Generated composition
+
Go compiler
```

---

# 10. Generated `modules.go`

Example:

```go
package generated

func Configure(s *mcp.Server) {
    configureHTTP(s)
    configureJWT(s)
    configureLogging(s)
}
```

No call to:

```text
configureOTel
configureOAuth
configureTasks
configureSSE
```

when disabled.

---

# 11. Static Composition

Generated source should only reference selected modules.

Example:

```go
import (
    "github.com/project/mcp-go-core/core"
    "github.com/project/mcp-go-core/modules/transport/http"
    "github.com/project/mcp-go-core/modules/security/jwt"
)
```

Do NOT generate:

```go
import (
    "all/modules"
)
```

followed by runtime selection.

---

# 12. Stage 06 — Static Composition

Build composition:

```text
Application
    +
Core
    +
Enabled Modules
    +
Generated Router
    +
Generated Middleware
```

This creates the actual Go dependency tree.

---

# 13. Module Isolation

Every optional module must have independent package boundaries.

Example:

```text
modules/security/jwt
modules/security/oauth
modules/security/mtls
```

JWT must not import OAuth.

OAuth must not import JWT.

---

# 14. Go Package Dependency Rule

Dependency direction:

```text
Application
    ↓
Modules
    ↓
Core
```

Forbidden:

```text
Core → Module
```

Forbidden:

```text
JWT → OAuth
OAuth → JWT
```

unless explicitly required by the protocol design.

---

# 15. Build Tags

Build tags may be used when appropriate:

```go
//go:build mcp_jwt
```

But build tags must NOT become the primary public feature management system.

Primary system:

```text
Feature Graph
+
Generated composition
```

Build tags are an implementation mechanism, not the user-facing architecture.

---

# 16. Stage 07 — Go Compilation

Default:

```bash
go build ./cmd/server
```

Production:

```bash
go build \
  -trimpath \
  -ldflags="-s -w" \
  ./cmd/server
```

The exact flags must remain configurable.

---

# 17. Compiler Optimization

The framework should rely on normal Go optimization:

```text
Inlining
Dead-code elimination
Escape analysis
Linker elimination
Static linking where possible
```

Do not introduce custom compiler modifications in v0.1.

---

# 18. CGO

Default:

```text
CGO_ENABLED=0
```

where compatible.

Reason:

```text
smaller deployment complexity
static binary
minimal container
predictable deployment
```

However, modules requiring CGO must explicitly declare it.

Example:

```yaml
build:
  cgo: required
```

---

# 19. Binary Output

Recommended:

```text
dist/
└── server
```

Optional:

```text
dist/
├── server
├── build-manifest.json
└── checksums.txt
```

---

# 20. Build Manifest

Example:

```json
{
  "application": "demo-mcp",
  "version": "0.1.0",
  "profile": "production",
  "features": [
    "core",
    "http",
    "jwt",
    "logging"
  ],
  "go_version": "go1.x",
  "framework_version": "0.1.0",
  "commit": "abcdef",
  "feature_lock_hash": "sha256:..."
}
```

---

# 21. Stage 08 — Binary Analysis

After compilation:

```text
binary analyzer
```

must inspect:

```text
binary size
symbols
linked packages
build metadata
```

Optional:

```bash
go tool nm server
```

The analyzer should detect unexpected module symbols where possible.

---

# 22. Unexpected Dependency Detection

Example expected:

```text
core
http
jwt
logging
```

Unexpected:

```text
oauth
otel
prometheus
task
filesystem
```

The build should optionally fail:

```text
UNEXPECTED_MODULE

module:
otel

reason:
module is not part of resolved feature graph
```

---

# 23. Binary Size KPI

Record:

```text
raw binary size
stripped binary size
```

Example:

```text
Build Result

profile: minimal

binary:
  raw:      8.2 MB
  stripped: 5.7 MB
```

Actual values must come from CI measurement.

---

# 24. Stage 09 — Runtime Smoke Test

After build:

```bash
./dist/server
```

Run automated MCP handshake.

Validate:

```text
initialize
capabilities
tool listing
tool invocation
shutdown
```

---

# 25. Minimal Runtime Test

Minimal profile must prove:

```text
server starts
transport works
tool works
disabled features absent
```

---

# 26. Stage 10 — Benchmark

Build pipeline optionally runs:

```bash
mcp-go-core benchmark
```

Measurements:

```text
startup
RSS
latency
throughput
allocations
binary size
```

---

# 27. Build Profiles

Pipeline must support:

```bash
mcp-go-core build --profile=minimal
mcp-go-core build --profile=production
mcp-go-core build --profile=secure
mcp-go-core build --profile=observable
mcp-go-core build --profile=full
```

---

# 28. Minimal Profile

Expected:

```text
Core
One transport
Tools
```

No optional:

```text
Auth
OTel
Metrics
Tasks
External Storage
```

unless explicitly required.

---

# 29. Production Profile

Default:

```text
Core
Selected Transport
Selected Security
Logging
Recovery
```

Application-specific features are inferred.

---

# 30. Secure Profile

Adds:

```text
Authentication
Authorization
Audit
TLS/mTLS where configured
```

---

# 31. Observable Profile

Adds:

```text
Logging
Metrics
Tracing
Diagnostics
```

Only selected providers should be compiled into the application.

---

# 32. Full Profile

Purpose:

```text
Development
Testing
Integration
Framework development
```

This profile intentionally sacrifices minimality for capability.

---

# 33. Build Command

Primary command:

```bash
mcp-go-core build
```

Internal equivalent:

```text
load config
→ analyze
→ resolve
→ lock
→ generate
→ go build
→ verify
```

---

# 34. Build Options

Example:

```bash
mcp-go-core build \
    --profile production \
    --output dist/server \
    --verify \
    --benchmark
```

Supported options:

```text
--profile
--output
--verify
--benchmark
--clean
--verbose
--race
--debug
```

---

# 35. Development Build

Development:

```bash
mcp-go-core build --profile=development
```

May preserve:

```text
debug symbols
verbose logging
development diagnostics
```

---

# 36. Production Build

Production:

```bash
mcp-go-core build --profile=production
```

Should default to:

```text
-trimpath
stripped binary
disabled debug functionality
```

---

# 37. Reproducible Build

Build should be deterministic given:

```text
same source
same Go version
same framework version
same feature lock
same build configuration
```

The output should be reproducible to the extent supported by the Go toolchain and build environment.

---

# 38. Cache

Build system may use:

```text
Go build cache
Feature analysis cache
Code generation cache
```

But cache invalidation must consider:

```text
mcp.yaml
features.lock
source hash
framework version
Go version
generator version
```

---

# 39. Incremental Build

If only application code changes:

```text
Feature Analysis
```

may be skipped if the feature inputs are unchanged.

If:

```text
mcp.yaml
feature registry
profile
framework version
```

changes:

```text
Feature Resolution
```

must run again.

---

# 40. Build Cache Key

Recommended conceptual key:

```text
SHA256(
    source metadata
    +
    mcp.yaml
    +
    feature lock
    +
    framework version
    +
    generator version
    +
    Go version
)
```

---

# 41. Failure Handling

Every pipeline stage must produce actionable errors.

Example:

```text
BUILD FAILED

Stage:
Feature Resolution

Error:
FEATURE_DEPENDENCY_CYCLE

Graph:
oauth → security → auth → oauth
```

Do not return generic:

```text
build failed
```

---

# 42. Build Logging

Default:

```text
INFO
```

Verbose:

```bash
mcp-go-core build --verbose
```

Output:

```text
[1/10] Loading configuration
[2/10] Analyzing application
[3/10] Resolving features
[4/10] Writing feature lock
[5/10] Generating source
[6/10] Building Go binary
[7/10] Inspecting binary
[8/10] Smoke testing
[9/10] Benchmarking
[10/10] Build complete
```

---

# 43. Build Report

Final output:

```text
Build Complete

Application:
  demo-mcp

Profile:
  production

Features:
  enabled: 6
  disabled: 9

Binary:
  dist/server
  size: X MB

Build:
  duration: X ms

Runtime:
  smoke test: PASS

Benchmark:
  startup: X ms
  RSS: X MB
  allocs/op: X
```

---

# 44. CI Mode

Command:

```bash
mcp-go-core build --ci
```

CI mode must:

```text
fail on warnings configured as errors
verify feature lock
verify generated files
verify binary dependencies
run smoke tests
run benchmark gates
```

---

# 45. Feature Lock Verification

CI must reject:

```text
source changed
but feature lock not regenerated
```

Example:

```text
FEATURE_LOCK_OUTDATED

Run:

mcp-go-core analyze
mcp-go-core generate
```

---

# 46. Generated Source Verification

CI can run:

```bash
mcp-go-core generate --check
```

This command must return failure if generated source differs from repository state.

---

# 47. Performance Regression Gate

Benchmark CI must compare against baseline.

Initial default threshold:

```text
10%
```

Example:

```text
P99 latency:
baseline: 42 µs
current:  51 µs

regression: +21%

BUILD FAILED
```

Threshold must be configurable.

---

# 48. Memory Regression

Example:

```text
RSS

baseline:
8.4 MB

current:
10.1 MB

regression:
20.2%

BUILD FAILED
```

---

# 49. Binary Regression

Example:

```text
binary:

baseline:
5.7 MB

current:
8.9 MB

unexpected growth:
56%

BUILD FAILED
```

This is particularly important for detecting accidental dependency inclusion.

---

# 50. Build Dependency Audit

The build system should maintain:

```text
expected modules
actual modules
```

Comparison:

```text
Expected:
core
http
jwt

Actual:
core
http
jwt
otel

Result:
FAIL
```

---

# 51. Runtime Profile vs Build Profile

They are different concepts.

Build Profile:

```text
What gets compiled
```

Runtime Profile:

```text
How compiled components behave
```

Example:

```text
Build:
production

Runtime:
workers=8
timeout=30s
```

Runtime configuration must not reintroduce disabled features.

---

# 52. Build Artifact Layout

Recommended:

```text
dist/
├── server
├── build-manifest.json
├── features.lock
└── checksums.txt
```

Optional debug:

```text
dist/debug/
```

---

# 53. Docker Integration

Optional CLI:

```bash
mcp-go-core docker
```

Generate:

```dockerfile
FROM scratch

COPY dist/server /server

ENTRYPOINT ["/server"]
```

Only if the application supports a fully static binary.

Otherwise generate an appropriate minimal runtime image.

---

# 54. Kubernetes Integration

Optional:

```bash
mcp-go-core deploy --platform=kubernetes
```

Must remain outside Core.

Possible generated resources:

```text
Deployment
Service
ServiceAccount
RBAC
NetworkPolicy
ConfigMap
```

Kubernetes client libraries must NOT enter the MCP binary merely because Kubernetes deployment manifests are generated.

---

# 55. Build Pipeline API

Internal API:

```go
type Pipeline struct {
    Analyzer  Analyzer
    Resolver  Resolver
    Generator Generator
    Builder   Builder
    Verifier  Verifier
}
```

Pipeline:

```go
func (p *Pipeline) Run(
    ctx context.Context,
    cfg Config,
) (*BuildResult, error)
```

---

# 56. Build Result

```go
type BuildResult struct {
    OutputPath    string
    Features      []string
    Modules       []string
    BinarySize    int64
    Duration      time.Duration
    Verification  VerificationResult
}
```

---

# 57. Build Stage Interface

Optional abstraction:

```go
type Stage interface {
    Name() string

    Run(
        context.Context,
        *BuildContext,
    ) error
}
```

Stages:

```text
ConfigStage
AnalyzeStage
ResolveStage
LockStage
GenerateStage
CompileStage
VerifyStage
BenchmarkStage
```

---

# 58. Pipeline Invariants

### BUILD-001

Build cannot proceed if Feature Graph is invalid.

### BUILD-002

Generated code must match resolved features.

### BUILD-003

Disabled features must not be statically composed.

### BUILD-004

Production build must generate a build manifest.

### BUILD-005

Binary verification must be able to detect unexpected dependencies.

### BUILD-006

Build must be reproducible.

### BUILD-007

Performance regression must be detectable.

---

# 59. Acceptance Test

The following must work:

```bash
mcp-go-core init demo

cd demo

mcp-go-core analyze

mcp-go-core generate

mcp-go-core build \
    --profile=minimal \
    --verify

./dist/server
```

Expected:

```text
Feature:
  core
  selected transport

Binary:
  minimal

Runtime:
  MCP handshake PASS
  Tool invocation PASS
```

---

# 60. Full End-to-End Pipeline

```text
                 ┌──────────────┐
                 │   mcp.yaml   │
                 └──────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │    Analyzer   │
                └──────┬────────┘
                       │
                       ▼
                ┌───────────────┐
                │ Feature Graph │
                │   Resolver    │
                └──────┬────────┘
                       │
                       ▼
                ┌───────────────┐
                │ features.lock │
                └──────┬────────┘
                       │
                       ▼
                ┌───────────────┐
                │   Generator   │
                └──────┬────────┘
                       │
                       ▼
              ┌───────────────────┐
              │ Generated Go Code │
              └─────────┬─────────┘
                        │
                        ▼
                ┌───────────────┐
                │   go build     │
                │ compiler/linker│
                └──────┬────────┘
                       │
                       ▼
                ┌───────────────┐
                │    Binary     │
                └──────┬────────┘
                       │
            ┌──────────┼──────────┐
            ▼          ▼          ▼
        Verify      Smoke      Benchmark
            │          │          │
            └──────────┼──────────┘
                       ▼
                Production MCP
```

---

# 61. Critical Architectural Rule

不要把：

```text
Feature Graph
```

做成 runtime feature manager。

錯誤：

```go
type FeatureManager struct {
    enabled map[string]bool
}

func (f *FeatureManager) Enabled(name string) bool
```

然後每個 request 都：

```go
if feature.Enabled("otel") {
    ...
}
```

正確：

```text
Feature Graph
      ↓
Build Generator
      ↓
Static Composition
      ↓
Go Compiler
```

Feature Graph 是 **build system**，不是 runtime system。

---

# 62. Final Build Philosophy

整個 Build Pipeline 最終要達成：

```text
              DEVELOPMENT

        Complete MCP Framework
                  │
                  ▼
           Feature Analysis
                  │
                  ▼
            Feature Graph
                  │
                  ▼
           Dependency Closure
                  │
                  ▼
            Minimal Graph
                  │
                  ▼
          Generated Composition
                  │
                  ▼
              go build
                  │
                  ▼

               PRODUCTION

        ┌─────────────────────┐
        │ Minimal MCP Binary  │
        │                     │
        │ Only required code  │
        │ Only required deps  │
        │ Minimal init        │
        │ Minimal allocations │
        └─────────────────────┘
```

核心原則：

> **不要讓 Runtime 幫你決定哪些功能不用；在 Build Time 就決定哪些功能根本不需要進入 Runtime。**