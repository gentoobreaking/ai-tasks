可以。如果你的目標不是做一個 demo，而是**真的想把「Evidence-driven Coding Agent Control Plane」完整做出來**，我會建議不要直接 fork OpenCode/OpenClaw 然後往裡面塞功能。

我會採用：

> **Python Control Plane + TypeScript Tool/Runtime + 本地 7B/9B Model + MCP + Docker/Sandbox**

這個組合目前最實際。

---

# 1. 我最推薦的技術棧

```text
                    ┌─────────────────────┐
                    │       CLI / UI      │
                    └──────────┬──────────┘
                               │
                               ▼
                ┌──────────────────────────┐
                │     Control Plane        │
                │        Python            │
                │                          │
                │ Policy Engine            │
                │ Task Router              │
                │ Evidence Gate            │
                │ Artifact Lock            │
                │ State Machine            │
                └────────────┬─────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
   ┌─────────────┐    ┌──────────────┐   ┌─────────────┐
   │   Research  │    │ Local Model  │   │ Verification│
   │   Engine    │    │    Server    │   │   Engine    │
   └──────┬──────┘    └──────┬───────┘   └──────┬──────┘
          │                  │                  │
     ┌────┼────┐             │             ┌────┼────┐
     ▼    ▼    ▼             ▼             ▼    ▼    ▼
    Web  Docs Repo         7B/9B          Test Lint  SAST
```

### 我會選：

| 元件               | 建議                                                     |
| ---------------- | ------------------------------------------------------ |
| Control Plane    | **Python**                                             |
| API              | FastAPI                                                |
| Workflow         | **LangGraph 或自己寫 State Machine**                       |
| Tool protocol    | **MCP**                                                |
| Research         | Tavily / Brave / 自建 search + crawler                   |
| Repository       | Git CLI + tree-sitter                                  |
| RAG              | Qdrant / SQLite + FTS                                  |
| Local LLM        | **llama.cpp / Ollama**                                 |
| 7B/9B            | Qwen / Gemma / Mistral 類 coding model                  |
| Sandbox          | Docker                                                 |
| Verification     | pytest / go test / cargo test / npm test 等             |
| Policy           | **自己做 YAML/JSON Policy Engine**                        |
| Artifact Lock    | Git diff + filesystem permission + runtime enforcement |
| State            | SQLite                                                 |
| Cache            | SQLite / Redis                                         |
| Cloud escalation | OpenAI / Anthropic / Gemini API                        |

---

# 2. 為什麼 Control Plane 我會選 Python？

你本身熟 Kubernetes / Ansible / automation，所以 Python 很適合。

而且這一層真正要做的是：

```text
Policy
State
Workflow
Research
RAG
Tool orchestration
Verification
```

而不是高效能 application server。

Python 在這些地方生態非常完整。

例如：

```python
class EvidenceGate:

    def evaluate(self, task):
        if task.requires_version_check:
            return ResearchRequired()

        if task.uses_unknown_dependency:
            return ResearchRequired()

        if task.uses_known_stable_api:
            return ResearchOptional()

        return ResearchRequired()
```

然後：

```python
decision = evidence_gate.evaluate(task)

if decision.required:
    evidence = research_engine.run(task)
    evidence_gate.verify(evidence)
```

這比把所有邏輯寫進 system prompt **可靠很多**。

---

# 3. Workflow：我反而不會過度依賴 LangGraph

這點可能跟一般推薦不同。

如果是 MVP：

### 直接自己寫 State Machine。

例如：

```python
class State(Enum):
    ANALYZE = "analyze"
    RESEARCH = "research"
    PLAN = "plan"
    IMPLEMENT = "implement"
    VERIFY = "verify"
    REFLECT = "reflect"
    COMPLETE = "complete"
```

然後：

```text
ANALYZE
   ↓
Evidence Gate
   ↓
RESEARCH
   ↓
PLAN
   ↓
IMPLEMENT
   ↓
VERIFY
   ↓
REFLECT
   ↓
COMPLETE
```

因為你現在研究的是 **Agent Control Policy 本身**。

如果一開始就把控制權交給 framework，你反而不容易知道：

> 到底是你的 policy 有效，還是 framework 幫你做了某些事情？

---

# 4. Research Engine 是整個系統最重要的部分

這裡我會拆成：

```text
Research Engine
│
├── Repository Researcher
│
├── Documentation Researcher
│
├── Web Researcher
│
├── Dependency Researcher
│
├── Version Researcher
└── Evidence Synthesizer
```

例如：

```text
Task:
使用 Kubernetes 1.34 API 修改 Deployment
```

Research Engine 自動產生：

```yaml
research_requirements:
  - kubernetes_api
  - kubernetes_version
  - client_library_version
  - repository_pattern
```

然後：

```text
                    Research
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       K8s docs     Repository    package
          │            │            │
          └────────────┼────────────┘
                       ▼
                  Evidence
```

---

# 5. Evidence 不要直接塞搜尋結果給 LLM

這是我認為整套系統最值得做好的地方。

不要：

```text
Google results
   ↓
9B
```

而是：

```text
Search
 ↓
Retrieve
 ↓
Extract
 ↓
Normalize
 ↓
Version filter
 ↓
Deduplicate
 ↓
Cross-check
 ↓
Evidence
```

最後：

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
      claim: ...
      confidence: 0.96
      source: official

  constraints:
    - preserve_existing_selector
    - do_not_modify_service
```

這才是真正的 **Evidence Bundle**。

---

# 6. Local LLM 我會用 llama.cpp 做底層

你的環境是 **M2 16GB**，所以我會優先考慮：

```text
llama.cpp
```

而不是讓 Agent framework 直接綁死 Ollama。

架構：

```text
Control Plane
      │
      │ OpenAI-compatible API
      ▼
 llama.cpp server
      │
      ▼
 7B / 9B model
```

這樣未來你換：

```text
7B
 ↓
9B
 ↓
14B
 ↓
32B
```

Control Plane 完全不用改。

---

# 7. Model 我會特別注意「coding model」

不要單純選一般 instruction model。

你的用途是：

```text
Evidence
+
Repository
+
Task
+
Constraints
 ↓
Code
```

所以優先找 **code-specialized model**。

例如可以測：

* Qwen 系列 coding/instruct 模型
* DeepSeek 系列 coding 模型
* Mistral/Gemma 的 coding-oriented variants

然後實際 benchmark：

```text
Model A 7B
Model B 9B
Model C 14B
```

而不是單純看 benchmark 分數。

因為你真正要測的是：

> **Evidence-conditioned coding performance**

---

# 8. Artifact Locking 我會放在 Runtime，不是 Prompt

例如：

```yaml
artifact_policy:
  allowed:
    - src/controller.go
    - src/controller_test.go

  readonly:
    - go.mod
    - config/

  forbidden:
    - deploy/
    - secrets/
```

然後 Control Plane：

```python
def validate_patch(diff, policy):

    for file in diff.files:

        if file in policy.forbidden:
            raise ArtifactViolation(file)

        if file not in policy.allowed:
            raise UnauthorizedModification(file)
```

所以模型即使說：

> 「我覺得應該順便修改 config」

也沒用。

Runtime：

```text
LLM request
   ↓
Tool
   ↓
Policy
   ↓
DENY
```

這才是真正的 control。

---

# 9. Verification 也不要交給 LLM

這非常重要。

不要：

```text
9B:
「我覺得 code 應該沒問題。」
```

而是：

```text
Patch
 ↓
go test
pytest
cargo test
npm test
kubectl --dry-run
helm template
ansible-lint
ruff
mypy
semgrep
```

然後把結果回饋：

```yaml
verification:
  tests: failed
  errors:
    - file: controller.go
      line: 132
      error: ...
```

再給 9B。

---

# 10. 最後才加入 Cloud Escalation

這會讓你的架構真正有意思。

```text
                     Task
                       │
                       ▼
                    Local 9B
                       │
                 ┌─────┴─────┐
                 │           │
              SUCCESS      FAILURE
                 │           │
                 ▼           ▼
               Done       Retry
                             │
                       ┌─────┴─────┐
                       │           │
                    Research    Complexity
                       │           │
                       └─────┬─────┘
                             ▼
                       Local 9B retry
                             │
                       Still failing?
                             │
                             ▼
                       Cloud LLM
```

甚至可以讓 Policy Engine 決定：

```yaml
escalation:
  max_local_attempts: 3
  max_research_rounds: 2

  escalate_when:
    - repeated_failure
    - architecture_change
    - security_sensitive
    - conflicting_evidence
    - low_confidence
```

這樣 Cloud LLM 變成：

> **Expert-on-demand**

而不是 Coding Agent 的核心。

---

# 11. 如果是我，我會這樣做第一版

不要一次做完整。

### Phase 1 — 先驗證核心假設

```text
Python
FastAPI
SQLite
llama.cpp
9B coding model
Git
Docker
```

只有：

```text
Task
 ↓
Research
 ↓
Evidence
 ↓
9B
 ↓
Patch
 ↓
Test
```

---

### Phase 2 — 加 Evidence Gate

```text
Task
 ↓
Policy
 ↓
需要 Research？
 ├── NO → 9B
 └── YES
       ↓
    Research
       ↓
    Evidence
       ↓
      9B
```

這一步才真正開始測你的核心 idea。

---

### Phase 3 — Artifact Control

加入：

```text
Allowed files
Readonly files
Forbidden files
Dependency lock
Patch size limit
```

---

### Phase 4 — Verification + Reflection

```text
Implementation
 ↓
Verification
 ↓
Failure analysis
 ↓
Research
 ↓
Retry
```

---

### Phase 5 — Cloud Escalation

最後才：

```text
Local 9B
   ↓
Failure
   ↓
Policy
   ↓
GPT / Claude / Gemini
```

---

# 12. 最終技術棧，我會定成這樣

```text
┌──────────────────────────────────────────────┐
│                  CLI / API                   │
├──────────────────────────────────────────────┤
│              Python Control Plane            │
│                                              │
│  Task Router                                 │
│  Policy Engine                               │
│  Evidence Gate                               │
│  State Machine                               │
│  Artifact Lock                               │
│  Escalation                                  │
├──────────────────────────────────────────────┤
│              Research Engine                 │
│                                              │
│  Repo      Docs      Web      Dependency     │
├──────────────────────────────────────────────┤
│              Evidence Store                  │
│          SQLite + Vector / FTS               │
├──────────────────────────────────────────────┤
│              Local Model                     │
│          llama.cpp + 7B/9B                   │
├──────────────────────────────────────────────┤
│              Tool Runtime                    │
│       MCP + Git + Docker + Shell             │
├──────────────────────────────────────────────┤
│              Verification                    │
│  Test / Lint / SAST / Build / Dry-run        │
├──────────────────────────────────────────────┤
│              Cloud Escalation                │
│       GPT / Claude / Gemini                  │
└──────────────────────────────────────────────┘
```

---

## 我最推薦你的第一個實作組合

如果考慮**開發速度 + 可控性 + 你現有技術背景 + 未來可擴充性**，我會直接選：

**Python + FastAPI + 自製 State Machine + SQLite + MCP + llama.cpp + Qwen/DeepSeek 類 7B/9B coding model + Docker + Git**

而且**不要一開始使用 LangChain/LangGraph 把整個 Agent 包起來**。

你現在真正需要研究的是 **Policy / Evidence Gate / Runtime Control**，不是 Agent framework。

等這個核心跑通，再把 OpenCode、OpenClaw、Claude Code 等當成 **downstream execution engine** 接進來都可以。

這樣最後甚至可能變成：

```text
                   Your Control Plane
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
          Local 9B     OpenCode     Claude Code
             │            │            │
             └────────────┼────────────┘
                          ▼
                     Same Policy
                     Same Evidence
                     Same Artifact Lock
                     Same Verification
```

**這個架構的價值就不再是「又做一個 Coding Agent」，而是做一個可以控制不同 Coding Agent 的「Agent Control Plane」。**

我認為這比單純 fork OpenCode/OpenClaw 更值得做。

