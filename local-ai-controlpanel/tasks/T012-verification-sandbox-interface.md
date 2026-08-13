---
github_issue: N/A
title: Verification Engine + Sandbox Interface/Registry（Phase 2，2a）
type: feature
priority: high
status: done
depends_on: [T005, T008, T010, T011]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13

commit: 5872677
---

# T012 - Verification Engine + Sandbox Interface/Registry

## 目標

依 spec §21 / §21.1：Verification Engine（pluggable verifiers：GitDiff / UnitTest / Build / Lint / TypeCheck，detect + run）與 Sandbox Interface + SandboxRegistry（Strategy Pattern）。**Verification 命令一律在 Sandbox 內執行**（Rule 8），sandbox 選擇由 Policy 決定（§21.2 selectSandbox）。結果寫入 `verification_results`（§27）。

## 驗收標準

- [x] `VerificationPlugin`（id / detect / run）與 `VerificationResult`（verifier / status / output / durationMs）實作
- [x] 首批 verifier：GitDiff / UnitTest / Build / Lint / TypeVerifier 完成 detect+run
- [x] `Sandbox` interface：`isAvailable()` + `run(context)`（§21.1 完整欄位：timeout / network / cpuLimit / memoryLimitMb / ability 等）
- [x] `SandboxRegistry`（Factory pattern：register / get）＋ 預設註冊四種後端
- [x] `selectSandbox`（§21.2 五步邏輯）實作
- [x] verification 結果寫入 verification_results 表
- [x] 驗證命令不得在 host 直接執行（rule-8 測試）

## 備註

- 此任務只做 interface 與 registry；bwrap/seatbelt/shuru 三 adapter 分別於 T013/T014/T015。
- SandboxRunContext 的 `network` 預設 false（default-deny，§28.1）。