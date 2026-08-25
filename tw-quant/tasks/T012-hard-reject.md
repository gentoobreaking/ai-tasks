---
github_issue: N/A
title: 硬淘汰規則引擎 H1–H5（F10）
type: feat
priority: high
status: done
depends_on:
- T011-scorer-top10
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-25
---

# T012 - 硬淘汰引擎

## 目標
依 algs/signal-grading.md 硬淘汰表實作五條規則，套用於 Top10。

## 驗收標準
- [x] interface：`apply_hard_rejects(df: DataFrame) -> (passed: DataFrame, rejected: DataFrame)`
- [x] H1：earnings_estimate +1y growth < 0 → 淘汰（資料缺失時跳過並標「無覆蓋,未檢」）
- [x] H2：eps_trend 0y current < 90daysAgo × 0.95 → 淘汰
- [x] H3：外資20日淨賣超 且 投信20日淨賣超 → 淘汰
- [x] H4：2026 EPS growth ≤ 0 且 近3月營收YoY均 ≤ 0 → 淘汰
- [x] H5：距60日高 < 3% 且 RSI14 > 70 → 不淘汰，total −10，rejected_reason 記 "H5降分"
- [x] rejected DataFrame 必含 rejected_rules 欄（如 "H1,H3"），輸出到報表淘汰名單區塊
- [x] 單元測試：每條規則至少一正例一反例（共 ≥10 案例），H1/H2 各含一個「無覆蓋」案例

## 備註
規則順序無短路依賴——全部評估後彙總 rejected_rules。
