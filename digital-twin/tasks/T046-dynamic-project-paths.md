---
github_issue: 
title: PROJECT_PATHS 動態化：依 ~/tasks 未完成任務動態篩選專案＋.projects_ignore 排除
type: feature
priority: high
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-09'
updated: '2026-08-09'
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
- [ ] config.py 新增 `discover_projects()`（可傳 tasks_root 供測試），
      `PROJECT_PATHS` 改為動態結果
- [ ] `.projects_ignore` 讀取函式：空白行/註解/不存在檔皆安全
- [ ] 離線測試：有未完成任務→納入；全 done→排除；無 code 目錄→排除；ignore 檔→排除
- [ ] `./twin projects` 仍正常列出（既有 digital-twin/tw-quant-* 因有未完成任務維持），
      ignore 檔範例專案（gold-analysis-advanced 等）不會出現
- [ ] 全量 pytest 維持 137 passed + 1 skipped；ruff 全過

## 備註
- 既有測試以 monkeypatch PROJECT_PATHS 替換整個 mapping，動態化後仍相容（匯入時算一次）
- 產出檔案：`.projects_ignore`（repo 根，範例內容＝使用者提供清單）