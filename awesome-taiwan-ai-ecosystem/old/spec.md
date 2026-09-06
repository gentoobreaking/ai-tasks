# Taiwan MCP Crawler — Master Specification

## Overview

建立一套自動化 crawler，用於持續發現、分析、去重與驗證公開 MCP Server，並判斷其是否屬於 **Taiwan-related MCP**。

## Pipeline

```text
Discovery → Candidate → Normalize → Deduplicate → Taiwan Relevance Detection
→ Repository/Endpoint Verification → Capability Extraction → Health Check
→ Quality Scoring → Registry
```

## Non-goals (v0.1 scope)

- Web UI (deferred to v0.2, see §67 Phase 4)
- LLM ambiguous classification (deferred to v0.2, see §67 Phase 4)
- Historical snapshots (deferred to v0.2, see §67 Phase 4)
- REST API (deferred to v0.2, see §67 Phase 4)
- Glama / PulseMCP / MCP.so adapters (deferred to v0.2, see §67 Phase 2)
- Production scheduler (cron/systemd handled externally)
- Sandbox execution of discovered MCP code (explicitly prohibited by §58 Security KPI)

## Feature List (F1–Fxx)

| ID  | Feature | Spec Section |
|-----|---------|-------------|
| F1  | Source Adapter interface | §4 Source Adapter |
| F2  | GitHub adapter: keyword matrix search | §5, §6 GitHub Search Query |
| F3  | GitHub adapter: candidate extraction (README, package.json, etc.) | §7 GitHub Candidate Extraction |
| F4  | Glama adapter | §8 Glama Adapter |
| F5  | PulseMCP adapter | §9 PulseMCP Adapter |
| F6  | MCP.so adapter | §10 MCP.so Adapter |
| F7  | Official MCP Registry adapter | §11 Official MCP Registry Adapter |
| F8  | RawCandidate schema | §12 Candidate Schema |
| F9  | MCPServer normalized schema | §13 Normalized MCP Schema |
| F10 | TaiwanRelevance classification (score + level + evidence) | §14, §15, §17 |
| F11 | Deterministic scoring rules | §17 Deterministic Relevance Score |
| F12 | LLM ambiguous classification | §18 LLM Classification |
| F13 | Category taxonomy (controlled vocabulary) | §19 Category Taxonomy |
| F14 | Deduplication / canonical identity | §20, §21, §22, §23 |
| F15 | Source aggregation | §24 Source Aggregation |
| F16 | Verification engine (repository + endpoint + protocol) | §25 Verification Engine |
| F17 | MCP health status | §26 MCP Health |
| F18 | Repository status (ACTIVE/STALE/ARCHIVED/etc.) | §27 Repository Status |
| F19 | Tool extraction from MCP protocol | §28 Tool Discovery |
| F20 | Data source detection (TWSE, CWA, etc.) | §29 Data Source Detection |
| F21 | Official source detection (official_domains) | §30 Official Source Detection |
| F22 | Quality scoring (100-point, 10 components) | §31 Quality Score, §32 Data Source Score |
| F23 | Security scanner (static analysis) | §33 Security Assessment |
| F24 | Registry JSON export (6 files) | §34 Registry Schema, §35 registry.json |
| F25 | SQLite persistence | §36 Storage Architecture |
| F26 | Crawl run metadata | §37 Crawl Run |
| F27 | Incremental crawl (ETag, pushed_at) | §38 Incremental Crawl |
| F28 | Scheduler (cron-style) | §39 Scheduler |
| F29 | Per-source rate limiting | §40 Rate Limit |
| F30 | Failure isolation (SOURCE_DEGRADED) | §41 Failure Isolation |
| F31 | Prometheus metrics | §42 Observability |
| F32 | Structured JSON logging | §43 Logging |
| F33 | CLI commands (crawl, verify, export, stats, search) | §44 CLI, §45 Query |
| F34 | Registry API endpoints | §47 API |
| F35 | Capability search | §22 Capability Search (Registry Schema) |
| F36 | Data provenance | §66 Data Provenance |
| F37 | Historical snapshots | §62 Historical Data |
| F38 | Taiwan MCP ranking | §63 Taiwan MCP Ranking |
| F39 | Source trust / conflict resolution | §64 Source Trust, §65 Conflict Resolution |

## Modules

| Module | Description | Algs |
|--------|------------|------|
| `internal/models/` | Domain models (MCPServer, Repository, etc.) | `algs/models.md` |
| `internal/sources/` | Source adapter interface + mock | `algs/source-adapter.md` |
| `internal/sources/github/` | GitHub adapter | `algs/github-adapter.md` |
| `internal/sources/glama/` | Glama adapter | (see F4) |
| `internal/sources/pulsemcp/` | PulseMCP adapter | (see F5) |
| `internal/sources/mcpso/` | MCP.so adapter | (see F6) |
| `internal/sources/registry/` | Official MCP Registry adapter | (see F7) |
| `internal/normalize/` | Normalizer (RawCandidate → MCPServer) | `algs/normalizer.md` |
| `internal/dedupe/` | Canonical identity + dedup engine | `algs/dedup-identity.md` |
| `internal/classify/` | Taiwan rule engine + LLM classifier | `algs/taiwan-classification.md` |
| `internal/verify/` | Repository + endpoint + protocol verification | `algs/verification.md` |
| `internal/scoring/` | Quality scoring engine | `algs/quality-scoring.md` |
| `internal/storage/` | SQLite persistence | `algs/storage.md` |
| `internal/export/` | JSON registry export | `algs/registry-export.md` |
| `internal/crawler/` | Coordinator + scheduler | `algs/coordinator.md` |
| `internal/api/` | REST API server | (Phase 4) |
| `internal/observability/` | Metrics + logging | `algs/observability.md` |

## External Dependencies

| Dependency | Purpose | Used In Tasks |
|-----------|---------|---------------|
| GitHub REST API | Repository search + metadata | T008 |
| Glama Discovery API | MCP discovery | T013 (conditional) |
| PulseMCP API | MCP discovery | T014 (conditional) |
| MCP.so API | MCP discovery | T015 (conditional) |
| Official MCP Registry API | Registry discovery | T012 |
| OpenAI-compatible LLM API | Ambiguous classification | T031 (conditional) |
| Prometheus metrics endpoint | Observability | T030 (optional) |

## Algorithm Specification Index (任務拆解必讀)

| Algorithm File | Corresponding Features | Corresponding Module | Corresponding Tasks |
|---|---|---|---|
| [algs/models.md](algs/models.md) | F9, F8 | internal/models/ | **T002**, T009 |
| [algs/source-adapter.md](algs/source-adapter.md) | F1, F8 | internal/sources/ | T005 |
| [algs/github-adapter.md](algs/github-adapter.md) | F2, F3 | internal/sources/github/ | T008 |
| [algs/normalizer.md](algs/normalizer.md) | F9, F16 | internal/normalize/ | T009 |
| [algs/dedup-identity.md](algs/dedup-identity.md) | F14, F15 | internal/dedupe/ | T010, T011 |
| [algs/taiwan-classification.md](algs/taiwan-classification.md) | F10, F11, F12, F13 | internal/classify/ | T012, T013, T014, T015, T016, T017, T018, T031 |
| [algs/verification.md](algs/verification.md) | F16, F17, F18, F19, F20, F21, F23 | internal/verify/ | T019, T020, T021, T022, T023, T024, T026 |
| [algs/quality-scoring.md](algs/quality-scoring.md) | F22 | internal/scoring/ | T025 |
| [algs/storage.md](algs/storage.md) | F25, F26 | internal/storage/ | T004, T027 |
| [algs/registry-export.md](algs/registry-export.md) | F24, F34, F35 | internal/export/ | T028, T032 |
| [algs/coordinator.md](algs/coordinator.md) | F28, F29, F30, F33 | internal/crawler/ | T029, T030, T033 |
| [algs/observability.md](algs/observability.md) | F31, F32 | internal/observability/ | T034 |

### Supporting Tasks (no dedicated algorithm file but necessary)
- T001 — Project Bootstrap (go.mod, Dockerfile, README)
- T018 — Test Fixtures
- T031 — CLI
- T032 — Incremental Crawl
- T033 — Retry / Backoff
- T034 — Metrics + Logging
- T035 — Taiwan Search
- T036 — Search API
- T037 — Capability Search
- T038 — Unit Tests
- T039 — Integration Tests
- T040 — End-to-End Test
- T041 — Docker
- T042 — Security Boundary
- T043 — Documentation
- T044 — Final Verification

### Conditional/Deferred Tasks (locked behind external conditions)
| Task | Blocked On |
|------|-----------|
| T013 — Glama Adapter | Glama API access (Phase 2) |
| T014 — PulseMCP Adapter | PulseMCP API access (Phase 2) |
| T015 — MCP.so Adapter | MCP.so API access (Phase 2) |
| T017 — LLM Classifier | OpenAI-compatible API key env var (Phase 4) |
| T018 — Historical Snapshots | Phase 2 completion (§62) |
| T019 — REST API | Phase 4 completion (§47) |
| T020 — Web UI | Phase 4 completion (§48) |

### Verification Tasks (mapped from CRAWLER_VERIFICATION_MANUAL.md TST-XXX)
| Task | Verification Tests |
|------|-------------------|
| T045 — Final Verification | TST-001 (build), TST-002 (unit tests), TST-003 (static analysis), TST-004 (vet), TST-067 (go mod verify) |
| T039 — Unit Tests | TST-009~TST-016 (Taiwan detection), TST-017~TST-019 (score determinism), TST-022~TST-024 (dedup), TST-042~TST-046 (scoring/repo status) |
| T040 — Integration Tests | TST-036~TST-037 (failure isolation, idempotency), TST-040 (registry consistency) |
| T041 — E2E Test | TST-068~TST-070 (golden dataset, registry consistency) |
| T033 — Retry/Backoff | TST-033~TST-035 (429, 5xx, max retry) |
| T034 — Metrics/Logging | TST-060~TST-061 (metrics, source failure logging, redaction) |
| T043 — Security Boundary | TST-025~TST-026 (process execution=0), TST-066 (secret leakage) |
| T051 — Performance | TST-062 (10k candidates), TST-064 (concurrency determinism), TST-065 (crash recovery) |
| T052 — Production Smoke | TST-075 (live crawl smoke test) |
| T054 — KPI Verification | TST-076~TST-080 (Recall 80%, Precision 85%, Duplicate <5%, False positive ≤5%) |
| T046 — Regression Golden | TST-068~TST-069 (golden dataset regression) |

### Task Dependency Graph (topological order)

```text
T001 ─> T002 ─> T003 ─> T038 ─> T039 ─> T040 ─> T041 ─> T045 ─> T052
                  │              │        │        └──> T046 ─> T054
                  │              │        └──> T032 ─> T047(cond)
                  │              └──> T033
                  ├──> T004 ─> T027 ─> T028 ─> T031 ─> T036 ─> T037 ─> T048(cond) ─> T049(cond)
                  │         │         │         └──> T052
                  │         │         └──> T032 ─> T047
                  │         └──> T030 ─> T047
                  ├──> T006 ─> T007 ─> T032
                  │       │
                  │       ├──> T008 ─> T017(cond)  (T018 also ← T005)
                  │       ├──> T009 ─> T043
                  │       ├──> T020 ─> T027
                  │       ├──> T021 ─> T025 ─> T029
                  │       └──> T016
                  ├──> T010 ─> T011 ─> T020
                  ├──> T012 ─> T013(cond) ─> T018(cond)
                  │       │                 └──> T017(cond)
                  │       └──> T014 ─> T015 ─> T035(cond) ─> T048
                  │                             │
                  │                             └──> T029 ─> T051
                  ├──> T022 ─> T023 ─> T025
                  │       └──> T024 ─> T025
                  ├──> T026 ─> T043
                  ├──> T018(cond), T019(cond) ─> T029
                  └──> T042, T043, T044, T050  (all from T001 or T002)

Phase 1 (no blocked_on): T001–T016, T020–T034, T036–T046, T050–T051, T053–T054
Phase 2+ (conditional/blocked_on): T017–T019, T035, T047–T049, T052
```
