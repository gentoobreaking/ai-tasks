---
github_issue: N/A
title: seatbelt（sandbox-exec）adapter（Phase 2，2c）— macOS 預設
type: feature
priority: high
status: pending
depends_on: [T012]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13
---

# T013 - seatbelt（sandbox-exec）adapter

## 目標

依 spec §21.2（macOS 預設）與 §28.1（default-deny profile）：實作 seatbelt adapter，以 `sandbox-exec -f verification-default.sb <cmd>` 執行；`sandbox-profiles/verification-default.sb` 依 §28.1 範本打磨（deny default；workspace 可寫、系統目錄唯讀；deny network*）。

## 驗收標準

- [ ] `sandbox-profiles/verification-default.sb` 建立並可被 sandbox-exec 載入
- [ ] `isAvailable()` 正確偵測（難用 sandbox-exec 於 macOS）
- [ ] 在 sandbox 內執行 `pytest` / `npm test` 等 verifier 成功
- [ ] 隔離測試：profile 能擋寫入系統目錄（e.g. 嘗試寫 /usr 被拒）
- [ ] sandbox 內 network 被拒（deny network*）
- [ ] `acp verify TASK-001 --sandbox seatbelt` 可切換執行（配合 T009/T016）

## 備註

- 這是目前 M2 MacBook Air 機台上的預設 sandbox（§21.2 選擇邏輯 step 4 的 darwin 分支）。
- profile 路徑設為 config 可覆寫（`verification.sandbox.seatbelt.profile`，§30）。