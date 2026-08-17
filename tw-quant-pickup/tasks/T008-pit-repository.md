---
github_issue: N/A
title: Point-in-Time Repository（§2.6 / §9 防 Look-Ahead）
type: task
priority: P0
status: pending
depends_on: [T002, T004, T006]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T008 - Point-in-Time Repository（§2.6 / §9 防 Look-Ahead）

## 目標

實作 repository 層（§4 `db/repository.py`）作為資料存取唯一入口，提供 PIT 介面（reported_at / availability_date / observed_at 守門），保證任何歷史計算不會用到未來資料。Sprint 0 acceptance：PIT repository 通過 look-ahead 單元測試。

## 驗收標準

- [ ] repository 為唯一存取入口：factor / valuation / backtest 不得直接 SQL 讀表（§77.0 依賴圖）
- [ ] PIT 查詢語意：`as_of(date)` 回傳該日已發布資料——financials 依 `reported_at` + `revision`（取可見最新版），營收/股利依官方公布日，法人依 `observed_at`，外資依 T-1 `availability_date`（§2.6 / §37.1）
- [ ] 上櫃回補資料可用時間點 = 當日 T 盤後，回補後不可再改變（§37.1 / §45）
- [ ] look-ahead 單元測試：造 `reported_at` 在計算日之後的財報，計算結果不得使用它（§9）
- [ ] 歷史 PE/PB 由引擎自算時（close ÷ TTM EPS），reported_at 守門（§84 #6）
- [ ] 每筆查詢可帶出 lineage（source / data_date / freshness / grade / source_role），供因子 warnings 記錄缺源清單（§8.1）

## 備註

- 此層是「可重現」與「可驗證」（§83）的根基，測試密度要高
- 與 T021 backtest 共用此介面；T009–T023 全部依賴本任務