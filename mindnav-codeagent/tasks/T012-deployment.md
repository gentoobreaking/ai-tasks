---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/485
title: T012 - 部署手冊與 Docker 配置
type: Feature
priority: medium
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T012 - 部署手冊與多進程管理

## Description
撰寫分離式架構的部署手冊，提供 Docker Compose 配置與一鍵啟動多個 Agent 進程的腳本。

## Acceptance Criteria
- [ ] 更新 README.md，說明「推理伺服器 + 代理實例」的運作流程。
- [ ] 提供一鍵啟動腳本 `scripts/start_all.sh`。
- [ ] 更新 Docker Compose，分離 `inference` 與 `agent` 服務。
- [ ] 配置基於 Redis 的持久化 Checkpointer (適用於多代理併發)。

## Notes
- 需特別說明如何配置 `--n_slots` 以對應 Agent 的數量。
- 腳本需具備基本的健康檢查，確保推理服務啟動後才啟動 Agent。
