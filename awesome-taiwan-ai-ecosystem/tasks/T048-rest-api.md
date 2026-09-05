---
github_issue: N/A
title: > ⛔ REST API — HTTP API for registry search + metadata (Phase 4)
assignee: pi with opencode
type: feat
priority: low
status: pending
depends_on: []
blocked_on:
- "Phase 1+2+3 complete (crawler, historical snapshots, web UI foundation)"
created: 2026-09-05
updated: 2026-09-05
---

# T048 - > ⛔ REST API — HTTP API for registry search + metadata (Phase 4)

## 目標

建立 REST API server。對應 CRAWLER_AGENT_TASKS.md §48 TASK-048, §48 REST API, §67 MVP Scope Phase 4。

> ⛔ 本任務受外部條件約束：blocked_on 全數滿足前不得開工。

## 驗收標準

- [ ] `cmd/api/` 目錄建立, Go HTTP server (標準 library 或 gin)
- [ ] `GET /api/v1/health` → {"status":"ok"}
- [ ] `GET /api/v1/servers` → 回傳所有 servers (支援 pagination, filtering, sorting)
- [ ] `GET /api/v1/servers/{id}` → 回傳單一 server 詳細資料
- [ ] `GET /api/v1/search?q=keyword` → 支援關鍵字搜索, level, category, min-score 過濾
- [ ] `GET /api/v1/registry` → 回傳 registry.json 內容
- [ ] `GET /api/v1/statistics` → 回傳 statistics.json 內容
- [ ] `GET /api/v1/health` → 回傳 health.json 內容
- [ ] API 回應格式: pagination (page, limit, total, total_pages)
- [ ] API 支援 rate limiting (e.g. 100 req/min/IP)
- [ ] API 輸出與 SQLite/registry.json 一致
- [ ] API 單元測試: mock server 回傳 JSON → parsing correct
- [ ] API integration test: full query flow

## 備註

- v0.1 不包含 REST API (§67 MVP Scope: Phase 4)
- REST API 依賴 Search Engine (T036) 和 Registry Export (T028)
