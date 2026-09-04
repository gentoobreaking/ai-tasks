# mcp-go-core Architecture Specification v0.1

**Project:** mcp-go-core  
**Version:** v0.1  
**Status:** Implementation Ready  
**Language:** Go  
**Primary Goal:** High-performance, low-resource, modular MCP server framework  
**Architecture Principle:** Build Complete, Deploy Minimal

---

# 1. Project Definition

## 1.1 Purpose

`mcp-go-core` is a modular Go framework for building MCP (Model Context Protocol) servers.

The framework must simultaneously provide:

1. Fast MCP application development
2. Complete development-time framework capabilities
3. Compile-time feature selection
4. Automatic enable/disable of unused capabilities
5. Minimal production runtime overhead
6. Low memory consumption
7. High request throughput
8. Low latency
9. Strong type safety
10. Minimal runtime reflection
11. Modular security and observability
12. Deterministic production builds

The framework must **not** become a large runtime framework where every feature is loaded and checked dynamically.

The primary architectural goal is:

```text
Developer Experience
        ↓
Complete Framework
        ↓
Feature Analysis
        ↓
Dependency Resolution
        ↓
Feature Pruning
        ↓
Generated Build Configuration
        ↓
Go Compiler / Linker
        ↓
Minimal MCP Binary
```

---

# 2. Design Principles

## 2.1 Build Complete, Deploy Minimal

Development environment:

```text
Full Framework
├── MCP Protocol
├── Tools
├── Resources
├── Prompts
├── Transport
├── Authentication
├── Authorization
├── Middleware
├── Tasks
├── Sessions
├── Metrics
├── Tracing
├── Logging
├── Storage
├── Testing
├── Mock
├── Fuzzing
└── Developer CLI
```

Production:

```text
Only Required Components
├── MCP Core
├── Streamable HTTP
├── Tools
└── Required Auth
```

Unused components must not be unnecessarily initialized.

Where practical, unused components should also be absent from the final binary through Go package dependency elimination and generated build configuration.

---

## 2.2 Compile-Time First

Feature selection should prefer:

```text
Compile Time
    >
Startup Time
    >
Request Time
```

Avoid:

```go
if config.EnableTracing {
    ...
}
```

inside hot paths when tracing is known at build time.

Prefer build composition:

```text
Build Configuration
      ↓
Generated Go
      ↓
Static Imports
      ↓
Go Compiler
      ↓
Dead Code Elimination
```

---

## 2.3 Zero-Cost Abstraction

Framework abstractions must not introduce significant runtime cost.

Prefer:

```go
type ToolHandler func(
    context.Context,
    Request,
) (Response, error)
```

over generic dynamic dispatch.

Avoid unnecessary:

```go
map[string]interface{}
reflect.Value
reflect.Call
interface{} chains
runtime dependency injection
```

especially inside request execution paths.

---

## 2.4 Typed by Default

The public API should use strongly typed Go structures wherever practical.

Example:

```go
type ToolRequest struct {
    Arguments map[string]any
}
```

is acceptable at the MCP protocol boundary.

Internally, business logic should preferably use typed structures:

```go
type GetPodRequest struct {
    Namespace string
    Name      string
}
```

---

## 2.5 Generated Code Over Runtime Discovery

The framework should use code generation where it improves:

- dispatch performance
- type safety
- startup time
- binary minimization
- static analysis

Example:

```text
tools/
    get_pod.go
    list_pods.go

        ↓

generated/router.go
```

Generated router:

```go
func Dispatch(
    ctx context.Context,
    name string,
    req Request,
) Response {
    switch name {
    case "get_pod":
        return GetPod(ctx, req)

    case "list_pods":
        return ListPods(ctx, req)

    default:
        return UnknownTool(name)
    }
}
```

The generated implementation should be benchmarked against map-based dispatch.

---

# 3. High-Level Architecture

```text
                         ┌─────────────────────┐
                         │     MCP Client      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    MCP Transport    │
                         │ stdio / HTTP / SSE  │
                         └──────────┬──────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────┐
│                     MCP CORE                               │
│                                                            │
│ Protocol │ Router │ Tool │ Resource │ Prompt │ Lifecycle  │
└──────────────────────────┬─────────────────────────────────┘
                           │
             ┌─────────────┼──────────────┐
             ▼             ▼              ▼
        Middleware      Security       Runtime
             │             │              │
        ┌────┴────┐   ┌────┴────┐   ┌─────┴─────┐
        │Logging  │   │Auth     │   │Session    │
        │Recovery │   │JWT      │   │Task       │
        │Metrics  │   │OAuth    │   │Cancel     │
        │Tracing  │   │mTLS     │   │Lifecycle  │
        └─────────┘   └─────────┘   └───────────┘
                           │
                           ▼
                    Application Worker
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
            K8s          Git          API
```

---

# 4. Core Architecture

## 4.1 Core Responsibilities

The Core must contain only functionality required to implement the MCP server execution model.

Core components:

```text
core/
├── protocol
├── server
├── router
├── tool
├── resource
├── prompt
├── request
├── response
├── lifecycle
└── error
```

Core must NOT depend on:

- OAuth
- JWT
- OpenTelemetry
- Prometheus
- external databases
- filesystem storage
- Kubernetes client
- cloud SDKs

---

# 5. Core Components

## 5.1 Server

Primary API:

```go
type Server struct {
    ...
}

func New(opts ...Option) *Server

func (s *Server) AddTool(tool Tool)

func (s *Server) AddResource(resource Resource)

func (s *Server) AddPrompt(prompt Prompt)

func (s *Server) Run(ctx context.Context) error
```

---

## 5.2 Tool

```go
type Tool interface {
    Name() string
    Description() string
    InputSchema() Schema
    Handler() ToolHandler
}
```

Recommended helper:

```go
func NewTool[T any, R any](
    name string,
    description string,
    handler func(context.Context, T) (R, error),
) Tool
```

The generic API is a developer convenience.

The generated/runtime representation should remain efficient.

---

## 5.3 Resource

```go
type Resource interface {
    URI() string
    Name() string
    Description() string
    Read(ctx context.Context, req ResourceRequest) (ResourceResponse, error)
}
```

---

## 5.4 Prompt

```go
type Prompt interface {
    Name() string
    Description() string
    Get(ctx context.Context, req PromptRequest) (PromptResponse, error)
}
```

---

# 6. Module System

Modules represent optional framework capabilities.

## 6.1 Module Categories

```text
Core
Transport
Security
Middleware
Runtime
Observability
Storage
Developer
Integration
```

---

## 6.2 Module Registry

Each module must expose metadata.

Example:

```go
type ModuleDescriptor struct {
    Name         string
    Version      string
    Category     Category
    Dependencies []string
    Features     []string
    Optional     bool
}
```

Example:

```text
module: transport-http
category: transport
dependencies:
  - core
features:
  - streamable-http
optional: true
```

---

# 7. Module Dependency Rules

Dependencies must form a DAG.

Valid:

```text
otel
 └── middleware
      └── core
```

Invalid:

```text
A → B
B → C
C → A
```

The Feature Resolver must reject cyclic dependencies.

Error:

```text
feature dependency cycle detected:
otel → middleware → tracing → otel
```

---

# 8. Feature Graph

The Feature Graph is the central mechanism of mcp-go-core.

## 8.1 Definition

The Feature Graph describes:

```text
Feature
 ├── Dependencies
 ├── Conflicts
 ├── Implied Features
 ├── Build Requirements
 └── Runtime Requirements
```

Example:

```text
streamable-http
    │
    ├── core
    ├── transport
    └── session

jwt
    │
    ├── security
    └── middleware

otel
    │
    ├── tracing
    └── middleware
```

---

# 9. Feature Types

Each feature should have one of the following states:

```text
AUTO
ENABLED
DISABLED
REQUIRED
INFERRED
```

### ENABLED

Explicitly requested by developer.

### DISABLED

Explicitly prohibited.

### REQUIRED

Required by another enabled feature.

### INFERRED

Automatically detected from application usage.

### AUTO

Resolver decides.

---

# 10. Auto Enable / Disable

The framework should automatically infer features from application configuration.

Example:

```yaml
transport:
  type: streamable-http

auth:
  type: jwt

observability:
  tracing: true
```

Resolver:

```text
streamable-http
    ↓
transport-http
    ↓
core

jwt
    ↓
security-jwt
    ↓
security
    ↓
core

tracing
    ↓
otel
    ↓
middleware
    ↓
core
```

Final feature set:

```text
core
transport-http
streamable-http
security
security-jwt
middleware
otel
tracing
```

Unused:

```text
stdio
sse
oauth
prompts
tasks
storage-filesystem
metrics
```

must remain disabled unless required.

---

# 11. Feature Resolution Algorithm

Resolution order:

```text
1. Read mcp.yaml
2. Detect application usage
3. Load explicit features
4. Infer required features
5. Expand dependencies
6. Validate conflicts
7. Remove explicitly disabled features
8. Recalculate dependency closure
9. Generate build configuration
10. Generate source
11. Compile
```

Pseudo-code:

```text
features = explicit_features()

features += detect_application_features()

while dependency_changed:
    features += dependencies(features)

validate_conflicts(features)

features -= disabled_features

validate_required_dependencies(features)

generate_build(features)
```

---

# 12. Feature Configuration

Example:

```yaml
version: "0.1"

profile: production

transport:
  streamable-http: true
  stdio: false
  sse: false

security:
  none: false
  api-key: false
  jwt: true
  oauth: false
  mtls: false

runtime:
  tasks: false
  sessions: true

observability:
  logging: true
  metrics: false
  tracing: false

storage:
  memory: true
  filesystem: false
  external: false
```

---

# 13. Feature Lock

Resolver output:

```text
.mcp/features.lock
```

Example:

```yaml
version: 1

features:
  - core
  - transport-http
  - streamable-http
  - security
  - security-jwt
  - middleware
  - logging

disabled:
  - stdio
  - sse
  - oauth
  - mtls
  - tracing
  - metrics
  - tasks
  - filesystem-storage
```

The lock file exists to make builds reproducible.

---

# 14. Build Pipeline

The build pipeline consists of:

```text
Source
  ↓
Configuration
  ↓
Feature Analyzer
  ↓
Feature Graph Resolver
  ↓
Feature Lock
  ↓
Code Generator
  ↓
Build Manifest
  ↓
Go Build
  ↓
Binary Analyzer
  ↓
Benchmark / Verification
```

---

# 15. Build Analyzer

CLI:

```bash
mcp-go-core analyze
```

Output:

```text
mcp-go-core Feature Analysis

Profile: production

Enabled:
  ✓ core
  ✓ transport-http
  ✓ streamable-http
  ✓ security
  ✓ jwt
  ✓ logging

Disabled:
  ○ stdio
  ○ sse
  ○ oauth
  ○ mtls
  ○ tracing
  ○ metrics
  ○ tasks
  ○ filesystem

Dependency Graph:
  core
   ├── transport-http
   │    └── streamable-http
   ├── security
   │    └── jwt
   └── logging

Result:
  6 enabled
  8 disabled
```

---

# 16. Build Generator

CLI:

```bash
mcp-go-core generate
```

Generated files:

```text
.mcp/generated/
├── features.go
├── modules.go
├── router.go
├── server.go
└── buildinfo.go
```

Generated code should statically import only enabled modules where possible.

---

# 17. Build Command

Developer command:

```bash
mcp-go-core build
```

Equivalent conceptual pipeline:

```bash
mcp-go-core analyze
mcp-go-core generate
go build ...
```

Production build should support:

```bash
go build \
  -trimpath \
  -ldflags="-s -w" \
  ./cmd/server
```

Optimization flags must be configurable and benchmarked.

---

# 18. Build Profiles

Built-in profiles:

```text
development
minimal
production
secure
observable
full
```

---

## 18.1 development

Everything needed for development:

```text
testing
logging
debugging
inspector
mock
fuzzing
all common transports
```

---

## 18.2 minimal

Target:

```text
Core
One transport
Tools
```

No:

```text
OAuth
OTel
Metrics
Persistent storage
Task runtime
```

---

## 18.3 production

Production default:

```text
Core
Required transport
Required security
Logging
Recovery
```

Optional capabilities are inferred.

---

## 18.4 secure

Adds:

```text
Authentication
Authorization
Audit
TLS / mTLS where required
Security middleware
```

---

## 18.5 observable

Adds:

```text
Metrics
Tracing
Structured logging
Health diagnostics
```

---

## 18.6 full

Enables the complete framework for development and integration testing.

---

# 19. Runtime Profile

Runtime Profile defines behavior that cannot or should not be decided entirely at compile time.

Example:

```yaml
runtime:
  workers: auto
  max_connections: 100
  request_timeout: 30s
  shutdown_timeout: 10s
```

Runtime configuration must not cause unnecessary initialization of disabled modules.

---

# 20. Runtime Initialization

Startup sequence:

```text
Process Start
    ↓
Load Build Manifest
    ↓
Initialize Core
    ↓
Initialize Enabled Transport
    ↓
Initialize Enabled Security
    ↓
Initialize Enabled Middleware
    ↓
Initialize Application
    ↓
Start MCP Server
```

Disabled modules must not execute initialization code.

---

# 21. Request Processing Pipeline

Minimal:

```text
Transport
   ↓
Protocol Decode
   ↓
Router
   ↓
Tool
   ↓
Response Encode
```

With security:

```text
Transport
   ↓
Protocol Decode
   ↓
Authentication
   ↓
Authorization
   ↓
Router
   ↓
Tool
   ↓
Response Encode
```

With observability:

```text
Transport
   ↓
Tracing
   ↓
Authentication
   ↓
Authorization
   ↓
Router
   ↓
Tool
   ↓
Metrics
   ↓
Response
```

The actual generated pipeline should contain only enabled stages.

---

# 22. Middleware

Middleware API:

```go
type Middleware func(Handler) Handler
```

Example:

```go
server.Use(
    Recovery(),
    Logging(),
    Auth(),
)
```

The framework should preserve middleware order.

For production builds, disabled middleware should not result in runtime branches.

---

# 23. Transport API

Common interface:

```go
type Transport interface {
    Serve(ctx context.Context, handler Handler) error
}
```

Implementations:

```text
transport-stdio
transport-http
transport-sse
```

Each transport must be independently buildable.

Example:

```go
server := mcp.New(
    mcp.WithTransport(http.New()),
)
```

---

# 24. Security API

Security must be modular.

```text
security-none
security-api-key
security-jwt
security-oauth
security-mtls
```

Interface:

```go
type Authenticator interface {
    Authenticate(
        context.Context,
        Request,
    ) (Identity, error)
}
```

Authorization:

```go
type Authorizer interface {
    Authorize(
        context.Context,
        Identity,
        Tool,
    ) error
}
```

Security implementation must not be coupled to the Core.

---

# 25. Observability API

Observability modules:

```text
logging
metrics
tracing
audit
```

Interfaces:

```go
type Logger interface {
    Debug(...)
    Info(...)
    Warn(...)
    Error(...)
}
```

Telemetry providers must be replaceable.

Core must not directly depend on OpenTelemetry.

---

# 26. Storage API

Storage is optional.

Interface:

```go
type Store interface {
    Get(ctx context.Context, key string) ([]byte, error)
    Set(ctx context.Context, key string, value []byte) error
    Delete(ctx context.Context, key string) error
}
```

Implementations:

```text
memory
filesystem
external
```

No storage dependency should enter the binary unless enabled.

---

# 27. Task Runtime

Task support must be isolated from the Core.

```text
runtime-task
```

Only applications requiring MCP Tasks should enable it.

Task runtime should include:

```text
Task creation
Task execution
Task status
Cancellation
Cleanup
```

---

# 28. Session Runtime

Session support:

```text
runtime-session
```

Possible implementations:

```text
memory-session
external-session
```

Session storage should not be required for stateless MCP servers.

---

# 29. CLI

Primary CLI:

```bash
mcp-go-core init
mcp-go-core analyze
mcp-go-core generate
mcp-go-core build
mcp-go-core test
mcp-go-core benchmark
mcp-go-core doctor
mcp-go-core overview
mcp-go-core clean
```

---

# 30. `init`

Command:

```bash
mcp-go-core init my-server
```

Generate:

```text
my-server/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   └── tools/
├── mcp.yaml
├── go.mod
└── README.md
```

---

# 31. `overview`

Command:

```bash
mcp-go-core overview
```

Example:

```text
mcp-go-core
──────────────────────────────

Profile: production

Core
  ✓ Protocol
  ✓ Router
  ✓ Tool
  ✓ Resource

Transport
  ✓ Streamable HTTP
  ○ STDIO
  ○ SSE

Security
  ✓ JWT
  ○ OAuth
  ○ mTLS

Runtime
  ○ Tasks
  ✓ Sessions

Observability
  ✓ Logging
  ○ Metrics
  ○ Tracing

Storage
  ✓ Memory
  ○ Filesystem
  ○ External

Build
  Enabled modules: 8
  Disabled modules: 11
```

---

# 32. `doctor`

Command:

```bash
mcp-go-core doctor
```

Must validate:

```text
Go version
Configuration
Feature graph
Dependency cycles
Missing dependencies
Conflicting features
Generated code
Build configuration
Transport configuration
Security configuration
```

---

# 33. Directory Structure

Recommended repository structure:

```text
mcp-go-core/
│
├── cmd/
│   └── mcp-go-core/
│       └── main.go
│
├── core/
│   ├── protocol/
│   ├── server/
│   ├── router/
│   ├── tool/
│   ├── resource/
│   ├── prompt/
│   ├── request/
│   ├── response/
│   ├── lifecycle/
│   └── error/
│
├── modules/
│   ├── transport/
│   │   ├── stdio/
│   │   ├── http/
│   │   └── sse/
│   │
│   ├── security/
│   │   ├── api_key/
│   │   ├── jwt/
│   │   ├── oauth/
│   │   └── mtls/
│   │
│   ├── middleware/
│   │   ├── logging/
│   │   ├── recovery/
│   │   ├── metrics/
│   │   └── tracing/
│   │
│   ├── runtime/
│   │   ├── task/
│   │   └── session/
│   │
│   ├── storage/
│   │   ├── memory/
│   │   ├── filesystem/
│   │   └── external/
│   │
│   └── observability/
│       ├── logging/
│       ├── metrics/
│       └── tracing/
│
├── internal/
│   ├── featuregraph/
│   ├── analyzer/
│   ├── generator/
│   ├── resolver/
│   ├── builder/
│   └── manifest/
│
├── templates/
│
├── examples/
│   ├── minimal/
│   ├── http/
│   ├── secure/
│   └── observable/
│
├── benchmarks/
│   ├── protocol/
│   ├── router/
│   ├── transport/
│   ├── memory/
│   └── startup/
│
├── tests/
│   ├── integration/
│   ├── featuregraph/
│   └── build/
│
├── docs/
│
├── go.mod
├── mcp.yaml
├── Makefile
└── README.md
```

---

# 34. Dependency Architecture

Strict dependency direction:

```text
CLI
 ↓
Builder
 ↓
Feature Resolver
 ↓
Generator
 ↓
Application
 ↓
Modules
 ↓
Core
```

Core must never depend upward.

Invalid:

```text
core → jwt
core → otel
core → kubernetes
core → cli
```

Valid:

```text
jwt → core
otel → core
kubernetes integration → core
cli → analyzer
```

---

# 35. Application / Framework Separation

Application code:

```text
cmd/
internal/tools/
```

Framework code:

```text
core/
modules/
internal/
```

Application developers should not need to understand Feature Graph internals to build an MCP server.

Example:

```go
func main() {
    server := mcp.New()

    server.AddTool(
        tools.GetPod(),
    )

    server.Run(context.Background())
}
```

Framework complexity should remain behind the CLI and generator.

---

# 36. Generated Application Layer

Recommended generated structure:

```text
.mcp/
├── features.lock
├── manifest.json
└── generated/
    ├── router.go
    ├── modules.go
    └── buildinfo.go
```

`.mcp/` should be treated as generated artifacts.

Applications should not manually edit generated files.

---

# 37. Binary Optimization

Production build should optimize for:

```text
Binary Size
Startup Time
RSS
Heap Allocation
CPU
Latency
Throughput
```

Recommended baseline:

```bash
go build -trimpath
```

Optional production:

```bash
go build -trimpath -ldflags="-s -w"
```

Do not introduce compression tools such as UPX as a mandatory optimization.

Optimization must be based on benchmark evidence.

---

# 38. Reflection Policy

Default policy:

```text
Reflection prohibited in hot path.
```

Allowed:

```text
Protocol boundary
Schema generation
Development tooling
CLI
Code generation
```

Not preferred:

```text
Tool dispatch
Request routing
Authentication hot path
Middleware execution
```

---

# 39. Generic / Reflection Boundary

The framework may expose developer-friendly APIs such as:

```go
NewTool[T, R](...)
```

but generated code should convert this into efficient execution paths.

Target architecture:

```text
Developer API
      ↓
Generic / Type-safe Layer
      ↓
Generated Adapter
      ↓
Typed Runtime Handler
```

---

# 40. Error Model

Errors must be structured.

```go
type Error struct {
    Code    string
    Message string
    Cause   error
}
```

Errors should support:

```text
Protocol error
Validation error
Authentication error
Authorization error
Transport error
Tool error
Internal error
Timeout
Cancellation
```

Avoid leaking internal errors to MCP clients unless configured.

---

# 41. Lifecycle

Lifecycle:

```text
Create
  ↓
Configure
  ↓
Initialize
  ↓
Start
  ↓
Running
  ↓
Shutdown
  ↓
Cleanup
```

Support:

```go
context.Context
```

for cancellation.

Shutdown must be graceful.

---

# 42. Concurrency

Go concurrency must follow:

```text
Context-driven cancellation
Bounded resources
No unbounded goroutine creation
No goroutine leaks
```

Each module must document:

```text
goroutine usage
memory usage
connection usage
background workers
shutdown behavior
```

---

# 43. Runtime Diagnostics

Optional diagnostic endpoint / command:

```bash
server --diagnose
```

Output:

```text
Runtime Diagnostics

Version: 0.1.0
Go: go1.xx
Profile: production

Transport:
  streamable-http

Security:
  jwt

Tools:
  12

Resources:
  3

Prompts:
  0

Tasks:
  disabled

Tracing:
  disabled

Metrics:
  disabled

Storage:
  memory

Goroutines:
  8

Heap:
  4.2 MB
```

Diagnostic functionality itself should be optional.

---

# 44. Benchmark Architecture

Benchmarks must be first-class project artifacts.

Run:

```bash
mcp-go-core benchmark
```

Benchmark categories:

```text
Protocol
Router
Tool Dispatch
Transport
Authentication
Middleware
Startup
Memory
Binary Size
Concurrency
```

---

# 45. Benchmark Baselines

At minimum compare:

```text
A. Raw Go MCP implementation
B. mcp-go-core minimal
C. mcp-go-core production
D. mcp-go-core full
```

Optional:

```text
E. mark3labs/mcp-go equivalent implementation
```

The comparison must use equivalent functionality.

---

# 46. KPI

KPI must be measured rather than assumed.

## 46.1 Latency

Target:

```text
Minimal Tool Dispatch:
P50 < 10 µs
P99 < 100 µs
```

These are initial engineering targets, not guaranteed values.

---

## 46.2 Throughput

Target:

```text
> 100k requests/sec
```

for a synthetic in-process benchmark where transport and tool logic are not the bottleneck.

Actual network benchmark must be measured separately.

---

## 46.3 Memory

Minimal server target:

```text
RSS < 20 MB
```

after startup for a simple synthetic service.

Production target:

```text
RSS < 30 MB
```

before application-specific dependencies.

These are baseline goals and must be validated on a fixed environment.

---

## 46.4 Startup

Target:

```text
process start → ready < 50 ms
```

for minimal configuration.

Measure separately:

```text
cold start
warm start
with security
with observability
```

---

## 46.5 Binary Size

Measure:

```text
minimal
production
secure
observable
full
```

Example KPI format:

```text
Profile       Binary
-------------------------
minimal       X MB
production    X MB
secure        X MB
observable    X MB
full          X MB
```

Do not hard-code a size target until baseline measurements exist.

---

# 47. Allocation KPI

Tool dispatch benchmark should report:

```text
ns/op
B/op
allocs/op
```

Target:

```text
Minimal direct tool dispatch:
allocs/op ≈ 0
```

where technically achievable.

---

# 48. Build KPI

Feature optimization must be measurable.

Example:

```text
Configured Features: 20
Required Features:   8
Disabled Features:  12

Generated Packages:  8
```

Build report:

```text
Feature Reduction:
60%

Runtime Modules:
8 / 20
```

Binary reduction should be measured independently.

---

# 49. Benchmark Matrix

Every release should test:

| Profile | Tools | Auth | OTel | Tasks | Expected |
|---|---:|---|---|---|---|
| minimal | 1 | none | no | no | lowest resource |
| minimal | 10 | none | no | no | routing scalability |
| production | 10 | JWT | no | no | security overhead |
| observable | 10 | JWT | yes | no | observability overhead |
| full | 10 | JWT | yes | yes | maximum feature set |

---

# 50. Performance Regression Gate

CI must fail when:

```text
P99 latency regression > threshold
RSS regression > threshold
allocations regression > threshold
binary size regression > threshold
startup regression > threshold
```

Initial threshold:

```text
10%
```

should be configurable.

---

# 51. Feature Graph Tests

Tests must verify:

### Dependency

```text
JWT → security → core
```

### Conflict

```text
stdio + incompatible transport configuration
```

### Disabled feature

```text
tracing=false
```

must not initialize tracing.

### Transitive dependency

```text
streamable-http
```

must automatically enable required dependencies.

### Cycle

```text
A → B → C → A
```

must fail.

---

# 52. Build Verification

CI must build multiple configurations:

```bash
mcp-go-core build --profile=minimal
mcp-go-core build --profile=production
mcp-go-core build --profile=secure
mcp-go-core build --profile=observable
mcp-go-core build --profile=full
```

Each build must execute tests.

---

# 53. Binary Inspection

CI should optionally inspect:

```bash
go tool nm
```

and binary metadata.

The goal is to detect unexpected dependencies.

Example:

```text
minimal binary
Expected:
  core
  http

Unexpected:
  otel
  oauth
  prometheus
```

This should be treated as a build regression.

---

# 54. Reproducible Build

Production builds should record:

```text
Framework version
Go version
Git commit
Feature lock hash
Build timestamp
Build profile
```

Prefer deterministic timestamps where possible.

Build manifest:

```json
{
  "version": "0.1.0",
  "profile": "production",
  "feature_lock": "sha256:...",
  "commit": "...",
  "go_version": "..."
}
```

---

# 55. Security Requirements

Security modules must follow:

```text
Secure by configuration
Minimal by dependency
No unnecessary credentials
No secret logging
Context-aware authorization
```

Authentication and authorization must be separable.

Example:

```text
JWT Authentication
       ↓
Identity
       ↓
Authorization Policy
       ↓
Tool
```

---

# 56. Kubernetes Integration

Kubernetes support should NOT be part of Core.

Optional module:

```text
integration-kubernetes
```

Example:

```go
k8s.NewClient(...)
```

This prevents Kubernetes client libraries from entering minimal MCP binaries.

Optional CLI support:

```bash
mcp-go-core init --platform=kubernetes
```

can generate:

```text
deploy/
├── deployment.yaml
├── service.yaml
├── serviceaccount.yaml
└── networkpolicy.yaml
```

---

# 57. Developer Experience

The framework should make the simplest application extremely small.

Target:

```go
func main() {
    s := mcp.New()

    s.AddTool(
        mcp.Tool(
            "hello",
            "Return greeting",
            hello,
        ),
    )

    s.Run(context.Background())
}
```

A developer should not need to understand:

```text
Feature Graph
Build Generator
Module Resolver
Dependency Graph
```

unless customization is required.

---

# 58. Advanced Developer Workflow

Recommended workflow:

```bash
mcp-go-core init my-server

cd my-server

mcp-go-core overview

# implement tools

mcp-go-core analyze

mcp-go-core generate

mcp-go-core test

mcp-go-core benchmark

mcp-go-core build --profile=production
```

---

# 59. Architecture Quality Rules

The implementation must enforce:

### Rule 1

Core cannot import optional modules.

### Rule 2

Optional modules can depend on Core.

### Rule 3

Optional modules cannot introduce hidden global initialization.

### Rule 4

Disabled modules must not initialize.

### Rule 5

Hot paths should avoid reflection.

### Rule 6

Hot paths should avoid unnecessary allocations.

### Rule 7

Dynamic discovery should be replaced with generated/static dispatch where practical.

### Rule 8

Every major module must have an independent benchmark.

### Rule 9

Every performance optimization must have a benchmark.

### Rule 10

Framework convenience must not become mandatory runtime overhead.

---

# 60. Implementation Phases

## Phase 1 — Kernel

Implement:

```text
core
protocol
server
tool
resource
prompt
router
lifecycle
```

Acceptance:

```text
A basic MCP server can run.
```

---

## Phase 2 — Module System

Implement:

```text
ModuleDescriptor
Module Registry
Module Dependencies
```

Acceptance:

```text
Modules can be independently enabled.
```

---

## Phase 3 — Feature Graph

Implement:

```text
Feature
Dependency
Conflict
Resolver
Lock file
```

Acceptance:

```text
Feature dependency graph resolves deterministically.
```

---

## Phase 4 — CLI

Implement:

```bash
init
overview
analyze
doctor
```

Acceptance:

```text
Developer can inspect the complete framework.
```

---

## Phase 5 — Code Generation

Implement:

```text
generate
generated router
generated module composition
```

Acceptance:

```text
Generated application builds without unused modules.
```

---

## Phase 6 — Build Pipeline

Implement:

```bash
build
```

Pipeline:

```text
analyze
→ resolve
→ generate
→ go build
```

Acceptance:

```text
production binary is generated from feature set.
```

---

## Phase 7 — Performance

Implement:

```text
benchmark
benchmark CI
binary inspection
memory benchmark
startup benchmark
```

Acceptance:

```text
Performance baseline established.
```

---

## Phase 8 — Optional Modules

Implement incrementally:

```text
stdio
streamable-http
sse
logging
recovery
JWT
API Key
metrics
tracing
tasks
sessions
storage
```

Do NOT implement every module before the Feature Graph and Build Pipeline are stable.

---

# 61. v0.1 Scope

v0.1 MUST include:

```text
✓ Core MCP server
✓ Tools
✓ Resources
✓ Prompts
✓ At least one transport
✓ Module abstraction
✓ Feature Graph
✓ Dependency resolution
✓ Feature lock
✓ Auto enable/disable
✓ CLI
✓ Code generation
✓ Production build
✓ Benchmark framework
✓ Build verification
```

v0.1 SHOULD NOT require:

```text
OAuth
Tasks
External storage
Kubernetes integration
Advanced telemetry
Cloud-specific integrations
```

These are modular extensions.

---

# 62. v0.1 Definition of Done

The project is considered v0.1 complete when the following scenario works:

```bash
mcp-go-core init demo

cd demo

# developer implements one tool

mcp-go-core analyze

mcp-go-core generate

mcp-go-core test

mcp-go-core benchmark

mcp-go-core build --profile=minimal
```

Result:

```text
demo-server
```

must:

1. Start successfully
2. Expose MCP capability
3. Execute the tool
4. Have no unnecessary optional runtime modules
5. Pass protocol tests
6. Pass feature graph tests
7. Pass benchmark tests
8. Produce a build manifest
9. Report enabled features
10. Be smaller/lighter than the equivalent full framework configuration

---

# 63. Target Architecture

Final intended architecture:

```text
                    ┌──────────────────────┐
                    │     Developer        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   mcp-go-core CLI    │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼─────────────┐
                 ▼             ▼             ▼
             Analyzer       Generator      Builder
                 │             │             │
                 └──────┬──────┴─────────────┘
                        ▼
                 Feature Graph
                        │
                        ▼
                 Feature Lock
                        │
                        ▼
              Generated Go Composition
                        │
                        ▼
                 Go Compiler/Linker
                        │
                        ▼
              ┌─────────────────────┐
              │ Minimal MCP Binary │
              └──────────┬──────────┘
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
          Transport   Security   Middleware
             │           │           │
             └───────────┼───────────┘
                         ▼
                    MCP Core
                         │
                         ▼
                    Application
                         │
                         ▼
                 Worker / Backend
```

---

# 64. Fundamental Success Metric

The framework should not be judged by:

```text
How many features it has.
```

It should be judged by:

```text
How much development capability it provides
+
How little runtime overhead remains
```

Therefore the primary optimization equation is:

```text
Developer Capability
────────────────────────────
Runtime Complexity
```

The objective is to maximize this ratio.

---

# 65. Project Slogan

Recommended project statement:

> **mcp-go-core — Build Complete. Deploy Minimal.**

Secondary statement:

> **A modular, compile-time optimized Go framework for high-performance MCP services.**

---

# 66. Non-Goals

mcp-go-core is NOT intended to become:

```text
❌ An AI Agent runtime
❌ An LLM framework
❌ A workflow engine
❌ A general dependency injection framework
❌ A Kubernetes operator
❌ A cloud abstraction layer
❌ A mandatory observability stack
❌ A mandatory authentication framework
```

The framework provides MCP capabilities.

Application intelligence belongs outside the MCP runtime.

---

# 67. Architectural Boundary

The final conceptual boundary is:

```text
                 AI / Agent Layer
                        │
                        │ MCP
                        ▼
              ┌───────────────────┐
              │   mcp-go-core     │
              │                   │
              │ Protocol          │
              │ Transport         │
              │ Security          │
              │ Routing            │
              │ Capability        │
              └─────────┬─────────┘
                        │
                        ▼
                 Worker / API / K8s
```

The MCP server should remain a **high-performance capability execution layer**, not become the agent itself.

---

# 68. Final Architecture Principle

The complete architecture can be summarized as:

```text
FULL DEVELOPMENT FRAMEWORK
            ↓
      FEATURE ANALYSIS
            ↓
     DEPENDENCY GRAPH
            ↓
      AUTO ENABLE/DISABLE
            ↓
       CODE GENERATION
            ↓
       STATIC COMPOSITION
            ↓
       GO COMPILER/LINKER
            ↓
    ┌──────────────────────┐
    │ Minimal MCP Runtime  │
    │                      │
    │ Low CPU              │
    │ Low Memory           │
    │ Low Allocation       │
    │ Low Latency          │
    │ High Throughput      │
    └──────────────────────┘
```

**Core principle:**

> **Framework complexity belongs primarily in development and build time, not in the production request path.**