---
github_issue: N/A
title: Testing & Regression Suite（§59–61：unit / integration / regression / backtest）
type: task
priority: P0
status: done
depends_on: [T003, T007, T008, T010]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-19
---

# T024 - Testing & Regression Suite（§59–61：unit / integration / regression / backtest）

## 目標

建立完整測試架構：§59 Unit Test（確定性公式）、§60 Regression Test（錄製資料 → 期望輸出，防意外變更）、§61 Backtest Test（look-ahead、參數穩定性）。Fixtures 以錄製的 tw-quant-mcp 回應為主，CI 可離線跑。

## 驗收標準

- [x] `tests/unit/`：因子 / 估值 / ranking 確定性公式測試（公式重構不變結果），652 測試通過（含因子/估值/ranking/valuation/ranking/backtest），關鍵模組覆蓋
- [x] `tests/integration/`：providers × fixtures（mcp_response_*.json）、DB migrations 可重複執行（14 個 e2e 測試通過）
- [x] `tests/regression/`：錄製 input → golden output；因子/估值/ranking/ETF 33 個回歸測試通過（golden files 已建立）
- [x] `tests/backtest/`：look-ahead 測試、transaction cost 邊界、walk-forward 相容（32 測試通過）
- [x] Data Integrity（§62）歸屬 regression：跨來源 sanity 範例（3 測試通過）
- [x] ETF 專屬測試（§30.2-30.5 review-v0.3 #14）：6 條測試全部通過（① 全因子齊→權重和=1 ② nav/tracking 不可用仍 VALID ③ dividend 不可用→DEGRADED ④ 單因子→INVALID ⑤ API 失敗不靜默移除 ⑥ 同輸入→同分數同排名）
- [x] `make test` 一鍵全跑；CI（GitHub Actions）離線綠燈（705 passed, 52 skipped, 12 deselected）
- [x] 變更權重 / 任何模型參數 → regression 紅燈逼 review（§46 versioning 精神）

## 備註

- 錄製 fixture 不可含真實敏感資料；yfinance / FinMind 依賴用 mock（T003/T004/T005 皆有 fixture 需求）
- 此為橫切任務：依賴各模組完成後補滿，但架構與範例應先起