# Agent Control Plane — Development Specification v0.3.2（整合版）

**Status:** Draft — Consolidated
**Supersedes:** discuss-10.md（v0.1 討論稿）· spec-v0_2.md（v0.2）· spec-v0.3.md（v0.3）· spec-v0.321.md（v0.4 Execution Strategy 討論稿）
**Primary Runtime（Control Plane）:** TypeScript + Node.js
**Research Runtime:** Python
**Initial Coding Worker:** Pi
**Initial Model:** Local 7B/9B（llama.cpp）
**External Model:** 架構驗證期（Phase 1–5）完全停用；Phase 9 才開放
**Protocols:** MCP + Agent Client Protocol（ACP-Protocol）+ Worker Interface
**Initial Platform:** macOS / Apple Silicon（MacBook Air M2 16GB）
**Future Platform:** Linux

---

## 目錄

0. 版本沿革與本版變更
1. 背景與動機
2. Project Objective
3. Design Principles（P1–P6）
4. System Architecture — Phase 1（架構驗證期）
5. Architecture Layers
6. Technology Stack & 決策紀錄
7. Repository Layout
8. Core Domain Model
9. Task Lifecycle / State Machine
10. Policy Engine
11. Task Analyzer
12. Research Engine
13. Evidence Model
14. Evidence Gate
15. 三層 Protocol：Worker Interface / ACP-Protocol / MCP
16. Pi Worker
17. Worker 選型比較與依據
18. MCP Layer
19. ACP-Protocol Layer
20. Artifact Controller
21. Verification Engine
22. Reflection Engine
23. Retry Policy
24. Execution Strategy — Phase 1（Local-only，硬限制）
25. Execution Strategy — Phase 9（Hybrid Execution 設計）
26. Memory
27. SQLite Schema
28. Security Boundary
29. CLI
30. Configuration
31. Local Deployment Topology（M2 16GB）
32. Observability
33. Benchmark Architecture
34. Baseline Experiment Groups
35. Benchmark Dataset & Task Difficulty
36. Metrics
37. E2E Example Walkthrough
38. MVP Roadmap（Phase 1–9，已重新排序）
39. Definition of Done
40. 第一個 E2E Test
41. Non-Negotiable Architecture Rules
42. Product Positioning
43. Version Roadmap
44. Open Questions / 尚未決定的事項

---

## 0. 版本沿革與本版變更

這份文件整合專案從概念討論（discuss-1 ~ discuss-11）到三版正式規格書（v0.2 / v0.3 / v0.321）的全部內容，是目前唯一需要參照的權威版本。舊版規格書可保留作歷史紀錄，但實作應以本版為準。

| 版本 | 內容重點 | 狀態 |
|---|---|---|
| v0.1（discuss-10） | 6 大設計原則、三層 Protocol 架構、MVP 分階段構想 | 已併入本版 |
| v0.2 | 完整 TypeScript 介面、SQLite schema、repo 結構、CLI、Sprint 1–10 | 已併入本版 |
| v0.3 | 移除 Cloud（架構驗證期）、Benchmark Architecture、Definition of Done | 已併入本版，核心原則保留 |
| v0.321 | Execution Strategy Engine、Worker/Model 解耦、Cloud Reviewer/Planner/Executor | 已併入本版，定位為 **Phase 9** 的正式設計 |
| **v0.3.2（本版）** | 整合＋解決版本間落差、重新排序 MVP phases | — |

### 本版解決的版本落差

合併過程中發現並解決了以下不一致，記錄下來是為了避免未來重新繞回已經討論過的岔路：

1. **Control Plane 語言**：discuss-6／discuss-7 最初建議 Python（貼近你的 Kubernetes/Ansible 背景），但 discuss-8 因為 Pi 本身是 TypeScript/Node.js 生態，改為建議 TypeScript 以避免跨語言 IPC 疊層，v0.2／v0.3 都已採用 TypeScript。本版維持 TypeScript 為 Control Plane 語言，Python 保留給 Research Engine——這不是新決定，只是把決策過程記下來（見第 6 節）。
2. **Cloud 是否存在於 MVP**：v0.2 的 Escalation Engine 仍包含 Cloud Worker，且排在 Sprint 8 就要實作；v0.3／discuss-11 明確要求「架構驗證期完全不存在 Cloud」，並在程式層強制擋掉，理由是避免「失敗就丟給 Cloud」把 Control Plane 自己的效果洗掉，導致無法歸因。本版採用 v0.3 的原則：**Phase 1–5（架構驗證期）沒有 Cloud**；v0.321 的 Execution Strategy Engine／Cloud Reviewer-Planner-Executor 設計保留為 **Phase 9（Hybrid Execution）** 的正式規格——先設計好，但先不啟用（見第 24、25 節）。
3. **Worker Selection 的複雜度**：v0.2 一開始就設計了完整的 Worker Registry／Cost Class／Locality；v0.3 認為驗證期只需要「Worker Router → Pi Local」，把完整 Router 留到後面；v0.321 進一步把 Worker Router 拆成 Execution Tier + Worker Router + Model Router + Escalation Controller。本版依階段分層呈現：Phase 1–5 只用單一 Worker（Pi + 本地模型），Phase 9 才啟用完整的 Execution Strategy Engine。
4. **MVP 順序**：v0.2 的 Sprint 6–7（MCP、ACP-Protocol）排在 Sprint 8（Reflection/Retry/Escalation）之前，Benchmark 放在最後的 Sprint 10；discuss-11 指出應該先做完 Reflection/Retry 並完成 Benchmark（＝真正驗證核心假設），再做 Protocol／Multi-Worker／Cloud 這類「產品化」工作，否則會陷入「protocol 都做完了，卻不知道 Research/Evidence 到底有沒有用」的陷阱。本版採用 discuss-11 的順序（見第 38 節）。
5. **Repository 結構**：discuss-10 提出的結構是早期草案，v0.2 給出的 monorepo 結構更完整、更晚提出，本版以 v0.2 的結構為準（見第 7 節）。
6. **命名混淆**：「ACP」同時可能指我們自己的 Agent Control Plane，也可能指外部的 Agent Client Protocol。沿用 v0.2 的解法：文中一律用「Control Plane」指稱我們自己的系統，「ACP-Protocol」專指外部的 Agent Client Protocol 層，不再單獨使用「ACP」這個縮寫。

---

## 1. 背景與動機

### 1.1 觀察到的現象

人類工程師遇到不確定的 API／library／framework 行為，通常會先查文件；LLM 卻常常直接開始寫。原因不是「不知道要查」，而是目前多數 Coding Agent 的 decision policy 並沒有把「外部知識驗證」設成寫程式前的強制步驟——LLM 最自然的行為是「根據 context 產生最可能合理的下一段 token」，而不是「評估自己是否掌握足夠資訊、不足時該去哪裡取得證據」。後者是 Agent layer 的 orchestration/policy，不是模型能力問題。

進一步觀察：LLM 面對「問問題」時比較容易觸發查證（Question → Information Retrieval），但面對「寫程式」的任務時，卻容易直接進入 Task Execution（Coding task → I know this → Start coding），即使兩者背後需要查證的程度可能一樣高。更根本的問題是 LLM 不知道「自己不知道」——API 版本、套件版本、官方最佳實踐都可能與 training data 不一致，但模型仍可能對錯誤答案抱有高度信心，這是典型的 epistemic uncertainty 沒有被正確暴露。

### 1.2 核心比喻：LLM 是 CPU，不是 OS

傳統 Coding Agent 把「知識、推理、執行」全部丟給同一個模型（LLM = OS + CPU + Memory + Network + Compiler）。這個專案要做的是反過來：把 Policy、Memory、Research、Knowledge、Tools、Permissions、Artifact Locking、Verification、Reflection 都移到 Agent 外部的 Control Plane，讓本地小模型（7B/9B）只需要負責「理解 evidence + 推理 + 產生 code」，不需要「記住全世界」。

小模型最大的弱點是「不知道很多東西」；如果 Control Plane 先把已驗證的 API、版本、repository pattern 準備好，模型收到的就不再是「請你憑記憶寫 Kubernetes」，而是「以下是已驗證的 evidence，請根據它修改 X」——這是完全不同難度的任務。

這個拆分也讓「任何語言都可以寫」成立：真正跨語言的不是模型，而是 **Control Plane + Research Engine + Tooling + Evidence Pipeline**；模型只是 implementation engine。今天是 Go + controller-runtime，明天是 Rust + Tokio，後天是 Python + FastAPI，Research Engine 換一批查詢目標，9B 一樣負責推理與產生程式碼。

### 1.3 為什麼不是單純寫在 System Prompt 裡

「Before coding, always search the internet」這種寫法效果通常不好，因為它仍然是 LLM 自己決定要不要遵守。更可靠的方式，是把「要不要查？」從 LLM 的 cognitive decision，提升成 Agent runtime 的 deterministic control：

```text
Task
 ↓
Policy Engine
 ↓
Is external evidence required?
 ↓ YES
Search tool MUST execute
 ↓
Evidence generated
 ↓
LLM receives evidence
 ↓
Coding
```

### 1.4 背景研究參考

初期 scoping 階段收集到幾個支持這個方向的參考點（非本專案自行驗證，僅作為動機參考，實際數字以各自論文/發表為準）：

- Microsoft 的 *Code Researcher*：在修改大型 codebase 前先做多步 research（semantic pattern、commit history、多檔案探索），在 Linux kernel crash benchmark 上達到約 58% 的 crash-resolution rate，對比 baseline SWE-agent 的 37.5%，平均探索檔案數（約 10 個）也遠高於 baseline（約 1.33 個）。
- *Agentic Harness Engineering* 研究：把能力放到 tools／middleware／memory／feedback 等 harness 層而非只靠 system prompt，在 Terminal-Bench 2 上有可觀提升，並能用更少 token 達到更好結果。

這兩者共同支持一個結論：**把「知識取得、驗證」系統性地做出來，比只是要求模型更聰明更有效。** 截至 2026 年中，主流 Coding Agent（Claude Code、Cursor、Windsurf、Devin 等）都已具備 research 能力，但都不是「research completed before coding」的 deterministic policy——這正是這個專案要補的那一層，而不是再做一個 Coding Agent 本身。

### 1.5 為什麼不是一次做 9-Role Multi-Agent

專案初期曾設想 Role / Reflection / Behavior Profile / Artifact Locking / Research / Verification / Tool Calling 等 9 種角色的 multi-agent 架構，但這會讓「到底是 policy 有效，還是 framework 幫忙做了什麼」難以歸因。因此決定：**先把 Role 收斂成 policy-defined stages，而不是 9 個自由活動的 AI**，把「何時研究、研究什麼、證據是否足夠、什麼時候允許 coding」做成 Control Plane 的核心能力，而不是再加一個 Research Agent 角色去互相討論。這也大幅減少「AI 做久了開始繞、亂改、自己產生不必要行為」的風險——它沒有那麼大的自由度。

---

## 2. Project Objective

核心目標：建立一個

> **Research-driven, Evidence-gated, Policy-controlled Coding Agent Control Plane**

要驗證的核心假設：

> **Agent Control Plane + Research + Policy + Verification，是否真的能讓本地 7B/9B 做到原本做不到的 Coding？**

具體要回答的五個問題：

- **Q1** Research 是否能降低 LLM hallucination？
- **Q2** Policy 是否能降低錯誤操作？
- **Q3** Verification + Reflection 是否能讓小模型自我修正？
- **Q4** Control Plane 各元件組合起來是否產生 synergy（而非單純疊加）？
- **Q5** 9B + Control Plane 是否可以接近部分 Cloud Coding Agent 的效果？

讓 Coding Agent 不再是：

```text
User → LLM → Code
```

而是：

```text
User → Control Plane → Task Analysis → Policy Decision → Research/Evidence
     → Worker Selection → Coding Worker → Artifact Control → Verification
     → Reflection/Retry → (Escalation，僅 Phase 9 之後才存在) → Complete
```

---

## 3. Design Principles

六大原則，全版適用，不因 Phase 而變：

**P1 — Research Before Coding**
任務若涉及不確定 API、version-sensitive behavior、第三方 dependency、framework behavior、不熟悉的 repository、外部規格，則**沒有 Evidence，不允許 Coding**。

**P2 — Control Plane > Prompt**
重要規則不能只寫在 system prompt。「不要修改 config/」不能只是提示詞，必須是 Policy Engine → Artifact Permission → Runtime enforcement；LLM 沒有 capability 就無法修改。

**P3 — LLM Is Worker, Not Controller**
LLM 不負責決定是否 research、是否可以修改檔案、是否可以 commit、是否可以升級 Cloud、是否完成 task，這些全部由 Control Plane 決定。等價地：**LLM ≠ Controller，LLM ≠ Policy，LLM ≠ Security Boundary，LLM ≠ Source of Truth**。

**P4 — Evidence Is First-class Object**
Research 結果不是一段文字，而是具備 source、version、claim、confidence、timestamp、provenance 的 **Evidence Bundle**。

**P5 — Worker Is Replaceable**
第一個 Worker 是 Pi，但架構不能綁死 Pi。未來可以是 OpenCode、Goose、Aider、Claude Code、Codex，或自訂 Worker。

**P6 — Verification Is Ground Truth**
LLM 說「應該沒問題」沒有意義；build／test／lint／type check／security scan／dry-run 的實際結果才是 Verification。

---

## 4. System Architecture — Phase 1（架構驗證期）

Phase 1–5（架構驗證期）刻意**不含 Cloud**，這是刻意的設計，不是遺漏：

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
          Evidence Bundle          │ Artifact Control  │
                                   └────────┬─────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │ Verification     │
                                   │ Test/Build/Lint  │
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

**整張圖沒有 Cloud。** Phase 9 之前，`model_limitation` 分類的結果是 **STOP**，不是升級到 Cloud——理由見第 24 節。

---

## 5. Architecture Layers

系統分成七層：

```text
Layer 7  User Interface
Layer 6  Control Plane
Layer 5  Research / Evidence
Layer 4  Worker Interface
Layer 3  Agent Runtime
Layer 2  MCP Tools
Layer 1  Execution / Verification
```

Control Plane（Layer 6）內部模組：

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

## 6. Technology Stack & 決策紀錄

| 元件 | 選擇 | 備註 |
|---|---|---|
| Control Plane | **TypeScript + Node.js + Fastify + Zod** | 見下方決策紀錄 |
| Research Engine | **Python 3.12+ + FastAPI + httpx + BeautifulSoup + trafilatura + Pydantic** | AI/RAG/research 生態最完整 |
| Coding Worker（第一個） | **Pi** | 見第 17 節比較 |
| Local Model 後端 | **llama.cpp**（OpenAI-compatible API），不綁死 Ollama | 換模型不需要改 Control Plane |
| 本地模型 | 7B/9B，優先找 **code-specialized model**（Qwen／DeepSeek／Mistral-Gemma coding variants） | 具體型號留待 benchmark 決定，見第 44 節 |
| Workflow / State Machine | **自己寫**，不用 LangGraph | 見下方理由 |
| Policy Engine | 自製 YAML/JSON Policy Engine | 不外包給 framework |
| Storage | **SQLite（+ FTS5）**，MVP 不上 Vector DB | 第一階段要驗證的是「Research 有沒有用」，不是「RAG 能不能撐一億筆資料」 |
| Sandbox | Docker | Verification 用 |
| Cloud Escalation（Phase 9 才啟用） | OpenAI / Anthropic / Gemini API | 見第 25 節 |

### 決策紀錄：為什麼 Control Plane 最終選 TypeScript

這是專案討論中唯一被推翻重來的技術決策，值得記錄避免重新繞回去：

1. **最初建議 Python**（discuss-6、discuss-7）：理由是 Python 的 Policy／State／Workflow／Research／RAG／Tool orchestration／Verification 生態最完整，也最貼近你原本的 Kubernetes/Ansible/automation 背景。
2. **後來改為 TypeScript**（discuss-8 起）：一旦確定用 **Pi** 作為第一個 Coding Worker，而 Pi 本身就是 TypeScript/Node.js 生態，繼續用 Python 寫 Control Plane 會變成「Python ↔ HTTP/RPC ↔ Node.js/Pi」多一層 IPC。系統的 IPC 層數越少，Evidence Gate、Artifact Lock、Policy Enforcement 就越容易做成真正可靠的控制面。
3. **最終定案**：TypeScript 負責 Control Plane（Policy／Evidence Gate／Research Orchestrator／State Machine／Artifact Lock／Escalation／Pi 整合），Python 只在真正需要 AI/Data science 生態的地方出現（Research Engine 作為獨立 service，透過 HTTP 呼叫）。這樣只有一層 IPC（TS ↔ Python research service），而不是兩層。

### 決策紀錄：為什麼不用 LangGraph

MVP 直接寫自己的 State Machine（`Enum` + 明確的狀態轉移），不引入 LangGraph 或其他 orchestration framework。理由：這個專案真正要研究的是 **Agent Control Policy 本身**；如果一開始就把控制權交給 framework，會不容易判斷「到底是你的 policy 有效，還是 framework 幫你做了某些事情」——這會污染 benchmark 的歸因。

---

## 7. Repository Layout

```text
agent-control-plane/
│
├── apps/
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

## 8. Core Domain Model

核心 entity：

```text
Task · Policy · Evidence · EvidenceBundle · Plan · Worker
Patch · Artifact · Verification · Attempt · Escalation · Memory
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

---

## 9. Task Lifecycle / State Machine

固定狀態（Phase 1–5 版本，`ESCALATE` 到 Cloud 分支在 Phase 9 前不存在，見第 24 節）：

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
          └── STOP   ← Phase 9 之後才會是 ESCALATE
```

其中 `RESEARCH_REQUIRED` **不是 LLM 自己決定**，由 `Policy Engine` + `Task Analyzer` 共同決定。

---

## 10. Policy Engine

Policy Engine 是整個系統的核心，不只做 Security。

```text
Policy
├── Research Policy
├── Tool Policy
├── Artifact Policy
├── Verification Policy
├── Retry Policy
├── Reflection Policy
└── Resource Policy
```

```typescript
interface PolicyEngine {
  evaluateTask(task: Task): Promise<TaskPolicyDecision>;

  evaluateResearch(
    task: Task,
    evidence: EvidenceBundle
  ): Promise<ResearchDecision>;

  evaluateArtifact(
    patch: Patch,
    policy: ArtifactPolicy
  ): Promise<ArtifactDecision>;

  evaluateTool(tool: ToolRequest): Promise<ToolDecision>;

  evaluateEscalation(
    context: EscalationContext
  ): Promise<EscalationDecision>;
}
```

真正的差異化不在 Security Policy（`if command == "rm -rf": DENY`），而在 **Knowledge Policy**：

```text
if task uses unknown API:                       REQUIRE_RESEARCH
if dependency version is ambiguous:              REQUIRE_RESEARCH
if framework behavior is version-sensitive:      REQUIRE_RESEARCH
if implementation conflicts with repo convention: REQUIRE_RESEARCH
if evidence confidence < threshold:              BLOCK_CODING
```

Research Policy 範例：

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

Artifact Policy 範例：

```yaml
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
```

---

## 11. Task Analyzer

Task Analyzer 不負責 Coding，只負責：

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

---

## 12. Research Engine

Python service，架構原則是 **deterministic pipeline + LLM optional**，不完全依賴 LLM 判斷要查什麼：

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

Pipeline：

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

Evidence 不能直接把搜尋結果塞給 LLM——中間必須經過標準化：

```text
Search → Retrieve → Extract → Normalize → Version filter
       → Deduplicate → Cross-check → Evidence
```

第一版支援的 Research Sources：

```text
Repository · Official Documentation · GitHub · Web Search
Package Metadata · Git History
```

來源優先順序：

```text
Official Documentation
        ↓
Repository（本專案）
        ↓
Upstream Repository
        ↓
Official Issue / Release
        ↓
Trusted Technical Source
        ↓
General Web
```

Research Engine 可以先查 **Project Memory**（見第 26 節），再決定是否需要重新 research，避免每個 task 都重查已知內容。

---

## 13. Evidence Model

Evidence 是一級 Domain Object，不是一段文字：

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
```

Evidence Bundle 是 **Research → Coding 的正式 contract**，Worker 只拿 Evidence Bundle，不直接拿整個 Research Engine 的 state：

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

範例：

```yaml
evidence:
  topic: kubernetes_deployment
  version: "1.34"
  facts:
    - id: K8S-001
      claim: Deployment API uses apps/v1
      confidence: 0.99
      source: official
    - id: K8S-002
      claim: "..."
      confidence: 0.96
      source: official
  constraints:
    - preserve_existing_selector
    - do_not_modify_service
```

---

## 14. Evidence Gate

Phase 1–5 最重要的 gate：

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
    bundle: EvidenceBundle
  ): Promise<EvidenceDecision>;
}

type EvidenceDecision =
  | { status: "PASS"; confidence: number }
  | { status: "RESEARCH_AGAIN"; missing: string[] }
  | { status: "ESCALATE"; reason: string };  // Phase 9 前僅記錄、不觸發 Cloud
```

---

## 15. 三層 Protocol：Worker Interface / ACP-Protocol / MCP

三個層級責任完全不同，必須固定，避免混用：

| Layer | 解決什麼 |
|---|---|
| **Worker Interface** | Control Plane 的內部抽象（Control Plane ↔ 自己的程式碼） |
| **ACP-Protocol** | Control Plane ↔ Agent Runtime（例如 Pi） |
| **MCP** | Agent ↔ Tools/Resources |

```text
                 Control Plane
                      │
              Worker Interface
                      │
                ┌─────┴─────┐
                │           │
               Pi       OpenCode
                │           │
             ACP-Protocol  ACP-Protocol
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

`Worker Interface`（Control Plane 內部抽象，不知道 Worker 是 Pi 還是 OpenCode）：

```typescript
interface CodingWorker {
  initialize(context: WorkerContext): Promise<void>;

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
```

---

## 16. Pi Worker

第一個 Worker 實作。責任邊界：

```text
Control Plane → PiWorker → Pi → Local LLM
```

Pi **不負責**：

```text
Research decision
Policy decision
Artifact authorization
Escalation decision
```

Pi 只負責：**「拿到已經準備好的 evidence/context 後，把 coding 做完。」** Control Plane 與 Pi 之間只透過一個很小的 contract：

```json
{
  "task_id": "TASK-001",
  "objective": "add deployment scaling support",
  "evidence": [
    { "source": "kubernetes-official", "fact": "..." },
    { "source": "repository", "fact": "..." }
  ],
  "allowed_files": [
    "pkg/controller/deployment.go",
    "pkg/controller/deployment_test.go"
  ],
  "readonly_files": ["go.mod"],
  "verification": ["go test ./pkg/controller/..."]
}
```

Pi 沒有直接的 web search 能力——不是因為 Pi 不會 research，而是因為 **Research 是 Control Plane 的 policy-controlled capability**，Pi 只是 Worker。

不建議 fork Pi：`Your Control Plane → Pi Extension/RPC → Pi`，而不是 `Fork Pi → 大量修改 Pi core`。理由：現在真正要驗證的是 Control Plane，不是 Pi；Pi 升級版本時，Control Plane 不應該跟著大改。

---

## 17. Worker 選型比較與依據

Worker Interface 刻意保持通用，`Pi` 只是第一個實作，未來可以替換或並存其他 Worker。選型比較（依「能不能被 Control Plane 有效控制」排序，而不是單純比較「哪個 Coding Agent 最強」）：

| Runtime | 當 Worker 的適合度 | 可客製程度 | Local Model | 外部 Control Plane 整合 | 評價 |
|---|---:|---:|---:|---:|---|
| **Pi** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **首選** |
| **OpenCode** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 很強，但自帶較多 opinionated policy，需處理兩層 policy 疊加 |
| **Goose** | ⭐⭐⭐⭐½ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐½ | 值得作 A/B test 對照組 |
| **Aider** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 偏「LLM 只是 patch generator」，乾淨但較不適合當長期 Agent OS |
| Claude Code | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⚠️ | ⭐⭐⭐ | 強，但不適合當 local-first core，適合當 Phase 9 的 Cloud Worker |
| Codex CLI | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⚠️ | ⭐⭐⭐ | 偏 OpenAI 生態 |
| OpenHands | ⭐⭐⭐½ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 太重 |
| Cline / Roo Code | ⭐⭐⭐½ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | 偏 IDE 整合 |

選 Pi 當第一個 Worker 的理由：它比較接近 **minimal agent runtime**（Agent Runtime + Tool Calling + Context + LLM），而不是塞滿大量 opinionated workflow 的完整平台，因此可以單純被當成「可編程的 coding worker」，而不需要把 Control Plane 硬塞進 Pi 裡面，也不需要處理雙層 policy 的問題。

`OpenCode`／`Goose` 是 Phase 8（Multi-Worker）階段值得優先接入、拿來做 A/B test 的候選；`Claude Code` 則是 Phase 9（Cloud Escalation）階段的 Cloud Worker 候選之一，不作為 local-first 的核心。

Worker Registry / Descriptor（介面在 Phase 1 就先定義好，即使 Phase 1–5 只註冊一個 Worker）：

```typescript
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
  supportsACP: boolean;
  supportsMCP: boolean;
}
```

Phase 1–5 期間，`WorkerRouter` 只會回傳一個結果：

```typescript
interface WorkerRouter {
  select(task: Task, strategy: ExecutionStrategy): Promise<CodingWorker>;
}
```

```yaml
workers:
  pi-local:
    runtime: pi
    locality: local
    cost: free
```

---

## 18. MCP Layer

MCP 只處理 **Tools / Resources / Prompts**：

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

**MCP Server 不可以自行繞過 Control Plane Policy**：

```text
Pi → MCP request → Tool Gateway → Policy Engine → ALLOW/DENY → MCP Server
```

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

Phase 1–5 可以先實作但不是 benchmark 的核心（見第 38 節排序）；第一批工具集：`filesystem, git, shell, test, search`。

---

## 19. ACP-Protocol Layer

用於 `Control Plane ↕ Agent Runtime`（而不是 `Control Plane ↕ Tool`——這兩者不要混在一起）。

因此 Pi 可以被視為一個 **ACP Agent**，Control Plane 可以對它 `spawn / send request / receive event / interrupt / terminate`。

Phase 1–5 只要求：**建立 abstraction boundary，不要求立即支援多種 Agent Runtime**——第一個先是 `Control Plane ↕ Pi`，後續才擴充 `Control Plane ↕ OpenCode`（Phase 8）。

---

## 20. Artifact Controller

Patch 不能直接寫 filesystem：

```text
Worker → Proposed Patch → Artifact Controller → Policy Validation
       → Git Diff Validation → Filesystem Apply
```

```typescript
interface ArtifactController {
  validate(patch: Patch, policy: ArtifactPolicy): Promise<ArtifactDecision>;
  apply(patch: Patch): Promise<AppliedPatch>;
  rollback(patchId: string): Promise<void>;
}
```

```yaml
artifact:
  allowed:
    - "src/controller/**"
    - "test/controller/**"
  readonly:
    - "go.mod"
    - "go.sum"
  forbidden:
    - "deploy/**"
    - "secrets/**"
```

實作方式：

```python
def validate_patch(diff, policy):
    for file in diff.files:
        if file in policy.forbidden:
            raise ArtifactViolation(file)
        if file not in policy.allowed:
            raise UnauthorizedModification(file)
```

即使模型說「我覺得應該順便修改 config」也沒用——Runtime 根本不提供修改那些檔案的 capability，這比 prompt 要求「請不要亂改」可靠得多。

---

## 21. Verification Engine

第一版：`Git diff · Type check · Lint · Unit test · Build`。後續可插拔：`Security Scan · Container Build · Helm · Kubernetes · Ansible · Terraform`——對你的 Kubernetes/Ansible 使用情境會特別有價值。

```typescript
interface VerificationPlugin {
  id: string;
  detect(context: RepositoryContext): Promise<boolean>;
  run(context: VerificationContext): Promise<VerificationResult>;
}

interface VerificationResult {
  verifier: string;
  status: "PASS" | "FAIL" | "ERROR";
  output: string;
  durationMs: number;
}
```

Verifier 清單（依語言/生態逐步擴充）：

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

Verification 絕對不交給 LLM 自己判斷（「我覺得 code 應該沒問題」不算數），一律用實際指令的結果：`go test / pytest / cargo test / npm test / kubectl --dry-run / helm template / ansible-lint / ruff / mypy / semgrep`。

---

## 22. Reflection Engine

Reflection **不直接修改 code**，只負責分類失敗原因並建議下一步：

```text
Verification Failure
        ↓
Failure Classifier
        ↓
        ├── coding_error
        ├── knowledge_error
        ├── requirement_error
        ├── environment_error
        ├── tool_error
        └── model_limitation
```

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
  recommendedAction:
    | "retry"
    | "research"
    | "ask_user"
    | "repair_environment"
    | "stop";     // Phase 9 之後，model_limitation 才會改成 escalate
}
```

對應動作：

```text
knowledge_error     → Research
coding_error        → Retry Worker
requirement_error   → Ask User
environment_error   → Repair Environment
model_limitation    → Stop（Phase 1–5）／Escalate（Phase 9 之後）
```

這比單純讓 LLM「再想一次」可靠得多。

---

## 23. Retry Policy

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
      action: stop     # 見第 24 節：Phase 1–5 期間刻意不是 escalate
```

---

## 24. Execution Strategy — Phase 1（Local-only，硬限制）

Phase 1–5 的第一目標**不是**做一個「會 fallback 到 Cloud 的 Coding Agent」，而是驗證「Control Plane 能否顯著放大本地 7B/9B Coding Worker 的能力」。如果每次遇到困難就丟給 Cloud，就無法知道結果是 Control Plane 做得好，還是單純 Cloud LLM 太強——這會讓整個 benchmark 失去意義。

因此 Phase 1–5（Architecture / Research Validation Mode）**完全禁止 Cloud**，且必須是硬限制，不是 prompt 要求：

```yaml
execution:
  mode: local_only
  worker: pi
  model: local
  allow_cloud: false
```

```typescript
if (config.execution.allowCloud) {
  throw new Error(
    "Cloud execution is not supported in Phase 1-5 validation mode"
  );
}
```

`model_limitation` 分類的結果在這個階段是 **STOP**，任務標記失敗並記錄完整 event log，而不是自動找一個更強的模型幫忙——因為現在正在做的是能力測試，不是把任務做完就好。

---

## 25. Execution Strategy — Phase 9（Hybrid Execution 設計）

> 本節內容全部屬於 **Phase 9**，Phase 1–5 期間不啟用。之所以現在就把設計寫完整，是因為等 Phase 1–5 的 benchmark 出結果、確認 Control Plane 真的有效之後，應該直接照這份設計實作，而不是等到那時候才重新設計。

### 25.1 為什麼不能只是「Worker Selection 裡多一個 Cloud 選項」

最初步的想法是在 Worker Selection 直接根據 complexity 分流：

```text
Task → Complexity/Risk → Worker Selection
                            ├── Pi Local（低複雜度）
                            └── Cloud（高複雜度）
```

問題在於：如果任務一被判定為「複雜」就直接派給 Cloud，本地 9B 就完全沒有機會，這樣就測不出「9B + Research + Policy + Verification 到底可以做到什麼程度」——這正是整個專案要驗證的核心假設。

### 25.2 正確設計：Policy 先決定 Execution Strategy，再由 Worker Router 決定實際 Worker

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

流程一律是先跑本地：

```text
Task → Research → Evidence → Pi + 9B → Verification
```

失敗、且經過 Reflection／Retry／重新 Research 仍不通過之後，才進入：

```text
Reflection → Retry（本地） → 仍失敗 → Cloud Escalate
```

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
                PASS          FAIL
                 │             │
                 ▼             ▼
              DONE         Reflection
                               │
                         ┌─────┴─────┐
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

### 25.3 Worker / Model / Execution Tier 三個概念要分開

`Worker` 失敗不代表一定要換整個 Agent；也可能只是換模型：

```text
Pi + 9B → Pi + 14B → Pi + Cloud LLM
```

也可能整個換：`Pi → Claude Code`。因此正式把 **Runtime** 和 **Model** 分離：

```text
Worker
   │
   ├── Runtime（Pi / OpenCode / Goose）
   │
   └── Model（Qwen 9B / Qwen 14B / Claude / GPT）
```

```yaml
workers:
  pi-local-9b:
    runtime: pi
    model: qwen-9b
    tier: local

  pi-local-14b:
    runtime: pi
    model: qwen-14b
    tier: local

  pi-cloud:
    runtime: pi
    model: cloud-model
    tier: cloud

  opencode-cloud:
    runtime: opencode
    model: cloud-model
    tier: cloud
```

`Worker Router`（v0.2/v0.3 的用法）在 Phase 9 正式拆成完整的 **Execution Strategy Engine**：

```text
Execution Strategy Engine
        │
        ├── Execution Tier
        ├── Worker Router
        ├── Model Router
        └── Escalation Controller
```

完整流程：

```text
                      Task
                        │
                        ▼
                  Policy Engine
                        │
                        ▼
              Execution Strategy
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
         Local-first          Cloud-first
              │
              ▼
        Worker Router
              │
              ▼
         Model Router
              │
              ▼
          Pi + 9B
              │
              ▼
         Verification
              │
        ┌─────┴─────┐
      PASS         FAIL
        │           │
        ▼           ▼
      DONE      Reflection
                    │
              ┌─────┼─────┐
           Research Retry Cloud
                         │
                         ▼
                  Cloud Worker
```

### 25.4 三種 Cloud Mode，優先順序 Reviewer → Planner → Executor

**能不用 Cloud 寫 code，就不要讓 Cloud 寫 code**——這是 Phase 9 設計的核心原則，也是 Control Plane 從「一個 Coding Agent wrapper」變成真正 **Intelligence Orchestration Layer** 的關鍵。

**Cloud Reviewer**（優先度最高）：
```text
Local 9B → Cloud Review → Local 9B
```
Cloud 只負責看一眼、給建議，實際修改仍由本地模型執行。

**Cloud Planner**（次優先）：
```text
Research → Cloud Planning → Local 9B Coding
```
Cloud 負責規劃/拆解任務，本地模型負責實作。

**Cloud Executor**（最後手段）：
```text
Task → Cloud Worker → Complete
```
Cloud 直接接管整個 coding session，僅在前兩者都不夠時使用。

這個設計能把 Cloud token 用量壓在真正需要高 intelligence 的節點，而不是整段對話都由 Cloud 負責：

```text
傳統做法： User → Cloud LLM → Research → Plan → Coding → Debug → Test → Fix
                  Cloud Token: ████████████████████████████

本架構：   User → Local 9B → Research → Local 9B → Coding → Test
                  → FAIL → Cloud Reviewer → Local 9B → Fix → Test
                  Cloud Token: ███
```

### 25.5 Execution Policy 完整範例

```yaml
execution_policy:
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
    mode: reviewer_first    # 建議預設值：Reviewer → Planner → Executor
```

`cloud.mode: reviewer_first` 是建議的預設值：第一階段先讓 Cloud Review、本地執行；只有仍然失敗才升級到 Cloud Execute。

Reflection 的分類直接決定升級路徑，而不是單純「難就丟給 Cloud」：

```text
Task → Pi + 9B
         ├── PASS → DONE
         └── FAIL → Reflection
                       ├── Knowledge Error → Research
                       ├── Coding Error → Retry
                       └── Model Limitation → Stronger Model → Cloud
```

Phase 9 完成後，應該重新跑一次「Cloud LLM 原生 baseline」對比「9B + 完整 Control Plane」，量化 Control Plane 到底把 9B 拉到什麼程度、Cloud 還能再加多少（見第 36 節的比較表）。

---

## 26. Memory

第一版不做複雜 Vector Memory，分三種：

```text
Memory
├── Task Memory
├── Project Memory
└── Evidence Memory
```

Project Memory 範例：

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

Research Engine 可以先查 Project Memory，避免後續 task 重新 research 已知內容。

---

## 27. SQLite Schema

Phase 1–5 只用 SQLite（+ FTS5），不加 Vector DB：

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
```

其餘資料表（結構依循同樣的 `id / task_id / ... / created_at` 慣例）：

```text
attempts · evidence_sources · policies · worker_runs
patches · reflections · project_memory
```

---

## 28. Security Boundary

最重要的一條：**LLM ≠ Trusted Component**。所有 `filesystem / shell / git / network / secrets` 都視為 untrusted capability：

```text
LLM → Tool Request → Policy Gateway → Capability Check → Sandbox → Tool
```

Phase 1–5 預設權限：

```text
拒絕：Network · Secrets · Host filesystem · Git push · Git reset · Git clean · Docker socket
允許：Repository read · Allowed artifact write · Tests · Build · Lint · Git diff · Git status
```

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

### Research vs Coding 的邊界

**Research Agent** 可以碰：`Web · Docs · GitHub · Repository · Package metadata`

**Coding Worker** 只能拿到：`Task + Evidence Bundle + Repository Context + Execution Policy`

也就是：

```text
Research → Evidence Bundle → Evidence Gate → Coding Worker
```

而不是：

```text
Coding Worker → Web / Search / Random docs / Coding（混在一起）
```

---

## 29. CLI

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

## 30. Configuration

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
  enabled: false    # Phase 1-5 = false；Phase 9 才切成 true
```

---

## 31. Local Deployment Topology（M2 16GB）

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

**不上 Kubernetes。** 第一版直接 local process + Docker sandbox。

---

## 32. Observability

所有 execution 都要記錄，這份 log 之後就是 benchmark 的資料來源：

```text
task_id · attempt_id · worker · model · tool_calls
research_queries · sources · evidence_confidence
files_changed · verification · retry_count
escalation · tokens · latency · cost
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

**保留每一次 attempt 的完整 event log**，不要只留彙總數字——之後不管結果好壞，都需要能回頭分析是哪一層造成的差異。

---

## 33. Benchmark Architecture

Benchmark 是產品的一部分，不是事後才補的測試：

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

## 34. Baseline Experiment Groups

v0.3 原本定義 A–E 五組，但把 Policy 和 Verification 混在同一組（「C - Control Only」同時含 Policy+Verification），會分不清楚到底是哪一個因子在起作用。本版採用 discuss-11 提出的更細粒度拆法，把每個元件的邊際貢獻獨立出來：

| Group | Research | Policy | Verification | 說明 |
|---|:---:|:---:|:---:|---|
| **A** | ❌ | ❌ | ❌ | Raw 9B baseline |
| **B** | ✅ | ❌ | ❌ | Research Only |
| **C** | ❌ | ✅ | ❌ | Policy Only |
| **D** | ❌ | ❌ | ✅ | Verification Only |
| **E** | ✅ | ❌ | ✅ | Research + Verification |
| **F** | ✅ | ✅ | ✅ | **Full Control Plane**（含 Evidence Gate、Artifact Gate、Reflection、Retry/Research） |

**F 是 Phase 5 的核心實驗組**，也是 v0.3 原本命名的「E - Full Control Plane」。A 到 F 全部跑完，才能回答「Research 是主要增益來源，還是 Policy/Control 才是關鍵」這類問題，而不是只知道「有 Control Plane 比沒有好」。

---

## 35. Benchmark Dataset & Task Difficulty

第一批不追求大量，建議 **50 tasks**，之後再擴到 100 / 500 / 1000：

```text
10 Python
10 TypeScript
10 Go
10 Kubernetes/Helm
10 Ansible/Terraform
```

Task Difficulty：

```text
Level 1  Simple function
Level 2  Multi-file modification
Level 3  Dependency/API usage
Level 4  Framework integration
Level 5  Infrastructure / architecture
```

**Level 3–5 特別重要**，因為這才是 Research 真正產生價值的地方——Level 1–2 用 Raw 9B 大概就能處理，看不出 Control Plane 的差異。

---

## 36. Metrics

核心 KPI：

```text
Task Success Rate         = successful_tasks / total_tasks
First Attempt Success     = first_attempt_success / total_tasks
Verification Pass Rate    = passing_final_verification / total_tasks
Retry Count                = average_attempts
Research Accuracy          = correct_evidence / total_evidence
Hallucination Rate         = invalid_claims / total_claims
Unauthorized Mod. Rate     = blocked_changes / attempted_changes
Token Usage                 = input_tokens + output_tokens
```

三個最重要的衍生指標：

**Control Plane Gain**（整個專案最重要的一個數字）
```text
CP Gain = Success Rate(9B + Full Control Plane) − Success Rate(9B Raw)
```
例：`Raw 9B 38% → Full CP 71% → CP Gain +33pp`

**Intelligence Efficiency**
```text
Intelligence Efficiency = Task Success / Model Compute（或 Success / Token）
```
回答「Control Plane 有沒有用系統工程取代部分模型參數」。

**Research ROI**
```text
Research ROI = Success Gain / Research Cost（web requests、latency、tokens、local compute）
```
回答「Research 是不是每次都值得做」。

### Phase 9 之後：外部比較（Cloud LLM vs 9B + Control Plane）

Phase 9 完成、Execution Strategy Engine 上線後，補做一次外部對照，量化 Control Plane 到底把 9B 拉到什麼程度、Cloud 還能再加多少：

| Metric | Cloud LLM（原生） | 9B + Full Control Plane |
|---|---:|---:|
| Task success | ? | ? |
| First-pass success | ? | ? |
| Retry count | ? | ? |
| Hallucinated API | ? | ? |
| Tests passing | ? | ? |
| Unauthorized changes | ? | ? |
| Token usage | ? | ? |
| Latency | ? | ? |
| Cloud dependency | 100% | 0%（Phase 1-5）／少量（Phase 9） |

---

## 37. E2E Example Walkthrough

使用者：「讓這個 Kubernetes controller 支援某個新 API。」

```text
User
 │
 ▼
Task Analyzer
 ├── Go / controller-runtime / Kubernetes API / version-sensitive
 ▼
Policy Engine → Research Required
 ▼
Python Research
 ├── Kubernetes docs
 ├── controller-runtime docs
 ├── upstream repository
 └── project repository
 ▼
Evidence Bundle → Evidence Gate（PASS）
 ▼
Pi + 9B → Patch
 ▼
Artifact Controller → Build → Test → FAIL
 ▼
Reflection → knowledge_error → Research Again
 ▼
Pi + 9B → Test → PASS → COMPLETE
```

整個過程 **0 次 Cloud**。這是 Phase 1–5 的典型成功案例樣貌。

---

## 38. MVP Roadmap（Phase 1–9，已重新排序）

v0.2 原本的 Sprint 6–7（MCP、ACP-Protocol）排在 Sprint 8（Reflection/Retry/Escalation）之前，Benchmark 放在最後的 Sprint 10。這個順序會讓專案陷入「protocol 都做完了，卻還不知道 Research/Evidence 到底有沒有真正提升 9B coding」的陷阱。本版採用 discuss-11 的修正順序：**先把 Cloud 拔掉，用 7B/9B 壓力測試 Control Plane，做嚴格 A/B benchmark，證明 Research/Policy/Verification/Reflection 的增益，最後才接 Cloud。**

### Architecture Validation Track（Phase 1–5，全程不含 Cloud）

**Phase 1 — Foundation**
Repo scaffold、TypeScript、pnpm、SQLite、Task model、State Machine、CLI；Worker Interface + Pi Worker + llama.cpp 串接。
驗證：`Task → Pi → Patch → Test` 這條最小 pipeline 能跑通。

**Phase 2 — Policy + Artifact + Verification**
Artifact Controller（git diff、file permissions）、Verification Engine（test/build/lint/type-check，pluggable）。
驗證：`Patch → Policy → Test`。

**Phase 3 — Research + Evidence Gate**
Python Research Engine（Repository/Documentation/Web/Dependency Retriever）、Evidence model、Evidence Bundle、Evidence Gate（沒有證據不能 coding）。
**這是第一個真正重要的 milestone。**

**Phase 4 — Reflection + Retry**
Failure Classifier、Retry Policy；`model_limitation → STOP`（不是 Cloud，見第 24 節）。

**Phase 5 — Benchmark**
Baseline Groups A–F（第 34 節）全部跑過一輪，50+ task dataset；算出 Control Plane Gain / Intelligence Efficiency / Research ROI。

> **Architecture Validation Gate**：Phase 5 結束後檢視數據——Control Plane 是否真的讓本地 7B/9B 的成功率顯著提升？這是決定要不要繼續往下走的關卡，不是走個形式的里程碑。如果數據不支持，應該回頭修 Research/Policy/Verification 的設計，而不是急著往 Phase 6 走。

### Protocol & Scale Track（Phase 6–9，Validation Gate 通過後才開始）

**Phase 6 — MCP**：Tool Gateway、Tool Policy。

**Phase 7 — ACP-Protocol**：正式的 Agent↔Runtime 邊界、process 管理、events/interrupt/session。

**Phase 8 — Multi-Worker**：OpenCode/Goose Worker adapter（第 17 節比較表的候選）、Worker Registry 真正派上用場、Project Memory 深化。

**Phase 9 — Cloud Escalation / Hybrid Execution**：實作第 25 節的完整 Execution Strategy Engine（Tier 系統、Worker/Model 解耦、Cloud Reviewer/Planner/Executor）。完成後補跑第 36 節「Cloud LLM vs 9B + Control Plane」的外部對照。

---

## 39. Definition of Done

不是「Control Plane 可以執行」，而是下面全部成立：

### Functional
- [ ] Task lifecycle 可運作
- [ ] Policy Engine 可運作
- [ ] Research Engine 可運作
- [ ] Evidence Bundle 可建立
- [ ] Evidence Gate 可阻擋 Coding
- [ ] Pi Worker 可執行
- [ ] Artifact Controller 可阻擋非法修改
- [ ] Verification 可執行
- [ ] Reflection 可分類 failure
- [ ] Retry 可執行
- [ ] MCP Tool Gateway 可執行（Phase 6）
- [ ] Audit Log 完整

### Architectural
- [ ] LLM 無 Policy 權限
- [ ] LLM 無 Artifact bypass 權限
- [ ] Research 與 Coding 分離
- [ ] Worker 與 Control Plane 分離
- [ ] MCP 與 Authorization 分離
- [ ] Cloud 在 Phase 1–5 完全 disabled（程式層強制，非僅 prompt）

### Experimental
- [ ] Raw 9B baseline（Group A）
- [ ] Research baseline（Group B）
- [ ] Policy baseline（Group C）
- [ ] Verification baseline（Group D）
- [ ] Research+Verification（Group E）
- [ ] Full Control Plane（Group F）
- [ ] 50+ benchmark tasks
- [ ] Success Rate / First-pass Rate / Retry Rate / Hallucination Rate
- [ ] Research ROI / Control Plane Gain / Intelligence Efficiency
- [ ] 完整 event log（每個 attempt，非僅彙總）

---

## 40. 第一個 E2E Test

第一個測試不要選複雜的 Kubernetes operator，選一個 **Python repository**：

> Task：Add a function and tests using an external library whose current API must be researched.

預期路徑：

```text
Task → Policy → Research Required → Official Docs → Evidence
     → Evidence Gate → Pi + 9B → Patch → Artifact Gate → pytest → PASS
```

然後做第二次同一個 task，但關掉 Research：

```text
Same task → 9B → No Research → Compare
```

兩次的差異，就是這個專案第一個可以拿到手的真實數據。

---

## 41. Non-Negotiable Architecture Rules

這六條是不可破壞的規則。守住這幾條，之後即使把 Pi 換成 OpenCode、Goose、Claude Code，甚至自己寫 Worker，整個架構都不需要推翻：

**Rule 1** — LLM 不得直接決定 Policy。

**Rule 2** — Worker 不得繞過 Artifact Controller。

**Rule 3** — Research Result 必須轉換成 Evidence Bundle 才能進入 Coding。

**Rule 4** — MCP 是 capability interface，不是 authorization layer；authorization 必須由 Control Plane 決定。

**Rule 5** — Pi 是 Worker，不是 Control Plane。

**Rule 6** — Escalation 必須由 Reflection 的失敗分類觸發，不能單純依任務難度預先判斷就跳過本地模型；Phase 1–5 期間 Cloud 是硬性停用（程式層 `throw`），不是 prompt 層級的建議。

---

## 42. Product Positioning

不叫它 **Coding Agent**，而定位成 **Agent Control Plane**。Pi／OpenCode／Goose 都只是 **Execution Workers**：

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

這個定位的價值：**核心資產不是某一個模型，也不是 Pi**，而是 **Policy + Evidence + Memory + Worker Interface + Verification + Control Loop**。這些東西未來即使模型從 9B 換成 30B、從 Pi 換成其他 runtime，架構仍然成立——這也是為什麼值得把它做成「坐在任何 Coding Agent 前面」的控制層，而不是再做一個 Coding Agent 去跟 OpenCode/Claude Code 競爭。

---

## 43. Version Roadmap

```text
v0.1 Architecture（discuss-10）
        ↓
v0.2 Implementation
        ↓
v0.3 Local Intelligence Test（確立「No Cloud」原則）
        ↓
v0.3.2 Consolidated Spec（本文件——排序 Phase 1-9、整合 Execution Strategy 設計）
        ↓
   Phase 1-5：Architecture Validation
        ↓
   Benchmark Gate — Control Plane 有沒有用？
        ↓
   Phase 6-9：Protocol + Multi-Worker + Hybrid Execution
        ↓
v0.4 Hybrid Agent（Local + Cloud，對應 Phase 9 完成）
        ↓
v0.5 Multi-Worker Production（Pi / OpenCode / Goose 並存）
        ↓
Production Control Plane
```

---

## 44. Open Questions / 尚未決定的事項

整理目前所有討論中還沒有定案、下次規劃時應該優先釐清的項目：

1. **本地 coding model 的具體型號**：Qwen／DeepSeek／Mistral／Gemma 系列各自有 coding-oriented variant，目前只確定「要用 code-specialized model」，實際要選哪個版本、7B 還是 9B，需要在 Phase 5 benchmark 時實際跑過幾個候選再定，而不是只看公開 benchmark 分數。
2. **Research 用的 search provider**：曾提過 Tavily／Brave／自建 search + crawler 三個選項，尚未定案，Phase 3 實作時需要選一個起跑。
3. **Redis 快取層**：討論初期提過，但 v0.2／v0.3 最終都只用 SQLite，Redis 是否要在 Phase 8+（Multi-Worker，查詢量上升後）重新評估，目前沒有觸發條件。
4. **Vector DB／embedding**（Qdrant／FAISS）：明確保留到 MVP 之後，但沒有具體的「什麼情況下該導入」的門檻（例如 evidence 累積到多少筆才需要語意搜尋），值得在 Phase 5 之後補一個判斷標準。
5. **50 個 benchmark task 的實際清單**：目前只有語言/生態分類比例（10 Python/10 TS/10 Go/10 K8s-Helm/10 Ansible-Terraform），具體題目尚未列出，Phase 5 開始前需要先把清單生出來。

---

*本文件整合 discuss-1 ~ discuss-11、purpose.md、results-keep.md、spec-v0_2.md、spec-v0.3.md、spec-v0.321.md 全部內容。舊檔可保留作歷史紀錄，後續開發與規格討論請以本文件為準。*
