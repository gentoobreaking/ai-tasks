# T024 Summary — Walk-Forward Optimization（WFO）

- 完成日期：2026-08-11
- Commit：`488a38f`
- 狀態：done（9/9 驗收全勾）

## 實作內容

`src/backtest/wfo_optimizer.ts`（§13.3/§13.4）：
- **滾動視窗**：IS 3 個月 + OOS 1 個月，窗口向前推進 OOS 月數（7 個月 → 4 窗口）
- **IS 最佳化（§13.3-A）**：`findBestParamsOnGrid` 於 IS 資料跑 Grid Search（T023 邏輯），選 Profit Factor 最高且交易 ≥3 之參數
- **OOS 無偏檢驗（§13.3-B）**：凍結 IS 最佳參數，於完全未看過之 OOS 月份回測，記錄真實績效
- **窗口輸出** `WfoWindowResult`：windowId / IS 範圍 / OOS 範圍 / bestInSampleParams（含 isProfitFactor）/ oosPnlNtd / oosWinRatePct / oosTradesCount
- **拼接 OOS 績效**：`totalOosPnlNtd` 累計所有 OOS 月份損益（權益曲線終點）
- **WFE（§13.4）**：OOS 獲利窗口比率；**>60% PASS**、**<30% OVERFIT 絕不能上線**、中間 INCONCLUSIVE
- **參數漂移穩定度（§13.4）**：stopLoss 極差 ≤0.4 且 surge 極差 ≤0.5 → HEALTHY（穩定），否則 DANGEROUS（劇烈跳動）
- **CLI**：`npm run wfo`（非交易日執行，§18.1）；樣本月份 <4 時明確警告無法形成窗口

## 測試資料設計
合成多月份資料：每日 **10:00 放量突破**（close 創當日新高 + 4 倍量），確保趨勢資料觸發 Simulator 訊號
（§12.4 條件：close > VWAP + surge ≥ threshold + close ≥ dayHigh×0.998）——首版資料尾盤 13:25 放量
超過 no_new_entry_after 11:30 且 close 永不及 high，導致 0 交易，已修正。

## 測試
13 個：滾動視窗推進（7 月 → 4 窗口、範圍正確）、樣本不足 → 無窗口、IS 最佳化、OOS 獨立性
（OOS 月份不在 IS 範圍）、欄位完整、權益曲線累計、WFE 100% PASS、WFE 0% OVERFIT、
verdict 邏輯一致、參數漂移 HEALTHY/DANGEROUS、CLI 載入（fixtures 1 月 → 無窗口 + 警告）、月份切分。

## 除錯紀錄
- `runSingleBacktest` 回傳類型用 camelCase（`winRatePct`）但 simulator summary 是 snake_case
  （`win_rate_pct`）→ TS 編譯過但運行時 undefined → 修正為欄位映射
- 合成資料 0 交易 → 重設計每日 10:00 放量突破

## 現況與後續
- **T001–T024 全部完成**（350/350 tests pass + lint/type check/build 過，工作區乾淨）
- WFO 為參數上線前最終驗證關卡：WFE < 30% 絕不能上線；結果供 T015 發布決策與 scoring v2.1 參數建議
- fixtures 僅 1 個月（合成），正式參數結論需實際多月份交易日資料
