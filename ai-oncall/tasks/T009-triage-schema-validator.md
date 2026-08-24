---
github_issue: N/A
title: 分診管線編排與 schema 驗證修復迴圈
type: feat
priority: high
status: done
depends_on:
- T002
- T003
- T006
- T007
- T008
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T009 - 分診管線編排與 schema 驗證修復迴圈

## 目標
`brain/triage.py` + `schema_validator.py`：組裝 context+RAG → LLM → 驗證修復迴圈 →
TriageReport。取消檢查點、降級模式、Shadow Mode 支援。
**實作依據：`algs/schema-validation.md` 全部；`algs/triage-pipeline.md` §A.1/A.3–A.6。**

## 驗收標準
- [ ] schema 契約依 algs/schema-validation.md §C.1（hypotheses/suggested_actions/risk 枚舉/missing_context/prompt_version）
- [ ] 修復迴圈依 §C.2：驗證失敗帶錯誤重問一次，再失敗降級純 context 推播；executor 對未驗證輸入硬拒絕
- [ ] 壞輸出語料集 ≥8 案例（截斷/幻覺 enum/缺欄位/型別錯/markdown 包裹/空陣列…）逐一測試 repair 次數與降級路徑
- [ ] 取消檢查點 ①②（algs/triage-pipeline.md §A.3）：中止不產報告、token 照計入成本統計
- [ ] 降級模式（§A.5）：missing_context 必列；幻覺補完以測試斷言禁止
- [ ] Shadow Mode：SHADOW_MODE=1 時報告寫 shadow_reports/ 不推播不執行（§A.6）
- [ ] 每筆輸出帶 prompt_version