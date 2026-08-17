---
github_issue: N/A
title: Data Validation 與 Data Quality Gate（§8 + §62）
type: task
priority: P0
status: pending
depends_on: [T006]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T007 - Data Validation 與 Data Quality Gate（§8 + §62）

## 目標

實作 §8 資料品質規則檢查（normalization/validation.py）與 §8.1 grade gate、§62 Data Integrity Test，攔截壞資料在進入因子計算之前。Sprint 1 acceptance：無 critical validation error。

## 驗收標準

- [ ] Price 規則（§8）：`close > 0`、`high >= low`、`high >= close`、`low <= close` 全檢查
- [ ] EPS / Financial Statement 規則（§8）：EPS 合理性、資產負債表/損益表一致性、TFRS 版本差異處理
- [ ] 分級標註（§8.1 grade gate）：AVAILABLE → 可用於 ranking/backtest；PREVIEW → 僅研究輸出（如 get_stock_trend_composite）；NOT_YET_AVAILABLE → 因子剔除並重正規化（ETF §30）；freshness 不足 → 不入 index（法人 15:00 前、外資 T-1）
- [ ] `source_role = FALLBACK` 守門：僅限白名單用途（上櫃歷史 / Market Context），禁止進入個股 FV/Score/Ranking/Buy Zone（§8.1）
- [ ] §62 Data Integrity Test 實作：跨來源一致性（如 TAIEX 與成分股加總、VIX 與美股指數同向 sanity）
- [ ] Validation 結果（pass/fail + 原因）記錄於 lineage `freshness` / warnings，可被報表與 AI context 讀取
- [ ] critical violation 導致該標的該欄位於 entry 前排除，而非帶病計算

## 備註

- 「API failed → LLM guess」絕對禁止（§7 絕對禁止區塊）— validation 不允許任何非官方填補