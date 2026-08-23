---
github_issue: 
title: Provider ID 前綴慣例修正（消除幽靈 provider）
type: bug
priority: high
status: done
depends_on: ["T104"]
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-23
updated: 2026-08-23
---

# T105 - 模型 ID 必須符合 `<providerKey>/<上游ID>` 慣例

## 目標
LoadFromSources 以 ID 第一段決定 Provider 歸屬，但多處違反慣例，
產生無 endpoint 的幽靈 provider 死條目：
googleai→"google"、codestral→"mistralai"、kiro/opencode→"anthropic"/"openai"、
clawlabs 免費清單用原始 ID。

## 驗收標準
- [x] sources.json：googleai/codestral/kiro/opencode 靜態 ID 加上正確前綴
- [x] providers.go：openrouter 免費清單與 clawlabs 合併時加上前綴
- [x] 實測 registry 無任何幽靈 provider，所有模型歸類正確且有 endpoint
- [x] 全套測試通過

## 備註
commit 0731a23。上游 ID 保持原樣，endpoint 解析不受影響。
