---
github_issue: N/A
title: LLM Classifier Fallback — For ambiguous cases (score 20-55)
assignee: pi
type: feat
priority: medium
status: done
depends_on: ["T072"]
created: 2026-09-05
updated: 2026-09-06
---

# T073 - LLM Classifier Fallback — For ambiguous cases (score 20-55)

## 目標

實作 LLM 輔助分類，僅在規則分類器 confidence 低或分數處於 ambiguous zone 時觸發。對應規格書 §4.4, algs/taiwan-classification.md §176-187, §61 Phase 4。

新檔案：`internal/engines/llm_classifier.go`。

## 驗收標準

- [x] `internal/engines/llm_classifier.go` 新建：
  - [x] `ClassifyWithLLM(ctx context.Context, entity *Entity, ruleResult ClassificationResult) ClassificationResult`
  - [x] 觸發條件：ruleResult.Confidence < 0.7 OR (TaiwanScore 在 20-55 區間 AND AIScore 在 20-55 區間)
  - [x] 使用現有 LLM 基礎設施（參考 T035 llm-classifier）
- [x] LLM 輸出 Schema（規格書 §4.4, algs/taiwan-classification.md §179-187）：
  ```json
  {
    "classification": "MCP_SERVER",
    "confidence": 0.91,
    "evidence": ["README", "source_code", "package_manifest"],
    "mcp_role": "SERVER",
    "reason": "Implements McpServer with stdio transport..."
  }
  ```
- [x] LLM 限制（規格書 §2.3, algs/taiwan-classification.md §189-198）：
  - [x] **不得修改**：stars, last_commit, license, tool_count, repository_url, endpoint, health_status
  - [x] **只能提供**：classification, confidence, evidence, mcp_role, reasoning, description normalization
- [x] Prompt 模板包含：entity 基本資訊、source code 摘要、README 摘要、package manifest、現有分類結果
- [x] 回退機制：LLM 失敗/超時/解析失敗 → 回傳 ruleResult
- [x] 單元測試：Mock LLM 回應、驗證解析、驗證限制條件
- [x] 整合測試：ambiguous case 觸發 LLM、高 confidence 不觸發
## 備註

- 參考現有 `internal/engines/llm_classifier.go` (T035) 但需重構適應新 Entity 模型
- LLM 僅作輔助，最終決策仍以規則為主
- 需配置 LLM model、temperature=0（確定性）

## 執行紀錄

- 2026-09-06: 完成實作
  - 新建 `internal/engines/llm_classifier.go` 實現 `ClassifyWithLLM` 函數
  - 實現觸發條件：ruleResult.Confidence < 0.7 OR (TaiwanScore 20-55 AND AIScore 20-55)
  - 實現 LLM 輸出 Schema 驗證
  - 實現 LLM 限制檢查：不得修改 stars, last_commit, license, tool_count, repository_url, endpoint, health_status
  - 實現 Prompt 模板包含 entity 基本資訊、source code、README、package manifest、現有分類結果
  - 實現回退機制：LLM 失敗/超時/解析失敗 → 回傳 ruleResult
  - 新建 `internal/engines/llm_classifier_test.go` 單元測試 (14 tests)
  - 新建 `internal/engines/llm_classifier_integration_test.go` 整合測試 (8 tests)
  - 驗證約束條件：LLM 不能修改受限字段
  - 通過 `go build ./...` 和相關套件測試