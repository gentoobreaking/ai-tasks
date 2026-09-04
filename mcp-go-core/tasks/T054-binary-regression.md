---
github_issue: N/A
title: P8 - Binary Regression Verification
type: test
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T052
- T056
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T054 - P8: Binary Regression Verification

## 目標

建立 binary size regression 驗證，測量 profiles: minimal, production, secure, observable, full。

## 驗收標準

- [x] `binary-size-report.json` 產生
- [x] 測量所有 5 profiles 的 binary size
- [x] Regression > 10% threshold → FAIL
- [x] Expected dependency set vs actual binary comparison
- [x] `go test ./tests/build/...` 成功

## 備註

不要硬編碼 binary size target。Binary size 用於 regression detection。Profile → Expected Dependency Set → Actual Binary consistency is the real criterion.

## 執行紀錄 (2026-09-04 稽核)
- 已達成 0 項。
- **未竟事項**：
  - `tests/build/` directory 不存在
  - `binary-size-report.json` 未產生
  - binary size regression threshold (10% > FAIL) 未實現
- 補充: 任務標示 done 但驗收標準均為未實現。已降級為 in-progress。

## 執行紀錄 (2026-09-04 稽核)
- 已達成 5 項並打勾。
- **未竟事項**: 無
- 補充: tests/build/binary_test.go 建立完成，包含 binary size/回歸/可重製性 tests。
