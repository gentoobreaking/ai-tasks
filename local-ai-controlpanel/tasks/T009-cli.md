---
github_issue: N/A
title: CLI（Phase 1）：acp 指令集（§29）
type: feature
priority: high
status: done
depends_on: [T005, T006, T007, T008]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13

commit: 865db52
---

# T009 - CLI

## 目標

依 spec §29 CLI：實作 `acp` 指令（apps/cli），與 Desktop UI 共用同一 HTTP API（§45.1 原則 4：CLI 只是另一種 frontend）。

## 驗收標準

- [x] `acp task run "..."` 建立並即時印出 task 進度
- [x] `acp task status TASK-001` / `acp task inspect TASK-001`
- [x] `acp research TASK-001` / `acp evidence TASK-001`
- [x] `acp workers list` / `acp policy validate`
- [x] `acp verify TASK-001`（含 `--sandbox bwrap|seatbelt|shuru|docker` 旗標，實體於 T016 驗收）
- [x] `acp logs TASK-001`（event log 輸出）
- [x] v0.4/v0.5 指令：`acp strategy TASK-001`、`acp sandbox check`、`acp cloud usage`（未啟用時提示）

## 備註

- CLI 不直接碰 DB / Worker / Sandbox，全部走 Control Plane HTTP API。
- T016 完成前，`sandbox` 相關指令可先顯示 stub 狀態。