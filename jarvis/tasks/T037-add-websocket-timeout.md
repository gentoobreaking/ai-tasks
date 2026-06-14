---
github_issue:https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/769
type: pending
priority: medium
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-13
howto: ~/howto
---

# T037 - 新增 WebSocket 請求超時

## 目標
為 WebSocket 連線設定合理的超時時間，防止慢客戶端佔用資源。

## 驗收標準
- [ ] 設定適當的 idle timeout
- [ ] 設定適當的訊息處理 timeout
- [ ] 超時後乾淨地關閉連線

## 備註