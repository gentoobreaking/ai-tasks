可以。以你前面一路討論的目標，我會把它正式定義成一個 **Agent Control Plane（ACP Control Plane，不要與 Agent Client Protocol 混淆）**，核心不是再做一個 Coding Agent，而是建立一個**可以控制 Pi / OpenCode / Goose / 其他 Coding Worker 的通用控制層**。

如果要真的開始開發，我建議規格書先定成下面這個版本。這一版先不陷入每個 API 的細節，先把**架構、模組邊界、責任、協定與 MVP 範圍**固定下來。

---

# Agent Control Plane — Development Specification v0.1

## 1. Project Objective

### 核心目標

建立一個：

> **Research-driven, Evidence-gated, Policy-controlled Coding Agent Control Plane**

讓 Coding Agent 不再直接：

```text
User
 ↓
LLM
 ↓
Code
```

而變成：

```text
User
 ↓
Agent Control Plane
 ↓
Task Analysis
 ↓
Policy Decision
 ↓
Research / Evidence
 ↓
Worker Selection
 ↓
Coding Worker
 ↓
Artifact Control
 ↓
Verification
 ↓
Reflection / Retry
 ↓
Escalation
 ↓
Complete
```

---

# 2. 核心設計理念

整個系統遵循 6 個原則。

### P1 — Research Before Coding

如果 task 涉及：

* 不確定 API
* version-sensitive behavior
* 第三方 dependency
* framework behavior
* unfamiliar repository
* external specification

則：

> **沒有 Evidence，不允許 Coding。**

---

### P2 — Control Plane > Prompt

重要規則不能只寫在 system prompt。

例如：

```text
不要修改 config/
```

不能只是：

```text
Prompt:
Do not modify config/
```

而要：

```text
Policy Engine
      ↓
Artifact Permission
      ↓
Runtime enforcement
```

LLM 沒有 capability 就無法修改。

---

### P3 — LLM Is Worker, Not Controller

LLM 不負責決定：

* 是否 research
* 是否可以修改檔案
* 是否可以 commit
* 是否可以升級 Cloud
* 是否完成 task

這些全部由 Control Plane 決定。

---

### P4 — Evidence Is First-class Object

Research 結果不是一段文字，而是：

```text
Evidence Bundle
```

具有：

* source
* version
* claim
* confidence
* timestamp
* provenance

---

### P5 — Worker Is Replaceable

第一個 Worker：

```text
Pi
```

但架構不能綁死 Pi。

未來可以：

```text
Pi
OpenCode
Goose
Aider
Claude Code
Codex
Custom Worker
```

---

### P6 — Verification Is Ground Truth

LLM 說：

> 「應該沒問題。」

沒有意義。

真正的結果：

```text
build
test
lint
type check
security scan
dry-run
```

才是 Verification。

---

# 3. Overall Architecture

```text
                                  ┌──────────────┐
                                  │    User      │
                                  └──────┬───────┘
                                         │
                                         ▼
                          ┌─────────────────────────┐
                          │     Control Plane       │
                          │                         │
                          │ Task Manager            │
                          │ Policy Engine            │
                          │ Evidence Gate            │
                          │ Worker Router            │
                          │ Artifact Controller      │
                          │ Verification Controller  │
                          │ Escalation Controller    │
                          │ State Machine            │
                          └────────────┬────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                      │                      │
                ▼                      ▼                      ▼
       ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
       │ Research Layer │    │ Worker Layer   │    │ Verify Layer   │
       │                │    │                │    │                │
       │ Web            │    │ Pi             │    │ Test           │
       │ Docs           │    │ OpenCode       │    │ Build          │
       │ Repository     │    │ Goose          │    │ Lint           │
       │ Dependencies   │    │ Aider          │    │ SAST           │
       └───────┬────────┘    └───────┬────────┘    └───────┬────────┘
               │                     │                     │
               ▼                     ▼                     ▼
        Evidence Store          Local / Cloud         Verification
                                  Models               Results
```

---

# 4. 三層 Protocol Architecture

你提出的 **ACP / MCP / Worker Interface** 我建議明確拆成三層。

```text
┌──────────────────────────────────────────┐
│           Agent Control Plane            │
└────────────────────┬─────────────────────┘
                     │
             Worker Interface
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
         Pi       OpenCode     Goose
          │          │          │
          └──────────┼──────────┘
                     │
              Agent Client
                     │
                    ACP
                     │
                 Agent Runtime
                     │
                    MCP
                     │
              Tools / Resources
```

但這三個東西責任完全不同。

---

## 4.1 Worker Interface

**內部抽象層。**

Control Plane 不知道 Worker 是 Pi 還是 OpenCode。

例如：

```typescript
interface CodingWorker {
  initialize(context: WorkerContext): Promise<void>;

  plan(task: Task): Promise<Plan>;

  execute(
    task: Task,
    evidence: EvidenceBundle,
    policy: ExecutionPolicy
  ): Promise<WorkerResult>;

  interrupt(): Promise<void>;

  shutdown(): Promise<void>;
}
```

---

# 5. ACP Layer

這裡使用正式的 **Agent Client Protocol（ACP）** 作為 Agent/Client communication boundary。

ACP 解決：

```text
Control Plane
      ↕
Agent Runtime
```

而不是：

```text
Control Plane
      ↕
Tool
```

這兩者不要混在一起。

---

# 6. MCP Layer

MCP 負責：

```text
Agent
 ↓
Tools / Resources
```

例如：

```text
MCP
├── filesystem
├── git
├── shell
├── browser
├── search
├── documentation
├── kubernetes
├── docker
└── verification
```

Control Plane 可以決定：

```yaml
allowed_tools:
  - repo.read
  - search.web
  - git.diff
  - test.run

denied_tools:
  - git.push
  - secrets.read
  - host.shell
```

---

# 7. Technology Architecture

## Control Plane

### TypeScript

負責：

```text
Agent orchestration
Worker Interface
ACP
Pi integration
MCP
State Machine
Policy enforcement
```

---

## Research Engine

### Python

負責：

```text
Web Research
Document Processing
RAG
Embedding
Evidence extraction
Ranking
Evaluation
```

---

## Agent Runtime

### Pi

負責：

```text
LLM interaction
Context management
Tool calling
Coding execution
Conversation/session
```

---

## Local Model

第一階段：

```text
llama.cpp
```

支援：

```text
7B
9B
14B
```

不讓 Control Plane 綁定特定模型。

---

# 8. Repository Structure

我會直接規劃成 monorepo：

```text
agent-control-plane/
│
├── apps/
│   ├── control-plane/
│   │   └── src/
│   │
│   ├── cli/
│   │
│   └── api/
│
├── packages/
│   ├── core/
│   │
│   ├── policy/
│   │
│   ├── worker-interface/
│   │
│   ├── acp/
│   │
│   ├── mcp/
│   │
│   ├── pi-worker/
│   │
│   ├── opencode-worker/
│   │
│   ├── artifact/
│   │
│   ├── verification/
│   │
│   └── state/
│
├── research/
│   ├── crawler/
│   ├── retriever/
│   ├── evidence/
│   ├── ranking/
│   └── python/
│
├── models/
│   ├── llama-cpp/
│   └── model-configs/
│
├── policies/
│   ├── default.yaml
│   ├── coding.yaml
│   ├── security.yaml
│   └── kubernetes.yaml
│
├── workers/
│
├── tests/
│
├── docs/
│
└── docker/
```

---

# 9. Task Lifecycle

這會是整個 Control Plane 的核心 State Machine。

```text
                ┌────────────┐
                │   CREATED  │
                └─────┬──────┘
                      ▼
                ┌────────────┐
                │  ANALYZING │
                └─────┬──────┘
                      ▼
                ┌────────────┐
                │ POLICY GATE│
                └─────┬──────┘
                      │
             ┌────────┴────────┐
             │                 │
       Research Needed      Research OK
             │                 │
             ▼                 │
        RESEARCH               │
             │                 │
             ▼                 │
         EVIDENCE              │
             │                 │
             └────────┬────────┘
                      ▼
                   PLANNING
                      │
                      ▼
                 WORKER SELECT
                      │
                      ▼
                 IMPLEMENTING
                      │
                      ▼
                ARTIFACT GATE
                      │
                      ▼
                 VERIFICATION
                      │
                ┌─────┴─────┐
                │           │
              PASS         FAIL
                │           │
                ▼           ▼
             COMPLETE     REFLECT
                            │
                     ┌──────┴──────┐
                     │             │
                  Research      Retry
                     │             │
                     └──────┬──────┘
                            ▼
                         ESCALATE
```

---

# 10. Policy Engine

這是整個產品最重要的核心之一。

Policy 不只做 Security。

分成：

```text
Policy
├── Research Policy
├── Tool Policy
├── Artifact Policy
├── Model Policy
├── Worker Policy
├── Verification Policy
├── Escalation Policy
└── Commit Policy
```

例如：

```yaml
research:
  required_when:

    - unknown_dependency
    - version_sensitive
    - external_api
    - unfamiliar_framework
    - low_confidence

  minimum_sources: 2

artifact:
  allowed:
    - src/**
    - tests/**

  readonly:
    - package-lock.json

  forbidden:
    - secrets/**
    - .github/workflows/**

verification:
  required:
    - test
    - lint

escalation:
  max_local_attempts: 3
```

---

# 11. Evidence Architecture

這會是第二個核心。

```text
Research
   │
   ▼
Source
   │
   ▼
Document
   │
   ▼
Claim Extraction
   │
   ▼
Evidence
   │
   ▼
Validation
   │
   ▼
Evidence Bundle
```

Evidence：

```typescript
interface Evidence {
  id: string;
  claim: string;

  source: {
    type: "official" | "repository" | "issue" | "web";
    uri: string;
  };

  version?: string;

  confidence: number;

  retrievedAt: string;
}
```

---

# 12. Evidence Gate

最重要的一個控制點：

```text
              Task
                │
                ▼
          Knowledge Risk
                │
        ┌───────┴────────┐
        ▼                ▼
      LOW               HIGH
        │                │
        ▼                ▼
      Coding          Research
                           │
                           ▼
                      Evidence
                           │
                           ▼
                    Evidence Gate
                     │          │
                   PASS       FAIL
                     │          │
                     ▼          └──→ Research Again
                   Coding
```

---

# 13. Worker Architecture

第一版：

```text
Worker Registry
│
├── PiWorker
│
├── OpenCodeWorker
│
├── GooseWorker
│
└── CloudWorker
```

Worker Registry：

```typescript
interface WorkerDescriptor {
  id: string;

  capabilities: string[];

  models: string[];

  locality: "local" | "remote";

  costClass: "free" | "low" | "high";

  supportsACP: boolean;

  supportsMCP: boolean;
}
```

---

# 14. Worker Selection

例如：

```yaml
worker_policy:

  low_complexity:
    preferred: pi-local

  medium_complexity:
    preferred:
      - pi-local
      - opencode-local

  high_complexity:
    preferred:
      - cloud-expert

  security_sensitive:
    require:
      - human_approval
```

所以：

```text
Task
 ↓
Risk / Complexity
 ↓
Worker Selection
```

---

# 15. Artifact Control

這會延續你之前提到的 **Artifact Locking**。

不是：

> 「請 AI 不要修改其他檔案。」

而是：

```text
LLM
 ↓
Patch
 ↓
Artifact Controller
 ↓
Policy
 ↓
ALLOW / DENY
```

例如：

```yaml
artifact:
  allowed:
    - src/controller/**
    - test/controller/**

  readonly:
    - go.mod
    - go.sum

  forbidden:
    - deploy/**
    - secrets/**
```

---

# 16. Verification Engine

統一介面：

```typescript
interface Verifier {
  name: string;

  supports(language: string): boolean;

  run(context: VerificationContext):
    Promise<VerificationResult>;
}
```

實作：

```text
Verifier
├── GitDiffVerifier
├── UnitTestVerifier
├── BuildVerifier
├── LintVerifier
├── TypeVerifier
├── SecurityVerifier
├── KubernetesVerifier
├── HelmVerifier
└── AnsibleVerifier
```

這對你的 Kubernetes / Ansible 使用情境會特別有價值。

---

# 17. Reflection

Reflection 不讓 LLM 自由決定流程。

而是 Control Plane：

```text
Verification Failure
        ↓
Failure Classifier
        ↓
        ├── Coding Error
        ├── Knowledge Error
        ├── Requirement Error
        ├── Environment Error
        └── Tool Error
```

然後：

```text
Knowledge Error
       ↓
Research

Coding Error
       ↓
Retry Worker

Requirement Error
       ↓
Ask User

Environment Error
       ↓
Repair Environment
```

這比單純：

```text
LLM:
「再想一次。」
```

可靠很多。

---

# 18. Escalation

Local-first：

```text
                Task
                  │
                  ▼
               Pi + 9B
                  │
             Verification
                  │
          ┌───────┴────────┐
          ▼                ▼
        PASS              FAIL
                           │
                       retry/research
                           │
                       still fail
                           │
                           ▼
                     Cloud Worker
```

Cloud LLM 是：

> **Escalation Layer**

不是主要 execution engine。

---

# 19. Memory

Memory 分三種：

```text
Memory
├── Task Memory
│
├── Project Memory
│
└── Knowledge Memory
```

例如 Project Memory：

```yaml
project:
  language: go

  framework:
    controller-runtime: "0.22"

  conventions:
    - use_context
    - table_driven_tests

  restrictions:
    - no_direct_k8s_client
```

這可以讓後續 task 不必重新 research 已知內容。

---

# 20. Observability

這個我會從第一版就加入。

至少記錄：

```text
task_id
trace_id
worker
model
tokens
research_count
sources
evidence_confidence
tool_calls
files_changed
verification
retry_count
escalation
latency
cost
```

最終可以分析：

```text
                  Coding Success
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
    Model Quality   Research       Policy
                     Quality        Quality
```

這樣你才真的能回答：

> **「9B + Research 到底比 9B 直接 Coding 好多少？」**

---

# 21. MVP 分階段

我不建議一次把上面全部做完。

### Phase 0 — Foundation

```text
TypeScript
Pi
llama.cpp
Git
SQLite
```

完成：

```text
Task
 ↓
Pi
 ↓
Patch
 ↓
Test
```

---

### Phase 1 — Control Plane

加入：

```text
Task Manager
State Machine
Policy Engine
Artifact Lock
Verification
```

---

### Phase 2 — Research

加入：

```text
Python Research Service
Web
Docs
Repository
Evidence
Evidence Gate
```

這時才開始驗證你的核心假設。

---

### Phase 3 — Protocol

加入：

```text
Worker Interface
MCP
ACP
Pi Adapter
```

---

### Phase 4 — Multi Worker

加入：

```text
Pi
OpenCode
Goose
Cloud Worker
```

---

### Phase 5 — Intelligence

加入：

```text
Reflection
Memory
Worker Routing
Complexity Detection
Automatic Escalation
```

---

# 22. 第一版的 Definition of Done

我會把 MVP 的成功標準定成：

### Scenario

```text
User:
修改 Kubernetes controller，使它支援 X API。
```

系統必須：

```text
1. 判斷需要 research
2. 搜尋官方文件
3. 讀 repository
4. 判斷 Kubernetes version
5. 建立 Evidence Bundle
6. Evidence Gate PASS
7. 選擇 Pi + local 9B
8. 只允許修改指定 artifact
9. 產生 patch
10. 執行 test
11. 如果失敗 → 分析原因
12. 必要時重新 research
13. 最多 N 次 local retry
14. 仍失敗 → Cloud escalation
15. 最終產生完整 audit trail
```

如果這條 pipeline 跑通：

> **你的 Agent Control Plane MVP 就成立了。**

---

# 23. 最終產品定位

我不會把它叫：

> Coding Agent

而會定位成：

# **Agent Control Plane**

下面的 Pi / OpenCode / Goose 都只是：

> **Execution Workers**

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

這樣設計有一個非常大的好處：

**你的核心資產不是某一個模型，也不是 Pi。**

而是：

> **Policy + Evidence + Memory + Worker Interface + Verification + Control Loop**

這些東西未來即使模型從 9B 換成 30B、從 Pi 換成其他 runtime，架構仍然成立。

---

### 我建議下一步

如果要真的進入開發，我下一份規格書會進一步拆成 **「Implementation Specification v0.2」**，直接定義：

1. **完整 monorepo directory**
2. **TypeScript/Python package**
3. **每個 module 的 class/interface**
4. **Worker Interface API**
5. **ACP/MCP 的邊界與訊息格式**
6. **Task State Machine**
7. **Policy YAML schema**
8. **Evidence Bundle schema**
9. **Artifact Lock schema**
10. **SQLite schema**
11. **Pi integration方式**
12. **第一個 MVP 的逐步 implementation order**
13. **Docker/本地 M2 16GB 的 deployment**
14. **第一批測試案例與 benchmark**

這樣就會從「架構設計」正式進入**可以交給 Coding Agent 一個 module 一個 module 實作的工程規格**。

