---
github_issue:
title: Add Pollinations /text endpoint adapter for truly keyless free models
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-05
---

# T063 - Add Pollinations /text endpoint adapter for truly keyless free models

## 目標
實現 Pollinations AI 的 `/text/{prompt}` 端點支持，讓使用者可以在沒有任何 API Key 的情況下使用免費 AI 模型。

目前 Pollinations AI 有兩個端點：
- `/v1/chat/completions` (OpenAI 格式) — 需要 API Key (401)
- `/text/{prompt}` — **無需認證** (200)，但使用不同的 API 格式

## 驗收標準
- [x] 實作 Pollinations /text API 的格式轉換 adapter
- [x] 將 OpenAI chat/completions 格式轉換為 Pollinations /text 格式
- [x] 支援 model 參數映射 (openai → gpt-4o, deepseek → deepseek-v3, etc.)
- [x] 在沒有 API Key 時自動 fallback 到 /text 端點（ping engine 已 hook）
- [x] Ping engine 可以 ping /text 端點驗證可用性
- [x] 單元測試驗證格式轉換
- [x] 整合測試驗證 end-to-end adapter 組合

## 完成摘要 (2026-08-04, 1497e1a)

### Adapter 層（已存在，已驗證）
- 6 個函數：IsPollinationsModel, MapPollinationsModel, BuildPollinationsTextURL, ConvertOpenAIToPollinations, WrapPollinationsResponse, PingPollinationsText
- 10 個單元測試透過

### 本 commit 新增
1. **Dedup ping engine** — `engine.pingPollinationsText()` 改用 `providers.BuildPollinationsTextURL()` 取代內聯 model mapping
2. **Fix 時間測量** — `time.Since(time.Now())` → `time.Since(start)`（涵蓋 T076 bug）
3. **4 個整合測試**（pollinations_integration_test.go）

### 驗證
- go build ./... ✅
- go vet ./... ✅ 零警告
- go test -count=1 ./... ✅ 全部 8 套件通過
- Pollinations adapter 測試 14 個全 PASS

> **注意：** T063 僅涵蓋 adapter 層 + ping engine。Router proxy path 中的 /text fallback 仍待 T066（Pollinations /text router hook）實作。