# awesome-taiwan-ai-ecosystem

## 已實作功能

| 功能 |
|------|
| 專案初始化 — Go module, Dockerfile, README, CLI scaffold |
| 領域模型 — MCPServer, RawCandidate, RawRecord, TaiwanRelevance 等 |
| JSON Schema — mcp-server.json, registry.json schema 驗證 |
| SQLite 持久化 — migrations, storage 層實現 |
| Source Adapter 介面 — Discover + Fetch interface + mock adapter |
| GitHub Adapter — keyword matrix 搜尋 + candidate 提取 |
| GitHub Rate Limit — rate limiter, retry, 429 handling, timeout, context cancellation |
| Normalizer — RawRecord → MCPServer 統一轉換 |
| Manifest Detector — 偵測 package.json, pyproject.toml, go.mod, Cargo.toml, mcp.json 等 |
| Identity Engine — CanonicalIdentity + ServerID 生成 |
| Deduplication Engine — 合併來自多個 source 的相同 MCP |
| Taiwan Keyword Engine — config-driven keyword classification |
| Taiwan Domain Engine — official domains config + detection |
| Taiwan Scoring — deterministic relevance score + level mapping |
| Evidence Engine — scoring rule evidence provenance |
| Official MCP Registry Adapter — discovery + metadata fetch |
| > ⛔ Glama Adapter — discovery + metadata fetch (Phase 2, needs Glama API) |
| > ⛔ PulseMCP Adapter — discovery + metadata fetch (Phase 2, needs PulseMCP API) |
| > ⛔ MCP.so Adapter — discovery + metadata fetch (Phase 2, needs MCP.so API) |
| Source Aggregation — 合併多個 source 的 metadata |
| Repository Verification — HTTP, Git, README, manifest, archive status |
| MCP Protocol Verification — initialize, tools/list, resources/list, prompts/list |
| Endpoint Health — DNS, TLS, HTTP, MCP initialize, latency |
| Tool Extraction — tools/list 結果保存 |
| Quality Engine — 10-component 100-point scoring |
| Security Scanner — static analysis of discovered MCP code |
| Registry Persistence — pipeline → SQLite idempotent write |
| JSON Registry Export — registry.json, registry.min.json, categories, sources, statistics, health |
| Crawl Coordinator — full pipeline orchestration |
| Crawl Run — metadata tracking per execution |
| CLI — crawl, verify, dedupe, score, export, stats, search commands |
| Incremental Crawl — ETag, pushed_at, last_seen tracking |
| Retry & Backoff — unified retry logic, context cancellation |
| Metrics & Logging — Prometheus metrics + structured JSON logging |
| > ⛔ LLM Classifier — ambiguous Taiwan classification (Phase 4, needs LLM API) |
| Search API — registry search by keyword, level, category, min-score |
| Capability Search — tool/resource/data-source capability matching |
| Test Fixtures — taiwan, non-taiwan, duplicate, archived, dead endpoint, invalid, official, scraping |
| Unit Tests — >=80% coverage for critical modules |
| Integration Tests — adapter, SQLite, MCP handshake via mock servers |
| End-to-End Test — full pipeline with mock sources |
| Docker — Dockerfile + docker-compose with security best practices |
| Security Boundary — enforce never-execute-discovered-code policy |
| Documentation — README with all required sections |
| Final Verification — full build + test + crawl + export validation |
| Regression Golden Dataset — TST-068 classification/identity/dedup accuracy |
| Static Analysis CI — golangci-lint + gosec security linting |
| Performance Benchmark — 10k candidates, <10min, no OOM |
| Production Smoke Test — live GitHub + Registry crawl + export |
| Verification Manual Tests — mapping CRAWLER_VERIFICATION_MANUAL to automated tests |
| KPI Verification — Recall, Precision, Duplicate rate, False positive |
| GitHub Rate Limit — 遷移至 go-github-ratelimit |
| REGISTRY.md charset=unknown-8bit 編碼混亂 |
| LLM API 401 — 模型名 typo 與 Docker 環境錯配 |
| 3 Sources — mcpmarket/mcpservers.org/modelcontextprotocol/servers |
| Markdown Export 分類錯配 |
| 惡意倉庫偵測器 |
| 整合惡意偵測進掃描管線 |
| 惡意報表獨立輸出 |
| CLI 整合惡意報表旗標 |
| Injection 偵測獨立報表輸出 |
| Canonical Entity Model — Unified entity struct for all AI ecosystem types |
| Entity Classification Enum — Primary classification types (MCP_SERVER, MCP_CLIENT, AI_AGENT, etc.) |
| Entity Status Enum — DISCOVERED, CANDIDATE, VERIFIED, QUARANTINED, REJECTED |
| Taiwan Relevance Engine — Decouple from MCP identity, independent scoring |
| Taiwan Signal Dictionary — Configurable Taiwan keywords/domains (YAML) |
| AI Relevance Engine — Independent AI scoring (LLM, agent, RAG, etc.) |
| AI Signal Dictionary — Configurable AI keywords/patterns (YAML) |
| Entity Classifier — Rule-based primary classification with evidence |
| MCP Identity Engine — Static analysis for MCP server implementation |

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
| [T47-historical-snapshots](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T047-historical-snapshots.md) | > ⛔ Historical Snapshots — crawl run history + time-series data (Phase 2) | |
| [T48-rest-api](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T048-rest-api.md) | > ⛔ REST API — HTTP API for registry search + metadata (Phase 4) | |
| [T49-web-ui](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T049-web-ui.md) | > ⛔ Web UI — registry browse + Taiwan MCP discovery dashboard (Phase 4) | |
| [T73-llm-classifier-fallback](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T073-llm-classifier-fallback.md) | LLM Classifier Fallback — For ambiguous cases (score 20-55) | |
| [T75-mcp-role-detection](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T075-mcp-role-detection.md) | MCP Role Detection — CLIENT, HOST, SDK, SKILL, EXTENSION separation | |
| [T76-endpoint-type-classifier](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T076-endpoint-type-classifier.md) | Endpoint Type Classifier — REPOSITORY_URL, DOCUMENTATION_URL, INSTALLER_URL, MCP_RUNTIME_ENDPOINT | |
| [T77-url-evidence-tracking](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T077-url-evidence-tracking.md) | URL Evidence Tracking — Record why each URL was classified | |
| [T78-mcp-runtime-verifier](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T078-mcp-runtime-verifier.md) | MCP Runtime Verifier — initialize + tools/list handshake | |
| [T79-runtime-verification-status](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T079-runtime-verification-status.md) | Runtime Verification Status — MCP_CANDIDATE, MCP_STATIC_VERIFIED, MCP_RUNTIME_VERIFIED, NOT_MCP | |
| [T80-security-scanner-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T080-security-scanner-integration.md) | Security Scanner Integration — Detect obfuscation, credential extraction, remote binary download | |
| [T81-security-status-enum](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T081-security-status-enum.md) | Security Status Enum — CLEAN, SUSPICIOUS, QUARANTINED, BLOCKED | |
| [T82-quality-engine-refactor](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T082-quality-engine-refactor.md) | Quality Engine Refactor — Independent from classification, per spec weights | |
| [T83-registry-view-generator](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T083-registry-view-generator.md) | Registry View Generator — taiwan-ai-ecosystem.md, taiwan-mcp.md, taiwan-ai-agents.md, etc. | |
| [T84-database-schema-migration](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T084-database-schema-migration.md) | Database Schema Migration — SQLite schema for new entity model | |
| [T85-migration-pipeline](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T085-migration-pipeline.md) | Migration Pipeline — Load, normalize, classify, score, verify existing records | |
| [T86-backward-compatibility](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T086-backward-compatibility.md) | Backward Compatibility — Keep awesome-taiwan-mcp.md as generated view | |
| [T87-acceptance-test-suite](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T087-acceptance-test-suite.md) | Acceptance Test Suite — 12 test cases from spec §56 | |
| [T88-fp-rate-test](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T088-fp-rate-test.md) | MCP False Positive Rate Test — Target <5% | |
| [T89-discovery-pipeline-refactor](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T089-discovery-pipeline-refactor.md) | Discovery Pipeline Refactor — Broad discovery (Taiwan + AI), no MCP keyword filter | |
| [T90-source-adapter-updates](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T090-source-adapter-updates.md) | Source Adapter Updates — Treat registries as discovery sources, not proof | |
| [T91-cli-coordinator-updates](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T091-cli-coordinator-updates.md) | CLI & Coordinator Updates — New pipeline stages | |
| [T92-documentation-update](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T092-documentation-update.md) | Documentation Update — README, spec.md alignment | |
| [T93-coordinator-refactor](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T093-coordinator-refactor.md) | Crawler Coordinator 重構 - 適配新 Entity 模型與協調器邏輯修復 | |

## Task 列表

| # | 名稱 | 狀態 |
|---|------|------|
| [T1-project-bootstrap](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T001-project-bootstrap.md) | 專案初始化 — Go module, Dockerfile, README, CLI scaffold | ✅ done |
| [T2-domain-models](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T002-domain-models.md) | 領域模型 — MCPServer, RawCandidate, RawRecord, TaiwanRelevance 等 | ✅ done |
| [T3-json-schema](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T003-json-schema.md) | JSON Schema — mcp-server.json, registry.json schema 驗證 | ✅ done |
| [T4-sqlite-storage](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T004-sqlite-storage.md) | SQLite 持久化 — migrations, storage 層實現 | ✅ done |
| [T5-source-adapter-interface](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T005-source-adapter-interface.md) | Source Adapter 介面 — Discover + Fetch interface + mock adapter | ✅ done |
| [T6-github-adapter](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T006-github-adapter.md) | GitHub Adapter — keyword matrix 搜尋 + candidate 提取 | ✅ done |
| [T7-github-rate-limit](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T007-github-rate-limit.md) | GitHub Rate Limit — rate limiter, retry, 429 handling, timeout, context cancellation | ✅ done |
| [T8-normalizer](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T008-normalizer.md) | Normalizer — RawRecord → MCPServer 統一轉換 | ✅ done |
| [T9-manifest-detector](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T009-manifest-detector.md) | Manifest Detector — 偵測 package.json, pyproject.toml, go.mod, Cargo.toml, mcp.json 等 | ✅ done |
| [T10-identity-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T010-identity-engine.md) | Identity Engine — CanonicalIdentity + ServerID 生成 | ✅ done |
| [T11-deduplication-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T011-deduplication-engine.md) | Deduplication Engine — 合併來自多個 source 的相同 MCP | ✅ done |
| [T12-taiwan-keyword-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T012-taiwan-keyword-engine.md) | Taiwan Keyword Engine — config-driven keyword classification | ✅ done |
| [T13-taiwan-domain-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T013-taiwan-domain-engine.md) | Taiwan Domain Engine — official domains config + detection | ✅ done |
| [T14-taiwan-scoring](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T014-taiwan-scoring.md) | Taiwan Scoring — deterministic relevance score + level mapping | ✅ done |
| [T15-evidence-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T015-evidence-engine.md) | Evidence Engine — scoring rule evidence provenance | ✅ done |
| [T16-official-registry-adapter](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T016-official-registry-adapter.md) | Official MCP Registry Adapter — discovery + metadata fetch | ✅ done |
| [T17-glama-adapter](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T017-glama-adapter.md) | > ⛔ Glama Adapter — discovery + metadata fetch (Phase 2, needs Glama API) | ✅ done |
| [T18-pulsemcp-adapter](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T018-pulsemcp-adapter.md) | > ⛔ PulseMCP Adapter — discovery + metadata fetch (Phase 2, needs PulseMCP API) | ✅ done |
| [T19-mcpso-adapter](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T019-mcpso-adapter.md) | > ⛔ MCP.so Adapter — discovery + metadata fetch (Phase 2, needs MCP.so API) | ✅ done |
| [T20-source-aggregation](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T020-source-aggregation.md) | Source Aggregation — 合併多個 source 的 metadata | ✅ done |
| [T21-repository-verification](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T021-repository-verification.md) | Repository Verification — HTTP, Git, README, manifest, archive status | ✅ done |
| [T22-mcp-protocol-verification](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T022-mcp-protocol-verification.md) | MCP Protocol Verification — initialize, tools/list, resources/list, prompts/list | ✅ done |
| [T23-endpoint-health](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T023-endpoint-health.md) | Endpoint Health — DNS, TLS, HTTP, MCP initialize, latency | ✅ done |
| [T24-tool-extraction](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T024-tool-extraction.md) | Tool Extraction — tools/list 結果保存 | ✅ done |
| [T25-quality-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T025-quality-engine.md) | Quality Engine — 10-component 100-point scoring | ✅ done |
| [T26-security-scanner](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T026-security-scanner.md) | Security Scanner — static analysis of discovered MCP code | ✅ done |
| [T27-registry-persistence](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T027-registry-persistence.md) | Registry Persistence — pipeline → SQLite idempotent write | ✅ done |
| [T28-json-registry-export](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T028-json-registry-export.md) | JSON Registry Export — registry.json, registry.min.json, categories, sources, statistics, health | ✅ done |
| [T29-crawl-coordinator](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T029-crawl-coordinator.md) | Crawl Coordinator — full pipeline orchestration | ✅ done |
| [T30-crawl-run](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T030-crawl-run.md) | Crawl Run — metadata tracking per execution | ✅ done |
| [T31-cli](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T031-cli.md) | CLI — crawl, verify, dedupe, score, export, stats, search commands | ✅ done |
| [T32-incremental-crawl](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T032-incremental-crawl.md) | Incremental Crawl — ETag, pushed_at, last_seen tracking | ✅ done |
| [T33-retry-backoff](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T033-retry-backoff.md) | Retry & Backoff — unified retry logic, context cancellation | ✅ done |
| [T34-metrics-logging](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T034-metrics-logging.md) | Metrics & Logging — Prometheus metrics + structured JSON logging | ✅ done |
| [T35-llm-classifier](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T035-llm-classifier.md) | > ⛔ LLM Classifier — ambiguous Taiwan classification (Phase 4, needs LLM API) | ✅ done |
| [T36-search-api](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T036-search-api.md) | Search API — registry search by keyword, level, category, min-score | ✅ done |
| [T37-capability-search](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T037-capability-search.md) | Capability Search — tool/resource/data-source capability matching | ✅ done |
| [T38-test-fixtures](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T038-test-fixtures.md) | Test Fixtures — taiwan, non-taiwan, duplicate, archived, dead endpoint, invalid, official, scraping | ✅ done |
| [T39-unit-tests](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T039-unit-tests.md) | Unit Tests — >=80% coverage for critical modules | ✅ done |
| [T40-integration-tests](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T040-integration-tests.md) | Integration Tests — adapter, SQLite, MCP handshake via mock servers | ✅ done |
| [T41-e2e-test](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T041-e2e-test.md) | End-to-End Test — full pipeline with mock sources | ✅ done |
| [T42-docker](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T042-docker.md) | Docker — Dockerfile + docker-compose with security best practices | ✅ done |
| [T43-security-boundary](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T043-security-boundary.md) | Security Boundary — enforce never-execute-discovered-code policy | ✅ done |
| [T44-documentation](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T044-documentation.md) | Documentation — README with all required sections | ✅ done |
| [T45-final-verification](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T045-final-verification.md) | Final Verification — full build + test + crawl + export validation | ✅ done |
| [T46-regression-golden](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T046-regression-golden.md) | Regression Golden Dataset — TST-068 classification/identity/dedup accuracy | ✅ done |
| [T47-historical-snapshots](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T047-historical-snapshots.md) | > ⛔ Historical Snapshots — crawl run history + time-series data (Phase 2) | 📋 pending |
| [T48-rest-api](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T048-rest-api.md) | > ⛔ REST API — HTTP API for registry search + metadata (Phase 4) | 📋 pending |
| [T49-web-ui](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T049-web-ui.md) | > ⛔ Web UI — registry browse + Taiwan MCP discovery dashboard (Phase 4) | 📋 pending |
| [T50-static-analysis-ci](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T050-static-analysis-ci.md) | Static Analysis CI — golangci-lint + gosec security linting | ✅ done |
| [T51-performance-benchmark](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T051-performance-benchmark.md) | Performance Benchmark — 10k candidates, <10min, no OOM | ✅ done |
| [T52-production-smoke](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T052-production-smoke.md) | Production Smoke Test — live GitHub + Registry crawl + export | ✅ done |
| [T53-verification-manual-tests](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T053-verification-manual-tests.md) | Verification Manual Tests — mapping CRAWLER_VERIFICATION_MANUAL to automated tests | ✅ done |
| [T54-kpi-verification](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T054-kpi-verification.md) | KPI Verification — Recall, Precision, Duplicate rate, False positive | ✅ done |
| [T55-github-ratelimit-gofri-migration](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T055-github-ratelimit-gofri-migration.md) | 修復 GitHub Rate Limit — 遷移至 go-github-ratelimit | ✅ done |
| [T56-registry-encoding-utf8-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T056-registry-encoding-utf8-fix.md) | 修復 REGISTRY.md charset=unknown-8bit 編碼混亂 | ✅ done |
| [T57-llm-401-fallback-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T057-llm-401-fallback-fix.md) | 修復 LLM API 401 — 模型名 typo 與 Docker 環境錯配 | ✅ done |
| [T58-new-sources-mcpmarket-mcpserversorg](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T058-new-sources-mcpmarket-mcpserversorg.md) | 新增 3 Sources — mcpmarket/mcpservers.org/modelcontextprotocol/servers | ✅ done |
| [T59-markdown-classification-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T059-markdown-classification-fix.md) | 修復 Markdown Export 分類錯配 | ✅ done |
| [T60-malicious-detector](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T060-malicious-detector.md) | 惡意倉庫偵測器 | ✅ done |
| [T61-malicious-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T061-malicious-integration.md) | 整合惡意偵測進掃描管線 | ✅ done |
| [T62-malicious-exporter](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T062-malicious-exporter.md) | 惡意報表獨立輸出 | ✅ done |
| [T63-malicious-cli](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T063-malicious-cli.md) | CLI 整合惡意報表旗標 | ✅ done |
| [T64-injection-report](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T064-injection-report.md) | Injection 偵測獨立報表輸出 | ✅ done |
| [T65-canonical-entity-model](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T065-canonical-entity-model.md) | Canonical Entity Model — Unified entity struct for all AI ecosystem types | ✅ done |
| [T66-entity-classification-enum](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T066-entity-classification-enum.md) | Entity Classification Enum — Primary classification types (MCP_SERVER, MCP_CLIENT, AI_AGENT, etc.) | ✅ done |
| [T67-entity-status-enum](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T067-entity-status-enum.md) | Entity Status Enum — DISCOVERED, CANDIDATE, VERIFIED, QUARANTINED, REJECTED | ✅ done |
| [T68-taiwan-relevance-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T068-taiwan-relevance-engine.md) | Taiwan Relevance Engine — Decouple from MCP identity, independent scoring | ✅ done |
| [T69-taiwan-signal-dictionary](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T069-taiwan-signal-dictionary.md) | Taiwan Signal Dictionary — Configurable Taiwan keywords/domains (YAML) | ✅ done |
| [T70-ai-relevance-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T070-ai-relevance-engine.md) | AI Relevance Engine — Independent AI scoring (LLM, agent, RAG, etc.) | ✅ done |
| [T71-ai-signal-dictionary](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T071-ai-signal-dictionary.md) | AI Signal Dictionary — Configurable AI keywords/patterns (YAML) | ✅ done |
| [T72-entity-classifier](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T072-entity-classifier.md) | Entity Classifier — Rule-based primary classification with evidence | ✅ done |
| [T73-llm-classifier-fallback](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T073-llm-classifier-fallback.md) | LLM Classifier Fallback — For ambiguous cases (score 20-55) | 📋 pending |
| [T74-mcp-identity-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T074-mcp-identity-engine.md) | MCP Identity Engine — Static analysis for MCP server implementation | ✅ done |
| [T75-mcp-role-detection](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T075-mcp-role-detection.md) | MCP Role Detection — CLIENT, HOST, SDK, SKILL, EXTENSION separation | 📋 pending |
| [T76-endpoint-type-classifier](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T076-endpoint-type-classifier.md) | Endpoint Type Classifier — REPOSITORY_URL, DOCUMENTATION_URL, INSTALLER_URL, MCP_RUNTIME_ENDPOINT | 📋 pending |
| [T77-url-evidence-tracking](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T077-url-evidence-tracking.md) | URL Evidence Tracking — Record why each URL was classified | 📋 pending |
| [T78-mcp-runtime-verifier](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T078-mcp-runtime-verifier.md) | MCP Runtime Verifier — initialize + tools/list handshake | 📋 pending |
| [T79-runtime-verification-status](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T079-runtime-verification-status.md) | Runtime Verification Status — MCP_CANDIDATE, MCP_STATIC_VERIFIED, MCP_RUNTIME_VERIFIED, NOT_MCP | 📋 pending |
| [T80-security-scanner-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T080-security-scanner-integration.md) | Security Scanner Integration — Detect obfuscation, credential extraction, remote binary download | 📋 pending |
| [T81-security-status-enum](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T081-security-status-enum.md) | Security Status Enum — CLEAN, SUSPICIOUS, QUARANTINED, BLOCKED | 📋 pending |
| [T82-quality-engine-refactor](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T082-quality-engine-refactor.md) | Quality Engine Refactor — Independent from classification, per spec weights | 📋 pending |
| [T83-registry-view-generator](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T083-registry-view-generator.md) | Registry View Generator — taiwan-ai-ecosystem.md, taiwan-mcp.md, taiwan-ai-agents.md, etc. | 📋 pending |
| [T84-database-schema-migration](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T084-database-schema-migration.md) | Database Schema Migration — SQLite schema for new entity model | 📋 pending |
| [T85-migration-pipeline](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T085-migration-pipeline.md) | Migration Pipeline — Load, normalize, classify, score, verify existing records | 📋 pending |
| [T86-backward-compatibility](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T086-backward-compatibility.md) | Backward Compatibility — Keep awesome-taiwan-mcp.md as generated view | 📋 pending |
| [T87-acceptance-test-suite](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T087-acceptance-test-suite.md) | Acceptance Test Suite — 12 test cases from spec §56 | 📋 pending |
| [T88-fp-rate-test](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T088-fp-rate-test.md) | MCP False Positive Rate Test — Target <5% | 📋 pending |
| [T89-discovery-pipeline-refactor](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T089-discovery-pipeline-refactor.md) | Discovery Pipeline Refactor — Broad discovery (Taiwan + AI), no MCP keyword filter | 📋 pending |
| [T90-source-adapter-updates](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T090-source-adapter-updates.md) | Source Adapter Updates — Treat registries as discovery sources, not proof | 📋 pending |
| [T91-cli-coordinator-updates](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T091-cli-coordinator-updates.md) | CLI & Coordinator Updates — New pipeline stages | 📋 pending |
| [T92-documentation-update](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T092-documentation-update.md) | Documentation Update — README, spec.md alignment | 📋 pending |
| [T93-coordinator-refactor](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-ai-ecosystem/tasks/T093-coordinator-refactor.md) | Crawler Coordinator 重構 - 適配新 Entity 模型與協調器邏輯修復 | 📋 pending |

**✅ done: 70 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 23**

> 自動生成於 2026-09-05 22:57
