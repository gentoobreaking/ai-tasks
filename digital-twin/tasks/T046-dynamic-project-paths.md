---
github_issue: null
title: PROJECT_PATHS 動態化：依 ~/tasks 未完成任務動態篩選專案＋.projects_ignore 排除
type: feature
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-09'
updated: '2026-08-17'
spec_version: v3
---
# T046 - PROJECT_PATHS 動態化（未完成任務篩選 + .projects_ignore）

## 目標
`config.py` 的 `PROJECT_PATHS` 目前寫死 4 個專案。改為動態建構：

1. 掃描 `~/tasks/*/tasks/T*.md`，專案只要有任一任務檔**不含** `status: done`
   （即含 pending/in-progress/blocked 等未完成任務）即為 active（對應
   `grep -L 'status: done' ... | awk -F'/' '{print $5}' | uniq` 的語意）
2. `tasks_dir = ~/tasks/{name}`；`code_dir = ~/Projects/{name}`（僅當目錄存在，
   避免只有任務檔沒有程式碼的專案混入）
3. 支援 `.projects_ignore` 排除檔：每行一個專案名（`#` 開頭為註解）；
   讀取順序 `~/.projects_ignore` → repo 根 `.projects_ignore`（合併，去重）

## 驗收標準
- [x] config.py 新增 `discover_projects()`（可傳 tasks_root 供測試），
      `PROJECT_PATHS` 改為動態結果
- [x] `.projects_ignore` 讀取函式：空白行/註解/不存在檔皆安全
- [x] 離線測試：有未完成任務→納入；全 done→排除；無 code 目錄→排除；ignore 檔→排除
- [x] `./twin projects` 仍正常列出（既有 digital-twin/tw-quant-* 因有未完成任務維持），
      ignore 檔範例專案（gold-analysis-advanced 等）不會出現
- [x] 全量 pytest 維持 137 passed + 1 skipped；ruff 全過

## 備註
- 既有測試以 monkeypatch PROJECT_PATHS 替換整個 mapping，動態化後仍相容（匯入時算一次）
- 產出檔案：`.projects_ignore`（repo 根，範例內容＝使用者提供清單）
---

## 驗證結果（2026-08-09）
- config.py：discover_projects(tasks_root, projects_root) 動態建構；_load_projects_ignore()
  合併 ~/.projects_ignore 與 repo 根 .projects_ignore；_STATUS_DONE 正則（含引號變體）
- .projects_ignore（repo 根）：使用者提供 8 個專案排除，已生效
- ./twin projects：digital-twin/tw-quant-signal/tw-quant-selector 維持；
  tw-quant-mcp 因 31 任務全 status: done 依語意退出（預期行為）
- tests/test_discover_projects.py 7 離線測試全過；全量 144 passed + 1 skipped
- 程式碼 commit：`70345c2`