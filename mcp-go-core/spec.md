# mcp-go-core Specification

**Project:** mcp-go-core  
**Version:** v0.1  
**Status:** Implementation Ready  
**Language:** Go  
**Primary Goal:** High-performance, low-resource, modular MCP server framework  
**Architecture Principle:** Build Complete, Deploy Minimal

---

# 1. Purpose

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

**Core architectural goal:**

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

Development environment provides the Full Framework; Production uses only Required Components.

Unused components must not be unnecessarily initialized. Where practical, unused components should also be absent from the final binary through Go package dependency elimination and generated build configuration.

## 2.2 Compile-Time First

Feature selection should prefer: Compile Time > Startup Time > Request Time.

Avoid runtime conditionals like `if config.EnableTracing { ... }` inside hot paths when tracing is known at build time.

Prefer build composition: Build Configuration → Generated Go → Static Imports → Go Compiler → Dead Code Elimination.

## 2.3 Zero-Cost Abstraction

Framework abstractions must not introduce significant runtime cost. Prefer typed function signatures over generic dynamic dispatch. Avoid unnecessary `map[string]interface{}`, `reflect.Value`, `reflect.Call`, `interface{}` chains, and runtime dependency injection — especially inside request execution paths.

## 2.4 Typed by Default

The public API should use strongly typed Go structures wherever practical. At the MCP protocol boundary, `map[string]any` is acceptable. Internally, business logic should use typed structures.

## 2.5 Generated Code Over Runtime Discovery

The framework should use code generation where it improves dispatch performance, type safety, startup time, binary minimization, and static analysis.

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

Core must NOT depend on: OAuth, JWT, OpenTelemetry, Prometheus, external databases, filesystem storage, Kubernetes client, cloud SDKs.

## 4.2 Core Interfaces

### Server
```go
type Server struct { ... }
func New(opts ...Option) *Server
func (s *Server) AddTool(tool Tool)
func (s *Server) AddResource(resource Resource)
func (s *Server) AddPrompt(prompt Prompt)
func (s *Server) Run(ctx context.Context) error
```

### Tool
```go
type Tool interface {
    Name() string
    Description() string
    InputSchema() Schema
    Handler() ToolHandler
}
```

### Resource
```go
type Resource interface {
    URI() string
    Name() string
    Description() string
    Read(ctx context.Context, req ResourceRequest) (ResourceResponse, error)
}
```

### Prompt
```go
type Prompt interface {
    Name() string
    Description() string
    Get(ctx context.Context, req PromptRequest) (PromptResponse, error)
}
```

## 4.3 Module System

Modules represent optional framework capabilities. Categories: Core, Transport, Security, Middleware, Runtime, Observability, Storage, Developer, Integration.

Each module must expose a `ModuleDescriptor` with Name, Version, Category, Features, Dependencies, Package, RuntimeInit.

Dependencies must form a DAG. The Feature Resolver must reject cyclic dependencies.

## 4.4 Feature Graph

The Feature Graph describes: Feature → Dependencies, Conflicts, Implied Features, Build Requirements, Runtime Requirements.

Feature states: AUTO, ENABLED, DISABLED, REQUIRED, INFERRED.

## 4.5 Feature Resolution Order

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

### Priority
```text
REQUIRED > EXPLICIT DISABLE > EXPLICIT ENABLE > INFERRED > AUTO
```
`DISABLED` does not override a true HARD dependency — must error instead.

## 4.6 Build Pipeline

```text
Source → Configuration → Feature Analyzer → Feature Graph Resolver → Feature Lock
→ Code Generator → Build Manifest → Go Build → Binary Analyzer → Benchmark / Verification
```

Generated files: `.mcp/generated/features.go`, `modules.go`, `router.go`, `server.go`, `buildinfo.go`.

## 4.7 Static Composition

Generated source should only reference selected modules. No umbrella imports (`"all/modules"`). The actual optimization mechanism is: Static imports + Generated composition + Go compiler dead-code elimination.

## 4.8 Directory Structure

```text
mcp-go-core/
├── cmd/mcp-go-core/
├── core/
│   ├── protocol/ server/ router/ tool/ resource/ prompt/
│   ├── request/ response/ lifecycle/ error/
├── modules/
│   ├── transport/ {stdio, http, sse}
│   ├── security/ {api_key, jwt, oauth, mtls}
│   ├── middleware/ {logging, recovery, metrics, tracing}
│   ├── runtime/ {task, session}
│   ├── storage/ {memory, filesystem, external}
│   └── observability/ {logging, metrics, tracing}
├── internal/
│   ├── featuregraph/ analyzer/ generator/ resolver/ builder/ manifest/
├── templates/
├── examples/
├── benchmarks/
├── tests/
├── docs/
├── go.mod, mcp.yaml, Makefile, README.md
```

## 4.9 Dependency Architecture

Strict direction: Application → Modules → Core. Core must never depend upward.

## 4.10 CLI

Commands: init, analyze, generate, build, test, benchmark, doctor, overview, clean.

## 4.11 Error Model

Errors must be structured with Code, Message, and Cause. Support: Protocol error, Validation error, Authentication error, Authorization error, Transport error, Tool error, Internal error, Timeout, Cancellation.

## 4.12 Lifecycle

Create → Configure → Initialize → Start → Running → Shutdown → Cleanup. Support `context.Context` for cancellation. Shutdown must be graceful.

## 4.13 Concurrency

Context-driven cancellation, bounded resources, no unbounded goroutine creation, no goroutine leaks.

---

# 5. Feature List

## F1–F10: Core Features
- **F1** Core MCP protocol server
- **F2** Tool registration and dispatch
- **F3** Resource registration and dispatch
- **F4** Prompt registration and dispatch
- **F5** Request/Response typed structures
- **F6** Structured error model
- **F7** Server lifecycle management
- **F8** Router for tool/resource/prompt dispatch
- **F9** Context-driven concurrency
- **F10** Graceful shutdown

## F11–F20: Transport Features
- **F11** stdio transport
- **F12** Streamable HTTP transport
- **F13** SSE transport
- **F14** Transport interface abstraction

## F21–F30: Security Features
- **F21** Security module abstraction
- **F22** API Key authentication
- **F23** JWT authentication
- **F24** OAuth authentication
- **F25** mTLS authentication

## F31–F40: Middleware & Observability
- **F31** Logging middleware
- **F32** Recovery middleware
- **F33** Metrics middleware
- **F34** Tracing middleware
- **F35** Middleware ordering

## F41–F50: Runtime Features
- **F41** Task runtime
- **F42** Session runtime
- **F43** Memory storage
- **F44** Filesystem storage
- **F45** External storage

## F51–F60: Feature Graph
- **F51** Feature descriptor definition
- **F52** Module descriptor definition
- **F53** Feature registry
- **F54** Graph validation (cycles, conflicts, duplicates)
- **F55** Dependency resolution (transitive, implies)
- **F56** Explicit disable validation
- **F57** Feature lock generation
- **F58** Deterministic resolution

## F61–F70: Build Pipeline
- **F61** Configuration loading (mcp.yaml)
- **F62** Application analysis
- **F63** Feature resolution
- **F64** Code generation
- **F65** Static composition
- **F66** Go compilation with optimization flags
- **F67** Build manifest generation
- **F68** Binary analysis
- **F69** Runtime smoke test
- **F70** Benchmark execution

## F71–F80: CLI & Docs
- **F71** CLI skeleton with all commands
- **F72** `init` command
- **F73** `analyze` command
- **F74** `generate` command
- **F75** `build` command
- **F76** `doctor` command
- **F77** `overview` command
- **F78** README documentation
- **F79** Architecture documentation
- **F80** Example documentation

---

# 6. Non-Goals

v0.1 does NOT implement:
- AI Agent Runtime
- LLM orchestration
- Workflow Engine
- Kubernetes Operator
- Cloud Abstraction
- Distributed Scheduler
- Mandatory OpenTelemetry
- Mandatory Authentication
- Custom Go Compiler
- Custom Linker

These are modular extensions.

---

# 7. Delayed / Optional Features (v2+)

The following features are marked for later phases and will be tracked as conditional tasks:

- **F24** OAuth authentication
- **F41** Task runtime
- **F44** Filesystem storage
- **F45** External storage
- **F41** Session runtime (external implementation)
- **F33** Metrics middleware
- **F34** Tracing middleware
- **F13** SSE transport
- Kubernetes integration module
- Cloud-specific integrations

---

# 8. External Dependencies

For v0.1, no external dependencies are required for the core build pipeline. The project will integrate a mature Go MCP implementation library (to be selected) rather than reimplementing the protocol from scratch.

---

# 9. Module Tree

```text
core/
├── protocol/   F1, F5
├── server/     F1, F7
├── router/     F8
├── tool/       F2
├── resource/   F3
├── prompt/     F4
├── request/    F5
├── response/   F5
├── lifecycle/  F7
└── error/      F6

modules/transport/stdio/      F11, F14
modules/transport/http/       F12, F14
modules/transport/sse/        F13, F14  [deferred]
modules/security/api_key/     F22, F21
modules/security/jwt/         F23, F21
modules/security/oauth/       F24, F21  [deferred]
modules/security/mtls/        F25, F21  [deferred]
modules/middleware/logging/   F31, F35
modules/middleware/recovery/  F32, F35
modules/middleware/metrics/   F33, F35  [deferred]
modules/middleware/tracing/   F34, F35  [deferred]
modules/runtime/task/         F41  [deferred]
modules/runtime/session/      F42  [deferred]
modules/storage/memory/       F43
modules/storage/filesystem/   F44  [deferred]
modules/storage/external/     F45  [deferred]
modules/observability/logging/   F31
modules/observability/metrics/   F33  [deferred]
modules/observability/tracing/   F34  [deferred]

internal/featuregraph/   F51-F58
internal/analyzer/       F62
internal/generator/      F64-F66
internal/builder/        F61, F67-F69
internal/manifest/       F67, F68
```

## Algorithm Specification File Index (Task Decomposition Required Reading)

| Algorithm File | Corresponding Feature | Corresponding Module | Corresponding Task |
|---|---|---|---|
| [algs/feature-resolution.md](algs/feature-resolution.md) | F55 | internal/featuregraph | **T018** |
| [algs/cycle-detection.md](algs/cycle-detection.md) | F54 | internal/featuregraph | **T019** |
| [algs/conflict-validation.md](algs/conflict-validation.md) | F54 | internal/featuregraph | **T019** |
| [algs/explicit-disable.md](algs/explicit-disable.md) | F56 | internal/featuregraph | **T020** |
| [algs/feature-lock.md](algs/feature-lock.md) | F57, F58 | internal/featuregraph | **T021** |
| [algs/static-composition.md](algs/static-composition.md) | F65 | internal/generator | **T032** |
| [algs/code-generation.md](algs/code-generation.md) | F64 | internal/generator | **T030** |
| [algs/build-pipeline.md](algs/build-pipeline.md) | F61-F69 | internal/builder | **T038** |
| [algs/binary-analysis.md](algs/binary-analysis.md) | F68 | internal/builder | **T041, T048, T049** |
| [algs/transport-stdio.md](algs/transport-stdio.md) | F11 | modules/transport/stdio | **T010** |

### Supporting Tasks (No independent algorithm file but required)
- **T001** Initialize Go Module
- **T002** CLI Skeleton
- **T003** Example Application
- **T004** Core Protocol Types
- **T005** Tool API
- **T006** Resource API
- **T007** Prompt API
- **T008** Router
- **T009** Server Lifecycle
- **T010** Stdio Transport Module
- **T011** HTTP Transport Module
- **T012** API Key Security Module
- **T013** JWT Security Module
- **T014** Middleware Contract
- **T015** Module Boundary
- **T016** Feature/Module Descriptors
- **T022** Module Descriptor
- **T023** Module Descriptor (detailed)
- **T024** Feature Registry
- **T025** Dependency Closure Verification
- **T026** Application Analyzer
- **T027** Generated Metadata Analyzer
- **T028** Known API Usage Analyzer
- **T029** Go AST Analyzer
- **T030** Generator Interface and Static Composition
- **T031** Generated Features Constants
- **T032** Static Module Composition Implementation
- **T033** Generated Server
- **T034** Generated Router
- **T035** Generated Modules Composition
- **T036** Generated Build Info
- **T037** Generated Code Staleness Check
- **T038** Build Pipeline Interface
- **T039** Pipeline Stages Implementation
- **T040** Build Manifest
- **T041** Binary Audit (Metadata Reader + Module Verification)
- **T042** Config Stage
- **T043** Compile Stage
- **T044** Verify Stage
- **T045** Benchmark Stage
- **T046** Error Propagation
- **T047** Build Manifest Generation
- **T048** Binary Metadata Reader
- **T049** Expected/Unexpected Module Verification
- **T050** CLI Doctor Command
- **T051** Smoke Test
- **T052** Profile Verification
- **T053** Runtime Feature Graph Check
- **T054** Binary Regression
- **T055** Dispatch Benchmark
- **T056** Startup and Memory Benchmark
- **T057** Performance Regression Gate
- **T058** Reproducible Build
- **T059** Verification Report
- **T060** CI Full Test
- **T061** Build Verification
- **T062** Feature Lock Check
- **T063** Profile Matrix CI
- **T064** Negative Tests
- **T065** Verify Command
- **T066** README
- **T067** Architecture Docs
- **T068** Final Verification

---

# 10. Dependency Graph

```text
T001 (init module)
  ↓
T002 (CLI skeleton)
  ↓
T003 (example app)
  ↓
T004 (core protocol)
  → T005 (tool), T006 (resource), T007 (prompt)
  → T008 (router), T009 (lifecycle)
  ↓
T015 (module boundary)
  → T010 (stdio), T011 (http), T012 (api-key), T013 (jwt)
  → T014 (middleware), T017 (memory storage)
  ↓
T016 (feature/module descriptors) ← algs/feature-resolution
  → T022 (module descriptor), T023, T024 (feature registry)
  ↓
T018 (feature resolution) ← algs/feature-resolution
  → T019 (graph validation) ← algs/cycle-detection, conflict-validation
  → T020 (explicit disable) ← algs/explicit-disable
  → T021 (feature lock) ← algs/feature-lock
  → T025 (dependency closure)
  ↓
T026 (analyzer: explicit config) ← algs/analyzer-inference
  → T027 (generated metadata), T028 (known API), T029 (AST)
  ↓
T030 (generator interface + static composition) ← algs/static-composition, code-generation
  → T031 (features.go), T032 (static composition), T033 (server), T034 (router)
  → T035 (modules.go), T036 (buildinfo.go), T037 (generated check)
  ↓
T038 (build pipeline interface) ← algs/build-pipeline
  → T039 (pipeline stages), T040 (build manifest)
  → T042 (config stage), T043 (compile stage), T044 (verify stage)
  → T045 (benchmark stage), T046 (error propagation)
  → T047 (build manifest generation)
  ↓
T041 (binary audit) ← algs/binary-analysis
  → T048 (binary metadata reader), T049 (module verification)
  → T050 (doctor command)
  ↓
T051 (smoke test)
  → T052 (profile verification)
  → T053 (runtime checks)
  ↓
T054 (binary regression), T055 (dispatch benchmark)
  → T056 (startup/memory benchmark)
  → T057 (performance regression)
  → T058 (reproducible build)
  → T059 (verification report)
  ↓
T060 (CI full test), T061 (build verification)
  → T062 (feature lock check), T063 (profile matrix)
  → T064 (negative tests), T065 (verify command)
  ↓
T066 (README), T067 (architecture docs)
  → T068 (final verification)
  ↓
T069 (SSE transport) [deferred]
T070 (OAuth auth) [deferred]
T071 (metrics middleware) [deferred]
T072 (tracing middleware) [deferred]
T073 (K8s integration) [deferred]
```
- **full**: Enables the complete framework for development and integration testing

---

# 12. v0.1 Scope

MUST include: Core MCP server, Tools, Resources, Prompts, at least one transport, Module abstraction, Feature Graph, Dependency resolution, Feature lock, Auto enable/disable, CLI, Code generation, Production build, Benchmark framework, Build verification.

SHOULD NOT require: OAuth, Tasks, External storage, Kubernetes integration, Advanced telemetry, Cloud-specific integrations.

---

# 13. Definition of Done

1. MCP server can start
2. Tool can be registered and invoked
3. Resource can be registered
4. At least stdio transport works
5. Feature Graph resolves deterministically
6. Feature lock is generated
7. Static composition generates only enabled modules
8. Production binary excludes unused modules
9. CLI commands all work
10. Unit tests and integration tests pass
11. Benchmark baseline established
12. Binary dependency audit passes
13. Documentation complete
