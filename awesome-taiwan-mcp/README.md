# awesome-taiwan-mcp

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
| [T47-historical-snapshots](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T047-historical-snapshots.md) | > ⛔ Historical Snapshots — crawl run history + time-series data (Phase 2) | |
| [T48-rest-api](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T048-rest-api.md) | > ⛔ REST API — HTTP API for registry search + metadata (Phase 4) | |
| [T49-web-ui](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T049-web-ui.md) | > ⛔ Web UI — registry browse + Taiwan MCP discovery dashboard (Phase 4) | |

## Task 列表

| # | 名稱 | 狀態 |
|---|------|------|
| [T1-project-bootstrap](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T001-project-bootstrap.md) | 專案初始化 — Go module, Dockerfile, README, CLI scaffold | ✅ done |
| [T2-domain-models](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T002-domain-models.md) | 領域模型 — MCPServer, RawCandidate, RawRecord, TaiwanRelevance 等 | ✅ done |
| [T3-json-schema](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T003-json-schema.md) | JSON Schema — mcp-server.json, registry.json schema 驗證 | ✅ done |
| [T4-sqlite-storage](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T004-sqlite-storage.md) | SQLite 持久化 — migrations, storage 層實現 | ✅ done |
| [T5-source-adapter-interface](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T005-source-adapter-interface.md) | Source Adapter 介面 — Discover + Fetch interface + mock adapter | ✅ done |
| [T6-github-adapter](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T006-github-adapter.md) | GitHub Adapter — keyword matrix 搜尋 + candidate 提取 | ✅ done |
| [T7-github-rate-limit](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T007-github-rate-limit.md) | GitHub Rate Limit — rate limiter, retry, 429 handling, timeout, context cancellation | ✅ done |
| [T8-normalizer](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T008-normalizer.md) | Normalizer — RawRecord → MCPServer 統一轉換 | ✅ done |
| [T9-manifest-detector](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T009-manifest-detector.md) | Manifest Detector — 偵測 package.json, pyproject.toml, go.mod, Cargo.toml, mcp.json 等 | ✅ done |
| [T10-identity-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T010-identity-engine.md) | Identity Engine — CanonicalIdentity + ServerID 生成 | ✅ done |
| [T11-deduplication-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T011-deduplication-engine.md) | Deduplication Engine — 合併來自多個 source 的相同 MCP | ✅ done |
| [T12-taiwan-keyword-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T012-taiwan-keyword-engine.md) | Taiwan Keyword Engine — config-driven keyword classification | ✅ done |
| [T13-taiwan-domain-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T013-taiwan-domain-engine.md) | Taiwan Domain Engine — official domains config + detection | ✅ done |
| [T14-taiwan-scoring](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T014-taiwan-scoring.md) | Taiwan Scoring — deterministic relevance score + level mapping | ✅ done |
| [T15-evidence-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T015-evidence-engine.md) | Evidence Engine — scoring rule evidence provenance | ✅ done |
| [T16-official-registry-adapter](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T016-official-registry-adapter.md) | Official MCP Registry Adapter — discovery + metadata fetch | ✅ done |
| [T17-glama-adapter](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T017-glama-adapter.md) | > ⛔ Glama Adapter — discovery + metadata fetch (Phase 2, needs Glama API) | ✅ done |
| [T18-pulsemcp-adapter](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T018-pulsemcp-adapter.md) | > ⛔ PulseMCP Adapter — discovery + metadata fetch (Phase 2, needs PulseMCP API) | ✅ done |
| [T19-mcpso-adapter](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T019-mcpso-adapter.md) | > ⛔ MCP.so Adapter — discovery + metadata fetch (Phase 2, needs MCP.so API) | ✅ done |
| [T20-source-aggregation](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T020-source-aggregation.md) | Source Aggregation — 合併多個 source 的 metadata | ✅ done |
| [T21-repository-verification](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T021-repository-verification.md) | Repository Verification — HTTP, Git, README, manifest, archive status | ✅ done |
| [T22-mcp-protocol-verification](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T022-mcp-protocol-verification.md) | MCP Protocol Verification — initialize, tools/list, resources/list, prompts/list | ✅ done |
| [T23-endpoint-health](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T023-endpoint-health.md) | Endpoint Health — DNS, TLS, HTTP, MCP initialize, latency | ✅ done |
| [T24-tool-extraction](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T024-tool-extraction.md) | Tool Extraction — tools/list 結果保存 | ✅ done |
| [T25-quality-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T025-quality-engine.md) | Quality Engine — 10-component 100-point scoring | ✅ done |
| [T26-security-scanner](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T026-security-scanner.md) | Security Scanner — static analysis of discovered MCP code | ✅ done |
| [T27-registry-persistence](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T027-registry-persistence.md) | Registry Persistence — pipeline → SQLite idempotent write | ✅ done |
| [T28-json-registry-export](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T028-json-registry-export.md) | JSON Registry Export — registry.json, registry.min.json, categories, sources, statistics, health | ✅ done |
| [T29-crawl-coordinator](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T029-crawl-coordinator.md) | Crawl Coordinator — full pipeline orchestration | ✅ done |
| [T30-crawl-run](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T030-crawl-run.md) | Crawl Run — metadata tracking per execution | ✅ done |
| [T31-cli](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T031-cli.md) | CLI — crawl, verify, dedupe, score, export, stats, search commands | ✅ done |
| [T32-incremental-crawl](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T032-incremental-crawl.md) | Incremental Crawl — ETag, pushed_at, last_seen tracking | ✅ done |
| [T33-retry-backoff](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T033-retry-backoff.md) | Retry & Backoff — unified retry logic, context cancellation | ✅ done |
| [T34-metrics-logging](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T034-metrics-logging.md) | Metrics & Logging — Prometheus metrics + structured JSON logging | ✅ done |
| [T35-llm-classifier](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T035-llm-classifier.md) | > ⛔ LLM Classifier — ambiguous Taiwan classification (Phase 4, needs LLM API) | ✅ done |
| [T36-search-api](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T036-search-api.md) | Search API — registry search by keyword, level, category, min-score | ✅ done |
| [T37-capability-search](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T037-capability-search.md) | Capability Search — tool/resource/data-source capability matching | ✅ done |
| [T38-test-fixtures](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T038-test-fixtures.md) | Test Fixtures — taiwan, non-taiwan, duplicate, archived, dead endpoint, invalid, official, scraping | ✅ done |
| [T39-unit-tests](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T039-unit-tests.md) | Unit Tests — >=80% coverage for critical modules | ✅ done |
| [T40-integration-tests](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T040-integration-tests.md) | Integration Tests — adapter, SQLite, MCP handshake via mock servers | ✅ done |
| [T41-e2e-test](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T041-e2e-test.md) | End-to-End Test — full pipeline with mock sources | ✅ done |
| [T42-docker](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T042-docker.md) | Docker — Dockerfile + docker-compose with security best practices | ✅ done |
| [T43-security-boundary](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T043-security-boundary.md) | Security Boundary — enforce never-execute-discovered-code policy | ✅ done |
| [T44-documentation](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T044-documentation.md) | Documentation — README with all required sections | ✅ done |
| [T45-final-verification](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T045-final-verification.md) | Final Verification — full build + test + crawl + export validation | ✅ done |
| [T46-regression-golden](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T046-regression-golden.md) | Regression Golden Dataset — TST-068 classification/identity/dedup accuracy | ✅ done |
| [T47-historical-snapshots](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T047-historical-snapshots.md) | > ⛔ Historical Snapshots — crawl run history + time-series data (Phase 2) | 📋 pending |
| [T48-rest-api](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T048-rest-api.md) | > ⛔ REST API — HTTP API for registry search + metadata (Phase 4) | 📋 pending |
| [T49-web-ui](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T049-web-ui.md) | > ⛔ Web UI — registry browse + Taiwan MCP discovery dashboard (Phase 4) | 📋 pending |
| [T50-static-analysis-ci](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T050-static-analysis-ci.md) | Static Analysis CI — golangci-lint + gosec security linting | ✅ done |
| [T51-performance-benchmark](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T051-performance-benchmark.md) | Performance Benchmark — 10k candidates, <10min, no OOM | ✅ done |
| [T52-production-smoke](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T052-production-smoke.md) | Production Smoke Test — live GitHub + Registry crawl + export | ✅ done |
| [T53-verification-manual-tests](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T053-verification-manual-tests.md) | Verification Manual Tests — mapping CRAWLER_VERIFICATION_MANUAL to automated tests | ✅ done |
| [T54-kpi-verification](https://github.com/gentoobreaking/ai-tasks/blob/main/awesome-taiwan-mcp/tasks/T054-kpi-verification.md) | KPI Verification — Recall, Precision, Duplicate rate, False positive | ✅ done |

**✅ done: 51 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 3**

> 自動生成於 2026-09-05 10:06
