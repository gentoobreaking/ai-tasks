---
github_issue:https://github.com/gentoobreaking/ai-tasks/issues/770
type: pending
priority: medium
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-13
howto: ~/howto
---

# T038 - get_pipeline() 執行緒安全

## 目標
將 `get_pipeline()` 改為執行緒安全，避免併發請求時建立多個 pipeline 實例。

## 驗收標準
- [ ] 使用 asyncio.Lock 或類似機制保護 lazy init
- [ ] 併發請求只建立一個 pipeline 實例
- [ ] 測試高併發情境正常運作

## 備註