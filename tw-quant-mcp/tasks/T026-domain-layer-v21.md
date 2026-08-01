---
github_issue: N/A
title: pkg/domain 領域分層與模組邊界（v2.1 §7）
type: refactor
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-01
---

# T026 - pkg/domain 領域分層與模組邊界（v2.1 §7）

## 目標
建立 `pkg/domain/` 九個子模組（trend / foreign / hotspot / dividend / screener / derivatives / institutional / fundamental / risk），將既有 `pkg/engine/composite/`（財報體檢、篩選）業務邏輯遷移/對齊至 domain 層，確保 domain 模組間不互相 import（共用邏輯下沉 model/provider/cache）。

## 驗收標準
- [ ] `pkg/domain/` 九子目錄建立，各含 package 與對應 v2.1 §9 情境之入口函式（先以骨架 + 轉呼叫既有 engine/composite 之薄層）
- [ ] `pkg/engine/composite/` 既有實作（health.go / screen.go）遷移或標記為 domain 層之下層（避免雙重職責），不重複邏輯
- [ ] 模組邊界規則測試：`go list -deps` 或 import cycle 檢查確認 domain 子模組間無直接 import
- [ ] 新增第 11 種情境不需改既有模組之擴充性驗證（新增一個空 domain 子模組 + 註冊 Tool 可獨立 build）
- [ ] 既有 36 工具行為不變（回歸測試全數通過）

## 備註
- 前置：T022（domain Schema 為 domain 層之資料契約）
- v2.1 §7 模組化邊界規則：「新增情境只需新增 domain 子模組並在 pkg/mcp 註冊，不需改動既有模組」
- 此任務是架構性重構，風險高：建議以小步遷移（先建骨架、再搬邏輯、最後刪舊）並保留 regression 測試
