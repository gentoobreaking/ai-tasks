# slo-sentinel

## 已實作功能

| 功能 |
|------|
| 專案骨架與 Go 模組初始化 |
| SLO 定義解析模組 internal/spec |
| Prometheus 查詢來源層 internal/query |
| SQLite 狀態儲存層 internal/store |
| 感測目錄載入器 internal/catalog |
| 多視野 ETA 引擎 internal/budget |
| 容量感測引擎 internal/capacity |
| Telegram 通知層 internal/alert |
| daemon 主迴圈與 CLI cmd/sentinel |
| 帳務 adapter internal/billing（actual 校準模式，選配） |
| 成本預測與報表 internal/cost |
| 瘦身掃描器與雲端 provider internal/waste |
| K8s/OpenShift provider（K1–K4 感測） |
| Standalone server provider（S1–S3 感測） |
| 候選清單生命週期 tracker |
| sentinel-ui 唯讀 Web 服務 cmd/sentinel-ui |
| 上線部署文件與 systemd/container 佈建 |
| 端到端整合測試（成功標準全覆蓋） |
| 價目表目錄 internal/pricing（estimate 模式主路徑） |

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
| [T19-ci-budget-gate](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T019-ci-budget-gate.md) | 成本/預算 CI 整合——notify 模式（F6 Phase 1） | |
| [T20-oncall-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T020-oncall-integration.md) | 容量預警接 ai-oncall 分診閉環（F10） | |
| [T21-freeze-enforce](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T021-freeze-enforce.md) | 成本/預算 CI 部署閘門——enforce 模式（F6 Phase 2） | |

## Task 列表

| # | 名稱 | 狀態 |
|---|------|------|
| [T1-project-scaffold](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T001-project-scaffold.md) | 專案骨架與 Go 模組初始化 | ✅ done |
| [T2-spec-parser](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T002-spec-parser.md) | SLO 定義解析模組 internal/spec | ✅ done |
| [T3-query-source](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T003-query-source.md) | Prometheus 查詢來源層 internal/query | ✅ done |
| [T4-store-sqlite](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T004-store-sqlite.md) | SQLite 狀態儲存層 internal/store | ✅ done |
| [T5-catalog-loader](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T005-catalog-loader.md) | 感測目錄載入器 internal/catalog | ✅ done |
| [T6-budget-eta-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T006-budget-eta-engine.md) | 多視野 ETA 引擎 internal/budget | ✅ done |
| [T7-capacity-sensor](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T007-capacity-sensor.md) | 容量感測引擎 internal/capacity | ✅ done |
| [T8-alert-notify](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T008-alert-notify.md) | Telegram 通知層 internal/alert | ✅ done |
| [T9-daemon-main](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T009-daemon-main.md) | daemon 主迴圈與 CLI cmd/sentinel | ✅ done |
| [T10-billing-adapters](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T010-billing-adapters.md) | 帳務 adapter internal/billing（actual 校準模式，選配） | ✅ done |
| [T11-cost-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T011-cost-engine.md) | 成本預測與報表 internal/cost | ✅ done |
| [T12-waste-cloud-provider](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T012-waste-cloud-provider.md) | 瘦身掃描器與雲端 provider internal/waste | ✅ done |
| [T13-waste-k8s-provider](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T013-waste-k8s-provider.md) | K8s/OpenShift provider（K1–K4 感測） | ✅ done |
| [T14-waste-standalone-provider](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T014-waste-standalone-provider.md) | Standalone server provider（S1–S3 感測） | ✅ done |
| [T15-waste-tracker](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T015-waste-tracker.md) | 候選清單生命週期 tracker | ✅ done |
| [T16-sentinel-ui](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T016-sentinel-ui.md) | sentinel-ui 唯讀 Web 服務 cmd/sentinel-ui | ✅ done |
| [T17-deploy-docs](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T017-deploy-docs.md) | 上線部署文件與 systemd/container 佈建 | ✅ done |
| [T18-e2e-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T018-e2e-integration.md) | 端到端整合測試（成功標準全覆蓋） | ✅ done |
| [T19-ci-budget-gate](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T019-ci-budget-gate.md) | 成本/預算 CI 整合——notify 模式（F6 Phase 1） | 📋 pending |
| [T20-oncall-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T020-oncall-integration.md) | 容量預警接 ai-oncall 分診閉環（F10） | 📋 pending |
| [T21-freeze-enforce](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T021-freeze-enforce.md) | 成本/預算 CI 部署閘門——enforce 模式（F6 Phase 2） | 📋 pending |
| [T22-pricing-catalog](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T022-pricing-catalog.md) | 價目表目錄 internal/pricing（estimate 模式主路徑） | ✅ done |

**✅ done: 19 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 3**

> 自動生成於 2026-08-24 13:41
