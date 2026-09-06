---
github_issue: N/A
title: Classify/LLM 分類器與 Rules 完善 - 適配新模型
type: refactor
priority: medium
status: done
assignee: pi with opencode
created: 2026-09-05
depends_on: []
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

- [x] `internal/classify/llm.go` 編譯通過
- [x] `internal/classify/llm.go` 編譯通過
- [x] `internal/classify/rules.go` 編譯通過
- [x] `go build ./internal/classify/...` 成功
- [x] `go test ./internal/classify/... -v` 通過

## 執行紀錄

- 修復 `llm_test.go` 中的類型轉換：`isValidLevel(string(result.Level))` 而非 `isValidLevel(result.Level)`，因為 `result.Level` 是 `models.TaiwanRelevanceLevel` 類型而非 `string`
- 確認 `models.RFC3339Time(time.Now().UTC())` 轉換已正確應用於 `rules.go`
- 確認 `server.Category` 而非 `server.TopicList` 已在 `buildLLMPrompt` 中使用
- `go test ./internal/classify/... -v -count=1` — PASS (all tests)
## 備註

- 依賴 T093、T094、T095 完成
- `models.TaiwanRelevanceLevel` 是字串類型，需 `models.TaiwanRelevanceLevel(string)` 轉換
- `server.TopicList()` 應改為 `server.Category` (MCPServer 結構中為 Category 字段)
- `time.Now().UTC()` → `models.RFC3339Time(time.Now().UTC())`
- 相關任務：T093、T094、T095