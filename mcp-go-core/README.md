# mcp-go-core

## 已實作功能

| 功能 |
|------|
| P0 - Initialize Go Module and Repository Structure |
| P0 - CLI Skeleton with All Commands |
| P0 - Example Application with Stdio Transport |
| P1 - Core Protocol Types (Request/Response/Error) |
| P1 - Tool API with Type-Safe Handler |
| P1 - Resource API |
| P1 - Prompt API |
| P1 - Router for Tool/Resource/Prompt Dispatch |
| P1 - Server Lifecycle Management |
| P2 - Stdio Transport Module |
| P2 - HTTP Transport Module |
| P2 - API Key Security Module |
| P2 - JWT Security Module |
| P2 - Middleware Contract (Logging + Recovery) |
| P2 - Module Boundary Definition |
| P3 - Feature Descriptor and Module Descriptor Types |
| P2 - Memory Storage Module |
| P3 - Feature Resolution Engine |
| P3 - Graph Validation (Cycle, Conflict, Duplicate Detection) |
| P3 - Explicit Disable Validation |
| P3 - Feature Lock Generation (Deterministic) |
| P3 - Module Descriptor (Consolidated with Feature Descriptor) |
| P3 - Module Descriptor Definition |
| P3 - Feature Registry (Internal Only) |
| P3 - Dependency Closure Verification |
| P4 - Explicit Configuration Analyzer |
| P4 - Generated Metadata Analyzer |
| P4 - Known API Usage Analyzer |
| P4 - Go AST Analyzer (Minimal) |
| P5 - Generator Interface and Generated Features |
| P5 - Generated Features Constants |
| P5 - Static Module Composition Implementation |
| P5 - Generated Server Bootstrap |
| P5 - Generated Router |
| P5 - Generated Modules Composition |
| P5 - Generated Build Info |
| P5 - Generated Code Staleness Check |
| P6 - Build Context and Pipeline Interface |
| P6 - Pipeline Stages (Config, Analyze, Resolve, Lock, Generate, Compile) |
| P6 - Build Manifest Generation |
| P7 - Binary Metadata Reader and Module Verification |
| P6 - Config Stage |
| P6 - Compile Stage |
| P6 - Verify Stage |
| P6 - Benchmark Stage |
| P6 - Error Propagation and Actionable Errors |
| P7 - Build Manifest Generation |
| P7 - Binary Metadata Reader Implementation |
| P7 - Expected and Unexpected Module Verification |
| P7 - CLI Doctor Command |
| P8 - Runtime Smoke Test |
| P8 - Profile Verification (Minimal, HTTP, Secure) |
| P8 - Runtime Feature Graph Absence Check |
| P8 - Binary Regression Verification |
| P8 - Dispatch and Throughput Benchmarks |
| P8 - Startup and Memory Benchmarks |
| P8 - Performance Regression Gate |
| P8 - Reproducible Build Verification |
| P8 - Verification Report Generation |
| P9 - Full Test Suite and Generate Check CI |
| P9 - Build Verification and Binary Dependency Gate |
| P9 - Feature Lock Check CI |
| P9 - Profile Verification Matrix CI |
| P9 - Negative Verification Test Suite |
| P9 - End-to-End Verification Command |
| P10 - README Documentation |
| P10 - Architecture and Example Documentation |
| P10 - Final End-to-End Verification |
| P2 - SSE Transport Module (Deferred - External Condition) |
| P2 - OAuth Security Module (Deferred - External Condition) |
| P2 - Metrics Middleware Module (Deferred - External Condition) |
| P2 - Tracing Middleware Module (Deferred - External Condition) |
| P2 - Kubernetes Integration Module (Deferred - External Condition) |
| P3 - Unified Transport Interface with Session Management |
| P1 - Complete MCP Protocol Types |
| P2 - Server Builder API |
| P2 - MCP Test Infrastructure |
| P1 - Standardized Error Handling |
| P3 - CLI Enhancement (Builder Patterns & Commands) |
| P1 - OAuth Production Authentication |
| P1 - Logging Middleware Implementation |
| P1 - Recovery Middleware Implementation |
| P1 - Filesystem Storage Implementation |
| P1 - External Storage Implementation |
| P2 - Task Runtime and Session Runtime Implementation |
| P0 - MCP Spec Conformity: Fix Server-Transport-Router wiring |
| P0 - MCP Spec Compliance: JSON tags, notifications/cancel, dispatch coverage |
| P2 - MCP Spec Compliance: Optional extensions (logging/setLogLevel, sampling/createMessage, resources/created) |
| P2 - MCP Spec Compliance: Advanced optional methods (ping, complete, resource subscriptions) |
| P1 - Dynamic Config: Hot-reload config without server restart |
| P0 - Feature Flags: Runtime toggle system with config-backed flags |
| P0 - Rate Limiting: Per-method token bucket rate limiter |

## Skip 項目

| Task | 說明 |
|------|------|
| | |

## 開發中

| Task | 名稱 | 說明 |
|------|------|------|
| | | |

## 待實作

| Task | 名稱 | 說明 |
|------|------|------|
| [T99-resource-change-notifications](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T099-resource-change-notifications.md) | P2 - MCP Resource Change Notifications (bidirectional) | |
| [T100-mcp-optional-methods-continued](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T100-mcp-optional-methods-continued.md) | P3 - MCP Spec Conformance: Missing optional methods (prompts/create, notifications/list_changed) | |

## Task 列表

| # | 名稱 | 狀態 |
|---|------|------|
| [T1-init-go-module](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T001-init-go-module.md) | P0 - Initialize Go Module and Repository Structure | ✅ done |
| [T2-cli-skeleton](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T002-cli-skeleton.md) | P0 - CLI Skeleton with All Commands | ✅ done |
| [T3-example-application](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T003-example-application.md) | P0 - Example Application with Stdio Transport | ✅ done |
| [T4-core-protocol-types](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T004-core-protocol-types.md) | P1 - Core Protocol Types (Request/Response/Error) | ✅ done |
| [T5-tool-api](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T005-tool-api.md) | P1 - Tool API with Type-Safe Handler | ✅ done |
| [T6-resource-api](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T006-resource-api.md) | P1 - Resource API | ✅ done |
| [T7-prompt-api](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T007-prompt-api.md) | P1 - Prompt API | ✅ done |
| [T8-router](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T008-router.md) | P1 - Router for Tool/Resource/Prompt Dispatch | ✅ done |
| [T9-server-lifecycle](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T009-server-lifecycle.md) | P1 - Server Lifecycle Management | ✅ done |
| [T10-stdio-transport](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T010-stdio-transport.md) | P2 - Stdio Transport Module | ✅ done |
| [T11-http-transport](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T011-http-transport.md) | P2 - HTTP Transport Module | ✅ done |
| [T12-api-key-auth](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T012-api-key-auth.md) | P2 - API Key Security Module | ✅ done |
| [T13-jwt-auth](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T013-jwt-auth.md) | P2 - JWT Security Module | ✅ done |
| [T14-middleware-contract](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T014-middleware-contract.md) | P2 - Middleware Contract (Logging + Recovery) | ✅ done |
| [T15-module-boundary](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T015-module-boundary.md) | P2 - Module Boundary Definition | ✅ done |
| [T16-feature-module-descriptors](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T016-feature-module-descriptors.md) | P3 - Feature Descriptor and Module Descriptor Types | ✅ done |
| [T17-memory-storage](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T017-memory-storage.md) | P2 - Memory Storage Module | ✅ done |
| [T18-feature-resolution](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T018-feature-resolution.md) | P3 - Feature Resolution Engine | ✅ done |
| [T19-graph-validation](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T019-graph-validation.md) | P3 - Graph Validation (Cycle, Conflict, Duplicate Detection) | ✅ done |
| [T20-explicit-disable-validation](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T020-explicit-disable-validation.md) | P3 - Explicit Disable Validation | ✅ done |
| [T21-feature-lock](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T021-feature-lock.md) | P3 - Feature Lock Generation (Deterministic) | ✅ done |
| [T22-module-descriptor-placeholder](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T022-module-descriptor-placeholder.md) | P3 - Module Descriptor (Consolidated with Feature Descriptor) | ✅ done |
| [T23-module-descriptor](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T023-module-descriptor.md) | P3 - Module Descriptor Definition | ✅ done |
| [T24-feature-registry](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T024-feature-registry.md) | P3 - Feature Registry (Internal Only) | ✅ done |
| [T25-dependency-closure](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T025-dependency-closure.md) | P3 - Dependency Closure Verification | ✅ done |
| [T26-analyzer](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T026-analyzer.md) | P4 - Explicit Configuration Analyzer | ✅ done |
| [T27-generated-metadata-analyzer](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T027-generated-metadata-analyzer.md) | P4 - Generated Metadata Analyzer | ✅ done |
| [T28-known-api-analyzer](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T028-known-api-analyzer.md) | P4 - Known API Usage Analyzer | ✅ done |
| [T29-go-ast-analyzer](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T029-go-ast-analyzer.md) | P4 - Go AST Analyzer (Minimal) | ✅ done |
| [T30-generator](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T030-generator.md) | P5 - Generator Interface and Generated Features | ✅ done |
| [T31-generated-features](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T031-generated-features.md) | P5 - Generated Features Constants | ✅ done |
| [T32-static-composition](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T032-static-composition.md) | P5 - Static Module Composition Implementation | ✅ done |
| [T33-generated-server](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T033-generated-server.md) | P5 - Generated Server Bootstrap | ✅ done |
| [T34-generated-router](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T034-generated-router.md) | P5 - Generated Router | ✅ done |
| [T35-generated-modules](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T035-generated-modules.md) | P5 - Generated Modules Composition | ✅ done |
| [T36-generated-buildinfo](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T036-generated-buildinfo.md) | P5 - Generated Build Info | ✅ done |
| [T37-generated-check](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T037-generated-check.md) | P5 - Generated Code Staleness Check | ✅ done |
| [T38-build-pipeline](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T038-build-pipeline.md) | P6 - Build Context and Pipeline Interface | ✅ done |
| [T39-pipeline-stages](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T039-pipeline-stages.md) | P6 - Pipeline Stages (Config, Analyze, Resolve, Lock, Generate, Compile) | ✅ done |
| [T40-build-manifest](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T040-build-manifest.md) | P6 - Build Manifest Generation | ✅ done |
| [T41-binary-audit](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T041-binary-audit.md) | P7 - Binary Metadata Reader and Module Verification | ✅ done |
| [T42-config-stage](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T042-config-stage.md) | P6 - Config Stage | ✅ done |
| [T43-compile-stage](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T043-compile-stage.md) | P6 - Compile Stage | ✅ done |
| [T44-verify-stage](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T044-verify-stage.md) | P6 - Verify Stage | ✅ done |
| [T45-benchmark-stage](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T045-benchmark-stage.md) | P6 - Benchmark Stage | ✅ done |
| [T46-error-propagation](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T046-error-propagation.md) | P6 - Error Propagation and Actionable Errors | ✅ done |
| [T47-build-manifest](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T047-build-manifest.md) | P7 - Build Manifest Generation | ✅ done |
| [T48-binary-metadata-reader](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T048-binary-metadata-reader.md) | P7 - Binary Metadata Reader Implementation | ✅ done |
| [T49-module-verification](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T049-module-verification.md) | P7 - Expected and Unexpected Module Verification | ✅ done |
| [T50-doctor-command](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T050-doctor-command.md) | P7 - CLI Doctor Command | ✅ done |
| [T51-smoke-test](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T051-smoke-test.md) | P8 - Runtime Smoke Test | ✅ done |
| [T52-profile-verification](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T052-profile-verification.md) | P8 - Profile Verification (Minimal, HTTP, Secure) | ✅ done |
| [T53-runtime-checks](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T053-runtime-checks.md) | P8 - Runtime Feature Graph Absence Check | ✅ done |
| [T54-binary-regression](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T054-binary-regression.md) | P8 - Binary Regression Verification | ✅ done |
| [T55-dispatch-benchmark](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T055-dispatch-benchmark.md) | P8 - Dispatch and Throughput Benchmarks | ✅ done |
| [T56-startup-memory-benchmark](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T056-startup-memory-benchmark.md) | P8 - Startup and Memory Benchmarks | ✅ done |
| [T57-performance-regression](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T057-performance-regression.md) | P8 - Performance Regression Gate | ✅ done |
| [T58-reproducible-build](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T058-reproducible-build.md) | P8 - Reproducible Build Verification | ✅ done |
| [T59-verification-report](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T059-verification-report.md) | P8 - Verification Report Generation | ✅ done |
| [T60-ci-full-test](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T060-ci-full-test.md) | P9 - Full Test Suite and Generate Check CI | ✅ done |
| [T61-build-verification](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T061-build-verification.md) | P9 - Build Verification and Binary Dependency Gate | ✅ done |
| [T62-feature-lock-check](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T062-feature-lock-check.md) | P9 - Feature Lock Check CI | ✅ done |
| [T63-profile-matrix](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T063-profile-matrix.md) | P9 - Profile Verification Matrix CI | ✅ done |
| [T64-negative-tests](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T064-negative-tests.md) | P9 - Negative Verification Test Suite | ✅ done |
| [T65-verify-command](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T065-verify-command.md) | P9 - End-to-End Verification Command | ✅ done |
| [T66-readme](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T066-readme.md) | P10 - README Documentation | ✅ done |
| [T67-architecture-docs](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T067-architecture-docs.md) | P10 - Architecture and Example Documentation | ✅ done |
| [T68-final-verification](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T068-final-verification.md) | P10 - Final End-to-End Verification | ✅ done |
| [T69-sse-transport](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T069-sse-transport.md) | P2 - SSE Transport Module (Deferred - External Condition) | ✅ done |
| [T70-oauth-auth](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T070-oauth-auth.md) | P2 - OAuth Security Module (Deferred - External Condition) | ✅ done |
| [T71-metrics-middleware](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T071-metrics-middleware.md) | P2 - Metrics Middleware Module (Deferred - External Condition) | ✅ done |
| [T72-tracing-middleware](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T072-tracing-middleware.md) | P2 - Tracing Middleware Module (Deferred - External Condition) | ✅ done |
| [T73-kubernetes-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T073-kubernetes-integration.md) | P2 - Kubernetes Integration Module (Deferred - External Condition) | ✅ done |
| [T74-unified-transport-interface](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T074-unified-transport-interface.md) | P3 - Unified Transport Interface with Session Management | ✅ done |
| [T75-complete-protocol-types](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T075-complete-protocol-types.md) | P1 - Complete MCP Protocol Types | ✅ done |
| [T76-server-builder-api](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T076-server-builder-api.md) | P2 - Server Builder API | ✅ done |
| [T77-test-infrastructure](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T077-test-infrastructure.md) | P2 - MCP Test Infrastructure | ✅ done |
| [T78-standardized-error-handling](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T078-standardized-error-handling.md) | P1 - Standardized Error Handling | ✅ done |
| [T79-cli-enhancement](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T079-cli-enhancement.md) | P3 - CLI Enhancement (Builder Patterns & Commands) | ✅ done |
| [T80-oauth-production-auth](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T080-oauth-production-auth.md) | P1 - OAuth Production Authentication | ✅ done |
| [T81-logging-middleware](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T081-logging-middleware.md) | P1 - Logging Middleware Implementation | ✅ done |
| [T82-recovery-middleware](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T082-recovery-middleware.md) | P1 - Recovery Middleware Implementation | ✅ done |
| [T83-filesystem-storage](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T083-filesystem-storage.md) | P1 - Filesystem Storage Implementation | ✅ done |
| [T84-external-storage](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T084-external-storage.md) | P1 - External Storage Implementation | ✅ done |
| [T85-task-session-runtime](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T085-task-session-runtime.md) | P2 - Task Runtime and Session Runtime Implementation | ✅ done |
| [T86-mcp-conformance-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T086-mcp-conformance-fix.md) | P0 - MCP Spec Conformity: Fix Server-Transport-Router wiring | ✅ done |
| [T87-mcp-compliance-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T087-mcp-compliance-fix.md) | P0 - MCP Spec Compliance: JSON tags, notifications/cancel, dispatch coverage | ✅ done |
| [T88-mcp-optional-extensions](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T088-mcp-optional-extensions.md) | P2 - MCP Spec Compliance: Optional extensions (logging/setLogLevel, sampling/createMessage, resources/created) | ✅ done |
| [T89-mcp-advanced-methods](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T089-mcp-advanced-methods.md) | P2 - MCP Spec Compliance: Advanced optional methods (ping, complete, resource subscriptions) | ✅ done |
| [T90-dynamic-config-hot-reload](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T090-dynamic-config-hot-reload.md) | P1 - Dynamic Config: Hot-reload config without server restart | ✅ done |
| [T91-feature-flags](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T091-feature-flags.md) | P0 - Feature Flags: Runtime toggle system with config-backed flags | ✅ done |
| [T92-rate-limiting](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T092-rate-limiting.md) | P0 - Rate Limiting: Per-method token bucket rate limiter | ✅ done |
| [T99-resource-change-notifications](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T099-resource-change-notifications.md) | P2 - MCP Resource Change Notifications (bidirectional) | 📋 pending |
| [T100-mcp-optional-methods-continued](https://github.com/gentoobreaking/ai-tasks/blob/main/mcp-go-core/tasks/T100-mcp-optional-methods-continued.md) | P3 - MCP Spec Conformance: Missing optional methods (prompts/create, notifications/list_changed) | 📋 pending |

**✅ done: 92 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 2**

> 自動生成於 2026-09-05 00:20
