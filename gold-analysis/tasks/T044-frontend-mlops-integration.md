---
id: T044
project: gold-analysis
source_project: gold-analysis-advanced
title: 前端接線顯示監控/重訓/交易執行狀態
assignee: "pi with opencode/x-preview-f-free"
priority: medium
type: feature
status: done
created: 2026-08-28
updated: 2026-08-28
depends_on:
  - T043
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
---

## 目標
將 T043 新增的 API 端點（`/api/ml/monitor`、`/api/ml/retrain`、`/api/trading/execute`、`/api/ml/ab/assign`）接線到前端儀表板，讓使用者可：
- 手動觸發監控/重訓/交易執行
- 查看監控快照（漂移/健康/告警）、重訓結果、A/B 分流結果
- 查看交易執行記錄（TradeLogger）

## 驗收標準
- [x] 前端新增「ML 運維」頁面或區塊，含：
  - 監控觸發按鈕 → 呼叫 `POST /api/ml/monitor` → 顯示 `alerts`/`drift`/`health`
  - 重訓觸發按鈕 → 呼叫 `POST /api/ml/retrain`（含 trigger 參數） → 顯示 `retrained`/`reason`
  - A/B 分流查詢 → 輸入 user_id/symbol → 呼叫 `POST /api/ml/ab/assign` → 顯示 variant
- [x] 交易執行區塊（或現有決策頁面擴充）：
  - 從決策推薦（`/api/decisions/recommend`）一鍵執行 → 呼叫 `POST /api/trading/execute` → 顯示 `executed`/`order_id`/`trade_log` 摘要
- [ ] 展示最近 N 筆 `TradeLogger` 記錄（JSONL 讀取、分頁）
- [ ] API 呼叫錯誤處理（重試、toast 通知）
- [ ] 端對端測試：前端點擊 → API 觸發 → 後端副作用（TradeLogger 寫入、ABTestEngine 分流）可觀察

## 備註
- 前端代碼不在本倉（原說明在 `~/Projects/gold-analysis-frontend` 或類似），需確認目標前端專案位置
- 現有 `/api/decisions/recommend` 已串接真 ML，決策卡片可直接延伸「一鍵執行」
- 若前端無現成專案，可先在 `backend/app/main.py` 增加簡易 HTML/JS 測試頁（`/dashboard`），驗證 API 串接正確