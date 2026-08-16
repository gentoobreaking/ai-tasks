---
title: 任務 frontmatter 增加 depends_on 依賴欄位
type: feature
priority: medium
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: '2026-08-17'
summary: depends_on 依賴欄位 + auto_develop 依賴閘門 + 路徑收斂，10 tests 通過
spec_version: v3
---
# T018 - 任務 frontmatter 增加 depends_on 依賴欄位

## 目標
現有任務檔無「依賴關係」表達能力（T006 依賴 Redis 環境、T008 依賴 v3 討論決策、T014 依賴 T012），`auto_develop.py` 依 priority+num 排序，可能先做依賴未滿足的任務 → 失敗率高。

另處理路徑分歧：任務檔統一存放於 `~/tasks/digital-twin/tasks/`（開發文件單一路徑來源），需確認 `PROJECT_PATHS` 均指向 `~/tasks/<project>/`，不建立 `~/Projects/<project>/tasks/`。

## 驗收標準
- [x] 任務模板（`~/Projects/ai-skills/clw-ideas2tasks/templates/task-template.md`）frontmatter 新增 `depends_on: []`
- [x] `auto_develop.py` 讀取 depends_on：依賴任務未 done 時跳過該任務（印出原因）— `task_dependencies`/`find_blockers`/`get_next_pending_task`/`run()` 均實作
- [x] `auto_develop.py --list` 顯示依賴資訊（如 `T014 (depends: T012)`）
- [x] 路徑收斂：任務檔與開發文件統一於 `~/tasks/<project>/`，`PROJECT_PATHS.tasks_dir` 指向該路徑；不建立 `~/Projects/<project>/tasks/`；記錄於 README「路徑規範（T018）」章節
- [x] 所有既有任務檔（35 個）補上 `depends_on` 欄位（T006/T008→T003、T014→T012，其餘空）

## 備註
- 與 T011（config 統一）有重叠，建議 T011 完成後實作
- 路徑規格：任務檔與開發文件統一於 `~/tasks/<project>/`（SUMMARY/T001-T035 均在 `~/tasks/digital-twin/`），`PROJECT_PATHS.tasks_dir` 指向該處；不建立 `~/Projects/<project>/tasks/`。`~/tasks/` 下其他專案（tw-quant-*）不可動。