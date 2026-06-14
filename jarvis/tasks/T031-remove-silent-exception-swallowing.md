---
github_issue:https://github.com/gentoobreaking/ai-tasks/issues/763
type: pending
priority: medium
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-13
howto: ~/howto
---

# T031 - 移除 Silent exception swallowing

## 目標
將所有 `except: pass` 區塊替換為有意義的錯誤處理和日誌記錄。

## 驗收標準
- [ ] `lifespan` 中的 exception 有適當處理
- [ ] `switch_model` 中的 exception 有適當處理
- [ ] TTS 階段的 exception 至少記錄 logger warning
- [ ] 其他 `except: pass` 區塊補足錯誤處理

## 備註
Silent exception 讓 debug 變得極度困難。