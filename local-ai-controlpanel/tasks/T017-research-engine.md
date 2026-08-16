---
github_issue: N/A
title: Research Engine（Phase 3）：Python service + 四種 retriever
type: feature
priority: high
status: done
depends_on:
- T005
- T008
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: '2026-08-17'
spec_version: v3
---
# T017 - Research Engine（Python）

## 目標

依 spec §12：Python research service（FastAPI + httpx + BeautifulSoup + trafilatura + Pydantic，§6 選型），deterministic pipeline + LLM optional；四種 retriever **全部啟用**（§12.1：Repository / Documentation / Git History / Web），依來源優先順序（repo → git history → package metadata → 官方 docs → GitHub upstream → trusted → general web）；Control Plane 以 HTTP 呼叫（唯一跨語言 IPC 層，§6 決策紀錄）。

## 驗收標準

- [x] Query Planner（由 task + policy 產生查詢）實作
- [x] Repository Retriever（repo code / config / 既有 pattern）
- [x] Documentation Retriever（本地 docs → 官方 documentation）
- [x] Git History Retriever（git log / blame / 近期變更）
- [x] Web Retriever（官方網站 / GitHub upstream / issue / release note；**web 是最後手段**）
- [x] 標準化 pipeline：Search → Retrieve → Extract → Normalize → Version filter → Deduplicate → Cross-check → Evidence（§13）
- [x] HTTP API 供 Control Plane（only Research Engine 有網，§28 邊界）
- [x] 查詢 Project Memory 避免重查已知內容（§26，先簡單實作）

## 備註

- search provider 未定案（§44 Q2：Tavily / Brave / 自建），先選定一個（建議 Tavily 或 httpx 直抓官方 docs）並在 config 標明。
- 本任務是「第一個真正重要的 milestone」（§38 Phase 3）。