---
github_issue: N/A
title: Phase 9 Hybrid Execution / Cloud Escalation 實作
type: feature
priority: medium
status: pending
depends_on: [T034]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-15
---

# T035 - Phase 9 Hybrid Execution / Cloud Escalation 實作（§25）

## 目標

實作 Spec §25 定義的 Phase 9 Hybrid Execution Engine 與 Cloud Escalation 機制，支援 Local 9B + Cloud Reviewer/Planner/Executor 混合執行。

目前 `policy/engine.ts` 中 `evaluateEscalation()` 僅回傳 `NOT_SUPPORTED`，`evaluateExecution()` 硬限制 `allow_cloud=false`。

## 驗收標準

### Execution Strategy Engine（§25 完整實作）
- [ ] 擴充 `policy/engine.ts` 的 `ExecutionStrategy` 型別：
  - 新增 `tier: "local" | "hybrid" | "cloud"`
  - 新增 `cloudReviewer`, `cloudPlanner`, `cloudExecutor` 模型設定
  - 新增 `escalationPolicy`: `reviewer_first` | `planner_first` | `executor_first`

- [ ] 實作 `ExecutionStrategyEngine`：
  - `selectStrategy(task, context)`：依 task 複雜度、風險、本地失敗歷史選擇 tier
  - `canEscalate(task, attempt, classification)`：判斷是否觸發 escalation
  - `buildCloudRequest(task, mode)`：建構 Cloud Request（Reviewer/Planner/Executor）

### Cloud Escalation Modes（§25 / §34 Group H–K）
- [ ] **Reviewer First（H）**：Local 失敗 → Cloud Reviewer 審查 patch → Local 重做
- [ ] **Planner First（I）**：Complex task 直接 → Cloud Planner 產生計畫 → Local 實作
- [ ] **Executor First（J）**：Critical path → Cloud Executor 產出 patch → Local 驗證
- [ ] **Cloud Only（K）**：Full Cloud（Claude/GPT，無 Control Plane）

### Policy Engine 整合
- [ ] 修改 `evaluateExecution()`：Phase 1–5 仍 `allow_cloud=false`；Phase 6+ 依 `config.phase` 決定
- [ ] 實作 `evaluateEscalation()` 完整邏輯（不再回傳 `NOT_SUPPORTED`）
- [ ] 新增 `config.phase` 設定：`1-5` | `6` | `7` | `8` | `9` | `10` | `11`

### Cloud Provider 整合
- [ ] 實作 `CloudProvider` 介面：`AnthropicProvider`、`OpenAIProvider`、`GeminiProvider`
- [ ] 實作 `CloudClient`：統一呼叫介面、token 計費、retry、timeout
- [ ] 新增 `LLAMA_CLOUD_*` 環境變數配置

### 驗證
- [ ] Hybrid Baseline H/I/J/K 加入 `run_baseline.py`（T030 擴充）
- [ ] Architecture Validation Gate（§38）新增 Hybrid CP Gain 判定
- [ ] 端到端測試：Local 失敗 → Cloud Reviewer → Local 重做 → PASS

## 備註

- Phase 1–5 堅持 **local-only**，嚴禁雲端呼叫（現有硬限制保留）
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