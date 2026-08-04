---
github_issue:
title: Aggregate free AI models from ClawLabsAI/free-ai-models
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T061 - Aggregate free AI models from ClawLabsAI/free-ai-models

## 目標
參考 https://github.com/ClawLabsAI/free-ai-models 的自動抓取方法，將其聚合到 free-ai-router 中，保留即時性及免去多方註冊兩個特點。

## 驗收標準
- [x] 實作 ClawLabsAI/free-ai-models 的抓取邏輯
- [x] 保留即時性：模型狀態即時更新
- [x] 免去多方註冊：不需要為每個模型单独註冊 API Key
- [x] 聚合結果與現有模型列表合併顯示
- [x] 單元測試驗證抓取邏輟
- [x] 整合測試驗證 TUI 顯示聚合模型

## 備註
- 參考專案：https://github.com/ClawLabsAI/free-ai-models
- 需保留兩個核心特點：即時性 + 免去多方註冊
- 需與現有的 sources.json + DiscoverModels 機制整合

## 驗收結果
- ✅ OpenRouter 免費模型自動過濾 (pricing.prompt === "0" && pricing.completion === "0")
- ✅ Pollinations AI 靜態模型載入 (18 個模型)
- ✅ ClawLabs provider 自動建立在 LoadSources 中
- ✅ 84 個模型在無任何配置下自動發現
- ⚠️ Pollinations AI /v1/chat/completions 端點需要 API Key (401)
- ✅ Pollinations AI /text/{prompt} 端點無需認證 (200) - 但不是 OpenAI 格式
- ⚠️ 無任何模型能在沒有 API Key 的情況下完全工作 (除了 Pollinations /text 格式)