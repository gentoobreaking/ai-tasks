---
github_issue: N/A
title: SSE client + Task 列表 + 事件串流（UI-3）
type: feature
priority: high
status: done
depends_on: [T002]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13
---

# T003 - SSE client + Task 列表 + 事件串流（UI-3）

## 目標

依 spec §45.5 / §45.6（UI-3）：實作 Control Plane HTTP client（`src/api/client.ts`）——Task 列表輪詢、SSE 事件串流（EventSource，自動重連）、事件型別與 §45.5 SSE schema 一致（stage / evidence / verification / reflection / done）。

## 驗收標準

- [x] `GET /api/v1/tasks` 列表輪詢（5s interval）＋ `POST /api/v1/tasks` 建立
- [x] `subscribeTaskEvents`：EventSource 訂閱 `:id/events`，onerror 標記斷線並自動重連
- [x] StageEvent 型別與 §45.5 schema 對齊（stage/evidence/verification/reflection/done）
- [x] TaskList 點擊切換 task、TaskStream 串流顯示事件

## 備註

- 連線目標 `http://127.0.0.1:3001`（VITE_CP_URL / VITE_CP_PORT 可覆寫），API 只 bind 本機（§45.3）。
- **目前 Control Plane 尚不存在**（待 T008），此 client 已通過型別與 build 驗證，連通測試在 T008 驗收。
