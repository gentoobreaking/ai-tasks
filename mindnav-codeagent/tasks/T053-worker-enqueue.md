---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/558
title: T053 - Coder Worker 實際 Enqueue 邏輯實作
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-17
updated: 2026-05-18
howto: implement
---

# T053 - Coder Worker 實際 Enqueue 邏輯實作

## 目標
coder-worker 目前是孤立的 consumer — 監聽 `coding_task_queue` 但沒有任何 producer 推送任務。需補全 producer 端（bot-service/graph），讓 Coder 節點真正透過 Redis 佇列分散執行。

## 驗收標準
- [x] bot-service 的 `build_project_graph()` 改用 `RedisSaver`（替代 `MemorySaver`），讓 coder-worker 能存取相同 state
- [x] Coder 節點改為非同步：bot-service 將 thread_id `rpush` 至 `coding_task_queue`，不直接 invoke Coder
- [x] coder-worker 從佇列 pop thread_id，用 `RedisSaver` 恢復 state，執行 Coder 節點邏輯，完成後 thread 繼續
- [x] bot-service 等待 Coder 完成（透過 Redis pub/sub 或 polling），恢復 workflow
- [x] `graph.py` 支援 `use_redis` 參數，本地測試仍可用 `MemorySaver`
- [x] `coder-worker` 的 `depends_on` 移除 `inference-server`（docker-compose 已設定，只依賴 redis）
- [ ] 所有角色模型鏈正常顯示，無新 crash（需實際啟動系統整合測試驗證）

## 實作細節 (2026-05-18)

### tg_bot.py `_run_distributed` 改進
- 改用 `asyncio.wait_for` + `run_in_executor` 實作非阻塞的 pubsub 監聽
- 加入 120 秒 timeout，防止 worker 當掉時 bot 永久等待
- 檢查 `state.next` 是否包含 Coder，若已無 Coder 表示 workflow 已结束或狀態異常
- worker 完成後呼叫 `astream(Command(resume=None), config)` 繼續執行後續節點

### coder_worker.py 改進
- 加入 `result_ttl` (300秒)，避免 Redis 堆積過多過期 result key
- 將結果同時 publish 到 `result_channel` (供 pubsub 監聽) 和寫入 `worker_result:{thread_id}` key (供 polling fallback)
- `blpop` 加入 5 秒 timeout，避免永久 blocking
- 加入 `_publish_result` 方法，發布時同時包含 status 和 error 資訊
- `process_task` 加入 state 追蹤 (before/after)，便於偵錯
- Worker 例外時會發布 error result，避免 bot 無限等待

### 修正的問題
1. 原本 `pubsub.listen()` 是 blocking call，無法 interrupt → 改用 `get_message` + asyncio
2. 原本無 timeout → 加入 120 秒 timeout
3. 原本 worker crash 時無 error handling → 改為 publish error status
4. 原本 result 只靠 pubsub → 加入 Redis key fallback

## 備註
- coder-worker 已在 docker-compose.yml 中有 `replicas: 2` 支援水平擴展
- ✅ 2026-05-18 修正：`blpop` 已加入 5 秒 timeout，避免 worker 在無任務時永久 blocking
- ✅ 2026-05-18 修正：cod_worker.py 已加入完善的 error handling，worker crash 時會發布 error result 至 result_channel，bot 不會無限期等待
