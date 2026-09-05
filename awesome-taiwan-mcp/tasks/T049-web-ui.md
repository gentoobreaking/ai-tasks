---
github_issue: N/A
title: > ⛔ Web UI — registry browse + Taiwan MCP discovery dashboard (Phase 4)
assignee: pi with opencode
type: feat
priority: low
status: pending
depends_on: []
blocked_on:
- "REST API complete (T048)"
- "Phase 1+2+3 complete (crawler, historical snapshots, REST API)"
created: 2026-09-05
updated: 2026-09-05
---

# T049 - > ⛔ Web UI — registry browse + Taiwan MCP discovery dashboard (Phase 4)

## 目標

建立 Web UI dashboard。對應 CRAWLER_AGENT_TASKS.md §49 TASK-049, §49 Web UI, §67 MVP Scope Phase 4。

> ⛸ 本任務受外部條件約束：blocked_on 全數滿足前不得開工。

## 驗收標準

- [ ] `web/` 目錄建立 (React/Vite 或 SvelteKit)
- [ ] `GET /` → registry browse page (server list, search, filter by level/category/health/quality)
- [ ] Server detail page: full metadata, tools/resources/prompts, evidence, quality score, Taiwan relevance
- [ ] Dashboard: total servers, Taiwan breakdown by level, health status, quality grades
- [ ] Search: 關鍵字搜索 + filters (level, category, health, min-score, transport, official-source)
- [ ] Web UI 呼叫 REST API (T048)
- [ ] Responsive design (mobile + desktop)
- [ ] Web UI build (`npm run build`) 成功
- [ ] Web UI 單元測試: search + filter + sort 功能

## 備註

- v0.1 不包含 Web UI (§67 MVP Scope: Phase 4)
- Web UI 用於 browse registry, 不是用於 crawl
- 可以使用純 Go templates (server-side rendering) 簡化部署
