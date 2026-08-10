---
github_issue: N/A
title: 參數網格搜尋（Grid Search）
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-11
---

# T023 - 參數網格搜尋（Grid Search）

## 目標
實作 §13.1 Grid Search 參數網格搜尋：停損 % × 爆量倍數雙維度掃描、每次迭代全新 Simulator 清空狀態、獲利高原判讀（§13.2）。實作於 `src/backtest/grid_search.ts`。

## 驗收標準
- [x] 前置準備（§13.1）：確認 `TacticalBriefing.trading_plan.key_levels.volume_surge_threshold` 已參數化（T019 完成）；Simulator 觸發條件讀取該值（T022 完成）
- [x] 搜尋空間（§13.1）：停損 `[1.0, 1.2, 1.5, 1.8, 2.0, 2.2, 2.5]`、爆量 `[2.0, 2.5, 3.0, 3.5, 4.0, 5.0]`（42 組合）
- [x] 每次迭代實例化全新 `DayBrainBacktestSimulator` 清空狀態；數據只載入一次（`CsvDataLoader.loadDirectory`，§12.3）
- [x] 注入測試參數至 Briefing（§13.1 範例：`hard_stop_loss_pct` / `volume_surge_threshold`），其餘欄位 mock 填值
- [x] 結果過濾與排序（§13.1）：濾除交易次數 < 5 之無效組合、依淨利潤降冪、輸出 Top 5（含 SL / Surge / PnL / 勝率 / PF / 交易次數）
- [x] 進度輸出：`\r進度: N/42 組合已完成`
- [x] **獲利高原判讀**（§13.2）：輸出中標註「高原區間」（如 Surge 2.5×、SL 1.5–2.0%）與「孤島最佳解」警示（如 SL 1.2% + Surge 4.0× 交易次數銳減）
- [x] CLI 獨立執行：`npm run grid-search`（非交易日執行，§18.1）
- [x] 測試：以 T013 fixtures 執行完整搜尋、無效組合過濾、高原標註邏輯

## 備註
- 對齊 §13.1 提供之 `runGridSearch` TypeScript 範例，可直接採用
- 核心思維（§13.2）：不盲目選 #1，選擇高原中心點（實戰建議 SL 1.8%、Surge 2.5×）
- 為 T024 WFO 之 IS 窗口最佳化基礎（§13.3）
