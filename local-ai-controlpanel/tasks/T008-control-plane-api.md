---
github_issue: N/A
title: Control Plane API（Phase 1）：Fastify REST + SSE（§45.5 契約）
type: feature
priority: high
status: pending
depends_on: [T005, T006, T007]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13
---

# T008 - Control Plane API（Fastify REST + SSE）

## 目標

依 spec §45.5 API 契約：Fastify server 提供全部 REST endpoint + SSE 事件串流，**只 bind `127.0.0.1`**（§45.3）；SSE event schema 與 §45.5 / §32 一致。此任務讓 T001–T004 的 UI 真正連通。

## 驗收標準

- [ ] `POST /api/v1/tasks`（body: userRequest, workspace?, sandboxMode?）
- [ ] `GET /api/v1/tasks`（含 status / attempt / sandboxMode）與 `GET /api/v1/tasks/:id`
- [ ] `GET /api/v1/tasks/:id/events` — SSE 串流（stage/evidence/verification/reflection/done，§45.5 schema）
- [ ] `POST /api/v1/tasks/:id/cancel`（對應 CLI esc）與 `POST /api/v1/tasks/:id/approve`
- [ ] `GET /api/v1/sandbox`、`GET /api/v1/strategy/:id`（input 先 stub，實作於 T016 / T010）
- [ ] 與 Desktop UI 連通測試：建立 task → 串流事件 → 取消，皆正常
- [ ] 確認 server 僅 listen 127.0.0.1（無對外介面）

## 備註

- SSE 事件由 T007 state machine 的轉移 / T020 reflection 等內部事件驅動（pub/sub 或 emitter）。
- zod 做 request/response 驗證（§6 選型）。
- 此為 UI Track 的 blocking dependency：UI-5（T025）與 UI-6（T026）都靠此 API。