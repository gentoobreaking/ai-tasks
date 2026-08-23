---
github_issue: 
title: 新增 HuggingFace、OpenAI、Claude (Anthropic)、DeepSeek providers
type: feature
priority: high
status: done
depends_on: ["T105"]
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-23
updated: 2026-08-23
---

# T106 - 新增四個 provider

## 目標
新增 HuggingFace、OpenAI、Claude (Anthropic)、DeepSeek 四個 provider。
先用 curl 驗證四家 endpoint 都接受 OpenAI 格式 + Bearer
（含 Anthropic 官方 OpenAI SDK 相容層），與現有 ping/router 架構相容。

## 驗收標準
- [x] registry.go：四個 ProviderMeta（env var / signup URL / APIURL）
- [x] autodetect.go：OPENAI_API_KEY 與 HF_TOKEN/HUGGINGFACE_API_KEY/HF_API_KEY 對應
- [x] sources.json：策畫模型清單，ID 符合前綴慣例
- [x] model-tags.json：12 筆 coding/reasoning 標籤（避免被 codingOnly 預設過濾）
- [x] Settings 支援 Enter 貼 key / O signup / D 刪除；autodetect 抓 env var
- [x] 實測 endpoint/key/標籤/upstream ID 全部正確

## 備註
commit bc478c3。
