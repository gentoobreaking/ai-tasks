---
github_issue: N/A
title: Registry Persistence — pipeline → SQLite idempotent write
assignee: pi with opencode
type: feat
priority: high
^status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T027 - Registry Persistence — pipeline → SQLite idempotent write

## 目標

將完整 pipeline 結果 (discover → normalize → dedupe → classify → verify → score) 寫入 SQLite, 必須 idempotent。
對應 CRAWLER_AGENT_TASKS.md §29 TASK-029, §36 Storage Architecture, §TST-037 SQLite Idempotency。

## 驗收標準

- [x] `internal/storage/` 中實現 `SaveServer(server *MCPServer, crawlID string) error`
- [x] `SaveServer` 使用 upsert (ON CONFLICT DO UPDATE) 基於 CanonicalID (T010)
- [x] Server 資料寫入 `mcp_servers` 表: id, name, slug, description, category, region, taiwan_relevance, repository, endpoints, transport, tools, resources, prompts, data_sources, license, status, quality, first_seen_at, last_seen_at, last_verified_at
- [x] Repository 資料寫入 `repositories` 表 (1:1 with mcp_servers)
- [x] Endpoints 資料寫入 `endpoints` 表 (1:N)
- [x] Tools 資料寫入 `tools` 表 (1:N)
- [x] Resources 資料寫入 `resources` 表 (1:N)
- [x] Prompts 資料寫入 `prompts` 表 (1:N)
- [x] DataSources 資料寫入 `data_sources` + `server_data_sources` 表 (N:M)
- [x] Sources 資料寫入 `sources` + `server_sources` 表 (N:M, §24)
- [x] Health checks 寫入 `health_checks` 表
- [x] Quality scores 寫入 `quality_scores` 表
- [x] Evidence 寫入 `evidence` 表
- [x] Security findings 寫入 `security_findings` 表
- [x] Crawl run 寫入 `crawl_runs` 表
- [x] Server snapshots 寫入 `server_snapshots` 表 (append-only)
- [x] 執行兩次相同 crawl → server count 無變化, duplicate primary keys = 0, duplicate server IDs = 0 (§TST-037)
- [x] `GetServers() ([]MCPServer, error)` 函數實現: 從 SQLite 重建完整 MCPServer
- [x] `GetServerIDs() ([]string, error)` 函數實現
- [x] `GetTaiwanServers(level string) ([]MCPServer, error)` 函數實現 (for search)
- [x] 單元測試: upsert 相同 server 兩次 → 僅 1 個 record

## 備註

- Persistence 必須 idempotent (§TASK-027 Acceptance)
- first_seen_at 在第一次插入時設置, last_seen_at 在每次 upsert 時更新
- Server snapshots 是 append-only, 保留歷史數據 (§62 Historical Data)

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
