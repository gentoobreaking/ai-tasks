---
github_issue: 
title: 加入 test-race/vuln 目標並修復 race detector 抓到的 data race
type: test
priority: medium
status: done
depends_on: ["T102"]
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-23
updated: 2026-08-24
---

# T114 - race detector 導入與測試 data race 修復

## 目標
專案並發程式碼多（ping engine、TUI、router）卻沒有 race 偵測。
加入 Makefile 目標後，race detector 立即抓到一個真實 race：
TestRefreshAPIKeysRevivesNoKeyModels 直接讀 live registry 欄位，
而 engine 正在背景並發 ping 寫入同一批欄位。

## 驗收標準
- [x] make test-race：對 ping/tui/router 跑 -race
- [x] make vuln：govulncheck 掃依賴圖
- [x] 測試改經 lock 保護的 Snapshot 讀取（findInSnapshot helper）
- [x] tui -race 連跑五次穩定通過；ping/router -race 通過

## 備註
commit 7c1998c。test 從 `go test ./... -v` 改為無 -v（CI 輸出較乾淨）。
