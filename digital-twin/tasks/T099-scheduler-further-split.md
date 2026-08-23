---
github_issue: N/A
title: scheduler.py 二階拆分 — 任務挑選與 process_task 流程獨立
type: refactor
priority: low
status: done
depends_on:
- T083
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T099 - scheduler.py 二階段拆分

## 目標
T083 已拆出品質閘門（quality_gate.py）與 blocked 流程（blocked_flow.py），
T076/T088 拆出修復迴圈（repair_loop.py），但 scheduler.py 主體仍有 994 行，
職責依舊混雜：任務挑選、spec/codebase 組裝、process_task 主流程、README 同步、
CLI 子命令（list_blocked/retry/supersede）全在一檔。

current_status.md 待辦第 2 點已列此項。建議切面：
1. **task_selection.py**：load_tasks / get_next_pending_task / find_blockers /
   task_dependencies / is_completed_by_evidence（scheduler.py:152-213 一帶，
   純函式易測）
2. **context_builder.py**：get_project_spec / get_codebase_context
   （scheduler.py:215-303，prompt 組裝素材）
3. scheduler.py 保留 AutoDevelopScheduler 類與 process_task 編排；
   twin CLI 的 blocked/retry/supersede 轉發改指新模組
4. providers.py 頭部註明的依賴方向維持：providers 吃 diff/config，
   新模組不得反向 import providers/scheduler

## 驗收標準
- [ ] scheduler.py 主體 < 500 行；新模組各有明確單一職責
- [ ] ./twin auto --list / blocked / retry 行為不變（既有測試通過）
- [ ] task_selection 純函式補直接單元測試（blocker 判定、優先級排序邊界）
- [ ] 全套 pytest + 變更檔 pyright 歸零

## 備註
- 低優先序：功能正常，純可維護性投資；等 T090 CI 轉綠後再做，
  避免在紅燈基線上搬移程式碼
- 拆分時沿用既有薄轉發慣例（auto_develop.py:57 對 scheduler import 即範本），
  對外介面不動
