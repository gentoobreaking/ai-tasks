---
github_issue: N/A
title: evalkit 評測工具與 prompt_version 追蹤
type: feat
priority: medium
status: done
depends_on:
- T009
- T007
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T015 - evalkit 評測工具與 prompt_version 追蹤

## 目標
`evalkit/`：歷史已脫敏事故回放（≥20 件起跳）→ 對比 ground truth → 命中率報告。
**實作依據：`algs/knowledge-flywheel.md` §D.3–D.4。**

## 驗收標準
- [x] replay 離線跑 shadow 路徑；原因命中/建議可用率/平均 token 成本三項報告
- [x] prompt_version 變更前後對比報告；品質下降版本不得上線的檢查點（spec.md §5 標準 12）
- [x] 回放集先過遮蔽層（§D.5）

## 執行紀錄（2026-08-24 稽核）
- 已達成 3 項並打勾。
- **未竟事項**：無。
- 補充（證據）：test_t015_evalkit.py：20 件回放 shadow 路徑（影子報告落盤、無 execution_* 事件），三項指標（cause_hit_rate/action_usable_rate/avg_tokens_per_case）good=1.0/poor=0.0 對比；compare/release_gate 命中率下降即 reject（標準 12）；test_replay_redacts_case_context_before_llm 斷言金鑰不進 prompt。
