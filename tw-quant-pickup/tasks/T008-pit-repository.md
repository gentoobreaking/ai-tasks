---
github_issue: N/A
title: Point-in-Time Repository（§2.6 / §9 防 Look-Ahead）
type: task
priority: P0
status: done
depends_on: [T002, T004, T006]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T008 - Point-in-Time Repository（§2.6 / §9 防 Look-Ahead）

## 目標

實作 repository 層（§4 `db/repository.py`）作為資料存取唯一入口，提供 PIT 介面（reported_at / availability_date / observed_at 守門），保證任何歷史計算不會用到未來資料。Sprint 0 acceptance：PIT repository 通過 look-ahead 單元測試。

## 驗收標準

- [x] repository 為唯一存取入口：factor / valuation / backtest 不得直接 SQL 讀表（§77.0 依賴圖）
- [x] PIT 查詢語意：`as_of(date)` 回傳該日已發布資料——financials 依 `reported_at` + `revision`（取可見最新版），營收/股利依官方公布日，法人依 `observed_at`，外資依 T-1 `availability_date`（§2.6 / §37.1）
- [x] 上櫃回補資料可用時間點 = 當日 T 盤後，回補後不可再改變（§37.1 / §45）
- [x] look-ahead 單元測試：造 `reported_at` 在計算日之後的財報，計算結果不得使用它（§9）
- [x] 歷史 PE/PB 由引擎自算時（close ÷ TTM EPS），reported_at 守門（§84 #6）
- [x] 每筆查詢可帶出 lineage（source / data_date / freshness / grade / source_role），供因子 warnings 記錄缺源清單（§8.1）

## 備註

- 此層是「可重現」與「可驗證」（§83）的根基，測試密度要高
- 與 T021 backtest 共用此介面；T009–T023 全部依賴本任務

## 完成記錄（2026-08-18）

- `db/repository.py`（~450 行）：`PitRepository` + `PITRow(data, lineage)`，
  10 個查詢方法（get_symbols / get_daily_prices / get_financials /
  get_ttm_eps / get_monthly_revenues / get_dividends /
  get_institutional_flow / get_market_context / get_historical_pe）。
- PIT 語意：financials 依 reported_at + revision；monthly_revenues 依
  官方公布日 reported_at；dividends 依 data_date；institutional_flow 依
  availability_date（T 日 15:00 後 / 外資 T-1）；daily_prices 依
  trade_date；歷史 PE = close ÷ TTM EPS（reported_at 守門，缺源回 None
  不猜測）。
- lineage 帶出：每筆 PITRow 含 source / source_role / data_date /
  freshness / grade / fetched_at（§8.1）；FALLBACK 標註保留供 Risk
  Context。
- 附帶修復：
  - `db/migrate.py` transaction 未 commit bug（隱式 transaction 使
    migration 看似 applied 實則 rollback）→ 明確 conn.commit()。
  - `mcp_normalize.lineage_columns` source_role 標準化大寫（live
    envelope 小寫 canonical，DB CHECK 只接受大寫）。
  - `test_migrate_postgres.py` 3 個既有 bug（6 checks 硬編 5、FK
    查詢型別、roundtrip 非冪等）。
- 測試：unit 13 + integration 7（live fixture → normalize → 寫入 → PIT
  守門端到端），全套件 242 passed, 7 skipped，ruff clean。
- commit：`5f800c1`（T008 實作）。