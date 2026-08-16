---
title: spec_auto_merge 移除假資料對照表
type: fix
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: '2026-08-17'
spec_version: v3
---
# T016 - spec_auto_merge 移除假資料對照表

## 目標
`spec_auto_merge.py` 生成的 `05-merge-review.md` 對照表是**硬編碼的範例文字**（如「錯誤處理 → ✅ 採用 DeepSeek」），並非從模型輸出實際分析得出。這些假決策會誤導人工審查流程。

## 驗收標準
- [x] 移除 `generate_spec_merge` 中寫死的 3 行假對照表（整體架構/錯誤處理/資料流程）
- [x] 改為：從各模型輸出實際提取章節標題與摘要做對照；無法自動提取時標註「⚠️ 需人工填寫」而非假資料（`_extract_sections()` 提取 ##/### 章節 + 模型章節覆蓋對照表）
- [x] 至少保留「各模型章節摘錄」區塊（該區塊是真實輸出 ✅）
- [x] `python3 spec_auto_merge.py --project digital-twin --version v2` 產出檔案中無任何硬編碼決策（v2/v3 皆驗證，grep 零殘留；同時修正 vv2 標題重複前綴 bug）
- [x] 若自動提取不可行，最小可行方案：對照表只留標題行 + 「需人工填寫」註記，不得預填「採用 X」結論（已實作為 fallback 分支；merge-decision.md 範本同步移除假決策）

## 備註
- 現有已生成的 `specs/ai-consultations/v2|v3/05-merge-review.md` 若含假資料也一併修正或標註
- 參考 `multi_ai_discuss.py _generate_merge_template` 的「逐輪關鍵觀點對照」做法