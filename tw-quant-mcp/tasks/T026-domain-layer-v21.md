---
github_issue: N/A
title: pkg/domain 領域分層與模組邊界（v2.1 §7）
type: refactor
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-03
---

# T026 - pkg/domain 領域分層與模組邊界（v2.1 §7）

## 目標
建立 `pkg/domain/` 九個子模組（trend / foreign / hotspot / dividend / screener / derivatives / institutional / fundamental / risk），將既有 `pkg/engine/composite/`（財報體檢、篩選）業務邏輯遷移/對齊至 domain 層，確保 domain 模組間不互相 import（共用邏輯下沉 model/provider/cache）。

## 驗收標準
- [x] `pkg/domain/` 九子目錄建立，各含 package 與對應 v2.1 §9 情境之入口函式（先以骨架 + 轉呼叫既有 engine/composite 之薄層）
- [x] `pkg/engine/composite/` 既有實作（health.go / screen.go）遷移或標記為 domain 層之下層（避免雙重職責），不重複邏輯
- [x] 模組邊界規則測試：`go list -deps` 或 import cycle 檢查確認 domain 子模組間無直接 import
- [x] 新增第 11 種情境不需改既有模組之擴充性驗證（新增一個空 domain 子模組 + 註冊 Tool 可獨立 build）
- [x] 既有 36 工具行為不變（回歸測試全數通過）

## 任務完成摘要（2026-08-03）
- 建立 `pkg/domain/` 九子模組骨架：trend / foreign / hotspot / dividend / screener / derivatives / institutional / fundamental / risk，各附 §9 情境 package doc + 入口函式（薄層或 stub），並於 `pkg/domain/boundary_test.go` 以 `go list` 白名單驗證「domain 子模組間不得互相 import（§7）」，於 `pkg/domain/extensibility_test.go` 驗證暫建「第 11 情境」子模組可獨立 `go build`，且僅需 `mcp.Registry.Register` 一個 Tool 即可列入 tools/list（probe 用完即刪，不入產物）。
- screener / fundamental = 薄層：採型別別名（`=` 維持與 composite 型別相等）＋一行委託（`ScreenValue`/`ScreenHighYield`/`ScoreHealth`/`DefaultScoringConfig`），並以委託等價測試證明與 composite 結果一致、不重複邏輯。
- `pkg/engine/composite` 的 package doc 標記為「domain 層下層引擎」（業務入口由 domain/screener、domain/fundamental 承載；本包僅被 domain/config 引用）。
- `pkg/mcp/tools_de.go` 之 composite 消費端全數改走 `pkg/domain/screener`、`pkg/domain/fundamental`（型別別名使既有 `app_de_test.go` 之 `composite.HealthScore` 斷言保持型別相等、不需改測試）；T014/T017 行為不變。
- 驗證：`make check`（lint + 全測試）全綠。

## 備註
- 前置：T022（domain Schema 為 domain 層之資料契約）
- v2.1 §7 模組化邊界規則：「新增情境只需新增 domain 子模組並在 pkg/mcp 註冊，不需改動既有模組」
- 此任務是架構性重構，風險高：建議以小步遷移（先建骨架、再搬邏輯、最後刪舊）並保留 regression 測試
