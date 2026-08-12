有，而且我剛重新查了 2026 年目前的研究與實作後，要把我上一則的說法修正得更精確：

> **有人已經在往這個方向做，而且已經有相當接近的實作；但「Research → Evidence Gate → Local small model coding → Verification」這個完整組合，還不是一個成熟、主流、開箱即用的 Coding Agent。**

最接近的幾條路線如下。

### 1. Microsoft 的 Code Researcher：非常接近「先研究再寫」

這個是目前我認為**最值得你看的**。

Microsoft Research 在 2025 年發表 **Code Researcher**，明確把「修改大型 codebase 前需要先研究大量 context」當成核心問題。它會先針對：

* code semantics
* existing patterns
* commit history
* 多個相關檔案

進行 multi-step research，再把研究結果存進 structured memory，最後才 synthesis patch。([arXiv][1])

架構基本上就是：

```text
Task
 ↓
Code Researcher
 ↓
Semantic / Pattern / History Research
 ↓
Structured Memory
 ↓
Patch Synthesis
```

而且效果不是概念性的：在 Linux kernel crash benchmark 上，它的 crash-resolution rate 是 **58% vs SWE-agent 37.5%**，平均探索約 **10 個檔案 vs 1.33 個檔案**。([Microsoft][2])

**所以你說的「Coding Research Agent」確實已經有人正式研究。**

---

### 2. 但它跟你想的還差一個非常重要的東西

Code Researcher 比較像：

> **先把 codebase 研究透，再 coding。**

你現在想的是更廣義的：

```text
                 Task
                   ↓
          Knowledge Risk Analysis
                   ↓
          ┌────────┴────────┐
          │                 │
      Knowledge OK      Knowledge missing
          │                 │
          │             Research
          │             ├─ Repo
          │             ├─ Docs
          │             ├─ Web
          │             ├─ GitHub
          │             └─ API
          │                 │
          └────────┬────────┘
                   ↓
             Evidence Gate
                   ↓
             Coding Model
                   ↓
              Verification
```

也就是：

### **Research 不只是 coding research，而是 Knowledge Acquisition Layer。**

這個完整概念，我目前沒有看到哪一個主流 Coding Agent 已經完整做成產品。

---

# 3. Policy Engine 這一側也有人做

這方面其實發展得更快。

例如現在已經有 Coding Agent governance / policy engine，能控制：

```text
Agent
 ↓
Policy Engine
 ↓
Tool Call
 ↓
ALLOW / DENY / ESCALATE
```

像 EvalGuard 的 Coding Agent blueprint 就已經把：

* gateway guardrails
* MCP RBAC
* policy engine
* human approval
* evidence

放在 runtime governance 層。([EvalGuard][3])

也有其他 agent governance 工具把 policy engine 做成 runtime interception layer，例如對每次 tool call 做 allow/deny/escalate。([Intercis][4])

所以：

**Policy Engine 本身不是新東西。**

---

# 4. 真正少見的是「Policy Engine 管 Research」

這才是我們前面討論的核心。

目前大多數 policy：

```text
if command == "rm -rf":
    DENY

if file outside workspace:
    DENY

if git push --force:
    REQUIRE_APPROVAL
```

也就是：

### Security / Permission Policy

而你想的是：

```text
if task uses unknown API:
    REQUIRE_RESEARCH

if dependency version is ambiguous:
    REQUIRE_RESEARCH

if framework behavior is version-sensitive:
    REQUIRE_RESEARCH

if implementation conflicts with repository convention:
    REQUIRE_RESEARCH

if evidence confidence < threshold:
    BLOCK_CODING
```

這是完全不同的：

# **Knowledge Policy**

我目前沒有找到一個主流 Coding Agent 把這個概念做到完整、產品化。

---

# 5. 還有一條非常重要的新方向：Agentic Harness

2026 年有一篇很新的研究 **Agentic Harness Engineering**，我覺得跟你的想法也非常接近。

它不是單純修改 system prompt，而是把 Coding Agent 的：

* tools
* middleware
* long-term memory
* observability
* decision feedback

視為一個可以演化的 **harness**。

研究結果甚至顯示，改進 harness 後可以在 Terminal-Bench 2 從 69.7% 提升到 77.0%，而且在 SWE-bench-verified 上可以用更少的 token 達到更好的結果。([doi.org][5])

這非常支持你前面那個觀點：

> **不要一直試圖讓 LLM 本身更聰明；可以把 intelligence 移到 Agent Control Plane。**

---

# 6. 所以現在其實是「拼圖已經都有」

我會把目前 2026 的狀態畫成：

```text
                  你想要的架構
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   Code Research   Policy Engine   Harness
       ✅              ✅             ✅
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
                ┌──────────────┐
                │ Evidence Gate│
                └──────┬───────┘
                       │
                       ▼
                Local 7B / 9B
                       │
                       ▼
                    Coding
                       │
                       ▼
                  Verification
```

**前面幾塊已經有人做。**

但：

> **把它們組合成一個「小模型為主、Research 強制驗證、Evidence 驅動 coding、Policy 控制權限、Verification 收尾」的完整 Coding Agent OS，我目前沒有找到已經成熟到像 Claude Code / Cursor 那樣的產品。**

---

## 7. 反而這代表你的想法不是「異想天開」

這點我想特別修正一下。

你前面問：

> 「是不是可以用 Control Plane + Research + 7B/9B，讓 coding 不再高度依賴大模型？」

從目前研究來看，**這個方向是有實驗證據支持的**。

尤其 Code Researcher 證明：

> **增加 research / context gathering，本身就能顯著改善 patch generation。** ([Microsoft][2])

而 Agentic Harness Engineering 又顯示：

> **把能力放到 tools / middleware / memory / harness，而不是只靠 prompt，可以降低 token 並提升 coding performance。** ([doi.org][5])

所以真正有意思的地方已經不是：

> 「有沒有人想過 Research-before-Coding？」

答案是：**有。**

真正還沒被很好解決的是：

> ### **能不能把 Research-before-Coding 做成一個通用的 Evidence Gate，然後讓 7B/9B 這種本地模型在 Evidence 約束下負責 implementation？**

這個我目前看，**仍然是一個相當有空間的架構方向。**

而且如果你真的要做，我反而會把它定位成 **「Coding Agent Control Plane」**，而不是另一個 Coding Agent。這樣會比 OpenClaw / OpenCode / Claude Code 再做一個競品更有意思：**它可以坐在任何 Coding Agent 前面，決定「什麼時候可以寫、寫之前必須知道什麼、哪些 artifact 可以改、證據是否足夠」。**

[1]: https://arxiv.org/abs/2506.11060?utm_source=chatgpt.com "Code Researcher: Deep Research Agent for Large Systems Code and Commit History"
[2]: https://www.microsoft.com/en-us/research/publication/code-researcher-deep-research-agent-for-large-systems-code-and-commit-history/?utm_source=chatgpt.com "Code Researcher: Deep Research Agent for Large Systems Code and Commit History - Microsoft Research"
[3]: https://evalguard.ai/docs/blueprints/coding-agent?utm_source=chatgpt.com "Coding / SWE Agent blueprint — EvalGuard Docs"
[4]: https://www.intercis.io/?utm_source=chatgpt.com "Intercis — AI Agent Governance for Security Teams"
[5]: https://doi.org/10.48550/arXiv.2604.25850?utm_source=chatgpt.com "[2604.25850] Agentic Harness Engineering: Observability-Driven Automatic Evolution of Coding-Agent Harnesses"

