---
id: T056
github_issue: ""
title: 接線真實告警通道並替換 mock 情緒/資料
project: gold-analysis
type: feature
priority: high
status: pending
depends_on: []
assignee: "pi"
created: 2026-08-28
updated: 2026-08-28
---

# T056 - 接線真實告警通道並替換 mock 情緒/資料

## 目標
`services/notification_service.py` 已定義 `notify_alert_by_email` / `notify_alert_by_push`，但 SMTP 為 TODO stub、push 為占位，且**沒有任何地方呼叫它**。同時 `tools/data_tools.get_sentiment_data()` 直接 hardcode 回傳 `"Greed"/"Neutral"`，使 fundamental 分析建立在假資料上。需將真實告警通道接線到監控與風險觸發路徑，並替換 mock 情緒/資料來源。

## 驗收標準
- [ ] `notification_service` 實作至少一條真實通道（Email/Telegram/Discord，走 env 配置）
- [ ] 模型漂移/健康異常（T053/T054 監控結果）與風險觸發（T055 斷路器）時實際呼叫通知
- [ ] `get_sentiment_data()` 改接真實情緒/ETF 資金流來源（或明確標示 unavailable 而非假值）
- [ ] 保留 mock 模式用於測試，但預設不回傳假情緒
- [ ] 補測試：斷言監控/風險事件會觸發 notify（mock 通知器驗證呼叫次數）

## 備註
- 與 T055（風險斷路器）、T062（可解釋性）、T065（LLM 摘要）有交集，通知是它們的共同 sink。
- 參考：`backend/app/services/notification_service.py`、`backend/app/tools/data_tools.py:193`、`backend/app/agents/fundamental_analyzer.py:320`。
