---
github_issue: N/A
title: Factor System（§11 / §17–24 八類因子）
type: task
priority: P0
status: done
depends_on: [T007, T008, T009]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T010 - Factor System（§11 / §17–24 八類因子）

## 目標

依 §11 Factor System 實作八類因子於 `factors/`：valuation（§12 + §17 Sector Profiles）、growth（§18，月營收 YoY 為準）、quality（§19 ROE）、dividend（§20）、price_position（§21）、momentum（§22）、institutional（§23）、buffett（§24）。Sprint 2 acceptance：manual calculation matches program。

## 驗收標準

- [x] 八類因子公式與 spec 對齊，無隱藏參數（§11 確定性原則）；參數集中 `config/scoring.yaml`
- [x] growth 以月營收 YoY 為主（§5.3a）；一時缺源用 §18 規則，缺證據標 warnings（不推測）
- [x] valuation：PE/PB 歷史百分位由引擎自算（§84 #6），§17 Sector 分位對齊
- [x] 因子輸出寫入 factor_scores，帶 snapshot 關聯與 lineage（§5.7）
- [x] 缺源因子保留 warnings 清單（§8.1 傳播：第 2 層計算結果記錄缺源清單）
- [x] 每因子 ≥3 個手算對照 unit test（Sprint 2 acceptance）
- [x] 100% 確定性：同輸入重跑產生完全一致輸出

## 完成記錄

- **commit `d2d9899`**「T010: Factor System (spec §11/§17-24, 8 factors)」：13 files, +2089
  - `factors/` 8 個因子模組 + `common.py`（FactorResult/weighted_score/cagr/percentile_rank）
    + `pipeline.py`（compute_all/build_factor_rows/write_factor_scores）
  - `config/scoring.yaml`：補各因子子項權重（factor_weights.<family>）與 §17 sector_profiles
  - `tests/unit/test_factors.py`：58 tests（每因子 ≥3 手算對照 + 確定性 + 缺源 warnings）
- **commit `7f0db19`**：README Factor System 段落（+42）
- 驗收 7/7 通過；完整套件 336 passed, 7 skipped；ruff clean
- 手算對照案例：quality 88.5（ROE 34%→100 / OPM 20%→83.33 / FCF 15%→87.5 / debt 50%→60）、
  dividend CAGR +29.1%、momentum RSI（超賣 80 / 超買 30 / 中性 50）、institutional 5D 累積 5 億→75 分
- 修正：cagr 負成長回傳（100→50 = -50%）、momentum RSI 除零（全漲/全跌）、
  dividend payout_stability 無紀錄→None（不猜 0 分）、valuation sector profile 覆寫

## 備註

- 各因子模組注意不要互相偷偷共用非 PIT 資料——一律走 repository PIT 介面（T008）