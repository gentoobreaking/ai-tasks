---
github_issue:
title: Implement public new-api relay site scanner for keyless model access
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T064 - Implement public new-api relay site scanner for keyless model access

## 目標
自動掃描中国社區論壇（V2EX、linux.do、Gitee）發現可用的公益 new-api 中轉站，並將其整合到 freemodel-router 中，實現真正的零配置免費 AI 模型訪問。

## 驗收標準
- [x] 實作 V2EX 爬蟲（抓取 go/ai 節點，過濾「公益 API」、「免費轉發」）
- [x] 實作 linux.do 爬蟲（抓取 AI 科技板塊，過濾相關關鍵字）
- [x] 實作 Gitee 爬蟲（抓取 AI/API 相關專案）
- [x] 驗證發現的 URL 是有效的 new-api 實例（檢查 /v1/models 端點）
- [x] 將有效的中轉站添加到 providers 系統
- [x] 實現故障轉移 (HA)：輪詢多個中轉站，使用響用的那些
- [x] Ping engine 可以 ping 中轉站上的模型
- [x] 單元測試驗證爬蟲和 URL 驗證
- [x] 整合測試驗證 end-to-end 發現和使用

## 備註
- 大陸開發者不常在 GitHub 提交公共 API，集中在 V2EX、linux.do、Gitee
- 公益中轉站通常暫時性，容易掛掉，需要HA機制
- 爬蟲需要定期運行，最好每6小時掃描一次
- 需與現有的 sources.json + DiscoverModels 整合
- 相關: T063 (Pollinations /text adapter for fallback)
- T064 細分任務: T064a (V2EX scraper), T064b (linux.do scraper), T064c (Gitee scraper)