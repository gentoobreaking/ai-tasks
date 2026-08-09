---
github_issue: 
title: tasks repo 產物清潔（.gitignore 與 routing.json 清理）
type: chore
priority: medium
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-09'
updated: '2026-08-09'
---

# T038: tasks repo 產物清潔（T031 模式延伸）

## 目標
設計審查（docs/design-review.md 三.2）：`~/tasks/{project}` 是任務書 repo，但 `twin route` 執行後
產生的 `*.routing.json` 每次都進 git（T002/T004/T009 已 commit）。需像 T031（.lancedb/）一樣
建立產物忽略規則並清理既有落檔。

## 驗收標準
- [ ] 在 `~/tasks/digital-twin/.gitignore`（若無則新建）加入：
  - `*.routing.json`（route 回寫產物）
  - `blocked-review/`（若為自動產物）與其他可再生成檔案
- [ ] 執行 `git rm --cached --ignore-unmatch` 移除已追蹤的 `T*.routing.json`（且不需修改 repo 內容）
- [ ] `git status` 乾淨；`git check-ignore` 驗證新規則生效（exit 0）
- [ ] `twin route`（非 dry-run）仍可正常寫 routing.json（只是不再被追蹤）
- [ ] 任務 repo 的變更單獨 commit（commit msg 含任務編號與摘要）

## 備註
- 參考 T031 的處理（同模式：只加規則不誤刪內容）
- .gitignore 規則行內勿加 `#` 註解（T02 經驗：註解獨立一行）
- 若 blocked-review/ 內有「應保留」的 review 文件，則不忽略，改忽略其中產物（如 *.jsonl）