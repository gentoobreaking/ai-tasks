# tw-quant-mcp

## 已實作功能

| 功能 |
|------|
| 專案初始化與目錄骨架 |
| 資料模型層（Envelope / Lineage / Symbol / Candle） |
| Resilient HTTP Client、Rate Limiter 與 Circuit Breaker |
| 三層快取引擎（L1 Ristretto / L2 SQLite / Single-flight） |
| Symbol Registry 與交易日曆 |
| MIS Worker、Watchlist、RingBuffer 與重採樣引擎 |
| 盤中衍生計算（VWAP / 爆量偵測 / 支撐壓力） |
| TWSE Adapter（OpenAPI + Web API 盤後） |
| TPEx Adapter（上櫃盤後） |
| MCP 基礎層與 A 組盤中工具 |
| B/C 組盤後行情、籌碼與風險工具 |
| MOPS Adapter（財報 / 月營收 / 重大訊息） |

## Skip 項目

| Task | 說明 |
|------|------|
| | |

## 開發中

| Task | 名稱 | 說明 |
|------|------|------|
| | | |

## 待實作

| Task | 名稱 | 說明 |
|------|------|------|
| [T13-taifex](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T013-taifex.md) | TAIFEX Adapter 與歷史回溯模組 | |
| [T14-de-tools](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T014-de-tools.md) | D/E 組基本面、篩選與股利工具 | |
| [T15-fg-tools](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T015-fg-tools.md) | F/G 組期貨選擇權與基礎設施工具 | |
| [T16-chart](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T016-chart.md) | Chart 套件（ChartMeta 產生器） | |
| [T17-composite](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T017-composite.md) | 複合分析引擎（財報體檢 / 篩選） | |
| [T18-perf-prewarm](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T018-perf-prewarm.md) | 效能最佳化與預熱排程 | |
| [T19-testing](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T019-testing.md) | 測試策略與測試基建（fixtures / 契約測試 / live smoke） | |
| [T20-release](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T020-release.md) | 連續運行驗證與 v1.3 發布 | |

## Task 列表

| # | 名稱 | 狀態 |
|---|------|------|
| [T1-scaffold](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T001-scaffold.md) | 專案初始化與目錄骨架 | ✅ done |
| [T2-model](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T002-model.md) | 資料模型層（Envelope / Lineage / Symbol / Candle） | ✅ done |
| [T3-provider-client](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T003-provider-client.md) | Resilient HTTP Client、Rate Limiter 與 Circuit Breaker | ✅ done |
| [T4-cache](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T004-cache.md) | 三層快取引擎（L1 Ristretto / L2 SQLite / Single-flight） | ✅ done |
| [T5-registry-calendar](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T005-registry-calendar.md) | Symbol Registry 與交易日曆 | ✅ done |
| [T6-mis-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T006-mis-engine.md) | MIS Worker、Watchlist、RingBuffer 與重採樣引擎 | ✅ done |
| [T7-intraday-compute](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T007-intraday-compute.md) | 盤中衍生計算（VWAP / 爆量偵測 / 支撐壓力） | ✅ done |
| [T8-twse-adapter](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T008-twse-adapter.md) | TWSE Adapter（OpenAPI + Web API 盤後） | ✅ done |
| [T9-tpex-adapter](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T009-tpex-adapter.md) | TPEx Adapter（上櫃盤後） | ✅ done |
| [T10-mcp-core-a](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T010-mcp-core-a.md) | MCP 基礎層與 A 組盤中工具 | ✅ done |
| [T11-bc-tools](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T011-bc-tools.md) | B/C 組盤後行情、籌碼與風險工具 | ✅ done |
| [T12-mops-adapter](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T012-mops-adapter.md) | MOPS Adapter（財報 / 月營收 / 重大訊息） | ✅ done |
| [T13-taifex](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T013-taifex.md) | TAIFEX Adapter 與歷史回溯模組 | 📋 pending |
| [T14-de-tools](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T014-de-tools.md) | D/E 組基本面、篩選與股利工具 | 📋 pending |
| [T15-fg-tools](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T015-fg-tools.md) | F/G 組期貨選擇權與基礎設施工具 | 📋 pending |
| [T16-chart](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T016-chart.md) | Chart 套件（ChartMeta 產生器） | 📋 pending |
| [T17-composite](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T017-composite.md) | 複合分析引擎（財報體檢 / 篩選） | 📋 pending |
| [T18-perf-prewarm](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T018-perf-prewarm.md) | 效能最佳化與預熱排程 | 📋 pending |
| [T19-testing](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T019-testing.md) | 測試策略與測試基建（fixtures / 契約測試 / live smoke） | 📋 pending |
| [T20-release](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T020-release.md) | 連續運行驗證與 v1.3 發布 | 📋 pending |

**✅ done: 12 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 8**

> 自動生成於 2026-08-01 14:06
