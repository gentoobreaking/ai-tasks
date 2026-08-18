# tw-quant-pickup

## 已實作功能

| 功能 |
|------|
| （無） |

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
| [T1-project-scaffold](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T001-project-scaffold.md) | 專案 Scaffold（Python monorepo 骨架） | |
| [T2-database-schema](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T002-database-schema.md) | Database Schema 與 Migrations（PostgreSQL，§5 全表） | |
| [T3-providers-layer](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T003-providers-layer.md) | Providers Layer（McpProvider + tw-quant-mcp 連線 + Lineage 對映） | |
| [T4-historical-provider](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T004-historical-provider.md) | HistoricalPriceProvider（上櫃歷史價格回補） | |
| [T5-macro-context-provider](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T005-macro-context-provider.md) | MacroContextProvider（Yahoo Finance，FALLBACK） | |
| [T6-collectors](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T006-collectors.md) | Collectors（市場/基本面/股利/法人/月營收/Universe 收集） | |
| [T7-data-validation](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T007-data-validation.md) | Data Validation 與 Data Quality Gate（§8 + §62） | |
| [T8-pit-repository](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T008-pit-repository.md) | Point-in-Time Repository（§2.6 / §9 防 Look-Ahead） | |
| [T9-universe-filter](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T009-universe-filter.md) | Universe Filter（§10） | |
| [T10-factor-system](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T010-factor-system.md) | Factor System（§11 / §17–24 八類因子） | |
| [T11-valuation-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T011-valuation-engine.md) | Valuation Engine（EPS 三層 → PE/PB/Dividend/DCF → FV → Buy Zones） | |
| [T12-etf-model](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T012-etf-model.md) | ETF Model（獨立 ETF Engine：權重 / Status / ranking_validity / tie-breaker） | |
| [T12a-etf-data-adapter](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T012a-etf-data-adapter.md) | ETF Data Availability & Adapter Spec（TWSE/MOPS 官方資料盤點 + Data Adapter） | |
| [T13-composite-risk](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T013-composite-risk.md) | Composite Score 與 Risk Adjustment（§25–26） | |
| [T14-ranking](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T014-ranking.md) | Ranking（Stock Top 30 / ETF Top N / Stability / Entry/Exit） | |
| [T15-price-alerts](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T015-price-alerts.md) | Price Alerts（§36 → alert_log + 偵測） | |
| [T16-snapshot-lifecycle](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T016-snapshot-lifecycle.md) | Snapshot Lifecycle（§70 / §45 / §45.1：create → freeze → hash → archive） | |
| [T17-ai-analyst](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T017-ai-analyst.md) | AI Analyst（§41–44 / §73 / §74，唯讀 frozen snapshot） | |
| [T18-reports](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T018-reports.md) | Reports（§50–52：Markdown / HTML / CSV / JSON daily report） | |
| [T19-api-server](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T019-api-server.md) | API Server（§53 / §53.1 / §54：FastAPI + Envelope + 前端整合對齊） | |
| [T20-cli](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T020-cli.md) | CLI（§48） | |
| [T21-backtest-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T021-backtest-engine.md) | Backtest Engine（§37–40：Portfolio / Benchmark / Walk-Forward / PIT / OTC） | |
| [T22-scheduler-monitoring](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T022-scheduler-monitoring.md) | Scheduler 與 Monitoring / Health（§49 / §54–55） | |
| [T23-deployment-security](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T023-deployment-security.md) | Deployment（Docker Compose / Kubernetes / Security，§56–58） | |
| [T24-testing-regression](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T024-testing-regression.md) | Testing & Regression Suite（§59–61：unit / integration / regression / backtest） | |
| [T25-final-dod](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T025-final-dod.md) | Final Integration & Definition of Done（§78 / §83 / §85） | |

## Task 列表

| # | 名稱 | 狀態 |
|---|------|------|
| [T1-project-scaffold](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T001-project-scaffold.md) | 專案 Scaffold（Python monorepo 骨架） | 📋 pending |
| [T2-database-schema](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T002-database-schema.md) | Database Schema 與 Migrations（PostgreSQL，§5 全表） | 📋 pending |
| [T3-providers-layer](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T003-providers-layer.md) | Providers Layer（McpProvider + tw-quant-mcp 連線 + Lineage 對映） | 📋 pending |
| [T4-historical-provider](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T004-historical-provider.md) | HistoricalPriceProvider（上櫃歷史價格回補） | 📋 pending |
| [T5-macro-context-provider](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T005-macro-context-provider.md) | MacroContextProvider（Yahoo Finance，FALLBACK） | 📋 pending |
| [T6-collectors](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T006-collectors.md) | Collectors（市場/基本面/股利/法人/月營收/Universe 收集） | 📋 pending |
| [T7-data-validation](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T007-data-validation.md) | Data Validation 與 Data Quality Gate（§8 + §62） | 📋 pending |
| [T8-pit-repository](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T008-pit-repository.md) | Point-in-Time Repository（§2.6 / §9 防 Look-Ahead） | 📋 pending |
| [T9-universe-filter](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T009-universe-filter.md) | Universe Filter（§10） | 📋 pending |
| [T10-factor-system](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T010-factor-system.md) | Factor System（§11 / §17–24 八類因子） | 📋 pending |
| [T11-valuation-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T011-valuation-engine.md) | Valuation Engine（EPS 三層 → PE/PB/Dividend/DCF → FV → Buy Zones） | 📋 pending |
| [T12-etf-model](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T012-etf-model.md) | ETF Model（獨立 ETF Engine：權重 / Status / ranking_validity / tie-breaker） | 📋 pending |
| [T12a-etf-data-adapter](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T012a-etf-data-adapter.md) | ETF Data Availability & Adapter Spec（TWSE/MOPS 官方資料盤點 + Data Adapter） | 📋 pending |
| [T13-composite-risk](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T013-composite-risk.md) | Composite Score 與 Risk Adjustment（§25–26） | 📋 pending |
| [T14-ranking](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T014-ranking.md) | Ranking（Stock Top 30 / ETF Top N / Stability / Entry/Exit） | 📋 pending |
| [T15-price-alerts](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T015-price-alerts.md) | Price Alerts（§36 → alert_log + 偵測） | 📋 pending |
| [T16-snapshot-lifecycle](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T016-snapshot-lifecycle.md) | Snapshot Lifecycle（§70 / §45 / §45.1：create → freeze → hash → archive） | 📋 pending |
| [T17-ai-analyst](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T017-ai-analyst.md) | AI Analyst（§41–44 / §73 / §74，唯讀 frozen snapshot） | 📋 pending |
| [T18-reports](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T018-reports.md) | Reports（§50–52：Markdown / HTML / CSV / JSON daily report） | 📋 pending |
| [T19-api-server](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T019-api-server.md) | API Server（§53 / §53.1 / §54：FastAPI + Envelope + 前端整合對齊） | 📋 pending |
| [T20-cli](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T020-cli.md) | CLI（§48） | 📋 pending |
| [T21-backtest-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T021-backtest-engine.md) | Backtest Engine（§37–40：Portfolio / Benchmark / Walk-Forward / PIT / OTC） | 📋 pending |
| [T22-scheduler-monitoring](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T022-scheduler-monitoring.md) | Scheduler 與 Monitoring / Health（§49 / §54–55） | 📋 pending |
| [T23-deployment-security](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T023-deployment-security.md) | Deployment（Docker Compose / Kubernetes / Security，§56–58） | 📋 pending |
| [T24-testing-regression](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T024-testing-regression.md) | Testing & Regression Suite（§59–61：unit / integration / regression / backtest） | 📋 pending |
| [T25-final-dod](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T025-final-dod.md) | Final Integration & Definition of Done（§78 / §83 / §85） | 📋 pending |

**✅ done: 0 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 26**

> 自動生成於 2026-08-18 09:09
