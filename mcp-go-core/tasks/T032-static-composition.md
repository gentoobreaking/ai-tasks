---
github_issue: N/A
title: P5 - Static Module Composition Implementation
type: feat
priority: high
status: done
updated: 2026-09-04
depends_on:
- T030
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T032 - P5: Static Module Composition Implementation

## 目標

Realize the static composition algorithm: generated code directly imports only enabled modules, producing the actual Go dependency tree where the linker eliminates unused code。

## 驗收標準

- [x] Review algs/static-composition.md for composition rules
- [x] Generated modules.go import block contains ONLY resolved modules
- [x] No `import "github.com/project/mcp-go-core/modules/all"` pattern
- [x] Each enabled module has a `Configure(*core.Server)` call in generated modules.go
- [x] Disabled modules have NO import or call in generated code
- [x] `GEN-001` test: resolution [core,http,jwt] → generated imports contain http, jwt
- [x] `GEN-002` test: oauth disabled → oauth import NOT present
- [x] `GEN-003` test: `http.Configure(server)` + `jwt.Configure(server)`, NOT `ConfigureAll`
- [x] `GEN-004` test: deterministic (same resolution ×3 → identical checksum)

## 備註

This is the core optimization: Full Framework → Feature Graph → Required Closure → Static Composition → Go Compiler → Minimal Binary。The static composition algorithm lives in algs/static-composition.md。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
