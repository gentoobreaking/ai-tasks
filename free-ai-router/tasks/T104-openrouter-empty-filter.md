---
github_issue: 
title: OpenRouter 模型清單為空的過濾修復
type: bug
priority: high
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-23
updated: 2026-08-23
---

# T104 - OpenRouter 靜態清單與免費清單交集為空導致 0 模型

## 目標
快取建立時將靜態策畫清單（20 個模型）與線上免費清單取交集，
但兩者 ID 格式完全不同（`openrouter/vendor/model` vs `vendor/model:free`），
交集永遠是空 → 快取中 openrouter.models = 0 → 主畫面永不顯示 OpenRouter。

## 驗收標準
- [x] 線上免費清單抓取成功時直接採用（22 個模型），不再取交集
- [x] 抓取失敗時退回靜態清單作為 fallback
- [x] keepDiscoveredModel 移除錯誤的 provider 前綴比對
- [x] 實測 refresh 後 openrouter 有 22 個模型且出現在主畫面

## 備註
commit 0731a23。
