---
github_issue: 
title: ping body 統一為 json.Marshal 單一實作
type: refactor
priority: medium
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-23
updated: 2026-08-24
---

# T109 - ping body 三處重複與字串串接

## 目標
OpenAI 格式 ping body 以字串串接組出，且同樣程式碼複製三份
（engine.go / tui/settings.go / router/server.go）。
model ID 含引號等特殊字元會產出非法 JSON。

## 驗收標準
- [x] 新增 ping.BuildPingBody(upstreamModelID)，以 struct marshal
- [x] 三處呼叫端全部改用單一實作
- [x] marshal 失敗的防禦性 fallback（sanitize 後的字面模板）

## 備註
commit c31c46c。新增 internal/ping/pingbody.go。
