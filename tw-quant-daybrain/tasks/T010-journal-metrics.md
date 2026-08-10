---
github_issue: N/A
title: 交易日誌與績效指標（Phase 4）
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-08-10
---

# T010 - 交易日誌與績效指標

## 目標
實作 §14.4 `JournalEntry` 生成與 §15 績效指標：以事件日誌（T004）為唯一統計來源，計算日/週指標，產出供 LLM 報告（T011）之結構化輸入。

## 驗收標準
- [x] `JournalEntry`（§14.4 schema 全欄位）：signals_issued / signals_triggered / trades_executed / wins / losses / gross_pnl / net_pnl / hit_rate / avg_win / avg_loss / profit_factor / max_drawdown_pct / slippage_avg_pct / events / llm_report（`src/metrics/journal.ts` 全欄位實作 + 週統計）
- [x] 由 T004 事件計算（`signal_issued`、`position_opened/closed`、`failed_breakout` 等），統計數字**不得**由 LLM 或人工填寫（computeJournalEntry 純函式，僅吃事件序列）
- [x] 滑價計算：以盤後 `get_stock_daily_kline` / `get_intraday_kline` 回推當日實際走勢，比對 SignalAdvice 建議價（`slippage_avg_pct`；computeSlippage + 可注入值）
- [x] 週滾動統計與停用閾值（§15）：連續 2 週 Profit Factor < 1.1 或 Hit Rate < 35% → 產出策略暫停警示事件（computeWeeklyStats + pauseAlertEvents）
- [x] 指標定義表（§15）全數實作：勝率 / 盈虧比 / 期望值 / 最大回撤 / 訊號轉換率 / 假突破率 / 引擎攔截統計 / WFE（回測，T023 提供；summary 已含欄位，WFE 於 T023 回填）並於輸出附計算公式註記（程式碼註解）
- [x] 單元測試：以合成事件序列驗證各指標計算（含無交易日、單筆大虧損邊界）
- [x] PnL 計算含手續費與交易稅假設（`DEFAULT_COST_MODEL`：手續費 0.1425%×0.28 折、當沖證交稅 0.0015、最低手續費 20）
- [x] v2.0：假突破率指標（`failed_breakout` 事件 ÷ 確認訊號數）與引擎攔截統計（`blocked_by_briefing_bias` 等）

## 備註
- 此模組輸出為 T011 LLM 檢討報告之**唯一**統計輸入（§16.4）
- PnL 計算含手續費與交易稅假設（可設定參數，預設：手續費 0.1425%×0.28 折、當沖證交稅 0.0015，§12.4）
- v2.0：新增假突破率指標（`failed_breakout` 事件 ÷ 確認訊號數）與引擎攔截統計（`blocked_by_briefing_bias` 等，§12.5 回測報告亦輸出）
