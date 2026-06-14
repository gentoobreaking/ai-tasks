---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/797
title: 淨值曲線進階互動（Brush 縮放與詳細 Tooltip）
type: feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. 使用 lightweight-charts 或 recharts 強化回測頁面的淨值曲線
  2. 實作 Brush 功能，允許使用者框選 X 軸時間區間進行縮放 (spec §3.4.1)
  3. 優化 Tooltip 內容：顯示策略淨值、基準淨值、以及兩者的超額報酬 (Alpha)
  4. 疊加回撤圖 (Drawdown) 於主圖下方，並標記歷史最大回徹點
---

# T036 - Interactive Equity Curve with Brush & Tooltip

## 目標
實作規格書 §3.4.1 與 §3.4.2 定義的回測曲線進階互動功能，提供更高密度的資訊檢視能力。

## 驗收標準
- [x] 使用者可在主圖表下方透過小型時間軸 (Brush) 框選特定區間，主圖會同步縮放
- [x] 曲線包含策略線 (var(--color-bull) 2px 實線) 與基準線 (var(--text-muted) 1px 虛線)
- [x] 懸停時顯示垂直基準線，Tooltip 包含日期、策略價值、0050 價值、超額報酬百分比
- [x] 淨值曲線下方同步顯示回撤圖（負值填充，顏色 var(--color-bear-dim)）
- [x] 圖表上明確標記最大回撤 (Max Drawdown) 發生點，並附帶標籤說明
- [x] 支援一鍵重設縮放範圍

## 備註
- 效能考量：當資料點超過 1000 時需確保縮放流暢度
- 顏色需嚴格遵守視覺系統規格
