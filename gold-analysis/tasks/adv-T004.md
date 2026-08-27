---

id: adv-T004
project: gold-analysis
source_project: gold-analysis-advanced
title: 實盤交易對接
assignee: pi with opencode/x-preview-f-free
type: feature
priority: low
status: done
created: 2026-04-07
updated: 2026-08-28
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
depends_on: [adv-T003]
---


## 目標
實現與交易所的實盤交易對接，支持自動化交易執行。

## 驗收標準
- [x] 交易所 API 集成完成（ExchangeClient 介面 + SimulatedExchangeClient + RestExchangeClient 通用 v20 REST）
- [x] 訂單執行功能完成（OrderExecutor：Decision → Order → 送出 → 回傳 Fill）
- [x] 持倉同步功能完成（PositionSync：本地帳簿與交易所對齊，偵測並修復差異）
- [x] 風控執行功能完成（RiskRules：允許商品 / 單筆與持倉上限 / kill-switch / 回撤限制，下單前強制檢查）
- [x] 交易日誌記錄完成（TradeLogger：JSONL 追加式記錄 fill / reject / mismatch）
- [x] 模擬交易測試完成（SimulatedExchangeClient 端對端：決策→下單→成交→持倉→同步，含拒單與 HOLD 不動作）

## 產出
- 交易所 API 客戶端：`backend/app/trading/exchange_client.py`
- 訂單執行模組：`backend/app/trading/order_executor.py`
- 持倉同步模組：`backend/app/trading/position_sync.py`
- 風控規則：`backend/app/trading/risk_rules.py`
- 訂單結構：`backend/app/trading/order_types.py`
- 交易日誌：`backend/app/trading/trade_logger.py`

## 備註
這是 gold-analysis-advanced 專案的最後一個任務。需先在模擬環境測試。

## 執行紀錄（2026-08-28 稽核）
- 已達成 6 項並打勾；證據：實作 `backend/app/trading/*`；測試 `tests/test_trading.py`（5 項，含模擬端對端、拒單、HOLD 不動作、持倉差異、REST 請求建構）。
- 接線審計發現：交易執行鏈（`OrderExecutor` / `PositionSync` / `RiskRules` / `TradeLogger` / `ExchangeClient`）目前**無生產環境 caller**（無交易端點/排程觸發），僅有單元與模擬測試，屬跨任務整合缺口，已回流為 T005。
- 未竟事項：生產環境下單觸發路徑未接線（見 T005）；實盤 REST 未實連券商。
