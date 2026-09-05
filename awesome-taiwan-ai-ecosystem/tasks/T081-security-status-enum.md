---
github_issue: N/A
title: Security Status Enum — CLEAN, SUSPICIOUS, QUARANTINED, BLOCKED
assignee: pi
type: feat
priority: high
status: pending
depends_on: ["T080"]
created: 2026-09-05
updated: 2026-09-05
---

# T081 - Security Status Enum — CLEAN, SUSPICIOUS, QUARANTINED, BLOCKED

## 目標

定義安全狀態 enum，對應規格書 §54, §61 Phase 8。

放置於 `internal/models/security_status.go`。

## 驗收標準

- [ ] `SecurityStatus` enum：
  - [ ] `CLEAN` — 無發現安全問題
  - [ ] `SUSPICIOUS` — 發現低/中風險模式，需關注但不阻擋
  - [ ] `QUARANTINED` — 發現高風險/可疑惡意模式，隔離待人工審查（規格書 §12, §56 Test 12）
  - [ ] `BLOCKED` — 確認惡意，永久阻擋
- [ ] `ValidSecurityStatuses` slice
- [ ] `IsValidSecurityStatus(s string) bool`
- [ ] 狀態轉換規則：
  - [ ] CLEAN → SUSPICIOUS（新掃描發現風險）
  - [ ] SUSPICIOUS → QUARANTINED（風險升級或人工判定）
  - [ ] QUARANTINED → BLOCKED（確認惡意）
  - [ ] QUARANTINED → CLEAN（誤報，人工確認）
  - [ ] 任何 → BLOCKED（緊急阻擋）
- [ ] `CanTransitionSecurity(from, to SecurityStatus) bool`
- [ ] `SecurityStatus` 嵌入 Entity：`Security{Status, Findings, ScannedAt, ScannerVersion}`
- [ ] Registry View 影響（規格書 §54）：
  - [ ] `security_status != BLOCKED` 才能進 Verified MCP Servers
  - [ ] `QUARANTINED` 實體不出現在任何公開 view
- [ ] JSON marshal/unmarshal 測試
- [ ] 單元測試：狀態機、View 過濾

## 備註

- 獨立維度（規格書 §45）
- 與 EntityStatus 不同：EntityStatus 是生命週期，SecurityStatus 是安全評估

## 執行紀錄

- 待執行