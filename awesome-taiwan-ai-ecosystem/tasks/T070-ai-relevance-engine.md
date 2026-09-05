---
github_issue: N/A
title: AI Relevance Engine — Independent AI scoring (LLM, agent, RAG, etc.)
assignee: pi
type: feat
priority: high
status: pending
depends_on: ["T065", "T066", "T067"]
created: 2026-09-05
updated: 2026-09-05
---

# T070 - AI Relevance Engine — Independent AI scoring (LLM, agent, RAG, etc.)

## 目標

建立 AI 相關性評分引擎，完全獨立於 Taiwan relevance 與 MCP identity（規格書 §4.3, §7, §45, §61 Phase 3）。

新檔案：`internal/engines/ai_relevance.go`。

演算法參考需新增：`algs/ai-relevance.md`。

## 驗收標準

- [ ] `internal/engines/ai_relevance.go` 新建：
  - [ ] `Score(entity *Entity, signals AISignals) AIRelevance` 核心函數
  - [ ] 輸入：Entity（含 repository, README, source code, package manifests, topics）
  - [ ] 輸出：`AIRelevance{Score, Level, Evidence, Confidence}`
  - [ ] **不依賴** entity.Classification, entity.MCPIdentity, entity.TaiwanRelevance
- [ ] AI 發現信號（規格書 §7）：
  - [ ] AI, LLM, agent, agentic, generative AI, GenAI
  - [ ] machine learning, deep learning
  - [ ] RAG, retrieval, embedding, vector
  - [ ] LLM tool, AI assistant, AI agent
  - [ ] Claude, ChatGPT, Gemini, OpenAI, Anthropic
  - [ ] MCP, Model Context Protocol
  - [ ] tool calling, function calling, AI workflow
- [ ] 評分規則（需設計，建議）：
  - [ ] Core AI implementation (source code): +40
  - [ ] LLM integration (API calls): +30
  - [ ] Agent framework usage: +25
  - [ ] RAG/vector/embedding implementation: +25
  - [ ] MCP protocol implementation: +20
  - [ ] AI SDK/Library dependency: +15
  - [ ] AI keywords in README/topics: +10
  - [ ] AI-related package dependencies: +10
- [ ] 等級閾值（建議，可調整）：
  - [ ] >=70 → A5 (Core AI), >=50 → A4, >=30 → A3, >=15 → A2, >=5 → A1, <5 → A0
- [ ] Evidence 記錄：每條規則產生對應 Evidence
- [ ] Confidence：確定性規則 = 1.0
- [ ] 可配置的 AI 信號字典（T071 交付前先硬編碼，再整合配置）
- [ ] 單元測試：每條規則獨立測試、組合測試、閾值邊界測試
- [ ] 確定性測試：同輸入 100 次產生相同分數

## 備註

- **關鍵**：AI relevance 必須不增加 MCP confidence（規格書 §4.3）
- 這些是「發現信號」，不決定最終分類（規格書 §7, §288）
- 新增 `AIRelevance` struct 在 `internal/models/ai_relevance.go`
- 需新增 `algs/ai-relevance.md` 文檔化演算法

## 執行紀錄

- 待執行