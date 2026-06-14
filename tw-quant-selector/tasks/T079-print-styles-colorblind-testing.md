---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/733
title: 完成 Print Styles (T059) 與 Color-Blind 人工測試 (T054)
type: feature
priority: low
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-28
updated: 2026-05-29
howto: |
  ## Print Styles (T059)
  1. 在 `BacktestDetail.tsx` 右上角加入 [列印報告] 按鈕（window.print()）。
  2. 在 `frontend/src/styles/global.css` 的 `@media print` 區塊實作：
     - 背景轉白底、文字轉深色
     - 隱藏 sidebar / nav / 按鈕
     - 圖表 background 反色（light 主題）
     - 漲跌用深綠 #006400 / 深紅 #8b0000
  3. 分頁控制：第一頁=指標+淨值曲線、第二頁=年度報酬+回撤。
  4. 表格跨頁重複 thead，page-break 控制。
  
  ## Color-Blind 測試 (T054)
  5. 開啟 macOS 輔助使用 → 顯示器 → 色彩濾鏡。
  6. 分別測試 Deuteranopia / Protanopia / Achromatopsia 三種模式。
  7. 逐一檢查 Dashboard / Signals / Backtest / Portfolio 頁面。
  8. 測試結果記錄在 T054 任務檔案中。
---

# T079 - 完成 Print Styles (T059) 與 Color-Blind 人工測試 (T054)

## 目標
T059 (Print Styles) 和 T054 (Color-Blind Friendly) 已有任務定義但尚未完成。Print Styles 的 CSS 與列印按鈕未實作，Color-Blind 的程式修改已完成但缺少 macOS 色彩濾鏡人工測試。本任務補齊這兩項。

## 驗收標準
### Print Styles (T059)
- [x] BacktestDetail 頁面右上角有 [列印報告] 按鈕（`window.print()`）
- [x] `@media print` CSS：背景白底、文字深色、隱藏按鈕/nav/sidebar
- [x] 漲跌顏色改為深綠 #006400 / 深紅 #8b0000
- [x] 圖表在 print 模式下反色（svg background: #fff）
- [x] 第一頁=績效指標（metricsGrid 設 page-break-inside: avoid）+ 交易明細
- [x] 表格跨頁重複 thead（`thead { display: table-header-group; }`）
- [x] A4 直向、邊界 20mm（`@page { size: A4 portrait; margin: 20mm; }`）

### Color-Blind 測試 (T054)
- [ ] 通過 macOS Deuteranopia 模擬測試（所有頁面資訊辨識無障礙）
- [ ] 通過 macOS Protanopia 模擬測試
- [ ] 通過 macOS Achromatopsia 模擬測試（全色盲）
- [ ] 測試結果記錄在 T054 任務檔案中

### 色盲測試指引（手動執行）
1. 開啟 macOS 系統設定 → 輔助使用 → 顯示器 → 色彩濾鏡
2. 勾選「啟用色彩濾鏡」，濾鏡類型選擇：
   - **Deuteranopia**（綠色弱）：測試 Dashboard / Signals / Backtest / Portfolio 頁面
   - **Protanopia**（紅色弱）：同上
   - **Achromatopsia**（全色盲）：同上
3. 確認事項：
   - 所有文字資訊可讀
   - 漲跌標示不僅靠顏色（有 ▲▼ 符號輔助）
   - 表格、圖表、按鈕均可辨識
   - 無因顏色無法區分而喪失資訊

## 備註
- Print Styles 實作參考 spec §16.1–16.3
- Color-Blind 測試需要人工操作 macOS 輔助使用設定，AI 僅能提供測試清單與指引
- 兩個項目可平行進行
