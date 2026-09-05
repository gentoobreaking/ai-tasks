---
github_issue: N/A
title: Classify/LLM 分類器與 Rules 完善 - 適配新模型
type: refactor
priority: medium
status: pending
depends_on: ["T093", "T094", "T095"]
assignee: pi
created: 2026-09-05
updated: 2026-09-05
---

# T096 - Classify/LLM 分類器與 Rules 完善 - 適配新模型

## 目標

修復 `internal/classify/llm.go` 和 `internal/classify/rules.go` 中的類型錯誤，適配新模型架構。

主要問題：
1. `result.TaiwanRelevance` (string) → `models.TaiwanRelevanceLevel` 類型轉換
2. `server.TopicList` 未定義，應改為 `server.Category`
3. `time.Now().UTC()` → `models.RFC3339Time(time.Now().UTC())` 類型轉換
4. `result.TaiwanRelevance` (string) → `models.TaiwanRelevanceLevel` 類型轉換
4. `server.TopicList` 未定義，應改為 `server.Category`
5. `time.Now().UTC()` → `models.RFC3339Time(time.Now().UTC())` 類型轉換

## 驗收標準

- [ ] `internal/classify/llm.go` 編譯通過
- [ ] `internal/classify/rules.go` 編譯通過
- [ ] `go build ./internal/classify/...` 成功
- [ ] `go test ./internal/classify/... -v` 通過

## 備註

- 依賴 T093、T094、T095 完成
- `models.TaiwanRelevanceLevel` 是字串類型，需 `models.TaiwanRelevanceLevel(string)` 轉換
- `server.TopicList()` 應改為 `server.Category` (MCPServer 結構中為 Category 字段)
- `time.Now().UTC()` → `models.RFC3339Time(time.Now().UTC())`
- 相關任務：T093、T094、T095