對。**以目前的技術條件，這套想法已經可以完整實作，而且不是研究室等級的「理論上可行」而已。**

但我要把「完整」定義清楚：

> **可以完整做出一個可工作的 Coding Agent Control Plane；但還不能保證它能以 7B/9B 在所有複雜 coding task 上達到 GPT-5.x / Claude 等級。**

這兩件事要分開看。

---

## 目前各個零件其實都已經成熟

你要的系統：

```text
                     User
                       │
                       ▼
              ┌────────────────┐
              │ Control Plane  │
              └───────┬────────┘
                      │
             ┌────────┴────────┐
             ▼                 ▼
       Policy Engine      Task Analyzer
             │                 │
             └────────┬────────┘
                      ▼
                Evidence Gate
                      │
              ┌───────┴────────┐
              ▼                ▼
          No Research       Research
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
                   Repo       Docs       Web
                    │          │          │
                    └──────────┼──────────┘
                               ▼
                        Evidence Store
                               │
                               ▼
                         Local 7B/9B
                               │
                               ▼
                         Patch Proposal
                               │
                               ▼
                       Artifact Lock
                               │
                               ▼
                         Verification
                               │
                         ┌─────┴─────┐
                         ▼           ▼
                       PASS         FAIL
                         │           │
                         ▼           └──→ Research
                       Commit
```

這裡面沒有哪一個元件是目前做不到的。

Microsoft 的 Code Researcher 已經證明「先深入研究 codebase，再產生 patch」這條路徑有效；它在 Linux kernel crash benchmark 上達到 58% resolution rate，而 SWE-agent 為 37.5%。([Microsoft][1])

而 2026 年的 Agentic Harness Engineering 研究更直接證明：**把能力放到 tools、middleware、memory、feedback 等 harness 層，而不是只靠 system prompt，可以提升 coding-agent 成效並降低 token 使用量。**([arXiv][2])

---

# 真正缺的是「把它組起來」

這才是我認為最有意思的地方。

目前是：

```text
Code Research       ✅
RAG                 ✅
Web Research        ✅
MCP                 ✅
Tool Calling        ✅
Policy Engine       ✅
Sandbox             ✅
Artifact Lock       ✅
Verification        ✅
Local 7B/9B         ✅
Cloud escalation    ✅
Agent memory        ✅
```

但比較少看到的是：

```text
              Evidence Gate
                    ↓
        「沒有足夠證據不能 coding」
                    ↓
              Local LLM
                    ↓
              Artifact Gate
                    ↓
              Verification
                    ↓
            不通過 → Research
```

也就是你真正提出的：

# **Research-driven Coding Control Plane**

目前還不是主流產品的標準架構。

而 2026 年的研究甚至已經開始把 **harness 本身**當成可以工程化、演化的核心系統；另一篇 survey 也把 planning、memory、tool use、feedback-driven control 視為 agent harness 的核心機制。([doi.org][3])

---

# 而且這對你特別有利

因為你不是想做：

> 「我要訓練一個 9B，讓它變成超強 coding model。」

這條路非常昂貴。

你想做的是：

> **「我要把 coding 所需要的外部知識與控制能力從模型裡抽出來。」**

這完全不同。

可以把模型能力拆成：

```text
                 Coding Capability
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     Knowledge      Reasoning       Execution
        │              │              │
        ▼              ▼              ▼
   Research/RAG       9B          Tool Runtime
```

這樣 9B 只需要負責中間的：

### **Reasoning + Code Generation**

而不是同時負責：

* 記住最新 API
* 記住所有 framework
* 知道所有版本差異
* 知道 repository 架構
* 知道官方最佳實踐
* 搜尋 GitHub issue
* 搜尋 documentation
* 決定哪些檔案可以改
* 判斷自己是否知道答案

這些全部由 Control Plane 處理。

---

# 所以「任何語言」這件事也真的有機會

例如你目前做 Kubernetes / OpenShift。

今天：

```text
Go + controller-runtime
```

Research：

```text
Go version
controller-runtime version
K8s API
Operator SDK
repo conventions
```

9B coding。

明天：

```text
Rust + Tokio
```

Research：

```text
Rust version
Tokio
Cargo dependencies
repository patterns
official docs
```

9B coding。

後天：

```text
Python + FastAPI
```

Research：

```text
Python version
FastAPI version
Pydantic version
existing project
official docs
```

9B coding。

所以真正「跨語言」的是：

> **Evidence + Tool + Policy architecture**

而不是模型本身。

---

# 不過，我會做一個非常重要的改變

如果你真的要做，我**不建議一開始就做 9 個 Agent**。

反而先做：

```text
                    ┌─────────────┐
                    │ User Task   │
                    └──────┬──────┘
                           ↓
                   ┌──────────────┐
                   │ Policy Engine│
                   └──────┬───────┘
                          ↓
                  ┌───────────────┐
                  │ Research Gate │
                  └──────┬────────┘
                         ↓
                 ┌───────────────┐
                 │ Research      │
                 │ Repo/Web/Docs │
                 └──────┬────────┘
                        ↓
                  Evidence Bundle
                        ↓
                   ┌────────┐
                   │  9B    │
                   │ Coding │
                   └───┬────┘
                       ↓
                 Verification
                       ↓
                 Artifact Gate
                       ↓
                     Done
```

**第一版只需要 4 個核心東西：**

1. **Policy Engine**
2. **Research/Evidence Engine**
3. **Local Coding Model**
4. **Verification Engine**

就可以開始驗證你的核心假設。

---

## 而且可以很容易做 A/B Test

這是我最推薦你做的實驗。

拿同一個 9B：

### Test A

```text
9B
 ↓
直接 Coding
 ↓
Test
```

### Test B

```text
9B
 ↓
Research
 ↓
Evidence Bundle
 ↓
Coding
 ↓
Test
```

然後比較：

| Metric           | A：直接 Coding | B：Research Gate |
| ---------------- | ----------: | --------------: |
| 成功率              |           ? |               ? |
| 修正次數             |           ? |               ? |
| hallucination    |           ? |               ? |
| 錯誤 API           |           ? |               ? |
| token            |           ? |               ? |
| latency          |           ? |               ? |
| cloud escalation |           ? |               ? |

這個實驗其實會直接回答你最重要的問題：

> **「Control Plane 到底能不能把一個 9B 的 coding 能力有效放大？」**

而且現有研究已經給了一個很好的先例：Code Researcher 顯示增加系統性的 context gathering 能顯著改善 patch generation；Agentic Harness Engineering 則顯示 harness 層本身可以帶來跨模型的能力提升。([Microsoft][1])

---

### 所以我的答案很明確：

**是，可以完整實作。**

而且不是「等未來模型進步才可以」。

**2026 年現在就可以開始做。**

真正還沒有被完全解決的，是：

> **如何把 Evidence Gate 的 policy 設計得足夠準確，讓它知道「什麼時候必須研究、研究到什麼程度才算足夠、哪些 evidence 可以信、什麼情況應該升級到大模型」。**

這一塊才是整套架構真正的技術核心。 🔥

而如果這一層做好，**你之前一直碰到的「大模型明明已經寫對，卻又自己亂改／繞需求」問題，也會一起被納入 Control Plane，而不再只是靠 prompt 要求模型「不要亂來」。**

[1]: https://www.microsoft.com/en-us/research/publication/code-researcher-deep-research-agent-for-large-systems-code-and-commit-history/?utm_source=chatgpt.com "Code Researcher: Deep Research Agent for Large Systems Code and Commit History - Microsoft Research"
[2]: https://arxiv.org/abs/2604.25850?utm_source=chatgpt.com "Agentic Harness Engineering: Observability-Driven Automatic Evolution of Coding-Agent Harnesses"
[3]: https://doi.org/10.48550/arXiv.2604.25850?utm_source=chatgpt.com "[2604.25850] Agentic Harness Engineering: Observability-Driven Automatic Evolution of Coding-Agent Harnesses"

