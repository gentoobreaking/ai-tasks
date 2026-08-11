---
github_issue: null
title: .env.example 補齊未文件化環境變數
type: docs
priority: low
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
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
- （T070 新增）`TELEGRAM_WEBHOOK_SECRET`

另有一致性問題：`.env.example:63` `PORT=4096` vs `telegram_bot.py:56` 預設 8080 vs docs/deployment/telegram-bot.md:120 文件 8080。此外 `.env.example:51,57,62` 的 `DATABASE_URL`/`LOG_FORMAT`/`HOST` 零消費，可標示為預留或移除。

## 驗收標準
- [ ] `.env.example` 收錄上述全部變數（含註解說明用途與預設值）
- [ ] PORT 預設三處一致（example / code / docs）
- [ ] 零消費變數（DATABASE_URL / LOG_FORMAT / HOST）標示「預留」或從 example 移除並同步文件
- [ ] 與 README 的環境變數章節對齊（如需）
- [ ] 不引入行為變更：pytest 全量通過

## 備註
- 純文件任務；若發現 example 與程式預設衝突，以程式預設為準並修正 example/docs