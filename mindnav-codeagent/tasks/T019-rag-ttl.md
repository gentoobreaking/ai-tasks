---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/522
title: T019 - RAG 過期與版本化管理 (TTL & Versioning)
type: Feature
priority: medium
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T019 - RAG 過期與版本化管理 (TTL & Versioning)

## Description
實作知識庫的版本控制與過期失效機制，採用「先封存、後總結」的並行處理策略，防止 Agent 讀取舊資料並保持知識庫精簡。

## Acceptance Criteria
- [x] 支援在 `config/agents.yaml` 或專案設定中配置 `retention_days` 與 `versioning_enabled` 參數。
- [x] 實作 Collection 版本化，新索引建立時自動標記舊版本為 Archived。
- [x] 實作歸檔與清理機制，將過期資料移至 `./data/archives/` 並觸發知識淬鍊邏輯。

## Notes
- 實作了「歸檔並淬鍊」機制。
- 舊 Collection 不再直接刪除，而是觸發總結流程後進行歸檔處理。

