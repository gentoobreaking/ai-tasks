---
github_issue:https://github.com/gentoobreaking/ai-tasks/issues/762
type: pending
priority: high
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-13
howto: ~/howto
---

# T030 - 修復 BRAIN_MODEL 路徑不一致

## 目標
修正模型切換時 `BRAIN_MODEL` 環境變數的設定邏輯，確保 OpenAI 和 MNN 模型使用一致的路徑格式。

## 驗收標準
- [ ] `switch_model` 對 MNN 模型寫入目錄路徑，而非 model key
- [ ] `handle_text` 中的路徑回溯邏輯正確運作
- [ ] 測試切換到不同模型後 pipeline 正常運作

## 備註
Line 335 寫入 model key，但 line 480 預期目錄路徑，邏輯不一致。