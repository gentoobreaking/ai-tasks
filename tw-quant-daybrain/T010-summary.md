# T010 任務完成摘要

## 目標
實作 §14.4 `JournalEntry` 生成與 §15 績效指標：以事件日誌（T004）為唯一統計來源，計算日/週指標，產出供 LLM 報告（T011）之結構化輸入。

## 完成內容
- `src/metrics/journal.ts`（10636 bytes）+ `journal.test.ts`（8804 bytes）
- `computeJournalEntry(date, scoringVersion, events, opts)`：由 T004 事件序列計算 §14.4 JournalEntry 全欄位
  - signals_issued / signals_triggered / trades_executed / wins / losses / gross_pnl / net_pnl / hit_rate / avg_win / avg_loss / profit_factor / max_drawdown_pct / slippage_avg_pct / events / llm_report
  - v2.0 追加：signal_conversion_rate（觸發÷訊號）、failed_breakout_rate（failed_breakout÷確認訊號）、expectancy（淨利÷筆數）、blocked 引擎攔截統計
- `pairTrades`：position_opened↔position_closed 配對；無配對事件跳過（不靜默填補）
- `tradingCost`（§12.4）：手續費 0.1425%×0.28 折（雙邊）+ 當沖證交稅 0.0015 + 最低手續費 20 → net_pnl = gross − costs
- `computeWeeklyStats` + `pauseAlertEvents`（§15）：週滾動，連續 2 週 PF<1.1 或 Hit Rate<35% → 策略暫停警示事件
- `computeSlippage`：建議價 vs 實際成交價平均 %（slippage_avg_pct，可注入 T012 結果）

## 驗收
- 175 tests pass（+11）、build ✅、lint ✅
- 測試含：合成事件序列（2 勝 1 負）、無交易日（0/NaN 邊界）、單筆大虧損（max DD 800%）、成本模型、配對、滑價、假突破率、攔截統計、週滾動（連續 2 週觸發 / 單週不觸發）、EventLogger 整合
- commit `82da80a`

## 備註
- 統計數字純由事件計算，不經 LLM/人工（§14.4）
- WFE（§15）由 T023 回測提供，summary 已預留欄位
- 此模組輸出為 T011 LLM 檢討報告之唯一統計輸入（§16.4）
