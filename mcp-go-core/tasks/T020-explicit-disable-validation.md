---
github_issue: N/A
title: P3 - Explicit Disable Validation
type: feat
priority: high
status: done
updated: 2026-09-04
depends_on:
- T018
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T020 - P3: Explicit Disable Validation

## 目標

驗證 explicitly-disabled features 不得破壞 enabled features 的 hard dependencies。

對應 spec §4.5 Priority Rules, feature_graph_spec §14-15, algs/explicit-disable.md, agent_tasks TASK-055。

## 驗收標準

- [x] 若 ENABLED feature A 依賴 hard dependency B，且 B 被 DISABLED → ERROR `FEATURE_REQUIRED`
- [x] 錯誤訊息包含: feature 名稱, required_by 關係
- [x] `DISABLED` 不得覆蓋 true HARD dependency (必須 error，不得 silently re-enable)
- [x] `N001` test: enable A, A→B, disable B → ERROR `FEATURE_REQUIRED`
- [x] 非 hard dependency的 disable 不會產生錯誤
- [x] `go test ./internal/featuregraph/...` 成功

## 備註

對應 implementation_plan §7 驗收條件 Explicit Disable。Algorithm details in algs/explicit-disable.md。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
