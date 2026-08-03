---
status: in-progress
priority: high
assignee: OpenCode
created: 2026-08-03
updated: '2026-08-03'
summary: 應用 diff 失敗
---
# T006: Telegram Bot 重構為 aiogram 3.x Webhook + Redis Queue 非同步架構

## 背景
現有 `telegram_bot.py` 單進程輪詢，無熔斷、無速率限制、長任務阻塞主循環（DEC-02, SPEC-04, DeepSeek 第 1 輪建議 4, 第 2 輪建議 2.5）。

## 需求
1. 重構為 `aiogram 3.x` Webhook 模式：
   - `FastAPI` 提供 `/webhook`、`/metrics`、`/healthz`
   - `Redis Stream` 做任務佇列（discuss、rag、feedback 等長任務）
   - `Worker Pool` 背景執行 `multi_ai_discuss.py`
2. RBAC：`admin`/`operator`/`viewer` 角色，`.env` 設定 `TELEGRAM_ADMIN_IDS` 等
3. 輸入經 `sanitize_input.py`（prompt injection / PII 規則）
4. 熔斷：`pybreaker` 下游 AI API 失敗率 > 50% 自動熔斷 60s
5. 觀測：`prometheus-client` + `/metrics` endpoint

## 驗收標準
- `/discuss` 立即回應「已排入隊列」，完成後 push 通知
- 並發多用戶無阻塞
- Prometheus 指標可用

## 參考
- v3 討論 DEC-02, DEC-07 / SPEC-04 / DeepSeek 第 1 輪建議 4, 第 2 輪建議 2.5