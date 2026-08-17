---
github_issue: N/A
title: Backtest Engine（§37–40：Portfolio / Benchmark / Walk-Forward / PIT / OTC）
type: task
priority: P1
status: pending
depends_on: [T004, T008, T014]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T021 - Backtest Engine（§37–40：Portfolio / Benchmark / Walk-Forward / PIT / OTC）

## 目標

實作 `backtest/`（engine / portfolio / metrics / benchmark）：§37 Backtesting Engine（用 PIT 介面防 look-ahead）、§38 Backtest Portfolio（含交易成本與滑價）、§39 Benchmark（TAIEX）、§40 Walk-Forward Validation。上櫃歷史依 §37.1 可用性矩陣（T004 提供回補）。Sprint 5 acceptance：no look-ahead（reported_at 驗證）、Availability Matrix 真實反映。

## 驗收標準

- [ ] Backtest 讀資料一律走 PIT repository（T008）——reported_at / availability_date 守門（§37 / §84 #18）
- [ ] Portfolio（§38）：選股策略（Top 30 輪動）+ 交易成本 + slippage 參數 config 可調
- [ ] Benchmark（§39）：TAIEX 對照
- [ ] Walk-Forward Validation（§40）：rolling train/test，無前視
- [ ] 上櫃回測使用 HistoricalProvider 回補資料，標 FALLBACK；矩陣 §37.1 回補覆蓋 ≥5Y 反映於可用性報告
- [ ] Metrics：return / sharpe / max drawdown / turnover（§39 或 §38 定義）與手算對照
- [ ] Look-ahead bias 測試：與 T008 共用測試（人造未來資料不得影響）通過（§78 DoD、§61）
- [ ] 回測結果帶 snapshot_id，可重現（§45）
- [ ] `/api/v1/backtest/{strategy}` 供 T019 接上（§53）

## 備註

- 回測不依賴 API / AI（§77.0 不存在反向依賴，可後期接入）
- OTC 回補「回補後不可再改變」直接保護回測重現性（§37.1）