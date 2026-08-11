---
github_issue: null
title: twin auto --list 排序修正（完成在前＋優先級/編號排序）
type: feature
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
commit: 2352b5e
summary: 新增 sort_for_display() 顯示層排序（done 在前、群組內 priority+num）；--list 兩條路徑統一套用；新增 test_list_sorting.py 混合狀態排序測試；全量 262 passed、ruff/pyright 通過
---

# T082 - twin auto --list 排序修正

## 目標
修正 `twin auto --list` 的任務顯示順序：

1. **完成的任務在前，未完成的任務在後**
2. 兩個狀態群組內，先依優先級排序（high → medium → low），再依 Txxx 編號由小至大

**背景**：目前 `--list` 直接吃 `load_tasks()`（`scheduler.load_tasks` → `TaskStore.list`）的全專案排序結果，僅按 `sort_key = (priority_order, num)` 排序（common/tasks.py:73-74），**未區分 status**。此排序同時服務 `get_next_pending_task` 的任務挑選邏輯（依賴 `sort_key` 的既有行為，T051），故顯示層排序應在 `--list` 輸出前單獨處理，不應改動 `TaskStore.list` / `sort_key` 本體。

## 驗收標準
- [x] `twin auto --list`（及 `--project <proj>`）輸出：所有 done 任務先列，其次 in-progress/pending 等未完成任務
- [x] 群組內排序：先 `priority_order`（high=0 → medium=1 → low=2 → 其他=3），再 `num` 升冪
- [x] 未完成群組維持「皆已完成」判斷邏輯不變（all-done 專案仍顯示標頭＋完成訊息，T061/T063 行為不回歸）
- [x] 排序以 `common/tasks.py` 的 `priority_order` / `sort_key` 語意為準，不重複定義優先級對照表
- [x] pytest 新增覆蓋：混合狀態（done + pending/in-progress 混排）排序測試；既有 test_all_done_list.py / test_twin_auto_pwd.py / test_tasks_store.py 全數通過
- [x] `ruff` / `pyright` 通過

## 改動檔案清單
- `auto_develop.py`：新增 `sort_for_display()`；`--list` 區塊（:153-181 附近）於輸出迴圈前套用顯示排序——依 `(t.status != "done", t.sort_key)` 排序（done 在前）
- `tests/test_list_sorting.py`：新增混合狀態排序測試（done 在前、群組內 priority+num、TaskStore.list 不受影響、端對端輸出順序、all-done 訊息不回歸）

## 備註
- `get_next_pending_task`（scheduler.py:78-95）依賴 `load_tasks()` 現行 `sort_key` 順序（依序取第一個未完成任務）；顯示排序只在 `--list` 輸出層做，不影響任務挑選行為
- `--list` 的 `ValueError` fallback 路徑（auto_develop.py:155-165）自行掃描 tasks_dir，其排序已同步套用 `sort_for_display`，兩路徑行為一致
- 實機驗證：`./twin auto --project digital-twin --list` 輸出 done 在前（high→medium→low 群組）、未完成在後（T082 high → T071-078 medium → T079-081 low），順序正確
