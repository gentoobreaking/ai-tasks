對，這其實是 **Coding Agent 很核心的一個問題**。而且你觀察到的現象是對的：

> **人類工程師遇到不確定的 API / library / framework 行為，通常會先查文件；LLM 卻常常直接開始寫。**

原因不是它「不知道要查」，而是 **目前多數 Coding Agent 的 decision policy 並沒有把「外部知識驗證」設成寫程式前的強制步驟**。

---

## 1. LLM 的基本傾向是「生成」，不是「求證」

假設你問：

> 幫我用 Kubernetes Python client 寫一個程式，建立 Deployment。

LLM 很容易直接進入：

```text
理解需求
   ↓
從 training knowledge 回憶 Kubernetes API
   ↓
產生 Python code
   ↓
執行 / 測試
   ↓
遇到錯誤再修
```

而人類工程師比較可能：

```text
理解需求
   ↓
這個 API 我記得大概是這樣
   ↓
查官方 documentation
   ↓
確認版本
   ↓
確認 API signature
   ↓
開始寫
   ↓
測試
```

這是兩種完全不同的 cognitive loop。

LLM 本身最自然的行為其實是：

> **「根據目前 context，產生最可能合理的下一段 token。」**

不是：

> **「我現在掌握的資訊是否足夠？如果不足，應該去哪裡取得證據？」**

後者是 **Agent layer 的 orchestration / policy**。

---

# 2. 為什麼「問問題」反而比較容易查？

這點非常有意思。

例如你問：

> OpenShift 4.18 的某個 API 怎麼用？

Agent 很容易判斷：

```text
Question
  ↓
Need information
  ↓
Search Web
  ↓
Answer
```

但你說：

> 幫我寫一個 OpenShift 4.18 的 Operator。

它可能變成：

```text
Coding task
  ↓
I know Kubernetes
  ↓
Start coding
  ↓
Generate files
  ↓
Run tests
  ↓
Fix errors
```

也就是：

### Question → Information Retrieval

### Coding → Task Execution

Agent 對這兩種 task 的 policy 通常是不一樣的。

問題在於第二種其實也需要 Information Retrieval。

---

# 3. 更根本的問題：LLM 不知道「自己不知道」

這才是最麻煩的。

例如：

```python
client.apps.v1.deployments.create(...)
```

模型可能很有信心地產生。

但真正的問題可能是：

* Kubernetes client 版本不同
* API signature 改變
* Python package 版本不同
* OpenShift 有自己的 extension
* 某個 method 根本不存在
* 官方推薦方式已經變了
* documentation 和 training data 不一致

LLM 很可能仍然覺得：

> 「這看起來很合理。」

這就是典型的 **epistemic uncertainty 沒有被正確暴露**。

---

# 4. Coding Agent 最理想的流程其實應該是這樣

這也是你之前一直在研究的 Agent Architecture 裡，非常值得加的一層：

```text
                    User Task
                       │
                       ▼
                ┌──────────────┐
                │ Task Analyzer│
                └──────┬───────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Knowledge Check   │
              │                  │
              │ Do I know enough?│
              └────────┬─────────┘
                       │
             ┌─────────┴─────────┐
             │                   │
           YES                   NO
             │                   │
             │                   ▼
             │            ┌─────────────┐
             │            │ Web / Docs  │
             │            │ Repo / API  │
             │            └──────┬──────┘
             │                   │
             └──────────┬────────┘
                        ▼
                 Evidence Set
                        │
                        ▼
                Implementation
                        │
                        ▼
                  Test / Verify
                        │
                 ┌──────┴──────┐
                 │             │
                PASS          FAIL
                 │             │
                 ▼             ▼
              Finish       Diagnose
                               │
                               ▼
                          Search Again
```

這其實比單純的：

```text
LLM → Write → Test → Fix
```

高一個層次。

---

# 5. 而且「寫之前查」不應該是所有事情都查

這點非常重要。

如果每一個 task 都：

```text
Search Google
Search GitHub
Read docs
Read StackOverflow
```

Coding Agent 會變得非常慢，而且 token 成本暴增。

真正好的 Agent 應該有一個：

## Knowledge Sufficiency Check

例如：

| Task                    | 查資料？     |
| ----------------------- | -------- |
| 寫 Python `for` loop     | ❌        |
| 寫一般 Bash script         | ❌        |
| 使用熟悉的 Kubernetes YAML   | 通常 ❌     |
| 使用 Kubernetes 新 API     | ✅        |
| 使用最新 Terraform provider | ✅        |
| 使用第三方 SDK               | ✅        |
| OpenShift 特定 API        | ✅        |
| Debug 一個陌生 error        | ✅        |
| 使用使用者 repo 裡未知 library  | ✅        |
| 依照最新官方文件實作              | **必須 ✅** |
| version-sensitive task  | **必須 ✅** |

所以不是：

> **Coding Agent 要永遠先上網。**

而應該是：

> **Coding Agent 要先判斷「目前 knowledge 是否足以支持這次 implementation」。**

---

# 6. 甚至「上網查」也不是最佳答案

這又是更重要的一層。

假設你叫 Agent：

> 幫我修改這個 OpenShift deployment。

它最應該查的順序可能不是 Google。

應該是：

```text
1. Current repository
       ↓
2. Existing code / configuration
       ↓
3. Local documentation
       ↓
4. Package / dependency source
       ↓
5. Official documentation
       ↓
6. GitHub upstream
       ↓
7. General web search
```

也就是：

## Context → Evidence → Implementation

而不是：

## LLM Memory → Implementation

---

# 7. 這其實正好解釋你之前遇到的 Coding Agent 問題

你之前提到過一個很典型的現象：

> 大模型常常自己繞過需求，甚至把已經完成的功能改掉。

其實這和「不查資料」是同一類問題。

因為 Agent 如果沒有建立：

```text
Requirements
     +
Repository Reality
     +
External Evidence
     +
Existing Artifacts
```

它就會依賴：

```text
LLM's current internal representation
```

然後開始「合理化」。

例如：

```text
User requirement
      ↓
LLM interpretation
      ↓
LLM memory
      ↓
LLM assumption
      ↓
Code
```

問題就在：

### Assumption 沒有被 Evidence Gate 擋住。

---

# 8. 這也是為什麼你之前提的 Artifact Locking 很重要

你之前討論的：

> **讓 LLM 沒有修改權**

其實可以和這個問題組合起來。

我會把 Coding Agent 的架構改成：

```text
                    ┌─────────────┐
                    │     User    │
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │ Task Planner│
                    └──────┬──────┘
                           ↓
              ┌────────────────────────┐
              │ Knowledge / Evidence   │
              │        Gate            │
              └───────────┬────────────┘
                          ↓
              ┌────────────────────────┐
              │ Research Agent         │
              │                        │
              │ Repo                   │
              │ Docs                   │
              │ Web                    │
              │ API                    │
              └───────────┬────────────┘
                          ↓
                   Evidence Bundle
                          ↓
              ┌────────────────────────┐
              │ Implementation Agent   │
              └───────────┬────────────┘
                          ↓
                  Proposed Patch
                          ↓
              ┌────────────────────────┐
              │ Verification Agent     │
              │                        │
              │ Test                   │
              │ Requirement            │
              │ Regression             │
              │ Evidence               │
              └───────────┬────────────┘
                          ↓
                       Commit
```

注意這裡有一個非常重要的概念：

### **Research Agent 和 Implementation Agent 可以是不同角色。**

Implementation Agent **不應該自行決定「我應該相信什麼」**。

它收到的是：

```yaml
task: implement X

evidence:
  - source: official Kubernetes docs
    version: 1.32
    facts:
      - ...
  - source: repository
    file: ...
    facts:
      - ...

constraints:
  - do_not_modify: ...
  - preserve: ...
```

然後才開始 coding。

---

# 9. 這會比單純增加 System Prompt 有效

這一點我特別想強調。

很多人會試：

```text
Before coding, always search the internet.
```

然後期待 Coding Agent 變聰明。

效果通常不會很好。

因為這只是：

```text
System Prompt
       ↓
LLM
       ↓
「我應該查一下」
```

仍然是 **LLM 自己決定是否遵守**。

更可靠的方式是：

```text
Task
 ↓
Policy Engine
 ↓
Is external evidence required?
 ↓
YES
 ↓
Search tool MUST execute
 ↓
Evidence generated
 ↓
LLM receives evidence
 ↓
Coding
```

也就是把：

> **「要不要查？」**

從 LLM 的 cognitive decision，提升成 **Agent runtime 的 deterministic control**。

---

## 10. 我認為你現在研究 Coding Agent，真正值得做的下一步

如果把你之前談的：

* Role
* Reflection
* Behavior Profile
* Artifact Locking
* Research
* Verification
* Tool Calling

全部串起來，我會建議變成：

```text
                 ┌───────────────┐
                 │   User Task   │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │ Intent Parser │
                 └───────┬───────┘
                         ↓
              ┌─────────────────────┐
              │ Knowledge Sufficiency│
              │       Gate           │
              └──────────┬──────────┘
                         ↓
                ┌────────────────┐
                │ Research Agent │
                └───────┬────────┘
                        ↓
                  Evidence Store
                        │
          ┌─────────────┴─────────────┐
          ↓                           ↓
   Requirement                    Repository
     Contract                      Contract
          │                           │
          └─────────────┬─────────────┘
                        ↓
                 Coding Agent
                        ↓
                  Patch Proposal
                        ↓
                Artifact Locking
                        ↓
               Verification Agent
                        ↓
                  Reflection
                        ↓
                ┌───────┴───────┐
                │               │
               FAIL            PASS
                │               │
                ↓               ↓
             Research        Commit
                │
                └──────→ Coding
```

這個架構有一個很大的優點：

> **LLM 不需要被要求「變得更聰明」，而是讓 Agent 限制它什麼時候可以開始寫。**

這其實就是你前面一直在問的 **「如何讓 AI Coding Agent 不要自己亂繞、不要亂改已完成的東西」** 的其中一個核心解法。

而且我會再往前推一步：

### **不要讓 Agent「先想要不要查」，而是讓 Runtime 根據 task 自動產生 Research Requirement。**

例如：

```yaml
research_policy:
  kubernetes_api: required
  third_party_library: required
  version_specific: required
  repository_existing_code: required
  generic_algorithm: optional
  trivial_syntax: unnecessary
```

這樣就從「Prompt Engineering」開始進入真正的 **Agent Control Plane / Policy Engine** 了。

這一層，我認為比單純增加更多 Role 對 Coding Agent 品質的提升更值得做。

