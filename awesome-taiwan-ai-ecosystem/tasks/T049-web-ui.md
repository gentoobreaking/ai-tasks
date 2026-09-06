---
github_issue: N/A
title: Web UI — registry browse + Taiwan AI Ecosystem Registry discovery dashboard (Phase 4)
assignee: pi with opencode
type: feat
priority: medium
status: done
depends_on: []
depends_of: []
blocked: false
blocked_on: []
created: 2026-09-05
updated: 2026-09-06
---

# T049 - Web UI — registry browse + Taiwan MCP discovery dashboard

## 目標

建立 Web UI dashboard。對應 CRAWLER_AGENT_TASKS.md §49 TASK-049, §49 Web UI, §67 MVP Scope Phase 4。

## 驗收標準

- [x] `web/` 目錄建立 (React + Vite + TypeScript + Tailwind CSS)
- [x] `GET /` → registry browse page (server list, search, filter by level/category/health/quality)
- [x] Server detail page: full metadata, tools/resources/prompts, evidence, quality score, Taiwan relevance
- [x] Dashboard: total servers, Taiwan breakdown by level, health status, quality grades
- [x] Search: 關鍵字搜索 + filters (level, category, health, min-score, status, transport)
- [x] Web UI 呼叫 REST API (T048)
- [x] Responsive design (mobile + desktop)
- [x] Web UI build (`pnpm run build`) 成功
- [x] Web UI 單元測試: search + filter + sort 功能

## Implementation

- `web/index.html` — entry HTML
- `web/package.json` — dependencies (React 19, Vite, Tailwind, Vitest, ESLint)
- `web/vite.config.ts` — Vite config with API proxy
- `web/tsconfig.json` — TypeScript config
- `web/src/main.tsx` — React entry point with BrowserRouter
- `web/src/App.tsx` — Layout with navigation (Dashboard, Servers, Search)
- `web/src/pages/Dashboard.tsx` — Dashboard with statistics and charts
- `web/src/pages/ServerList.tsx` — Server list with filters and pagination
- `web/src/pages/ServerDetail.tsx` — Server detail page with full metadata
- `web/src/pages/Search.tsx` — Search page with keyword + filters
- `web/src/components/LevelBadge.tsx` — Taiwan relevance level badge
- `web/src/components/GradeBadge.tsx` — Quality grade badge
- `web/src/components/HealthBadge.tsx` — Health status badge
- `web/src/types/api.ts` — TypeScript types for API responses
- `web/src/utils/api.ts` — API client with typed methods
- `web/src/hooks/useApi.ts` — React hook for API calls
- `web/src/pages/Search.test.tsx` — Web UI tests
- `Dockerfile.multi` — Multi-stage build with `web` target (nginx static server)
- `docker-compose.yaml` — Web UI service mapped to port 3000

## Notes

- v0.1 originally excluded Web UI (§67 MVP Scope: Phase 4) — unblocked per user request
- Web UI calls the REST API (T048) for all data
- Uses React 19, Vite, TypeScript, Tailwind CSS
- Built as static files served by nginx in Docker
