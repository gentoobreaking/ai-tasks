# 📅 Daily Dashboard - 2026-08-24

> 最後更新: 2026-08-24 14:16 · 自動生成

---

## 🆕 今日新增任務

| 專案 | 任務 | 標題 |
| -- | -- | -- |
| ai-oncall | [T001-gate-skeleton-proto](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T001-gate-skeleton-proto.md) | oncall-gate 骨架與 proto 契約 |
| ai-oncall | [T002-ingest-auth-idempotency](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T002-ingest-auth-idempotency.md) | webhook 接收：認證、冪等、正規化 |
| ai-oncall | [T003-collect-fanout](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T003-collect-fanout.md) | context 收集器 fan-out |
| ai-oncall | [T004-tgtransport](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T004-tgtransport.md) | Telegram 傳輸層 tgtransport |
| ai-oncall | [T005-core-skeleton](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T005-core-skeleton.md) | oncall-core 骨架、gRPC servicer 與 SQLite store |
| ai-oncall | [T006-incident-correlate-hashchain](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T006-incident-correlate-hashchain.md) | Incident 模型、風暴聚合與時間線雜湊鏈 |
| ai-oncall | [T007-memory-rag](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T007-memory-rag.md) | RAG 知識庫 memory/indexer + search |
| ai-oncall | [T008-brain-providers-budget](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T008-brain-providers-budget.md) | LLM providers 子套件與 token 預算 |
| ai-oncall | [T009-triage-schema-validator](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T009-triage-schema-validator.md) | 分診管線編排與 schema 驗證修復迴圈 |
| ai-oncall | [T010-runbook-parse-approval](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T010-runbook-parse-approval.md) | runbook 解析與批准閘門語意 |
| ai-oncall | [T011-executor-package](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T011-executor-package.md) | ★ executor 頂層套件（runner + redaction） |
| ai-oncall | [T012-interact-schedule](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T012-interact-schedule.md) | Telegram 決策層互動與排班升級鏈 |
| ai-oncall | [T013-postmortem-actionitems](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T013-postmortem-actionitems.md) | postmortem 草稿與 action items 追蹤 |
| ai-oncall | [T014-readapi](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T014-readapi.md) | UI 專用唯讀查詢 readapi |
| ai-oncall | [T015-evalkit](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T015-evalkit.md) | evalkit 評測工具與 prompt_version 追蹤 |
| ai-oncall | [T016-shadow-mode](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T016-shadow-mode.md) | Shadow Mode 全域旗標與管線整合 |
| ai-oncall | [T017-oncall-ui](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T017-oncall-ui.md) | oncall-ui 唯讀 Web 服務 |
| ai-oncall | [T018-deploy-docs](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T018-deploy-docs.md) | 上線部署文件與三服務佈建 |
| ai-oncall | [T019-e2e-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T019-e2e-integration.md) | 端到端整合測試（spec.md §5 全覆蓋） |
| ai-oncall | [T020-gate-grpc-server](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T020-gate-grpc-server.md) | gate gRPC server 接線（DeliverNotification/CollectContext/tgtransport） |
| ai-oncall | [T021-core-approval-executor-wiring](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T021-core-approval-executor-wiring.md) | core 批准→執行編排接線（ActionCallback → ApprovalGate → ExecutorRunner） |
| digital-twin | [T090-fix-ci-pyright-and-lockfile](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T090-fix-ci-pyright-and-lockfile.md) | 修復 CI 紅燈 — pyright 歸零與 uv.lock 同步 |
| digital-twin | [T091-python-version-contract](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T091-python-version-contract.md) | Python 版本契約統一（requires-python 升 3.11 或降級 asyncio.timeout） |
| digital-twin | [T092-webhook-secret-enforce](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T092-webhook-secret-enforce.md) | Telegram webhook secret 強制化（生產模式 fail-fast） |
| digital-twin | [T093-redis-stream-reliability](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T093-redis-stream-reliability.md) | Redis Stream 可靠度 — pending 救援、maxlen 上限與 graceful shutdown |
| digital-twin | [T094-rag-core-test-coverage](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T094-rag-core-test-coverage.md) | RAG 核心測試補齊（indexer.py / searcher.py） |
| digital-twin | [T095-unify-http-client](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T095-unify-http-client.md) | embedding.py HTTP 呼叫遷移至 httpx（接入既有韌性層） |
| digital-twin | [T096-logging-and-silent-except](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T096-logging-and-silent-except.md) | 日誌收斂遺留 — print 清理與靜默 except 補紀錄 |
| digital-twin | [T097-repo-hygiene](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T097-repo-hygiene.md) | repo 衛生 — 遺留檔清理與 current_status 指標校正 |
| digital-twin | [T098-pyproject-extras-dedup](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T098-pyproject-extras-dedup.md) | pyproject extras 去重 — prod 移除重複的 dependencies 複本 |
| digital-twin | [T099-scheduler-further-split](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T099-scheduler-further-split.md) | scheduler.py 二階拆分 — 任務挑選與 process_task 流程獨立 |
| slo-sentinel | [T001-project-scaffold](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T001-project-scaffold.md) | 專案骨架與 Go 模組初始化 |
| slo-sentinel | [T002-spec-parser](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T002-spec-parser.md) | SLO 定義解析模組 internal/spec |
| slo-sentinel | [T003-query-source](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T003-query-source.md) | Prometheus 查詢來源層 internal/query |
| slo-sentinel | [T004-store-sqlite](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T004-store-sqlite.md) | SQLite 狀態儲存層 internal/store |
| slo-sentinel | [T005-catalog-loader](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T005-catalog-loader.md) | 感測目錄載入器 internal/catalog |
| slo-sentinel | [T006-budget-eta-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T006-budget-eta-engine.md) | 多視野 ETA 引擎 internal/budget |
| slo-sentinel | [T007-capacity-sensor](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T007-capacity-sensor.md) | 容量感測引擎 internal/capacity |
| slo-sentinel | [T008-alert-notify](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T008-alert-notify.md) | Telegram 通知層 internal/alert |
| slo-sentinel | [T009-daemon-main](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T009-daemon-main.md) | daemon 主迴圈與 CLI cmd/sentinel |
| slo-sentinel | [T010-billing-adapters](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T010-billing-adapters.md) | 帳務 adapter internal/billing（actual 校準模式，選配） |
| slo-sentinel | [T011-cost-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T011-cost-engine.md) | 成本預測與報表 internal/cost |
| slo-sentinel | [T012-waste-cloud-provider](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T012-waste-cloud-provider.md) | 瘦身掃描器與雲端 provider internal/waste |
| slo-sentinel | [T013-waste-k8s-provider](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T013-waste-k8s-provider.md) | K8s/OpenShift provider（K1–K4 感測） |
| slo-sentinel | [T014-waste-standalone-provider](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T014-waste-standalone-provider.md) | Standalone server provider（S1–S3 感測） |
| slo-sentinel | [T015-waste-tracker](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T015-waste-tracker.md) | 候選清單生命週期 tracker |
| slo-sentinel | [T016-sentinel-ui](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T016-sentinel-ui.md) | sentinel-ui 唯讀 Web 服務 cmd/sentinel-ui |
| slo-sentinel | [T017-deploy-docs](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T017-deploy-docs.md) | 上線部署文件與 systemd/container 佈建 |
| slo-sentinel | [T018-e2e-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T018-e2e-integration.md) | 端到端整合測試（成功標準全覆蓋） |
| slo-sentinel | [T019-ci-budget-gate](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T019-ci-budget-gate.md) | 成本/預算 CI 整合——notify 模式（F6 Phase 1） |
| slo-sentinel | [T020-oncall-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T020-oncall-integration.md) | 容量預警接 ai-oncall 分診閉環（F10） |
| slo-sentinel | [T021-freeze-enforce](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T021-freeze-enforce.md) | 成本/預算 CI 部署閘門——enforce 模式（F6 Phase 2） |
| slo-sentinel | [T022-pricing-catalog](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T022-pricing-catalog.md) | 價目表目錄 internal/pricing（estimate 模式主路徑） |
| tw-quant-pickup | [T044-stock-fair-value-cmoney4](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T044-stock-fair-value-cmoney4.md) | 個股 CMoney 四法合理價計算器 |
| tw-quant-pickup | [T045-etf-fair-value](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T045-etf-fair-value.md) | ETF 兩法合理價計算器 |
| tw-quant-pickup | [T046-fair-value-md-report](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T046-fair-value-md-report.md) | 合理價 Markdown 報表匯出 |

---

## ✅ 今日完成任務

| 專案 | 任務 | 標題 |
| -- | -- | -- |
| ai-oncall | [T001-gate-skeleton-proto](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T001-gate-skeleton-proto.md) | oncall-gate 骨架與 proto 契約 |
| ai-oncall | [T002-ingest-auth-idempotency](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T002-ingest-auth-idempotency.md) | webhook 接收：認證、冪等、正規化 |
| ai-oncall | [T003-collect-fanout](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T003-collect-fanout.md) | context 收集器 fan-out |
| ai-oncall | [T004-tgtransport](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T004-tgtransport.md) | Telegram 傳輸層 tgtransport |
| ai-oncall | [T005-core-skeleton](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T005-core-skeleton.md) | oncall-core 骨架、gRPC servicer 與 SQLite store |
| ai-oncall | [T006-incident-correlate-hashchain](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T006-incident-correlate-hashchain.md) | Incident 模型、風暴聚合與時間線雜湊鏈 |
| ai-oncall | [T007-memory-rag](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T007-memory-rag.md) | RAG 知識庫 memory/indexer + search |
| ai-oncall | [T008-brain-providers-budget](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T008-brain-providers-budget.md) | LLM providers 子套件與 token 預算 |
| ai-oncall | [T009-triage-schema-validator](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T009-triage-schema-validator.md) | 分診管線編排與 schema 驗證修復迴圈 |
| ai-oncall | [T010-runbook-parse-approval](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T010-runbook-parse-approval.md) | runbook 解析與批准閘門語意 |
| ai-oncall | [T011-executor-package](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T011-executor-package.md) | ★ executor 頂層套件（runner + redaction） |
| ai-oncall | [T012-interact-schedule](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T012-interact-schedule.md) | Telegram 決策層互動與排班升級鏈 |
| ai-oncall | [T013-postmortem-actionitems](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T013-postmortem-actionitems.md) | postmortem 草稿與 action items 追蹤 |
| ai-oncall | [T014-readapi](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T014-readapi.md) | UI 專用唯讀查詢 readapi |
| ai-oncall | [T015-evalkit](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T015-evalkit.md) | evalkit 評測工具與 prompt_version 追蹤 |
| ai-oncall | [T016-shadow-mode](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T016-shadow-mode.md) | Shadow Mode 全域旗標與管線整合 |
| ai-oncall | [T017-oncall-ui](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T017-oncall-ui.md) | oncall-ui 唯讀 Web 服務 |
| ai-oncall | [T018-deploy-docs](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T018-deploy-docs.md) | 上線部署文件與三服務佈建 |
| ai-oncall | [T019-e2e-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T019-e2e-integration.md) | 端到端整合測試（spec.md §5 全覆蓋） |
| ai-oncall | [T020-gate-grpc-server](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T020-gate-grpc-server.md) | gate gRPC server 接線（DeliverNotification/CollectContext/tgtransport） |
| ai-oncall | [T021-core-approval-executor-wiring](https://github.com/gentoobreaking/ai-tasks/blob/main/ai-oncall/tasks/T021-core-approval-executor-wiring.md) | core 批准→執行編排接線（ActionCallback → ApprovalGate → ExecutorRunner） |
| digital-twin | [T089-pi-integration-and-quality-optimization](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T089-pi-integration-and-quality-optimization.md) | pi Agent 整合反饋閉環 ＋ 全專案品質優化（env 收斂/模組拆分/測試隔離） |
| digital-twin | [T090-fix-ci-pyright-and-lockfile](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T090-fix-ci-pyright-and-lockfile.md) | 修復 CI 紅燈 — pyright 歸零與 uv.lock 同步 |
| digital-twin | [T091-python-version-contract](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T091-python-version-contract.md) | Python 版本契約統一（requires-python 升 3.11 或降級 asyncio.timeout） |
| digital-twin | [T092-webhook-secret-enforce](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T092-webhook-secret-enforce.md) | Telegram webhook secret 強制化（生產模式 fail-fast） |
| digital-twin | [T093-redis-stream-reliability](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T093-redis-stream-reliability.md) | Redis Stream 可靠度 — pending 救援、maxlen 上限與 graceful shutdown |
| digital-twin | [T094-rag-core-test-coverage](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T094-rag-core-test-coverage.md) | RAG 核心測試補齊（indexer.py / searcher.py） |
| digital-twin | [T095-unify-http-client](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T095-unify-http-client.md) | embedding.py HTTP 呼叫遷移至 httpx（接入既有韌性層） |
| digital-twin | [T096-logging-and-silent-except](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T096-logging-and-silent-except.md) | 日誌收斂遺留 — print 清理與靜默 except 補紀錄 |
| digital-twin | [T097-repo-hygiene](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T097-repo-hygiene.md) | repo 衛生 — 遺留檔清理與 current_status 指標校正 |
| digital-twin | [T098-pyproject-extras-dedup](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T098-pyproject-extras-dedup.md) | pyproject extras 去重 — prod 移除重複的 dependencies 複本 |
| digital-twin | [T099-scheduler-further-split](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T099-scheduler-further-split.md) | scheduler.py 二階拆分 — 任務挑選與 process_task 流程獨立 |
| free-ai-router | [T101-fix-api-key-paste](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T101-fix-api-key-paste.md) | 修正 Settings/Wizard API key 輸入無法貼上的問題 |
| free-ai-router | [T102-api-key-live-refresh](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T102-api-key-live-refresh.md) | API key 即時刷新（免重啟生效） |
| free-ai-router | [T103-table-scroll-pgkeys](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T103-table-scroll-pgkeys.md) | 主畫面表格滾動視窗與 PgUp/PgDn 修正 |
| free-ai-router | [T104-openrouter-empty-filter](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T104-openrouter-empty-filter.md) | OpenRouter 模型清單為空的過濾修復 |
| free-ai-router | [T105-provider-id-prefix-convention](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T105-provider-id-prefix-convention.md) | Provider ID 前綴慣例修正（消除幽靈 provider） |
| free-ai-router | [T106-add-four-providers](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T106-add-four-providers.md) | 新增 HuggingFace、OpenAI、Claude (Anthropic)、DeepSeek providers |
| free-ai-router | [T107-provider-metadata-gaps](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T107-provider-metadata-gaps.md) | 補齊 pollinations/kiro/clawlabs metadata 與 clawlabs key fallback |
| free-ai-router | [T108-redact-config-api-keys](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T108-redact-config-api-keys.md) | GET /api/config 回傳明文 API key（安全性） |
| free-ai-router | [T109-pingbody-consolidation](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T109-pingbody-consolidation.md) | ping body 統一為 json.Marshal 單一實作 |
| free-ai-router | [T110-cli-tests-fix-hermetic](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T110-cli-tests-fix-hermetic.md) | 修復 internal/cli 失效測試並隔離真實 HOME |
| free-ai-router | [T111-updatemodel-lock-pattern](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T111-updatemodel-lock-pattern.md) | main.go 啟動期 API key 解析改走 UpdateModel |
| free-ai-router | [T112-tui-ux-improvements](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T112-tui-ux-improvements.md) | TUI UX 改善：READY 隱藏提示、Settings 狀態保留、渲染效能 |
| free-ai-router | [T113-retry-after-cooldown](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T113-retry-after-cooldown.md) | router 429 冷卻尊重上游 Retry-After |
| free-ai-router | [T114-race-detector-adoption](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T114-race-detector-adoption.md) | 加入 test-race/vuln 目標並修復 race detector 抓到的 data race |
| free-ai-router | [T115-discovered-model-label](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T115-discovered-model-label.md) | 自動發現模型的 Model 欄空白（缺 Label） |
| slo-sentinel | [T001-project-scaffold](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T001-project-scaffold.md) | 專案骨架與 Go 模組初始化 |
| slo-sentinel | [T002-spec-parser](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T002-spec-parser.md) | SLO 定義解析模組 internal/spec |
| slo-sentinel | [T003-query-source](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T003-query-source.md) | Prometheus 查詢來源層 internal/query |
| slo-sentinel | [T004-store-sqlite](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T004-store-sqlite.md) | SQLite 狀態儲存層 internal/store |
| slo-sentinel | [T005-catalog-loader](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T005-catalog-loader.md) | 感測目錄載入器 internal/catalog |
| slo-sentinel | [T006-budget-eta-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T006-budget-eta-engine.md) | 多視野 ETA 引擎 internal/budget |
| slo-sentinel | [T007-capacity-sensor](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T007-capacity-sensor.md) | 容量感測引擎 internal/capacity |
| slo-sentinel | [T008-alert-notify](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T008-alert-notify.md) | Telegram 通知層 internal/alert |
| slo-sentinel | [T009-daemon-main](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T009-daemon-main.md) | daemon 主迴圈與 CLI cmd/sentinel |
| slo-sentinel | [T010-billing-adapters](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T010-billing-adapters.md) | 帳務 adapter internal/billing（actual 校準模式，選配） |
| slo-sentinel | [T012-waste-cloud-provider](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T012-waste-cloud-provider.md) | 瘦身掃描器與雲端 provider internal/waste |
| slo-sentinel | [T013-waste-k8s-provider](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T013-waste-k8s-provider.md) | K8s/OpenShift provider（K1–K4 感測） |
| slo-sentinel | [T014-waste-standalone-provider](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T014-waste-standalone-provider.md) | Standalone server provider（S1–S3 感測） |
| slo-sentinel | [T015-waste-tracker](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T015-waste-tracker.md) | 候選清單生命週期 tracker |
| slo-sentinel | [T016-sentinel-ui](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T016-sentinel-ui.md) | sentinel-ui 唯讀 Web 服務 cmd/sentinel-ui |
| slo-sentinel | [T017-deploy-docs](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T017-deploy-docs.md) | 上線部署文件與 systemd/container 佈建 |
| slo-sentinel | [T018-e2e-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T018-e2e-integration.md) | 端到端整合測試（成功標準全覆蓋） |
| tw-quant-pickup | [T034-non-business-day-fallback](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T034-non-business-day-fallback.md) | 非營業日查詢自動回退至最近營業日（API / CLI / 前端） |
| tw-quant-pickup | [T035-frontend-security-consistency](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T035-frontend-security-consistency.md) | 前端安全與一致性修復（XSS / 死登入邏輯 / fetch 統一） |
| tw-quant-pickup | [T036-frontend-ux-improvements](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T036-frontend-ux-improvements.md) | 前端 UX 改善（日期、設定生效、類型區分、可點擊代號） |
| tw-quant-pickup | [T037-frontend-i18n](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T037-frontend-i18n.md) | 前端 UI 中文化 |
| tw-quant-pickup | [T038-frontend-test-infra](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T038-frontend-test-infra.md) | 前端測試基礎建設 |
| tw-quant-pickup | [T039-api-security](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T039-api-security.md) | API 安全強化（認證 / 限流 / 指標端點） |
| tw-quant-pickup | [T040-backend-modularization](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T040-backend-modularization.md) | 後端模組化重構（api routers + pipeline 套件） |
| tw-quant-pickup | [T041-frontend-types-and-stock-valuation](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T041-frontend-types-and-stock-valuation.md) | 前端型別強化與個股詳情估值補全 |
| tw-quant-pickup | [T042-react-query-adoption](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T042-react-query-adoption.md) | react-query 導入 |
| tw-quant-pickup | [T043-ci-and-repo-hygiene](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T043-ci-and-repo-hygiene.md) | CI 前端 job 與 repo 衛生 |
| tw-quant-pickup | [T044-stock-fair-value-cmoney4](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T044-stock-fair-value-cmoney4.md) | 個股 CMoney 四法合理價計算器 |
| tw-quant-pickup | [T045-etf-fair-value](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T045-etf-fair-value.md) | ETF 兩法合理價計算器 |
| tw-quant-pickup | [T046-fair-value-md-report](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-pickup/tasks/T046-fair-value-md-report.md) | 合理價 Markdown 報表匯出 |

---

## 🔥 待處理高優先級

_無_

---

## 🔄 進行中

| 專案 | 任務 | 標題 | 優先 |
| -- | -- | -- | -- |
| gold-analysis-advanced | [T001](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-analysis-advanced/tasks/T001.md) | 機器學習模型開發 | low |

---

## 📋 所有待處理任務

| 專案 | 任務 | 標題 | 優先 |
| -- | -- | -- | -- |
| gold-analysis-advanced | [T002](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-analysis-advanced/tasks/T002.md) | ML 模型整合與優化 | low |
| gold-analysis-advanced | [T004](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-analysis-advanced/tasks/T004.md) | 實盤交易對接 | low |
| slo-sentinel | [T019-ci-budget-gate](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T019-ci-budget-gate.md) | 成本/預算 CI 整合——notify 模式（F6 Phase 1） | low |
| slo-sentinel | [T020-oncall-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T020-oncall-integration.md) | 容量預警接 ai-oncall 分診閉環（F10） | low |
| slo-sentinel | [T021-freeze-enforce](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T021-freeze-enforce.md) | 成本/預算 CI 部署閘門——enforce 模式（F6 Phase 2） | low |

---

## 🔗 快速連結

- [完整專案視圖 → PROJECTS.md](https://github.com/gentoobreaking/ai-tasks/blob/main/PROJECTS.md)
- [每日儀表板 → DAILY.md](https://github.com/gentoobreaking/ai-tasks/blob/main/DAILY.md)
- [Tasks 根目錄](https://github.com/gentoobreaking/ai-tasks/tree/main)
- 腳本: `scripts/update_projects.py` · `scripts/update_daily.py`

---
_自動生成，請勿手動編輯_
