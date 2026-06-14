---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/561
title: Session Browser
type: Feature
priority: medium
assignee: OpenCode DeepSeek V4 Flash
status: done
created: 2026-05-18
updated: 2026-05-21
howto: null
---

# T071 - Session Browser

## 目標
在 Dashboard 中實現 Session 瀏覽功能，讓用戶可以查看、過濾和搜索過往的 agent session 歷史，並在展開時看到完整對話紀錄。

## 驗收標準
- [x] Session 列表頁面（分頁顯示）
- [x] 每行顯示：session_id, timestamp, message_count, preview
- [x] 全文搜索（使用現有 FTS5）
- [x] 點擊展開查看 summary + outcome
- [x] 點擊展開查看完整 message history（從 Redis checkpointer 讀取）
- [x] 區分 user/assistant/system/tool 角色並用不同顏色標示
- [x] Tool call 折疊展開（連續工具呼叫群組可折疊）
- [x] Markdown 渲染（摘要渲染）
- [x] 刪除 session 功能
- [x] 顯示 live session（pulsing badge，10 秒 polling `/sessions/live`）

## 已實作功能

### Backend
- `GET /api/v1/sessions` — 列表（分頁 + date filter + FTS5 搜索）
- `GET /api/v1/sessions/search` — FTS5 全文搜索
- `GET /api/v1/sessions/live` — 查詢 Redis checkpointer 中最近 10 分鐘有活動的 thread_ids
- `GET /api/v1/sessions/{thread_id}` — 詳情（outcome + summary + cross_memory + **messages**）
- `DELETE /api/v1/sessions/{thread_id}` — 刪除（outcomes + summaries + cross_memory + Redis checkpoint）

### Frontend (SessionsPage.tsx)
- 分頁列表、搜索表單
- Session detail modal（outcome + summary + cross_memory）
- 完整訊息對話紀錄（點「💬 對話紀錄 (N)」展開）
- 角色色彩：`user` 藍、`assistant` 綠、`tool` 黃、`system` 灰
- 訊息內容過長時自動折疊（>500 字）
- 連續工具呼叫群組（ToolCallGroup）可整組折疊/展開
- Live session 偵測（10 秒 polling）+ 綠色脈動 dot + `● LIVE` 標籤
- 已選 session detail 每 8 秒自動 refresh（`selectedThreadIdRef` 避免 stale closure）

### Redis Checkpointer 讀取
- `_get_messages_from_redis(thread_id)` — 從 `RedisSaver` 讀取 `channel_values["messages"]`
- 格式：`[{type, role, content, name, id}, ...]`
- LangChain `type` 值（human/ai/system/tool）正確映射到色彩 key

## 備註
- 依賴 `use_redis=True`（Redis checkpointer 啟用時才有效）
- `REDIS_URL` 環境變數（預設 `redis://localhost:6379`）
- Live session 以最近 checkpoint timestamp 在 10 分鐘內判定
- 刪除 session 時同步刪除 Redis checkpoint + outcomes + summaries + cross_memory
