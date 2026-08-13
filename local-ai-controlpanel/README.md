# local-ai-controlpanel

## 已實作功能

| 功能 |
|------|
| Tauri scaffold（UI-1）：Tauri v2 + 薄 Rust commands + capabilities whitelist |
| Terminal 視覺基底（UI-2）：暗色主題 + monospace + layout |
| SSE client + Task 列表 + 事件串流（UI-3） |
| 底部輸入 + 中斷 + 命令面板（UI-4） |
| Repo scaffold（Phase 1）：monorepo 結構 + Control Plane 骨架 |
| SQLite schema + Task model + Task Manager（Phase 1） |
| State Machine（Phase 1）：Task 狀態機與轉移管制 |
| Control Plane API（Phase 1）：Fastify REST + SSE（§45.5 契約） |
| CLI（Phase 1）：acp 指令集（§29） |
| Policy Engine（Phase 2）：YAML policies + 知識政策 + 決策評估 |
| Artifact Controller（Phase 2）：patch 驗證 / apply / rollback |
| Verification Engine + Sandbox Interface/Registry（Phase 2，2a） |
| seatbelt（sandbox-exec）adapter（Phase 2，2c）— macOS 預設 |
| bwrap（bubblewrap）adapter（Phase 2，2b）— Linux 預設 |
| Shuru（MicroVM）adapter（Phase 2，2e）— high-risk 可選 |

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
| [T16-sandbox-switch-check](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T016-sandbox-switch-check.md) | Sandbox 可切換執行 + sandbox check + Matrix 測試（Phase 2，2d/2f） | |
| [T17-research-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T017-research-engine.md) | Research Engine（Phase 3）：Python service + 四種 retriever | |
| [T18-evidence-bundle](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T018-evidence-bundle.md) | Evidence model + Evidence Bundle + Shaping（Phase 3） | |
| [T19-evidence-gate](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T019-evidence-gate.md) | Evidence Gate（Phase 3）：兩階段評估 + 降級政策 + 卡死防護 | |
| [T20-reflection-retry](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T020-reflection-retry.md) | Reflection + Retry（Phase 4）：失敗分類器 + 重試政策 | |
| [T21-pi-worker](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T021-pi-worker.md) | Worker Interface + Pi Worker + llama.cpp 串接（Phase 1） | |
| [T22-worker-registry](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T022-worker-registry.md) | Worker Registry / Router（Phase 1）：註冊與選派 | |
| [T23-e2e-test](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T023-e2e-test.md) | 第一個 E2E Test（Phase 4 收尾）：Python repo + 有/無 Research 對照（§40） | |
| [T24-benchmark](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T024-benchmark.md) | Benchmark harness（Phase 5）：50 tasks + Baseline A–F + CP Gain | |
| [T25-ui-sandbox-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T025-ui-sandbox-integration.md) | UI-5：sandbox 整合顯示 + approve 流程（§45.6） | |
| [T26-ui-packaging](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T026-ui-packaging.md) | UI-6：打包 + Control Plane 自動啟動/附著（§45.6） | |

## Task 列表

| # | 名稱 | 狀態 |
|---|------|------|
| [T1-tauri-scaffold](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T001-tauri-scaffold.md) | Tauri scaffold（UI-1）：Tauri v2 + 薄 Rust commands + capabilities whitelist | ✅ done |
| [T2-terminal-visual](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T002-terminal-visual.md) | Terminal 視覺基底（UI-2）：暗色主題 + monospace + layout | ✅ done |
| [T3-sse-stream-client](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T003-sse-stream-client.md) | SSE client + Task 列表 + 事件串流（UI-3） | ✅ done |
| [T4-input-command-palette](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T004-input-command-palette.md) | 底部輸入 + 中斷 + 命令面板（UI-4） | ✅ done |
| [T5-repo-scaffold](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T005-repo-scaffold.md) | Repo scaffold（Phase 1）：monorepo 結構 + Control Plane 骨架 | ✅ done |
| [T6-sqlite-task-model](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T006-sqlite-task-model.md) | SQLite schema + Task model + Task Manager（Phase 1） | ✅ done |
| [T7-state-machine](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T007-state-machine.md) | State Machine（Phase 1）：Task 狀態機與轉移管制 | ✅ done |
| [T8-control-plane-api](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T008-control-plane-api.md) | Control Plane API（Phase 1）：Fastify REST + SSE（§45.5 契約） | ✅ done |
| [T9-cli](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T009-cli.md) | CLI（Phase 1）：acp 指令集（§29） | ✅ done |
| [T10-policy-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T010-policy-engine.md) | Policy Engine（Phase 2）：YAML policies + 知識政策 + 決策評估 | ✅ done |
| [T11-artifact-controller](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T011-artifact-controller.md) | Artifact Controller（Phase 2）：patch 驗證 / apply / rollback | ✅ done |
| [T12-verification-sandbox-interface](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T012-verification-sandbox-interface.md) | Verification Engine + Sandbox Interface/Registry（Phase 2，2a） | ✅ done |
| [T13-seatbelt-sandbox](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T013-seatbelt-sandbox.md) | seatbelt（sandbox-exec）adapter（Phase 2，2c）— macOS 預設 | ✅ done |
| [T14-bwrap-sandbox](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T014-bwrap-sandbox.md) | bwrap（bubblewrap）adapter（Phase 2，2b）— Linux 預設 | ✅ done |
| [T15-shuru-sandbox](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T015-shuru-sandbox.md) | Shuru（MicroVM）adapter（Phase 2，2e）— high-risk 可選 | ✅ done |
| [T16-sandbox-switch-check](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T016-sandbox-switch-check.md) | Sandbox 可切換執行 + sandbox check + Matrix 測試（Phase 2，2d/2f） | 📋 pending |
| [T17-research-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T017-research-engine.md) | Research Engine（Phase 3）：Python service + 四種 retriever | 📋 pending |
| [T18-evidence-bundle](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T018-evidence-bundle.md) | Evidence model + Evidence Bundle + Shaping（Phase 3） | 📋 pending |
| [T19-evidence-gate](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T019-evidence-gate.md) | Evidence Gate（Phase 3）：兩階段評估 + 降級政策 + 卡死防護 | 📋 pending |
| [T20-reflection-retry](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T020-reflection-retry.md) | Reflection + Retry（Phase 4）：失敗分類器 + 重試政策 | 📋 pending |
| [T21-pi-worker](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T021-pi-worker.md) | Worker Interface + Pi Worker + llama.cpp 串接（Phase 1） | 📋 pending |
| [T22-worker-registry](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T022-worker-registry.md) | Worker Registry / Router（Phase 1）：註冊與選派 | 📋 pending |
| [T23-e2e-test](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T023-e2e-test.md) | 第一個 E2E Test（Phase 4 收尾）：Python repo + 有/無 Research 對照（§40） | 📋 pending |
| [T24-benchmark](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T024-benchmark.md) | Benchmark harness（Phase 5）：50 tasks + Baseline A–F + CP Gain | 📋 pending |
| [T25-ui-sandbox-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T025-ui-sandbox-integration.md) | UI-5：sandbox 整合顯示 + approve 流程（§45.6） | 📋 pending |
| [T26-ui-packaging](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T026-ui-packaging.md) | UI-6：打包 + Control Plane 自動啟動/附著（§45.6） | 📋 pending |

**✅ done: 15 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 11**

> 自動生成於 2026-08-13 17:42
