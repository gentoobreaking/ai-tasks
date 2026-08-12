可以，而且如果你說的是 **Pi（pi coding agent / pi-mono）**，我反而覺得它很適合拿來當你這套架構的 **Execution Agent / LLM Runtime**，而不是拿 Pi 當整個 Control Plane。

這樣會比自己從零寫 Coding Agent 快很多。

---

# 我會這樣組

```text
                         User
                           │
                           ▼
              ┌────────────────────────┐
              │   YOUR CONTROL PLANE   │
              │                        │
              │ Policy Engine          │
              │ Task Analyzer          │
              │ Evidence Gate          │
              │ Research Orchestrator  │
              │ Artifact Lock           │
              │ Verification            │
              │ Escalation              │
              └───────────┬────────────┘
                          │
                 Evidence Bundle
                          │
                          ▼
                ┌──────────────────┐
                │       Pi         │
                │                  │
                │ Agent Runtime    │
                │ Context          │
                │ Tool Calling     │
                │ Coding           │
                └────────┬─────────┘
                         │
                         ▼
                  Local 7B / 9B
                         │
                         ▼
                    Patch / Code
                         │
                         ▼
                ┌──────────────────┐
                │ Verification     │
                └──────────────────┘
```

**Pi 不負責決定「該不該 research」。**

你的 Control Plane 負責。

Pi 負責：

> **「拿到已經準備好的 context 後，把事情做完。」**

---

# 為什麼 Pi 很適合？

這其實跟你之前問我的：

> 為什麼 Pi 和 OpenCode 寫程序品質差很多？

是同一個問題的另一面。

Pi 的優勢之一就是它本身比較接近：

> **minimal agent runtime**

而不是一個把大量 orchestration、workflow、UI、policy 都塞進去的完整平台。

因此你可以把 Pi 當：

### **Coding Execution Engine**

而把你想做的東西放在 Pi 外面。

---

# 這樣分工非常漂亮

### Control Plane

負責：

```text
「現在允許做什麼？」
「還缺什麼資料？」
「需要 research 嗎？」
「哪些檔案可以修改？」
「要不要重新 research？」
「要不要升級到大模型？」
```

### Pi

負責：

```text
「根據這些 context，我怎麼完成 coding？」
```

這個 separation 很重要。

---

# 例如使用者說

> 幫我把這個 Kubernetes controller 改成支援某個 API。

Pi 如果直接收到：

```text
User request
```

很可能：

```text
LLM memory
 ↓
coding
```

---

但你的架構：

```text
User request
      ↓
Control Plane
      ↓
Task Analyzer
      ↓
「這是 version-sensitive API」
      ↓
Evidence Gate = REQUIRED
      ↓
Research
```

Research：

```text
Kubernetes official docs
        +
controller-runtime docs
        +
repository
        +
go.mod
```

最後產生：

```yaml
evidence:
  kubernetes_version: 1.34
  controller_runtime: 0.22

  verified:
    - ...
    - ...
```

然後：

```text
Evidence Bundle
      ↓
     Pi
      ↓
 Local 9B
      ↓
 coding
```

Pi 根本不需要自己去猜 Kubernetes API。

---

# 更重要的是：Pi 的 Extension 可以成為你的接口

我會讓 Control Plane 和 Pi 之間只透過一個很小的 contract。

例如：

```json
{
  "task_id": "TASK-001",
  "objective": "add deployment scaling support",

  "evidence": [
    {
      "source": "kubernetes-official",
      "fact": "..."
    },
    {
      "source": "repository",
      "fact": "..."
    }
  ],

  "allowed_files": [
    "pkg/controller/deployment.go",
    "pkg/controller/deployment_test.go"
  ],

  "readonly_files": [
    "go.mod"
  ],

  "verification": [
    "go test ./pkg/controller/..."
  ]
}
```

然後 Pi 只拿這個東西工作。

---

# 甚至可以進一步做到「Pi 沒有 Research 權限」

這點我非常推薦。

```text
                    Control Plane
                         │
                    Research Tool
                         │
                         ▼
                     Evidence
                         │
                         ▼
                       Pi
                         │
                 ┌───────┴────────┐
                 │                │
              read repo         edit
                 │                │
                 └───────┬────────┘
                         ▼
                    Verification
```

Pi **不直接擁有 web search**。

這不是因為 Pi 不會 research。

而是：

> **Research 是 Control Plane 的 policy-controlled capability。**

這會非常符合你想做的 architecture。

---

# 甚至可以把 Pi 當成「可替換 Worker」

這是我覺得最漂亮的地方。

你的 Control Plane：

```text
                 Control Plane
                      │
             Evidence Bundle
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
         Pi        OpenCode    Claude Code
          │           │           │
          ▼           ▼           ▼
        Local        Local       Cloud
         9B           9B          LLM
```

所以：

**Pi ≠ 整個 Agent**

而是：

**Pi = 一種 Worker implementation。**

這樣未來你甚至可以：

```yaml
workers:
  local:
    runtime: pi
    model: qwen-9b

  complex:
    runtime: pi
    model: larger-local-model

  expert:
    runtime: claude-code
    model: cloud
```

由 Policy Engine 決定：

```text
Task complexity
       ↓
Worker selection
```

---

# 我甚至會建議你不要 fork Pi

先做：

```text
Your Control Plane
       ↓
Pi Extension / RPC
       ↓
Pi
```

而不是：

```text
Fork Pi
 ↓
大量修改 Pi core
```

原因很簡單：

**你現在真正要驗證的是 Control Plane，而不是 Pi。**

如果 Pi 更新：

```text
Pi v1
 ↓
Pi v2
 ↓
Pi v3
```

你的 Control Plane 不應該跟著大改。

---

# 第一版可以非常小

我會直接做：

```text
control-plane/
├── policy/
│   └── engine.py
│
├── research/
│   ├── web.py
│   ├── repo.py
│   └── evidence.py
│
├── artifact/
│   └── lock.py
│
├── verification/
│   └── runner.py
│
├── workers/
│   └── pi.py
│
├── state/
│   └── sqlite.py
│
└── main.py
```

流程：

```text
main.py
   ↓
Policy Engine
   ↓
Research
   ↓
Evidence Bundle
   ↓
Pi
   ↓
Patch
   ↓
Artifact validation
   ↓
Test
   ↓
PASS / RESEARCH / ESCALATE
```

---

# 而你之前的 9 Roles 可以重新定位

這點我反而覺得會比原本的架構乾淨很多。

不要：

```text
9 個 Agent
互相聊天
互相決定
```

而是：

```text
                 Control Plane
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
   Research       Planning       Verification
       │              │              │
       └──────────────┼──────────────┘
                      ▼
                     Pi
                      │
                    9B
```

Role 變成 **policy-defined stages**，而不是 9 個自由活動的 AI。

這會大幅減少你之前遇到的：

> 「AI 做久了開始繞、亂改、自己產生一堆不必要行為」

因為它沒有那麼大的自由度。

---

## 所以，如果是「Pi + 你的想法」

我的評價是：

**非常適合。**

甚至我會把整個方案定位成：

> ### **Pi = Execution Runtime**
>
> ### **Your Control Plane = Intelligence / Governance Layer**
>
> ### **7B/9B = Local Coding Model**
>
> ### **Research Engine = External Knowledge Layer**
>
> ### **Verification = Ground Truth**

這樣架構就很完整了。

而且有一個很實際的優點：

**你不需要重新寫一個 OpenCode。**

你只需要把最有價值、目前 Coding Agent 普遍做得不夠好的那一層——**「何時研究、研究什麼、證據是否足夠、什麼時候允許 coding」**——做出來。

如果是我現在開始做，我會選 **Pi + Python Control Plane + llama.cpp + 9B coding model**，先在你的 M2 16GB 上做第一版。這個組合的成本和實作複雜度都相對合理。

