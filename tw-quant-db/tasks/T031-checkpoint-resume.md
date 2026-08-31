---
id: T031
project: tw-quant-db
assignee: "pi"
priority: medium
type: implementation
status: done
depends_on: [T030]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-31
updated: 2026-08-31
---

# T031 - Checkpoint/Resume Mechanism

## 目標
實作 spec §12 acceptance criteria: "程式可中斷後恢復 (checkpoint 機制)"。

## 驗收標準
- [x] Checkpoint file `backfill_checkpoint.json` written after each completed month
- [x] Records: last completed stock + month
- [x] `--resume` flag reads checkpoint and skips completed months
- [x] Crash-safe: checkpoint written before/after each month batch

## 備註
- spec §12 驗收標準第 5 項
- checkpoint file path 可 via `CHECKPOINT_DIR` env var (default: ./checkpoints)
