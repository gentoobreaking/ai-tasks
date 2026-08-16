---
github_issue: 
title: spec_auto_merge.py 整合 DiscussionOrchestrator 狀態機推進
type: feature
priority: medium
status: done
spec_version: v3
commit: a1c28f0
depends_on: [T007]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-06
updated: '2026-08-08'
---

# T033 - spec_auto_merge.py 整合 DiscussionOrchestrator 狀態機推進

## 目標
T007 完成了 DiscussionOrchestrator 狀態機（INIT→ROUND→HUMAN_REVIEW→MERGE→ARCHIVED），但 `spec_auto_merge.py` 尚未整合。需在合併完成後自動呼叫 `orchestrator.to_merge()`，歸檔後呼叫 `orchestrator.archive()`，並更新 manifest.json 的 status 欄位。

## 驗收標準
- [x] `spec_auto_merge.py`：合併完成（生成最終規格書）後，載入 orchestrator 並呼叫 `to_merge()`
- [x] 歸檔流程（如手動確認或自動觸發）呼叫 `archive()`（`--archive`）
- [x] manifest.json 的 `status` 欄位正確遷移：`HUMAN_REVIEW` → `MERGE` → `ARCHIVED`
- [x] CLI `./twin merge <proj> <ver>` 內部流程整合狀態機推進（另新增 `./twin archive <proj> <ver>`）
- [x] 測試：手動執行 merge 後 manifest status 為 MERGE；archive 後為 ARCHIVED

## 備註
- T007 summary 後續建議第 3 點
- 需確保 `spec_auto_merge.py` 能正確載入對應版本的 orchestrator（版本目錄對應）
- 狀態機非法遷移（如 ARCHIVED → ROUND）應被攔截並報錯

## 執行記錄（2026-08-08）
- `DiscussionOrchestrator.load(project, version, out_dir=None)`：從既有 manifest.json 重建實例
  - 不建立 model adapter（純狀態操作，不需 API key）
  - 保留原始 manifest 快照，`save_manifest()` 只更新 status / tokens_used / updated，不覆寫 models/outputs
  - manifest 不存在拋 `FileNotFoundError`
- `spec_auto_merge.py`：
  - `generate_spec_merge(project, version, out_dir=None)` 生成 05-merge-review.md / merge-decision.md 後自動 `to_merge()`
  - 新增 `--archive`：載入 orchestrator 並 `archive()`（MERGE → ARCHIVED）
  - 無 manifest 舊版目錄（v2/v3）僅提示不推進，不阻斷檔案生成；非法遷移拋 StateError 並 exit 1
- `./twin` 新增 `archive` 子指令；`merge` 說明更新為「自動推進 MERGE」
- 測試 `tests/test_spec_auto_merge.py` 6 項：merge 後 MERGE、archive 後 ARCHIVED、
  資料保留（outputs/models/tokens_used）、無 manifest 回 None、非法遷移 StateError、生成後狀態推進
- 全量 pytest：115 passed + 1 skipped
