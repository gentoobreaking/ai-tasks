---
github_issue: N/A
title: P5 - Generated Code Staleness Check
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

# T037 - P5: Generated Code Staleness Check

## 目標

實作 `mcp-go-core generate --check`，檢查 generated source 是否落後於 resolution。

對應 spec §4.6, build_pipeline_spec §46, algs/code-generation.md, agent_tasks TASK-076。

## 驗收標準

- [x] `generate --check` 命令實現
- [x] 若 `.mcp/generated/` 與當前 resolution 不一致 → FAIL
- [x] Error code: `GENERATED_CODE_STALE`
- [x] 提示用戶執行 `mcp-go-core generate` 來更新
- [x] 若 generated code 與 resolution 一致 → PASS (exit 0)
- [x] 可用於 CI pipeline
- [x] `go test ./internal/generator/...` 成功

## 備註

對應 verification_manual §12 VERIFICATION_REPORT.md, §32 V15。CI must reject stale generated code.

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
