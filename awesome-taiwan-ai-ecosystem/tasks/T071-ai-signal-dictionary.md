---
github_issue: N/A
title: AI Signal Dictionary — Configurable AI keywords/patterns (YAML)
assignee: pi
type: feat
priority: high
status: done
depends_on: ["T070"]
created: 2026-09-05
updated: 2026-09-05
---

# T071 - AI Signal Dictionary — Configurable AI keywords/patterns (YAML)

## 目標

建立可配置的 AI 信號字典，供 AI Relevance Engine 使用。對應規格書 §7, §61 Phase 3。

檔案：`config/ai_signals.yaml`。

## 驗收標準

- [ ] `config/ai_signals.yaml` 建立，結構：
  ```yaml
  core_ai_keywords:
    - AI
    - "Artificial Intelligence"
    - LLM
    - "Large Language Model"
    - "Generative AI"
    - GenAI
    - "Machine Learning"
    - "Deep Learning"
  
  agent_keywords:
    - agent
    - agentic
    - "AI agent"
    - "AI assistant"
    - "autonomous agent"
  
  rag_keywords:
    - RAG
    - retrieval
    - embedding
    - vector
    - "vector database"
    - "semantic search"
  
  llm_provider_keywords:
    - Claude
    - ChatGPT
    - Gemini
    - OpenAI
    - Anthropic
    - Cohere
    - Mistral
    - Llama
  
  mcp_keywords:
    - MCP
    - "Model Context Protocol"
    - "tool calling"
    - "function calling"
    - "AI workflow"
  
  framework_keywords:
    - LangChain
    - LlamaIndex
    - AutoGen
    - CrewAI
    - Semantic Kernel
    - LangGraph
  
  package_patterns:
    - "@modelcontextprotocol/"
    - "langchain"
    - "llamaindex"
    - "openai"
    - "anthropic"
    - "google-generativeai"
  ```
- [ ] `internal/config/ai_signals.go` 載入器：
  - [ ] `LoadAISignals(path string) (*AISignals, error)`
  - [ ] 結構體 `AISignals` 對應 YAML
  - [ ] 預設值內建
- [ ] AI Relevance Engine (T070) 整合配置載入
- [ ] 單元測試：載入 YAML、預設值 fallback

## 備註

- package_patterns 用於掃描 package.json, go.mod, pyproject.toml, Cargo.toml 等
- 關鍵字匹配支援大小寫不敏感
- 可擴展為 regex patterns

## 執行紀錄

- 待執行