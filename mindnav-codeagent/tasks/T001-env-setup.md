---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/484
title: T001 - 環境建置與本地模型部署 (Ollama & LLM)
type: Feature
priority: high
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T001 - 環境建置與本地模型部署 (llama-cpp-python & GGUF)

## Description
部署獨立的本地推理伺服器 (llama-cpp-python)，實現「推理與調度分離架構」。支援多個 Agent 實例併發呼叫，並確保硬體加速 (GPU/MPS) 正常運作。

## Acceptance Criteria
- [x] 成功安裝 llama-cpp-python[server]。
- [x] 準備 Qwen2.5-Coder-7B 的 GGUF 格式模型文件。
- [x] 啟動獨立推理伺服器，並驗證 OpenAI 相容接口 (http://localhost:8000/v1)。
- [x] 測試 `--n_slots` 併發能力，確保多個 Agent 請求不會互相阻塞。

## Notes
- 推理與調度分離架構：底層由獨立進程載入模型，上層 Agent 透過 HTTP 請求呼叫。
- 需優化 `.env` 檔案，增加 `LOCAL_LLM_URL` 環境變數。
