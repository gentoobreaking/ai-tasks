---
github_issue: null
title: 完成流程單軌化＋一致性檢查（/complete-task 同步 README；doctor 增 spec↔任務↔README validator）
type: feature
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-11'
commit: 8f84670
---
# T049 - 完成流程單軌化＋一致性檢查

## 目標
2026-08-11 審查確認完成流程仍雙軌（前次 design-review §三.1 未解）：
`/complete-task`（SOP 手動）與 `auto_develop.process_task` 各自更新任務書＋commit，
但 `sync_readme`（auto_develop.py:410）只在 auto 側被呼叫，手動完成時 README 不同步；
且「規格↔任務↔README」一致性無自動驗證。

## 驗收標準
- [x] `./twin blocked/complete-task` 或對應 SOP 流程完成任務後會觸發 sync_readme（與 auto 側一致）
- [x] doctor 新增「一致性」檢查項目（WARN 級別）：tasks/README.md 任務表列出的
  status/存在性 與任務檔實際 frontmatter 比對；specs 最新版本存在但任務檔缺 spec 對照欄位時警示
- [x] sync_readme 對「README 表格格式不符」的專案（如非自動產生的表格）不覆寫破壞，並回傳可辨識狀態
- [x] 手動完成路徑（SOP /complete-task）與 auto 路徑輸出的 README 結果一致
- [x] pytest 全量維持 151 passed + 1 skipped；ruff 全過

## 備註
- 現況 sync_readme 只認 `| 編號 | 名稱 | 狀態 | 優先級` 表頭；README 結構差異（如 ai-tasks 風格）需保守處理
- doctor 一致性檢查不應變 FAIL 級（避免環境差異誤報），以 WARN 呈現
- 實作補充：sync_readme 回傳值改為字串狀態碼（created/updated/skipped/error）；
  `./twin sync-readme [--project X]` 為唯一入口（exit 0=created/updated, 1=其他）；
  complete-task.md 步驟 4 改指示執行 `./twin sync-readme --project {專案}`；
  doctor 真實環境驗證：digital-twin README 為人工維護風格→info 跳過、specs v3→WARN