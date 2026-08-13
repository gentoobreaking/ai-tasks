可以。這次 v0.3 我會把前面討論的關鍵修正正式納入：

> **v0.3 的第一目標不是做一個「會 fallback 到 Cloud 的 Coding Agent」，而是驗證「Control Plane 能否顯著放大本地 7B/9B Coding Worker 的能力」。**

因此 **Cloud 在 Architecture Validation Phase 完全不存在**。
只有當 v0.3 benchmark 完成後，才作為 Phase 2 的 optional extension。

---

# Agent Control Plane

## Implementation Specification v0.3

**Status:** Development Specification
**Version:** 0.3
**Primary Runtime:** TypeScript + Node.js
**Research Runtime:** Python
**Initial Coding Worker:** Pi
**Initial Model:** Local 7B/9B
**External Model:** Disabled during validation
**Protocols:** MCP / ACP-Protocol / Worker Interface
**Storage:** SQLite
**Initial Platform:** macOS Apple Silicon

---

# 1. v0.3 核心目標

系統要驗證的不是：

> 「AI 能不能寫程式？」

而是：

> **「Control Plane + Research + Policy + Verification + Reflection，能否讓一個原本能力有限的 7B/9B Coding Model，可靠地完成更複雜的 Coding Task？」**

因此 v0.3 必須回答五個問題：

### Q1

**Research 是否能降低 LLM hallucination？**

### Q2

**Policy 是否能降低錯誤操作？**

### Q3

**Verification + Reflection 是否能讓小模型自我修正？**

### Q4

**Control Plane 組合起來是否產生 synergy？**

### Q5

**9B + Control Plane 是否可以接近部分 Cloud Coding Agent 的效果？**

---

# 2. Architecture Principle

v0.3 強制遵守：

```text
LLM ≠ Controller
LLM ≠ Policy
LLM ≠ Security Boundary
LLM ≠ Source of Truth
```

LLM 是：

> **Coding Worker**

而不是 Agent 的最高控制者。

---

# 3. v0.3 Architecture

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

注意：

**整張圖沒有 Cloud。**

這是刻意的。

---

# 4. Architecture Layers

v0.3 分成七層：

```text
Layer 7  User Interface
Layer 6  Control Plane
Layer 5  Research / Evidence
Layer 4  Worker Interface
Layer 3  Agent Runtime
Layer 2  MCP Tools
Layer 1  Execution / Verification
```

---

# 5. Layer 6 — Agent Control Plane

這是核心。

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
└── Memory Manager
```

---

# 6. Task Manager

負責建立與管理 Task。

```typescript
interface TaskManager {

  create(
    request: string,
    context: RepositoryContext
  ): Promise<Task>;

  get(
    taskId: string
  ): Promise<Task>;

  updateStatus(
    taskId: string,
    status: TaskStatus
  ): Promise<void>;
}
```

---

# 7. Task Analyzer

Task Analyzer 不負責 Coding。

只負責：

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

輸出：

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

---

# 8. Policy Engine

Policy 是 Control Plane 的核心。

```text
Policy
│
├── Research Policy
├── Tool Policy
├── Artifact Policy
├── Verification Policy
├── Retry Policy
├── Reflection Policy
└── Resource Policy
```

---

# 9. Research Policy

例如：

```yaml
research:

  enabled: true

  required_when:

    - external_api
    - unknown_dependency
    - version_sensitive
    - unfamiliar_framework
    - security_sensitive
    - low_confidence

  minimum_sources: 2

  official_source_preferred: true

  max_rounds: 3
```

---

# 10. Research Engine

Python service。

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

---

# 11. Research Pipeline

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

---

# 12. Evidence

Evidence 是一級 Domain Object。

```typescript
interface Evidence {

  id: string;

  claim: string;

  source: {
    type:
      | "official"
      | "repository"
      | "github"
      | "issue"
      | "web";

    uri: string;

    title?: string;
  };

  version?: string;

  confidence: number;

  relevance: number;

  retrievedAt: string;

  contentHash: string;
}
```

---

# 13. Evidence Bundle

```typescript
interface EvidenceBundle {

  id: string;

  taskId: string;

  facts: Evidence[];

  constraints: string[];

  versions: Record<string, string>;

  unresolvedQuestions: string[];

  confidence: number;
}
```

Worker 不直接使用：

```text
Raw Web Search
```

而是使用：

```text
Evidence Bundle
```

---

# 14. Evidence Gate

這是 v0.3 最重要的 Gate 之一。

```text
Research
   │
   ▼
Evidence Bundle
   │
   ▼
Evidence Gate
   │
   ├── PASS
   │
   ├── RESEARCH_AGAIN
   │
   └── BLOCK
```

```typescript
interface EvidenceGate {

  validate(
    task: Task,
    evidence: EvidenceBundle
  ): Promise<EvidenceDecision>;
}
```

---

# 15. Worker Interface

v0.3 只有一個正式 Worker：

> **Pi Worker**

但 interface 必須保持 generic。

```typescript
interface CodingWorker {

  initialize(
    context: WorkerContext
  ): Promise<void>;

  execute(
    request: WorkerRequest
  ): Promise<WorkerResult>;

  interrupt(): Promise<void>;

  shutdown(): Promise<void>;
}
```

---

# 16. Pi Worker

架構：

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
Local LLM
```

模型可以是：

```text
7B
9B
```

例如：

```text
Qwen
Llama
DeepSeek
其他 coding-capable local model
```

**模型名稱不是 Control Plane 的 dependency。**

---

# 17. Worker Selection

v0.3 不需要真正的 Multi-Worker Router。

只保留：

```text
Worker Router
      │
      ▼
   Pi Local
```

但 API 保留：

```typescript
interface WorkerRouter {

  select(
    task: Task,
    strategy: ExecutionStrategy
  ): Promise<CodingWorker>;
}
```

這樣 v0.4 才能加入：

```text
OpenCode
Goose
Cloud
```

---

# 18. Execution Strategy

v0.3：

```yaml
execution:

  mode: local_only

  worker: pi

  model: local

  allow_cloud: false
```

程式層也必須 enforce：

```typescript
if (config.execution.allowCloud) {
    throw new Error(
      "Cloud execution is not supported in v0.3 validation mode"
    );
}
```

這不是 prompt。

是**硬限制**。

---

# 19. Artifact Controller

Worker 產生 Patch：

```text
Pi
 ↓
Patch
 ↓
Artifact Controller
 ↓
Policy
 ↓
ALLOW / DENY
```

```typescript
interface ArtifactController {

  validate(
    patch: Patch
  ): Promise<ArtifactDecision>;

  apply(
    patch: Patch
  ): Promise<AppliedPatch>;

  rollback(
    patchId: string
  ): Promise<void>;
}
```

---

# 20. Artifact Policy

```yaml
artifact:

  allowed:
    - "src/**"
    - "lib/**"
    - "tests/**"

  readonly:
    - "package-lock.json"

  forbidden:
    - ".git/**"
    - ".env"
    - "secrets/**"
```

---

# 21. Verification Engine

v0.3 必須有。

第一階段：

```text
Git Diff
Test
Build
Lint
Type Check
```

後續：

```text
Security Scan
Container Build
Helm
Kubernetes
Ansible
Terraform
```

---

# 22. Verification Result

```typescript
interface VerificationResult {

  verifier: string;

  status:
    | "PASS"
    | "FAIL"
    | "ERROR";

  output: string;

  durationMs: number;
}
```

---

# 23. Reflection Engine

Reflection 不直接修改 code。

它分析：

```text
Verification Failure
       ↓
Failure Classification
```

分類：

```text
coding_error
knowledge_error
requirement_error
environment_error
tool_error
model_limitation
```

---

# 24. Reflection Decision

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

  action:
    | "retry"
    | "research"
    | "ask_user"
    | "repair_environment"
    | "stop";
}
```

---

# 25. Retry Policy

v0.3：

```yaml
retry:

  enabled: true

  max_attempts: 3

  on:

    coding_error:
      action: retry

    knowledge_error:
      action: research

    requirement_error:
      action: ask_user

    environment_error:
      action: repair

    model_limitation:
      action: stop
```

**注意最後一個。**

v0.3：

```text
model_limitation
       ↓
STOP
```

而不是：

```text
model_limitation
       ↓
Cloud
```

因為我們正在做能力測試。

---

# 26. State Machine

完整狀態：

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
   ↓
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
          │
          ├── RESEARCH
          │
          ├── ASK_USER
          │
          └── STOP
```

---

# 27. MCP

MCP 在 v0.3 可以實作，但它不是核心能力 benchmark。

第一批：

```text
filesystem
git
shell
test
search
```

但是所有 MCP Tool 必須經過：

```text
Tool Request
 ↓
Policy Gateway
 ↓
ALLOW / DENY
```

---

# 28. ACP-Protocol

v0.3 只要求：

> **建立 abstraction boundary，不要求立即支援多種 Agent Runtime。**

第一個：

```text
Control Plane
      ↕
Pi
```

後續：

```text
Control Plane
      ↕
OpenCode
```

---

# 29. Memory

v0.3 使用：

```text
SQLite
```

資料：

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
```

不加入 Vector DB。

---

# 30. Project Memory

例如：

```json
{
  "project": "example-controller",
  "language": "Go",
  "framework": "controller-runtime",
  "kubernetes_version": "1.31",
  "conventions": [
    "table-driven-tests",
    "context-first"
  ]
}
```

Research Engine 可以先查：

```text
Project Memory
```

再決定：

```text
需要重新 research 嗎？
```

---

# 31. Security Boundary

v0.3：

```text
LLM
 │
 ▼
Tool Request
 │
 ▼
Policy Gateway
 │
 ├── filesystem
 ├── shell
 ├── git
 └── network
```

預設：

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
    enabled: false
```

---

# 32. Research vs Coding Boundary

這裡要非常清楚。

### Research Agent

可以：

```text
Web
Docs
GitHub
Repository
Package metadata
```

### Coding Worker

只能拿：

```text
Task
+
Evidence Bundle
+
Repository Context
+
Execution Policy
```

因此：

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
Coding Worker
     │
     ├── Web
     ├── Search
     ├── Random docs
     └── Coding
```

這正是我們想驗證的 architecture。

---

# 33. Benchmark Architecture

這是 v0.3 與 v0.2 最大的差異。

我們要把 benchmark 本身當成產品的一部分。

```text
benchmark/
│
├── tasks/
├── datasets/
├── runners/
├── metrics/
├── reports/
└── baselines/
```

---

# 34. Baseline Groups

至少做：

### A — Raw Model

```text
9B
 ↓
Coding
```

---

### B — Research Only

```text
9B
 ↓
Research
 ↓
Coding
```

---

### C — Control Only

```text
9B
 ↓
Policy
 ↓
Verification
 ↓
Coding
```

---

### D — Research + Verification

```text
9B
 ↓
Research
 ↓
Coding
 ↓
Verification
 ↓
Retry
```

---

### E — Full Control Plane

```text
9B
 ↓
Research
 ↓
Evidence Gate
 ↓
Policy
 ↓
Coding
 ↓
Artifact Gate
 ↓
Verification
 ↓
Reflection
 ↓
Retry / Research
```

**E 才是 v0.3 的核心實驗組。**

---

# 35. Benchmark Dataset

第一批不要追求大量。

建議：

```text
50 tasks
```

分：

```text
10 Python
10 TypeScript
10 Go
10 Kubernetes/Helm
10 Ansible/Terraform
```

再增加：

```text
100
500
1000
```

---

# 36. Task Difficulty

```text
Level 1
Simple function

Level 2
Multi-file modification

Level 3
Dependency/API usage

Level 4
Framework integration

Level 5
Infrastructure / architecture
```

特別重要的是 Level 3～5。

因為這才是 Research 的價值所在。

---

# 37. Metrics

核心 KPI：

### Task Success Rate

```text
successful_tasks / total_tasks
```

### First Attempt Success

```text
first_attempt_success / total_tasks
```

### Verification Pass Rate

```text
passing_final_verification / total_tasks
```

### Retry Count

```text
average_attempts
```

### Research Accuracy

```text
correct_evidence / total_evidence
```

### Hallucination Rate

```text
invalid_claims / total_claims
```

### Unauthorized Modification Rate

```text
blocked_changes / attempted_changes
```

### Token Usage

```text
input_tokens
output_tokens
```

---

# 38. 最重要的 Metric

我會增加一個：

# Control Plane Gain

定義：

```text
CP Gain =
Success Rate(9B + Full Control Plane)
-
Success Rate(9B Raw)
```

例如：

```text
Raw 9B               38%
Full Control Plane   71%

CP Gain              +33 percentage points
```

這才是整個專案最重要的數字。

---

# 39. 第二個重要 Metric

## Intelligence Efficiency

可以定義：

```text
Intelligence Efficiency =
Task Success / Model Compute
```

或比較：

```text
Success / Token
```

這會回答：

> **Control Plane 到底有沒有用「系統工程」取代部分「模型參數」。**

---

# 40. 第三個重要 Metric

## Research ROI

```text
Research ROI =
Success Gain
/
Research Cost
```

Research cost 可以包含：

```text
Web requests
Latency
Tokens
Local compute
```

這能判斷：

> Research 是不是每次都值得做。

---

# 41. v0.3 E2E Example

例如使用者：

> 「讓這個 Kubernetes controller 支援某個新 API。」

流程：

```text
User
 │
 ▼
Task Analyzer
 │
 ├── Go
 ├── controller-runtime
 ├── Kubernetes API
 └── version-sensitive
 │
 ▼
Policy Engine
 │
 ▼
Research Required
 │
 ▼
Python Research
 │
 ├── Kubernetes docs
 ├── controller-runtime docs
 ├── upstream repository
 └── project repository
 │
 ▼
Evidence Bundle
 │
 ▼
Evidence Gate
 │
 ▼
Pi + 9B
 │
 ▼
Patch
 │
 ▼
Artifact Controller
 │
 ▼
Build
 │
 ▼
Test
 │
 ▼
FAIL
 │
 ▼
Reflection
 │
 └── knowledge_error
       │
       ▼
    Research Again
       │
       ▼
     Pi + 9B
       │
       ▼
      Test
       │
       ▼
      PASS
       │
       ▼
     COMPLETE
```

整個過程：

**0 次 Cloud。**

---

# 42. v0.3 Definition of Done

不是：

> 「Control Plane 可以執行。」

而是下面全部成立：

### Functional

* [ ] Task lifecycle 可運作
* [ ] Policy Engine 可運作
* [ ] Research Engine 可運作
* [ ] Evidence Bundle 可建立
* [ ] Evidence Gate 可阻擋 Coding
* [ ] Pi Worker 可執行
* [ ] Artifact Controller 可阻擋非法修改
* [ ] Verification 可執行
* [ ] Reflection 可分類 failure
* [ ] Retry 可執行
* [ ] MCP Tool Gateway 可執行
* [ ] Audit Log 完整

### Architectural

* [ ] LLM 無 Policy 權限
* [ ] LLM 無 Artifact bypass 權限
* [ ] Research 與 Coding 分離
* [ ] Worker 與 Control Plane 分離
* [ ] MCP 與 Authorization 分離
* [ ] Cloud 完全 disabled

### Experimental

* [ ] Raw 9B baseline
* [ ] Research baseline
* [ ] Control baseline
* [ ] Full Control Plane
* [ ] 50+ benchmark tasks
* [ ] Success Rate
* [ ] First-pass Rate
* [ ] Retry Rate
* [ ] Hallucination Rate
* [ ] Research ROI
* [ ] Control Plane Gain

---

# 43. v0.3 → v0.4

完成 benchmark 後才開：

```text
v0.4
│
├── Cloud Worker
├── OpenCode Worker
├── Goose Worker
├── Model Router
├── Execution Tier
└── Cloud Escalation
```

這時：

```text
v0.3
Local-only validation
       ↓
證明 Control Plane 有效
       ↓
v0.4
Hybrid execution
```

---

# 44. 最終產品演進

整個 roadmap 我會定成：

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
             │                                │
             │       9B + Control Plane      │
             └───────────────┬────────────────┘
                             │
                       Benchmark
                             │
                             ▼
                   ┌─────────────────┐
                   │ Does CP work?   │
                   └───────┬─────────┘
                           │
                           ▼
                 ┌─────────────────────┐
                 │ v0.4 Hybrid Agent   │
                 │                     │
                 │ Local + Cloud       │
                 └──────────┬──────────┘
                            ▼
                 ┌─────────────────────┐
                 │ v0.5 Multi Worker   │
                 │                     │
                 │ Pi/OpenCode/Goose   │
                 └──────────┬──────────┘
                            ▼
                 ┌─────────────────────┐
                 │ Production ACP      │
                 └─────────────────────┘
```

---

# 45. 我認為 v0.3 最重要的設計決策

這次其實可以把整個專案濃縮成一句話：

> **「先限制模型，再測系統。」**

而不是：

> 「讓模型遇到困難時找一個更強的模型。」

所以 v0.3 故意把能力限制在：

```text
Pi
+
7B/9B
+
Research
+
Policy
+
Evidence
+
Artifact Control
+
Verification
+
Reflection
```

**沒有 Cloud。**

如果最後結果真的顯示：

```text
Raw 9B
        ↓
   40% success

9B + Control Plane
        ↓
   75% success
```

那這個架構就真的證明了一件很有價值的事情：

> **我們不是單純增加模型 intelligence，而是在增加「system-level intelligence」。**

這也會讓後面的 Cloud Worker 變得非常有意思——因為到 v0.4，我們就可以精確測量：

**「Control Plane 已經把 9B 提升到什麼程度，而 Cloud LLM 還能再增加多少？」**

這會比一開始就把 Cloud 接進來，得到的實驗結果乾淨非常多。

