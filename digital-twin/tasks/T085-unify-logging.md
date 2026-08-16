---
github_issue: null
title: 統一 scheduler.py 的日誌輸出為 structlog
type: pending
priority: low
status: done
depends_on:
- T083
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: '2026-08-17'
spec_version: v3
---
# T085 - 統一 scheduler.py 的日誌輸出為 structlog

## 目標
將 `scheduler.py` 中殘留的 `print()` 呼叫全部收斂為 `structlog` 結構化日誌，並以 `--verbose` 旗標控制人類可讀輸出。

## 背景
T052 已將 107 個 print 收斂為 observability 事件，但 scheduler 中仍有多處 print 與 structlog 並行輸出。這導致：
- 日誌格式不一致（JSON 與純文字混雜）
- 生產環境難以用日誌系統統一收集與分析
- debug 時缺少結構化欄位（task_id / project / version 等）

## 驗收標準
- [x] `scheduler.py` 內所有 `print()` 替換為 `log.info()` / `log.warning()` / `log.error()`
- [x] 新增 `--verbose` CLI 旗標：啟用時輸出人類可讀格式（含進度條/emoji），否則純 JSON
- [x] structlog 事件包含足夠的結構化欄位（task_id, project, version, round, error 等）
- [x] 現有測試全通過
- [x] ruff check 零錯誤

## 備註
- 需注意 `--once` 模式下的 stdout 輸出（可能被腳本捕獲）
- 參考 T052 的事件清單：task_selected/succeeded/failed/diff_gate_rejected/commit_made
- 若 T083 已完成，此任務範圍涵蓋拆分後的所有相關模組