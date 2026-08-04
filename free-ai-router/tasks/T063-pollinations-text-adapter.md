---
github_issue:
title: Add Pollinations /text endpoint adapter for truly keyless free models
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T063 - Add Pollinations /text endpoint adapter for truly keyless free models

## 目標
實現 Pollinations AI 的 `/text/{prompt}` 端點支持，讓使用者可以在沒有任何 API Key 的情況下使用免費 AI 模型。

目前 Pollinations AI 有兩個端點：
- `/v1/chat/completions` (OpenAI 格式) — 需要 API Key (401)
- `/text/{prompt}` — **無需認證** (200)，但使用不同的 API 格式

## 驗收標準
- [ ] 實作 Pollinations /text API 的格式轉換 adapter
- [ ] 將 OpenAI chat/completions 格式轉換為 Pollinations /text 格式
- [ ] 支援 model 參數映射 (openai → gpt-4o, deepseek → deepseek-v3, etc.)
- [ ] 在沒有 API Key 時自動 fallback 到 /text 端點
- [ ] Ping engine 可以 ping /text 端點驗證可用性
- [ ] 單元測試驗證格式轉換
- [ ] 整合測試驗證 end-to-end 無 key 可用

## 備註
- `/text/{prompt}` 端點: `GET https://text.pollinations.ai/{prompt}?model={model}&token={optional}`
- Response is plain text (not JSON)
- Need to wrap in a response adapter to make it OpenAI-compatible
- This is the only truly keyless free model option available
- Related: T064 (public relay site scanner)