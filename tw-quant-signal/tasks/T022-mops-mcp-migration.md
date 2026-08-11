---
github_issue: ""
title: "[Phase 4] MOPS/基本面資料層遷移至 tw-quant-mcp"
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-02
updated: 2026-08-12
---

# T022 — MOPS/基本面資料層遷移至 tw-quant-mcp

## 目標
在 T021 已完成「TWSE 盤後資料遷移」的基礎上，再將 MOPS 相關（月營收、財報三表、股利）及 yfinance 補充（季度財報）的資料擷取也遷移至 `tw-quant-mcp`。

此任務完成後，tw-quant-signal 的所有原始資料層都經過 `DataProvider` 抽象層，且預設路徑可全量走 mcp。

前置需求：T020 + T021 已完成並通過驗證。

## 驗收標準

### S1: McpDataProvider — MOPS 資料
- [x] 實作以下 DataProvider 方法的 mcp 對應：

| DataProvider 方法 | tw-quant-mcp Tool | 備註 |
|-------------------|-------------------|------|
| `fetch_monthly_revenue_batch` | `get_monthly_revenue` | 取得月營收與成長率 |
| `fetch_dividends` | `get_dividend_history` | 現金/股票股利 + 連續配息年數 |
| `fetch_quarterly_financials_batch` | `get_financial_statements` 或 `get_financial_health_check` | 季度財報數據 |

### S2: 格式轉換 — MOPS 正規化
- [x] mcp 回傳的 `get_monthly_revenue` 格式：
  ```json
  [{ "year_month": "2026-06", "revenue": 1234567890, "yoy_change": 15.2, "mom_change": 3.1 }]
  ```
  轉換為 Python 預期格式：
  ```python
  { "stock_id": "2330", "year_month": "2026-06", "revenue": 1234567890, "yoy_change": 15.2, "mom_change": 3.1 }
  ```
- [x] mcp 回傳的 `get_dividend_history` 格式轉換為 Python 的 dividends 表結構
- [x] mcp 回傳的 `get_financial_statements` 格式轉換為 Python 的 `quarterly_financials` 表結構

### S3: YfinanceProvider 保留狀態評估
- [x] 交叉比對 mcp（MOPS）與 yfinance 的季度財報資料一致性
- [x] 若 mcp 資料覆蓋度足以完全取代 yfinance，則將 `YfinanceProvider` 標記為 deprecated（結論：不足以取代，保留）
- [x] 若仍有缺口（例如某些財報指標 MOPS 有但 mcp 無），保留 `YfinanceProvider` 作為 fallback
- [x] 記錄結論在 `KNOWN_ISSUES.md`

### S4: McpClient 擴充 — MOPS 限流相容
- [x] 確認 tw-quant-mcp 的 MOPS 限流設定（RATE_LIMIT_MOPS_EVERY）與 signal 現有的限流策略相容
- [x] mcp MOPS 請求的 1 次 cache hit 現狀為< 3)
- [x] 避免同時透過 mcp 和直接 MOPS 請求造成雙倍流量

### S5: Pipeline 驗證
- [x] `TW_QUANT_DATA_PROVIDER=mcp` 設定下完整跑一次 pipeline
- [x] 確認 `monthly_revenue` / `quarterly_financials` / `dividends` 三表資料正常寫入

## 已交付檔案（計劃）

```
src/tw_quant_signal/provider/
├── mcp_provider.py            ← 擴充 MOPS 對應方法
├── mcp_normalize.py           ← 擴充 MOPS/dividend/financial 格式轉換
```

## 備註
- tw-quant-mcp 的 `get_monthly_revenue` 目前資料源即為 MOPS（正規化 Schema），與現有 `fetch_monthly_revenue_batch` 完全相同
- 遷移後不再需要 `bs4`（BeautifulSoup）解析 MOPS HTML — 可以考慮移除依賴
- yfinance 原先用來補 MOPS 不提供的 ROE/ROA 數據；mcp 的 `get_financial_health_check` 有提供此類信息，可評估替代性