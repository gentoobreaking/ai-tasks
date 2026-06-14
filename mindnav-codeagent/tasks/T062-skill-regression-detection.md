---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/585
title: T062 - 技能退化偵測
type: Feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-18
updated: 2026-05-18
howto: implement
---

# T062 - 技能退化偵測

## 目標
技能可能隨著時間或使用場景變化而「退化」— 使用後導致更多 iteration、品質下降、甚至任務失敗。目前 T059 只有正向優化，缺乏偵測「這技能是不是愈來愈糟」的機制。

需在 `SkillTracker` 中實作退化偵測，當技能表現下滑時自動告警、降級或封存。

## 驗收標準
- [x] `engine/skills/skill_tracker.py`（T059）擴充退化指標：
  - `recent_success_rate`：最近 N 次（預設 10）的成功率，與整體 `success_rate` 比較
  - `avg_iterations_saved` 趨勢：若使用技能後 iteration 不減反增 → 退化訊號
  - `last_N_outcomes`：保存最近 N 次的 outcome signal reference
- [x] 退化判斷邏輯（可配置 threshold）：
  - `recent_success_rate < overall_success_rate * 0.7` → `degrading`
  - `avg_iterations_saved < 0`（使用技能反而更多 iteration） → `degrading`
  - 連續 3 次 `failure` outcome → `critical`
- [x] 退化處理策略：
  - `degrading` → log warning + 記錄退化原因到技能 frontmatter `degradation_log`
  - `critical` → 自動移出 active 技能庫，移至 `engine/skills/auto/_quarantine/`
  - 移出時保留完整記錄，可手動恢復
- [x] 新增 `engine/skills/skill_rollback.py`：
  - 支援將技能回滾到上一個版本（利用 T058 的 `_archive/`）
  - `rollback(skill_name, version=None)` — 不指定版本回滾到上一版
  - 回滾後在 frontmatter 記錄 rollback event
- [x] 退化報告：
  - `SkillTracker.degradation_report()` — 輸出所有 `degrading` / `critical` 技能清單
  - 可選整合到 T054 的 session summary 中
- [x] 單元測試：
  - 模擬 success_rate 下降 → `degrading`
  - 模擬連續 failure → `critical` → 自動 quarantine
  - rollback 正確恢復舊版
  - 退化後不再被 skill_matcher 匹配（直到修復或 rollback）

## 備註
- 相依於 T059（skill_tracker）、T060（outcome signal）
- 退化偵測是 learning loop 的安全機制，避免「學到壞習慣」
- 隔離 (quarantine) 而非刪除，保留人工審核機會
