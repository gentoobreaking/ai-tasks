---
github_issue:https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/761
type: pending
priority: low
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-13
howto: ~/howto
---

# T029 - 移除重複的 json import

## 目標
清理 `app.py` 中重複的 `import json` 語句。

## 驗收標準
- [ ] 只保留 line 27 的 `import json`
- [ ] 移除 line 87, 142, 342 的重複 import
- [ ] 確認功能正常運作

## 備註