---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/541
title: T037 - 各 AC 未勾項目的驗收確認腳本
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: implement
---

# T037 - 各 AC 未勾項目的驗收確認腳本

## 目標
Review 發現多個任務雖然功能已實作，但 Acceptance Criteria 未勾選確認：

| 任務 | AC 狀態 |
|------|---------|
| T001 | 3/4 未勾 |
| T012 | 4/4 未勾 |
| T015 | 4/4 未勾 |
| T018 | 2/4 未勾 |
| T020 | 3/3 未勾 |
| T025 | 3/3 未勾 |
| T026 | 3/3 未勾 |
| T027 | 3/3 未勾 |

需建立一個驗證腳本，逐一檢查各項功能是否符合任務的驗收標準，並自動更新 T*.md 中的 checkbox。

## 驗收標準
- [x] 實作 `scripts/verify_ac.py`，讀取 `tasks/T*.md` 解析 AC 列表
- [x] 對每個 AC 項目執行對應的功能測試
- [x] 若測試通過，自動將 `[ ]` 更新為 `[x]`
- [x] 支援以 dry-run 模式預覽變更
- [x] 產出驗證摘要報告

## 備註
- 腳本應可獨立執行，不依賴完整的 LangGraph 環境
- 部分 AC（如併發測試）可能需標記為「需手動確認」
- 支援 `--task T001` 參數指定單一任務驗證
