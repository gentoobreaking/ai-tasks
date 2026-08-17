---
github_issue: N/A
title: Factor System（§11 / §17–24 八類因子）
type: task
priority: P0
status: pending
depends_on: [T007, T008, T009]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T010 - Factor System（§11 / §17–24 八類因子）

## 目標

依 §11 Factor System 實作八類因子於 `factors/`：valuation（§12 + §17 Sector Profiles）、growth（§18，月營收 YoY 為準）、quality（§19 ROE）、dividend（§20）、price_position（§21）、momentum（§22）、institutional（§23）、buffett（§24）。Sprint 2 acceptance：manual calculation matches program。

## 驗收標準

- [ ] 八類因子公式與 spec 對齊，無隱藏參數（§11 確定性原則）；參數集中 `config/scoring.yaml`
- [ ] growth 以月營收 YoY 為主（§5.3a）；一時缺源用 §18 規則，缺證據標 warnings（不推測）
- [ ] valuation：PE/PB 歷史百分位由引擎自算（§84 #6），§17 Sector 分位對齊
- [ ] 因子輸出寫入 factor_scores，帶 snapshot 關聯與 lineage（§5.7）
- [ ] 缺源因子保留 warnings 清單（§8.1 傳播：第 2 層計算結果記錄缺源清單）
- [ ] 每因子 ≥3 個手算對照 unit test（Sprint 2 acceptance）
- [ ] 100% 確定性：同輸入重跑產生完全一致輸出

## 備註

- 各因子模組注意不要互相偷偷共用非 PIT 資料——一律走 repository PIT 介面（T008）