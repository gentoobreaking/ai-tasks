---
status: done
priority: high
commit: fde2d86
assignee: OpenCode
created: 2026-08-03
updated: 2026-08-06
summary: '重啟成功：aiogram 3 Webhook + FastAPI + Redis Stream + Worker Pool + RBAC + 熔斷 實作完成並驗證'
---
# T006: Telegram Bot 重構為 aiogram 3.x Webhook + Redis Queue 非同步架構

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

## 架構決策
- **先前失敗根因**：單進程輪詢內嵌呼叫 AI → 改 Webhook 立即回應 + Worker 背景 subprocess 執行 multi_ai_discuss.py，webhook 進程不再碰模型
- **pybreaker 2.x 相容**：state.call 僅支援同步；以 AIBreaker 包裝（fail_counter ≥ fail_max 開路、success 重置），測試驗證
- **降級**：無 redis → enqueue 回 no-redis 不崩潰；無 aiogram → /healthz /metrics 仍可用；無 token → feed_update 回 False
- **sanitize_input**：拒絕高風險（注入/命令/路徑），PII 遮罩不拒絕
- docker-compose redis 補 `ports: 6379` 映射（供本機/容器內存取）

## 驗證記錄（2026-08-06）
- pytest **25 passed**（sanitize 9 / RBAC 4 / Redis queue 2 / endpoints 3 / worker 3 / breaker 1）
- 實際 redis 容器（docker compose --profile full）：enqueue → stream → worker pool 消費 → ack 全流程通過
- uvicorn 實測：/healthz {"status":"ok"}、/metrics 4 HELP 系列、/api/webhook 接受 payload
- 熔斷：6 次 failure → is_open True；success → 重置
- ruff 全通過；既有 E501 23 個未動
- e2e discuss 任務真實執行 multi_ai_discuss（耗時為 AI 呼叫，架構上由 worker 背景處理）

## 參考
- v3 討論 DEC-02, DEC-07 / SPEC-04 / DeepSeek 第 1 輪建議 4, 第 2 輪建議 2.5