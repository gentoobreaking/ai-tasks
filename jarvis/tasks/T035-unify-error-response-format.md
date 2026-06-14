---
github_issue:https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/784
type: pending
priority: medium
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-13
howto: ~/howto
---

# T035 - 統一錯誤回應格式

## 目標
將所有 API 端點的錯誤回應格式統一為 `{"error": "..."}` 格式。

## 驗收標準
- [ ] 所有錯誤回應使用統一的 JSON 格式
- [ ] 確認 `switch_model` 等端點也遵循此格式
- [ ] 文件說明正確

## 備註