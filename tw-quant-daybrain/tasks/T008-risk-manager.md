---
github_issue: N/A
title: 風控系統與持倉狀態機
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T008 - 風控系統

## 目標
實作 §6 風控：倉位規模（§6.1）、持倉狀態機（§6.2）、出場規則（§6.3）、每日上限（§6.4）、時間限制（§6.5）。

## 驗收標準
- [ ] 倉位規模：`單筆風險 = 權益 × RISK_PER_TRADE(0.5%，上限 1%)`、`股數 = 風險 ÷ (進場價 − 停損價)`、單標的曝險 ≤ 權益 10%、`MAX_POSITIONS`（預設 2）
- [ ] 狀態機（§6.2）：IDLE→SCANNING→ARMED→TRIGGERED→ENTERED→MANAGED→CLOSED→LOGGED；每次轉移寫 `position_state_change` 事件
- [ ] `TRIGGERED→ENTERED` 需人工確認或紙上交單回報（§1 原則 4，Human-in-the-loop）
- [ ] 出場規則優先序（§6.3）：硬停損（-1.5% 或跌破 VWAP）> 目標價（R:R ≥ 2:1）> 時間停損（13:20）> 假突破回收
- [ ] 每日上限（§6.4）：-3% 權益 → `DAILY_LOCKOUT`（停新訊，僅管既有持倉出場）；連 3 筆停損 → 次日倉位 50%；單日交易次數上限 10
- [ ] 時間限制（§6.5）：09:00–09:05 不進場、12:30 警示、13:00 停發新訊、13:15 強制平倉提醒、13:20 強制平倉（參數化 §10.1）
- [ ] 單元測試：倉位計算、狀態轉移合法/非法、每日虧損觸發、時間邊界

## 備註
- 狀態機為單一真值來源，不允許外部直接修改 Position 欄位
- 紙上交單介面由 T014 提供，本任務先定義 Position repository 介面
