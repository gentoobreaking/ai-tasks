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
- [x] 旗標開啟時零外部副作用（推播/執行皆跳過），整合測試斷言
- [x] 影子報告格式含評分欄位（原因正確/建議可用），人工評分可寫回統計庫
- [x] 上線門檻檢查：評分不足時嘗試關閉旗標 → 明確拒絕並說明差距

## 執行紀錄（2026-08-24 稽核）
- 已達成 3 項並打勾。
- **未竟事項**：無。
- 補充（證據）：test_t016_shadow.py：整合測試斷言 SpyNotifier.sent==[] 且 SpyCommandRunner.calls==[] 且時間線無 execution_*；影子報告含「原因正確/建議可用/reviewer」評分欄位，record_score 寫回 shadow_scores 表；29 份評分時 ShadowGateError 含 scored=29/30 差距說明，30 份全對後 disable() 放行。
