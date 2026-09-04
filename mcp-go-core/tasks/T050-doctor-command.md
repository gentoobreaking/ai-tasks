---
github_issue: N/A
title: P7 - CLI Doctor Command
type: feat
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T041
- T049
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T050 - P7: CLI Doctor Command

## 目標

建立 `mcp-go-core doctor` 命令，可 inspect binary, show enabled features, show modules, detect unexpected deps。

## 驗收標準

- [x] `mcp-go-core doctor` 執行
- [x] `mcp-go-core doctor dist/server` inspect binary
- [x] 可以 show enabled features
- [x] 可以 show modules
- [x] 可以 detect unexpected dependency
- [x] 驗證: Go version, Configuration, Feature graph, Dependency cycles, Missing dependencies, Conflicting features, Generated code, Build configuration, Transport configuration, Security configuration
- [x] `go test ./cmd/... ` 成功

## 備註

對應 architecture §32 doctor, build_pipeline_spec §53 Docker Integration, verification_manual §20 Binary Audit Method。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
