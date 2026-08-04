---
title: 任務 frontmatter 增加 depends_on 依賴欄位
type: feature
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-05
---

# T018 - 任務 frontmatter 增加 depends_on 依賴欄位

## 目標
現有任務檔無「依賴關係」表達能力（T006 依賴 Redis 環境、T008 依賴 v3 討論決策、T014 依賴 T012），`auto_develop.py` 依 priority+num 排序，可能先做依賴未滿足的任務 → 失敗率高。

另處理路徑分歧：任務檔目前同時存在 `~/Projects/digital-twin/tasks/`（本批次 T011+）與 `~/tasks/digital-twin/tasks/`（T001-T010），需收斂為單一路徑來源（建議與 config.py 的 PROJECT_PATHS 一致，統一為 `~/Projects/digital-twin/tasks/`）。

## 驗收標準
- [ ] 任務模板（`~/Projects/ai-skills/clw-ideas2tasks/templates/task-template.md` 或專案內模板）frontmatter 新增 `depends_on: []`（可為空陣列或 T00X 清單）
- [ ] `auto_develop.py` 讀取 depends_on：依賴任務未 done 時跳過該任務（印出原因）
- [ ] `auto_develop.py --list` 顯示依賴資訊（如 `T014 (depends: T012)`）
- [ ] 路徑收斂：`PROJECT_PATHS` 統一指向 `~/Projects/digital-twin/tasks/`，並將 T001-T010 遷移/同步（保留歷史或 symlink，二擇一並記錄於 README）
- [ ] 所有既有任務檔補上 `depends_on` 欄位（無依賴者為空）

## 備註
- 與 T011（config 統一）有重疊，建議 T011 完成後實作
- 遷移既有任務檔前先確認 `auto_develop.py` 的 `PROJECT_PATHS` 指向；`~/tasks/` 下可能有其他專案（tw-quant-*），不可動
