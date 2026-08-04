---
github_issue:
title: Implement free-tier verification in ping layer
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T060 - Implement free-tier verification in ping layer

## 目標
在 ping 層驗證模型的免費 tier 狀態。規範 §3.5 定義了 HTTP 狀態碼與免費 tier 的對應關係。

## 驗收標準
- [x] HTTP 200 且定價為零 → 模型可達且免費
- [x] HTTP 401 → 金鑰缺失/無效（模型可能免費但需要認證）
- [x] HTTP 429 → 速率限制
- [x] HTTP 404/5xx → 模型不可用
- [x] ping 結果正確更新模型狀態
- [x] 單元測試驗證各 HTTP 狀態碼的處理

## 備註
- 規範 §3.5 定義了免費 tier 強制执行的 HTTP 狀態碼映射
- ping 引擎應在定期探測時驗證免費 tier 狀態
- 與 T059 配合完成完整的免費 tier 過濾