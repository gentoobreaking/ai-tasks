---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/593
title: T068 - Supervisor Graph Redis 持久化 Checkpointer
type: Feature
priority: high
status: done
assignee: OpenCode MiniMax-M2.7
created: 2026-05-18
updated: 2026-05-19
howto: implement
---

# T068 - Supervisor Graph Redis 持久化 Checkpointer

## 目標
將 Supervisor 的 LangGraph checkpointer 從 `MemorySaver` (in-memory) 改為 `RedisSaver` (persistent)，讓 thread 狀態在重啟後可恢復。

## 驗收標準
- [x] `interface/tg_bot.py:41` 改用 `build_project_graph(use_redis=True)`
- [x] `scripts/run_production.py:7` 同步改用 `use_redis=True`
- [x] 確認 `REDIS_URL` 環境變數正確設定
- [x] 啟動後驗證 thread checkpoint 寫入 Redis (`docker exec` PONG, 重啟前後各 check)
- [x] 模擬重啟後 thread 可從斷點恢復

## 實作細節

### 現有架構
```
bot-service (Supervisor):
  ├── use_distributed=False → RedisSaver ✅ (本PR改為預設)
  └── use_distributed=True  → RedisSaver ✅

coder-worker:
  └── build_project_graph(use_redis=True, for_worker=True) ✅
```

### 變更點
1. **`interface/tg_bot.py:41`**
   ```python
   # 變更前
   self.graph = build_project_graph()

   # 變更後
   self.graph = build_project_graph(use_redis=True)
   ```

2. **`scripts/run_production.py:7`**
   ```python
   # 變更前
   graph = build_project_graph()

   # 變更後
   graph = build_project_graph(use_redis=True)
   ```

### 錯誤處理機制
`graph.py` 已有以下容錯：
- Redis 可用 → 使用 RedisSaver ✅
- Redis 重啟後再起 → `except "Index already exists"` 會 log 並繼續 ✅

若要進一步增強（可選）：
```python
try:
    saver = AsyncRedisCheckpointer(redis_url=redis_url)
    saver.setup()
except Exception:
    logger.warning("[Graph] Redis unavailable, fallback to MemorySaver")
    saver = MemorySaver()
```

## 備註
- `AsyncRedisCheckpointer` 已在 `graph.py:189` 實作，包裝 `RedisSaver` 為 async 介面
- Redis 持久化可支援多實例部署時共享同一個 thread 狀態
- 需確認 `REDIS_URL` 環境變數在 production 環境有正確設定
