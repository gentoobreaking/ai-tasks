---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/521
title: T016 - 分散式持久化與任務隊列擴展 (Distributed Persistence & Scaling)
type: Feature
priority: medium
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T016 - 分散式持久化與任務隊列擴展

## Description
將 LangGraph 的記憶儲存從單機記憶體 (MemorySaver) 升級為分散式 Redis (RedisSaver)，並導入基於 Redis 的任務隊列模式，支援 Coder 節點的橫向擴展。

## Acceptance Criteria
- [x] 將 engine/graph.py 的 MemorySaver 替換為 langgraph.checkpoint.redis.RedisSaver。
- [x] 在 docker-compose.yml 中配置 Redis 服務。
- [x] 實作基於 Redis 的任務派發機制 (Worker 模式)，使 Coder Agent 能夠從佇列中競爭獲取任務。
- [x] 驗證多個 Agent 容器實例運作時的狀態一致性。

## Notes
- Redis 將同時作為 Checkpointer 與 Message Broker。
- 橫向擴展後的 Agent 已透過環境變數識別自身身分，並監聽對應的 Worker Queue。
- 狀態一致性與競爭機制驗證已納入 T021 驗證框架。
- ✅ 2026-05-18：將原本動態 patching RedisSaver 的脆弱實作改為正統 subclass `AsyncRedisCheckpointer`，更穩健且易於維護
