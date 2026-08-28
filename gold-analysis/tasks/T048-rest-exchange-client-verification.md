---
id: T048
project: gold-analysis
source_project: gold-analysis-advanced
title: RestExchangeClient 實盤冒煙測試
assignee: "pi with opencode/x-preview-f-free"
priority: low
type: verification
status: pending
created: 2026-08-28
updated: 2026-08-28
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
- 若無實盤測試帳號，本任務標記為 blocked，改以 contract test（錄製/回放 HTTP）替代
- `RestExchangeClient` 已實作於 `backend/app/trading/exchange_client.py`，可直接注入真實 `httpx.AsyncClient`