---
github_issue: N/A
title: 風控系統與持倉狀態機
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-08-01
---

# T008 - 風控系統

## 目標
實作 §11 風控：倉位規模（§11.1）、持倉狀態機（§11.2）、出場規則（§11.3）、每日上限（§11.4）、時間限制（§11.5）。

## 驗收標準
- [ ] 倉位規模（§11.1）：`單筆風險 = 權益 × RISK_PER_TRADE(0.5%，上限 1%)`、`股數 = 風險 ÷ (進場價 − 停損價)`、單標的曝險 ≤ 權益 10%、`MAX_POSITIONS`（預設 2）
- [ ] 狀態機（§11.2）：IDLE→SCANNING→ARMED→TRIGGERED→ENTERED→MANAGED→CLOSED→LOGGED；每次轉移寫 `position_state_change` 事件
- [ ] `TRIGGERED→ENTERED` 需人工確認或紙上交單回報（§1 原則 4，Human-in-the-loop；介面由 T014 提供）
- [ ] 出場規則優先序（§11.3）：硬停損（多 -1.5% 或跌破 VWAP；空 +1.5% 或站回 VWAP / 突破當日高點）> 目標價（R:R ≥ 2:1，可部分獲利 50% + 移動停利）> 時間停損 > 假突破回收
- [ ] 每日上限（§11.4）：-3% 權益 → `DAILY_LOCKOUT`（停新訊，僅管既有持倉出場）；連 3 筆停損 → 次日倉位 50%；單日交易次數上限 10
- [ ] 時間限制（§11.5）：09:00–09:05 不進場、11:30 空方停止開新空單、12:30 警示、13:00 停發新訊/空單強制回補、13:10 FORCE_FLAT_ALL、13:15 強制平倉提醒、13:20 強制全數平倉（參數化 §17.1）
- [ ] 單元測試：倉位計算、狀態轉移合法/非法、每日虧損觸發、時間邊界

## 備註
- 狀態機為單一真值來源，不允許外部直接修改 Position 欄位
- 紙上交單介面由 T014 提供，本任務先定義 Position repository 介面（§14.3 `Position`）
- v2.0：多空雙向出場規則（§6.4 多方 / §7.4 空方）需於 Risk Manager 依 `Position.action` 分流；移動停利參數（trailing_stop_activation/callback）自 Tactical Briefing 動態載入（§9.3）
