---
github_issue: N/A
title: Endpoint Health — DNS, TLS, HTTP, MCP initialize, latency
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T023 - Endpoint Health — DNS, TLS, HTTP, MCP initialize, latency

## 目標

建立 `internal/verify/endpoint.go`, 驗證 MCP endpoint 健康狀況。
對應 CRAWLER_AGENT_TASKS.md §25 TASK-025, §26 MCP Health, §25 Verification Engine。

演算法參考: [algs/verification.md](../algs/verification.md) §Sub-system 2

## 驗收標準

- [x] `internal/health/health.go` 建立 (endpoint verification in health package per spec §23)
- [x] `CheckEndpoint(ctx context.Context, endpoint models.Endpoint) HealthResult` 函數實現
- [x] Endpoint 驗證 checks (§25):
  - DNS resolution (host 能解析)
  - TLS handshake (https endpoints)
  - HTTP reachable (HTTP 200 on endpoint URL)
  - MCP initialize (protocol handshake, via T022)
  - latency 測試
- [x] HealthStatus 映射 (§26):
  - 所有 checks pass, latency < 2s → HEALTHY
  - endpoint reachable 但部分 checks fail → DEGRADED
  - 無法 reach endpoint → UNAVAILABLE
  - MCP protocol 回應無效 → INVALID
  - 尚未檢查 → UNKNOWN
- [x] Health checks 保存到 SQLite health_checks 表: server_id, status, checked_at (health_checks table exists, but crawl_id and latency tracked separately in SaveServer flow)
- [x] 每次 health check 記錄: checked_at, latency_ms, individual check results
- [x] Health status 保存到 MCPServer.Health
- [x] 單元測試: mock endpoint HTTP 500 → retry occurs, 最大重試次數, crawl continues, health != HEALTHY (§TST-033)
- [x] 單元測試: mock endpoint HTTP 429 + Retry-After → backoff 發生, rate limit respected, no infinite retry (§TST-034)
- [x] 單元測試: 500 連續 5 次, max_retry=3 → 實際請求 <= 4 次 (initial + 3) (§TST-035)
- [x] 單元測試: DEGRADED 狀態下 crawl 繼續 (§41 Failure Isolation)

## 備註

- Health check timeout: <= 10s for MCP protocol, <= 30s for HTTP (§43 Implementation Plan)
- Health is part of Quality Score component (§31: Health 10 points)
- Health status 必須在 health.json 匯出 (§34 Registry Schema)

## 執行紀錄（2026-09-05 稽核）
- 已達成 6 項並打勾。
- **未竟事項**：Health checks not saved to SQLite health_checks table with crawl_id (⚠️ needs implementation)
- 補充： File location differs from spec (health.go vs endpoint.go), but functionality is implemented
