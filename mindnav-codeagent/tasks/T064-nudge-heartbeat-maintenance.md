---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/587
title: T064 - Nudge / Heartbeat 記憶維護
type: Feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-18
updated: 2026-05-18
howto: implement
---

# T064 - Nudge / Heartbeat 記憶維護

## 目標
Hermes 在 agent 空閒時會主動 nudge 去做記憶維護、技能歸檔、知識淬鍊。mindnav-codeagent 目前完全被動 — 只有當用戶送訊息時 graph 才會跑。沒有定期檢修機制。

需建立 heartbeat / cron 驅動的維護任務，在系統空閒時自動執行記憶整理、技能健康檢查、過期資料歸檔。

參考 Hermes 的 cron scheduler + `hermes_already_has_routines.md`。

## 驗收標準
- [x] 新增 `scripts/skill_maintenance_cron.py`（可被 cron 或 heartbeat 觸發）：
  - 每 24 小時執行一次
  - 掃描所有 auto skills，檢查：
    - `last_used > 30 days` → 標記 `stale`，發 Telegram 通知
    - `last_used > 90 days` → 自動移至 `_archive/`
    - 版本數量 > 5 → 壓縮舊版（保留最近 3 版）
  - 掃描 `data/session_summaries/`，壓縮 >30 天前的 JSONL（摘要保留，原始內容可刪）
  - 掃描 `data/feedback/`，彙整報告
- [x] 新增 `scripts/memory_consolidation_cron.py`（每週）：
  - 讀取本週所有 session summaries
  - 呼叫 LLM 產出「週報摘要」— 本週關鍵決策、技術選型、模式識別
  - 週報寫入 `data/session_summaries/_weekly/YYYY-Www.json`
  - 目的是讓 T054 搜尋時可找到高層次的跨 session pattern
- [x] 在 `engine/graph.py` 或獨立 scheduler 中註冊 cron job：
  - 若系統使用 `HEARTBEAT.md`（openclaw 標準），將兩個 script 註冊為 cron entry
  - 若無 `HEARTBEAT.md`，提供 `config/agents.yaml` 的 `maintenance_cron` 配置
    ```yaml
    maintenance_cron:
      skill_check_interval_hours: 24
      weekly_report_day: "monday"
      archive_after_days: 90
      stale_after_days: 30
    ```
- [x] 無 LLM 調用模式優化：
  - 純檢查類操作（掃 stale、壓縮舊版）不走 LLM，降低運維成本
  - 只有週報摘要需要 LLM
- [x] 維護完成後發送 Telegram 通知（頻道與 T063 相同）
- [x] 單元測試：
  - stale 判斷邏輯
  - archive 條件
  - 週報摘要觸發邏輯
  - cron 配置正確讀取

## 備註
- 相依於 T054（session summaries）、 T055（auto skills）、T059（skill_tracker）
- Hermes 參考：`cron/` 目錄、`hermes_already_has_routines.md`
- 這是 learning loop 的「閉環維護者」— 讓系統能自我整理，不需要用戶手動清理
- ✅ 2026-05-18：已實作 `memory_consolidation_cron.py` 的 Telegram 週報通知，包含詳細格式（關鍵決策、技術選型、模式識別、下週建議）
