---
github_issue: N/A
title: 候選清單生命週期 tracker
type: feat
priority: medium
status: pending
depends_on:
- T008
- T012
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T015 - 候選清單生命週期 tracker

## 目標
`waste/tracker.go`：候選清單生命週期管理——首次提醒 → 週期重提（浪費金額累加更新）→
Telegram 一鍵「已處理／暫不處理」→ 結案統計。
**實作依據：`algs/waste-detection.md` §E.2 狀態機。**

## 驗收標準

### 狀態機遷移（§E.2 圖逐條）
- [ ] candidate → notified：判定成立滿 window 觸發首次提醒
- [ ] notified → renote：每 renotify_every 重提，**浪費金額累加更新**（「拖越久越貴」具象化）
- [ ] renote → dismissed：Telegram 一鍵「暫不處理」，可選期限（預設 30d）後**自動復活重新提醒**；復活邏輯有測試
- [ ] renote/notified → resolved：一鍵「已處理」→ 結案入統計
- [ ] dismissed 建議附一句原因（可空白但 UI 引導），原因入库供 §6.8 目錄調整參考（§E.2 條列第二點）

### 統計與價值自證
- [ ] resolved 的節省金額加總 → 月報「本工具幫你省了多少」（§E.2 最末條）

### 整合
- [ ] Telegram callback 與 store 狀態同步的整合測試；callback 遺失/重放不造成狀態卡死或重複結案
