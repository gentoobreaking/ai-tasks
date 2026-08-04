---
github_issue:
title: Implement V2EX forum scraper for public new-api relay sites
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T064a - Implement V2EX forum scraper for public new-api relay sites

## 目標
從 V2EX.com 的 go/ai 節點爬取包含「公益 API」、「免費轉發」等關鍵字的帖子，提取 new-api 中轉站 URL。

## 驗收標準
- [x] 爬取 V2EX go/ai 節點 (https://www.v2ex.com/go/ai)
- [x] 搜索關鍵字：「公益 api」、「免費轉發」、「new-api」、「one-api」
- [x] 從帖子內容中提取 URL (http/https)
- [x] 驗證 URL 是有效的 new-api 實例 (檢查 /v1/models 返回 200)
- [x] 返回可用中轉站列表
- [x] 處理網路錯誤和重試
- [x] 單元測試驗證爬蟲邏輯

## 備註
- V2EX 沒有 Google 爬蟲限制，但需要 User-Agent
- 公益貼文通常有一定的生命週期（1-7天）
- 需要去重和快取結果
- 相關: T064 (parent task), T064b (linux.do scraper)