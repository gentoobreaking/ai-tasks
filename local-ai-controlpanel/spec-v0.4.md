# Agent Control Plane

## Development Specification v0.4（合併版）

> 本文件為本專案**唯一、最新**的開發規格，合併自：
> `purpose.md`、`results-keep.md`、`discuss-1.md` ~ `discuss-11.md`、`spec-v0.2.md`、`spec-v0.21.md`（原 `spec-v0.321md`）、`spec-v0.3.md`
> 所有舊文件以本文件為準；內容衝突時以更新版本（**v0.4 決策**）優先。
>
> 版本關係：
> - **Phase I = v0.3**：本地專用驗證（`local_only`，Cloud 完全停用），用 7B/9B 壓力測試 Control Plane 並完成 benchmark。
> - **Phase II = v0.4**（本文件主體）：Hybrid 執行。在 v0.3 benchmark 證明 Control Plane 有效之後，才啟用 Cloud，且 Cloud **只能以 Escalation Provider 進入**，不是 primary executor。

**Status:** Development Specification
**Version:** 0.4
**Primary Runtime:** TypeScript + Node.js
**Research Runtime:** Python
**Initial Coding Worker:** Pi（可替換：OpenCode / Goose / Aider）
**Initial Model:** 本地 7B/9B（llama.cpp）
**External Model:** 僅作為 Escalation Provider（驗證完 v0.3 後啟用）
**Protocols:** MCP / ACP-Protocol / Worker Interface
**Storage:** SQLite（＋FTS5，Phase I 不加 Vector DB）
**Initial Platform:** macOS Apple Silicon（M2 16GB）
**Future Platform:** Linux / Kubernetes

---

# 1. 背景與目的

## 1.1 觀察到的現象

人類工程師遇到不確定的 API / library / framework 行為，通常會先查文件；LLM 卻常常直接開始寫。目前多數 Coding Agent 的 decision policy 並沒有把「外部知識驗證」設成寫程式前的強制步驟；即使有能力 research（如 Claude Code），也是 `LLM decides`，而不是 deterministic 的 pre-coding evidence gate。

2026-08 市場現況（discuss-2）：

| Agent | Web / Research 能力 | Coding 前 Research | 強制 Gate |
| --- | ---: | ---: | ---: |
| Cursor / Windsurf | ✅ | △ | ❌ |
| Claude Code | ✅ | ✅ | ❌ |
| OpenCode | ✅（可透過工具） | △ | ❌ |
| Devin | ✅ | ✅ | ❌ |
| Claude Research | ✅✅ | N/A | ❌ |
| Code Researcher 類研究 | ✅ code research | ✅ | 接近 |
| **本專案架構** | ✅ | **✅** | **✅** |

> 不是「完全沒有人做 Research-before-Coding」，而是「主流 Coding Agent 還沒有普遍把它變成 deterministic pre-coding evidence gate」。

## 1.2 核心目的

建立一個 **Research-driven、Evidence-gated、Policy-controlled 的 Agent Control Plane（ACP-Ctrl）**：

1. Coding Agent 在開始修改程式碼之前，先強制做外部知識驗證；驗證完成後才允許進入 implementation。
2. 像 Pi 一樣，把 Coding Agent 當成可嵌入、可擴充的 execution runtime，由外部 Control Plane 接管 policy / research。
3. 真正有價值的，是把**「知識取得、驗證、記憶、工具操作、流程控制」從 LLM 裡抽離出來**。
4. 目標是驗證：

> **「Agent Control Plane + Research + Policy + Verification，是否真的能讓本地 7B/9B 做到原本做不到的 Coding？」**

v0.4 的延伸是：**在證明 Control Plane 有效後，精確測量「Cloud LLM 在 9B + Control Plane 之上還能再增加多少」。**

## 1.3 命名約定

| 縮寫 | 定義 |
| --- | --- |
| **ACP-Ctrl** | Agent Control Plane：我們自己的 Control Plane |
| **ACP-Protocol** | Agent Client Protocol：外部 agent runtime 通訊協定 |

---

# 2. v0.4 核心目標

## 2.1 承接 Phase I（v0.3）的五個問題

> 「Control Plane + Research + Policy + Verification + Reflection，能否讓一個原本能力有限的 7B/9B Coding Model，可靠地完成更複雜的 Coding Task？」

### Q1 — Research 是否能降低 LLM hallucination？

### Q2 — Policy 是否能降低錯誤操作？

### Q3 — Verification + Reflection 是否能讓小模型自我修正？

### Q4 — Control Plane 組合起來是否產生 synergy？

### Q5 — 9B + Control Plane 是否可以接近部分 Cloud Coding Agent 的效果？

v0.3 的答案是 **benchmark 數據**，不是架構推演：

- **沒有 CP Gain 證據，v0.4 不啟動。** 這是 v0.3 → v0.4 的 rigid gate。
- 若 `Raw 9B ≈ 40%` vs `9B + Full CP ≈ 75%`，代表 Control Plane 提供了實質的 **system-level intelligence**，v0.4 才值得做。

## 2.2 v0.4 的新問題

### Q6 — Cloud Escalation 的 marginal gain 到底是多少？

精准測量：

```text
Cloud Marginal Gain =
Success(9B + CP + Cloud Escalation)
-
Success(9B + CP)
```

### Q7 — reviewer_first 能否用「極少量」Cloud token 換到接近 Cloud-only 的成效？

預設假設：

```text
Cloud-only           100% token   → 例如 90% success
9B + CP + Reviewer    ~10% token   → 例如 80%+ success
```

### Q8 — 多 Worker / Execution Tier 是否能改善成本結構或成功率？

OpenCode / Goose / 不同 local model size 在同一個 Control Plane 下的 A/B。

## 2.3 v0.4 的定位

```text
v0.3  Local-only validation
       ↓      證明 Control Plane 有效（CP Gain 明顯為正）
v0.4  Hybrid execution
       ↓      Cloud 只做 escalation，不接管
v0.5  Multi Worker + Production
```

Cloud 的角色正式定義為：

> **Production fallback / Expert-on-demand，而不是 Architecture validation component。**

---

# 3. Architecture Principles

## 3.1 最高原則

```text
LLM ≠ Controller
LLM ≠ Policy
LLM ≠ Security Boundary
LLM ≠ Source of Truth
```

LLM 是 **Coding Worker**，而不是 Agent 的最高控制者。相關文獻（Microsoft Code Researcher：Linux kernel crash 58% vs SWE-agent 37.5%；Agentic Harness Engineering：harness 層提升 Terminal-Bench 2 69.7% → 77.0%）支持「把 intelligence 放到 harness / control 層」的方向。

## 3.2 六大設計原則（P1 ~ P6）

### P1 — Research Before Coding

涉及以下情形的 task，**沒有 Evidence 就不允許 Coding**：

```text
unknown_dependency
version_sensitive
external_api
unfamiliar_framework
unfamiliar_repository
external_specification
low_confidence
security_sensitive
```

### P2 — Control Plane > Prompt

重要規則不能只寫在 system prompt。「不要修改 config/」不能只是 prompt，必須是 Policy Engine → Artifact Permission → Runtime enforcement。LLM 沒有 capability 就無法修改。

### P3 — LLM Is Worker, Not Controller

LLM 不負責決定：是否 research、是否可以修改檔案、是否可以 commit、是否可以升級 Cloud、是否完成 task。這些全部由 Control Plane 決定。**包含 v0.4 的「是否升級 Cloud」——由 Escalation Controller 依 Policy 決定，不是由本地模型「求救」決定。**

### P4 — Evidence Is First-class Object

Research 結果不是一段文字，而是 Evidence Bundle，具有 source / version / claim / confidence / timestamp / provenance。

### P5 — Worker Is Replaceable

第一個 Worker 是 Pi，但架構不能綁死 Pi。v0.4 正式加入第二、第三個 Worker：OpenCode、Goose。未來可再替換：Aider、Claude Code、Codex、Custom Worker。

### P6 — Verification Is Ground Truth

LLM 說「應該沒問題」沒有意義。真正的結果只有：build / test / lint / type check / security scan / dry-run。

## 3.3 不可破壞的 Architecture Rules

### Rule 1 — LLM 不得直接決定 Policy。

### Rule 2 — Worker 不得繞過 Artifact Controller。

### Rule 3 — Research Result 必須轉換成 Evidence Bundle 才能進入 Coding。

### Rule 4 — MCP 是 capability interface，不是 authorization layer；authorization 必須由 Control Plane 決定。

### Rule 5 — Pi 是 Worker，不是 Control Plane。

### Rule 6（v0.4 新增）— Cloud 是 Escalation Provider，不是 Primary Executor。

> **能不用 Cloud 寫 code，就不要讓 Cloud 寫 code。**

Cloud 第一優先角色是 Reviewer / Planner，最後才是 Executor：

```text
Cloud Reviewer  →  Cloud Planner  →  Cloud Executor（最後手段）
```

### Rule 7（v0.4 新增，自 spec-v0.21）— Worker / Model / Execution Tier 三者分離。

```text
Worker
 │
 ├── Runtime：Pi / OpenCode / Goose
 │
 └── Model：Qwen 9B / Qwen 14B / Claude / GPT
```

`Worker Selection` 不能簡單根據「這題比較難 → Cloud」決定；必須由 **Policy Engine → Execution Strategy（Tier）→ Worker Router → Model Router** 依序決定。

---

# 4. v0.4 Architecture

## 4.1 Phase I 系統圖（v0.3，local-only，作為 v0.4 的基礎架構）

```text
                         ┌───────────────┐
                         │     USER      │
                         └───────┬───────┘
                                 │
                                 ▼
                   ┌─────────────────────────┐
                   │    AGENT CONTROL PLANE  │
                   │       TypeScript        │
                   │                         │
                   │ ┌─────────────────────┐ │
                   │ │ Task Manager        │ │
                   │ ├─────────────────────┤ │
                   │ │ Task Analyzer       │ │
                   │ ├─────────────────────┤ │
                   │ │ Policy Engine       │ │
                   │ ├─────────────────────┤ │
                   │ │ State Machine       │ │
                   │ ├─────────────────────┤ │
                   │ │ Research Controller │ │
                   │ ├─────────────────────┤ │
                   │ │ Evidence Gate       │ │
                   │ ├─────────────────────┤ │
                   │ │ Worker Router       │ │
                   │ ├─────────────────────┤ │
                   │ │ Artifact Controller │ │
                   │ ├─────────────────────┤ │
                   │ │ Verification        │ │
                   │ ├─────────────────────┤ │
                   │ │ Reflection          │ │
                   │ └─────────────────────┘ │
                   └────────────┬────────────┘
                                │
                  ┌─────────────┴─────────────┐
                  │                           │
                  ▼                           ▼
       ┌───────────────────┐       ┌──────────────────┐
       │  Research Engine  │       │   Pi Worker      │
       │      Python       │       │                  │
       │                   │       │ Local 7B / 9B    │
       │ Web               │       │                  │
       │ Docs              │       └────────┬─────────┘
       │ Repository        │                │
       │ Dependency        │                ▼
       │ Evidence          │             Patch
       └─────────┬─────────┘                │
                 │                          ▼
                 ▼                 ┌──────────────────┐
          Evidence Bundle         │ Artifact Control  │
                                  └────────┬─────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │ Verification     │
                                  │                  │
                                  │ Test             │
                                  │ Build            │
                                  │ Lint             │
                                  │ Type Check       │
                                  └────────┬─────────┘
                                           │
                                     ┌─────┴─────┐
                                     ▼           ▼
                                   PASS         FAIL
                                     │           │
                                     ▼           ▼
                                   DONE      Reflection
                                                 │
                                         ┌───────┴───────┐
                                         ▼               ▼
                                      Research          Retry
                                         │               │
                                         └───────┬───────┘
                                                 ▼
                                            Local 7B/9B
```

**整張圖沒有 Cloud。**

## 4.2 Phase II 系統圖（v0.4，Hybrid）

```text
                     Task
                       │
                       ▼
                 Policy Engine
                       │
                       ▼
         ┌──────────────────────────┐
         │  Execution Strategy      │
         │  Engine（v0.4 新增）      │
         │  ├── Execution Tier      │
         │  ├── Worker Router       │
         │  ├── Model Router        │
         │  └── Escalation Ctrl     │
         └────────────┬─────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
     Local Tier               Hybrid / Cloud Tier
         │                         │
         ▼                         ▼
   Pi + 9B（local）         Cloud Reviewer / Planner
         │                         │
         ▼                         │
   Verification                   │
         │                         │
   ┌────┴────┐                    │
   ▼         ▼                    │
 PASS      FAIL                   │
   │         │                    │
   ▼         ▼                    │
 DONE   Reflection                │
           │                      │
     ┌─────┴─────┐                │
     ▼           ▼                │
  Research     Retry              │
     │           │                │
     └─────┬─────┘                │
           ▼                      │
     Local retry #2 / #3          │
           │                      │
     ┌─────┴──────────────────────┘
     ▼
Cloud Escalate（由 Escalation Controller 依 Policy 觸發，
             不是本地模型自己決定）
     ▼
┌────────────────────┐
│ Cloud Worker       │
│ ├─ Reviewer First  │
│ ├─ Planner         │
│ └─ Executor（最後） │
└────────────────────┘
```

### 角色分工（v0.4 最重要的一層）

| 角色 | 負責 |
| --- | --- |
| **Execution Strategy Engine** | 依 Policy 決定 Execution Tier（Local / Hybrid / Cloud） |
| **Worker Router** | 依 Tier 選擇 runtime（Pi / OpenCode / Goose） |
| **Model Router** | 依 Tier 選擇 model（9B / 14B / Cloud LLM） |
| **Escalation Controller** | 依條件（repeated failure 等）在 Local retry 用盡後觸發 Cloud |

## 4.3 Architecture Layers（七層，不變）

```text
Layer 7  User Interface
Layer 6  Control Plane
Layer 5  Research / Evidence
Layer 4  Worker Interface
Layer 3  Agent Runtime
Layer 2  MCP Tools
Layer 1  Execution / Verification
```

## 4.4 三層協定架構

| Layer | 解決什麼 |
| --- | --- |
| **Worker Interface** | Control Plane 的內部抽象（不知道 Worker 是 Pi 還是 OpenCode） |
| **ACP-Protocol** | Control Plane ↔ Agent Runtime（spawn / request / event / interrupt / terminate） |
| **MCP** | Agent ↔ Tools / Resources（filesystem、git、shell、search…） |

```text
                 Control Plane
                      │
              Worker Interface
                      │
                ┌─────┴─────┐
                │           │
               Pi       OpenCode
                │           │
               ACP         ACP
                │           │
                ▼           ▼
              Agent       Agent
                │
               MCP
                │
          ┌─────┼─────┐
          ▼     ▼     ▼
        Git   Shell  Search
```

ACP 解決 Control Plane ↔ Agent Runtime，**不是** Control Plane ↔ Tool；兩者不要混在一起。

---

# 5. Control Plane Components

## 5.0 總覽

```text
Control Plane
│
├── Task Manager
├── Task Analyzer
├── Policy Engine
├── State Machine
├── Research Controller
├── Evidence Gate
├── Worker Router
├── Artifact Controller
├── Verification Controller
├── Reflection Engine
├── Memory Manager
│
├── Execution Strategy Engine（v0.4 新增）
├── Model Router（v0.4 新增）
└── Escalation Controller（v0.4 啟用）
```

## 5.1 Task Manager

負責建立與管理 Task。

```typescript
interface TaskManager {
  create(request: string, context: RepositoryContext): Promise<Task>;
  get(taskId: string): Promise<Task>;
  updateStatus(taskId: string, status: TaskStatus): Promise<void>;
}
```

```typescript
interface Task {
  id: string;
  userRequest: string;
  repository: RepositoryContext;
  status: TaskStatus;
  complexity?: Complexity;
  risk?: RiskLevel;
  createdAt: string;
  updatedAt: string;
}

interface RepositoryContext {
  path: string;
  gitBranch: string;
  commit: string;
  languages: string[];
  detectedFrameworks: string[];
  detectedDependencies: Dependency[];
}
```

## 5.2 Task Analyzer

Task Analyzer 不負責 Coding，只負責分析：

```text
Task
 ↓
Language Detection
 ↓
Framework Detection
 ↓
Dependency Detection
 ↓
Risk Detection
 ↓
Complexity Detection
 ↓
Research Requirement
```

```typescript
interface TaskAnalysis {
  languages: string[];
  frameworks: string[];
  dependencies: string[];
  complexity: Complexity;
  risk: RiskLevel;
  researchRequired: boolean;
  researchReasons: string[];
}
```

`RESEARCH_REQUIRED` **不是 LLM 自己決定**，由 Policy Engine + Task Analyzer 共同決定。

## 5.3 Policy Engine

Policy 是 Control Plane 的核心。Policy 不只做 Security，分成：

```text
Policy
│
├── Research Policy
├── Tool Policy
├── Artifact Policy
├── Verification Policy
├── Retry Policy
├── Reflection Policy
├── Escalation Policy（v0.4 啟用）
└── Resource Policy
```

```typescript
interface PolicyEngine {
  evaluateTask(task: Task): Promise<TaskPolicyDecision>;
  evaluateResearch(task: Task, evidence: EvidenceBundle): Promise<ResearchDecision>;
  evaluateArtifact(patch: Patch, policy: ArtifactPolicy): Promise<ArtifactDecision>;
  evaluateTool(tool: ToolRequest): Promise<ToolDecision>;
  evaluateExecution(context: TaskAnalysis): Promise<ExecutionStrategy>;  // v0.4
  evaluateEscalation(context: EscalationContext): Promise<EscalationDecision>;
}
```

市場上常見的是 **Security / Permission Policy**（`rm -rf → DENY`、`git push --force → APPROVAL`）；本專案的核心差異是 **Knowledge Policy**：

```text
if task uses unknown API:                 REQUIRE_RESEARCH
if dependency version is ambiguous:       REQUIRE_RESEARCH
if framework behavior is version-sensitive: REQUIRE_RESEARCH
if implementation conflicts with repo convention: REQUIRE_RESEARCH
if evidence confidence < threshold:       BLOCK_CODING
```

### Policy Schema 範例（v0.4，啟用 escalation）

```yaml
version: "2"

research:
  enabled: true
  required_when:
    - unknown_dependency
    - version_sensitive
    - external_api
    - unfamiliar_framework
    - security_sensitive
    - low_confidence
  minimum_sources: 2
  official_source_preferred: true
  preferred_sources:
    - official_documentation
    - repository
    - upstream_issue
  max_rounds: 3
  retrievers:
    repository:     true    # Phase 1 啟用
    documentation:  true    # Phase 1 啟用
    git_history:    true    # Phase 1 啟用
    web:            true    # Phase 1 啟用

evidence:
  max_tokens: 8000        # Evidence Bundle context 預算（機制見 §5.6.1；數值按模型實測調整）
  min_relevance: 0.3      # 低於此 relevance 的 facts 不進入 shaping（仍在 Evidence Store）
  budget_percent: 0.4     # bundle 佔模型 context window 的上限比例（例如 8k/20k）

artifact:
  allowed:
    - "src/**"
    - "lib/**"
    - "tests/**"
  readonly:
    - "package-lock.json"
    - "go.mod"
  forbidden:
    - ".git/**"
    - ".env"
    - "secrets/**"

verification:
  required:
    - unit_test
    - lint

retry:
  enabled: true
  max_attempts: 3
  on:
    coding_error:       retry
    knowledge_error:    research
    requirement_error:  ask_user
    environment_error:  repair
    tool_error:         retry
    model_limitation:   stronger_model   # v0.4：升級到更強 model / Cloud

execution:
  strategy: local_first
  local:
    worker: pi
    model: qwen-9b
    max_attempts: 3
  escalation:
    enabled: true
    conditions:
      - repeated_verification_failure
      - insufficient_model_capability
      - conflicting_evidence
      - high_risk_change
    target:
      worker: pi
      model: cloud
  cloud:
    mode: reviewer_first
```

**v0.3 → v0.4 的唯一行為變更：** `model_limitation` 從 `stop` 改成 `stronger_model`。這是把 v0.3 驗證到的「能力邊界」交給明確的 escalation 政策，**不是**讓 Cloud 變成 default。

## 5.4 State Machine

```text
CREATED
   ↓
ANALYZING
   ↓
POLICY_CHECK
   ↓
RESEARCH_REQUIRED
   ↓
RESEARCHING
   ↓
EVIDENCE_VALIDATION
   │
   ├── PASS → PLANNING
   ├── RESEARCH_AGAIN → RESEARCHING（受限於 max_rounds）
   ├── BLOCK → ASK_USER 或 STOP      ← 知識缺口，硬性
   └── DEGRADED → PLANNING（帶旗標）  ← 基礎設施失敗，政策降級
   │
   ▼
PLANNING
   ↓
WORKER_SELECTION
   ↓
IMPLEMENTING
   ↓
ARTIFACT_VALIDATION
   ↓
VERIFYING
   │
   ├── PASS → COMPLETE
   │
   └── FAIL
          ↓
       REFLECTION
          │
          ├── RETRY
          ├── RESEARCH
          ├── ASK_USER
          ├── REPAIR_ENVIRONMENT
          ├── STRONGER_MODEL      ← v0.4 新增
          └── STOP
```

## 5.5 Research Controller

調度 Research Engine；決定「查什麼」的順序是 **Context → Evidence → Implementation**，不是 **LLM Memory → Implementation**：

```text
1. Current repository
2. Existing code / configuration
3. Local documentation
4. Package / dependency source
5. Official documentation
6. GitHub upstream
7. General web search
```

**Phase 1 正式啟用的 Retriever 集合（已決策）：** 以下四種全部啟用：

```text
Repository Retriever      ✅ Phase 1 啟用
Documentation Retriever   ✅ Phase 1 啟用
Git History Retriever     ✅ Phase 1 啟用
Web Retriever             ✅ Phase 1 啟用（不再延後）
```

上面的 1～7 是**執行優先序**（先查本地、再查外部，web 最後），不是啟用門檻——四種 retriever 都是 Phase 1 的一部分，任何一種都可能在任何 task 中被使用。是否實際觸發由 Research Policy 決定。

## 5.6 Research Engine（Python）

Research Engine 必須是 **deterministic pipeline + LLM optional**，而不是完全依賴 LLM：

```text
Research Engine
│
├── Query Planner
├── Web Retriever
├── Documentation Retriever
├── Repository Retriever
├── Dependency Retriever
├── Document Parser
├── Claim Extractor
├── Evidence Ranker
└── Evidence Builder
```

### Pipeline

```text
Task
 ↓
Research Planner
 ↓
Generate Queries
 ↓
Retrieve Sources
 ↓
Extract Documents
 ↓
Identify Version
 ↓
Extract Claims
 ↓
Rank Evidence
 ↓
Build Evidence Bundle
```

### Phase 1 Retriever 支援（正式定義）

Phase 1 的 Research Engine 支援四種 retriever，**全部啟用**：

```text
Repository Retriever
  負責：目前 repo 的 code / config / 既有 pattern / 約定

Documentation Retriever
  負責：本地與官方文件（local docs → 官方 documentation）

Git History Retriever
  負責：git log / blame / 近期變更 / 既有 pattern 演進

Web Retriever
  負責：官方網站、GitHub upstream、issue、release note、general web
```

### 來源優先順序（執行時依序嘗試）

```text
1. Repository
2. Git History
3. Package Metadata / Dependency source
4. Official Documentation
5. GitHub upstream / Official Issue / Release
6. Trusted Technical Source
7. General Web
```

原則是：**能從本地取得證據就不先打網路；web 是最後手段但不是停用項。**

### Retriever 啟用設定（Policy 可關閉）

```yaml
research:
  retrievers:
    repository:   true
    documentation: true
    git_history:  true
    web:          true
```

### 5.6.1 Evidence Shaping（上下文預算政策）

7B/9B 的 context window 有限（16GB 記憶體下 KV cache 更吃緊），因此 Evidence Bundle 在交付 Worker 前必須經過 **Shaping**。機制現在定義，參數之後按模型實測調整。

**機制（確定性規則，不可由 LLM 決定）：**

```text
1. 以 policy 的 evidence.max_tokens 為預算上限
2. 組裝順序（依優先度從低到高截斷）：
   constraints（完整保留）
   versions（完整保留）
   facts（依 relevance × confidence 由高到低保留，直到預算用盡）
   unresolvedQuestions（完整保留，改用摘要式單行）
3. 被截掉的 facts 不從系統消失：
   - 仍完整存在於 SQLite evidence store / project memory
   - bundle 中僅標記 truncated = true，並記錄 droppedFactIds
4. 截斷發生時 bundle.truncated = true，且必須在 unresolvedQuestions
   追加一行：「另有 N 筆證據因超過 token 預算未提供」
5. 任何情況下不得以摘要/刪減 constraints 或 versions（完整性優先）
```

**證據完整性不受影響：** Evidence Gate（§5.8）以 Evidence Store 的**完整**證據集驗證；Shaping 只影響「交付給 Worker 的 bundle」，不影響 gate 判定。

## 5.7 Evidence & Evidence Bundle

Evidence 是一級 Domain Object（P4）。

```typescript
interface Evidence {
  id: string;
  claim: string;
  source: {
    type: "official" | "repository" | "github" | "issue" | "web";
    uri: string;
    title?: string;
    publisher?: string;
  };
  version?: string;
  confidence: number;
  relevance: number;
  retrievedAt: string;
  contentHash: string;
}

interface EvidenceBundle {
  id: string;
  taskId: string;
  facts: Evidence[];
  constraints: string[];
  versions: Record<string, string>;
  unresolvedQuestions: string[];
  confidence: number;
  generatedAt: string;
  tokenBudget: number;      // Evidence Shaping 的預算上限（由 policy 設定）
  estimatedTokens: number;  // shaping 後 bundle 的估計 token 數
  truncated: boolean;       // 是否因超過預算而截斷（true 時 facts 為 shaping 結果）
  droppedFactIds: string[]; // 被截斷而未交付的 fact id 清單（完整內容仍在 Evidence Store）
}
```

Worker **只拿 Evidence Bundle，不直接拿整個 Research Engine state**。不要 `Google results → 9B`，而是：

```text
Search → Retrieve → Extract → Normalize → Version filter → Deduplicate → Cross-check → Evidence
→ Shaping（截斷 / 摘要，§5.6.1）→ Evidence Bundle
```

> **token 估計規則（deterministic）：** 每個 fact 的 token 數以 `max(1, ceil(claim.length / 4))` 估算（中文約 2–4 字 / token，估算偏差可接受），總合即 `estimatedTokens`。不得使用 LLM 逐條估算。

## 5.8 Evidence Gate

**沒有 Evidence，就不允許 Implementation 修改 artifact。**

```typescript
interface EvidenceGate {
  validate(task: Task, evidence: EvidenceBundle): Promise<EvidenceDecision>;
}

type EvidenceDecision =
  | { status: "PASS"; confidence: number }
  | { status: "RESEARCH_AGAIN"; missing: string[] }
  | { status: "BLOCK"; reason: string }        // 知識缺口：硬性，永不降級
  | { status: "DEGRADED"; reason: string;      // 基礎設施失敗：政策允許的降級
      scope: "task" | "attempt";
      originalDecision: EvidenceDecision;
      flags: string[] };
```

```text
Research → Evidence Bundle → Evidence Gate → PASS / RESEARCH_AGAIN / BLOCK / DEGRADED
```

### 5.8.1 兩階段評估

**知識缺口（BLOCK）與查證基礎設施失敗（可降級）必須分開判斷：**

```text
Research Pipeline 完成後
     │
     ▼
Stage 1: Research 執行狀態（來源有沒有「跑到」）
     COMPLETE ── 所有必要來源都嘗試成功
     PARTIAL  ── 部分來源失敗（例：web 掛掉但 repo / docs 成功）
     FAILED   ── 一個來源都拿不到
     │
     ▼
Stage 2: 證據評估（拿到的東西夠不夠）
     SUFFICIENT                  → PASS
     INSUFFICIENT（可再進步）    → RESEARCH_AGAIN
     INSUFFICIENT_LOW_CONFIDENCE → BLOCK（知識缺口，硬性）
```

**降級路徑只由 Stage 1 的 PARTIAL / FAILED 觸發；Stage 2 的 BLOCK 永不降級。**

### 5.8.2 降級政策（research_failure）

```yaml
research_failure:
  retry:
    max_attempts: 2        # 基礎設施失敗先短退避重試（瞬斷 / 404 / rate limit）
    backoff: [5s, 30s]
  on_partial:              # 例：web 掛，但本地來源 OK
    if_evidence_from_local_sources_sufficient: allow_local
    else: ask_user
  on_failed:               # 例：完全離線，連 docs 都拿不到
    action: ask_user       # 預設問人；不自動降級放行
    allow_override: true   # 人可選擇「無證據硬跑」，但必須標記 degraded
    override_records_actor: true   # 記錄覆寫者與理由
```

### 5.8.3 降級三鐵律

1. **降級永遠帶旗標**：decision 記錄 `{ status: "DEGRADED"; reason; scope; originalDecision }`——在哪一層降的、為什麼、原本決策是什麼。
2. **風險分級**：低風險 task（已知穩定 API、repository 已有 pattern）可由 policy 自動降級到 local-only coding；高風險（version-sensitive、unknown dependency、security_sensitive）一律 `ask_user`。
3. **benchmark 不被污染**：`research_degraded_tasks` 單獨計數與報告；主指標可排除或分開呈現——否則「離線跑出來的成績」會混雜「其實沒做 research」的假數據。

### 5.8.4 卡死防護（流程）

```text
RESEARCHING 失敗
   ↓
重試 ×2（5s / 30s 退避）
   ↓
仍失敗 → 分類（PARTIAL / FAILED）
   ↓
Policy 依 task risk 決定：
   ├── 低風險 + PARTIAL（本地證據已足夠）→ allow_local（degraded, flagged）
   ├── 高風險                          → ASK_USER（狀態機 §5.4 既有狀態）
   └── 人選擇「硬跑」                  → allow_without_evidence
                                          （degraded, 記錄覆寫者與理由）
```

> 註：retriever 優先序為「本地先行」（repo → git history → docs → web），因此 **web 掛掉時大部分 task 不會卡死**；降級路徑主要救「證據只能來自外部」的 task。

## 5.9 Worker Interface & Worker Registry

```typescript
interface CodingWorker {
  initialize(context: WorkerContext): Promise<void>;
  plan(task: Task): Promise<Plan>;
  execute(request: WorkerRequest): Promise<WorkerResult>;
  interrupt(): Promise<void>;
  shutdown(): Promise<void>;
}

interface WorkerRequest {
  task: Task;
  evidence: EvidenceBundle;
  plan: Plan;
  executionPolicy: ExecutionPolicy;
  workspace: WorkspaceContext;
}

interface WorkerRegistry {
  register(descriptor: WorkerDescriptor, worker: CodingWorker): void;
  get(workerId: string): CodingWorker;
  list(): WorkerDescriptor[];
}

interface WorkerDescriptor {
  id: string;
  runtime: string;
  capabilities: string[];
  models: string[];
  locality: "local" | "remote";
  costClass: "free" | "low" | "high";
  supportsACP: boolean;
  supportsMCP: boolean;
}
```

v0.4 的 Worker Registry 預先登錄（啟用與否由 Policy 決定）：

```yaml
workers:
  pi-local-9b:
    runtime: pi
    model: qwen-9b
    tier: local
    enabled: true

  pi-local-14b:
    runtime: pi
    model: qwen-14b
    tier: local
    enabled: false          # Phase II 中期可測

  opencode-local:
    runtime: opencode
    model: qwen-14b
    tier: local
    enabled: false          # Q8 A/B 用

  pi-cloud:
    runtime: pi
    model: cloud-model
    tier: cloud
    enabled: false          # 只有 escalation 觸發時使用

  opencode-cloud:
    runtime: opencode
    model: cloud-model
    tier: cloud
    enabled: false
```

## 5.10 Pi Worker

```text
Control Plane
      │
      ▼
Worker Interface
      │
      ▼
Pi Worker
      │
      ▼
Pi Runtime
      │
      ▼
Local LLM（7B / 9B）
```

模型可以是 Qwen / Llama / DeepSeek / 其他 coding-capable local model——**模型名稱不是 Control Plane 的 dependency**。Pi 的 Extension / RPC 作為 Control Plane ↔ Pi 的接口（**不 fork Pi**），contract 例如：

```json
{
  "task_id": "TASK-001",
  "objective": "add deployment scaling support",
  "evidence": [
    { "source": "kubernetes-official", "fact": "..." },
    { "source": "repository", "fact": "..." }
  ],
  "allowed_files": ["pkg/controller/deployment.go", "pkg/controller/deployment_test.go"],
  "readonly_files": ["go.mod"],
  "verification": ["go test ./pkg/controller/..."]
}
```

Pi 不負責：Research decision、Policy decision、Artifact authorization、Escalation decision。**Pi 可以「沒有 Research 權限」**：Research 是 Control Plane 的 policy-controlled capability。

Worker runtime 選擇（背書：discuss-9 的 Controlability vs Features 比較）：

```text
                    Controlability
                          ↑
                          │
                     Pi   │
                          │
                Goose     │
                          │
              OpenCode    │
                          │
                 Aider    │
                          │
           Claude Code    │
                          │
                          └──────────────→
                               Features
```

Pi 最適合當 baseline：runtime / context / tool calling / LLM 的 minimal agent runtime；OpenCode / Goose 作為 Q8 的 A/B 對象。

## 5.11 Execution Strategy Engine（v0.4 新增，自 spec-v0.21）

這是 v0.4 與 v0.2/v0.3 最大的架構差異：**把「Worker Selection」拆成「Policy Engine 決策 → Execution Tier」兩層**。

```text
Execution Strategy Engine
        │
        ├── Execution Tier     （Local / Hybrid / Cloud）
        │
        ├── Worker Router      （runtime 選擇）
        │
        ├── Model Router       （model 選擇）
        │
        └── Escalation Controller（Local 用盡後升級）
```

```text
                    Task
                      │
                      ▼
                Policy Engine
                      │
                      ▼
              Execution Strategy
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       Local        Hybrid       Cloud
        Tier          Tier        Tier
          │           │           │
          ▼           ▼           ▼
         Pi          Pi+Cloud    Cloud Worker
          │
          ▼
         9B
```

為什麼不能直接 Worker Selection？假設 `Task = 修改 Kubernetes controller`，若直接 `Complexity = High → Claude`，本地 9B 根本沒有機會。正確順序是：

```text
Task → Research → Evidence → Pi + 9B → Verification
       FAIL → Reflection → Retry → Research → Cloud
```

### Escalation 流程（完整）

```text
                 ┌──────────────┐
                 │     Task     │
                 └──────┬───────┘
                        ▼
                 Research + Plan
                        │
                        ▼
                ┌───────────────┐
                │ Local 9B / Pi │
                └───────┬───────┘
                        │
                   Verification
                        │
                 ┌──────┴──────┐
                 │             │
                PASS          FAIL
                 │             │
                 ▼             ▼
              DONE         Reflection
                               │
                         ┌─────┴─────┐
                         │           │
                       Retry      Research
                         │           │
                         └─────┬─────┘
                               ▼
                        Local retry #2
                               │
                               ▼
                        Local retry #3
                               │
                               ▼
                         Cloud Escalate
```

### 升級階梯（Escalation Ladder）

```text
Pi + 9B
   ↓
Pi + 14B（可選）
   ↓
Pi + Cloud LLM
   ↓
OpenCode + Cloud LLM（可選）
```

### 三種 Cloud Mode（優先順序）

```text
Cloud Reviewer  Local 9B → Cloud Review → Local 9B
Cloud Planner   Research → Cloud Planning → Local 9B Coding
Cloud Executor  Task → Cloud Worker → Complete
```

> **能不用 Cloud 寫 code，就不要讓 Cloud 寫 code。**

Cloud 可以只做 Reviewer / Planner / Research Validator / Debugger / Architecture Reviewer。Token 消耗示意：

```text
Cloud-only Agent：
User → Cloud LLM → Research → Plan → Coding → Debug → Test → Fix
Cloud Token：████████████████████████████

本架構：
User → Local 9B → Research → Local 9B → Coding → Test
       FAIL → Cloud Reviewer → Local 9B → Fix → Test
Cloud Token：███
```

> 把昂貴 token 限制在真正需要高 intelligence 的節點（預估 Cloud token 可降到 10% 甚至更低——實際數字由 benchmark 回答，這是 Q7）。

## 5.12 Artifact Controller & Artifact Policy

Worker 產生 Patch，不能直接寫 filesystem：

```text
Worker → Proposed Patch → Artifact Controller → Policy Validation → Git Diff Validation → Filesystem Apply
```

```typescript
interface ArtifactController {
  validate(patch: Patch, policy: ArtifactPolicy): Promise<ArtifactDecision>;
  apply(patch: Patch): Promise<AppliedPatch>;
  rollback(patchId: string): Promise<void>;
}
```

v0.4 啟用 Cloud Worker 後，**同一組 Artifact Policy 適用於所有 Worker**（Rule 2：Cloud 不例外）。

## 5.13 Verification Engine

第一階段：Git Diff / Test / Build / Lint / Type Check。後續 plug-in：Security Scan、Container Build、Helm、Kubernetes、Ansible、Terraform。

```typescript
interface Verifier {
  name: string;
  supports(language: string): boolean;
  run(context: VerificationContext): Promise<VerificationResult>;
}

interface VerificationResult {
  verifier: string;
  status: "PASS" | "FAIL" | "ERROR";
  output: string;
  durationMs: number;
}
```

Verification 不交給 LLM：9B 或 Cloud LLM 說「我覺得 code 應該沒問題」都不算數，只有 `pytest / go test / cargo test / npm test / kubectl --dry-run / helm template / ansible-lint / ruff / mypy / semgrep` 才算。**Cloud 產生的 patch 一樣要過 Verification。**

## 5.14 Reflection Engine

Reflection 不直接修改 code，只做 Failure Classification：

```typescript
interface ReflectionResult {
  classification:
    | "coding_error"
    | "knowledge_error"
    | "requirement_error"
    | "environment_error"
    | "tool_error"
    | "model_limitation";
  confidence: number;
  action: "retry" | "research" | "ask_user" | "repair_environment" | "stronger_model" | "stop";
}
```

```text
Knowledge Error    → Research
Coding Error       → Retry Worker
Requirement Error  → Ask User
Environment Error  → Repair Environment
Model Limitation   → Stronger Model（v0.4；v0.3 是 STOP）
```

## 5.15 MCP & Tool Gateway

MCP 第一批：filesystem / git / shell / test / search。所有 MCP Tool 必須經過 Policy Gateway：

```text
Tool Request → Policy Gateway → ALLOW / DENY → MCP Server
```

**MCP Server 不可以自行繞過 Control Plane Policy**（Rule 4）。v0.4 中 Cloud Worker 的 MCP 呼叫同樣受此 Gateway 管制。

## 5.16 ACP-Protocol

v0.4 正式要求 ACP-Protocol 可運作在至少兩個 runtime：

```text
Control Plane ↕ Pi        （已於 v0.3 建立 abstraction boundary）
Control Plane ↕ OpenCode  （v0.4 實作）
```

## 5.17 Memory（SQLite）

SQLite，Phase I 不加 Vector DB。

```text
tasks
attempts
evidence
evidence_sources
policies
worker_runs
patches
verification_results
reflections
project_memory
escalations        ← v0.4 新增
cloud_usage        ← v0.4 新增（provider / model / tokens / cost）
hallucination_evidence ← v0.4 新增（error-signature 分類 + Symbol Probe 結果，§12.4.1）
```

Memory 分三種：**Task Memory、Project Memory、Evidence Memory**。

```json
{
  "project": "example-controller",
  "language": "Go",
  "framework": "controller-runtime",
  "kubernetes_version": "1.31",
  "conventions": ["table-driven-tests", "context-first"],
  "restrictions": ["no_direct_k8s_client"]
}
```

### 核心 SQLite Schema

```sql
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    request TEXT NOT NULL,
    status TEXT NOT NULL,
    complexity TEXT,
    risk TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE evidence (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    claim TEXT NOT NULL,
    source_uri TEXT NOT NULL,
    source_type TEXT NOT NULL,
    version TEXT,
    confidence REAL,
    relevance REAL,
    content_hash TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE verification_results (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    verifier TEXT NOT NULL,
    status TEXT NOT NULL,
    output TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE escalations (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    attempt INTEGER NOT NULL,
    reason TEXT NOT NULL,
    mode TEXT NOT NULL,            -- reviewer / planner / executor
    provider TEXT NOT NULL,        -- anthropic / openai / gemini
    model TEXT NOT NULL,
    action TEXT NOT NULL,          -- review / plan / fix
    tokens_in INTEGER,
    tokens_out INTEGER,
    cost REAL,
    result TEXT NOT NULL,
    created_at TEXT NOT NULL
);
```

## 5.18 Security Boundary

最重要的一條：**LLM ≠ Trusted Component**。所有 filesystem / shell / git / network / secrets 都視為 untrusted capability。

```text
LLM → Tool Request → Policy Gateway → filesystem / shell / git / network
```

預設 Policy：

```yaml
permissions:
  filesystem:
    read: true
    write: policy-controlled
  shell:
    enabled: true
    sandbox: true
  git:
    read: true
    write: policy-controlled
  network:
    enabled: false          # 本地 Worker 預設禁止；僅 Research Engine 有網
```

預設 DENY：

```text
Network          DENY
Secrets          DENY
Host filesystem  DENY
Git push         DENY
Git reset        DENY
Git clean        DENY
Docker socket    DENY
```

**v0.4 安全附加條款（Cloud）：**

- Cloud Provider 的 credentials 只存在於 Control Plane（環境變數 / secrets manager），**絕不下放給 Worker**。
- Cloud 的 tool 權限與本地 Worker 相同（同一份 Tool Policy），不能因為「是強模型」就放寬。
- 所有 Cloud 呼叫都記錄於 `cloud_usage`，用於 cost / token 分析與 Q7 驗證。

## 5.19 Research vs Coding Boundary

```text
                Research
                   │
                   ▼
             Evidence Bundle
                   │
              Evidence Gate
                   │
                   ▼
              Coding Worker
```

而不是：

```text
Coding Worker → Web / Search / Random docs / Coding
```

### Research Agent 可以：Web / Docs / GitHub / Repository / Package metadata

### Coding Worker 只能拿：Task + Evidence Bundle + Repository Context + Execution Policy

v0.4 補充：**Cloud Reviewer / Planner 的輸出也必須轉成 Evidence Bundle / Review Note 結構，再由本地 Worker 執行**——Cloud 不直接改 code（Rule 6）。

---

# 6. Technology Stack

| 元件 | 選擇 | 理由 |
| --- | --- | --- |
| Control Plane | **TypeScript + Node.js** | Pi 是 TypeScript/Node 生態，可共享 MCP SDK、Pi extension、filesystem API、subprocess、Zod、event system；減少 IPC 層數 |
| Web framework | Fastify | 核心 runtime 不需要太厚的 framework abstraction |
| Validation | Zod | — |
| Research Engine | **Python 3.12+** | AI/RAG/research 生態最強（FastAPI、httpx、BeautifulSoup、trafilatura、Pydantic） |
| 資料儲存 | SQLite + FTS5 | Phase I 不用 Vector DB；後續可加 sentence-transformers / Qdrant / FAISS |
| Local LLM | **llama.cpp**（OpenAI-compatible API） | 7B/9B→14B→32B 換模型時 Control Plane 不用改 |
| Model | Qwen / DeepSeek 等 coding/specialized 模型 | 優先 coding model，實際測 Evidence-conditioned coding performance |
| Sandbox | Docker | Verification Sandbox；第一版不用 Kubernetes |
| State / Cache | SQLite / Redis | — |
| Cloud Provider（v0.4） | OpenAI / Anthropic / Gemini adapter | 只做 Escalation Provider；OpenAI-compatible 介面包成 `CloudClient` |
| 額外 Workers（v0.4） | Pi / OpenCode / Goose | Q8 A/B；一律走同一個 Worker Interface |

---

# 7. Repository Layout（monorepo）

```text
agent-control-plane/
│
├── apps/
│   ├── control-plane/
│   │   └── src/
│   │       ├── main.ts
│   │       ├── server.ts
│   │       └── config.ts
│   ├── cli/
│   └── api/
│
├── packages/
│   ├── core/
│   ├── task/
│   ├── policy/
│   ├── state/
│   ├── evidence/
│   ├── research-client/
│   ├── worker-interface/
│   ├── worker-router/
│   ├── model-router/          # v0.4
│   ├── execution-tier/        # v0.4：Execution Strategy Engine
│   ├── escalation/            # v0.4：啟用
│   ├── cloud-client/          # v0.4：OpenAI/Anthropic/Gemini adapter
│   ├── pi-worker/
│   ├── opencode-worker/       # v0.4
│   ├── goose-worker/          # v0.4（可選）
│   ├── mcp/
│   ├── acp/
│   ├── artifact/
│   ├── verification/
│   ├── memory/
│   └── observability/
│
├── services/
│   └── research-engine/       # Python
│       ├── app/
│       ├── research/
│       ├── evidence/
│       └── tests/
│
├── policies/
│   ├── default.yaml
│   ├── coding.yaml
│   ├── research.yaml
│   ├── security.yaml
│   ├── escalation.yaml        # v0.4
│   └── kubernetes.yaml
│
├── schemas/
│   ├── task.schema.json
│   ├── evidence.schema.json
│   ├── policy.schema.json
│   └── worker.schema.json
│
├── benchmark/
│   ├── tasks/
│   ├── datasets/
│   ├── runners/
│   ├── metrics/
│   ├── reports/
│   └── baselines/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── benchmark/
│
├── docs/
├── docker/
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

# 8. CLI

```bash
acp task run "Add support for X"
acp task status TASK-001
acp task inspect TASK-001
acp research TASK-001
acp evidence TASK-001
acp workers list
acp policy validate
acp verify TASK-001
acp logs TASK-001

# v0.4 新增
acp strategy TASK-001        # 顯示 Execution Strategy / Tier 決策
acp escalate TASK-001        # 手動觸發 escalation（reviewer / planner / executor）
acp cloud usage              # cloud token / cost 報表
```

---

# 9. Configuration

```yaml
runtime:
  workspace: "./workspace"
  default_worker: pi-local
  max_attempts: 3

execution:
  strategy: local_first
  local:
    worker: pi
    model: qwen-9b
    max_attempts: 3
  escalation:
    enabled: true
    conditions:
      - repeated_verification_failure
      - insufficient_model_capability
      - conflicting_evidence
      - high_risk_change
  cloud:
    mode: reviewer_first      # reviewer → planner → executor

research:
  enabled: true
  minimum_confidence: 0.85
  max_rounds: 3
  retrievers:
    repository:     true    # Phase 1
    documentation:  true    # Phase 1
    git_history:    true    # Phase 1
    web:            true    # Phase 1

evidence:
  max_tokens: 8000        # Evidence Bundle context 預算（機制見 §5.6.1）
  min_relevance: 0.3
  budget_percent: 0.4     # bundle 佔模型 context window 的上限比例

research_failure:         # §5.8.2：基礎設施失敗的降級路徑
  retry:
    max_attempts: 2
    backoff: [5s, 30s]
  on_partial:
    if_evidence_from_local_sources_sufficient: allow_local
    else: ask_user
  on_failed:
    action: ask_user
    allow_override: true
    override_records_actor: true

verification:
  required: true

cloud:
  providers:                  # 只允許 escalation 使用
    anthropic:
      enabled: false          # 預設關閉，benchmark 需要時開
      models: [claude-sonnet]
    openai:
      enabled: false
      models: [gpt-5]
    # credentials 一律來自環境變數，禁止寫入 repo
```

---

# 10. Local Deployment（macOS / M2 16GB）

```text
macOS
│
├── Node.js
│   └── Control Plane
│
├── Python
│   └── Research Engine
│
├── Pi
│
├── llama.cpp
│   └── 7B / 9B
│
├── SQLite
│
├── Docker
│   └── Verification Sandbox
│
└── Cloud API keys（v0.4，環境變數，僅 Escalation Controller 使用）
```

**不要 Kubernetes。** 第一版直接 local process + Docker sandbox。

---

# 11. Observability

所有 execution 都產生：

```text
Task ID
Attempt ID
Worker ID
Model
Tool calls
Research queries
Evidence
Patch
Verification
Tokens
Latency
Escalation（v0.4）
Cloud cost / tokens（v0.4）
```

```json
{
  "task_id": "TASK-001",
  "worker": "pi-local",
  "model": "qwen-9b",
  "research_rounds": 1,
  "evidence_count": 8,
  "attempt": 2,
  "verification": "passed",
  "escalated": false
}
```

v0.4 範例（escalated）：

```json
{
  "task_id": "TASK-042",
  "worker": "pi-local",
  "model": "qwen-9b",
  "attempt": 3,
  "verification": "failed",
  "escalated": true,
  "escalation": {
    "mode": "reviewer",
    "provider": "anthropic",
    "model": "claude-sonnet",
    "tokens_in": 12000,
    "tokens_out": 1800,
    "cost": 0.09,
    "action": "review"
  },
  "final_result": "passed_by_local_after_cloud_review"
}
```

這會直接成為 benchmark 的資料來源。

---

# 12. Benchmark Architecture

## 12.1 Phase I（v0.3）：Baseline Groups A ~ G

把 benchmark 本身當成產品的一部分。7 組拆法（discuss-11），驗證每個 component 的 marginal gain：

```text
A = 9B
B = 9B + Research
C = 9B + Policy
D = 9B + Verification
E = 9B + Research + Verification
F = 9B + Research + Policy + Verification
G = 9B + Full Control Plane
```

假設範例（實際以跑出來的數據為準）：

```text
A  42%    B  61%    C  48%    D  57%    E  72%    F  81%    G  87%
```

→ 代表 Research 是主要增益來源。

```text
A  42%    B  55%    C  70%    D  58%    E  73%    F  86%    G  90%
```

→ 代表 Policy / Control 才是關鍵。

**G 相對 A 的差值就是 Control Plane Gain（§12.5），是 v0.4 是否啟用的 gate。**

## 12.2 Phase II（v0.4）：Hybrid Groups H ~ K

```text
H = 9B + Full CP + Cloud Reviewer
I = 9B + Full CP + Cloud Planner
J = 9B + Full CP + Cloud Executor
K = Cloud-only（Claude / GPT，無 Control Plane）
```

### 核心比較（Q5 / Q6 / Q7）

| Metric | K: Cloud-only | G: 9B+Full CP | H: G+Reviewer | J: G+Executor |
| --- | ---: | ---: | ---: | ---: |
| Task success | 90%? | 87%? | 88%? | 91%? |
| First-pass success | ? | ? | ? | ? |
| Retry count | ? | ? | ? | ? |
| Hallucinated API | ? | ? | ? | ? |
| Tests passing | ? | ? | ? | ? |
| Unauthorized changes | ? | ? | ? | ? |
| Token usage | 100% | ~0% | ~10%? | ~30%? |
| Latency | ? | ? | ? | ? |
| Cloud dependency | 100% | 0% | 低 | 高 |

關鍵問題：

> **H 能否以接近 K 的 token 比例（預估 10%）保持接近 K 的 success rate？**（Q7）

## 12.3 Benchmark Dataset

第一批 50 tasks，分五類：

```text
10 Python
10 TypeScript
10 Go
10 Kubernetes/Helm
10 Ansible/Terraform
```

再增加：100 → 500 → 1000。

### Task Difficulty

```text
Level 1  Simple function
Level 2  Multi-file modification
Level 3  Dependency/API usage
Level 4  Framework integration
Level 5  Infrastructure / architecture
```

特別重要的是 **Level 3 ~ 5**，因為這才是 Research 的價值所在。

## 12.4 Metrics

| Metric | 公式 |
| --- | --- |
| Task Success Rate | `successful_tasks / total_tasks` |
| First-pass Success Rate | `first_attempt_success / total_tasks` |
| Verification Pass Rate | `passing_final_verification / total_tasks` |
| Retry Count | `average_attempts` |
| Research Accuracy | `correct_evidence / total_evidence` |
| Hallucination Rate | `hallucination_evidence / total_attempts`（判定見 §12.4.1） |
| Unauthorized Modification Rate | `blocked_changes / attempted_changes` |
| Token Usage | `input_tokens + output_tokens` |
| Escalation Rate（v0.4） | `cloud_escalation / total_tasks` |

v0.4 新增 Metrics：

| Metric | 公式 | 回答 |
| --- | --- | --- |
| **Cloud Marginal Gain** | `Success(G+K後) - Success(G)` | Q6 |
| **Cloud Token Ratio** | `cloud_tokens(H) / cloud_tokens(K)` | Q7 |
| **Cost Efficiency** | `success_delta / cost_delta` | Cloud 值得嗎 |
| **Reviewer Efficacy** | `tasks_passed_after_review / cloud_reviews` | Reviewer 模式有效性 |

## 12.4.1 Hallucination Rate — 判定定義（自動化，禁止 LLM-as-judge）

> 原始公式 `invalid_claims / total_claims` 需要一個「評判人」；如果由 LLM 判定，會有**循環驗證 bias**（用 LLM 評 LLM 的幻覺）。因此判定分三層，由客觀到主觀：

### 第一層 — Binary Task Outcome（ground truth）

Task Success 由 verification 的 PASS/FAIL 決定（`pytest` / `go test` / build / lint），不需要任何評判人。這是所有指標的地基。

### 第二層 — Error-Signature 自動分類器（確定性，無 LLM、無人）

每次 verification output 自動掃描以下 pattern，命中即記錄一個 `hallucination_evidence`（含 file:line 與原文）：

```text
ModuleNotFoundError: No module named 'xxx'      → 幻覺 module
ImportError: cannot import name 'xxx'           → 幻覺 symbol
AttributeError: object has no attribute 'xxx'   → 幻覺欄位 / method
Cannot find symbol / undefined reference        → 編譯期幻覺（Go / Rust）
Property does not exist on type（ts2339 類）    → 型別層幻覺（TypeScript）
404 on required API endpoint                    → 幻覺 endpoint（API 整合題）
```

規則：

- 掃描是**字串/正則匹配**，完全確定性，跑在 verification 之後、任何 LLM 之前
- 每個 hit 寫入 `hallucination_evidence` 表（task_id / attempt / pattern_type / file:line / message）
- 分子 = 所有 attempt 的 hit 總數；分母 = total_attempts（或 total_tasks，報告時標明口徑）
- 這同時量化「Research 是否降低幻覺」：比較組別 A vs E/G 的 rate

### 第二層半 — Symbol Probe（自動查證，主動附證據）

分類器只是「偵測」，還不算「查證」。查證在**失敗當下由程序主動執行**，不是事後：

```text
[Verification FAIL 的同一時刻、同一 sandbox（pin 的版本）內自動執行]

候選 symbol / module
   ↓
依語言選擇 probe：
   Python:  python -c "import pkg; print(getattr(pkg, 'sym', None))"
   Go:      go doc pkg sym   （或 go list）
   TypeScript: grep 於 node_modules/pkg 的 .d.ts
   Ruby / JS:  require 或 Object.keys 檢查
   ↓
寫入該 hallucination_evidence 記錄：
   probeResult:   EXISTS | NOT_FOUND | UNABLE_CHECK
   pinnedVersion: requirements.txt / go.mod / package.json 鎖定的版本
   probeOutput:   簡短輸出片段
   evidenceCovered: 該 symbol 是否出現於本次 attempt 的 Evidence Bundle
                    （判斷「Research 是否應該攔下它」的關鍵欄位）
   reflectionClass: 同 attempt 的 Reflection 分類（交叉驗證用）
   sandboxId / timestamp
```

**人不需要重跑查證**：review queue 每筆候選都附上上面的證據，人只做確認或處理少數模糊案例。

### 第三層 — 人樣本校正（估算殘差，rubric 如下）

並非所有幻覺都會報錯（例：「API 存在但參數語義用錯」可能安靜地輸出錯結果）。因此：

- 從各組的失敗 attempt 抽 **N ≈ 20~50 個樣本**，由人類標記是否為幻覺
- 用樣本算第二層分類器的 **precision / recall**，回推校正後的 rate（`adjusted = auto_detected / recall`）
- 校正結果與 precision/recall 一起寫入 benchmark report（不修正原始自動值）

**人的標記流程（不是靠知識，是覆核已附證據）：**

```text
候選記錄已附：
   error message + file:line + pinnedVersion + probeResult
   + probeOutput + evidenceCovered + reflectionClass
人要做的事：
   1. probeResult = NOT_FOUND 且 message 指向外部 symbol
      → 直接標 hallucination（機械確認，通常 < 1 分鐘）
   2. probeResult = EXISTS 或 UNABLE_CHECK
      → 依 rubric 判斷語義誤用 / 環境問題 / coding error
   3. 只有當證據不足（例如 probeOutput 被截斷）才自己重跑 probe
```

**標記 rubric（消除「人各有志」）：**

| 標記 | 定義 | 查證方法 |
| --- | --- | --- |
| **外部知識幻覺** | 引用的 symbol / signature 在 pin 版本中不存在，或與官方文件（該版本）矛盾 | probe = NOT_FOUND＋對照該版官方 docs |
| **coding error（非幻覺）** | 自身程式碼拼錯、import 自己的 module 路徑錯 | 路徑可修改後通過；不涉及外部知識 |
| **環境問題（非幻覺）** | 缺系統相依、Python 版本錯、repo 自己 pin 壞了 | 修環境後同一段 code 通過 |
| **語義誤用（模糊殘差）** | import 得過、編譯得過，但參數語義 / 順序 / 副作用錯 | 存在性查證無效，這裡才需要 judgment |

**人出錯的量化：** N 個樣本由 **2 人各自標記**，報告 Cohen's κ；κ < 0.7 表示 rubric 還不夠機械，修 rubric 而不是信任人。

**明確禁止：** 以 LLM 判定幻覺作為 metric。LLM-as-judge 只允許離線做失敗 taxonomy（了解「為什麼失敗」），不能進任何報告數字。

### 交叉驗證（與既有機制）

| 信號 | 獨立於 | 用途 |
| --- | --- | --- |
| 第二層 error-signature | pytest / LLM | 幻覺直接證據 |
| Reflection `knowledge_error` | error-signature | 幻覺的 agent 側自我歸因 |
| Evidence Gate BLOCK / RESEARCH_AGAIN 次數 | 上述兩者 | **Prevention Rate**：Policy 擋下幻覺的量化 |

兩者同時命中（error-signature + `knowledge_error`）＝高信心幻覺；Prevention Rate = `evidence_gate_blocks / (evidence_gate_blocks + hallucinations_that_passed_gate)`。

## 12.5 最重要的 Metric：Control Plane Gain

```text
CP Gain =
Success Rate(9B + Full Control Plane)
-
Success Rate(9B Raw)
```

```text
Raw 9B               38%
Full Control Plane   71%
CP Gain              +33 percentage points
```

**v0.3 → v0.4 的啟動 gate：CP Gain 必須明顯為正（例如 ≥ +15pp）。**

## 12.6 Intelligence Efficiency

```text
Intelligence Efficiency = Task Success / Model Compute
```

或比較 `Success / Token`。回答：**Control Plane 到底有沒有用「系統工程」取代部分「模型參數」？**

## 12.7 Research ROI

```text
Research ROI = Success Gain / Research Cost
```

Research cost 包含：Web requests、Latency、Tokens、Local compute。判斷：**Research 是不是每次都值得做。**

## 12.8 必須保留的實驗結果（results-keep）

* Raw 7B/9B baseline（A）
* Research + 7B/9B（B/E）
* Full Control Plane + 7B/9B（G）
* v0.4：G + Cloud Reviewer / Planner / Executor（H / I / J）與 Cloud-only（K）
* Task Success Rate
* First-pass Success Rate
* 平均 Retry 次數
* Research 成本 / 延遲
* Hallucination Rate（自動 error-signature 分類，§12.4.1）＋人樣本校正的 precision/recall
* Evidence Gate Prevention Rate（Policy 擋下幻覺的量化）
* 最終 Verification Pass Rate
* **每次 attempt 的完整 event log**（之後可回頭分析是哪一層造成差異）
* v0.4：每次 escalation 的完整記錄（原因 / mode / provider / tokens / cost / 結果）

目標是不先假設「Control Plane 一定有效」，讓數據自己回答。

---

# 13. v0.4 E2E Example

使用者：「讓這個 Kubernetes controller 支援某個新 API。」

```text
User
 │
 ▼
Task Analyzer
 │  ├── Go / controller-runtime / Kubernetes API / version-sensitive
 ▼
Policy Engine
 │
 ▼
Research Required
 │
 ▼
Python Research（K8s docs / controller-runtime docs / upstream / project repo）
 │
 ▼
Evidence Bundle
 │
 ▼
Evidence Gate → PASS
 │
 ▼
Pi + 9B
 │
 ▼
Patch
 │
 ▼
Artifact Controller → Build → Test
 │
 ▼
FAIL × 2（Retry + Research 後仍失敗）
 │
 ▼
Reflection → model_limitation（confidence high）
 │
 ▼
Escalation Controller → Cloud Reviewer（1 次 API call）
 │     檢查 patch、回傳 Review / Fix Plan（不直接改 code）
 ▼
Pi + 9B implementation
 │
 ▼
Test → PASS
 │
 ▼
COMPLETE
```

整個過程：**1 次 Cloud call（reviewer mode，只讀不寫）。** 這是 v0.4 的典型成功路徑；Cloud Executor 只有在 Reviewer + Planner 都無法解救時才會被觸發。

---

# 14. Definition of Done（v0.4）

## Gate 0（v0.3 前置條件，必須先成立）

* [ ] Phase I benchmark 完成（A ~ G）
* [ ] CP Gain 明顯為正（建議 ≥ +15pp）
* [ ] 每次 attempt 的 event log 已存檔

## Functional（v0.4 新增項目標 ⭐）

* [ ] Execution Strategy Engine 可運作 ⭐
* [ ] Escalation Controller 依 Policy 觸發，不依賴 LLM ⭐
* [ ] Cloud Reviewer / Planner / Executor 三種 mode 可運作 ⭐
* [ ] Cloud 產生的 patch 通過同一套 Artifact / Verification ⭐
* [ ] `cloud_usage` / `escalations` 記錄完整 ⭐
* [ ] OpenCode Worker 可跑通 ACP-Protocol ⭐
* [ ] （既有）Task lifecycle / Policy / Research / Evidence Gate / Pi Worker / Artifact / Verification / Reflection / Retry / MCP Gateway / Audit Log

## Architectural（v0.4）

* [ ] LLM 無 Policy 權限、無 Artifact bypass 權限
* [ ] Research 與 Coding 分離
* [ ] Worker 與 Control Plane 分離
* [ ] MCP 與 Authorization 分離
* [ ] Worker / Model / Execution Tier 分離 ⭐
* [ ] Cloud 只有 escalation 路徑；local_first 為 default ⭐
* [ ] Cloud credentials 不進 Worker、不進 repo ⭐

## Experimental（v0.4）

* [ ] H / I / J / K 四組 hybrid benchmark 完成 ⭐
* [ ] Cloud Marginal Gain（Q6）量化 ⭐
* [ ] Cloud Token Ratio（Q7）量化 ⭐
* [ ] Reviewer Efficacy 量化 ⭐
* [ ] （既有）Success / First-pass / Retry / Hallucination / Research ROI / CP Gain

---

# 15. Implementation Order（v0.4）

## Phase I（v0.3，已定義於 spec-v0.3.md，摘要）

```text
Phase 1  Pi + Local Model（repo 骨架、Task model、CLI、SQLite）
Phase 2  Policy + Artifact + Verification
Phase 3  Research + Evidence Gate
         （四種 retriever 全部啟用：repository / docs / git history / web）
Phase 4  Reflection + Retry
Phase 5  Benchmark（A ~ G）
──────────────────────────────
        Architecture Validation
──────────────────────────────
```

## Phase II（v0.4）

```text
Phase 6  ACP-Protocol（Control Plane ↔ Pi 正式化，spawn/event/interrupt）
Phase 7  MCP + Tool Gateway 完整化
Phase 8  Multi Worker（OpenCode Worker、Goose Worker 候選）
Phase 9  Execution Strategy Engine + Model Router
Phase 10 Cloud Escalation（reviewer_first → planner → executor）
Phase 11 Hybrid Benchmark（H / I / J / K）+ Q6/Q7 分析
```

注意順序：**先 ACP/MCP/Multi Worker，最後才是 Cloud Escalation**。理由與 v0.3 相同——先證明每一層本地能力，Cloud 才不會污染實驗結果。

### 第一個 Hybrid E2E 測試

沿用 Phase I 的 Python repository 情境，外加：

> Same task，強制走 `model_limitation` 路徑 → 觸發 Cloud Reviewer → Local 重做 → 比較「有 / 無 reviewer」的 success 與 token。

---

# 16. Roadmap：v0.4 → v0.5 → Production

```text
v0.3  Local-only validation
       ↓      證明 Control Plane 有效
v0.4  Hybrid execution（Cloud = Escalation Provider）
       ↓      Q6/Q7 數據支持
v0.5  Multi Worker Optimization
       │
       ├── Worker Router 依 task / cost / latency 動態選擇
       ├── Model Router（local 14B/32B 條件啟用）
       ├── Project Memory / Evidence Cache 跨 task 再用
       └── Execution Tier 策略學習（哪種 tier 對哪類 task 最划算）
       ↓
Production ACP
       │
       ├── Linux / Kubernetes deployment
       ├── 多使用者 / 多 repo 並行 task
       └── 安全硬化（sandbox 強化、secrets 管理、審計）
```

### 最終產品演進

```text
                    ┌──────────────────────┐
                    │   v0.1 Architecture │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │ v0.2 Implementation │
                    └──────────┬───────────┘
                               ▼
             ┌────────────────────────────────┐
             │ v0.3 Local Intelligence Test │
             │       9B + Control Plane      │
             └───────────────┬────────────────┘
                             │
                       Benchmark (A-G)
                             │
                             ▼
                   ┌─────────────────┐
                   │ Does CP work?   │
                   └───────┬─────────┘
                           ▼
                 ┌─────────────────────┐
                 │ v0.4 Hybrid Agent   │
                 │  Local + Cloud      │
                 └──────────┬──────────┘
                            ▼
                 ┌─────────────────────┐
                 │ v0.5 Multi Worker   │
                 │ Pi/OpenCode/Goose   │
                 └──────────┬──────────┘
                            ▼
                 ┌─────────────────────┐
                 │ Production ACP      │
                 └─────────────────────┘
```

---

# 17. 最終產品定位

不是「Coding Agent」，而是 **Agent Control Plane**。Pi / OpenCode / Goose / Cloud 都只是 Execution Workers。

```text
                         Agent Control Plane
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
          Knowledge            Policy            Execution
              │                   │                   │
       Research/Evidence     Permissions       Worker Router
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                         ┌────────┴────────┐
                         ▼                 ▼
                       Local             Cloud
                       Workers           Workers
                         │                 │
                     Pi / etc.        Claude/etc.
```

核心資產不是某一個模型，也不是 Pi，而是：

> **Policy + Evidence + Memory + Worker Interface + Verification + Control Loop**

這些東西未來即使模型從 9B 換成 30B、從 Pi 換成其他 runtime，架構仍然成立。

---

# 18. 最重要的設計決策（一句話總結）

Phase I（v0.3）：

> **「先限制模型，再測系統。」**

表示為：`Pi + 7B/9B + Research + Policy + Evidence + Artifact Control + Verification + Reflection`，**沒有 Cloud**。若 `Raw 9B ≈ 40%` vs `9B + Control Plane ≈ 75%`，證明我們不是在增加模型 intelligence，而是在增加 **system-level intelligence**。

Phase II（v0.4）：

> **「證明系統有效之後，才精確測量 Cloud 還能再增加多少。」**

表示為：**local_first + Cloud 只做 escalation（reviewer → planner → executor）**，並用 Q6（Cloud Marginal Gain）與 Q7（Cloud Token Ratio）回答：

- **「Control Plane 已經把 9B 提升到什麼程度，而 Cloud LLM 還能再增加多少？」**

v0.4 的價值，就是讓這兩個數字都被數據回答，而不是停留在架構推演。