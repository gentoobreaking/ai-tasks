---
github_issue: N/A
title: Testing & Regression Suite（§59–61：unit / integration / regression / backtest）
type: task
priority: P0
status: pending
depends_on: [T003, T007, T008, T010]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T024 - Testing & Regression Suite（§59–61：unit / integration / regression / backtest）

## 目標

建立完整測試架構：§59 Unit Test（確定性公式）、§60 Regression Test（錄製資料 → 期望輸出，防意外變更）、§61 Backtest Test（look-ahead、參數穩定性）。Fixtures 以錄製的 tw-quant-mcp 回應為主，CI 可離線跑。

## 驗收標準

- [ ] `tests/unit/`：因子 / 估值 / ranking 確定性公式測試（公式重構不變結果），≥60% 單元覆蓋關鍵模組
- [ ] `tests/integration/`：providers × fixtures（mcp_response_*.json）、DB migrations 可重複執行
- [ ] `tests/regression/`：錄製 input → golden output；因子或權重任何變更必須更新 golden + review（§60）
- [ ] `tests/backtest/`：look-ahead 測試、transaction cost 邊界、walk-forward 相容（§61）
- [ ] Data Integrity（§62）歸屬 regression：跨來源 sanity 範例
- [ ] ETF 專屬測試（§30.2-30.5 review-v0.3 #14）：① 全因子齊→權重和=1 ② nav/tracking NOT_YET_AVAILABLE→仍 VALID ③ dividend DATA_UNAVAILABLE→DEGRADED 且不靜默剔除 ④ 只剩 1 因子→INVALID 不產 Top N ⑤ API 來源失敗不得靜默移除因子 ⑥ 同輸入→同分數同排名
- [ ] `make test` 一鍵全跑；CI（GitHub Actions 或其他）離線綠燈
- [ ] 變更權重 / 任何模型參數 → regression 紅燈逼 review（§46 versioning 精神）

## 備註

- 錄製 fixture 不可含真實敏感資料；yfinance / FinMind 依賴用 mock（T003/T004/T005 皆有 fixture 需求）
- 此為橫切任務：依賴各模組完成後補滿，但架構與範例應先起