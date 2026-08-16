---
github_issue:
title: 任務恢復優先 + opencode timeout + 聲音通知
type: feature
priority: high
status: done
depends_on: [T085, T086]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-17
updated: 2026-08-17
---

# T088 - 任務恢復優先 + opencode timeout + 聲音通知

## 目標
1. `run()` 與 `get_next_pending_task`：同時挑選 `is_pending` 與 `in-progress` 任務，`in-progress` 優先執行（中斷/未完成的任務優先恢復）。
2. `_do_call_opencode`：加 subprocess timeout (`OPENCODE_TIMEOUT`，預設 600s)；逾時視為該 tier 失敗並 kill process，交由備援鏈嘗試下一 tier。
3. `play_sound`（macOS afplay）於 blocked / 中斷 / 切換 model 時發出聲音通知，可用 `SOUND_NOTIFY=off` 關閉。
4. **修正 `is_in_progress`**：接受 `in_progress` (underscore) 與 `in-progress` (hyphen) 兩種寫法，修復部分專案（如 local-ai-controlpanel）in-progress 任務無法被恢復的問題。

## 驗收標準
- [x] `scheduler.py` run() 迴圈採 `is_pending or is_in_progress`，in-progress 排序優先；`get_next_pending_task` 同步
- [x] `providers.py _do_call_opencode` 包 `asyncio.timeout`，逾時 kill proc 並擲 Exception（供 tier failover）
- [x] `common/notify.py` 新增 `play_sound`（afplay，非阻塞，失敗靜默）
- [x] blocked（`_record_failure`）、KeyboardInterrupt（`run`）、tier 切換（`call_model_for_implementation`）各接入對應音效
- [x] `tests/conftest.py` autouse 靜音 `SOUND_NOTIFY=off`
- [x] 新增 `tests/test_run_priority_timeout_sound.py` 驗證三項行為
- [x] 修正 `tests/test_impl_providers.py` 直接賦值的 monkeypatch 洩露（隔離測試）
- [x] `Task.is_in_progress` 同時接受 `"in-progress"` 與 `"in_progress"`，修復 local-ai-controlpanel T030-T032 恢復問題
- [x] `scheduler.py`/`auto_develop.py` 列表顯示改用屬性判定（🔄/⏳/✅ 圖示與計數），相容兩種寫法
- [x] `ruff check .` 零錯；全測試僅剩 2 個既有 pybreaker flaky 失敗（與本變更無關，於 clean tree 亦失敗）

## 備註
- 測試用 `OPENCODE_TIMEOUT=0.1` +假 proc 模擬卡住，驗證 kill + raise。
- timeout 用 `float`（允許 fractional test 值）；Python 3.11+ `asyncio.timeout` 拋出 builtin `TimeoutError`（OSError subclass），`except Exception` 會捕獲並切換 tier。
- 聲音檔案：/System/Library/Sounds/{Sosumi,Glass,Tink,Ping}.aiff。
