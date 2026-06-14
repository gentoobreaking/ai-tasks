---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/515
title: T008 - 對話上下文管理 (Message Pruning)
type: Feature
priority: medium
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T008 - 對話上下文管理 (Message Pruning)

## Description
設計訊息裁剪（Message Pruning）節點，防止長對話導致本地模型上下文超出。

## Acceptance Criteria
- [x] 實作自動裁剪機制，保留 System Prompt 與最新對話。
- [x] 將舊訊息壓縮為摘要（Summary）注入歷史紀錄。
- [x] 驗證在大規模對話下系統仍能穩定運行。

## Notes
- 實作了 `ContextManager` 類別於 `src/core/context_mgmt.py`。
- 支援非同步摘要生成。
- 策略：保留 System Message + 最後 K 條訊息，其餘部分壓縮為摘要。
- 已在 `src/core/graph.py` 中預留接入點。
