---
github_issue: N/A
title: Security Status Enum — CLEAN, SUSPICIOUS, QUARANTINED, BLOCKED
assignee: pi
type: feat
priority: high
status: done
depends_on: ["T080"]
created: 2026-09-05
updated: 2026-09-06
---

# T081 - Security Status Enum — CLEAN, SUSPICIOUS, QUARANTINED, BLOCKED

## 目標

定義安全狀態 enum，對應規格書 §54, §61 Phase 8。

放置於 `internal/models/security_status.go`。

## 驗收標準

- [x] `SecurityStatus` enum：
  - [x] `CLEAN` — 無發現安全問題
  - [x] `SUSPICIOUS` — 發現低/中風險模式，需關注但不阻擋
  - [x] `QUARANTINED` — 發現高風險/可疑惡意模式，隔離待人工審查（規格書 §12, §56 Test 12）
  - [x] `BLOCKED` — 確認惡意，永久阻擋
- [x] `ValidSecurityStatuses` slice
- [x] `IsValidSecurityStatus(s string) bool`
- [x] 狀態轉換規則：
  - [x] CLEAN → SUSPICIOUS（新掃描發現風險）
  - [x] SUSPICIOUS → QUARANTINED（風險升級或人工判定）
  - [x] QUARANTINED → BLOCKED（確認惡意）
  - [x] QUARANTINED → CLEAN（誤報，人工確認）
  - [x] 任何 → BLOCKED（緊急阻擋）
- [x] `CanTransitionSecurity(from, to SecurityStatus) bool`
- [x] `SecurityStatus` 嵌入 Entity：`Security{Status, Findings, ScannedAt, ScannerVersion}`
- [x] Registry View 影響（規格書 §54）：
  - [x] `security_status != BLOCKED` 才能進 Verified MCP Servers
  - [x] `QUARANTINED` 實體不出現在任何公開 view
- [x] JSON marshal/unmarshal 測試
- [x] 單元測試：狀態機、View 過濾

## 備註

- 獨立維度（規格書 §45）
- 與 EntityStatus 不同：EntityStatus 是生命週期，SecurityStatus 是安全評估

## 執行紀錄

- 2026-09-06: 完成實作。建立 `internal/models/security_status.go`，提取現有 SecurityStatus 類型至獨立文件。
  - `SecurityStatus` enum with CLEAN/SUSPICIOUS/QUARANTINED/BLOCKED constants
  - `ValidSecurityStatuses` slice, `IsValidSecurityStatus()` function
  - `CanTransitionSecurityStatus()` + `CanTransitionSecurity()` alias
  - `Entity.IsSafeForRegistry()` — excludes QUARANTINED and BLOCKED from views
  - `Entity.IsVerifiedForRegistry()` — excludes BLOCKED only
  - 新增 `security_status_test.go` (10 tests): state machine transitions, alias, JSON round-trip, view filtering
  - 修復 `models_test.go` 預編譯錯誤 (RFC3339Time conversion, RawRecord fields, ScoreToLevel rename, duplicate TestGradeForScore)
  - `go build ./...` ✓，`go test ./internal/models/... ./internal/security/... ./internal/engines/...` ✓
