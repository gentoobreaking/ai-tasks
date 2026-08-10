---
github_issue: N/A
title: 事件日誌與回放讀取器
type: infrastructure
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-08-10
---

# T004 - 事件日誌與回放

## 目標
實作結構化事件日誌系統（§1 原則 5「所有決策可回放」）：事件型別定義、寫入器（append-only）、回放（replay）讀取器。為 T010 績效統計與 T012 回放工具之唯一資料來源。

## 驗收標準
- [x] 事件型別（Enum + Schema）：`signal_issued` / `signal_expired` / `signal_triggered` / `position_opened` / `position_closed` / `freshness_gate_pass|fail` / `position_state_change` / `failed_breakout` / `daily_lockout` / `bias_locked` / `briefing_generated` / `priority_ranked` / `phase_start|phase_end` / `system_shutdown` 等（§14.4 events 之全部）
- [x] 事件 Schema 驗證（zod 或等效）：寫入前驗證欄位與型別，失敗即抛錯
- [x] append-only 日誌：JSON Lines 格式於 `LOG_DIR`，每日一個檔案（`YYYY-MM-DD.events.jsonl`）
- [x] 回放讀取器：`loadDay(date) → Event[]` 依 ts 排序，供 T012 回放工具與績效計算（T010）使用
- [x] 事件關聯：`signal_id` / `position_id` 可串接（signal_issued → position_opened → position_closed），供 T012 決策追溯
- [x] 單元測試：事件序列化/反序列化、跨日檔案讀取、損壞行跳過（附 warning）

## 備註
- 事件為「決策可回放」之唯一資料來源，不得由 LLM 產生（§16）
- 檔案格式保持穩定；欄位新增需向後相容
- v2.0 新增事件：`bias_locked`（§5 鎖定結果）、`briefing_generated`（§9）、`priority_ranked`（§10 派單決策）
