---
github_issue: 
title: 補齊 pollinations/kiro/clawlabs metadata 與 clawlabs key fallback
type: bug
priority: medium
status: done
depends_on: ["T106"]
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-23
updated: 2026-08-23
---

# T107 - 既存 provider 的 metadata 缺口

## 目標
pollinations、kiro、clawlabs 在 sources.json 有定義但 registry.go 沒有
ProviderMeta——env 偵測與 signup URL 靜默失效。clawlabs 的 URL 是空字串，
22 個模型全是無 endpoint 死條目。

## 驗收標準
- [x] registry.go 補 pollinations / kiro / clawlabs 三筆 metadata
- [x] clawlabs URL 指向 OpenRouter chat/completions（其目錄即 OpenRouter 免費層）
- [x] config.ResolveAPIKey 新增 clawlabs → openrouter key fallback
- [x] 22 個 clawlabs 模型復活為可 ping 狀態
- [x] 實測無幽靈 provider

## 備註
commit bc478c3。
