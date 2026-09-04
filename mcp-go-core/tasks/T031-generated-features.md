---
github_issue: N/A
title: P5 - Generated Features Constants
type: feat
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T030
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T031 - P5: Generated Features Constants

## 目標

生成 `.mcp/generated/features.go` 包含 feature flag constants (metadata only)。

## 驗收標準

- [ ] `features.go` 包含 FeatureCore, FeatureHTTP, FeatureJWT, FeatureOTel, FeatureOAuth 等 constants
- [ ] Enabled features = true, disabled = false
- [ ] Constants 為 metadata，不作為主要 optimization mechanism
- [ ] `go test ./internal/generator/...` 成功

## 備註

Actual optimization: static imports + Go linker dead-code elimination。Constants are secondary metadata。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
