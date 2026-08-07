---
github_issue: 
title: spec_auto_merge.py 整合 DiscussionOrchestrator 狀態機推進
type: feature
priority: medium
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-06
updated: '2026-08-06'
---

# T033 - spec_auto_merge.py 整合 DiscussionOrchestrator 狀態機推進

## 目標
T007 完成了 DiscussionOrchestrator 狀態機（INIT→ROUND→HUMAN_REVIEW→MERGE→ARCHIVED），但 `spec_auto_merge.py` 尚未整合。需在合併完成後自動呼叫 `orchestrator.to_merge()`，歸檔後呼叫 `orchestrator.archive()`，並更新 manifest.json 的 status 欄位。

## 驗收標準
- [ ] `spec_auto_merge.py`：合併完成（生成最終規格書）後，載入 orchestrator 並呼叫 `to_merge()`
- [ ] 歸檔流程（如手動確認或自動觸發）呼叫 `archive()`
- [ ] manifest.json 的 `status` 欄位正確遷移：`HUMAN_REVIEW` → `MERGE` → `ARCHIVED`
- [ ] CLI `./twin merge <proj> <ver>` 內部流程整合狀態機推進
- [ ] 測試：手動執行 merge 後 manifest status 為 MERGE；archive 後為 ARCHIVED

## 備註
- T007 summary 後續建議第 3 點
- 需確保 `spec_auto_merge.py` 能正確載入對應版本的 orchestrator（版本目錄對應）
- 狀態機非法遷移（如 ARCHIVED → ROUND）應被攔截並報錯