# T012 任務完成摘要

## 目標
實作 §1 原則 5「所有決策可回放」之工具：以事件日誌（T004）重演單日決策、追溯每筆訊號判定輸入、驗證滑價（對接 T010）。

## 完成內容
- `src/tools/replay.ts`（8624 bytes）+ `replay.test.ts`（6722 bytes）
- `replayDay(logger, date)`：純讀事件日誌，離線可用（不呼叫 MCP）
- 時間軸依 ts+seq 排序（§14.4 回放排序）
- `SignalTrace` 決策追溯全欄位：VWAP/surge 輸入快照、score_breakdown、data_quality、Bias 攔截、Priority rank、守門結果（兩段式對應，因 gate 事件 ts 可能早於 signal_issued）
- `SlippageCheck`：建議價 vs 實際價，> ±0.3% 標註異常（`ABNORMAL_SLIPPAGE_PCT`）
- 缺欄位警示（warnings 陣列），不靜默填補（缺 signal_id 者不列入、缺滑價資料警示）
- 輸出：toJson（自動化比對）+ toSummaryText（人類可讀）
- `replayCli`：`replay --date YYYY-MM-DD [--json]`，exit code 0/1/2
- v2.0：bias_locked/briefing_generated/priority_ranked 納入時間軸

## 驗收
- 194 tests pass（+7）、build ✅、lint ✅
- 修正歷程：EventLogger 無 dayFile() → 改用 fileForDate()；gate 事件時序早於 signal → 兩段式處理；測試 186 用手寫 JSON 行繞過 schema 驗證模擬損壞日誌；ESM 環境無 require
- commit `2664d13`

## 備註
- Signals 快照需含 scoring_version（由 T010 JournalEntry 攜帶，replay 保留原始事件欄位）
- 回放工具是參數實驗（T024）之驗證基礎
