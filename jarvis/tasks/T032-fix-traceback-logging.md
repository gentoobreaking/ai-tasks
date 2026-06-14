---
github_issue:https://github.com/gentoobreaking/ai-tasks/issues/764
type: pending
priority: medium
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-13
howto: ~/howto
---

# T032 - 修復 traceback.format_exc() 未正確記錄

## 目標
修正 WebSocket 錯誤處理，改用 `exc_info=True` 參數讓 logger 輸出完整 stack trace。

## 驗收標準
- [ ] Line 404 的 `logger.error` 加上 `exc_info=True`
- [ ] 移除多餘的 `traceback.format_exc()` 字串連接
- [ ] 測試錯誤時能在日誌看到完整 stack trace

## 備註