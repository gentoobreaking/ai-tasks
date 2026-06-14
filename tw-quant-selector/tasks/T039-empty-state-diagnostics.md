---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/717
title: 完整空狀態診斷與原因提示
type: feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. 實作規格書 §5.2 的空狀態 (Empty State) UI 元件
  2. 針對「選股結果為空」的情境，實作原因診斷邏輯：
     - 檢查今日是否為交易日
     - 檢查後端資料最後更新時間
     - 檢查選股宇宙過濾條件是否過嚴
  3. 在 Empty State 元件中列出可能的具體原因，並提供前往「資料監控」頁面的按鈕
---

# T039 - Full Empty States & Reason Diagnostics

## 目標
實作規格書 §5.2 定義的具備「脈絡」的空狀態介面，當無選股結果時主動告知用戶可能的原因。

## 驗收標準
- [x] 當 API 回傳空列表時，顯示具備圖示與詳細說明文字的 Empty State
- [x] 原因診斷清單包含（但不限於）：今日休市、資料尚未到位、篩選條件太嚴
- [x] 提供明確的行動呼籲 (CTA)：如 [前往資料監控]、[調整策略權重]
- [x] 空狀態元件設計符合視覺系統（var(--text-muted) 配色）
- [x] 避免在資料載入中 (Loading) 誤顯示空狀態

## 備註
- 這有助於降低用戶對於「為什麼沒股票」的困惑
- 診斷邏輯需依賴 T025/T024 提供的高階資料狀態介面
