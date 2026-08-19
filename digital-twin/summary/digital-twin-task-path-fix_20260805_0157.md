# digital-twin 任務檔路徑修正（T025-T028 建立 + 全部任務搬移）

- 時間：2026-08-05 01:57
- 觸發：使用者指出任務檔位置錯誤——`~/Projects/digital-twin/tasks/` 不是排程器讀取處

## 正確路徑架構（config.py PROJECT_PATHS 明確定義）
- 程式碼：`~/Projects/digital-twin`
- 任務檔：`~/tasks/digital-twin/tasks/`（auto_develop.py `load_tasks` 實際讀取處，`paths["tasks_dir"] / "tasks"`）
- 摘要/開發文件：`~/tasks/digital-twin/`（如 2026-08-05-T017-summary.md）

## 修正動作
1. `mv ~/Projects/digital-twin/tasks/T*.md`（18 個，T011-T028）→ `~/tasks/digital-twin/tasks/`
2. `rmdir ~/Projects/digital-twin/tasks/`（空的，未被 git 追蹤）
3. 驗證：`load_tasks('digital-twin')` 讀到 **28 個任務**（T001-T028）✅
4. T025-T028 四個新任務檔（ruff 舊債清理 / .venv 建立 / pyright 指向 .venv / DiscussionOrchestrator 回歸測試）確認已在正確目錄

## 記憶更新
- MEMORY 記錄正確路徑規則：任務檔 `~/tasks/{project}/tasks/`、摘要 `~/tasks/{project}/`、程式碼 `~/Projects/{project}/`

## 教訓
- 建立任務檔前應先確認 auto_develop.py 的 PROJECT_PATHS 實際讀取路徑，而非自行猜測
