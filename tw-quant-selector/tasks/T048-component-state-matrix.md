---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/691
title: Component State Matrix & Empty State Design
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-27
howto: |
  1. 按 spec §3.2–3.5 為按鈕/表格行/KPI卡片/輸入框補全 7 種狀態（default/hover/focus/active/selected/disabled/loading/error）。
  2. 整合 EmptyState 元件（SVG 圖示 + 說明 + 行動按鈕），應用至各頁面空狀態場景。
  3. 補齊圖表狀態（loading/empty/error/partial/stale/zoomed）的處理邏輯。
---

# T048 - Component State Matrix & Empty State Design

## 目標
補全所有元件的互動狀態（hover/focus/active/selected/disabled/loading/error），並實作規格化的空狀態設計系統。

## 驗收標準
- [ ] 按鈕狀態矩陣：8 種狀態（含 primary 變體），符合 spec §3.2
- [ ] 表格行狀態矩陣：7 種狀態，含 new-entry / exiting 漸淡效果，符合 §3.3
- [ ] KPI 卡片狀態矩陣：6 種狀態 + 數值更新顏色閃爍，符合 §3.4
- [ ] 輸入框狀態矩陣：6 種狀態，符合 §3.5
- [ ] 圖表狀態矩陣：6 種狀態處理邏輯，符合 §3.6
- [ ] EmptyState 元件：SVG 圖示 + 主要說明 + 次要說明 + 行動按鈕，適用 4 種空狀態場景（初始/篩選/非交易日/載入失敗）
- [ ] 圖表骨架屏實作

## 備註
- EmptyState 圖示使用 SVG（非 emoji），保持 24px
- 參考 spec §3.7 空狀態設計規格
