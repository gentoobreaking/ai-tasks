---
id: T019
project: gold-analysis
source_project: gold-analysis-core
title: 實盤交易接口設計
assignee: "pi with opencode/x-preview-f-free"
priority: medium
type: feature
status: done
created: 2026-04-07
updated: 2026-08-28
estimate: 3天
depends_on: []
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/64
---

## 目標
設計與交易所的 API 接口，支持實盤交易執行。

## 驗收標準
- [ ] 交易所 API 研究完成（RestExchangeClient 實作通用 v20 REST；真實券商連線未驗證）
- [ ] 接口規格設計完成（ExchangeClient 抽象介面：get_account / get_positions / get_market_price / submit_order / cancel_order）
- [ ] 認證機制設計完成（RestExchangeClient Bearer Token；真實憑證流程未實連）
- [ ] 訂單結構設計完成（order_types.py：Order / Fill / Position / Side / OrderType）
- [ ] 風控規則設計完成（risk_rules.py：允許商品 / 單筆與持倉上限 / 回撤限制 / kill-switch）

## 產出
- 交易接口設計：`backend/app/trading/exchange_client.py`（ExchangeClient ABC）
- 訂單結構定義：`backend/app/trading/order_types.py`
- 風控規則模組：`backend/app/trading/risk_rules.py`

## 備註
Phase 5 交易層接口。需支持多個交易所（如 OANDA、IG 等）。認證與 API 研究僅實作於程式碼（Bearer + v20 REST），真實券商連線/憑證流程標記 `[NEEDS VERIFICATION]`。多交易所擴充透過實作 `ExchangeClient` 抽象介面達成（相依注入 opener）。