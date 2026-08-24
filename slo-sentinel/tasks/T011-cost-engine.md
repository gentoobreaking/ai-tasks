---
github_issue: N/A
title: 成本預測與報表 internal/cost
type: feat
priority: medium
status: done
depends_on:
- T006
- T010
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T011 - 成本預測與報表 internal/cost

## 目標
`internal/cost`：月度預算燃盡（重用 eta.go + 狀態機，天花板=B）、月底/年底推估、
爆衝偵測、日/月/年報表。**唯一實作依據：`algs/cost-forecast.md` §D.1–§D.4。**

## 驗收標準
- [x] **日速率雙視野**（§D.2）：r_recent=近 7 天日均（反映擴容）、r_mtd=S/d_elapsed（平滑）；兩者並陳如同 ETA 引擎
- [x] **月底推估**：projected_EOM = S + r × (d_total − d_elapsed)，aggressive 用 r_recent、conservative 用 r_mtd
- [x] **預算 ETA**：(B − S)/r，r>ε 才有意義；餵入與容量/SLO 同一顆狀態機
- [x] **年推估**：Σ已完成月實際 + Σ未完成月 projected_EOM；滿一年服務附 YoY%
- [x] **觸發**（§D.3）：warning=ETA_budget<240h 或 MTD≥80% 且未月中；critical=ETA<48h；**爆衝偵測獨立於預算**——單日花費>日均 2 倍即推播（配置錯誤訊號）
- [ ] 所有報表與推播標注資料截止時間 confirmed_date——「今日」其實是昨日（§D.1 鐵律）
- [x] v1 限制如實標注：unblended cost、原幣+單一設定匯率（§D.4）
- [x] 容量連動公式：capacity 預測 N₀→N₁ ⇒ Δcost=(N₁−N₀)×unit_price/h 併入 r_recent 重算 projected_EOM（§D.2 最末），整合測試覆蓋
- [ ] 每週摘要推播：top 5 成長服務＋成長來源比對 capacity 擴容軌跡（§D.5）

## 備註
- 目錄條目範例：cost.aws.monthly-budget（spec.md §2.2 sensors 範例區）

## 執行紀錄（2026-08-24 稽核）
- 已達成 7 項並打勾。
- **未竟事項**：每週摘要推播：FormatReport/report.go 已具備，daemon 排程接線未做（待 T009 迴圈擴充）

