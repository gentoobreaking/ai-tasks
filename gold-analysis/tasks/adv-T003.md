---

id: adv-T003
project: gold-analysis
source_project: gold-analysis-advanced
title: 實盤交易接口設計
assignee: pi with opencode/x-preview-f-free
type: feature
priority: medium
status: done
created: 2026-04-07
updated: 2026-08-28
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/64
estimate: 3天
depends_on: []
---


## 目標
設計與交易所的 API 接口，支持實盤交易執行。

## 驗收標準
- [x] 交易所 API 研究完成（RestExchangeClient 實作通用 v20 REST；真實券商連線未驗證）
- [x] 接口規格設計完成（ExchangeClient 抽象介面：get_account / get_positions / get_market_price / submit_order / cancel_order）
- [x] 認證機制設計完成（RestExchangeClient Bearer Token；真實憑證流程未實連）
- [x] 訂單結構設計完成（order_types.py：Order / Fill / Position / Side / OrderType）
- [x] 風控規則設計完成（risk_rules.py：允許商品 / 單筆與持倉上限 / 回撤限制 / kill-switch）

## 產出
- 交易接口設計：`backend/app/trading/exchange_client.py`（原規劃檔名 `exchange_interface.py`，本實作以 `ExchangeClient` ABC 承載）
- 訂單結構定義：`backend/app/trading/order_types.py`
- 風控規則模組：`backend/app/trading/risk_rules.py`

## 備註
需支持多個交易所（如 OANDA、IG 等）。

## 執行紀錄（2026-08-28 稽核）
- 原任務書 5 項完成條件全為 `[☐]` 但 status=done，已據實作補打勾。
- 檔名差異：任務書指向 `exchange_interface.py`，實作以 `exchange_client.py`（`ExchangeClient` ABC）承載，功能對應，屬 Inconsistent（命名）。
- 認證與 API 研究僅實作於程式碼（Bearer + v20 REST），真實券商連線/憑證流程標記 `[NEEDS VERIFICATION]`。
- 多交易所擴充透過實作 `ExchangeClient` 抽象介面達成（相依注入 opener）。
