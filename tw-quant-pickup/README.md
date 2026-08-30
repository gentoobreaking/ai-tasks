# tw-quant-pickup

## 已實作功能

| 功能 |
|------|
| 專案 Scaffold（Python monorepo 骨架） |
| Database Schema 與 Migrations（PostgreSQL，§5 全表） |
| Providers Layer（McpProvider + tw-quant-mcp 連線 + Lineage 對映） |
| HistoricalPriceProvider（上櫃歷史價格回補） |
| MacroContextProvider（Yahoo Finance，FALLBACK） |
| Collectors（市場/基本面/股利/法人/月營收/Universe 收集） |
| Data Validation 與 Data Quality Gate（§8 + §62） |
| Point-in-Time Repository（§2.6 / §9 防 Look-Ahead） |
| Universe Filter（§10） |
| Factor System（§11 / §17–24 八類因子） |
| Valuation Engine（EPS 三層 → PE/PB/Dividend/DCF → FV → Buy Zones） |
| ETF Model（獨立 ETF Engine：權重 / Status / ranking_validity / tie-breaker） |
| ETF Data Availability & Adapter Spec（TWSE/MOPS 官方資料盤點 + Data Adapter） |
| Composite Score 與 Risk Adjustment（§25–26） |
| Ranking（Stock Top 30 / ETF Top N / Stability / Entry/Exit） |
| Price Alerts（§36 → alert_log + 偵測） |
| Snapshot Lifecycle（§70 / §45 / §45.1：create → freeze → hash → archive） |
| AI Analyst（§41–44 / §73 / §74，唯讀 frozen snapshot） |
| Reports（§50–52：Markdown / HTML / CSV / JSON daily report） |
| API Server（§53 / §53.1 / §54：FastAPI + Envelope + 前端整合對齊） |
| CLI（§48） |
| Backtest Engine（§37–40：Portfolio / Benchmark / Walk-Forward / PIT / OTC） |
| Scheduler 與 Monitoring / Health（§49 / §54–55） |
| Deployment（Docker Compose / Kubernetes / Security，§56–58） |
| Testing & Regression Suite（§59–61：unit / integration / regression / backtest） |
| Final Integration & Definition of Done（§78 / §83 / §85） |
| 串接台灣證交所 OpenAPI 取得財報、月營收、股利 |
| 整合 TEJ / 財金資料庫 作為備援財報來源 |
| 使用 camofox-browser 爬取 MOPS/公開資訊觀測站 補足財報缺口 |
| 修正預設日期為最近交易日（避免週末誤跑） |
| Pipeline Resume 支援（斷點續傳） |
| 引入台灣交易日曆（假日表＋盤後就緒時間） |
| 前端樣式架構正式化：補完 Tailwind 設定並遷移至 shadcn/ui |
| 前端主題切換（system/light/dark 深色模式） |
| 非營業日查詢自動回退至最近營業日（API / CLI / 前端） |
| 前端安全與一致性修復（XSS / 死登入邏輯 / fetch 統一） |
| 前端 UX 改善（日期、設定生效、類型區分、可點擊代號） |
| 前端 UI 中文化 |
| 前端測試基礎建設 |
| API 安全強化（認證 / 限流 / 指標端點） |
| 後端模組化重構（api routers + pipeline 套件） |
| 前端型別強化與個股詳情估值補全 |
| react-query 導入 |
| CI 前端 job 與 repo 衛生 |
| 個股 CMoney 四法合理價計算器 |
| ETF 兩法合理價計算器 |
| 合理價 Markdown 報表匯出 |

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
| | | |

## Task 列表

| # | 名稱 | 狀態 |
|---|------|------|
| [T1-project-scaffold](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T001-project-scaffold.md) | 專案 Scaffold（Python monorepo 骨架） | ✅ done |
| [T2-database-schema](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T002-database-schema.md) | Database Schema 與 Migrations（PostgreSQL，§5 全表） | ✅ done |
| [T3-providers-layer](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T003-providers-layer.md) | Providers Layer（McpProvider + tw-quant-mcp 連線 + Lineage 對映） | ✅ done |
| [T4-historical-provider](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T004-historical-provider.md) | HistoricalPriceProvider（上櫃歷史價格回補） | ✅ done |
| [T5-macro-context-provider](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T005-macro-context-provider.md) | MacroContextProvider（Yahoo Finance，FALLBACK） | ✅ done |
| [T6-collectors](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T006-collectors.md) | Collectors（市場/基本面/股利/法人/月營收/Universe 收集） | ✅ done |
| [T7-data-validation](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T007-data-validation.md) | Data Validation 與 Data Quality Gate（§8 + §62） | ✅ done |
| [T8-pit-repository](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T008-pit-repository.md) | Point-in-Time Repository（§2.6 / §9 防 Look-Ahead） | ✅ done |
| [T9-universe-filter](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T009-universe-filter.md) | Universe Filter（§10） | ✅ done |
| [T10-factor-system](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T010-factor-system.md) | Factor System（§11 / §17–24 八類因子） | ✅ done |
| [T11-valuation-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T011-valuation-engine.md) | Valuation Engine（EPS 三層 → PE/PB/Dividend/DCF → FV → Buy Zones） | ✅ done |
| [T12-etf-model](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T012-etf-model.md) | ETF Model（獨立 ETF Engine：權重 / Status / ranking_validity / tie-breaker） | ✅ done |
| [T12a-etf-data-adapter](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T012a-etf-data-adapter.md) | ETF Data Availability & Adapter Spec（TWSE/MOPS 官方資料盤點 + Data Adapter） | ✅ done |
| [T13-composite-risk](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T013-composite-risk.md) | Composite Score 與 Risk Adjustment（§25–26） | ✅ done |
| [T14-ranking](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T014-ranking.md) | Ranking（Stock Top 30 / ETF Top N / Stability / Entry/Exit） | ✅ done |
| [T15-price-alerts](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T015-price-alerts.md) | Price Alerts（§36 → alert_log + 偵測） | ✅ done |
| [T16-snapshot-lifecycle](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T016-snapshot-lifecycle.md) | Snapshot Lifecycle（§70 / §45 / §45.1：create → freeze → hash → archive） | ✅ done |
| [T17-ai-analyst](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T017-ai-analyst.md) | AI Analyst（§41–44 / §73 / §74，唯讀 frozen snapshot） | ✅ done |
| [T18-reports](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T018-reports.md) | Reports（§50–52：Markdown / HTML / CSV / JSON daily report） | ✅ done |
| [T19-api-server](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T019-api-server.md) | API Server（§53 / §53.1 / §54：FastAPI + Envelope + 前端整合對齊） | ✅ done |
| [T20-cli](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T020-cli.md) | CLI（§48） | ✅ done |
| [T21-backtest-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T021-backtest-engine.md) | Backtest Engine（§37–40：Portfolio / Benchmark / Walk-Forward / PIT / OTC） | ✅ done |
| [T22-scheduler-monitoring](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T022-scheduler-monitoring.md) | Scheduler 與 Monitoring / Health（§49 / §54–55） | ✅ done |
| [T23-deployment-security](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T023-deployment-security.md) | Deployment（Docker Compose / Kubernetes / Security，§56–58） | ✅ done |
| [T24-testing-regression](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T024-testing-regression.md) | Testing & Regression Suite（§59–61：unit / integration / regression / backtest） | ✅ done |
| [T25-final-dod](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T025-final-dod.md) | Final Integration & Definition of Done（§78 / §83 / §85） | ✅ done |
| [T26-twse-openapi-financials](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T026-twse-openapi-financials.md) | 串接台灣證交所 OpenAPI 取得財報、月營收、股利 | ✅ done |
| [T27-tej-fingold-provider](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T027-tej-fingold-provider.md) | 整合 TEJ / 財金資料庫 作為備援財報來源 | ✅ done |
| [T28-camofox-browser-scraper](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T028-camofox-browser-scraper.md) | 使用 camofox-browser 爬取 MOPS/公開資訊觀測站 補足財報缺口 | ✅ done |
| [T29-fix-trading-day-default](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T029-fix-trading-day-default.md) | 修正預設日期為最近交易日（避免週末誤跑） | ✅ done |
| [T30-pipeline-resume-support](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T030-pipeline-resume-support.md) | Pipeline Resume 支援（斷點續傳） | ✅ done |
| [T31-taiwan-trading-calendar](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T031-taiwan-trading-calendar.md) | 引入台灣交易日曆（假日表＋盤後就緒時間） | ✅ done |
| [T32-tailwind-shadcn-migration](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T032-tailwind-shadcn-migration.md) | 前端樣式架構正式化：補完 Tailwind 設定並遷移至 shadcn/ui | ✅ done |
| [T33-theme-switching](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T033-theme-switching.md) | 前端主題切換（system/light/dark 深色模式） | ✅ done |
| [T34-non-business-day-fallback](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T034-non-business-day-fallback.md) | 非營業日查詢自動回退至最近營業日（API / CLI / 前端） | ✅ done |
| [T35-frontend-security-consistency](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T035-frontend-security-consistency.md) | 前端安全與一致性修復（XSS / 死登入邏輯 / fetch 統一） | ✅ done |
| [T36-frontend-ux-improvements](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T036-frontend-ux-improvements.md) | 前端 UX 改善（日期、設定生效、類型區分、可點擊代號） | ✅ done |
| [T37-frontend-i18n](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T037-frontend-i18n.md) | 前端 UI 中文化 | ✅ done |
| [T38-frontend-test-infra](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T038-frontend-test-infra.md) | 前端測試基礎建設 | ✅ done |
| [T39-api-security](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T039-api-security.md) | API 安全強化（認證 / 限流 / 指標端點） | ✅ done |
| [T40-backend-modularization](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T040-backend-modularization.md) | 後端模組化重構（api routers + pipeline 套件） | ✅ done |
| [T41-frontend-types-and-stock-valuation](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T041-frontend-types-and-stock-valuation.md) | 前端型別強化與個股詳情估值補全 | ✅ done |
| [T42-react-query-adoption](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T042-react-query-adoption.md) | react-query 導入 | ✅ done |
| [T43-ci-and-repo-hygiene](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T043-ci-and-repo-hygiene.md) | CI 前端 job 與 repo 衛生 | ✅ done |
| [T44-stock-fair-value-cmoney4](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T044-stock-fair-value-cmoney4.md) | 個股 CMoney 四法合理價計算器 | ✅ done |
| [T45-etf-fair-value](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T045-etf-fair-value.md) | ETF 兩法合理價計算器 | ✅ done |
| [T46-fair-value-md-report](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T046-fair-value-md-report.md) | 合理價 Markdown 報表匯出 | ✅ done |

**✅ done: 47 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 0**

> 自動生成於 2026-08-30 20:03
