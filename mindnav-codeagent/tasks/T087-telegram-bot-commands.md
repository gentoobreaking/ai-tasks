---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/594
title: T087 - Telegram Bot 指令擴充
type: Feature
priority: high
assignee: OpenCode DeepSeek V4 Flash
status: done
created: 2026-05-18
updated: 2026-05-21
howto: implement
---

# T087 - Telegram Bot 指令擴充

## 目標

將 Telegram Bot 從現有的基本指令擴充至完整指令集，支援中斷、模式切換、任務管理、Session 管理等功能。

## 現有已實作指令

| 指令 | 功能 |
|------|------|
| `/start` | 顯示說明 |
| `/set_project` | 設定專案路徑 |
| `/sync_rag` | 同步 RAG |
| `/forget` | 清除 thread 記憶 |
| `/memory_stats` | 顯示記憶體統計 |

## 待實作指令

| 指令 | 別名 | 功能 | 優先級 |
|------|------|------|--------|
| `/interrupt` | `x` | 立市中斷當前操作 | P0 |
| `/plan` | `/build` | 切換 Plan/Build 模式 | P0 |
| `/sessions` | — | 列出近期 active/past sessions | P1 |
| `/projects` | — | 顯示可用專案 | P1 |
| `/undo` | `/redo` | 復原/重做上一個 AI 變更 | P2 |
| `/rename` | — | 重新命名當前 session | P2 |
| `/task` | `/tasklist` | 建立/管理定期任務（如每日代碼摘要） | P3 |

## 驗收標準

- [x] `/interrupt` 清除 Redis checkpoint + MemoryManager 達成中斷
- [x] `/plan` / `/build` 切換 chat_data mode，後續可影響 use_dynamic_tasks
- [x] `/sessions` 列出 Redis checkpointer 中的 thread 清單（alist）
- [x] `/projects` 顯示已註冊的專案（從 project_registry）
- [x] `/undo` 還原至上一個 checkpoint parent_config
- [x] `/rename <新名稱>` 更新 session 名稱（存入 data/session_names.json）
- [x] `/task` / `/tasklist` 呼叫既有 _cmd_task_list
- [x] `/interrupt` 可用 `x` 文字觸發（MessageHandler + Regex）

## 實作細節

### /interrupt

```python
async def cmd_interrupt(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
    """立即中斷當前 workflow"""
    thread_id = str(update.effective_chat.id)
    config = {"configurable": {"thread_id": thread_id}}

    # 呼叫 graph.interrupt() 或直接刪除 checkpoint
    self.graph.interrupt(thread_id)
    # 或使用 LangGraph interrupt_before 機制

    await update.message.reply_text("🛑 已中斷當前操作")
```

### /plan / /build 模式切換

```python
async def cmd_plan(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
    """切換為 Plan 模式 — 逐步規劃不執行"""
    context.chat_data["mode"] = "plan"
    await update.message.reply_text("📋 模式切換為 Plan（不執行）")

async def cmd_build(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
    """切換為 Build 模式 — 正常執行"""
    context.chat_data["mode"] = "build"
    await update.message.reply_text("🔨 模式切換為 Build（執行）")
```

### /sessions

```python
async def cmd_sessions(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
    """列出近期 sessions"""
    # 從 Redis 讀取 checkpoint keys
    # 回覆格式：active sessions / past sessions
```

### /interrupt "x" 別名

在 `MessageHandler` 加入文字 "x" 的處理：

```python
app.add_handler(MessageHandler(filters.Regex(r"^(x|X)$"), self.cmd_interrupt))
```

## 備註

- `graph.interrupt()` 機制需確認 LangGraph 版本是否支援
- Session 持久化依賴 T068 的 Redis checkpointer
- 任務排程需要 scheduler 機制（Celery? APScheduler?）

T087 complete. All new commands implemented in `interface/tg_bot.py`:

| 指令 | 實現方式 |
|------|---------|
| `/interrupt` + text `x` | `checkpointer.adelete_thread()` + `memory_manager.forget_thread()` 清除所有 checkpoint; `MessageHandler(filters.Regex(r'^(x|X)$'))` 文字觸發 |
| `/plan` / `/build` | `chat_data["mode"]` 切換，影響後續 graph config 中的 `use_dynamic_tasks` |
| `/sessions` | `checkpointer.alist(config, limit=50)` 列出 Redis 中所有 thread_id |
| `/projects` | `list_projects()` 從 `engine.project_registry` 讀取 |
| `/undo` | `aget_tuple()` → `parent_config` → `aput()` 回到上一個 checkpoint |
| `/rename` | 寫入 `data/session_names.json` + `chat_data["session_name"]` |
| `/task` / `/tasklist` | 委派到既有 `_cmd_task_list()` |
| `/start` | 更新為完整幫助訊息含所有新指令 |

Handler registration order: CommandHandlers → CallbackQueryHandler → `x` Regex MessageHandler → general text handler.

