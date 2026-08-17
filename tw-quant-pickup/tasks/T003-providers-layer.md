---
github_issue: N/A
title: Providers Layer（McpProvider + tw-quant-mcp 連線 + Lineage 對映）
type: task
priority: P0
status: pending
depends_on: [T001]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T003 - Providers Layer（McpProvider + tw-quant-mcp 連線 + Lineage 對映）

## 目標

依 §6 實作 `providers/base.py`（Protocol）、`mcp_client.py`（JSON-RPC，stdio / streamable-http 雙傳輸）、`mcp_provider.py`（工具對映 + `_lineage` 標註）與 `mcp_normalize.py`（TwseEnvelope → dict）。這是 Sprint 0 的核心。`TwseBulkProvider` 只做「當日全市場價格」單一目的（效能）。

## 驗收標準

- [ ] `base.py` 定義 `MarketDataProvider` / `FundamentalDataProvider` / `HistoricalPriceProvider` / `MacroContextProvider` Protocol（§6，完整簽名）
- [ ] `McpProvider` 可連 tw-quant-mcp：`MCP_TRANSPORT=streamable-http` 用 `MCP_HTTP_ADDR=127.0.0.1:8787`；stdio 亦可（§6）
- [ ] 37 工具對映正常化（§7.1 對映表）：get_symbol_list / get_trading_calendar / get_stock_daily_quote / get_stock_daily_kline / get_financial_statements / get_monthly_revenue / get_valuation_ratios / get_dividend_history / get_exdividend_calendar / get_institutional_investors / get_foreign_shareholding_history / get_attention_disposition_stocks / get_twse_index / get_put_call_ratio 等
- [ ] 所有出口帶 Lineage 四欄（source / data_date / freshness / grade），source_role 依來源標 CANONICAL（§8.1）
- [ ] 不做請求加速 / 繞過 Rate Limit + Jitter（§7.1 注意事項）
- [ ] 錄製 fixtures：`tests/fixtures/mcp_response_*.json`（Sprint 0 acceptance，供測試不依賴外部服務）
- [ ] 5 個以上代表性工具（指數、個股、財報、營收、法人）integration test 以 fixture 通過

## 備註

- 容器內部署用 streamable-http，避免逐 call spawn process（§6 備註）
- tw-quant-mcp 工具傳回之 envelope 參照 tw-quant-signal 的 `mcp_normalize.py` 模式
- 此任務完成後 T004 / T005 可並行開工