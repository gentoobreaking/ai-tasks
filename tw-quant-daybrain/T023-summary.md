# T023 Summary — 參數網格搜尋（Grid Search）

- 完成日期：2026-08-11
- Commit：`ce00f94`
- 狀態：done（9/9 驗收全勾）

## 實作內容

`src/backtest/grid_search.ts`（§13.1/§13.2）：
- **搜尋空間**：停損 `[1.0, 1.2, 1.5, 1.8, 2.0, 2.2, 2.5]` × 爆量 `[2.0, 2.5, 3.0, 3.5, 4.0, 5.0]` = **42 組合**
- **每迭代全新 Simulator 清空狀態**；數據只載入一次（`CsvDataLoader.loadDirectory`）
- **`makeGridBriefing`** 注入 `hard_stop_loss_pct` / `volume_surge_threshold`（§13.1 範例），其餘欄位 mock 填值
- **結果過濾與排序**：交易 < 5 濾除、依淨利潤降冪、Top 5（SL/Surge/PnL/勝率/PF/交易次數）
- **進度輸出**：`\r進度: N/42 組合已完成...`
- **獲利高原判讀（§13.2）**：以最高淨利潤 × 85% 為門檻，同爆量倍數下停損連續（檔距 ≤0.31）區間標為高原；高原外高利潤但交易銳減（≤ 高原平均 50%）→ 孤島最佳解警示
- **實戰建議**：高原內淨利潤最高者為中心點（§13.2 不盲目選 #1）
- **CLI**：`npm run grid-search`（非交易日執行）

## 重要修正：Simulator 多日資料 bug（T022 遺留）
T022 的 `runSimulation` 把所有交易日混在一起跑（單一 runningStats 跨日累計 dayHigh/VWAP），
5 天 fixtures 只會出 1 天效果（`total_simulated_days: 1`、test_period 只有 08-03）。
**修正**：`splitByTradingDay` 依交易日切分 → 每日 `runSingleDay`（runningStats/持倉/計數器/
PriorityEngine 註冊全重置）→ `mergeDayReports` 合併（test_period 跨日、max_drawdown 跨日連續曲線、
engine_effectiveness 彙總）。T022 既有 15 測試全數保持通過。

## 執行結果（T013 fixtures，2 檔 × 5 天）
42 組合 / 7 有效（≥5 交易）→ Top 5 全為 Surge 2.0×（SL 1.2–2.2 同淨利潤 21,755）→
高原 `Surge 2×, SL 1.2–2.5%`、建議中心點 SL 1.2% / Surge 2.0×。
（fixtures 為合成資料，統計結論僅驗證工具鏈，正式參數凍結需 T024 WFO + 實際交易日資料。）

## 測試
9 個：42 組合完整搜尋（進度 42/42）、依淨利潤降冪、minTrades 過濾、每迭代全新 Simulator（兩次執行一致）、
makeGridBriefing 參數注入、高原判讀（連續區間標註 + 孤島警示）、無正利潤 → null、
CLI 載入報告、Simulator threshold 整合（低 threshold 交易數 ≥ 高）。

全套測試：**337/337 pass** + lint/type check 過。
