---
id: T067
github_issue: ""
title: TradingView / 外部 webhook 訊號接入
project: gold-analysis
type: feature
priority: low
status: pending
depends_on: []
assignee: "pi"
created: 2026-08-28
updated: 2026-08-28
---

# T067 - TradingView / 外部 webhook 訊號接入

## 目標
目前決策僅來自內部多代理管線。需開放外部訊號接入：接受 TradingView 警報 / 通用 JSON webhook，將外部訊號轉換為內部決策格式並納入決策流（可選參與或不參與自動下單，受 T055 開關管控）。

## 驗收標準
- [ ] 新增 webhook 端點接收外部訊號（HMAC 簽章驗證）
- [ ] 將外部訊號對映為內部 `DecisionSignal` / `Decision` 結構
- [ ] 外部訊號納入決策流，並標註 `source=external`（參考 `api/routes/decisions.py` 的 source 列舉）
- [ ] 受 T055 交易開關管控：外部訊號在關閉/非 dry-run 時不觸發真實下單
- [ ] 補測試：合法/非法簽章、各種 payload 形狀的解析

## 備註
- 安全重點：webhook 必須驗證來源（HMAC），避免任意外部觸發下單。
- 與 T055 kill-switch、T056 通知緊密相關。
