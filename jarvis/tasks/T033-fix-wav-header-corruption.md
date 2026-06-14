---
github_issue:https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/782
type: pending
priority: medium
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-13
howto: ~/howto
---

# T033 - 修復 WAV header 損壞問題

## 目標
修正 `/call` 頁面中 WAV 檔案建構的邏輯，確保 RIFF header 正確寫入。

## 驗收標準
- [ ] WAV header 的 "RIFF" identifier 正確
- [ ] `W(4, wav.byteLength - 8)` 不再被後續操作覆蓋
- [ ] 生成的 WAV 檔案能正常播放

## 備註
Line 289 寫入 "RIFF" 後，Line 290 的 `W(4, ...)` 會覆蓋 "RIFF"，導致 header 損壞。