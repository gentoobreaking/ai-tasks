---
github_issue: null
title: scheduler process_task 加入頂層例外防護（失敗記入 _record_failure 並繼續）
type: fix
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
---
# T068 - scheduler process_task 頂層例外防護

## 目標
`scheduler.py:731-930` 的 `process_task` 沒有頂層 try/except。任何在既有處理分支外的例外（例如 `fpath.write_text` 遇到目錄路徑的 `IsADirectoryError`：:781/:856、`save_pr_summary` :885、`count_diff_lines` :888）都會往上炸穿 `run()`（:972），中止整個 auto-dev 迴圈，且不執行 `_record_failure`、不做 blocked 升級、不發 Telegram 通知。

## 驗收標準
- [x] `process_task` 包頂層 try/except：欄捕例外 → 呼叫 `_record_failure`（或等價記錄）→ 回傳 False，不中斷 `run()` 迴圈
- [x] 例外訊息被記錄（observability/structlog 或 print），異常也納入 blocked-review 流程
- [x] 新增測試：模擬寫入失敗（如路徑為目錄）時 run 不崩潰、任務被標失敗、迴圈繼續處理下一個任務
- [x] 既有 scheduler 測試與 pytest 全量通過
- [x] ruff / pyright 通過

## 備註
- 注意不要吞掉 KeyboardInterrupt / SystemExit
- 配合 T066（路徑 containment）可大幅減少「壞路徑」類例外來源

## 實作摘要（2026-08-12）
- `run()` 內 `process_task` 包 try/except：`except (KeyboardInterrupt, SystemExit): raise`；其餘例外 → `observability.get_logger().exception("task_unexpected_error")` + print → 未 commit 時 `_record_failure`（含 blocked 升級與 review 產出），已 commit 後僅 `notify_background` 通知不 revert。
- 移除 except 分支冗餘 local import（統一頂層 `notify_background`）。
- 新增 `tests/test_scheduler_exception_guard.py`（5 tests）：迴圈續跑、已 commit 不 revert、未 commit 記失敗、實例化、skipped_this_run 防重試。
- 全量 pytest 251 passed、ruff / pyright 通過。
- commit: `34fd968`
