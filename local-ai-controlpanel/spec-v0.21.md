對，而且這裡我會稍微修正前一版的設計：**Cloud Mode 不應該只是 Worker Selection 的一個選項，而應該被設計成「Escalation / Execution Tier」的一部分。**

也就是說，`Worker Selection` 確實可以選 Cloud Worker，但**不要讓它單純根據「這題比較難 → Cloud」來決定**。

---

# 1. 原本的設計

前一版是：

```text
Task
 ↓
Complexity / Risk
 ↓
Worker Selection
 ↓
┌──────────────┐
│              │
▼              ▼
Pi Local      Cloud
│              │
9B           Large LLM
```

所以你看到的：

```text
Worker Selection
       │
       ├── Pi
       ├── OpenCode
       └── Cloud Worker
```

是對的。

但我認為真正實作時應該再拆一層。

---

# 2. 我更推薦的架構

改成：

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

也就是：

> **Policy Engine 先決定 Execution Strategy，再由 Worker Router 決定實際 Worker。**

這樣會乾淨很多。

---

# 3. 為什麼不能直接 Worker Selection？

假設：

```text
Task = 修改 Kubernetes controller
```

如果直接：

```text
Worker Selection
   ↓
Complexity = High
   ↓
Claude
```

那你的本地 9B 根本沒有機會。

但我們真正想測的是：

> **9B + Research + Policy + Verification 到底可以做到什麼程度？**

所以應該：

```text
Task
 ↓
Research
 ↓
Evidence
 ↓
Pi + 9B
 ↓
Verification
```

失敗後才：

```text
Reflection
 ↓
Retry
 ↓
Cloud
```

---

# 4. 所以 Cloud Mode 最好是「升級層」

我會設計成：

```text
Execution Tier

Tier 0
Local / 9B

Tier 1
Local / stronger model

Tier 2
Hybrid

Tier 3
Cloud
```

例如：

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

---

# 5. Cloud Mode 不代表一定換 Agent

這點非常重要。

例如：

```text
Local:
Pi + Qwen 9B
```

失敗後，不一定要：

```text
Pi → Claude Code
```

可以是：

```text
Pi + 9B
   ↓
Pi + 14B
   ↓
Pi + Cloud LLM
```

甚至：

```text
Pi
 ↓
Cloud Model
```

所以應該把：

**Worker**

和

**Model**

分離。

---

# 6. Worker / Model / Execution Tier 三個概念

我建議正式規格改成：

```text
Worker
   │
   ├── Runtime
   │     ├── Pi
   │     ├── OpenCode
   │     └── Goose
   │
   └── Model
         ├── Qwen 9B
         ├── Qwen 14B
         ├── Claude
         └── GPT
```

例如：

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

---

# 7. 這樣就會產生非常有意思的 Routing

例如 Policy：

```yaml
execution:

  default:
    tier: local

  escalation:

    max_local_attempts: 3

    on_failure:
      - retry
      - research
      - stronger_model
      - cloud
```

於是：

```text
Task
 │
 ▼
Pi + 9B
 │
 ├── PASS → DONE
 │
 └── FAIL
       │
       ▼
   Reflection
       │
       ├── Knowledge Error
       │       ↓
       │    Research
       │
       ├── Coding Error
       │       ↓
       │    Retry
       │
       └── Model Limitation
               ↓
          Stronger Model
               ↓
             Cloud
```

這就比單純的：

```text
難題 → Cloud
```

聰明很多。

---

# 8. 更進一步：Cloud 甚至可以只處理「部分工作」

這是我認為你的架構真正有價值的地方。

例如：

```text
             Task
               │
               ▼
           Local 9B
               │
               ▼
         Research / Plan
               │
               ▼
        Implementation
               │
               ▼
            FAILED
               │
               ▼
        Cloud Reviewer
               │
               ▼
       回傳 Review / Fix Plan
               │
               ▼
          Local 9B
               │
               ▼
          Implementation
               │
               ▼
            Verify
```

注意：

> Cloud 不一定要「接管整個 Coding Session」。

它可以只做：

```text
Reviewer
Planner
Research Validator
Debugger
Architecture Reviewer
```

然後讓本地 9B 繼續執行。

---

# 9. 這會讓 Token 節省非常可觀

例如原本：

```text
User
 ↓
Cloud LLM
 ↓
Research
 ↓
Plan
 ↓
Coding
 ↓
Debug
 ↓
Test
 ↓
Fix
```

Cloud Token：

```text
████████████████████████████
```

你的架構：

```text
User
 ↓
Local 9B
 ↓
Research
 ↓
Local 9B
 ↓
Coding
 ↓
Test
 ↓
FAIL
 ↓
Cloud Reviewer
 ↓
Local 9B
 ↓
Fix
 ↓
Test
```

Cloud Token：

```text
███
```

這才真正符合你前面提到的：

> **「可以忽略 token 消耗」**

更精確地說應該是：

> **把昂貴 token 限制在真正需要高 intelligence 的節點。**

---

# 10. 因此我會修改 v0.2

原本：

```text
Worker Router
```

改成：

```text
Execution Strategy Engine
        │
        ├── Execution Tier
        │
        ├── Worker Router
        │
        ├── Model Router
        │
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
        ▼           ▼
      PASS         FAIL
        │           │
        ▼           ▼
      DONE      Reflection
                    │
              ┌─────┼─────┐
              ▼     ▼     ▼
           Research Retry Cloud
                         │
                         ▼
                  Cloud Worker
```

---

## 11. 甚至可以把它做成 Policy

例如：

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

    mode: reviewer_first
```

這個：

```yaml
cloud:
  mode: reviewer_first
```

我非常推薦。

因為第一階段不要直接讓 Cloud 接管。

先：

```text
Cloud Review
 ↓
Local Execute
```

只有：

```text
Cloud Review
 ↓
仍然失敗
```

才：

```text
Cloud Execute
```

---

# 12. 最後形成三種 Cloud Mode

我會正式定義：

### Cloud Reviewer

```text
Local 9B
   ↓
Cloud Review
   ↓
Local 9B
```

### Cloud Planner

```text
Research
 ↓
Cloud Planning
 ↓
Local 9B Coding
```

### Cloud Executor

```text
Task
 ↓
Cloud Worker
 ↓
Complete
```

優先順序：

```text
Reviewer
   ↓
Planner
   ↓
Executor
```

也就是：

> **能不用 Cloud 寫 code，就不要讓 Cloud 寫 code。**

這其實會讓你的 Control Plane 從「一個 Coding Agent wrapper」開始變成真正的 **Intelligence Orchestration Layer**。

而且這正好和你前面想做的 **Pi + Python + TypeScript + Research + ACP/MCP + Worker Interface** 架構完全吻合。

