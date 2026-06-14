---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/586
title: T063 - 人工 Feedback 迴路
type: Feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-18
updated: 2026-05-18
howto: implement
---

# T063 - 人工 Feedback 迴路

## 目標
目前 Telegram bot 已有 approve/reject inline button（PM FINISHED 時顯示），但按下後的 signal 沒有回饋到技能/記憶系統。用戶說「這個不好」或按了 reject，learning loop 應該收到這個 signal 並影響 `success_rate`、觸發重提煉或退化偵測。

需將 Telegram 的 approve/reject、以及未來的 CLI/web feedback 橋接到 `SkillTracker` 和 `OutcomeSignal` 系統。

## 驗收標準
- [x] 定義 `UserFeedback` 資料結構：
  ```python
  class UserFeedback:
      thread_id: str
      task_id: str  # T0XX
      action: Literal["approve", "reject", "revise"]
      comment: Optional[str]
      timestamp: str
      related_skills: List[str]  # 此 task 用到的 auto skills
  ```
- [x] 在 `interface/tg_bot.py` 的 `handle_callback` 中：
  - 按下 approve → 寫入 `UserFeedback(action="approve")`
  - 按下 reject → 寫入 `UserFeedback(action="reject")`
  - 將 feedback 傳遞給 `SkillTracker.record_feedback()`
- [x] `SkillTracker.record_feedback()` 行為：
  - `approve` → 視為 success signal（同 T060 success）
  - `reject` → 視為 failure signal，且權重 x2（用戶親自否定比系統判斷更嚴重）
  - `revise` → 中等權重 failure，觸發 skill 重提煉優先級提高
- [x] Feedback 持久化至 `data/feedback/YYYY-MM-DD.jsonl`
- [x] 在 tg_bot 的 `handle_callback` 中增加「可選 comment」流程：
  - reject 後可接續文字訊息視為 comment（同一 thread_id）
  - comment 存入 feedback.comment，並在下次優化時餵給 LLM 作為改進參考
- [x] 新增 `config/agents.yaml` 的 `user_feedback` 配置：
  - `reject_weights`（預設 2.0）
  - `enable_comment_capture`
- [x] 單元測試：
  - feedback 寫入後可正確查詢
  - `record_feedback("approve")` → success_rate 上升
  - `record_feedback("reject")` → success_rate 下降（權重 x2）
  - comment capture 正確關聯 thread_id

## 備註
- 相依於 T059（skill_tracker）、T060（outcome signal）
- 此 task 是 learning loop 中「人類在迴路中」（Human-in-the-loop）的關鍵環節
- 未來 CLI feedback 可沿用同一套 `UserFeedback` 結構
