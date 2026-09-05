---
github_issue: N/A
title: Entity Status Enum — DISCOVERED, CANDIDATE, VERIFIED, QUARANTINED, REJECTED
assignee: pi
type: feat
priority: high
status: pending
depends_on: ["T065"]
created: 2026-09-05
updated: 2026-09-05
---

# T067 - Entity Status Enum — DISCOVERED, CANDIDATE, VERIFIED, QUARANTINED, REJECTED

## 目標

定義實體生命週期狀態 enum，對應規格書 §8, §55, §64。

放置於 `internal/models/entity_status.go`。

## 驗收標準

- [ ] `EntityStatus` string enum 定義：
  - [ ] `DISCOVERED` — 剛被發現，尚未分類（規格書 §8）
  - [ ] `CANDIDATE` — 已分類，待驗證（規格書 §55）
  - [ ] `VERIFIED` — 已通過驗證（運行時驗證、安全掃描等）
  - [ ] `QUARANTINED` — 懷疑惡意代碼，隔離審查（規格書 §12, §56 Test 12）
  - [ ] `REJECTED` — 明確非目標類型或惡意
- [ ] `ValidEntityStatuses` slice
- [ ] `IsValidEntityStatus(s string) bool` 驗證函數
- [ ] 狀態轉換規則文檔（註解）：
  - [ ] DISCOVERED → CANDIDATE（分類完成）
  - [ ] CANDIDATE → VERIFIED（驗證通過）
  - [ ] CANDIDATE → QUARANTINED（安全掃描發現可疑）
  - [ ] CANDIDATE → REJECTED（分類為 NON_AI 或明確非目標）
  - [ ] QUARANTINED → REJECTED（確認惡意）或 VERIFIED（誤報）
  - [ ] VERIFIED → REJECTED（後續發現問題）
- [ ] `CanTransition(from, to EntityStatus) bool` 函數實現上述規則
- [ ] JSON marshal/unmarshal 測試
- [ ] 單元測試覆蓋所有狀態與轉換規則

## 備註

- 規格書 §55 強調：永遠不要將 `CANDIDATE` 作為 `VERIFIED SERVER` 展示
- 規格書 §54：只有滿足所有條件才能進入 Verified MCP Servers view
- 狀態與分類、MCP identity、安全狀態、品質分數都是獨立維度（規格書 §45）

## 執行紀錄

- 待執行