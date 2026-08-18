---
github_issue: N/A
title: MacroContextProvider（Yahoo Finance，FALLBACK）
type: task
priority: P1
status: done
depends_on: [T001, T003]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T005 - MacroContextProvider（Yahoo Finance，FALLBACK）

## 目標

依 §6 / §7.1 備援來源清單 / §75 實作 `MacroContextProvider`：Yahoo Finance 抓 VIX / USD-TWD / 美股指數 / 10Y，標 `source_role = FALLBACK`，只服務 Market Context → Risk Context，不進個股 Fair Value / Score / Ranking / Buy Zone。

## 驗收標準

- [x] `get_market_context(date) -> list[MacroQuote]` 依 Protocol 實作（§6），MacroQuote 含 symbol / name / close / data_date / availability_date / source_role
- [x] Yahoo Finance 代號對映正確（§7.1）：VIX `^VIX`、USD/TWD `USDTWD=X`、NASDAQ `^IXIC`、SOX `^SOX`、S&P 500 `^GSPC`、10Y `^TNX`
- [x] 每日一次、日線級抓取（非高頻、非 tick），遵守第三方合理使用（§7.2 資料品質規則）
- [x] lineage：`source=YAHOO_FINANCE`、`source_role=FALLBACK`、data_date 記錄實際資料日期；與官方 market_date 不一致時註記（§75 規範）
- [x] §75 optional 分級行為：MacroContext 有資料 → 填用；仍缺 → 輸出 `unavailable`，不得由 LLM 或統計推測填補
- [x] 明確不得混入：個股 Fair Value / Score / Ranking / Buy Zone（白名單防護 + 對應 unit test）
- [x] 不取得 / 不儲存任何 API Key（yfinance 免費端點）
- [x] config 可切換啟用/停用（未設定則不部署，不影響 required 資料）
- [x] 資料進入 Risk Context 前通過 §62 Data Integrity sanity（如 VIX 與美股指數同向檢查）

## 備註

- 此任務同時是「兩個 issues」之一（另一為前端整合 §53.1，見 T019）——spec §7.1 / §75 已於 2026-08-18 更新
- 依賴 `yfinance` 套件；抓取失敗一定要 graceful degrade 回 unavailable，不可拋例外卡住 Daily Pipeline