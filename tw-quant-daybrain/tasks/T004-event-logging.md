---
github_issue: N/A
title: 事件日誌與回放讀取器
type: infrastructure
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T004 - 事件日誌與回放

## 目標
實作結構化事件日誌系統（§1 原則 5、§7.4）：事件型別定義、寫入器（append-only）、回放（replay）讀取器。

## 驗收標準
- [ ] 事件型別（Enum + Schema）：`signal_issued` / `signal_expired` / `position_opened` / `position_closed` / `freshness_gate_pass|fail` / `position_state_change` / `failed_breakout` / `daily_lockout` 等，含 §7.4 events 之全部
- [ ] 事件 Schema 驗證（zod 或等效）：寫入前驗證欄位與型別，失敗即抛錯
- [ ] append-only 日誌：JSON Lines 格式於 `LOG_DIR`，每日一個檔案（`YYYY-MM-DD.events.jsonl`）
- [ ] 回放讀取器：`loadDay(date) → Event[]` 依 ts 排序，供 T012 回放工具與績效計算（T010）使用
- [ ] 單元測試：事件序列化/反序列化、跨日檔案讀取、損壞行跳過（附 warning）

## 備註
- 事件為「決策可回放」之唯一資料來源，不得由 LLM 產生（§9）
- 檔案格式保持穩定；欄位新增需向後相容
