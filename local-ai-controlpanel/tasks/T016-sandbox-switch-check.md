---
github_issue: N/A
title: Sandbox 可切換執行 + sandbox check + Matrix 測試（Phase 2，2d/2f）
type: feature
priority: high
status: done
depends_on: [T013, T014, T015]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13
---

# T016 - Sandbox 可切換執行 + sandbox check + Matrix

## 目標

依 spec §38 Phase 2（2d/2f）與 §39 DoD：`acp sandbox check` 顯示 bwrap / seatbelt / Shuru 三後端狀態；`acp verify TASK-001 --sandbox <mode>` 同一 verifier 可切換 sandbox 執行；Sandbox Matrix（5 verifier × 3 sandbox 後端，可用者）測試通過。

## 驗收標準

- [x] `GET /api/v1/sandbox` 回傳各後端 `{ bwrap, seatbelt, shuru, docker }` 布林（真 isAvailable）
- [x] `acp sandbox check` 顯示三後端狀態（bwrap/shuru/docker macOS=不可用，seatbelt=可用）
- [x] `acp verify TASK-001 --sandbox bwrap|seatbelt|shuru|docker` 可切換執行同一 verifier（real engine）
- [x] Sandbox Matrix：可用（後端 × verifier）組合全部通過（integration test）
- [x] selectSandbox auto 模式在 macOS 選 seatbelt（§21.2 step 4）
- [x] `verification.sandbox.mode` config 切換生效（selectSandbox step 2）
- [x] tasks 表加 `workspace` 欄位；TaskDetail.workspace；`acp task run --workspace`

## 備註

- Phase 2 收尾驗收（§38「驗證：Patch → Policy → Sandbox → Test＋acp sandbox check 三後端狀態正常」）完成。
- bwrap / shuru 在 macOS 上以 isAvailable=false 與測試跳過呈現，不視為失敗。
- `acp verify` 缺 workspace → 400 提示 `--workspace`；指定模式不可用則依 §21.2 fallback 到預設 backend。
- 實作 commit：`e810541`（README `30c3bff`）。