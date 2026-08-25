---
github_issue: N/A
title: common/finmind.py — FinMind REST client 與 rate_limit 新通道
type: feat
priority: high
status: done
depends_on:
- T004-pipeline-skeleton
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-25
---

# T005 - FinMind REST 備援通道

## 目標
`common/finmind.py`：FinMind v4 API 直呼 client，作為 TWSE/yfinance 的備援資料源。
走 REST（requests），**不經 MCP**。token 讀 config_pipeline.json 的 `finmind_token`
（缺省 None＝guest 模式）。

## 驗收標準
- [x] interface：`fetch_dataset(dataset: str, data_id: str|None, start_date, end_date) -> list[dict]`
- [x] `common/rate_limit.py` 新增 `"finmind"` 通道（delay 0.7s + jitter），呼叫前必等待
- [x] 支援資料集至少：TaiwanStockPrice、TaiwanStockInstitutionalInvestorsBuySell、
      TaiwanStockMonthRevenue、TaiwanStockFinancialStatements、TaiwanStockShareholding、
      TaiwanStockCashFlowsStatement
- [x] 備援包裝函式 `with_fallback(primary_fn, fallback_fn)`：primary 拋例外或回空值時
      才呼叫 fallback，並以 logger.info 標註「FinMind 備援啟用」
- [x] 401/429/timeout 分別有明確 warning 訊息；429 時 sleep 60s 後重試一次
- [x] 單元測試：mock requests，驗證 200/401/429/timeout 四路徑行為

## 備註
guest 額度約 300 req/hr、免費會員 600 req/hr。實測 guest 可查 TaiwanStockPrice
（2330 回真實 OHLCV）。token 放 config 不進 git。
