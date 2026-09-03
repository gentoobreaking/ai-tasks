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
| 成本/預算 CI 整合——notify 模式（F6 Phase 1） |
| 容量預警接 ai-oncall 分診閉環（F10） |
| 價目表目錄 internal/pricing（estimate 模式主路徑） |
| SLO 感測門檻可調整——slo_defs 支援 thresholds 區塊 |
| waste Tracker daemon 接線——定期掃描與候選生命週期 |
| 每日摘要定時觸發接線 |
| 感測通知發送失敗保護——先發送成功才登記狀態 |
| waste 浪費金額接 pricing——候選清單顯示每月可省金額 |
| capacity_defs／slo_defs 熱載入 |
| predictions 表 retention 清理 |
| sentinel-ui 感測詳情欄位人話化——ETA 與用量呈現重設計 |
| predictions 補存 ceiling/utilization——「當下使用率」一等公民欄位 |
| dev profile 基本容量感測範本集——memory/cpu/disk io/network/processes |
| slo_defs 常用範本——基礎設施存活率＋HTTP/gRPC 服務 SLO 範本庫 |
| 範本庫擴充——k8s／EC2／EBS／SLB 負載平衡器資源範本 |
| sentinel-gen——LLM 協作產生/審查/驗證定義檔的 CLI（Go） |

## Skip 項目

| Task | 說明 |
|------|------|
| [T21-freeze-enforce](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T021-freeze-enforce.md) | 成本/預算 CI 部署閘門——enforce 模式（F6 Phase 2） |
| [T30-billing-real-verify](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T030-billing-real-verify.md) | 成本 adapter 真實雲端驗證（移除 NEEDS VERIFICATION） |

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
| [T19-ci-budget-gate](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T019-ci-budget-gate.md) | 成本/預算 CI 整合——notify 模式（F6 Phase 1） | ✅ done |
| [T20-oncall-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T020-oncall-integration.md) | 容量預警接 ai-oncall 分診閉環（F10） | ✅ done |
| [T21-freeze-enforce](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T021-freeze-enforce.md) | 成本/預算 CI 部署閘門——enforce 模式（F6 Phase 2） | ⏭️ skip |
| [T22-pricing-catalog](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T022-pricing-catalog.md) | 價目表目錄 internal/pricing（estimate 模式主路徑） | ✅ done |
| [T23-slo-thresholds](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T023-slo-thresholds.md) | SLO 感測門檻可調整——slo_defs 支援 thresholds 區塊 | ✅ done |
| [T24-waste-tracker-wiring](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T024-waste-tracker-wiring.md) | waste Tracker daemon 接線——定期掃描與候選生命週期 | ✅ done |
| [T25-daily-digest-wiring](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T025-daily-digest-wiring.md) | 每日摘要定時觸發接線 | ✅ done |
| [T26-notify-retry-protection](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T026-notify-retry-protection.md) | 感測通知發送失敗保護——先發送成功才登記狀態 | ✅ done |
| [T27-waste-saving-pricing](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T027-waste-saving-pricing.md) | waste 浪費金額接 pricing——候選清單顯示每月可省金額 | ✅ done |
| [T28-defs-hot-reload](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T028-defs-hot-reload.md) | capacity_defs／slo_defs 熱載入 | ✅ done |
| [T29-predictions-retention](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T029-predictions-retention.md) | predictions 表 retention 清理 | ✅ done |
| [T30-billing-real-verify](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T030-billing-real-verify.md) | 成本 adapter 真實雲端驗證（移除 NEEDS VERIFICATION） | ⏭️ skip |
| [T31-sentinel-ui-human-readable-columns](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T031-sentinel-ui-human-readable-columns.md) | sentinel-ui 感測詳情欄位人話化——ETA 與用量呈現重設計 | ✅ done |
| [T32-predictions-utilization-columns](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T032-predictions-utilization-columns.md) | predictions 補存 ceiling/utilization——「當下使用率」一等公民欄位 | ✅ done |
| [T33-basic-capacity-sensor-templates](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T033-basic-capacity-sensor-templates.md) | dev profile 基本容量感測範本集——memory/cpu/disk io/network/processes | ✅ done |
| [T34-slo-defs-common-templates](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T034-slo-defs-common-templates.md) | slo_defs 常用範本——基礎設施存活率＋HTTP/gRPC 服務 SLO 範本庫 | ✅ done |
| [T35-template-library-k8s-cloud](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T035-template-library-k8s-cloud.md) | 範本庫擴充——k8s／EC2／EBS／SLB 負載平衡器資源範本 | ✅ done |
| [T36-sentinel-gen-ai-cli](https://github.com/gentoobreaking/ai-tasks/blob/main/slo-sentinel/tasks/T036-sentinel-gen-ai-cli.md) | sentinel-gen——LLM 協作產生/審查/驗證定義檔的 CLI（Go） | ✅ done |

**✅ done: 34 | 🔧 in-progress: 0 | ⏭️ skip: 2 | 📋 pending: 0**

> 自動生成於 2026-09-03 15:21
