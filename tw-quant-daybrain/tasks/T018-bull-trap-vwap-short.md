---
github_issue: N/A
title: 空方策略引擎（BULL_TRAP_VWAP_SHORT）
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-11
---

# T018 - 空方策略引擎（BULL_TRAP_VWAP_SHORT）

## 目標
實作 §7 空方當沖策略引擎：假突破跌破 VWAP（先賣後買）。空方風控須比多頭嚴苛（防軋空/漲停鎖死無法平倉）。實作於 `src/engine/bull_trap_vwap_short.ts`。

## 驗收標準
- [x] 空方資格掃描（§7.1）：`scan_daytrade_eligibility` 全數通過 `can_short_first == true`、`margin_short_available == true`、`is_disposition == false`
- [x] 進場四條件（§7.2）：時間窗 09:15–11:30（等待頭部型態確立）；頂部爆量拉回（`detect_volume_surge` 回傳 `BEARISH_BREAKDOWN`）；連續 2 根 1 分 K 收在 VWAP 下方；跌破盤前 15 分低點；台指期黑棒開高走低
- [x] 評分（§7.3）：4 條件各 +25；今日已漲 >6.5% 扣 100（嚴禁空在接近漲停）；score ≥75 發送建議做空
- [x] 停損（§7.4，任一即刻 SELL_TO_COVER）：+1.5% 硬停損；站回 VWAP 超過 1 分鐘；突破當日高點（假突破轉真突破）
- [x] 停利（§7.4）：-2.0% 回補 50%；剩餘 50% 移動停利（自當日最低點反彈 0.8% 全數回補）
- [x] 時間風控（§7.4）：11:30 後禁止開新空單；13:00 強制回補警報（留出撮合時間）
- [x] 訊號 Payload（§7.5）：action=SELL_TO_OPEN、strategy=BULL_TRAP_VWAP_SHORT、risk_warning（距漲停空間/資券狀況）等
- [x] 單元測試：四條件組合、逼近漲停扣 100 分、停損三觸發、時間窗邊界（11:30 禁開新空單）

## 備註
- 空方訊號在 `LONG_ONLY` 日會被 Briefing 白名單攔截（§4 Phase 2 步驟 4），本引擎仍需完整實作供 `SHORT_ONLY` / `NEUTRAL_FLEXIBLE` 日使用
- 與 T017 共用 T007 評分框架與 T008 Risk Manager 出場分流（依 `Position.action`）
- 13:00 強制回補與多方 13:10 平倉時點不同，注意 T005 排程與 T008 時間限制之差異
