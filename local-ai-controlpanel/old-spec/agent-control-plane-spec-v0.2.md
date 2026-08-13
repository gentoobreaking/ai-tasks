可以。這一版我會直接把它往**可以開始建立 repository、開 issue、讓 Pi/其他 Coding Agent 按 module 實作**的程度拆。

我先把一個關鍵名稱固定下來：

> **ACP = Agent Control Plane** 是我們自己的 Control Plane。
> **ACP = Agent Client Protocol** 則是外部 agent protocol。
> 為避免規格混淆，文件中分別寫成 **Control Plane（ACP-Ctrl）** 與 **Agent Client Protocol（ACP-Protocol）**。

---

# Agent Control Plane

## Implementation Specification v0.2

**Status:** Draft
**Version:** 0.2
**Primary Runtime:** TypeScript + Node.js
**Research Runtime:** Python
**Coding Worker:** Pi
**Local Model:** llama.cpp-compatible 7B/9B
**Protocols:** MCP + Agent Client Protocol + Worker Interface
**Initial Platform:** macOS / Apple Silicon
**Future Platform:** Linux / Kubernetes

---

# 1. System Architecture

最終架構固定為：

```text
                                  ┌──────────────┐
                                  │     User     │
                                  └──────┬───────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    AGENT CONTROL PLANE                       │
│                        TypeScript                            │
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐             │
│  │ Task       │ │ Policy     │ │ State        │             │
│  │ Manager    │ │ Engine     │ │ Machine      │             │
│  └────────────┘ └────────────┘ └──────────────┘             │
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐             │
│  │ Evidence   │ │ Worker     │ │ Artifact     │             │
│  │ Gate       │ │ Router     │ │ Controller   │             │
│  └────────────┘ └────────────┘ └──────────────┘             │
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐             │
│  │ Verification│ │ Escalation│ │ Memory       │             │
│  │ Controller │ │ Controller │ │ Manager      │             │
│  └────────────┘ └────────────┘ └──────────────┘             │
└───────────────┬───────────────────────┬──────────────────────┘
                │                       │
        Research API              Worker Interface
                │                       │
                ▼                       ▼
      ┌──────────────────┐     ┌─────────────────────────┐
      │ Research Engine  │     │ Worker Runtime          │
      │ Python           │     │                         │
      │                  │     │ ┌─────┐ ┌────────┐     │
      │ Web              │     │ │ Pi  │ │OpenCode│     │
      │ Docs             │     │ └──┬──┘ └────────┘     │
      │ Repository       │     │    │                   │
      │ Dependency       │     │    ▼                   │
      │ Evidence         │     │ Local / Cloud LLM      │
      └────────┬─────────┘     └─────────────────────────┘
               │
               ▼
       ┌────────────────┐
       │ Evidence Store │
       │ SQLite + FTS   │
       └────────────────┘

                        │
                        ▼
              ┌────────────────────┐
              │ Verification Layer │
              │                    │
              │ Test / Build / Lint│
              │ SAST / Dry-run     │
              └────────────────────┘
```

---

# 2. Technology Stack

## 2.1 Control Plane

### TypeScript

```text
Node.js
TypeScript
pnpm
Fastify
Zod
SQLite
```

我會選 **Fastify** 而不是一開始使用 NestJS。

原因很簡單：

Control Plane 是核心 runtime，不需要太厚的 framework abstraction。

---

# 3. Research Engine

Python：

```text
Python 3.12+
FastAPI
httpx
BeautifulSoup
trafilatura
Pydantic
SQLite
```

後續可以增加：

```text
sentence-transformers
Qdrant
FAISS
```

但 MVP **先不要 Vector DB**。

先：

```text
SQLite
+
FTS5
```

就夠。

因為第一階段真正需要驗證的是：

> Research 是否提升 Coding 成功率？

不是：

> RAG database 能不能做到 1 億筆資料。

---

# 4. Repository Layout

```text
agent-control-plane/
│
├── apps/
│   │
│   ├── control-plane/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── server.ts
│   │   │   └── config.ts
│   │   └── package.json
│   │
│   └── cli/
│       └── src/
│
├── packages/
│   │
│   ├── core/
│   ├── task/
│   ├── policy/
│   ├── state/
│   ├── evidence/
│   ├── research-client/
│   ├── worker-interface/
│   ├── worker-router/
│   ├── pi-worker/
│   ├── mcp/
│   ├── acp/
│   ├── artifact/
│   ├── verification/
│   ├── escalation/
│   ├── memory/
│   └── observability/
│
├── services/
│   │
│   └── research-engine/
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
│   └── kubernetes.yaml
│
├── schemas/
│   ├── task.schema.json
│   ├── evidence.schema.json
│   ├── policy.schema.json
│   └── worker.schema.json
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── benchmark/
│
├── docs/
│
├── docker/
│
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

# 5. Core Domain Model

先把 Domain Model 固定。

最重要的 entity：

```text
Task
Policy
Evidence
EvidenceBundle
Plan
Worker
Patch
Artifact
Verification
Attempt
Escalation
Memory
```

---

# 6. Task

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
```

Repository：

```typescript
interface RepositoryContext {
  path: string;

  gitBranch: string;

  commit: string;

  languages: string[];

  detectedFrameworks: string[];

  detectedDependencies: Dependency[];
}
```

---

# 7. Task State Machine

固定 State：

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
  ↓
REFLECTION
  ↓
RETRY / ESCALATE / COMPLETE
```

其中：

```text
RESEARCH_REQUIRED
```

不是 LLM 自己決定。

由：

```text
Policy Engine
+
Task Analyzer
```

共同決定。

---

# 8. Policy Engine

Policy Engine 是核心。

Interface：

```typescript
interface PolicyEngine {
  evaluateTask(
    task: Task
  ): Promise<TaskPolicyDecision>;

  evaluateResearch(
    task: Task,
    evidence: EvidenceBundle
  ): Promise<ResearchDecision>;

  evaluateArtifact(
    patch: Patch,
    policy: ArtifactPolicy
  ): Promise<ArtifactDecision>;

  evaluateTool(
    tool: ToolRequest
  ): Promise<ToolDecision>;

  evaluateEscalation(
    context: EscalationContext
  ): Promise<EscalationDecision>;
}
```

---

# 9. Policy Schema

例如：

```yaml
version: "1"

research:

  required_when:

    - unknown_dependency
    - version_sensitive
    - external_api
    - unfamiliar_framework
    - low_confidence
    - security_sensitive

  minimum_sources: 2

  preferred_sources:

    - official_documentation
    - repository
    - upstream_issue

artifact:

  allowed:
    - "src/**"
    - "tests/**"

  readonly:
    - "package-lock.json"
    - "go.mod"

  forbidden:
    - ".git/**"
    - "secrets/**"
    - ".env"

verification:

  required:

    - unit_test
    - lint

escalation:

  max_local_attempts: 3

  triggers:

    - repeated_failure
    - conflicting_evidence
    - high_complexity
```

---

# 10. Research Engine

Research Engine 必須是：

> **deterministic pipeline + LLM optional**

而不是完全依賴 LLM。

流程：

```text
Task
 ↓
Research Planner
 ↓
Query Generator
 ↓
Source Retrieval
 ↓
Document Extraction
 ↓
Version Detection
 ↓
Claim Extraction
 ↓
Evidence Ranking
 ↓
Evidence Validation
 ↓
Evidence Bundle
```

---

# 11. Research Sources

第一版支援：

```text
Repository
Official Documentation
GitHub
Web Search
Package Metadata
Git History
```

來源優先順序：

```text
Official Documentation
        ↓
Repository
        ↓
Upstream Repository
        ↓
Official Issue / Release
        ↓
Trusted Technical Source
        ↓
General Web
```

---

# 12. Evidence Object

```typescript
interface Evidence {
  id: string;

  claim: string;

  source: EvidenceSource;

  version?: string;

  confidence: number;

  relevance: number;

  retrievedAt: string;

  contentHash: string;
}
```

Source：

```typescript
interface EvidenceSource {
  type:
    | "official"
    | "repository"
    | "github"
    | "issue"
    | "web";

  uri: string;

  title?: string;

  publisher?: string;
}
```

---

# 13. Evidence Bundle

這是 **Research → Coding** 的正式 contract。

```typescript
interface EvidenceBundle {
  id: string;

  taskId: string;

  facts: Evidence[];

  constraints: string[];

  versions: Record<string, string>;

  unresolvedQuestions: string[];

  confidence: number;

  generatedAt: string;
}
```

Worker **只拿 Evidence Bundle，不直接拿整個 Research Engine state。**

這一點非常重要。

---

# 14. Evidence Gate

```typescript
interface EvidenceGate {
  validate(
    task: Task,
    bundle: EvidenceBundle
  ): Promise<EvidenceDecision>;
}
```

Decision：

```typescript
type EvidenceDecision =
  | {
      status: "PASS";
      confidence: number;
    }
  | {
      status: "RESEARCH_AGAIN";
      missing: string[];
    }
  | {
      status: "ESCALATE";
      reason: string;
    };
```

---

# 15. Worker Interface

這是整個系統最重要的 abstraction。

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

WorkerRequest：

```typescript
interface WorkerRequest {

  task: Task;

  evidence: EvidenceBundle;

  plan: Plan;

  executionPolicy: ExecutionPolicy;

  workspace: WorkspaceContext;
}
```

---

# 16. Pi Worker

第一個 implementation：

```text
PiWorker
```

責任：

```text
Control Plane
       │
       ▼
 PiWorker
       │
       ▼
 Pi
       │
       ▼
 Local LLM
```

Pi 不負責：

```text
Research decision
Policy decision
Artifact authorization
Escalation decision
```

---

# 17. Worker Registry

```typescript
interface WorkerRegistry {

  register(
    descriptor: WorkerDescriptor,
    worker: CodingWorker
  ): void;

  get(
    workerId: string
  ): CodingWorker;

  list(): WorkerDescriptor[];
}
```

Worker descriptor：

```typescript
interface WorkerDescriptor {

  id: string;

  runtime: string;

  capabilities: string[];

  models: string[];

  locality: "local" | "remote";

  supportsACP: boolean;

  supportsMCP: boolean;
}
```

---

# 18. Worker Selection

```text
Task
 ↓
Complexity
 ↓
Risk
 ↓
Cost
 ↓
Availability
 ↓
Worker Selection
```

例如：

```yaml
workers:

  pi-local:
    runtime: pi
    locality: local
    cost: free

  cloud-expert:
    runtime: claude
    locality: remote
    cost: high
```

---

# 19. MCP Architecture

MCP 只處理：

> **Tools / Resources / Prompts**

例如：

```text
MCP Servers

├── filesystem
├── git
├── shell
├── search
├── documentation
├── kubernetes
├── docker
├── test
└── security
```

但：

> **MCP Server 不可以自行繞過 Control Plane Policy。**

所以：

```text
Pi
 ↓
MCP request
 ↓
Tool Gateway
 ↓
Policy Engine
 ↓
ALLOW / DENY
 ↓
MCP Server
```

---

# 20. ACP-Protocol

ACP-Protocol 用於：

```text
Control Plane
        ↕
Agent Runtime
```

因此 Pi 可以被視為：

```text
ACP Agent
```

而 Control Plane 可以：

```text
spawn
send request
receive event
interrupt
terminate
```

---

# 21. Worker Interface vs ACP vs MCP

這三個層級必須固定。

| Layer                | 解決什麼                          |
| -------------------- | ----------------------------- |
| **Worker Interface** | Control Plane 的內部抽象           |
| **ACP-Protocol**     | Control Plane ↔ Agent Runtime |
| **MCP**              | Agent ↔ Tools/Resources       |

因此：

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

---

# 22. Artifact Controller

Patch 不能直接寫 filesystem。

流程：

```text
Worker
 ↓
Proposed Patch
 ↓
Artifact Controller
 ↓
Policy Validation
 ↓
Git Diff Validation
 ↓
Filesystem Apply
```

Interface：

```typescript
interface ArtifactController {

  validate(
    patch: Patch,
    policy: ArtifactPolicy
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

# 23. Verification Engine

第一版：

```text
Git diff
Type check
Lint
Unit test
Build
```

Plugin：

```typescript
interface VerificationPlugin {

  id: string;

  detect(
    context: RepositoryContext
  ): Promise<boolean>;

  run(
    context: VerificationContext
  ): Promise<VerificationResult>;
}
```

未來：

```text
Kubernetes
Helm
Ansible
Terraform
Docker
Security
```

都可以 plug-in。

---

# 24. Reflection Engine

Reflection 不直接修改 code。

它只產生：

```typescript
interface ReflectionResult {

  classification:
    | "coding_error"
    | "knowledge_error"
    | "requirement_error"
    | "environment_error"
    | "tool_error";

  confidence: number;

  recommendedAction:
    | "retry"
    | "research"
    | "ask_user"
    | "repair_environment"
    | "escalate";
}
```

---

# 25. Escalation Engine

```text
Local Worker
     │
     ▼
Verification
     │
     ▼
Failure
     │
     ▼
Reflection
     │
 ┌───┴────┐
 ▼        ▼
Retry   Research
 │        │
 └───┬────┘
     ▼
Retry count exceeded
     │
     ▼
Cloud Worker
```

---

# 26. Memory

第一版不要做複雜 Vector Memory。

分：

```text
Task Memory
Project Memory
Evidence Memory
```

SQLite：

```text
tasks
attempts
evidence
evidence_sources
projects
project_facts
verification_results
worker_runs
```

---

# 27. SQLite Schema

核心：

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
```

Evidence：

```sql
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
```

Verification：

```sql
CREATE TABLE verification_results (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    verifier TEXT NOT NULL,
    status TEXT NOT NULL,
    output TEXT,
    created_at TEXT NOT NULL
);
```

---

# 28. Observability

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
Escalation
```

例如：

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

這會直接成為未來 benchmark 的資料來源。

---

# 29. CLI

第一版 CLI：

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
```

---

# 30. Configuration

```yaml
runtime:

  workspace: "./workspace"

  default_worker: pi-local

  max_attempts: 3

research:

  enabled: true

  minimum_confidence: 0.85

verification:

  required: true

escalation:

  enabled: true
```

---

# 31. Local Deployment

你的 M2 16GB 第一版：

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
└── Docker
    └── Verification Sandbox
```

**不要 Kubernetes。**

第一版直接 local process + Docker sandbox。

---

# 32. Security Boundary

最重要的一條：

```text
LLM ≠ Trusted Component
```

所有：

```text
filesystem
shell
git
network
secrets
```

都視為 untrusted capability。

```text
LLM
 ↓
Tool Request
 ↓
Policy Gateway
 ↓
Capability Check
 ↓
Sandbox
 ↓
Tool
```

---

# 33. 第一版 Security Policy

預設：

```text
Network          DENY
Secrets          DENY
Host filesystem  DENY
Git push         DENY
Git reset        DENY
Git clean        DENY
Docker socket    DENY
```

允許：

```text
Repository read
Allowed artifact write
Tests
Build
Lint
Git diff
Git status
```

---

# 34. MVP Implementation Order

這部分我會非常嚴格，不要一次讓 Agent 寫完整個系統。

### Sprint 1

```text
Repository
TypeScript
pnpm
SQLite
Task model
State machine
CLI
```

---

### Sprint 2

```text
Worker Interface
Pi Worker
llama.cpp
Basic coding
```

驗證：

```text
Task → Pi → Patch
```

---

### Sprint 3

```text
Artifact Controller
Git diff
File permissions
Verification
```

驗證：

```text
Patch → Policy → Test
```

---

### Sprint 4

```text
Python Research Engine
Repository research
Documentation research
Evidence model
```

---

### Sprint 5

```text
Evidence Gate
Research Policy
Evidence validation
```

這是**第一個真正重要的 milestone**。

---

### Sprint 6

```text
MCP
Tool Gateway
Tool Policy
```

---

### Sprint 7

```text
ACP-Protocol
Pi process management
events
interrupt
session
```

---

### Sprint 8

```text
Reflection
Retry
Escalation
Cloud Worker
```

---

### Sprint 9

```text
Memory
Project knowledge
Evidence cache
```

---

### Sprint 10

```text
Benchmark
Metrics
Optimization
```

---

# 35. 第一個 E2E Test

第一個測試不要選很複雜的 Kubernetes operator。

選：

```text
Python repository
```

Task：

> Add a function and tests using an external library whose current API must be researched.

預期：

```text
Task
 ↓
Policy
 ↓
Research Required
 ↓
Official Docs
 ↓
Evidence
 ↓
Evidence Gate
 ↓
Pi + 9B
 ↓
Patch
 ↓
Artifact Gate
 ↓
pytest
 ↓
PASS
```

然後做第二個：

```text
Same task
 ↓
9B
 ↓
No Research
 ↓
Compare
```

---

# 36. 最重要的 Benchmark

你這個專案最後不能只測：

> 「程式能不能寫出來？」

而要測：

### Research Gain

```text
Success(9B + Research)
-
Success(9B)
```

### Token Gain

```text
Cloud tokens saved
```

### Correction Gain

```text
retry_count
```

### Hallucination Gain

```text
invalid API references
```

### Artifact Safety

```text
unauthorized modifications
```

### Escalation Rate

```text
cloud_escalation / total_tasks
```

最後得到：

```text
                    Agent Performance
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
      Model Quality    Control Quality   Research Quality
```

---

# 37. 最終架構

完成後：

```text
                                  USER
                                    │
                                    ▼
                         ┌──────────────────┐
                         │   Control Plane  │
                         │     TypeScript   │
                         └────────┬─────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
            ▼                     ▼                     ▼
       Policy Engine        Research Engine       Task State
                                Python
            │                     │
            │              ┌──────┼──────┐
            │              ▼      ▼      ▼
            │             Web    Docs   Repo
            │                     │
            │                     ▼
            │                Evidence
            │                     │
            └─────────────────────┘
                                  │
                           Evidence Gate
                                  │
                                  ▼
                         Worker Interface
                                  │
                 ┌────────────────┼────────────────┐
                 ▼                ▼                ▼
                Pi             OpenCode          Cloud
                 │
                ACP
                 │
                MCP
                 │
                 ▼
             Local 7B/9B
                 │
                 ▼
              Patch
                 │
                 ▼
          Artifact Controller
                 │
                 ▼
          Verification Engine
                 │
          ┌──────┴──────┐
          ▼             ▼
        PASS           FAIL
          │             │
          ▼             ▼
       COMPLETE      Reflection
                        │
                  ┌─────┴─────┐
                  ▼           ▼
               Research     Retry
                  │           │
                  └─────┬─────┘
                        ▼
                    Escalation
```

---

# 38. v0.2 的核心邊界

最後我會把這五條當成**不可破壞的 architecture rules**：

### Rule 1

> **LLM 不得直接決定 Policy。**

### Rule 2

> **Worker 不得繞過 Artifact Controller。**

### Rule 3

> **Research Result 必須轉換成 Evidence Bundle 才能進入 Coding。**

### Rule 4

> **MCP 是 capability interface，不是 authorization layer；authorization 必須由 Control Plane 決定。**

### Rule 5

> **Pi 是 Worker，不是 Control Plane。**

這五條如果守住，你後面即使換成 OpenCode、Goose、Claude Code，甚至自己寫 Worker，整個架構都不需要推翻。

---

## 我認為 v0.2 最值得先做的其實只有這條 Pipeline

```text
User
 ↓
Task Analyzer
 ↓
Policy Engine
 ↓
Research Required?
 ↓
Python Research
 ↓
Evidence Bundle
 ↓
Evidence Gate
 ↓
Pi Worker
 ↓
9B
 ↓
Artifact Controller
 ↓
Verification
 ↓
Reflection
 ↓
Retry / Escalate / Done
```

**先把這條跑通，再擴 MCP / ACP / Multi-Worker。**

這樣不會陷入「protocol 都做完了，但還不知道 Research + Evidence 到底有沒有真正提升 9B coding」的陷阱。

而且以你的背景，我會特別建議**第一個 benchmark 就拿 Kubernetes/OpenShift、Ansible、Helm、Terraform 這類你熟悉的 IaC/Platform Engineering task 來做**：你能非常快判斷 AI 的 research 是否真的找到正確版本、API 與 implementation pattern，而不是只看程式「有沒有跑」。

