---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/582
title: T059 - 技能自動優化迴路
type: Feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-18
updated: 2026-05-18
howto: implement
---

# T059 - 技能自動優化迴路

## 目標
目前技能一旦建立就不會再改進。需建立「技能使用 → 成效追蹤 → 自動優化」的閉環，讓技能隨著使用次數增加而持續改善（參考 Hermes 的 learning loop 設計）。

## 驗收標準
- [x] 技能 Frontmatter 擴充用量追蹤欄位（修改 T055 格式）：
  ```yaml
  usage_count: 0
  success_rate: 1.0
  avg_iterations_saved: 0
  last_used: YYYY-MM-DD
  last_optimized: YYYY-MM-DD
  ```
- [x] 新增 `engine/skills/skill_tracker.py`：
  - 每次技能被匹配並使用時（T056），`usage_count++`、`last_used` 更新
  - Graph 流程結束後，比對有使用技能 vs 未使用的 iteration 差異
  - 計算 `avg_iterations_saved`（滾動平均）
  - 記錄技能是否導致成功完成（PM FINISHED）或失敗回退
- [x] 優化觸發條件（可配置）：
  - `usage_count >= 5` 且 `success_rate < 0.7` → 自動重提煉（呼叫 LLM 根據歷史 usage 改寫步驟）
  - `usage_count >= 10` 且 `success_rate > 0.95` → 考慮晉升為 trusted skill
  - `last_used > 90 days` → 標記為 deprecated，移至 `_archive/`
- [x] 新增 `engine/skills/skill_optimizer.py`：
  - 接收舊技能檔案 + 用量統計 → 呼叫 LLM 產出優化版本
  - 優化內容：步驟精簡、遺漏步驟補全、trigger_pattern 調整
  - 優化後 version bump，舊版進 archive
- [x] 可選 cron 支援：`scripts/skill_maintenance_cron.py`
  - 定期掃描所有 auto skills，檢查是否需要優化或歸檔
  - 可掛入 `HEARTBEAT.md` 排程
- [x] `config/agents.yaml` 新增：
  - `skill_optimization.enabled`
  - `skill_optimization.min_usage_for_optimize`
  - `skill_optimization.min_usage_for_promote`
  - `skill_optimization.deprecation_days`
- [x] 單元測試：
  - 用量追蹤正確遞增
  - 優化條件判斷邏輯
  - archive 邏輯

## 備註
- 相依於 T055（技能存在）、T056（使用追蹤）、T058（晉升 trusted 需安全掃描）
- Hermes 的 learning loop 是「使用中改進」+「閒置時 nudge」，本 task 先做 task 完成後的 batch 優化
- 若技能長期未被使用，可在 heartbeat 中提示用戶是否要歸檔
- ✅ 2026-05-18：已實作 `skill_optimizer.py` 的 Telegram stale 通知，當技能被標記為閒置時自動發送通知
