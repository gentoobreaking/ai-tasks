---
github_issue:
title: Implement free-tier filtering at model discovery time
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T059 - Implement free-tier filtering at model discovery time

## 目標
在模型發現階段過濾掉非免費模型，確保路由器只使用免費 tier 的模型。規範 §3.5 要求：OpenRouter 模型只包含 `pricing.prompt === "0"` 且 `pricing.completion === "0"` 的模型。

## 驗收標準
- [x] `IsFreeModel()` 函數在 `models/quality.go` 中存在且正確
- [x] `LoadSources()` 載入 OpenRouter 模型時過濾非免費模型
- [x] `DiscoverModels()` 動態發現 OpenRouter 模型時過濾非免費模型
- [x] 非 OpenRouter 提供商（nvidia、groq、cerebras 等）不受影響
- [x] 單元測試驗證免費過濾正確性
- [x] 整合測試驗證 TUI 只顯示免費模型

## 備註
- `IsFreeModel()` 已存在於 `internal/models/quality.go` 但尚未在發現流程中使用
- `FetchOpenRouterCatalog()` 可用於獲取包含定價資訊的完整模型目錄
- `sources.json` 中的 OpenRouter 模型需要被過濾
- 規範 §3.5 明確要求此過濾