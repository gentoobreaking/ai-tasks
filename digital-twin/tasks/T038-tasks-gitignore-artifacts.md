---
github_issue: 
title: tasks repo 產物清潔（.gitignore 與 routing.json 清理）
type: chore
priority: medium
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-09'
updated: '2026-08-10'
commit: 991c903
---

# T038: tasks repo 產物清潔（T031 模式延伸）

## 目標
設計審查（docs/design-review.md 三.2）：`~/tasks/{project}` 是任務書 repo，但 `twin route` 執行後
產生的 `*.routing.json` 每次都進 git（T002/T004/T009 已 commit）。需像 T031（.lancedb/）一樣
建立產物忽略規則並清理既有落檔。

## 驗收標準
- [x] 在 `~/tasks/digital-twin/.gitignore`（若無則新建）加入：
  - `*.routing.json`（route 回寫產物）
  - `tasks/blocked-review/`（twin blocked --review 自動產出 review.md）
- [x] 執行 `git rm --cached --ignore-unmatch` 移除已追蹤的 4 個 `*.routing.json` + 2 個 blocked-review review.md（不修改 repo 內容）
- [x] `git status` 乾淨；`git check-ignore` 驗證新規則生效（exit 0 於兩項規則）
- [x] `twin route`（非 dry-run）仍可正常寫 routing.json（只是不再被追蹤）
- [x] 任務 repo 的變更單獨 commit（commit 991c903，msg 含任務編號與摘要）

## 備註
- 參考 T031 的處理（同模式：只加規則不誤刪內容）
- .gitignore 規則行內勿加 `#` 註解（T02 經驗：註解獨立一行）
- 若 blocked-review/ 內有「應保留」的 review 文件，則不忽略，改忽略其中產物（如 *.jsonl）