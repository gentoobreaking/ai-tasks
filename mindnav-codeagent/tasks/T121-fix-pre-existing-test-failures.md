---
github_issue:https://github.com/gentoobreaking/ai-tasks/issues/634
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 本次執行已全部修正，後續可直接執行 pytest
---

# T121 - 修復既有測試套件中的 failures / errors

## 目標
將 `pytest tests/` 跑出的 8 failed / 3 errors 全部修復為 0 failed / 0 errors，確保測試套件乾淨。

## 驗收標準
- [x] 8 failures 與 3 errors 全部消除
- [x] 修正項目不破壞既有通過的測試

## 修正項目

### Redis 連線失敗（3 errors + 2 failures）
- **原因**: `TestCoderWorkerIntegration.setUpClass` / `TestEndToEndFlow.setUpClass` 未包 try/except → Error；`TestEndToEndFlow` 的 `cls.skipTest()` 為 instance method，應使用 `raise unittest.SkipTest`
- **作法**: 
  - `setUpClass` 包 try/except 並 `raise unittest.SkipTest`
  - `test_worker_process_task_flow`: 在 `CoderWorker()` init 前 patch `redis.Redis.from_url`

### planner 為 async 導致同步 invoke 失敗
- **原因**: `graph_bot.invoke(initial_state, config)` → planner 是 async function，同步 invoke 拋 `TypeError`
- **作法**: 改用 `asyncio.run(graph_bot.ainvoke(...))`

### test_prompt_assembler_enabled assertion
- **原因**: `messages[0].content` 現在包含 header (`--- AGENTS.md (coder) ---`)，不再是純文字
- **作法**: `assert "Stable Layer Content" in messages[0].content`

### async supervisor tests 無 @pytest.mark.asyncio
- **原因**: 3 個 async def test function 缺少 `@pytest.mark.asyncio`，pytest 無法執行 async 函數
- **作法**: 補上 `@pytest.mark.asyncio`

### test_all_nodes_reachable — po agent case mismatch
- **原因**: config agent key 為小寫 (`po`)，transition 使用大寫 (`PO`)；其他 agent 也有大小寫不一致 (`pm` → `PM`, `qa` → `QA` 等)
- **作法**: 建立 `NODE_NAME_MAP` 統一轉換

### test_bot_callback_handling — MagicMock 預設攔截流程
- **原因**: `msg_update.message.reply_to_message` 是 MagicMock (truthy)，導致 `_handle_reply_command` 提前 return True，未執行後續 `SkillTracker.record_feedback`
- **作法**: 設定 `msg_update.message.reply_to_message = None`

### test_routing_restrictions / test_invalid_transition_blocked timeout
- **原因**: `Supervisor.route()` 內部呼叫 `self.structured_llm` 真實 LLM API (NVIDIA)，耗時過長或 timeout
- **作法**: patch `structured_llm` 為 mock，返回固定 `RouteDecision`

### test_outcome_signal test_persist_and_read
- **原因**: `OUTCOME_DIR` 未 import (NameError)；thread_id 固定 `test-persist` 導致多次執行檔案累積多筆
- **作法**: import `OUTCOME_DIR`；使用 `time.time()` 產生唯一 thread_id

## 結果
```
168 passed, 7 skipped, 0 failed, 0 errors
```

## 備註
- 7 skipped 皆為 Redis 相關測試 (本機未啟動 Redis)，屬正常行為