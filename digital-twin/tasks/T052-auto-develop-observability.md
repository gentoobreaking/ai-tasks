---
github_issue: null
title: auto_develop 接入 common/observability（structlog）——107 個 print 收斂
type: refactor
priority: high
status: pending
depends_on: [51]
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-11'
---
# T052 - auto_develop 接入 observability（structlog）

## 目標
審查統計 auto_develop.py 有 107 個 print()（全 repo 最多），未接入 common/observability.py
（structlog JSON），失敗統計（JSONL）與觀測指標分離——前次 design-review §二.3 的 P1 建議。
本任務在 T051 拆分完成後，將核心事件改走 observability，同時保留 CLI 人類可讀輸出。

## 驗收標準
- [ ] 關鍵事件以 observability.log 記載：task_selected / task_started / task_succeeded /
  task_failed / diff_gate_rejected / commit_made（含 task_id、fail_count 結構化欄位）
- [ ] 失敗統計（_record_failure / append_failure_log JSONL）維持既有格式不變
- [ ] CLI 人類可讀輸出（print 的進度/⚠️/⛔ 訊息）維持不變——structlog 與 print 並存，
  不要求全量替換 print
- [ ] 環境無 OTEL 時降級為 structlog JSON（沿用 obse 現況模式），不報錯
- [ ] pytest 全量維持 151 passed + 1 skipped；ruff 全過

## 備註
- telegram/worker 已示範 `from common import observability` 用法，依樣辦理
- 只加結構化事件，不刪既有 print（避免輸出語意變更影響測試斷言）
- metrics（如 diff 行數、任務耗時）可選用 observability.record_duration 加入