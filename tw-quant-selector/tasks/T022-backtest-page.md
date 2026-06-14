---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/656
title: 回測分析頁面
type: feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. Create Backtest page at frontend/src/pages/Backtest.tsx
  2. Left panel (30%): parameters form
     - Date range picker (start/end)
     - Strategy weight sliders (4 sliders, must sum to 100%)
     - Top-N stock spinner (1-100)
     - Initial capital input
     - [Run Backtest] button
     - History list: clickable previous runs with key metrics
  3. Right panel (70%): results (shown after backtest completes)
     - Equity curve chart (lightweight-charts): strategy line (bull green 2px solid) + benchmark line (muted 1px dashed)
     - Hover crosshair + tooltip (strategy NAV, benchmark NAV, excess return)
     - Drawdown chart (bear-dim fill, max drawdown marker)
     - Metric grid (2×N): CAGR, benchmark CAGR, Sharpe, max drawdown, Calmar, excess return, turnover, win rate
     - Annual return bar chart
     - Turnover history chart
  4. Fetch from GET /api/v1/backtest/history for list, POST /api/v1/backtest/run to execute
---

# T022 - Backtest Analysis Page

## 目標
實作回測分析頁面（/backtest），包含左側參數設定表單、右側完整回測結果（淨值曲線、回撤圖、績效指標格）。

## 驗收標準
- [x] 左側面板包含：回測期間日期選擇器、四策略權重滑桿（總和 100%）、選股數量 Spinner、初始資金輸入、執行回測按鈕
- [x] 權重滑桿調整時即時顯示總和，若不等於 100% 顯示警告
- [x] 歷史執行記錄列表正確顯示（ run_id 、日期、年化報酬、Sharpe），點擊可載入結果
- [x] 淨值曲線圖正確顯示策略淨值（2px bull 實線）與基準 0050 淨值（1px muted 虛線）
- [x] 懸停淨值曲線時顯示垂直十字線 + tooltip（策略淨值、基準淨值、超額報酬）
- [x] 回撤圖疊加在淨值曲線下方，負值填充 bear-dim 色，標記最大回撤位置
- [x] 績效指標格顯示（2×N 格線式排版）：年化報酬率、0050 年化報酬、Sharpe、最大回撤、Calmar、超額報酬、年化換手率、勝率
- [x] 每個績效指標旁有小型歷史分位圖示（在該策略歷史回測中的分佈），懸停顯示指標說明 tooltip（spec §3.4.3）
- [x] 年度報酬長條圖每年一列，正負顏色正確
- [x] 換手率歷史圖表正確顯示
- [x] 淨值曲線支援框選時間區間縮放（brush zoom，spec §3.4.1）
- [x] 歷史執行記錄顯示格式：「2025-01-15 11:30 年化 18.4% Sharpe 1.85」（spec §4.4）
- [x] 載入中顯示骨架屏，錯誤時顯示內嵌錯誤 + 重試按鈕

## 備註
- 參考 spec §3.4 Backtest Panel、§4.4
- 左 30% / 右 70% 分割佈局
- 結果區塊在執行回測前顯示空白/提示文字
