# T006 blocked review

- 任務: T006-telegram-bot-webhook
- 產生時間: 2026-08-07 18:42:59
- 目前狀態: done
- fail_count: 0
- 標記/摘要: 重啟成功：aiogram 3 Webhook + FastAPI + Redis Stream + Worker Pool + RBAC + 熔斷 實作完成並驗證

## 原始需求

## 背景
現有 `telegram_bot.py` 單進程輪詢，無熔斷、無速率限制、長任務阻塞主循環（DEC-02, SPEC-04, DeepSeek 第 1 輪建議 4, 第 2 輪建議 2.5）。
先前失敗 3 次（模型呼叫失敗：單進程內嵌呼叫 AI 模型），重啟時改採**背景 subprocess 執行 + 佇列解耦**，不再於 webhook 進程內呼叫模型。

## 需求
1. 重構為 `aiogram 3.x` Webhook 模式：
   - [x] `FastAPI` 提供 `/api/webhook`、`/metrics`、`/healthz`
   - [x] `Redis Stream` 做任務佇列（discuss、rag、feedback 等長任務）
   - [x] `Worker Pool` 背景執行 `multi_ai_discuss.py`（subprocess 隔離）
2. RBAC：`admin`/`operator`/`viewer` 角色，`.env` 設定 `TELEGRAM_ADMIN_IDS` 等
   - [x] admin/operator：/discuss /rag /stats；viewer：/status /help
3. 輸入經 `sanitize_input.py`（prompt injection / PII 規則）
   - [x] 注入/系統指令/路徑穿越 → 拒絕；PII → 遮罩
4. 熔斷：`pybreaker` 下游 AI API 失敗率 > 50% 自動熔斷 60s
   - [x] 連續 5 次失敗開路、成功重置（測試驗證）
5. 觀測：`prometheus-client` + `/metrics` endpoint
   - [x] T005 統一 observability + `tg_command_duration_seconds{command,role}` 埋點

## 驗收標準
- [x] `/discuss` 立即回應「已排入佇列」，完成後 push 通知（worker 完成後經 Bot API 通知 chat_id）
- [x] 並發多用戶無阻塞（Redis Stream + Worker Pool N 並發消費；webhook 僅入隊）
- [x] Prometheus 指標可用（/metrics 回傳 generate_latest，實測 4 HELP 系列）
- [x] /healthz 正常（實測 {"status":"ok"}）

## 驗收標準（11 項）

- [ ] `FastAPI` 提供 `/api/webhook`、`/metrics`、`/healthz`
- [ ] `Redis Stream` 做任務佇列（discuss、rag、feedback 等長任務）
- [ ] `Worker Pool` 背景執行 `multi_ai_discuss.py`（subprocess 隔離）
- [ ] admin/operator：/discuss /rag /stats；viewer：/status /help
- [ ] 注入/系統指令/路徑穿越 → 拒絕；PII → 遮罩
- [ ] 連續 5 次失敗開路、成功重置（測試驗證）
- [ ] T005 統一 observability + `tg_command_duration_seconds{command,role}` 埋點
- [ ] `/discuss` 立即回應「已排入佇列」，完成後 push 通知（worker 完成後經 Bot API 通知 chat_id）
- [ ] 並發多用戶無阻塞（Redis Stream + Worker Pool N 並發消費；webhook 僅入隊）
- [ ] Prometheus 指標可用（/metrics 回傳 generate_latest，實測 4 HELP 系列）
- [ ] /healthz 正常（實測 {"status":"ok"}）

## 失敗歷史

- (無歷史 JSONL) 現有 frontmatter summary: 重啟成功：aiogram 3 Webhook + FastAPI + Redis Stream + Worker Pool + RBAC + 熔斷 實作完成並驗證

## 最近一次失敗的輸出摘要

（無 repair/pr 輸出紀錄）

## 建議行動

拆分為子任務：範圍過大，建議依驗收標準拆成可獨立驗收的子任務
  - telegram-bot-webhook-SUB1: `FastAPI` 提供 `/api/webhook`、`/metrics`、`/healthz`
  - telegram-bot-webhook-SUB2: `Redis Stream` 做任務佇列（discuss、rag、feedback 等長任務）
  - telegram-bot-webhook-SUB3: `Worker Pool` 背景執行 `multi_ai_discuss.py`（subprocess 隔離）
  - telegram-bot-webhook-SUB4: admin/operator：/discuss /rag /stats；viewer：/status /help
  - telegram-bot-webhook-SUB5: 注入/系統指令/路徑穿越 → 拒絕；PII → 遮罩
  - telegram-bot-webhook-SUB6: 連續 5 次失敗開路、成功重置（測試驗證）
  - telegram-bot-webhook-SUB7: T005 統一 observability + `tg_command_duration_seconds{command,role}` 埋點
  - telegram-bot-webhook-SUB8: `/discuss` 立即回應「已排入佇列」，完成後 push 通知（worker 完成後經 Bot API 通知 chat_id）
  - telegram-bot-webhook-SUB9: 並發多用戶無阻塞（Redis Stream + Worker Pool N 並發消費；webhook 僅入隊）
  - telegram-bot-webhook-SUB10: Prometheus 指標可用（/metrics 回傳 generate_latest，實測 4 HELP 系列）
  - telegram-bot-webhook-SUB11: /healthz 正常（實測 {"status":"ok"}）

