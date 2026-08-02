---
github_issue: ""
title: "[Phase 4] TWSE 盤後資料層遷移至 tw-quant-mcp"
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-02
updated: 2026-08-02
---

# T021 — TWSE 盤後資料層遷移至 tw-quant-mcp

## 目標
實作 `McpDataProvider(DataProvider)` 中對應 TWSE 盤後資料的部分（日 K、指數、三大法人、融資融券、估值），取代現有 `twse_client.py` 的 `fetch_*` 函式的 HTTP 直連，改為透過 stdio JSON-RPC 呼叫 `tw-quant-mcp` 的對應 Tool。

**變更範圍**：只換資料來源管線，計算/規則/報告邏輯完全不變。

前置需求：T020 (DataProvider 抽象層) 已完成並部署。

對應 MCP 規格：`tw-quant-mcp-spec-v2_1.md §9`

## 驗收標準

### S1: McpClient 基礎建設
- [ ] `src/tw_quant_signal/provider/mcp_client.py` — 輕量 MCP stdio client
- [ ] 支援啟動子行程（`subprocess.Popen`）連接 `tw-quant-mcp` 執行檔
- [ ] JSON-RPC 2.0 通訊層：`_call(method, params) → dict`
- [ ] 環境變數 `MCP_SERVER_PATH` 指定 mcp 執行檔路徑（預設 `tw-quant-mcp` 在 PATH 中）
- [ ] 連線健康檢查：`_ping()` 回傳 mcp server 版本號
- [ ] 連線失敗時自動重試 2 次（間隔 1s backoff）

### S2: McpDataProvider — TWSE 日常行情
- [ ] 實作 `McpDataProvider(DataProvider)` 中的 TWSE 對應方法：

| DataProvider 方法 | tw-quant-mcp Tool | 備註 |
|-------------------|-------------------|------|
| `fetch_watch_stocks_prices` | `get_stock_daily_quote`（逐檔或批量） | 批次取得收盤行情 |
| `fetch_market_index` | `get_stock_daily_quote` (symbol="^TWII") 或 `get_market_summary` | 加權指數收盤 |
| `fetch_institutional_flows` | `get_institutional_investors` | 三大法人買賣超 |
| `fetch_valuations` | `get_valuation_ratios` | PE/PB/殖利率 |
| `fetch_margin_trading` | `get_margin_trading` | 融資融券 |

### S3: 歷史資料補填
- [ ] `fetch_historical_daily_prices` → 對應 `get_stock_daily_kline`（支援日期範圍參數）
- [ ] `fetch_historical_index` → `get_stock_daily_kline` (symbol="^TWII")
- [ ] 確保 mcp 回傳的歷史資料格式與現有 `fetch_historical_daily_prices` 一致
- [ ] 不一致導致 DB 寫入錯誤時自動降級回 `TwseDirectProvider`

### S4: 格式轉換層
- [ ] 建立 `src/tw_quant_signal/provider/mcp_normalize.py` — 將 mcp 回傳的標準 Envelope 格式轉換為 Python 層預期的 dict 格式
- [ ] 驗證關鍵欄位映射：
  - mcp `{symbol, close, open, high, low, volume, timestamp}` → Python `{stock_id, close, open, high, low, volume, trade_date}`
  - mcp `{date, foreign_net_shares, investment_trust_net_shares, dealer_net_shares}` → Python `{trade_date, foreign_investors_net, sity_investors_net, dealer_net}`
  - mcp `{pe, pb, dividend_yield_pct}` → Python `{pe_ratio, pb_ratio, dividend_yield}`

### S5: 回退機制（本層級）
- [ ] mcp 呼叫超時（5s）或回傳錯誤時：自動降級至 `TwseDirectProvider` 的對應方法
- [ ] 降級記錄 warning log + 標註在 pipeline log 的 message 欄位中
- [ ] 不因 mcp 掛掉導致整條 pipeline 失敗

### S6: 端到端驗證
- [ ] 設定 `TW_QUANT_DATA_PROVIDER=mcp` + `MCP_SERVER_PATH=./bin/tw-quant-mcp`
- [ ] 運行一次完整 pipeline（至少含 index + stocks + institutional + indicators 階段）
- [ ] pipeline_log 中顯示資料來源為 mcp（透過 message 欄位）
- [ ] 比較兩種 provider 模式下 `data/signal.db` 的 daily_prices 表最近一筆記錄完全一致

## 已交付檔案（計劃）

```
src/tw_quant_signal/provider/
├── mcp_client.py              ← MCP stdio 客戶端（JSON-RPC 通訊）
├── mcp_provider.py            ← McpDataProvider 實現（TWSE 盤後 Tool 對應）
├── mcp_normalize.py           ← MCP Envelope → Python dict 轉換
```

## 不納入此任務的項目
- MOPS 相關資料（月營收、財報、股利）→ T022
- 回測使用 mcp → 回測有自己的歷史資料快取邏輯（T021 不異動回測）
- 盤中 1 分 K → tw-quant-signal 不使用盤中資料
- 期貨/選擇權 → tw-quant-signal 不分析期權

## 備註
- 此任務改要的 mcp 執行各 tool 的網路 I/O 成本至少比 twse_client 直連一次減少（mcp 自帶 L1/L2 cache）
- 但由於需要 over json-RPC+launch subprocess，單次調用的 lattency 可能略高於直接 httpx，整體管線時間應該仍因 cache 效果而下降
- 確保 `MCP_SERVER_PATH` env var 在 Docker 部署時也正確配置（mcp 執行權與 signal 同一 container 或 sidecar）