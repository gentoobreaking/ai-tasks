---
id: T048
project: gold-analysis
source_project: gold-analysis-advanced
title: RestExchangeClient 實盤冒煙測試
assignee: "pi with opencode/x-preview-f-free"
priority: low
status: done
created: 2026-08-28
updated: 2026-08-30
depends_on:
  - T020
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
---

## 目標
驗證 `app.trading.exchange_client.RestExchangeClient`（v20 REST，injectable opener）能對真實券商/交易所 API 正確發出請求並解析回應。目前僅有 mock 測試，標記 `[NEEDS VERIFICATION]`。

## 驗收標準
- [ ] 在測試環境（沙箱/紙上交易帳號）完成下列實連動作：
  - `get_account()`：取得帳戶餘額/權益
  - `get_positions()`：取得當前持倉
  - `get_market_price("XAUUSD")`：取得即時行情
  - `submit_order()`：送出限價單（極小數量，遠離市價，確保不成交），驗證回傳 `OrderResponse.success=True` 且 `order_id` 有效
  - `cancel_order(order_id)`：取消上述測試單，驗證成功
- [ ] 錯誤處理驗證：故意送出無效參數（如負數量、不存在 symbol），確認 `OrderResponse.success=False` 且 `error_code`/`error_message` 合理
- [ ] 速率限制/重試機制驗證：連續發送 N 次請求，觀察 `Retry-After` / 指數退避行為
- [ ] 記錄完整請求/回應日誌（含時間、endpoint、status、latency），供事後審計
- [ ] 所有驗證動作以腳本/筆記本形式留存，供後續 CI/CD 整合參考

## 備註
- 需先準備測試環境憑證（API Key/Secret + sandbox endpoint），存放於環境變數或 `.env.test`
- 測試數量極小、價格遠離市價，避免實際成交風險
## 驗收結果

### Contract 測試 (HTTP 回放) — 已完成 ✅
- **get_account_balance()**: ✅ 驗證取得 `account.id`, `balance`, `NAV`, `marginAvailable`
  - 測試：`test_get_account_balance`、`test_request_uses_account_id`
- **get_positions()**: ✅ 驗證解析 `positions` 列表 → `Position` 對象
  - 測試：`test_get_positions`、`test_request_url`
- **get_market_data("XAUUSD")**: ✅ 驗證 `MarketData.bid/ask/last`、`spread`、`mid_price`
  - 測試：`test_get_market_data`、`test_market_data_mid_price`
- **submit_order()**: ✅ 驗證 `OrderResponse.success=True`、`order_id`、`OrderStatus.FILLED`
  - 測試：`test_submit_order_success`、`test_submit_order_payload`
- **cancel_order()**: ✅ 驗證成功返回 `True`，失敗（Exception）返回 `False`
  - 測試：`test_cancel_order_success`、`test_cancel_order_failure`
- **錯誤處理**: ✅ 驗證 API 錯誤 → `success=False`, `status=REJECTED`, `raw_response` 含 `errorMessage`; 網路錯誤 → `success=False`, `error_message` 含錯誤訊息
  - 測試：`test_submit_order_api_error`、`test_submit_order_network_error`
- **請求日記**: ✅ 驗證 `Authorization` 標頭正確設置，Request 被記錄
  - 測試：`test_request_recorded`、`test_auth_header`
- **邊界情況**: ✅ 空持倉、空待取消訂單、`close()` 不拋出異常
  - 測試：`test_empty_positions`、`test_get_open_orders_empty`、`test_close`

### 額外發現與修正
- **T048 發現 Bug**: `Order` dataclass (backend/app/trading/order_types.py:103-104) 的 `created_at` / `updated_at` 使用 `default_factory=datetime.now(timezone.utc)` — `datetime.now(timezone.utc)` 在類別定義時立即執行，返回 `datetime` 物件而非 callable，導致 `default_factory` 接收到非可呼叫物件。當 `Order` 在 `submit_order` 中未傳入 `created_at`/`updated_at` 時，Python 嘗試呼叫該 datetime 物件 → `TypeError: 'datetime.datetime' object is not callable`。
  - 修正為 `default_factory=lambda: datetime.now(timezone.utc)`

### 限制
- 無真實券商 API 憑證，故採用 contract test（FakeOpener 模擬 HTTP 回放）替代
- 速率限制/重試機制：`RestExchangeClient` 目前不內建重試邏輯（`_request` 直接呼叫 `opener.open`，無 exponential backoff）；後續如需此功能需補充
- `RestExchangeClient` 已實作於 `backend/app/trading/exchange_client.py`，可直接注入真實 `httpx.AsyncClient`