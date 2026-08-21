---
github_issue: ""
title: 整合 TEJ / 財金資料庫 作為備援財報來源
type: feature
priority: medium
status: pending
depends_on: ["T026-twse-openapi-financials.md"]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-21
updated: 2026-08-21
---

# T027 - 整合 TEJ / 財金資料庫 作為備援財報來源

## 目標
整合 TEJ (Taiwan Economic Journal) 或 財金資料庫 作為第二優先級財報/月營收/股利資料來源。
適用情境：OpenAPI 欄位不足、歷史深度不夠、或需更完整的基本面指標（ROE、ROA、現金流等衍生指標）。

## 驗收標準
- [ ] 新增 `providers/tej_provider.py` 或 `providers/fingold_provider.py`
- [ ] 實作連線管理（帳號密碼、API Key、VPN/專線連線）
- [ ] 實作 `get_financial_statements(symbol, period)` - 完整財報三表 + 衍生指標
- [ ] 實作 `get_monthly_revenue(symbol, years)` - 月營收（含更長歷史）
- [ ] 實作 `get_dividend_history(symbol)` - 股利政策、配息穩定性指標
- [ ] 實作 `get_company_profile(symbol)` - 公司基本資料、產業別、財報發布日程
- [ ] 實作 `get_financial_ratios(symbol)` - 關鍵財務比率（ROE、ROA、負債比、流動比率等）
- [ ] 整合到 provider fallback chain：FinMind → TWSE OpenAPI → TEJ/財金
- [ ] 單元測試（mock DB/API 回應）
- [ ] 整合測試：驗證資料品質優於 OpenAPI（更完整、更早可用）
- [ ] 文件：連線設定、權限需求、成本估算

## 備註
- TEJ：學術/機構授權、資料最完整、歷史最久（30年+）、成本高（年費制）
- 財金資料庫：金管會主導、銀行/金控常用、成本相對較低
- 需評估：授權成本、部署架構（VPN/專線）、資料同步頻率（T+1 或 T+2）
- 資料正規化：對齊現有 schema，補足 OpenAPI 缺漏欄位
- 優先級：OpenAPI 失敗或資料不足時才 fallback

## 風險
- 授權成本高，需預算核准
- 部署環境需 VPN/專線，增加運維複雜度
- 資料格式差異大，正規化工作量大
- 非即時資料（T+1 發布），不適合盤中即時需求