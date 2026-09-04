---
github_issue: N/A
title: P3 - Explicit Disable Validation
type: feat
priority: high
status: pending
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

- [ ] 若 ENABLED feature A 依賴 hard dependency B，且 B 被 DISABLED → ERROR `FEATURE_REQUIRED`
- [ ] 錯誤訊息包含: feature 名稱, required_by 關係
- [ ] `DISABLED` 不得覆蓋 true HARD dependency (必須 error，不得 silently re-enable)
- [ ] `N001` test: enable A, A→B, disable B → ERROR `FEATURE_REQUIRED`
- [ ] 非 hard dependency的 disable 不會產生錯誤
- [ ] `go test ./internal/featuregraph/...` 成功

## 備註

對應 implementation_plan §7 驗收條件 Explicit Disable。Algorithm details in algs/explicit-disable.md。
