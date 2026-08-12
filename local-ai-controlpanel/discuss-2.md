有，但如果把你的條件講得很精確：

> **「Coding Agent 在開始修改程式碼之前，先強制做外部知識驗證；驗證完成後才允許進入 implementation」**

那麼截至 **2026 年 8 月**，我會說：

### **主流 Coding Agent 幾乎沒有把這件事做成預設的硬性 gate。**

目前比較接近的有幾類，但和你講的概念仍有差距。

---

## 1. Claude Code：最接近，但不是你說的「強制 Gate」

[Claude Code 官方文件](https://code.claude.com/docs/en/how-claude-code-works?utm_source=chatgpt.com) 的 agent loop 明確包含：

```text
Gather context
      ↓
Take action
      ↓
Verify
```

而且它可以搜尋 repository、執行 command、research topic，也能使用 web search。([Claude][1])

所以 Claude Code 已經具備：

```text
Research
   ↓
Coding
   ↓
Verification
```

但是關鍵差別是：

```text
             Claude Code
                  │
                  ▼
             LLM decides
                  │
          ┌───────┴───────┐
          │               │
       Search           Coding
```

而不是：

```text
             Coding Task
                  │
                  ▼
          ┌───────────────┐
          │ Research Gate │
          └───────┬───────┘
                  │
           Evidence required
                  │
                  ▼
              Research
                  │
                  ▼
           Implementation
```

Anthropic 的 web search tool 文件甚至明確寫到：

> Claude decides when to search based on the prompt. ([Claude Platform][2])

所以 **Claude 有能力 research，但不是「research completed before coding」的 deterministic policy。**

---

# 2. Claude Research 也不是 Coding Research Gate

Claude 現在有獨立的 **Research** 能力，它會進行多輪搜尋、自動決定下一步查什麼，最後整理成有 citation 的研究結果。([Claude 幫助中心][3])

這已經非常接近：

```text
Question
   ↓
Research Agent
   ↓
Multiple searches
   ↓
Evidence
   ↓
Answer
```

但它主要是 **general research workflow**。

不是：

```text
Coding Task
      ↓
Determine knowledge requirements
      ↓
MANDATORY Research
      ↓
Validate API / version / architecture
      ↓
Evidence Bundle
      ↓
Coding Agent allowed to modify code
```

這兩者其實差非常多。

---

# 3. 有一個研究方向其實非常接近你的想法

我查到一個很有意思的研究：

**Code Researcher: Deep Research Agent for Large Systems Code and Commit History**

它的核心就是：

> 在產生 patch 之前，先對大型 codebase、semantic context、patterns、commit history 做多步研究。

而且它不是單純讓 LLM 自己「想一下」。

它會：

```text
Crash / Task
     ↓
Code Research
     ↓
Semantic analysis
     ↓
Pattern search
     ↓
Commit history
     ↓
Structured memory
     ↓
Patch synthesis
```

研究中 Code Researcher 平均探索約 **10 個 files**，而 baseline SWE-agent 約 **1.33 個 files**；在它的 benchmark 上 crash-resolution rate 也由 37.5% 提升到 58%。([arXiv][4])

這個方向和你說的：

> **「先研究，取得足夠 context，再 coding」**

已經非常接近。

但它主要是 **research codebase / history**，不是你說的「先查外部官方文件」。

---

# 4. 現在很多人其實正在「自己補這一層」

這點反而很有趣。

我查到 Claude Code 社群目前已經有人在做：

```text
Coding Agent
      ↓
Research MCP
      ↓
Multiple web searches
      ↓
Documentation / GitHub issues
      ↓
Evidence
      ↓
Claude Code
```

例如有人專門做 Coding Research MCP，目的就是讓 Claude Code 在複雜 task 上先找：

* 官方 documentation
* GitHub issue
* maintainer discussion
* undocumented workaround
* implementation examples

再交給 Coding Agent。([Reddit][5])

也有人做 Webify / TinySearch 之類的 MCP，把：

```text
Web
 ↓
大量 HTML
 ↓
LLM context
```

改成：

```text
Web
 ↓
Search / ranking / extraction
 ↓
Relevant evidence
 ↓
LLM
```

主要是降低 research 帶來的 context/token 消耗。([Reddit][6])

**這反而說明了一件事情：這個問題現在確實存在。**

---

# 5. 目前產品大概是這個成熟度

我會這樣排：

| Agent               | Web / Research 能力 | Coding 前 Research | 強制 Gate |
| ------------------- | ----------------: | ----------------: | ------: |
| Cursor              |                 ✅ |                 △ |       ❌ |
| Windsurf            |                 ✅ |                 △ |       ❌ |
| Claude Code         |                 ✅ |                 ✅ |       ❌ |
| OpenCode            |           ✅/可透過工具 |                 △ |       ❌ |
| Devin               |                 ✅ |                 ✅ |       ❌ |
| Claude Research     |                ✅✅ |               N/A |       ❌ |
| Code Researcher 類研究 |   ✅ code research |             **✅** |  **接近** |
| **你描述的架構**          |                 ✅ |             **✅** |   **✅** |

所以我會修正我上一個回答中的一句話：

> **不是「完全沒有人做 Research-before-Coding」，而是「主流 Coding Agent 還沒有普遍把它變成 deterministic pre-coding evidence gate」。**

這個差異非常重要。

---

# 6. 而且我覺得你真正想做的，其實比「先上網查」更好

你前面問的是：

> 為什麼 AI 寫程序不像詢問問題，都不會直接上網查詢資料，然後才寫？

如果真的要實作，我反而**不會設計成「每次 Coding 前強制上網」**。

我會設計成：

```text
                 Coding Task
                     │
                     ▼
              Task Classifier
                     │
                     ▼
            Knowledge Risk Analysis
                     │
       ┌─────────────┼─────────────┐
       │             │             │
   Known/Stable   Versioned     Unknown
       │             │             │
       ▼             ▼             ▼
    No search    Docs Search   Deep Research
                     │             │
                     └──────┬──────┘
                            ▼
                     Evidence Bundle
                            │
                     ┌──────┴──────┐
                     │ Evidence OK?│
                     └──────┬──────┘
                            │
                           YES
                            ↓
                       Coding Agent
                            ↓
                         Verify
```

例如你叫它：

> 寫一個 Python function 把 list 排序

它根本不需要 research。

但是：

> 使用 Kubernetes 1.34 API 實作某功能

則：

```text
version-sensitive
        ↓
MANDATORY
        ↓
official Kubernetes docs
        ↓
API signature verification
        ↓
coding
```

再例如：

> 修改我們公司的 OpenShift deployment

則：

```text
Repository
   ↓
Current manifests
   ↓
Existing conventions
   ↓
OpenShift version
   ↓
Official Red Hat docs
   ↓
Evidence
   ↓
Coding
```

---

# 7. 這其實就是一個「Research Gate」

而且我認為這個東西非常值得放進你之前那套 Coding Agent 架構。

你之前一直在研究：

**Role → Reflection → Artifact Locking → Verification**

我現在會加一個：

> ### **Evidence Gate**

變成：

```text
                    User Task
                       │
                       ▼
                 Task Planner
                       │
                       ▼
              ┌────────────────┐
              │  Evidence Gate │
              └───────┬────────┘
                      │
              Knowledge required?
                      │
             ┌────────┴────────┐
             │                 │
            NO                YES
             │                 │
             │                 ▼
             │          Research Agent
             │                 │
             │          Web / Docs /
             │          GitHub / Repo
             │                 │
             │                 ▼
             │         Evidence Bundle
             │                 │
             └────────┬────────┘
                      ▼
                Coding Agent
                      │
                      ▼
                 Artifact Lock
                      │
                      ▼
               Verification Agent
                      │
                      ▼
                  Reflection
```

而且 **Evidence Gate 最重要的不是「叫 LLM 去搜尋」**。

而是：

> **沒有 Evidence，就不允許 Implementation Agent 修改 artifact。**

這就和你之前問的 **Artifact Locking** 接起來了。

---

## 最有意思的是：這可能正是目前 Coding Agent 的下一個演進方向

現在很多 Agent 的 loop：

```text
Think
 ↓
Tool
 ↓
Code
 ↓
Test
 ↓
Fix
```

下一階段比較合理的 architecture 可能變成：

```text
Understand
 ↓
Assess uncertainty
 ↓
Research
 ↓
Build evidence
 ↓
Plan
 ↓
Implement
 ↓
Verify
 ↓
Reflect
```

也就是從：

### **Tool-using Coding Agent**

逐漸變成：

### **Evidence-driven Coding Agent**

而你問的這個 **「寫之前強制驗證外部知識」**，我認為確實還沒有成為主流 Coding Agent 的標準 pattern。

如果你想做你之前那個 **9-role Coding Agent**，我反而會建議不要再增加一個普通的 Role，而是把 **Evidence Gate 放在整個 Agent Runtime / Control Plane 層**。這會比「第 10 個 Research Agent」更有價值。

[1]: https://code.claude.com/docs/en/how-claude-code-works?utm_source=chatgpt.com "How Claude Code works - Claude Code Docs"
[2]: https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool?_bhlid=e208cfd960613482669a6af2c705858115135422&f80ce999_sort_date=desc&utm_source=chatgpt.com "Web search tool - Claude API Docs"
[3]: https://support.claude.com/en/articles/11088861-use-research-on-claude?21f59b6b_page=11&46f68bc1_page=1&utm_source=chatgpt.com "Use research on Claude | Claude Help Center"
[4]: https://arxiv.org/abs/2506.11060?utm_source=chatgpt.com "Code Researcher: Deep Research Agent for Large Systems Code and Commit History"
[5]: https://www.reddit.com/r/ClaudeCode/comments/1m2bjmt?utm_source=chatgpt.com "Research sub-agent specifically for coding"
[6]: https://www.reddit.com/r/ClaudeAI/comments/1v8qh1t/i_built_a_local_web_research_mcp_for_claude_code/?utm_source=chatgpt.com "I built a local web research MCP for Claude Code that filters webpages before they eat your context window"

