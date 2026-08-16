---
github_issue: N/A
title: Worker Registry / Router（Phase 1）：註冊與選派
type: feature
priority: medium
status: done
depends_on:
- T005
- T021
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: '2026-08-17'
spec_version: v3
---
# T022 - Worker Registry / Router

## 目標

依 spec §17：實作 `WorkerRegistry`（register / get / list）、`WorkerDescriptor`（id / runtime / capabilities / models / locality / costClass / supportsACP / supportsMCP）與 `WorkerRouter.select(task, strategy)`。Phase 1–5 只註冊 `pi-local` 一個 worker（§17「Phase 1–5 期間只回傳一個結果」）；v0.4 的多 worker 清單僅為 schema 預留。

## 驗收標準

- [x] `WorkerRegistry` / `WorkerDescriptor`（含 v0.4 欄位）實作
- [x] `WorkerRouter.select` 依 ExecutionStrategy 回傳 worker
- [x] Phase 1–5 只註冊 `pi-local`（9B, tier: local, enabled）
- [x] `acp workers list` 顯示已註冊 worker（配合 T009）
- [x] tests：清單 / 未註冊 id 錯誤處理

## 備註

- Worker / Model / Execution Tier 三者分離的原型（§25.3、Rule 7），完整 Tier 系統在 Phase 9（非本任務範圍）。