# mindnav-codeagent

## 已實作功能

| 功能 |
|------|
| T001 - 環境建置與本地模型部署 (Ollama & LLM) |
| T002 - 本地 RAG 知識庫實作 (ChromaDB & AST) |
| T003 - 路由代理開發 (Router Agent) |
| T004 - LangGraph 多代理核心拓撲 (PM & Coder & Doc) |
| T005 - 聯網檢索工具整合 (Tavily) |
| T006 - Telegram 互動基礎建設 (Asyncio Polling) |
| T007 - Telegram 進階功能 (專案切換與按鈕互動) |
| T008 - 對話上下文管理 (Message Pruning) |
| T009 - 安全沙盒與指令限制 |
| T010 - Git Hook 代碼自動審查整合 (FastAPI & pre-commit) |
| T011 - 系統整合測試與壓力測試 |
| T012 - 部署手冊與 Docker 配置 |
| T013 - 統一推理接口與 LLM 資源池化 |
| T014 - 擴展性技能系統架構 (Skill System Architecture) |
| T015 - 模組化配置系統與主管代理設計 (Modular Config & Supervisor) |
| T016 - 分散式持久化與任務隊列擴展 (Distributed Persistence & Scaling) |
| T017 - 安全沙盒工具整合 (Security Sandbox Tool Integration) |
| T018 - RAG 自動增量同步監聽器 (watchdog based) |
| T019 - RAG 過期與版本化管理 (TTL & Versioning) |
| T020 - 記憶清理與對話重置工具 (Memory Manager) |
| T021 - 全系統功能驗證框架 (System Verification Framework) |
| T022 - ClawHub 擴展性技能整合 (ClawHub Integration) |
| T023 - Git 自動審計與原子提交流水線 (Git Audit Pipeline) |
| T024 - GitHub CI/CD 工作流自動化 (Manual-Controlled Pipeline) |
| T025 - 數據調研代理 (Research Agent) |
| T026 - 測試與質量保證代理 (QA Agent) |
| T027 - DevOps 自動化代理 (DevOps Agent) |
| T028 - 缺失 Shell Script 與 CI/CD 補全 |
| T029 - Graph.py 與 Import 路徑缺陷修復 |
| T030 - 驗證環境建置與記憶管理 AC 完成 |
| T031 - 補全整合測試腳本 Integration Test |
| T032 - Supervisor 路由與圖拓撲驗證測試 |
| T033 - 修復 README.md 檔名尾隨空格 |
| T034 - 修復驗證框架測試使其全部通過 |
| T035 - 環境變數配置與本地 LLM 端點驗證 |
| T036 - 實作手動強制同步指令 /sync_rag |
| T037 - 各 AC 未勾項目的驗收確認腳本 |
| T038 - 架構師代理 (Architect Agent) |
| T039 - 安全審計代理 (Security Agent) |
| T040 - 產品負責人代理 (Product Owner Agent) |
| T041 - Graph.py 節點拆分重構 |
| T042 - 統一所有節點為 Async 模式 |
| T043 - Supervisor 路由快取機制 |
| T044 - Integration Test Mock 補全 |
| T045 - verify_all.py 實質檢查補全 |
| T046 - SafeShell git 子指令過濾 |
| T047 - API Key 安全處理 |
| T048 - Config 重複讀取優化 |
| T049 - ChromaDB 初始化掃描優化 |
| T050 - ContextManager 改用 LLMFactory |
| T051 - 全面清查 Import 路徑 |
| T052 - verify_ac.py stub 檢查補全 |
| T053 - Coder Worker 實際 Enqueue 邏輯實作 |
| T054 - 跨 Session 記憶全文搜尋與 AI 摘要 |
| T055 - 任務完成後技能自動提煉 Pipeline |
| T056 - 技能相似度匹配與動態注入引擎 |
| T057 - 動態 System Prompt 分層組裝 |
| T058 - 技能安全門禁與版本管理 |
| T059 - 技能自動優化迴路 |
| T060 - 任務成功/失敗信號系統 |
| T061 - 跨 Agent 技能共用機制 |
| T062 - 技能退化偵測 |
| T063 - 人工 Feedback 迴路 |
| T064 - Nudge / Heartbeat 記憶維護 |
| 配置系統提示注入階層與 role-specific 目錄 |
| T066 - 動態任務拆解與平行執行機制 |
| T066A - 任務拆解引擎：Planner Node 與 Pydantic 模型 |
| T066B - 任務圖執行器：DAG 執行與 Send Fan-out |
| T066C - 向後相容整合：Graph 整合與 Hybrid 模式 |
| T067 - Agent System Prompt 搬移到 config/<role>/SOUL.md |
| T068 - Supervisor Graph Redis 持久化 Checkpointer |
| Frontend React 基礎架構 |
| REST API 標準化 |
| Session Browser |
| Logs Viewer |
| Config Editor |
| API Keys Manager |
| Analytics Dashboard |
| Worker Output Channel |
| Running Workers Dashboard |
| SQLite Kanban Schema |
| kanban_* Tool Interface |
| Task Board UI |
| Task Log File Tailing |
| Parent→Child Auto Promote |
| Failed Task + Crash Recovery |
| Skill Browser + Details UI |
| Skill Backend 強化 |
| kanban-auto-decompose Skill |
| T087 - Telegram Bot 指令擴充 |
| Rename frontend/ → frontend_api/ |
| Caddy container for React frontend (auto HTTPS) |
| Git History Dashboard |
| Sessions 狀態欄位 + Analytics 統計總覽 tab |
| Supervisor Workflow transitions 流程圖編輯器 |
| 前端主題系統（5 themes + persistence） |
| Agent Definitions 下拉選單 + Transitions 截斷修復 + 主題選單 highlight |
| 流程圖裁切 (已修復) + 佈景下拉選單無效 (持續調查) |
| 任務 T096-engine-notification-dispatch |
| 任務 T097-imboring-skill |
| 任務 T098-telegram-interactive-reply |
| 任務 T099-ac-verifier-node |
| 任務 T100-techspec-adr |
| 任務 T101-easy-first-task-sort |
| 任務 T102-token-budget-manager |
| 任務 T103-dynamic-iteration-limit |
| 任務 T104-agent-registry-description-routing |
| 任務 T105-permission-layer |
| 任務 T106-task-tool-child-session |
| 任務 T107-mode-switching-mention-routing |
| 任務 T108-opencode-config-integration |
| 任務 T109-file-tools-read-write-edit-patch |
| 任務 T110-search-tools-grep-glob |
| 任務 T111-todowrite-tool |
| 任務 T112-question-tool |
| 任務 T113-custom-tools-mcp-framework |
| 任務 T114-lsp-tool-experimental |
| 任務 T115-fix-shell-rce-git-injection |
| 任務 T116-fix-nameerror-redisvl |
| 任務 T117-lock-dependency-versions |
| 任務 T118-add-security-tests |
| 任務 T119-async-tools-chain-cache |
| 任務 T120-type-hints-pyproject-toml |
| 任務 T121-fix-pre-existing-test-failures |
| 任務 T122-product-landing-page |
| Prompt Layering 系統配置填充 |
| Prompt Layering 系統填充與優化 |
| 語意感知路由系統實作 |
| 統一錯誤處理與重試機制 |
| Agent 節點客製化實作 |
| ReviewGate 多類型審查擴展 |
| 工具推薦系統實作 |
| 動態並行度管理 |
| Workflow 執行追蹤與視覺化 |
| Agent 角色檔案內容前端編輯器 |
| 語意分類模型前端配置面板 |
| 路由規則跳過 LLM 前端開關 |
| 錯誤重試策略前端配置面板 |
| ReviewGate 審查閾值前端配置面板 |
| 工具推薦系統前端顯示面板 |
| 任務權重表前端配置面板 |
| Product Landing Page 功能更新（T123-T137 彙整） |
| 角色檔案版本歷史管理 |
| 配置錯誤防護機制 |
| Product Landing Page 更新（T139-T140 彙整） |
| Implement react-i18next for multi-language support |
| Implement lazy loading for translations using i18next-http-backend |

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
| | | |

## Task 列表

| # | 名稱 | 狀態 |
|---|------|------|
| [T1-env-setup](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T001-env-setup.md) | T001 - 環境建置與本地模型部署 (Ollama & LLM) | ✅ done |
| [T2-rag-impl](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T002-rag-impl.md) | T002 - 本地 RAG 知識庫實作 (ChromaDB & AST) | ✅ done |
| [T3-router-agent](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T003-router-agent.md) | T003 - 路由代理開發 (Router Agent) | ✅ done |
| [T4-langgraph-core](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T004-langgraph-core.md) | T004 - LangGraph 多代理核心拓撲 (PM & Coder & Doc) | ✅ done |
| [T5-web-search](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T005-web-search.md) | T005 - 聯網檢索工具整合 (Tavily) | ✅ done |
| [T6-tg-basic](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T006-tg-basic.md) | T006 - Telegram 互動基礎建設 (Asyncio Polling) | ✅ done |
| [T7-tg-advanced](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T007-tg-advanced.md) | T007 - Telegram 進階功能 (專案切換與按鈕互動) | ✅ done |
| [T8-context-mgmt](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T008-context-mgmt.md) | T008 - 對話上下文管理 (Message Pruning) | ✅ done |
| [T9-security](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T009-security.md) | T009 - 安全沙盒與指令限制 | ✅ done |
| [T10-git-hook](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T010-git-hook.md) | T010 - Git Hook 代碼自動審查整合 (FastAPI & pre-commit) | ✅ done |
| [T11-integration-test](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T011-integration-test.md) | T011 - 系統整合測試與壓力測試 | ✅ done |
| [T12-deployment](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T012-deployment.md) | T012 - 部署手冊與 Docker 配置 | ✅ done |
| [T13-llm-factory](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T013-llm-factory.md) | T013 - 統一推理接口與 LLM 資源池化 | ✅ done |
| [T14-skill-system](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T014-skill-system.md) | T014 - 擴展性技能系統架構 (Skill System Architecture) | ✅ done |
| [T15-modular-config](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T015-modular-config.md) | T015 - 模組化配置系統與主管代理設計 (Modular Config & Supervisor) | ✅ done |
| [T16-distributed-scaling](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T016-distributed-scaling.md) | T016 - 分散式持久化與任務隊列擴展 (Distributed Persistence & Scaling) | ✅ done |
| [T17-security-tool](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T017-security-tool.md) | T017 - 安全沙盒工具整合 (Security Sandbox Tool Integration) | ✅ done |
| [T18-rag-sync](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T018-rag-sync.md) | T018 - RAG 自動增量同步監聽器 (watchdog based) | ✅ done |
| [T19-rag-ttl](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T019-rag-ttl.md) | T019 - RAG 過期與版本化管理 (TTL & Versioning) | ✅ done |
| [T20-memory-mgmt](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T020-memory-mgmt.md) | T020 - 記憶清理與對話重置工具 (Memory Manager) | ✅ done |
| [T21-verification-framework](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T021-verification-framework.md) | T021 - 全系統功能驗證框架 (System Verification Framework) | ✅ done |
| [T22-clawhub-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T022-clawhub-integration.md) | T022 - ClawHub 擴展性技能整合 (ClawHub Integration) | ✅ done |
| [T23-git-audit](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T023-git-audit.md) | T023 - Git 自動審計與原子提交流水線 (Git Audit Pipeline) | ✅ done |
| [T24-ci-cd-automation](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T024-ci-cd-automation.md) | T024 - GitHub CI/CD 工作流自動化 (Manual-Controlled Pipeline) | ✅ done |
| [T25-research-agent](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T025-research-agent.md) | T025 - 數據調研代理 (Research Agent) | ✅ done |
| [T26-qa-agent](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T026-qa-agent.md) | T026 - 測試與質量保證代理 (QA Agent) | ✅ done |
| [T27-devops-agent](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T027-devops-agent.md) | T027 - DevOps 自動化代理 (DevOps Agent) | ✅ done |
| [T28-fix-scripts-cicd](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T028-fix-scripts-cicd.md) | T028 - 缺失 Shell Script 與 CI/CD 補全 | ✅ done |
| [T29-fix-graph-imports](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T029-fix-graph-imports.md) | T029 - Graph.py 與 Import 路徑缺陷修復 | ✅ done |
| [T30-complete-ac-verification](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T030-complete-ac-verification.md) | T030 - 驗證環境建置與記憶管理 AC 完成 | ✅ done |
| [T31-integration-test-script](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T031-integration-test-script.md) | T031 - 補全整合測試腳本 Integration Test | ✅ done |
| [T32-supervisor-routing-test](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T032-supervisor-routing-test.md) | T032 - Supervisor 路由與圖拓撲驗證測試 | ✅ done |
| [T33-fix-readme-filename](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T033-fix-readme-filename.md) | T033 - 修復 README.md 檔名尾隨空格 | ✅ done |
| [T34-fix-verification-tests](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T034-fix-verification-tests.md) | T034 - 修復驗證框架測試使其全部通過 | ✅ done |
| [T35-env-config-verification](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T035-env-config-verification.md) | T035 - 環境變數配置與本地 LLM 端點驗證 | ✅ done |
| [T36-sync-rag-command](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T036-sync-rag-command.md) | T036 - 實作手動強制同步指令 /sync_rag | ✅ done |
| [T37-ac-confirmation-script](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T037-ac-confirmation-script.md) | T037 - 各 AC 未勾項目的驗收確認腳本 | ✅ done |
| [T38-architect-agent](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T038-architect-agent.md) | T038 - 架構師代理 (Architect Agent) | ✅ done |
| [T39-security-agent](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T039-security-agent.md) | T039 - 安全審計代理 (Security Agent) | ✅ done |
| [T40-po-agent](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T040-po-agent.md) | T040 - 產品負責人代理 (Product Owner Agent) | ✅ done |
| [T41-graph-node-split](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T041-graph-node-split.md) | T041 - Graph.py 節點拆分重構 | ✅ done |
| [T42-unify-async-pattern](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T042-unify-async-pattern.md) | T042 - 統一所有節點為 Async 模式 | ✅ done |
| [T43-supervisor-route-cache](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T043-supervisor-route-cache.md) | T043 - Supervisor 路由快取機制 | ✅ done |
| [T44-integration-test-mock](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T044-integration-test-mock.md) | T044 - Integration Test Mock 補全 | ✅ done |
| [T45-verify-all-substantive-checks](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T045-verify-all-substantive-checks.md) | T045 - verify_all.py 實質檢查補全 | ✅ done |
| [T46-safeshell-git-subcommand](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T046-safeshell-git-subcommand.md) | T046 - SafeShell git 子指令過濾 | ✅ done |
| [T47-api-key-security](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T047-api-key-security.md) | T047 - API Key 安全處理 | ✅ done |
| [T48-config-redundant-load](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T048-config-redundant-load.md) | T048 - Config 重複讀取優化 | ✅ done |
| [T49-chromadb-init-optimize](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T049-chromadb-init-optimize.md) | T049 - ChromaDB 初始化掃描優化 | ✅ done |
| [T50-context-mgmt-llm-factory](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T050-context-mgmt-llm-factory.md) | T050 - ContextManager 改用 LLMFactory | ✅ done |
| [T51-audit-all-import-paths](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T051-audit-all-import-paths.md) | T051 - 全面清查 Import 路徑 | ✅ done |
| [T52-verify-ac-stub-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T052-verify-ac-stub-fix.md) | T052 - verify_ac.py stub 檢查補全 | ✅ done |
| [T53-worker-enqueue](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T053-worker-enqueue.md) | T053 - Coder Worker 實際 Enqueue 邏輯實作 | ✅ done |
| [T54-cross-session-memory-search](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T054-cross-session-memory-search.md) | T054 - 跨 Session 記憶全文搜尋與 AI 摘要 | ✅ done |
| [T55-auto-skill-extraction](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T055-auto-skill-extraction.md) | T055 - 任務完成後技能自動提煉 Pipeline | ✅ done |
| [T56-skill-matching-dispatch](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T056-skill-matching-dispatch.md) | T056 - 技能相似度匹配與動態注入引擎 | ✅ done |
| [T57-dynamic-prompt-layering](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T057-dynamic-prompt-layering.md) | T057 - 動態 System Prompt 分層組裝 | ✅ done |
| [T58-skill-governance-security](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T058-skill-governance-security.md) | T058 - 技能安全門禁與版本管理 | ✅ done |
| [T59-skill-self-improvement-loop](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T059-skill-self-improvement-loop.md) | T059 - 技能自動優化迴路 | ✅ done |
| [T60-task-outcome-signal](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T060-task-outcome-signal.md) | T060 - 任務成功/失敗信號系統 | ✅ done |
| [T61-cross-agent-skill-sharing](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T061-cross-agent-skill-sharing.md) | T061 - 跨 Agent 技能共用機制 | ✅ done |
| [T62-skill-regression-detection](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T062-skill-regression-detection.md) | T062 - 技能退化偵測 | ✅ done |
| [T63-user-feedback-loop](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T063-user-feedback-loop.md) | T063 - 人工 Feedback 迴路 | ✅ done |
| [T64-nudge-heartbeat-maintenance](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T064-nudge-heartbeat-maintenance.md) | T064 - Nudge / Heartbeat 記憶維護 | ✅ done |
| [T65-prompt-injection-config](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T065-prompt-injection-config.md) | 配置系統提示注入階層與 role-specific 目錄 | ✅ done |
| [T66-dynamic-task-decomposition](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T066-dynamic-task-decomposition.md) | T066 - 動態任務拆解與平行執行機制 | ✅ done |
| [T66A-planner-node](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T066A-planner-node.md) | T066A - 任務拆解引擎：Planner Node 與 Pydantic 模型 | ✅ done |
| [T66B-task-executor](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T066B-task-executor.md) | T066B - 任務圖執行器：DAG 執行與 Send Fan-out | ✅ done |
| [T66C-graph-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T066C-graph-integration.md) | T066C - 向後相容整合：Graph 整合與 Hybrid 模式 | ✅ done |
| [T67-agent-prompt-migration](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T067-agent-prompt-migration.md) | T067 - Agent System Prompt 搬移到 config/<role>/SOUL.md | ✅ done |
| [T68-redis-checkpointer-supervisor](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T068-redis-checkpointer-supervisor.md) | T068 - Supervisor Graph Redis 持久化 Checkpointer | ✅ done |
| [T69-frontend-react-architecture](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T069-frontend-react-architecture.md) | Frontend React 基礎架構 | ✅ done |
| [T70-rest-api-standardization](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T070-rest-api-standardization.md) | REST API 標準化 | ✅ done |
| [T71-session-browser](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T071-session-browser.md) | Session Browser | ✅ done |
| [T72-logs-viewer](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T072-logs-viewer.md) | Logs Viewer | ✅ done |
| [T73-config-editor](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T073-config-editor.md) | Config Editor | ✅ done |
| [T74-api-keys-manager](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T074-api-keys-manager.md) | API Keys Manager | ✅ done |
| [T75-analytics-dashboard](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T075-analytics-dashboard.md) | Analytics Dashboard | ✅ done |
| [T76-worker-output-channel](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T076-worker-output-channel.md) | Worker Output Channel | ✅ done |
| [T77-running-workers-dashboard](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T077-running-workers-dashboard.md) | Running Workers Dashboard | ✅ done |
| [T78-sqlite-kanban-schema](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T078-sqlite-kanban-schema.md) | SQLite Kanban Schema | ✅ done |
| [T79-kanban-tool-interface](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T079-kanban-tool-interface.md) | kanban_* Tool Interface | ✅ done |
| [T80-task-board-ui](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T080-task-board-ui.md) | Task Board UI | ✅ done |
| [T81-task-log-file-tailing](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T081-task-log-file-tailing.md) | Task Log File Tailing | ✅ done |
| [T82-parent-child-auto-promote](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T082-parent-child-auto-promote.md) | Parent→Child Auto Promote | ✅ done |
| [T83-failed-task-crash-recovery](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T083-failed-task-crash-recovery.md) | Failed Task + Crash Recovery | ✅ done |
| [T84-skill-browser-details-ui](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T084-skill-browser-details-ui.md) | Skill Browser + Details UI | ✅ done |
| [T85-skill-backend-enhancement](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T085-skill-backend-enhancement.md) | Skill Backend 強化 | ✅ done |
| [T86-kanban-auto-decompose-skill](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T086-kanban-auto-decompose-skill.md) | kanban-auto-decompose Skill | ✅ done |
| [T87-telegram-bot-commands](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T087-telegram-bot-commands.md) | T087 - Telegram Bot 指令擴充 | ✅ done |
| [T88-rename-frontend-to-frontend-api](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T088-rename-frontend-to-frontend-api.md) | Rename frontend/ → frontend_api/ | ✅ done |
| [T89-nginx-container-for-react-frontend](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T089-nginx-container-for-react-frontend.md) | Caddy container for React frontend (auto HTTPS) | ✅ done |
| [T90-git-history-dashboard](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T090-git-history-dashboard.md) | Git History Dashboard | ✅ done |
| [T91-session-analytics-improvements](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T091-session-analytics-improvements.md) | Sessions 狀態欄位 + Analytics 統計總覽 tab | ✅ done |
| [T92-transitions-flow-chart-editor](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T092-transitions-flow-chart-editor.md) | Supervisor Workflow transitions 流程圖編輯器 | ✅ done |
| [T93-frontend-theme-system](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T093-frontend-theme-system.md) | 前端主題系統（5 themes + persistence） | ✅ done |
| [T94-agent-dropdowns-graph-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T094-agent-dropdowns-graph-fix.md) | Agent Definitions 下拉選單 + Transitions 截斷修復 + 主題選單 highlight | ✅ done |
| [T95-graph-crop-theme-broken](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T095-graph-crop-theme-broken.md) | 流程圖裁切 (已修復) + 佈景下拉選單無效 (持續調查) | ✅ done |
| [T96-engine-notification-dispatch](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T096-engine-notification-dispatch.md) | 任務 T096-engine-notification-dispatch | ✅ done |
| [T97-imboring-skill](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T097-imboring-skill.md) | 任務 T097-imboring-skill | ✅ done |
| [T98-telegram-interactive-reply](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T098-telegram-interactive-reply.md) | 任務 T098-telegram-interactive-reply | ✅ done |
| [T99-ac-verifier-node](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T099-ac-verifier-node.md) | 任務 T099-ac-verifier-node | ✅ done |
| [T100-techspec-adr](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T100-techspec-adr.md) | 任務 T100-techspec-adr | ✅ done |
| [T101-easy-first-task-sort](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T101-easy-first-task-sort.md) | 任務 T101-easy-first-task-sort | ✅ done |
| [T102-token-budget-manager](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T102-token-budget-manager.md) | 任務 T102-token-budget-manager | ✅ done |
| [T103-dynamic-iteration-limit](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T103-dynamic-iteration-limit.md) | 任務 T103-dynamic-iteration-limit | ✅ done |
| [T104-agent-registry-description-routing](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T104-agent-registry-description-routing.md) | 任務 T104-agent-registry-description-routing | ✅ done |
| [T105-permission-layer](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T105-permission-layer.md) | 任務 T105-permission-layer | ✅ done |
| [T106-task-tool-child-session](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T106-task-tool-child-session.md) | 任務 T106-task-tool-child-session | ✅ done |
| [T107-mode-switching-mention-routing](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T107-mode-switching-mention-routing.md) | 任務 T107-mode-switching-mention-routing | ✅ done |
| [T108-opencode-config-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T108-opencode-config-integration.md) | 任務 T108-opencode-config-integration | ✅ done |
| [T109-file-tools-read-write-edit-patch](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T109-file-tools-read-write-edit-patch.md) | 任務 T109-file-tools-read-write-edit-patch | ✅ done |
| [T110-search-tools-grep-glob](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T110-search-tools-grep-glob.md) | 任務 T110-search-tools-grep-glob | ✅ done |
| [T111-todowrite-tool](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T111-todowrite-tool.md) | 任務 T111-todowrite-tool | ✅ done |
| [T112-question-tool](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T112-question-tool.md) | 任務 T112-question-tool | ✅ done |
| [T113-custom-tools-mcp-framework](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T113-custom-tools-mcp-framework.md) | 任務 T113-custom-tools-mcp-framework | ✅ done |
| [T114-lsp-tool-experimental](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T114-lsp-tool-experimental.md) | 任務 T114-lsp-tool-experimental | ✅ done |
| [T115-fix-shell-rce-git-injection](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T115-fix-shell-rce-git-injection.md) | 任務 T115-fix-shell-rce-git-injection | ✅ done |
| [T116-fix-nameerror-redisvl](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T116-fix-nameerror-redisvl.md) | 任務 T116-fix-nameerror-redisvl | ✅ done |
| [T117-lock-dependency-versions](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T117-lock-dependency-versions.md) | 任務 T117-lock-dependency-versions | ✅ done |
| [T118-add-security-tests](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T118-add-security-tests.md) | 任務 T118-add-security-tests | ✅ done |
| [T119-async-tools-chain-cache](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T119-async-tools-chain-cache.md) | 任務 T119-async-tools-chain-cache | ✅ done |
| [T120-type-hints-pyproject-toml](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T120-type-hints-pyproject-toml.md) | 任務 T120-type-hints-pyproject-toml | ✅ done |
| [T121-fix-pre-existing-test-failures](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T121-fix-pre-existing-test-failures.md) | 任務 T121-fix-pre-existing-test-failures | ✅ done |
| [T122-product-landing-page](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T122-product-landing-page.md) | 任務 T122-product-landing-page | ✅ done |
| [T123-prompt-layering-fill](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T123-prompt-layering-fill.md) | Prompt Layering 系統配置填充 | ✅ done |
| [T123-prompt-layering-fulfillment](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T123-prompt-layering-fulfillment.md) | Prompt Layering 系統填充與優化 | ✅ done |
| [T124-semantic-routing-system](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T124-semantic-routing-system.md) | 語意感知路由系統實作 | ✅ done |
| [T125-error-handling-retry-mechanism](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T125-error-handling-retry-mechanism.md) | 統一錯誤處理與重試機制 | ✅ done |
| [T126-agent-node-customization](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T126-agent-node-customization.md) | Agent 節點客製化實作 | ✅ done |
| [T127-reviewgate-extension](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T127-reviewgate-extension.md) | ReviewGate 多類型審查擴展 | ✅ done |
| [T128-tool-recommendation-system](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T128-tool-recommendation-system.md) | 工具推薦系統實作 | ✅ done |
| [T129-dynamic-parallelism-management](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T129-dynamic-parallelism-management.md) | 動態並行度管理 | ✅ done |
| [T130-workflow-tracing-visualization](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T130-workflow-tracing-visualization.md) | Workflow 執行追蹤與視覺化 | ✅ done |
| [T131-agent-role-file-editor](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T131-agent-role-file-editor.md) | Agent 角色檔案內容前端編輯器 | ✅ done |
| [T132-semantic-classifier-config-panel](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T132-semantic-classifier-config-panel.md) | 語意分類模型前端配置面板 | ✅ done |
| [T133-rule-based-routing-toggle](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T133-rule-based-routing-toggle.md) | 路由規則跳過 LLM 前端開關 | ✅ done |
| [T134-error-handling-config-panel](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T134-error-handling-config-panel.md) | 錯誤重試策略前端配置面板 | ✅ done |
| [T135-reviewgate-threshold-config-panel](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T135-reviewgate-threshold-config-panel.md) | ReviewGate 審查閾值前端配置面板 | ✅ done |
| [T136-tool-recommendation-display-panel](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T136-tool-recommendation-display-panel.md) | 工具推薦系統前端顯示面板 | ✅ done |
| [T137-task-weights-config-panel](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T137-task-weights-config-panel.md) | 任務權重表前端配置面板 | ✅ done |
| [T138-product-landing-page-update](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T138-product-landing-page-update.md) | Product Landing Page 功能更新（T123-T137 彙整） | ✅ done |
| [T139-role-file-version-history](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T139-role-file-version-history.md) | 角色檔案版本歷史管理 | ✅ done |
| [T140-config-error-protection](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T140-config-error-protection.md) | 配置錯誤防護機制 | ✅ done |
| [T141-product-landing-page-update-v2](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T141-product-landing-page-update-v2.md) | Product Landing Page 更新（T139-T140 彙整） | ✅ done |
| [T142-i18next-refactor](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T142-i18next-refactor.md) | Implement react-i18next for multi-language support | ✅ done |
| [T143-i18n-lazy-loading](https://github.com/gentoobreaking/ai-tasks/blob/main/mindnav-codeagent/tasks/T143-i18n-lazy-loading.md) | Implement lazy loading for translations using i18next-http-backend | ✅ done |

**✅ done: 147 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 0**

> 自動生成於 2026-06-12 04:32
