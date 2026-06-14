---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/547
title: T043 - Supervisor 路由快取機制
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: implement
---

# T043 - Supervisor 路由快取機制

## 目標
目前每次節點流轉 Supervisor 都調用 LLM 決定下一步，9 個節點走一輪就多 9 次 API 呼叫。對於確定性路徑（如 Coder→PM、Doc→PM、DevOps→PM），應直接 hardcode bypass LLM。

## 驗收標準
- [x] 對 `agents.yaml` 中只有一個 allowed_next 的 sender，直接返回該節點，不調用 LLM
- [x] 對只有兩個選項且其中一個為 PM 的 sender，預設走非 PM 路徑（fallback），PM 保留給 LLM 判決
- [x] 1-選項 bypass 使單輪 LLM 呼叫次數從 9 降至 4（PO、Architect、Security、Doc、Researcher、DevOps 可跳過）
- [x] 可透過 `agents.yaml` 的 `route_optimization` 區塊開關此功能

## 備註
- Coder → [PM, Security, QA] 有 3 個選項，仍需 LLM
- Doc → [PM]、DevOps → [PM] 只有 1 個選項，可直接 hardcode
