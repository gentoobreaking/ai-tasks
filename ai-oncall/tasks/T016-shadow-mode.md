---
github_issue: N/A
title: Shadow Mode 全域旗標與管線整合
type: feat
priority: high
status: done
depends_on:
- T009
- T012
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T016 - Shadow Mode 全域旗標與管線整合

## 目標
全域 SHADOW_MODE 旗標貫穿管線：分診照跑、報告寫 shadow_reports/、推播跳過、
executor 一律跳過。**上線門檻機制**：≥30 份影子報告人工評分達標才允許關閉旗標
（algs/knowledge-flywheel.md §D.4；spec.md §5 標準 11）。

## 驗收標準
- [ ] 旗標開啟時零外部副作用（推播/執行皆跳過），整合測試斷言
- [ ] 影子報告格式含評分欄位（原因正確/建議可用），人工評分可寫回統計庫
- [ ] 上線門檻檢查：評分不足時嘗試關閉旗標 → 明確拒絕並說明差距