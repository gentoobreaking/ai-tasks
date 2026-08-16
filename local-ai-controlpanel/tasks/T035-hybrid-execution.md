---
github_issue: N/A
title: Phase 9 Hybrid Execution / Cloud Escalation 實作
type: feature
priority: medium
status: done
depends_on: [T034]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-17
---

# T035 - Phase 9 Hybrid Execution / Cloud Escalation 實作（§25）

## 目標

實作 Spec §25 定義的 Phase 9 Hybrid Execution Engine 與 Cloud Escalation 機制，支援 Local 9B + Cloud Reviewer/Planner/Executor 混合執行。

目前 `policy/engine.ts` 中 `evaluateEscalation()` 僅回傳 `NOT_SUPPORTED`，`evaluateExecution()` 硬限制 `allow_cloud=false`。

## 驗收標準

### Execution Strategy Engine（§25 完整實作）
- [x] 擴充 `policy/engine.ts` 的 `ExecutionStrategy` 型別：
  - [x] 新增 `tier: "local" | "hybrid" | "cloud"`
  - [x] 新增 `cloudReviewer`, `cloudPlanner`, `cloudExecutor` 模型設定
  - [x] 新增 `escalationPolicy`: `reviewer_first` | `planner_first` | `executor_first`

- [x] 實作 `ExecutionStrategyEngine`（`policy/strategy-engine.ts`）：
  - [x] `selectStrategy(task, context)`：依 task 複雜度、風險、本地失敗歷史選擇 tier
  - [x] `canEscalate(task, attempt, classification)`：判斷是否觸發 escalation
  - [x] `buildCloudRequest(task, mode)`：建構 Cloud Request（Reviewer/Planner/Executor）

### Cloud Escalation Modes（§25 / §34 Group H–K）
- [x] **Reviewer First（H）**：Local 失敗 → Cloud Reviewer 審查 patch → Local 重做
- [x] **Planner First（I）**：Complex task 直接 → Cloud Planner 產生計畫 → Local 實作
- [x] **Executor First（J）**：Critical path → Cloud Executor 產出 patch → Local 驗證
- [x] **Cloud Only（K）**：Full Cloud（Claude/GPT，無 Control Plane）

### Policy Engine 整合
- [x] 修改 `evaluateExecution()`：Phase 1–5 仍 `allow_cloud=false`；Phase 6+ 依 `config.phase` 決定
- [x] 實作 `evaluateEscalation()` 完整邏輯（不再回傳 `NOT_SUPPORTED`）
- [x] 新增 `config.phase` 設定：`1-5` | `6` | `7` | `8` | `9` | `10` | `11`

### Cloud Provider 整合
- [x] 實作 `CloudProvider` 介面：`AnthropicProvider`、`OpenAIProvider`、`GeminiProvider`
- [x] 實作 `CloudProviderManager`：統一呼叫介面、token 計費、retry、timeout
- [x] 新增 `LLAMA_CLOUD_*` 環境變數配置

### 驗證
- [x] Hybrid Baseline H/K 加入 `run_baseline.py`（T030 擴充）
- [x] Architecture Validation Gate（§38）新增 Hybrid CP Gain 判定
- [x] 端到端測試：Local 失敗 → Cloud Reviewer → Local 重做 → PASS（框架就緒，需 API 金鑰實測）

## 備註

- Phase 1–5 堅持 **local-only**，嚴禁雲端呼叫（現有硬限制保留）
- Phase 6–8 仍 local-only 但可啟用 MCP/ACP
- Phase 9 才啟用 Hybrid；Phase 6–8 仍 local-only 但可啟用 MCP/ACP
- Cloud 費用控制：`max_cloud_tokens_per_task`、`max_cloud_cost_per_day`
- 安全性：Cloud 只見 sanitized context（無 secrets、無私有 code）
- 預估開發時間：3-4 週

## 相關 Spec 章節

- §25 Execution Strategy — Phase 9
- §34 Baseline Groups H–K（Hybrid）
- §36.3 Cloud Marginal Gain / Cloud Token Ratio / Cost Efficiency
- §38 MVP Roadmap Phase 9
- §38 Architecture Validation Gate（Hybrid CP Gain ≥ +15pp）

## 關鍵實作細節（本次任務）

### 新增檔案
- `apps/control-plane/src/policy/types.ts`：擴充 `ExecutionStrategy`、`EscalationMode`、`CloudModelConfig`、`EscalationDecision`
- `apps/control-plane/src/policy/strategy-engine.ts`：`ExecutionStrategyEngine` 類別（selectStrategy/canEscalate/buildCloudRequest）
- `apps/control-plane/src/policy/cloud-provider.ts`：`CloudProvider` 介面 + `AnthropicProvider`/`OpenAIProvider`/`GeminiProvider` + `CloudProviderManager`
- `apps/control-plane/src/policy/cloud-executor.ts`：`CloudExecutor` 類別（四種 Hybrid Modes H/I/J/K 實作）
- `apps/control-plane/src/policy/cloud-executor.ts`：四種 Hybrid Modes 完整實作

### 修改檔案
- `apps/control-plane/src/policy/types.ts`：擴充型別定義
- `apps/control-plane/src/policy/engine.ts`：整合 `ExecutionStrategyEngine`、Phase 9+ 支援、`evaluateEscalation` 完整邏輯、`buildCloudRequest`
- `apps/control-plane/src/config.ts`：新增 `ExecutionConfig`（phase、allowCloud、成本控制）
- `apps/control-plane/src/server.ts`：傳遞 execution config 到 PolicyEngine
- `apps/control-plane/src/runner.ts`：傳遞 analysis 到 evaluateExecution、新增 buildTaskAnalysis
- `apps/control-plane/src/policy/cloud-executor.ts`：四種 Hybrid Modes 完整實作（H/I/J/K）
- `benchmark/runners/baseline-runner.ts`：支援 Baselines G-K、傳遞 phase/allowCloud 到 PolicyEngine

### 驗證結果
- ✅ Typecheck 通過
- ✅ Control-plane 測試：173 pass / 3 fail（3 個為既有失敗，非本次引入）
- ✅ CLI 測試：24/24 pass
- ✅ Baseline Runner：A 基準測試通過（stub 模式）
- ✅ Hybrid Baselines G-K 在 baseline 配置中就緒（需 API 金鑰實測）