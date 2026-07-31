---
github_issue: N/A
title: TPEx Adapter（上櫃盤後）
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T009 - TPEx Adapter

## 目標
實作 `pkg/provider/tpex.go`：TPEx OpenAPI（`www.tpex.org.tw/openapi`）上櫃資料 Adapter，涵蓋 §2 登錄表 TPEx-API 全部內容。

## 驗收標準
- [ ] 上櫃日收盤行情、本益比/估值、指數
- [ ] 上櫃三大法人（個股+彙總）、融資融券
- [ ] 注意/處置股、除權息行事曆、零股交易
- [ ] 每資料集 Validate + Normalize + 單位換算（與 §5.1 一致）
- [ ] 契約測試（fixtures 回放）：欄位型別/單位/日期格式
- [ ] 上市/上櫃邊界案例：同 code 於兩市場不存在時之錯誤處理

## 備註
- 上市資料一律走 T008，上櫃一律走本 Adapter；cross-market 查詢由上層工具負責 fallback（§2.1）
- Rate Limit 1/1s（§4.4）
