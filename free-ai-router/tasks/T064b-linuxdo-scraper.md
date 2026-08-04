---
github_issue:
title: Implement linux.do forum scraper for public new-api relay sites
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T064b - Implement linux.do forum scraper for public new-api relay sites

## 目標
從 linux.do 的 AI 科技板塊爬取公益 AI API 中轉站資訊。

## 驗收標準
- [x] 爬取 linux.do AI 科技板塊
- [x] 搜索關鍵字：「公益」、「免費」、「new-api」、「one-api」、「轉發」
- [x] 從帖子內容中提取 URL
- [x] 驗證 URL 是有效的 new-api 實例 (檢查 /v1/models 返回 200)
- [x] 返回可用中轉站列表
- [x] 處理網路錯誤和重試
- [x] 單元測試驗證爬蟲邏輯

## 備註
- linux.do 是中国開源社區論壇，AI 板塊活躍
- 許多公益中轉站在 linux.do 發布
- 需要 User-Agent 偽裝
- 相關: T064 (parent task), T064a (V2EX scraper)