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
| TAIFEX Adapter 與歷史回溯模組 |
| D/E 組基本面、篩選與股利工具 |
| F/G 組期貨選擇權與基礎設施工具 |
| Chart 套件（ChartMeta 產生器） |
| 複合分析引擎（財報體檢 / 篩選） |
| 效能最佳化與預熱排程 |
| 測試策略與測試基建（fixtures / 契約測試 / live smoke） |
| 連續運行驗證與 v1.3 發布 |
| Lineage/SourceRole/DataGrade 通用化升級（v2.1 §4） |
| 六大正規化 Schema 與 Normalize 層（v2.1 §6） |
| 七來源 Source Role 分級落地（v2.1 §3） |
| 雙層快取 TTL 矩陣與環境變數參數化（v2.1 §5） |
| Per-Source Token Bucket 限流與可調參數（v2.1 §5.3） |
| pkg/domain 領域分層與模組邊界（v2.1 §7） |
| Materialized Screener Index 與批次效能（v2.1 §10） |
| 通用 ChartMeta 五型別升級（v2.1 §11） |
| 25 個 v2.1 Tool 目錄對齊（v1.3 為主、僅新增缺口，v2.1 §9） |
| v2.1 版契約測試與全量回歸（v2.1 §6 / §14） |
| 連續運行驗證與 v2.1 發布 |
| ETF（0050）與加權指數資料支援（A+B 合併） |
| P0 財報 AJAX 接線（季報三表修復 + PE/ROE + 健康評分連帶修復） |
| P1 股利 ex_date（TWT48U 併入 dividend history + 評估歷史查詢） |
| 補齊 MCP Symbol Registry 缺漏代碼 |
| Symbol Registry 自動同步機制 |
| ESG 揭露雙來源（TWSE OpenAPI 補完 + MOPS CSV）與速度選源機制 |
| ETF 分配收益查詢工具 (get_etf_dividend) |
| /health 健康檢查端點 |
| 工具 get_after_hours_trading（交易輔助與全市場清單） |
| 工具 get_annual_trading_volume（交易輔助與全市場清單） |
| 工具 get_block_trades_daily（交易輔助與全市場清單） |
| 工具 get_block_trades_detail（交易輔助與全市場清單） |
| 工具 get_block_trades_monthly（交易輔助與全市場清單） |
| 工具 get_block_trades_yearly（交易輔助與全市場清單） |
| 工具 get_broker_basic_info（券商資料） |
| 工具 get_broker_branch_info（券商資料） |
| 工具 get_broker_electronic_trading_statistics（券商資料） |
| 工具 get_broker_gender_statistics（券商資料） |
| 工具 get_broker_headquarters_info（券商資料） |
| 工具 get_broker_income_expenditure（券商資料） |
| 工具 get_broker_monthly_statements（券商資料） |
| 工具 get_broker_service_personnel（券商資料） |
| 工具 get_brokers_offering_regular_investment（券商資料） |
| 工具 get_central_depository_bond_redemption（行情歷史與指數） |
| 工具 get_companies_cumulative_voting（公司治理與內部人） |
| 工具 get_companies_ownership_changes_business_scope（公司治理與內部人） |
| 工具 get_companies_ownership_changes_business_scope_trading（公司治理與內部人） |
| 工具 get_companies_with_business_scope_changes（行情歷史與指數） |
| 工具 get_companies_with_independent_directors（公司治理與內部人） |
| 工具 get_companies_with_ownership_changes（公司治理與內部人） |
| 工具 get_companies_with_refineries_in_populated_areas（行情歷史與指數） |
| 工具 get_company_anticompetitive_litigation（ESG 揭露細項） |
| 工具 get_company_balance_sheet（財務與基本面） |
| 工具 get_company_board_info（公司治理與內部人） |
| 工具 get_company_board_insufficient_shares（公司治理與內部人） |
| 工具 get_company_board_insufficient_shares_consecutive（公司治理與內部人） |
| 工具 get_company_board_pledged_shares（公司治理與內部人） |
| 工具 get_company_board_shareholdings（公司治理與內部人） |
| 工具 get_company_ceo_dual_role（公司治理與內部人） |
| 工具 get_company_climate_management（ESG 揭露細項） |
| 工具 get_company_community_relations（ESG 揭露細項） |
| 工具 get_company_consolidated_director_compensation（公司治理與內部人） |
| 工具 get_company_consolidated_supervisor_compensation（公司治理與內部人） |
| 工具 get_company_daily_insider_trades_preannounced（公司治理與內部人） |
| 工具 get_company_daily_insider_trades_untransferred（公司治理與內部人） |
| 工具 get_company_director_compensation（公司治理與內部人） |
| 工具 get_company_dividend（財務與基本面） |
| 工具 get_company_energy_management（ESG 揭露細項） |
| 工具 get_company_eps_statistics（財務與基本面） |
| 工具 get_company_financial_reports_supervisor_acknowledgment（行情歷史與指數） |
| 工具 get_company_food_safety（ESG 揭露細項） |
| 工具 get_company_fuel_management（ESG 揭露細項） |
| 工具 get_company_governance_info（公司治理與內部人） |
| 工具 get_company_governance_regulations（公司治理與內部人） |
| 工具 get_company_greenhouse_gas_emissions（ESG 揭露細項） |
| 工具 get_company_human_development（ESG 揭露細項） |
| 工具 get_company_inclusive_finance（ESG 揭露細項） |
| 工具 get_company_income_statement（財務與基本面） |
| 工具 get_company_info_security（ESG 揭露細項） |
| 工具 get_company_information_disclosure_violations（監理與重大訊息） |
| 工具 get_company_investor_communications（ESG 揭露細項） |
| 工具 get_company_major_news（行情歷史與指數） |
| 工具 get_company_major_shareholders（公司治理與內部人） |
| 工具 get_company_ownership_and_control（公司治理與內部人） |
| 工具 get_company_product_lifecycle（ESG 揭露細項） |
| 工具 get_company_product_quality_safety（ESG 揭露細項） |
| 工具 get_company_profitability_analysis（財務與基本面） |
| 工具 get_company_profitability_analysis_summary（財務與基本面） |
| 工具 get_company_quarterly_audit_variance（監理與重大訊息） |
| 工具 get_company_quarterly_earnings_forecast_achievement（監理與重大訊息） |
| 工具 get_company_risk_management（ESG 揭露細項） |
| 工具 get_company_shareholder_meeting_announcements（公司治理與內部人） |
| 工具 get_company_shareholder_meeting_announcements_by_code（公司治理與內部人） |
| 工具 get_company_shareholder_meeting_dates（公司治理與內部人） |
| 工具 get_company_shareholder_proposal_exercise（公司治理與內部人） |
| 工具 get_company_supervisor_compensation（公司治理與內部人） |
| 工具 get_company_supply_chain_management（ESG 揭露細項） |
| 工具 get_company_waste_management（ESG 揭露細項） |
| 工具 get_company_water_management（ESG 揭露細項） |
| 工具 get_cross_market_trading_info（交易輔助與全市場清單） |
| 工具 get_daily_day_trading_targets（交易輔助與全市場清單） |
| 工具 get_daily_securities_lending_volume（交易輔助與全市場清單） |
| 工具 get_first_listed_foreign_stocks_daily（交易輔助與全市場清單） |
| 工具 get_fund_basic_info（財務與基本面） |
| 工具 get_margin_loan_restrictions_announcement（交易輔助與全市場清單） |
| 工具 get_margin_trading_info（行情歷史與指數） |
| 工具 get_market_disposal_stocks（監理與重大訊息） |
| 工具 get_market_gain_loss_statistics（交易輔助與全市場清單） |
| 工具 get_market_historical_index（行情歷史與指數） |
| 工具 get_market_holiday_schedule（行情歷史與指數） |
| 工具 get_market_index_info（行情歷史與指數） |
| 工具 get_market_institutional_amounts_history（行情歷史與指數） |
| 工具 get_market_turnover_history（交易輔助與全市場清單） |
| 工具 get_monthly_trading_statistics（交易輔助與全市場清單） |
| 工具 get_odd_lot_trading_quotes（交易輔助與全市場清單） |
| 工具 get_public_company_board_shareholdings（公司治理與內部人） |
| 工具 get_public_company_income_statement（財務與基本面） |
| 工具 get_real_time_trading_stats（行情歷史與指數） |
| 工具 get_securities_trading_changes（交易輔助與全市場清單） |
| 工具 get_short_sale_lending_balance_history（行情歷史與指數） |
| 工具 get_short_sale_lending_trades_history（行情歷史與指數） |
| 工具 get_stock_daily_trading（行情歷史與指數） |
| 工具 get_stock_monthly_average（行情歷史與指數） |
| 工具 get_stock_monthly_avg_history（行情歷史與指數） |
| 工具 get_stock_monthly_history（行情歷史與指數） |
| 工具 get_stock_monthly_trading（行情歷史與指數） |
| 工具 get_stock_price_changes（交易輔助與全市場清單） |
| 工具 get_stock_yearly_history（行情歷史與指數） |
| 工具 get_stock_yearly_trading（行情歷史與指數） |
| 工具 get_stocks_no_price_change_first_five_days（交易輔助與全市場清單） |
| 工具 get_suspended_day_trading_announcement（交易輔助與全市場清單） |
| 工具 get_suspended_day_trading_history（交易輔助與全市場清單） |
| 工具 get_suspended_trading_stocks（交易輔助與全市場清單） |
| 工具 get_taiex_index_history（行情歷史與指數） |
| 工具 get_taiwan_50_index_history（行情歷史與指數） |
| 工具 get_taiwan_island_index_history（行情歷史與指數） |
| 工具 get_taiwan_total_return_index（行情歷史與指數） |
| 工具 get_top_20_volume_stocks（交易輔助與全市場清單） |
| 工具 get_top_foreign_holdings（行情歷史與指數） |
| 工具 get_twse_news（行情歷史與指數） |
| 工具 get_warrant_basic_info（行情歷史與指數） |
| 工具 get_warrant_daily_trading（行情歷史與指數） |
| 工具 get_warrant_trader_count（行情歷史與指數） |
| 工具 get_warrant_yearly_issuance_statistics（行情歷史與指數） |

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
| [T59-companies_with_anticompetitive_losses](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T059-companies_with_anticompetitive_losses.md) | 新增工具 get_companies_with_anticompetitive_losses（ESG 揭露細項） | |
| [T61-companies_with_csr_reports_103](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T061-companies_with_csr_reports_103.md) | 新增工具 get_companies_with_csr_reports_103（ESG 揭露細項） | |
| [T62-companies_with_inclusive_finance_data](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T062-companies_with_inclusive_finance_data.md) | 新增工具 get_companies_with_inclusive_finance_data（ESG 揭露細項） | |
| [T106-company_sec_regulatory_penalties](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T106-company_sec_regulatory_penalties.md) | 新增工具 get_company_sec_regulatory_penalties（監理與重大訊息） | |
| [T117-daily_futures_market_report](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T117-daily_futures_market_report.md) | 新增工具 get_daily_futures_market_report（期貨與選擇權） | |
| [T118-daily_options_market_report](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T118-daily_options_market_report.md) | 新增工具 get_daily_options_market_report（期貨與選擇權） | |
| [T120-etf_regular_investment_ranking](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T120-etf_regular_investment_ranking.md) | 新增工具 get_etf_regular_investment_ranking（行情歷史與指數） | |
| [T121-financial_program_abnormal_recommendations](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T121-financial_program_abnormal_recommendations.md) | 新增工具 get_financial_program_abnormal_recommendations（監理與重大訊息） | |
| [T123-foreign_companies_applying_for_listing](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T123-foreign_companies_applying_for_listing.md) | 新增工具 get_foreign_companies_applying_for_listing（上市程序與名單） | |
| [T125-futures_daily_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T125-futures_daily_history.md) | 新增工具 get_futures_daily_history（期貨與選擇權） | |
| [T126-futures_institutional](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T126-futures_institutional.md) | 新增工具 get_futures_institutional（期貨與選擇權） | |
| [T127-index_futures_margin](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T127-index_futures_margin.md) | 新增工具 get_index_futures_margin（期貨與選擇權） | |
| [T128-institutional_fut_opt_split_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T128-institutional_fut_opt_split_history.md) | 新增工具 get_institutional_fut_opt_split_history（期貨與選擇權） | |
| [T129-institutional_general](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T129-institutional_general.md) | 新增工具 get_institutional_general（期貨與選擇權） | |
| [T130-institutional_total_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T130-institutional_total_history.md) | 新增工具 get_institutional_total_history（期貨與選擇權） | |
| [T131-institutional_traders_by_futures](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T131-institutional_traders_by_futures.md) | 新增工具 get_institutional_traders_by_futures（期貨與選擇權） | |
| [T132-institutional_traders_by_futures_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T132-institutional_traders_by_futures_history.md) | 新增工具 get_institutional_traders_by_futures_history（期貨與選擇權） | |
| [T133-institutional_traders_by_options](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T133-institutional_traders_by_options.md) | 新增工具 get_institutional_traders_by_options（期貨與選擇權） | |
| [T134-institutional_traders_calls_puts](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T134-institutional_traders_calls_puts.md) | 新增工具 get_institutional_traders_calls_puts（期貨與選擇權） | |
| [T135-large_traders_futures_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T135-large_traders_futures_history.md) | 新增工具 get_large_traders_futures_history（期貨與選擇權） | |
| [T136-large_traders_futures_oi](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T136-large_traders_futures_oi.md) | 新增工具 get_large_traders_futures_oi（期貨與選擇權） | |
| [T137-large_traders_options_oi](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T137-large_traders_options_oi.md) | 新增工具 get_large_traders_options_oi（期貨與選擇權） | |
| [T138-local_companies_applying_for_listing](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T138-local_companies_applying_for_listing.md) | 新增工具 get_local_companies_applying_for_listing（上市程序與名單） | |
| [T150-options_daily_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T150-options_daily_history.md) | 新增工具 get_options_daily_history（期貨與選擇權） | |
| [T151-options_delta](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T151-options_delta.md) | 新增工具 get_options_delta（期貨與選擇權） | |
| [T152-options_institutional_by_contract_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T152-options_institutional_by_contract_history.md) | 新增工具 get_options_institutional_by_contract_history（期貨與選擇權） | |
| [T153-options_institutional_calls_puts_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T153-options_institutional_calls_puts_history.md) | 新增工具 get_options_institutional_calls_puts_history（期貨與選擇權） | |
| [T154-options_oi_change](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T154-options_oi_change.md) | 新增工具 get_options_oi_change（期貨與選擇權） | |
| [T155-otc_daily](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T155-otc_daily.md) | 新增工具 get_otc_daily（上櫃市場） | |
| [T156-otc_index](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T156-otc_index.md) | 新增工具 get_otc_index（上櫃市場） | |
| [T157-otc_odd_lot](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T157-otc_odd_lot.md) | 新增工具 get_otc_odd_lot（上櫃市場） | |
| [T158-public_company_balance_sheet](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T158-public_company_balance_sheet.md) | 新增工具 get_public_company_balance_sheet（財務與基本面） | |
| [T162-recently_listed_companies](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T162-recently_listed_companies.md) | 新增工具 get_recently_listed_companies（上市程序與名單） | |
| [T167-stock_futures_margin](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T167-stock_futures_margin.md) | 新增工具 get_stock_futures_margin（期貨與選擇權） | |
| [T178-suspended_listed_companies](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T178-suspended_listed_companies.md) | 新增工具 get_suspended_listed_companies（上市程序與名單） | |

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
| [T13-taifex](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T013-taifex.md) | TAIFEX Adapter 與歷史回溯模組 | ✅ done |
| [T14-de-tools](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T014-de-tools.md) | D/E 組基本面、篩選與股利工具 | ✅ done |
| [T15-fg-tools](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T015-fg-tools.md) | F/G 組期貨選擇權與基礎設施工具 | ✅ done |
| [T16-chart](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T016-chart.md) | Chart 套件（ChartMeta 產生器） | ✅ done |
| [T17-composite](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T017-composite.md) | 複合分析引擎（財報體檢 / 篩選） | ✅ done |
| [T18-perf-prewarm](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T018-perf-prewarm.md) | 效能最佳化與預熱排程 | ✅ done |
| [T19-testing](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T019-testing.md) | 測試策略與測試基建（fixtures / 契約測試 / live smoke） | ✅ done |
| [T20-release](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T020-release.md) | 連續運行驗證與 v1.3 發布 | ✅ done |
| [T21-lineage-v21](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T021-lineage-v21.md) | Lineage/SourceRole/DataGrade 通用化升級（v2.1 §4） | ✅ done |
| [T22-domain-schema-v21](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T022-domain-schema-v21.md) | 六大正規化 Schema 與 Normalize 層（v2.1 §6） | ✅ done |
| [T23-source-role-v21](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T023-source-role-v21.md) | 七來源 Source Role 分級落地（v2.1 §3） | ✅ done |
| [T24-cache-ttl-v21](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T024-cache-ttl-v21.md) | 雙層快取 TTL 矩陣與環境變數參數化（v2.1 §5） | ✅ done |
| [T25-ratelimit-v21](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T025-ratelimit-v21.md) | Per-Source Token Bucket 限流與可調參數（v2.1 §5.3） | ✅ done |
| [T26-domain-layer-v21](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T026-domain-layer-v21.md) | pkg/domain 領域分層與模組邊界（v2.1 §7） | ✅ done |
| [T27-screener-index-v21](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T027-screener-index-v21.md) | Materialized Screener Index 與批次效能（v2.1 §10） | ✅ done |
| [T28-chart-v21](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T028-chart-v21.md) | 通用 ChartMeta 五型別升級（v2.1 §11） | ✅ done |
| [T29-tools-v21](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T029-tools-v21.md) | 25 個 v2.1 Tool 目錄對齊（v1.3 為主、僅新增缺口，v2.1 §9） | ✅ done |
| [T30-contract-v21](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T030-contract-v21.md) | v2.1 版契約測試與全量回歸（v2.1 §6 / §14） | ✅ done |
| [T31-release-v21](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T031-release-v21.md) | 連續運行驗證與 v2.1 發布 | ✅ done |
| [T32-etf-index-support](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T032-etf-index-support.md) | ETF（0050）與加權指數資料支援（A+B 合併） | ✅ done |
| [T33-financial-ajax-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T033-financial-ajax-fix.md) | P0 財報 AJAX 接線（季報三表修復 + PE/ROE + 健康評分連帶修復） | ✅ done |
| [T34-dividend-exdate](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T034-dividend-exdate.md) | P1 股利 ex_date（TWT48U 併入 dividend history + 評估歷史查詢） | ✅ done |
| [T35-mcp-symbol-registry](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T035-mcp-symbol-registry.md) | 補齊 MCP Symbol Registry 缺漏代碼 | ✅ done |
| [T36-symbol-registry-auto-sync](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T036-symbol-registry-auto-sync.md) | 建立 Symbol Registry 自動同步機制 | ✅ done |
| [T37-esg-dual-source](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T037-esg-dual-source.md) | ESG 揭露雙來源（TWSE OpenAPI 補完 + MOPS CSV）與速度選源機制 | ✅ done |
| [T38-etf-dividend-tool](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T038-etf-dividend-tool.md) | ETF 分配收益查詢工具 (get_etf_dividend) | ✅ done |
| [T39-health-endpoint](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T039-health-endpoint.md) | 實作 /health 健康檢查端點 | ✅ done |
| [T40-after_hours_trading](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T040-after_hours_trading.md) | 新增工具 get_after_hours_trading（交易輔助與全市場清單） | ✅ done |
| [T41-annual_trading_volume](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T041-annual_trading_volume.md) | 新增工具 get_annual_trading_volume（交易輔助與全市場清單） | ✅ done |
| [T42-block_trades_daily](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T042-block_trades_daily.md) | 新增工具 get_block_trades_daily（交易輔助與全市場清單） | ✅ done |
| [T43-block_trades_detail](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T043-block_trades_detail.md) | 新增工具 get_block_trades_detail（交易輔助與全市場清單） | ✅ done |
| [T44-block_trades_monthly](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T044-block_trades_monthly.md) | 新增工具 get_block_trades_monthly（交易輔助與全市場清單） | ✅ done |
| [T45-block_trades_yearly](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T045-block_trades_yearly.md) | 新增工具 get_block_trades_yearly（交易輔助與全市場清單） | ✅ done |
| [T46-broker_basic_info](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T046-broker_basic_info.md) | 新增工具 get_broker_basic_info（券商資料） | ✅ done |
| [T47-broker_branch_info](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T047-broker_branch_info.md) | 新增工具 get_broker_branch_info（券商資料） | ✅ done |
| [T48-broker_electronic_trading_statistics](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T048-broker_electronic_trading_statistics.md) | 新增工具 get_broker_electronic_trading_statistics（券商資料） | ✅ done |
| [T49-broker_gender_statistics](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T049-broker_gender_statistics.md) | 新增工具 get_broker_gender_statistics（券商資料） | ✅ done |
| [T50-broker_headquarters_info](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T050-broker_headquarters_info.md) | 新增工具 get_broker_headquarters_info（券商資料） | ✅ done |
| [T51-broker_income_expenditure](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T051-broker_income_expenditure.md) | 新增工具 get_broker_income_expenditure（券商資料） | ✅ done |
| [T52-broker_monthly_statements](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T052-broker_monthly_statements.md) | 新增工具 get_broker_monthly_statements（券商資料） | ✅ done |
| [T53-broker_service_personnel](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T053-broker_service_personnel.md) | 新增工具 get_broker_service_personnel（券商資料） | ✅ done |
| [T54-brokers_offering_regular_investment](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T054-brokers_offering_regular_investment.md) | 新增工具 get_brokers_offering_regular_investment（券商資料） | ✅ done |
| [T55-central_depository_bond_redemption](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T055-central_depository_bond_redemption.md) | 新增工具 get_central_depository_bond_redemption（行情歷史與指數） | ✅ done |
| [T56-companies_cumulative_voting](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T056-companies_cumulative_voting.md) | 新增工具 get_companies_cumulative_voting（公司治理與內部人） | ✅ done |
| [T57-companies_ownership_changes_business_scope](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T057-companies_ownership_changes_business_scope.md) | 新增工具 get_companies_ownership_changes_business_scope（公司治理與內部人） | ✅ done |
| [T58-companies_ownership_changes_business_scope_trading](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T058-companies_ownership_changes_business_scope_trading.md) | 新增工具 get_companies_ownership_changes_business_scope_trading（公司治理與內部人） | ✅ done |
| [T59-companies_with_anticompetitive_losses](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T059-companies_with_anticompetitive_losses.md) | 新增工具 get_companies_with_anticompetitive_losses（ESG 揭露細項） | 📋 pending |
| [T60-companies_with_business_scope_changes](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T060-companies_with_business_scope_changes.md) | 新增工具 get_companies_with_business_scope_changes（行情歷史與指數） | ✅ done |
| [T61-companies_with_csr_reports_103](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T061-companies_with_csr_reports_103.md) | 新增工具 get_companies_with_csr_reports_103（ESG 揭露細項） | 📋 pending |
| [T62-companies_with_inclusive_finance_data](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T062-companies_with_inclusive_finance_data.md) | 新增工具 get_companies_with_inclusive_finance_data（ESG 揭露細項） | 📋 pending |
| [T63-companies_with_independent_directors](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T063-companies_with_independent_directors.md) | 新增工具 get_companies_with_independent_directors（公司治理與內部人） | ✅ done |
| [T64-companies_with_ownership_changes](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T064-companies_with_ownership_changes.md) | 新增工具 get_companies_with_ownership_changes（公司治理與內部人） | ✅ done |
| [T65-companies_with_refineries_in_populated_areas](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T065-companies_with_refineries_in_populated_areas.md) | 新增工具 get_companies_with_refineries_in_populated_areas（行情歷史與指數） | ✅ done |
| [T66-company_anticompetitive_litigation](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T066-company_anticompetitive_litigation.md) | 新增工具 get_company_anticompetitive_litigation（ESG 揭露細項） | ✅ done |
| [T67-company_balance_sheet](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T067-company_balance_sheet.md) | 新增工具 get_company_balance_sheet（財務與基本面） | ✅ done |
| [T68-company_board_info](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T068-company_board_info.md) | 新增工具 get_company_board_info（公司治理與內部人） | ✅ done |
| [T69-company_board_insufficient_shares](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T069-company_board_insufficient_shares.md) | 新增工具 get_company_board_insufficient_shares（公司治理與內部人） | ✅ done |
| [T70-company_board_insufficient_shares_consecutive](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T070-company_board_insufficient_shares_consecutive.md) | 新增工具 get_company_board_insufficient_shares_consecutive（公司治理與內部人） | ✅ done |
| [T71-company_board_pledged_shares](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T071-company_board_pledged_shares.md) | 新增工具 get_company_board_pledged_shares（公司治理與內部人） | ✅ done |
| [T72-company_board_shareholdings](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T072-company_board_shareholdings.md) | 新增工具 get_company_board_shareholdings（公司治理與內部人） | ✅ done |
| [T73-company_ceo_dual_role](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T073-company_ceo_dual_role.md) | 新增工具 get_company_ceo_dual_role（公司治理與內部人） | ✅ done |
| [T74-company_climate_management](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T074-company_climate_management.md) | 新增工具 get_company_climate_management（ESG 揭露細項） | ✅ done |
| [T75-company_community_relations](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T075-company_community_relations.md) | 新增工具 get_company_community_relations（ESG 揭露細項） | ✅ done |
| [T76-company_consolidated_director_compensation](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T076-company_consolidated_director_compensation.md) | 新增工具 get_company_consolidated_director_compensation（公司治理與內部人） | ✅ done |
| [T77-company_consolidated_supervisor_compensation](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T077-company_consolidated_supervisor_compensation.md) | 新增工具 get_company_consolidated_supervisor_compensation（公司治理與內部人） | ✅ done |
| [T78-company_daily_insider_trades_preannounced](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T078-company_daily_insider_trades_preannounced.md) | 新增工具 get_company_daily_insider_trades_preannounced（公司治理與內部人） | ✅ done |
| [T79-company_daily_insider_trades_untransferred](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T079-company_daily_insider_trades_untransferred.md) | 新增工具 get_company_daily_insider_trades_untransferred（公司治理與內部人） | ✅ done |
| [T80-company_director_compensation](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T080-company_director_compensation.md) | 新增工具 get_company_director_compensation（公司治理與內部人） | ✅ done |
| [T81-company_dividend](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T081-company_dividend.md) | 新增工具 get_company_dividend（財務與基本面） | ✅ done |
| [T82-company_energy_management](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T082-company_energy_management.md) | 新增工具 get_company_energy_management（ESG 揭露細項） | ✅ done |
| [T83-company_eps_statistics](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T083-company_eps_statistics.md) | 新增工具 get_company_eps_statistics（財務與基本面） | ✅ done |
| [T84-company_financial_reports_supervisor_acknowledgment](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T084-company_financial_reports_supervisor_acknowledgment.md) | 新增工具 get_company_financial_reports_supervisor_acknowledgment（行情歷史與指數） | ✅ done |
| [T85-company_food_safety](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T085-company_food_safety.md) | 新增工具 get_company_food_safety（ESG 揭露細項） | ✅ done |
| [T86-company_fuel_management](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T086-company_fuel_management.md) | 新增工具 get_company_fuel_management（ESG 揭露細項） | ✅ done |
| [T87-company_governance_info](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T087-company_governance_info.md) | 新增工具 get_company_governance_info（公司治理與內部人） | ✅ done |
| [T88-company_governance_regulations](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T088-company_governance_regulations.md) | 新增工具 get_company_governance_regulations（公司治理與內部人） | ✅ done |
| [T89-company_greenhouse_gas_emissions](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T089-company_greenhouse_gas_emissions.md) | 新增工具 get_company_greenhouse_gas_emissions（ESG 揭露細項） | ✅ done |
| [T90-company_human_development](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T090-company_human_development.md) | 新增工具 get_company_human_development（ESG 揭露細項） | ✅ done |
| [T91-company_inclusive_finance](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T091-company_inclusive_finance.md) | 新增工具 get_company_inclusive_finance（ESG 揭露細項） | ✅ done |
| [T92-company_income_statement](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T092-company_income_statement.md) | 新增工具 get_company_income_statement（財務與基本面） | ✅ done |
| [T93-company_info_security](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T093-company_info_security.md) | 新增工具 get_company_info_security（ESG 揭露細項） | ✅ done |
| [T94-company_information_disclosure_violations](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T094-company_information_disclosure_violations.md) | 新增工具 get_company_information_disclosure_violations（監理與重大訊息） | ✅ done |
| [T95-company_investor_communications](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T095-company_investor_communications.md) | 新增工具 get_company_investor_communications（ESG 揭露細項） | ✅ done |
| [T96-company_major_news](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T096-company_major_news.md) | 新增工具 get_company_major_news（行情歷史與指數） | ✅ done |
| [T97-company_major_shareholders](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T097-company_major_shareholders.md) | 新增工具 get_company_major_shareholders（公司治理與內部人） | ✅ done |
| [T98-company_ownership_and_control](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T098-company_ownership_and_control.md) | 新增工具 get_company_ownership_and_control（公司治理與內部人） | ✅ done |
| [T99-company_product_lifecycle](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T099-company_product_lifecycle.md) | 新增工具 get_company_product_lifecycle（ESG 揭露細項） | ✅ done |
| [T100-company_product_quality_safety](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T100-company_product_quality_safety.md) | 新增工具 get_company_product_quality_safety（ESG 揭露細項） | ✅ done |
| [T101-company_profitability_analysis](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T101-company_profitability_analysis.md) | 新增工具 get_company_profitability_analysis（財務與基本面） | ✅ done |
| [T102-company_profitability_analysis_summary](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T102-company_profitability_analysis_summary.md) | 新增工具 get_company_profitability_analysis_summary（財務與基本面） | ✅ done |
| [T103-company_quarterly_audit_variance](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T103-company_quarterly_audit_variance.md) | 新增工具 get_company_quarterly_audit_variance（監理與重大訊息） | ✅ done |
| [T104-company_quarterly_earnings_forecast_achievement](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T104-company_quarterly_earnings_forecast_achievement.md) | 新增工具 get_company_quarterly_earnings_forecast_achievement（監理與重大訊息） | ✅ done |
| [T105-company_risk_management](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T105-company_risk_management.md) | 新增工具 get_company_risk_management（ESG 揭露細項） | ✅ done |
| [T106-company_sec_regulatory_penalties](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T106-company_sec_regulatory_penalties.md) | 新增工具 get_company_sec_regulatory_penalties（監理與重大訊息） | 📋 pending |
| [T107-company_shareholder_meeting_announcements](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T107-company_shareholder_meeting_announcements.md) | 新增工具 get_company_shareholder_meeting_announcements（公司治理與內部人） | ✅ done |
| [T108-company_shareholder_meeting_announcements_by_code](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T108-company_shareholder_meeting_announcements_by_code.md) | 新增工具 get_company_shareholder_meeting_announcements_by_code（公司治理與內部人） | ✅ done |
| [T109-company_shareholder_meeting_dates](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T109-company_shareholder_meeting_dates.md) | 新增工具 get_company_shareholder_meeting_dates（公司治理與內部人） | ✅ done |
| [T110-company_shareholder_proposal_exercise](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T110-company_shareholder_proposal_exercise.md) | 新增工具 get_company_shareholder_proposal_exercise（公司治理與內部人） | ✅ done |
| [T111-company_supervisor_compensation](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T111-company_supervisor_compensation.md) | 新增工具 get_company_supervisor_compensation（公司治理與內部人） | ✅ done |
| [T112-company_supply_chain_management](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T112-company_supply_chain_management.md) | 新增工具 get_company_supply_chain_management（ESG 揭露細項） | ✅ done |
| [T113-company_waste_management](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T113-company_waste_management.md) | 新增工具 get_company_waste_management（ESG 揭露細項） | ✅ done |
| [T114-company_water_management](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T114-company_water_management.md) | 新增工具 get_company_water_management（ESG 揭露細項） | ✅ done |
| [T115-cross_market_trading_info](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T115-cross_market_trading_info.md) | 新增工具 get_cross_market_trading_info（交易輔助與全市場清單） | ✅ done |
| [T116-daily_day_trading_targets](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T116-daily_day_trading_targets.md) | 新增工具 get_daily_day_trading_targets（交易輔助與全市場清單） | ✅ done |
| [T117-daily_futures_market_report](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T117-daily_futures_market_report.md) | 新增工具 get_daily_futures_market_report（期貨與選擇權） | 📋 pending |
| [T118-daily_options_market_report](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T118-daily_options_market_report.md) | 新增工具 get_daily_options_market_report（期貨與選擇權） | 📋 pending |
| [T119-daily_securities_lending_volume](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T119-daily_securities_lending_volume.md) | 新增工具 get_daily_securities_lending_volume（交易輔助與全市場清單） | ✅ done |
| [T120-etf_regular_investment_ranking](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T120-etf_regular_investment_ranking.md) | 新增工具 get_etf_regular_investment_ranking（行情歷史與指數） | 📋 pending |
| [T121-financial_program_abnormal_recommendations](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T121-financial_program_abnormal_recommendations.md) | 新增工具 get_financial_program_abnormal_recommendations（監理與重大訊息） | 📋 pending |
| [T122-first_listed_foreign_stocks_daily](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T122-first_listed_foreign_stocks_daily.md) | 新增工具 get_first_listed_foreign_stocks_daily（交易輔助與全市場清單） | ✅ done |
| [T123-foreign_companies_applying_for_listing](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T123-foreign_companies_applying_for_listing.md) | 新增工具 get_foreign_companies_applying_for_listing（上市程序與名單） | 📋 pending |
| [T124-fund_basic_info](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T124-fund_basic_info.md) | 新增工具 get_fund_basic_info（財務與基本面） | ✅ done |
| [T125-futures_daily_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T125-futures_daily_history.md) | 新增工具 get_futures_daily_history（期貨與選擇權） | 📋 pending |
| [T126-futures_institutional](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T126-futures_institutional.md) | 新增工具 get_futures_institutional（期貨與選擇權） | 📋 pending |
| [T127-index_futures_margin](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T127-index_futures_margin.md) | 新增工具 get_index_futures_margin（期貨與選擇權） | 📋 pending |
| [T128-institutional_fut_opt_split_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T128-institutional_fut_opt_split_history.md) | 新增工具 get_institutional_fut_opt_split_history（期貨與選擇權） | 📋 pending |
| [T129-institutional_general](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T129-institutional_general.md) | 新增工具 get_institutional_general（期貨與選擇權） | 📋 pending |
| [T130-institutional_total_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T130-institutional_total_history.md) | 新增工具 get_institutional_total_history（期貨與選擇權） | 📋 pending |
| [T131-institutional_traders_by_futures](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T131-institutional_traders_by_futures.md) | 新增工具 get_institutional_traders_by_futures（期貨與選擇權） | 📋 pending |
| [T132-institutional_traders_by_futures_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T132-institutional_traders_by_futures_history.md) | 新增工具 get_institutional_traders_by_futures_history（期貨與選擇權） | 📋 pending |
| [T133-institutional_traders_by_options](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T133-institutional_traders_by_options.md) | 新增工具 get_institutional_traders_by_options（期貨與選擇權） | 📋 pending |
| [T134-institutional_traders_calls_puts](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T134-institutional_traders_calls_puts.md) | 新增工具 get_institutional_traders_calls_puts（期貨與選擇權） | 📋 pending |
| [T135-large_traders_futures_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T135-large_traders_futures_history.md) | 新增工具 get_large_traders_futures_history（期貨與選擇權） | 📋 pending |
| [T136-large_traders_futures_oi](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T136-large_traders_futures_oi.md) | 新增工具 get_large_traders_futures_oi（期貨與選擇權） | 📋 pending |
| [T137-large_traders_options_oi](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T137-large_traders_options_oi.md) | 新增工具 get_large_traders_options_oi（期貨與選擇權） | 📋 pending |
| [T138-local_companies_applying_for_listing](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T138-local_companies_applying_for_listing.md) | 新增工具 get_local_companies_applying_for_listing（上市程序與名單） | 📋 pending |
| [T139-margin_loan_restrictions_announcement](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T139-margin_loan_restrictions_announcement.md) | 新增工具 get_margin_loan_restrictions_announcement（交易輔助與全市場清單） | ✅ done |
| [T140-margin_trading_info](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T140-margin_trading_info.md) | 新增工具 get_margin_trading_info（行情歷史與指數） | ✅ done |
| [T141-market_disposal_stocks](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T141-market_disposal_stocks.md) | 新增工具 get_market_disposal_stocks（監理與重大訊息） | ✅ done |
| [T142-market_gain_loss_statistics](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T142-market_gain_loss_statistics.md) | 新增工具 get_market_gain_loss_statistics（交易輔助與全市場清單） | ✅ done |
| [T143-market_historical_index](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T143-market_historical_index.md) | 新增工具 get_market_historical_index（行情歷史與指數） | ✅ done |
| [T144-market_holiday_schedule](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T144-market_holiday_schedule.md) | 新增工具 get_market_holiday_schedule（行情歷史與指數） | ✅ done |
| [T145-market_index_info](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T145-market_index_info.md) | 新增工具 get_market_index_info（行情歷史與指數） | ✅ done |
| [T146-market_institutional_amounts_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T146-market_institutional_amounts_history.md) | 新增工具 get_market_institutional_amounts_history（行情歷史與指數） | ✅ done |
| [T147-market_turnover_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T147-market_turnover_history.md) | 新增工具 get_market_turnover_history（交易輔助與全市場清單） | ✅ done |
| [T148-monthly_trading_statistics](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T148-monthly_trading_statistics.md) | 新增工具 get_monthly_trading_statistics（交易輔助與全市場清單） | ✅ done |
| [T149-odd_lot_trading_quotes](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T149-odd_lot_trading_quotes.md) | 新增工具 get_odd_lot_trading_quotes（交易輔助與全市場清單） | ✅ done |
| [T150-options_daily_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T150-options_daily_history.md) | 新增工具 get_options_daily_history（期貨與選擇權） | 📋 pending |
| [T151-options_delta](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T151-options_delta.md) | 新增工具 get_options_delta（期貨與選擇權） | 📋 pending |
| [T152-options_institutional_by_contract_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T152-options_institutional_by_contract_history.md) | 新增工具 get_options_institutional_by_contract_history（期貨與選擇權） | 📋 pending |
| [T153-options_institutional_calls_puts_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T153-options_institutional_calls_puts_history.md) | 新增工具 get_options_institutional_calls_puts_history（期貨與選擇權） | 📋 pending |
| [T154-options_oi_change](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T154-options_oi_change.md) | 新增工具 get_options_oi_change（期貨與選擇權） | 📋 pending |
| [T155-otc_daily](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T155-otc_daily.md) | 新增工具 get_otc_daily（上櫃市場） | 📋 pending |
| [T156-otc_index](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T156-otc_index.md) | 新增工具 get_otc_index（上櫃市場） | 📋 pending |
| [T157-otc_odd_lot](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T157-otc_odd_lot.md) | 新增工具 get_otc_odd_lot（上櫃市場） | 📋 pending |
| [T158-public_company_balance_sheet](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T158-public_company_balance_sheet.md) | 新增工具 get_public_company_balance_sheet（財務與基本面） | 📋 pending |
| [T159-public_company_board_shareholdings](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T159-public_company_board_shareholdings.md) | 新增工具 get_public_company_board_shareholdings（公司治理與內部人） | ✅ done |
| [T160-public_company_income_statement](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T160-public_company_income_statement.md) | 新增工具 get_public_company_income_statement（財務與基本面） | ✅ done |
| [T161-real_time_trading_stats](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T161-real_time_trading_stats.md) | 新增工具 get_real_time_trading_stats（行情歷史與指數） | ✅ done |
| [T162-recently_listed_companies](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T162-recently_listed_companies.md) | 新增工具 get_recently_listed_companies（上市程序與名單） | 📋 pending |
| [T163-securities_trading_changes](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T163-securities_trading_changes.md) | 新增工具 get_securities_trading_changes（交易輔助與全市場清單） | ✅ done |
| [T164-short_sale_lending_balance_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T164-short_sale_lending_balance_history.md) | 新增工具 get_short_sale_lending_balance_history（行情歷史與指數） | ✅ done |
| [T165-short_sale_lending_trades_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T165-short_sale_lending_trades_history.md) | 新增工具 get_short_sale_lending_trades_history（行情歷史與指數） | ✅ done |
| [T166-stock_daily_trading](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T166-stock_daily_trading.md) | 新增工具 get_stock_daily_trading（行情歷史與指數） | ✅ done |
| [T167-stock_futures_margin](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T167-stock_futures_margin.md) | 新增工具 get_stock_futures_margin（期貨與選擇權） | 📋 pending |
| [T168-stock_monthly_average](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T168-stock_monthly_average.md) | 新增工具 get_stock_monthly_average（行情歷史與指數） | ✅ done |
| [T169-stock_monthly_avg_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T169-stock_monthly_avg_history.md) | 新增工具 get_stock_monthly_avg_history（行情歷史與指數） | ✅ done |
| [T170-stock_monthly_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T170-stock_monthly_history.md) | 新增工具 get_stock_monthly_history（行情歷史與指數） | ✅ done |
| [T171-stock_monthly_trading](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T171-stock_monthly_trading.md) | 新增工具 get_stock_monthly_trading（行情歷史與指數） | ✅ done |
| [T172-stock_price_changes](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T172-stock_price_changes.md) | 新增工具 get_stock_price_changes（交易輔助與全市場清單） | ✅ done |
| [T173-stock_yearly_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T173-stock_yearly_history.md) | 新增工具 get_stock_yearly_history（行情歷史與指數） | ✅ done |
| [T174-stock_yearly_trading](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T174-stock_yearly_trading.md) | 新增工具 get_stock_yearly_trading（行情歷史與指數） | ✅ done |
| [T175-stocks_no_price_change_first_five_days](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T175-stocks_no_price_change_first_five_days.md) | 新增工具 get_stocks_no_price_change_first_five_days（交易輔助與全市場清單） | ✅ done |
| [T176-suspended_day_trading_announcement](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T176-suspended_day_trading_announcement.md) | 新增工具 get_suspended_day_trading_announcement（交易輔助與全市場清單） | ✅ done |
| [T177-suspended_day_trading_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T177-suspended_day_trading_history.md) | 新增工具 get_suspended_day_trading_history（交易輔助與全市場清單） | ✅ done |
| [T178-suspended_listed_companies](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T178-suspended_listed_companies.md) | 新增工具 get_suspended_listed_companies（上市程序與名單） | 📋 pending |
| [T179-suspended_trading_stocks](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T179-suspended_trading_stocks.md) | 新增工具 get_suspended_trading_stocks（交易輔助與全市場清單） | ✅ done |
| [T180-taiex_index_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T180-taiex_index_history.md) | 新增工具 get_taiex_index_history（行情歷史與指數） | ✅ done |
| [T181-taiwan_50_index_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T181-taiwan_50_index_history.md) | 新增工具 get_taiwan_50_index_history（行情歷史與指數） | ✅ done |
| [T182-taiwan_island_index_history](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T182-taiwan_island_index_history.md) | 新增工具 get_taiwan_island_index_history（行情歷史與指數） | ✅ done |
| [T183-taiwan_total_return_index](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T183-taiwan_total_return_index.md) | 新增工具 get_taiwan_total_return_index（行情歷史與指數） | ✅ done |
| [T184-top_20_volume_stocks](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T184-top_20_volume_stocks.md) | 新增工具 get_top_20_volume_stocks（交易輔助與全市場清單） | ✅ done |
| [T185-top_foreign_holdings](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T185-top_foreign_holdings.md) | 新增工具 get_top_foreign_holdings（行情歷史與指數） | ✅ done |
| [T186-twse_news](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T186-twse_news.md) | 新增工具 get_twse_news（行情歷史與指數） | ✅ done |
| [T187-warrant_basic_info](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T187-warrant_basic_info.md) | 新增工具 get_warrant_basic_info（行情歷史與指數） | ✅ done |
| [T188-warrant_daily_trading](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T188-warrant_daily_trading.md) | 新增工具 get_warrant_daily_trading（行情歷史與指數） | ✅ done |
| [T189-warrant_trader_count](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T189-warrant_trader_count.md) | 新增工具 get_warrant_trader_count（行情歷史與指數） | ✅ done |
| [T190-warrant_yearly_issuance_statistics](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T190-warrant_yearly_issuance_statistics.md) | 新增工具 get_warrant_yearly_issuance_statistics（行情歷史與指數） | ✅ done |

**✅ done: 155 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 35**

> 自動生成於 2026-08-25 16:06
