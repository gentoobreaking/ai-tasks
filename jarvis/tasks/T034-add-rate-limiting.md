---
github_issue:https://github.com/gentoobreaking/ai-tasks/issues/783
type: pending
priority: medium
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-13
howto: ~/howto
---

# T034 - 新增速率限制保護

## 目標
為 `/ws/chat` WebSocket 端點新增速率限制，防止資源被濫用。

## 驗收標準
- [ ] 每個 client 限速（例如：每分鐘 N 個請求）
- [ ] 超限時回傳适当的錯誤訊息
- [ ] 不影响正常使用的流暢度

## 備註