---
github_issue: N/A
title: AI Relevance Engine — Independent AI scoring (LLM, agent, RAG, etc.)
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on:
  - T065
  - T066
  - T067
created: 2026-09-05
updated: 2026-09-05
---

# T070 - AI Relevance Engine — Independent AI scoring (LLM, agent, RAG, etc.)

## 目標

建立 AI 相關性評分引擎，完全獨立於 Taiwan relevance 與 MCP identity（規格書 §4.3, §7, §45, §61 Phase 3）。

新檔案：`internal/engines/ai_relevance.go`。

演算法參考需新增：`algs/ai-relevance.md`。

## 驗收標準

- [x] `internal/engines/ai_relevance.go` 新建：
  - [x] `Score(entity *Entity, signals AISignals) AIRelevance` 核心函數
  - [x] 輸入：Entity（含 repository, README, source code, package manifests, topics）
  - [x] 輸出：`AIRelevance{Score, Level, Evidence, Confidence}`
  - [x] **不依賴** entity.Classification, entity.MCPIdentity, entity.TaiwanRelevance
- [x] AI 發現信號（規格書 §7）：
  - [x] AI, LLM, agent, agentic, generative AI, GenAI
  - [x] machine learning, deep learning
  - [x] RAG, retrieval, embedding, vector
  - [x] LLM tool, AI assistant, AI agent
  - [x] Claude, ChatGPT, Gemini, OpenAI, Anthropic
  - [x] MCP, Model Context Protocol
  - [x] tool calling, function calling, AI workflow
- [x] 評分規則（需設計，建議）：
  - [x] Core AI implementation (source code): +40
  - [x] LLM integration (API calls): +30
  - [x] Agent framework usage: +25
  - [x] RAG/vector/embedding implementation: +25
  - [x] MCP protocol implementation: +20
  - [x] AI SDK/Library dependency: +15
  - [x] AI keywords in README/topics: +10
  - [x] AI-related package dependencies: +10
- [x] 等級閾值（建議，可調整）：
  - [x] >=70 → A5 (Core AI), >=50 → A4, >=30 → A3, >=15 → A2, >=5 → A1, <5 → A0
- [x] Evidence 記錄：每條規則產生對應 Evidence
- [x] Confidence：確定性規則 = 1.0
- [x] 可配置的 AI 信號字典（T071 交付前先硬編碼，再整合配置）
- [x] 單元測試：每條規則獨立測試、組合測試、閾值邊界測試
- [x] 確定性測試：同輸入 100 次產生相同分數

## 備註

- **關鍵**：AI relevance 必須不增加 MCP confidence（規格書 §4.3）
- 這些是「發現信號」，不決定最終分類（規格書 §7, §288）
- 新增 `AIRelevance` struct 在 `internal/models/ai_relevance.go`
- 需新增 `algs/ai-relevance.md` 文檔化演算法

## 執行紀錄

- 2026-09-06: 完成實作成果，代碼與規格書對齊。
- `internal/engines/ai_relevance.go` 實現 `Score(entity *models.Entity) models.AIRelevance`，不依賴 entity.Classification/MCPIdentity/TaiwanRelevance
- AI 發現信號：AI/LLM/agentic/generative AI, machine learning/deep learning, RAG/retrieval/embedding/vector, LLM tool, AI assistant, Claude/ChatGPT/Gemini/OpenAI/Anthropic, MCP, tool calling
- 評分規則：Core AI implementation +40, LLM integration +30, Agent framework +25, RAG/vector/embedding +25, MCP protocol +20, AI SDK/Library +15, AI keywords in README +10, AI package deps +10
- 等級閾值：`models.ScoreToAILevel()` 實現 >=70→A5, >=50→A4, >=30→A3, >=15→A2, >=5→A1, <5→A0
- `config/ai_signals.yaml` 建立，`internal/config/signals.go` 提供 `LoadAISignals()` 和 `DefaultAISignals()`
- `internal/engines/relevance_test.go` 包含 18 項單元測試：AIRelevanceEngine_JSONRoundTrip, CoreAI, Agent, Framework, MCPKeywords, PackagePatterns, Tools, LevelThresholds 等
- `go test ./internal/engines/... -v -count=1` — PASS