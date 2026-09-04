---
github_issue: N/A
title: P9 - Feature Lock Check CI
type: test
priority: high
status: done
updated: 2026-09-04
depends_on:
- T026
- T021
- T060
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T062 - P9: Feature Lock Check CI

## 目標

CI 必須確認 features.lock 與 source/config 一致。

## 驗收標準

- [x] `CI-001` test: source changed but lock not regenerated → FAIL
- [x] Error code: `FEATURE_LOCK_OUTDATED`
- [x] 提示用戶執行 `mcp-go-core analyze` and `mcp-go-core generate`
- [x] `go test ./tests/ci/...` 成功

## 備註

Build verification: 不能在 source 變更但未重新生成 feature lock 的情況下 passing。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
