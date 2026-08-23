---
github_issue: 
title: main.go 啟動期 API key 解析改走 UpdateModel
type: refactor
priority: low
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-23
updated: 2026-08-23
---

# T111 - 消除繞鎖寫入模式

## 目標
runTUI/runServer 用 registry.GetAll() 取得 live model pointer 後直接改
m.APIKey，繞過 ping worker 使用的 registry 寫鎖。啟動期 engine 尚未啟動
所以無實際競爭，但此模式在日後改動極易引入 data race。

## 驗收標準
- [x] 三處改為 registry.UpdateModel(live.ID, func(x) { x.APIKey = key })
- [x] 加 nil guard
- [x] go build / 全套測試通過

## 備註
commit 31dc151。
