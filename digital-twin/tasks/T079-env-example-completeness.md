---
github_issue: null
title: .env.example 補齊未文件化環境變數
type: docs
priority: low
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-14'
---
# T079 - .env.example 補齊環境變數

## 目標
`.env.example` 缺多個程式實際讀取的變數，新操作者無法依 example 設定系統：
- `DEFAULT_IMPL_MODEL`（config.py:193）
- `LOCAL_RELAY_URL`（:188）、`OLLAMA_URL`/`OLLAMA_MODEL`（:189-190）
- `TELEGRAM_SEND_URL`（:209-210）
- `OPENCODE_DB_PATH`（:200-201、extract_feedback.py:16）
- `EMBEDDING_PROVIDER/MODEL/DIM/BASE_URL`（embedding.py:11-14、incremental_index.py:49）
- `DISCUSS_TOKEN_BUDGET`（discussion_orchestrator/orchestrator.py:66）
- `DOCTOR_TELEGRAM_NOTIFY`（doctor.py:488-496）
- （T070 新增）`TELEGRAM_WEBHOOK_SECRET`（已存在）

另有一致性問題：`.env.example:63` `PORT=4096` vs `telegram_bot.py:56` 預設 8080 vs docs/deployment/telegram-bot.md:120 文件 8080。此外 `.env.example:51,57,62` 的 `DATABASE_URL`/`LOG_FORMAT`/`HOST` 零消費，可標示為預留或移除。

## 驗收標準
- [x] `.env.example` 收錄上述全部變數（含註解說明用途與預設值）
- [x] PORT 預設三處一致（example / code / docs）：統一為 8080
- [x] 零消費變數（DATABASE_URL / LOG_FORMAT / HOST）標示「預留」並註解說明
- [x] 與 README 的環境變數章節對齊（如需）
- [x] 不引入行為變更：pytest 全量通過

## 實作摘要

### 新增環境變數（含註解與預設值）
- `DEFAULT_IMPL_MODEL`：自動開發預設實作模型
- `LOCAL_RELAY_URL` / `OLLAMA_URL` / `OLLAMA_MODEL`：本地模型備援
- `TELEGRAM_SEND_URL`：Telegram sendMessage API（含 {token} 佔位符）
- `OPENCODE_DB_PATH`：OpenCode SQLite DB 路徑
- `EMBEDDING_PROVIDER` / `EMBEDDING_MODEL` / `EMBEDDING_DIM` / `EMBEDDING_BASE_URL`：Embedding 向量搜尋設定
- `DISCUSS_TOKEN_BUDGET`：多 AI 討論 token 預算上限
- `DOCTOR_TELEGRAM_NOTIFY`：Doctor 異常推播開關

### PORT 一致性修正
- `.env.example`：`PORT=8080`（原 4096）
- `telegram_bot.py:56`：`WEBHOOK_PORT = int(os.getenv("PORT", "8080"))`（一致）
- `docs/deployment/telegram-bot.md:120`：文件宣稱 8080（一致）

### 零消費變數處理
- `DATABASE_URL`、`LOG_FORMAT`、`HOST`：改為註解並標示「預留：目前未消費，將在未來...」
- 不直接移除以避免破壞未來擴充計畫

### 驗證
- pytest：265 passed + 1 skipped
- ruff：All checks passed
- pyright：0 new errors

## 備註
- 純文件任務；若發現 example 與程式預設衝突，以程式預設為準並修正 example/docs
- 已移除未使用的 `LOG_LEVEL` 預設值修改（保持 INFO）