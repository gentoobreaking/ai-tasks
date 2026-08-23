---
github_issue: 
title: 自動發現模型的 Model 欄空白（缺 Label）
type: bug
priority: high
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-23
updated: 2026-08-24
---

# T115 - autodiscover 模型 Label 缺失

## 目標
DiscoverModels 建立的 ModelEntry 只填 ID 不填 Label，快取 TTL 過期後
autodiscover 抓到的新模型（OpenRouter 免費清單每日變動）在表格的
Model 欄整欄空白，但 header 的 Selected 用 ID 顯示所以看起來「正常」。

## 驗收標準
- [x] DiscoverModels 從上游 ID 尾段推導 Label（vendor/model:free → model:free）
- [x] LoadFromSources 遇空 Label fallback 到 ID 尾段
- [x] renderTable Label 為空時直接顯示完整 ID（三層防護）
- [x] 以模擬資料驗證無 Label 模型正確顯示

## 備註
commit 6e9e351。
