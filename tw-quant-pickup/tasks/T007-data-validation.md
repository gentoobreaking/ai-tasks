---
github_issue: N/A
title: Data Validation 與 Data Quality Gate（§8 + §62）
type: task
priority: P0
status: done
depends_on: [T006]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T007 - Data Validation 與 Data Quality Gate（§8 + §62）

## 目標

實作 §8 資料品質規則檢查（normalization/validation.py）與 §8.1 grade gate、§62 Data Integrity Test，攔截壞資料在進入因子計算之前。Sprint 1 acceptance：無 critical validation error。

## 驗收標準

- [x] Price 規則（§8）：`close > 0`、`high >= low`、`high >= close`、`low <= close` 全檢查（含 volume >= 0）
- [x] EPS / Financial Statement 規則（§8）：EPS 合理性（數值、缺漏即 ERROR 不猜測）、資產負債表/損益表一致性（equity ≈ assets - liabilities，容差 0.1%）、TFRS 版本差異處理（白名單標記 WARNING）
- [x] 分級標註（§8.1 grade gate）：AVAILABLE → 可用於 ranking/backtest；PREVIEW → 僅研究輸出；NOT_YET_AVAILABLE → 因子剔除並重正規化（ETF §30）；freshness 不足 → 不入 index（法人 15:00 前、外資 T-1）
- [x] `source_role = FALLBACK` 守門：僅限白名單用途（上櫃歷史 / Market Context），禁止進入個股 FV/Score/Ranking/Buy Zone（§8.1）
- [x] §62 Data Integrity Test 實作：昨收/今開跳空（Detect→Flag→Investigate 不刪除）、跨來源一致性（TAIEX 與成分股、VIX 與美股指數同向 sanity）、缺交易日偵測
- [x] Validation 結果（pass/fail + 原因）記錄於 lineage `freshness` / warnings，可被報表與 AI context 讀取（ValidationIssue.as_dict / IntegrityFlag.as_dict）
- [x] critical violation 導致該標的該欄位於 entry 前排除，而非帶病計算（ERROR → grade NOT_YET_AVAILABLE → 剔除）

## 備註

- 「API failed → LLM guess」絕對禁止（§7 絕對禁止區塊）— validation 不允許任何非官方填補

## 完成記錄（2026-08-18）

- **normalization/validation.py**（spec §8 + §8.1）：
  - Price 規則：close>0、high≥low/high≥close/low≤close、volume≥0（支援小寫/大寫/首字母大寫欄位）
  - EPS：數值檢查；缺漏即 ERROR（不填補）
  - 財報一致性：equity ≈ assets - liabilities（相對容差 0.1%）
  - 歷史 EPS 變更偵測（>0.5% → ERROR）
  - TFRS 版本白名單（IFRS/TW_IFRS/GAAP），未知版本 WARNING
  - gate_grade：AVAILABLE→ranking/backtest；PREVIEW→僅研究；NOT_YET_AVAILABLE→剔除重正規化；freshness 門檻
  - check_fallback_use：FALLBACK 白名單（historical_backfill / market_context）vs 禁止用途
  - validate_overnight_gap：§62 跳空（>30% WARNING，不刪除）
  - validate_cross_source_consistency：跨來源比對（容差可調）
- **normalization/integrity.py**（spec §62）：IntegrityReport/Flag + check_overnight_gap / check_missing_trading_days / check_cross_source / check_macro_sanity（VIX 同向偵測）
- **測試**：67 unit（test_validation.py 51 + test_integrity.py 16）+ 16 integration（live fixture 串接）= 83 個 T007 測試；全套件 **215 passed, 7 skipped**，ruff clean
- commit：927b7bb（實作）、e9aff20（README）