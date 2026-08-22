---
github_issue: ""
title: "Model aliases: auto-coding, auto-fast, auto-cheap in chat completions"
type: pending
priority: medium
status: pending
depends_on: []
assignee: "OpenCode with DeepSeek V4 Flash"
created: "2026-08-22"
updated: "2026-08-22"
---

# T090 - Model aliases: auto-coding, auto-fast, auto-cheap in chat completions

## 目標
支援語意化模型別名，讓 API 消費者無需知道具體模型 ID 即可獲得最佳體驗。

## 驗收標準
- [ ] 支援別名（在 `selectModels` 中解析）：
  - `auto-coding` / `auto-fastest`（現有）：coding tag + 最低延遲
  - `auto-fast`：所有模型中最低平均延遲（忽略 coding tag）
  - `auto-cheap`：優先免費 tier（Pollinations、clawlabs、relay），次低延遲
  - `auto-smart`：QoS 分數最高（QualityScore × Availability + Latency tie-breaker）
- [ ] 別名解析邏輯可擴充，定義於 `internal/router/aliases.go`
- [ ] `/v1/models` 端點包含別名於回應中（`id: "auto-coding", object: "model"`）
- [ ] TUI 顯示別名說明（Help 畫面新增區塊）
- [ ] 文檔更新：README 模型選擇區塊

## 備註
- 修改位置：`internal/router/routing.go`（`selectModels`）、新增 `internal/router/aliases.go`
- 現有 `tag:` 前綴邏輯可複用，別名本質上是預定義的複合過濾器
- `auto-cheap` 需識別「真正免費」provider：pollinations、clawlabs、relay-*（無需 API key）
- QoS 計算參考 `models.ComputeQoS`，但別名可自訂權重