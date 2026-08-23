---
github_issue: N/A
title: 多視野 ETA 引擎 internal/budget
type: feat
priority: high
status: pending
depends_on:
- T003
- T004
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T006 - ★ 多視野 ETA 引擎 internal/budget

## 目標
`internal/budget` 核心演算法：讀取 Sloth 生成的 recording rules（不自算視窗數學）、
Theil–Sen 穩健斜率、激進/穩健雙視野 ETA 外插、採樣有效性校驗、狀態機。
**唯一實作依據：`algs/capacity-eta.md` §A.1–§A.7 全部小節。**

## 驗收標準
- [ ] **斜率估計**（§A.2）：Theil–Sen——視野窗內所有樣本兩兩配對斜率取**中位數**；OLS 實作保留並以 feature flag 切換供 /accuracy 對比；n≤200 時 O(n²) 直接實作即可
- [ ] **ETA 公式**（§A.3）：`β_W > ε` 時 `ETA_W = H(t₀)/β_W`，否則 ∞；aggressive=ETA_1h（回答最壞多快）、conservative=ETA_3d（過濾一次性脈衝），兩者**並陳輸出**
- [ ] **觸發條件**（§A.4 表格預設值，YAML 可覆寫）：
  - warning 進入：ETA_agg < 72h 且 U ≥ soft_ratio(0.80)；**或** ETA_cons < 72h（低使用率但成長飛快也要報——前驅預警的核心價值）
  - critical 進入：ETA_agg < 6h 或 U ≥ 0.95
  - 解除：預測回到門檻外**持續 2 個輪詢週期**才降級
- [ ] **採樣有效性校驗**（§A.5 四條規則全數實作，任一不滿足→本輪不預測沿用上次狀態）：
  - 最少樣本數：1h 視野 ≥50 點、6h ≥300、3d ≥3600（60s 間隔的 83%）
  - 資料間隙 >5 分鐘 → 跨越缺口的配對不入斜率計算
  - 天花板 C(t) 變化 >1% → 清空該定義所有視野快取重新累積
  - SLO 型指標遇 28d 滾動重置 → 同上清空
- [ ] **固定數值測試**（§A.7）：C=500GB、m=150GB、β₁ₕ=2.0GB/min、β₃d=0.05GB/min → 斷言 ETA_agg≈175min(2.9h)、ETA_cons≈7000min(4.9d)
- [ ] §A.6 虛擬碼逐段與實作對照的表驅動測試（含 AM firing 靜默分支）
- [ ] 預測寫入 store 預測紀錄表，欄位含 catalog_version（供 /accuracy 對比調整前後命中率）

## 備註
- 本模組為純函式核心（query/store 由介面注入），是全專案最重要的測試區
- predict_linear 零碼基線由 catalog 的 alert rules 表達（T005 載入即可用），本引擎是其穩健版升級——兩者關係見 algs/sensor-catalog.md §C.1
