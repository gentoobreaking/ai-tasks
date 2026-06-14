---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/715
title: 選股表格鍵盤導航與焦點管理
type: feature
priority: low
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. 為 Signal Table 增加鍵盤事件監聽器
  2. 實作 ↑↓ 鍵移動表格列焦點 (Focus State)
  3. 實作 Enter 鍵展開/收合當前選中列的詳情
  4. 實作 Esc 鍵關閉所有展開列
  5. 確保焦點移動時，螢幕閱讀器能讀取當前股票名稱與排名 (A11y)
---

# T037 - Signal Table Keyboard Navigation & Focus State

## 目標
實作規格書 §3.2 與 §7 定義的金融終端級鍵盤導航體驗，提升專業用戶的操作效率。

## 驗收標準
- [x] 使用鍵盤 ↑↓ 鍵可切換選股表格中的焦點列
- [x] 被選中的焦點列需有明顯的視覺指示（左側 2px solid var(--color-accent)）
- [x] 按下 Enter 鍵可觸發該列的 inline 展開（顯示詳情圖表）
- [x] 按下 Esc 鍵可收起目前展開的內容
- [x] 焦點列移動時，視窗會自動捲動以確保選中列在可視範圍內
- [x] 所有表格互動符合 WCAG 2.1 AA 標準，Tab 鍵順序邏輯正確

## 備註
- 需注意與瀏覽器原生捲動快捷鍵的衝突處理
- 展開詳情後的焦點流向需符合無障礙規範
