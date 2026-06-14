---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/583
title: T060 - 任務成功/失敗信號系統
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-18
updated: 2026-05-18
howto: implement
---

# T060 - 任務成功/失敗信號系統

## 目標
目前 learning loop 缺少結構化的 success/failure signal。T059 的 `skill_tracker` 需要知道「這次執行是成功還是失敗」才能計算 `success_rate`，但現在唯一的結束信號是 PM FINISHED，沒有區分「順利完成」vs 「出錯退出的」。

需在 Supervisor 決策 END 時產出結構化 outcome signal，並餵回 `SkillTracker` 和 `SessionSummarizer`。

## 驗收標準
- [x] 定義 `OutcomeSignal` dataclass：
  - `status`（success/failure/partial）、`summary`、`iteration_count`、`had_errors`、`finished_by`、`skills_used`
  - `from_state()` classmethod + `to_dict()` + `persist()`
- [x] 在 `engine/nodes/supervisor_node.py` 中決定 END 時產出 `OutcomeSignal`
  - PM FINISHED → `success`
  - iteration 超限（>=8）→ `partial`
  - 錯誤 → `failure`
- [x] `OutcomeSignal` 寫入 `data/outcomes/YYYY-MM-DD.jsonl`
- [x] `OutcomeSignal` 傳遞給 `SessionSummarizer`（outcome 欄位加入摘要）
  - `SkillTracker.record_outcome()` 預留（T059 時接上）
- [x] `_outcome_signal` 作為可選欄位加入 `ProjectState`
- [x] Supervisor iteration_count >= 8 時輸出 `partial` signal
- [x] 單元測試（10 tests, all passed）

## 備註
- 這是 T059（技能優化迴路）的前置依賴，因為 `success_rate` 需要信號源
- 與 T054 的 session_summarizer 整合：summarize 時可參考 outcome 來決定摘要語氣
