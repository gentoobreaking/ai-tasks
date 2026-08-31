---
id: T033
project: tw-quant-db
assignee: "pi"
priority: medium
type: infrastructure
status: done
depends_on: [T032]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-31
updated: 2026-08-31
---

# T033 - docker-compose.yml Backfill Service

## 目標
添加 Go backfill service 到 `docker-compose.yml`，使用 spec §9 的 profiles 設定。

## 驗收標準
- [x] `services.backfill` with `build.dockerfile: Dockerfile.backfill`
- [x] `container_name: tw-quant-backfill` (project convention)
- [x] `profiles: ["backfill"]` — opt-in
- [x] Environment vars: `DATABASE_URL`, `MCP_HOST`, `STOCK_IDS`, `STOCKS_FILE`, `BACKFILL_ALL_LISTED`, `BACKFILL_SOURCES`, `FINMIND_API_KEY`
- [x] `restart: "no"` (one-shot job)
- [x] Depends on postgres + MCP services

## 備註
- spec §9 yaml template 提供完整 environment block
- spec §14 Environment Variable Control: BACKFILL_SOURCES
