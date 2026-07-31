---
github_issue: N/A
title: 交易日誌與績效指標（Phase 4）
type: feature
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T010 - 交易日誌與績效指標

## 目標
實作 §7.4 `JournalEntry` 生成與 §8 績效指標：以事件日誌（T004）為唯一統計來源，計算日/週指標，產出供 LLM 報告（T011）之結構化輸入。

## 驗收標準
- [ ] `JournalEntry`（§7.4 schema 全欄位）：signals_issued / triggered / trades / wins / losses / gross_net_pnl / hit_rate / avg_win / avg_loss / profit_factor / max_drawdown_pct / slippage_avg_pct / events / llm_report
- [ ] 由 T004 事件計算（`signal_issued`、`position_opened/closed`、`failed_breakout` 等），統計數字**不得**由 LLM 或人工填寫
- [ ] 滑價計算：以盤後 `get_stock_daily_kline` / `get_intraday_kline` 回推當日實際走勢，比對 SignalAdvice 建議價（`slippage_avg_pct`）
- [ ] 週滾動統計與停用閾值（§8）：連續 2 週 Profit Factor < 1.1 或 Hit Rate < 35% → 產出策略暫停警示事件
- [ ] 指標定義表（§8）之 6 項指標全數實作並於輸出附計算公式註記
- [ ] 單元測試：以合成事件序列驗證各指標計算（含無交易日、單筆大虧損邊界）

## 備註
- 此模組輸出為 T011 LLM 檢討報告之**唯一**統計輸入（§9.4）
- PnL 計算含手續費與交易稅假設（可設定參數，預設：手續費 0.1425%、證交稅賣出 0.3%）
