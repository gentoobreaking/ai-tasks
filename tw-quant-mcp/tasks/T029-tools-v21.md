---
github_issue: N/A
title: 25 個 v2.1 Tool 目錄對齊（v1.3 為主、僅新增缺口，v2.1 §9）
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-01
---

# T029 - v2.1 Tool 目錄對齊（v1.3 為主、僅新增缺口）

## 目標
以**既有 v1.3 36 工具為對外介面主體，完全不修改、不新增 alias**；僅將 v2.1 §9 之 25 工具逐一比對，找出 v1.3 真正未涵蓋之功能缺口，以 v1.3 命名風格新增。並為每個工具標註 Data Grade（v2.1 §4，T021）。

## 比對結論（25 個 v2.1 工具 → 36 個 v1.3 工具）

### A. 同名工具（12 個，無需任何動作）
| v2.1 工具 | 對應 v1.3 工具 |
|---|---|
| set_active_watchlist | set_active_watchlist |
| get_intraday_kline | get_intraday_kline |
| get_stock_daily_quote | get_stock_daily_quote |
| get_institutional_investors | get_institutional_investors |
| get_warrant_activity | get_warrant_activity（v2.1 標 NOT_YET_AVAILABLE，但 v1.3 已實作、維持可用） |
| get_valuation_ratios | get_valuation_ratios |
| get_put_call_ratio | get_put_call_ratio |
| get_large_trader_positions | get_large_trader_positions |
| get_financial_health_report | get_financial_health_check（功能相同，以 v1.3 名為主） |
| get_risk_flags | scan_daytrade_eligibility（當沖/處置/注意/停資停券，功能相同） |
| get_futures_ohlc_history | get_futures_history |
| get_institutional_derivatives_history | get_institutional_futures_history |

### B. 功能相同、名字不同（12 個，以 v1.3 名為主，不改名不 alias）
| v2.1 工具 | v1.3 既有工具（對外主名） | 備註 |
|---|---|---|
| get_foreign_holdings | get_foreign_shareholding_history | 查「目前持股」以 range=近期涵蓋 |
| get_foreign_industry_flow | get_foreign_industry_holdings | 產業別外資配置/流向 |
| get_foreign_flow_history | get_foreign_shareholding_history | 外資進出歷史 |
| get_material_announcements | get_major_announcements | 重大訊息 |
| get_abnormal_volume_stocks | get_abnormal_trading | 異常成交量 |
| screen_high_dividend_yield | screen_high_yield | 高殖利率排行 |
| get_ex_dividend_calendar | get_exdividend_calendar | 除權息行事曆 |
| get_dividend_stability | get_dividend_history | 配息歷史含穩定性分析 |
| screen_value_growth_stocks | screen_stocks | v1.3 criteria 已支援 value/growth |
| get_esg_risk_assessment | get_esg_report | ESG/公司治理 |
| get_institutional_derivatives_positions | get_institutional_futures_positions + get_institutional_options_positions | v1.3 拆兩工具 |
| get_foreign_industry_allocation | get_foreign_industry_holdings | 外資產業配置總覽 |

### C. 真正缺口（僅 1 個，需新增）
| v2.1 工具 | 說明 | 建議命名（v1.3 風格） | Grade |
|---|---|---|---|
| get_stock_trend_composite | 短中長期「技術面+基本面+籌碼面」綜合研判（horizon 參數） | `get_stock_trend_composite`（沿用，符合 v1.3 `get_` 前綴風格；或 `get_stock_trend_analysis`） | PREVIEW |

## 驗收標準
- [ ] 對照表 A/B 兩組共 24 個：**既有 36 工具零修改**（名稱、註冊、handler 皆不動），`go test ./...` 回歸通過證明無變更
- [ ] 新增 C 組 1 個工具 `get_stock_trend_composite`：輸入 `symbol, horizon(short/mid/long)`，輸出 TrendComposite（T022 §6 Schema）+ `_lineage`（多來源聚合 `[]Lineage`：TWSE Web API + MOPS）+ `_chart_meta`
- [ ] 新增工具依 v1.3 命名/Envelope 規範（snake_case、Envelope 包裝、單位歸一化），並通過契約測試
- [ ] 36 + 1 = 37 工具全部標註 Data Grade（在 tool description 或 meta 標註，T021）；v2.1 標 NOT_YET_AVAILABLE 之 get_warrant_activity 因 v1.3 已實作，標 AVAILABLE 並於 README 註記差異
- [ ] README 新增「v2.1 §9 ↔ v1.3 工具對照表」（A/B/C 三組），說明以 v1.3 為對外介面主體之決策

## 備註
- 命名決策（已與使用者確認 2026-08-01）：**以 v1.3 為主不動、不 alias**；v2.1 新增功能才以 v1.3 命名風格新增。A/B 組完全不需修改。
- get_stock_trend_composite 為跨來源聚合（TWSE Web API + MOPS），需 T022 TrendComposite Schema 與 T023 來源分級先行；`_lineage` 用 `[]Lineage` 陣列（v2.1 §4 設計規則 2）
- 此工具之技術指標可重用 pkg/engine/indicators.go（MA/RSI，T007 已實作）
