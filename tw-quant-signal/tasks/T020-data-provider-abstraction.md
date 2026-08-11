---
github_issue: ""
title: "[Phase 4] DataProvider 抽象層設計 — 定義資料擷取統一介面"
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-02
updated: 2026-08-12
---

# T020 — DataProvider 抽象層設計

## 目標
建立統一的 `DataProvider` 抽象層，封裝所有市場合資衍生資料的取得方式，使上層模組（pipeline / features / backtest / scorecard） 不依賴具體的資料來源實現，為後續逐步將資料層遷移至 tw-quant-mcp 打下基礎。

**大前提**：tw-quant-signal 保留決策層（規則引擎 / 四燈號 / 回測框架 / 11大指標）。資料層（twse_client.py 的所有 fetch_* 函式）改透過抽象介面存取，最終交換實現時不需改動上層程式碼。

對應路線圖：`tw-stock-ai-signal-spec-v1.2.md §4 系統架構`（資料擷取層可替換設計）

## 驗收標準

### S1: DataProvider 基底介面
- [x] 建立 `src/tw_quant_signal/provider/` 目錄
- [x] 定義 `DataProvider` 抽象類別（含所有 fetch_* 方法的「簽名」）:

```python
class DataProvider(ABC):
    @abstractmethod
    def fetch_watch_stocks_prices(self) -> list[dict]: ...
    @abstractmethod
    def fetch_market_index(self) -> dict | None: ...
    @abstractmethod
    def fetch_institutional_flows(self, trade_date: str | None = None) -> list[dict]: ...
    @abstractmethod
    def fetch_valuations(self, stock_ids: list[str] = None) -> dict[str, dict]: ...
    @abstractmethod
    def fetch_margin_trading_detailed(self, trade_date: str = None) -> list[dict]: ...
    @abstractmethod
    def fetch_monthly_revenue_batch(self, stock_id: str, months: int = 36) -> list[dict]: ...
    @abstractmethod
    def fetch_quarterly_financials_batch(self, stock_id: str, max_quarters: int = 20) -> list[dict]: ...
    @abstractmethod
    def fetch_dividends(self, stock_id: str) -> list[dict]: ...
    @abstractmethod
    def fetch_historical_index(self, years: int = 5) -> list[dict]: ...
    @abstractmethod
    def fetch_historical_daily_prices(self, stock_id: str, start_date: str, end_date: str) -> list[dict]: ...
```

### S2: 現有實現封裝 — `TwseDirectProvider`
- [x] 將 `twse_client.py` 的 `fetch_*` 函式群封裝為 `TwseDirectProvider(DataProvider)`
- [x] `twse_client.py` 保留為 `TwseDirectProvider` 的內部實作，不暴露匯出層級函式
- [x] `WATCH_STOCKS` 常數從 `twse_client.py` 移至 `config.py`（provider/__init__.py re-export）

### S3: yfinance 封裝 — `YfinanceProvider`
- [x] 將 `twse_client.py` 中的 yfinance 相關函式（`fetch_yf_quarterly_financials_batch`、`fetch_yf_financials`、`_fetch_dividends_yf`）封裝為 `YfinanceProvider(DataProvider)`
- [x] `YfinanceProvider` 作為 `TwseDirectProvider` 的「補充提供者」，只在某些財務資料上使用

### S4: Provider 註冊與工廠
- [x] `provider/__init__.py` 實作 `create_data_provider(mode: str = "direct") -> DataProvider`
- [x] 支援模式：
  - `"direct"` — 現有 HTTP 直連（TwseDirectProvider + YfinanceProvider）
  - `"mcp"` — 呼叫 tw-quant-mcp（預留給 T021/T022）
- [x] 環境變數 `TW_QUANT_DATA_PROVIDER=direct|mcp` 切換

### S5: 上游模組遷移至 DataProvider
- [x] `ingestion.py:IngestionEngine` 改接收 `DataProvider` 實例取代直接 import `twse_client` 的函式
- [x] `features.py` 改從 DataProvider 取得估值資料（替代原 inline `fetch_valuations`）
- [x] `backtest.py` 改從 DataProvider 取得歷史資料
- [x] `backfill.py` 改從 DataProvider 取得回補資料

### S6: 向後相容
- [x] 設定 `TW_QUANT_DATA_PROVIDER=direct` 時行為與現有程式碼完全一致（diff 測試通過：HEAD 179 passed = 新版 179 passed）
- [x] 所有既有單元測試（T017 產出）在 `direct` 模式下仍通過（193 passed，含新增 14 個 provider 測試）

## 已交付檔案（計劃）

```
src/tw_quant_signal/provider/
├── __init__.py              ← 工廠函式 + 匯出
├── base.py                  ← DataProvider 抽象基底類別
├── twse_direct.py           ← TwseDirectProvider（現有 HTTP 直連實作）
├── yfinance_provider.py     ← YfinanceProvider（yfinance 財務資料補充）
└── mcp_provider.py          ← McpDataProvider（預留、僅骨架）
```

## 備註
- 這是「零行為變更」的純重構任務：只抽介面、不改行為
- T021/T022 在 T020 完成後才開始，因為定義了介面契約才能做 mcp 版本實現
- T016 的「valuation 重複呼叫消除」可以直接套用此法：provider 層快取全國估值一次，不用每個 stock 各抓一次