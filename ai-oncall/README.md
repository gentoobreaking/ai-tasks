# ai-oncall

## 已實作功能

| 功能 |
|------|
| oncall-gate 骨架與 proto 契約 |
| webhook 接收：認證、冪等、正規化 |
| Telegram 傳輸層 tgtransport |
| Incident 模型、風暴聚合與時間線雜湊鏈 |
| RAG 知識庫 memory/indexer + search |
| LLM providers 子套件與 token 預算 |
| 分診管線編排與 schema 驗證修復迴圈 |
| ★ executor 頂層套件（runner + redaction） |
| Telegram 決策層互動與排班升級鏈 |
| postmortem 草稿與 action items 追蹤 |

## Skip 項目

| Task | 說明 |
|------|------|
| | |

## 開發中

| Task | 名稱 | 說明 |
|------|------|------|
| | | |

## 待實作

| Task | 名稱 | 說明 |
|------|------|------|
| [T3-collect-fanout](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T003-collect-fanout.md) | context 收集器 fan-out | |
| [T5-core-skeleton](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T005-core-skeleton.md) | oncall-core 骨架、gRPC servicer 與 SQLite store | |
| [T10-runbook-parse-approval](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T010-runbook-parse-approval.md) | runbook 解析與批准閘門語意 | |
| [T14-readapi](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T014-readapi.md) | UI 專用唯讀查詢 readapi | |
| [T15-evalkit](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T015-evalkit.md) | evalkit 評測工具與 prompt_version 追蹤 | |
| [T16-shadow-mode](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T016-shadow-mode.md) | Shadow Mode 全域旗標與管線整合 | |
| [T17-oncall-ui](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T017-oncall-ui.md) | oncall-ui 唯讀 Web 服務 | |
| [T18-deploy-docs](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T018-deploy-docs.md) | 上線部署文件與三服務佈建 | |
| [T19-e2e-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T019-e2e-integration.md) | 端到端整合測試（spec.md §5 全覆蓋） | |

## Task 列表

| # | 名稱 | 狀態 |
|---|------|------|
| [T1-gate-skeleton-proto](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T001-gate-skeleton-proto.md) | oncall-gate 骨架與 proto 契約 | ✅ done |
| [T2-ingest-auth-idempotency](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T002-ingest-auth-idempotency.md) | webhook 接收：認證、冪等、正規化 | ✅ done |
| [T3-collect-fanout](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T003-collect-fanout.md) | context 收集器 fan-out | 📋 pending |
| [T4-tgtransport](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T004-tgtransport.md) | Telegram 傳輸層 tgtransport | ✅ done |
| [T5-core-skeleton](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T005-core-skeleton.md) | oncall-core 骨架、gRPC servicer 與 SQLite store | 📋 pending |
| [T6-incident-correlate-hashchain](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T006-incident-correlate-hashchain.md) | Incident 模型、風暴聚合與時間線雜湊鏈 | ✅ done |
| [T7-memory-rag](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T007-memory-rag.md) | RAG 知識庫 memory/indexer + search | ✅ done |
| [T8-brain-providers-budget](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T008-brain-providers-budget.md) | LLM providers 子套件與 token 預算 | ✅ done |
| [T9-triage-schema-validator](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T009-triage-schema-validator.md) | 分診管線編排與 schema 驗證修復迴圈 | ✅ done |
| [T10-runbook-parse-approval](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T010-runbook-parse-approval.md) | runbook 解析與批准閘門語意 | 📋 pending |
| [T11-executor-package](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T011-executor-package.md) | ★ executor 頂層套件（runner + redaction） | ✅ done |
| [T12-interact-schedule](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T012-interact-schedule.md) | Telegram 決策層互動與排班升級鏈 | ✅ done |
| [T13-postmortem-actionitems](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T013-postmortem-actionitems.md) | postmortem 草稿與 action items 追蹤 | ✅ done |
| [T14-readapi](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T014-readapi.md) | UI 專用唯讀查詢 readapi | 📋 pending |
| [T15-evalkit](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T015-evalkit.md) | evalkit 評測工具與 prompt_version 追蹤 | 📋 pending |
| [T16-shadow-mode](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T016-shadow-mode.md) | Shadow Mode 全域旗標與管線整合 | 📋 pending |
| [T17-oncall-ui](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T017-oncall-ui.md) | oncall-ui 唯讀 Web 服務 | 📋 pending |
| [T18-deploy-docs](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T018-deploy-docs.md) | 上線部署文件與三服務佈建 | 📋 pending |
| [T19-e2e-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T019-e2e-integration.md) | 端到端整合測試（spec.md §5 全覆蓋） | 📋 pending |

**✅ done: 10 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 9**

> 自動生成於 2026-08-24 10:40
