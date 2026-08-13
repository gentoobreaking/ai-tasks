---
github_issue: N/A
title: Sandbox 可切換執行 + sandbox check + Matrix 測試（Phase 2，2d/2f）
type: feature
priority: high
status: pending
depends_on: [T013, T014, T015]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13
---

# T016 - Sandbox 可切換執行 + sandbox check + Matrix

## 目標

依 spec §38 Phase 2（2d/2f）與 §39 DoD：`acp sandbox check` 顯示 bwrap / seatbelt / Shuru 三後端狀態；`acp verify TASK-001 --sandbox <mode>` 同一 verifier 可切換 sandbox 執行；Sandbox Matrix（5 verifier × 3 sandbox 後端，可用者）測試通過。

## 驗收標準

- [ ] `GET /api/v1/sandbox` 回傳各後端 `{ bwrap: bool, seatbelt: bool, shuru: bool, docker: bool }`（T008 stub 換真）
- [ ] `acp sandbox check` 顯示三後端狀態（DoD §39），UI badge 供 T025
- [ ] `acp verify TASK-001 --sandbox bwrap|seatbelt|shuru|docker` 可切換執行同一 verifier
- [ ] Sandbox Matrix：可用的（后端 × verifier）組合全部通過
- [ ] selectSandbox 的 auto 模式在 macOS 選 seatbelt（§21.2）
- [ ] verification.sandbox.mode（auto|bwrap|seatbelt|shuru|docker）config 切換生效（§30）

## 備註

- 這是 Phase 2 的收尾驗收（§38「驗證：Patch → Policy → Sandbox → Test＋acp sandbox check 三後端狀態正常」）。
- bwrap / shuru 在 macOS 上以 isAvailable=false 與測試跳過（not applicable）呈現，不視為失敗。