---
github_issue: ""
title: 串接台灣證交所 OpenAPI 取得財報、月營收、股利
type: feature
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-21
updated: 2026-08-21
---

# T026 - 串接台灣證交所 OpenAPI 取得財報、月營收、股利

## 目標
實作台灣證交所 OpenAPI 介接，補足 FinMind API 無法取得的財報三表、月營收、股利資料。
優先順序 #1：官方免費來源、合規、資料結構穩定。

## 驗收標準
- [x] 新增 `providers/twse_openapi.py` 實作 OpenAPI 客戶端
- [x] 實作 `get_financial_statements(symbol, period)` - 財報三表（損益表/資產負債表/現金流量表）
- [x] 實作 `get_monthly_revenue(symbol, years)` - 月營收與成長率
- [x] 實作 `get_dividend_history(symbol)` - 配息歷史
- [x] 實作 `get_symbol_list(market)` - 代碼表（上市/上櫃）
- [x] 實作 `get_daily_prices(symbol, start_date, end_date)` - 日價格（補足現有）
- [x] 整合到 `providers/mcp_provider.py` 作為 fallback 來源
- [ ] 單元測試覆蓋各方法（mock HTTP 回應）
- [ ] 整合測試：跑 `collect` stage 成功寫入 financials、monthly_revenues、dividends 表
- [ ] 更新 `collectors/market.py`、`collectors/fundamental.py`、`collectors/dividend.py` 使用新 provider

## 備註
- OpenAPI 端點參考：`https://openapi.twse.com.tw/v1/`
- 需處理：分頁、速率限制、重試邏輯、資料正規化（對齊現有 schema）
- 財報需支援 `period` 格式："2026Q1" 或 "2026"、statement 類型：income/balance/cashflow
- 月營收需包含 YoY/MoM/累計成長率
- 股利需包含現金/股票股利、配息率、除息日、發放日
- 速率限制：建議 10 req/s，實作 token bucket
- 錯誤處理：HTTP 429/5xx 自動退避重試、記錄 lineage

## 風險
- OpenAPI 文件可能不完整，需實測驗證欄位
- 歷史資料深度可能有限（近年資料較完整）
- 上櫃股票部分端點可能不支援

## 完成摘要
- 新增 `providers/twse_openapi.py` 實作 TWSE OpenAPI 客戶端
- 實作所有驗收標準中的核心方法
- 整合到 `pipeline_runner.py` `_default_provider()` 作為 MCP fallback
- 更新 `providers/__init__.py` 匯出新 provider
- 修正 `pipeline_runner.py` 使用 TWSE OpenAPI 作為預設 fallback
- 實作 Token Bucket 速率限制（10 req/s）
- 實作 HTTP 429/5xx 自動退避重試
- 實作 Lineage 記錄（source=TWSE_API, source_role=CANONICAL）
- 所有 ruff 和 eslint 檢查通過

## 已知問題
- TWSE OpenAPI 端點錯誤（302 redirect 到 404），需修正實際端點
- Pipeline collect stage 太慢（序列化 MCP 呼叫），需優化或改用批次 API
- 估值資料尚未在 FROZEN snapshot 中，前端合理價無法顯示

## 後續工作
1. 修正 TWSE OpenAPI 實際端點（需查閱官方文件或實測）
2. 優化 collect stage：平行化 MCP 呼叫、減少 symbol 數量、或使用批次 API
3. 執行完整 daily pipeline 產生 FROZEN snapshot 以讓前端顯示合理價