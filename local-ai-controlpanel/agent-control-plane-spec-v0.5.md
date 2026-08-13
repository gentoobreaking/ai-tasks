# Agent Control Plane — Development Specification v0.5（合併版）

**Status:** Development Specification — Consolidated
**Supersedes:** discuss-10.md（v0.1 討論稿）· spec-v0_2.md（v0.2）· spec-v0.3.md（v0.3）· spec-v0.321.md（v0.4 Execution Strategy 討論稿）· **agent-control-plane-spec-v0.3.2.md（v0.3.2 整合版）** · **agent-control-plane-spec-v0.4.md（v0.4 合併版）**
**Primary Runtime（Control Plane）:** TypeScript + Node.js
**Research Runtime:** Python
**Initial Coding Worker:** Pi
**Initial Model:** Local 7B/9B（llama.cpp）
**External Model:** 架構驗證期（Phase 1–5）完全停用；Phase 9 起僅以 Escalation Provider 進入
**Protocols:** MCP + Agent Client Protocol（ACP-Protocol）+ Worker Interface
**Initial Platform:** macOS / Apple Silicon（MacBook Air M2 16GB）
**Future Platform:** Linux / Kubernetes

> 本文件為本專案**唯一、最新**的開發規格，合併自 v0.3.2（基礎架構、Phase 1–9 排序、Benchmark 設計）與 v0.4（Hybrid Execution、Cloud Escalation、Q6–Q8、Evidence Shaping、Hallucination 判定、v0.5 Sandbox 可切換模式）。
> 所有舊文件以本文件為準；內容衝突時以更新版本（**v0.5 決策**）優先。
>
> 版本關係：
> - **Phase I = v0.3 / v0.3.2**：本地專用驗證（`local_only`，Cloud 完全停用），用 7B/9B 壓力測試 Control Plane 並完成 benchmark。
> - **Phase II = v0.4**：Hybrid 執行。在 v0.3 benchmark 證明 Control Plane 有效之後，才啟用 Cloud，且 Cloud **只能以 Escalation Provider 進入**，不是 primary executor。
> - **Phase II.5 = v0.5（本文件主體）**：v0.3.2 架構 + v0.4 Hybrid 設計合併為單一權威規格，並新增 **可切換 Sandbox 模式**（bwrap / sandbox-exec / Shuru）與 **Tauri Desktop UI**（Layer 7，opencode 風格）。

---

## 目錄

0. 版本沿革與本版變更
1. 背景與動機
2. Project Objective
3. Design Principles（P1–P6）
4. System Architecture（Phase 1 / Phase II）
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
38. MVP Roadmap（Phase 1–11，已重新排序）
39. Definition of Done
40. 第一個 E2E Test
41. Non-Negotiable Architecture Rules
42. Product Positioning
43. Version Roadmap
44. Open Questions / 尚未決定的事項
45. Tauri Desktop UI（Layer 7，opencode 風格終端介面）

---

## 0. 版本沿革與本版變更

這份文件整合專案從概念討論（discuss-1 ~ discuss-11）到四版正式規格書（v0.2 / v0.3 / v0.3.2 / v0.4）的全部內容，是目前唯一需要參照的權威版本。舊版規格書可保留作歷史紀錄，但實作應以本版為準。

| 版本 | 內容重點 | 狀態 |
|---|---|---|
| v0.1（discuss-10） | 6 大設計原則、三層 Protocol 架構、MVP 分階段構想 | 已併入本版 |
| v0.2 | 完整 TypeScript 介面、SQLite schema、repo 結構、CLI、Sprint 1–10 | 已併入本版 |
| v0.3 | 移除 Cloud（架構驗證期）、Benchmark Architecture、Definition of Done | 已併入本版，核心原則保留 |
| v0.321 | Execution Strategy Engine、Worker/Model 解耦、Cloud Reviewer/Planner/Executor | 已併入本版，定位為 **Phase 9** 的正式設計 |
| v0.3.2 | 整合＋解決版本間落差、重新排序 MVP phases、Baseline A–F | 已併入本版，作為本文件的**基礎架構** |
| v0.4 | Hybrid Execution（Cloud = Escalation Provider）、Q6–Q8、Evidence Shaping、Evidence Gate 降級政策、Hallucination 自動判定、Baseline G + H–K、Phase 10–11 | 已併入本版，作為 Phase II 的正式設計 |
| **v0.5（本版）** | 合併 v0.3.2 + v0.4 為單一權威規格，＋新增**可切換 Sandbox 模式**（bwrap / sandbox-exec / Shuru，見 §21.2） | — |

### 本版解決的版本落差

合併過程中發現並解決了以下不一致，記錄下來是為了避免未來重新繞回已經討論過的岔路：

1. **Control Plane 語言**：discuss-6／discuss-7 最初建議 Python（貼近你的 Kubernetes/Ansible 背景），但 discuss-8 因為 Pi 本身是 TypeScript/Node.js 生態，改為建議 TypeScript 以避免跨語言 IPC 疊層，v0.2／v0.3 都已採用 TypeScript。本版維持 TypeScript 為 Control Plane 語言，Python 保留給 Research Engine。
2. **Cloud 是否存在於 MVP**：v0.2 的 Escalation Engine 仍包含 Cloud Worker，且排在 Sprint 8 就要實作；v0.3／discuss-11 明確要求「架構驗證期完全不存在 Cloud」，並在程式層強制擋掉。本版採用：**Phase 1–5（架構驗證期）沒有 Cloud**；v0.321 / v0.4 的 Execution Strategy Engine／Cloud Reviewer-Planner-Executor 設計為 **Phase 9–11（Hybrid Execution）** 的正式規格（見 §24、§25）。
3. **Worker Selection 的複雜度**：v0.2 一開始就設計了完整的 Worker Registry／Cost Class／Locality；v0.3 認為驗證期只需要「Worker Router → Pi Local」；v0.321 / v0.4 把 Worker Router 拆成 Execution Tier + Worker Router + Model Router + Escalation Controller。本版依階段分層呈現：Phase 1–5 只用單一 Worker（Pi + 本地模型），Phase 9 起才啟用完整 Execution Strategy Engine。
4. **MVP 順序**：v0.2 的 Sprint 6–7（MCP、ACP-Protocol）排在 Sprint 8 之前，Benchmark 放在最後的 Sprint 10；discuss-11 指出應該先做完 Reflection/Retry 並完成 Benchmark，再做 Protocol／Multi-Worker／Cloud。本版採用 discuss-11 的順序（見 §38）。
5. **Repository 結構**：以 v0.2 的 monorepo 結構為準，v0.4 增補 `model-router`、`execution-tier`、`escalation`、`cloud-client`、`opencode-worker`、`goose-worker`、`sandbox`（v0.5）（見 §7）。
6. **命名混淆**：「ACP」同時可能指我們自己的 Agent Control Plane，也可能指外部的 Agent Client Protocol。沿用 v0.2 的解法：文中一律用「Control Plane」指稱我們自己的系統，「ACP-Protocol」專指外部的 Agent Client Protocol 層。
7. **model_limitation 的行為**：v0.3 / v0.3.2 為 `STOP`；v0.4 改為 `stronger_model`（Phase 9+ escalation 才觸發，Phase 1–5 仍為 STOP）。本版合併表述：**Phase 1–5 = STOP；Phase 9+ = STRONGER_MODEL（依 Escalation Policy）**。

---

## 1. 背景與動機

### 1.1 觀察到的現象

人類工程師遇到不確定的 API／library／framework 行為，通常會先查文件；LLM 卻常常直接開始寫。原因不是「不知道要查」，而是目前多數 Coding Agent 的 decision policy 並沒有把「外部知識驗證」設成寫程式前的強制步驟——LLM 最自然的行為是「根據 context 產生最可能合理的下一段 token」，而不是「評估自己是否掌握足夠資訊、不足時該去哪裡取得證據」。後者是 Agent layer 的 orchestration/policy，不是模型能力問題。

進一步觀察：LLM 面對「問問題」時比較容易觸發查證（Question → Information Retrieval），但面對「寫程式」的任務時，卻容易直接進入 Task Execution（Coding task → I know this → Start coding），即使兩者背後需要查證的程度可能一樣高。更根本的問題是 LLM 不知道「自己不知道」——API 版本、套件版本、官方最佳實踐都可能與 training data 不一致，但模型仍可能對錯誤答案抱有高度信心，這是典型的 epistemic uncertainty 沒有被正確暴露。

2026-08 市場現況（discuss-2）：

| Agent | Web / Research 能力 | Coding 前 Research | 強制 Gate |
| --- | ---: | ---: | ---: |
| Cursor / Windsurf | ✅ | △ | ❌ |
| Claude Code | ✅ | ✅ | ❌ |
| OpenCode | ✅（可透過工具） | △ | ❌ |
| Devin | ✅ | ✅ | ❌ |
| Claude Research | ✅✅ | N/A | ❌ |
| Code Researcher 類研究 | ✅ code research | ✅ | 接近 |
| **本專案架構** | ✅ | **✅** | **✅** |

> 不是「完全沒有人做 Research-before-Coding」，而是「主流 Coding Agent 還沒有普遍把它變成 deterministic pre-coding evidence gate」。

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
- *Agentic Harness Engineering* 研究：把能力放到 tools／middleware／memory／feedback 等 harness 層而非只靠 system prompt，在 Terminal-Bench 2 上有可觀提升（69.7% → 77.0%），並能用更少 token 達到更好結果。

這兩者共同支持一個結論：**把「知識取得、驗證」系統性地做出來，比只是要求模型更聰明更有效。**

### 1.5 為什麼不是一次做 9-Role Multi-Agent

專案初期曾設想 Role / Reflection / Behavior Profile / Artifact Locking / Research / Verification / Tool Calling 等 9 種角色的 multi-agent 架構，但這會讓「到底是 policy 有效，還是 framework 幫忙做了什麼」難以歸因。因此決定：**先把 Role 收斂成 policy-defined stages，而不是 9 個自由活動的 AI**，把「何時研究、研究什麼、證據是否足夠、什麼時候允許 coding」做成 Control Plane 的核心能力，而不是再加一個 Research Agent 角色去互相討論。

---

## 2. Project Objective

核心目標：建立一個

> **Research-driven, Evidence-gated, Policy-controlled Coding Agent Control Plane**

要驗證的核心假設：

> **Agent Control Plane + Research + Policy + Verification，是否真的能讓本地 7B/9B 做到原本做不到的 Coding？**

具體要回答的問題：

- **Q1** Research 是否能降低 LLM hallucination？
- **Q2** Policy 是否能降低錯誤操作？
- **Q3** Verification + Reflection 是否能讓小模型自我修正？
- **Q4** Control Plane 各元件組合起來是否產生 synergy（而非單純疊加）？
- **Q5** 9B + Control Plane 是否可以接近部分 Cloud Coding Agent 的效果？
- **Q6**（v0.4）Cloud Escalation 的 marginal gain 到底是多少？
- **Q7**（v0.4）reviewer_first 能否用「極少量」Cloud token 換到接近 Cloud-only 的成效？
- **Q8**（v0.4）多 Worker / Execution Tier 是否能改善成本結構或成功率？（OpenCode / Goose / 不同 local model size 在同一 Control Plane 下的 A/B）

v0.4 的定位：

```text
v0.3  Local-only validation
       ↓      證明 Control Plane 有效（CP Gain 明顯為正）
v0.4  Hybrid execution
       ↓      Cloud 只做 escalation，不接管
v0.5  Multi Worker + Production（本版：＋可切換 Sandbox 模式）
```

Cloud 的角色正式定義為：

> **Production fallback / Expert-on-demand，而不是 Architecture validation component。**

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

### 3.1 最高原則

```text
LLM ≠ Controller
LLM ≠ Policy
LLM ≠ Security Boundary
LLM ≠ Source of Truth
```

LLM 是 **Coding Worker**，而不是 Agent 的最高控制者。相關文獻（Microsoft Code Researcher：Linux kernel crash 58% vs SWE-agent 37.5%；Agentic Harness Engineering：harness 層提升 Terminal-Bench 2 69.7% → 77.0%）支持「把 intelligence 放到 harness / control 層」的方向。

### 3.2 六大原則（P1 ~ P6）

六大原則，全版適用，不因 Phase 而變：

**P1 — Research Before Coding**
任務若涉及不確定 API、version-sensitive behavior、第三方 dependency、framework behavior、不熟悉的 repository、外部規格，則**沒有 Evidence，不允許 Coding**。

```text
unknown_dependency
version_sensitive
external_api
unfamiliar_framework
unfamiliar_repository
external_specification
low_confidence
security_sensitive
```

**P2 — Control Plane > Prompt**
重要規則不能只寫在 system prompt。「不要修改 config/」不能只是提示詞，必須是 Policy Engine → Artifact Permission → Runtime enforcement；LLM 沒有 capability 就無法修改。

**P3 — LLM Is Worker, Not Controller**
LLM 不負責決定是否 research、是否可以修改檔案、是否可以 commit、是否可以升級 Cloud、是否完成 task，這些全部由 Control Plane 決定。**包含 v0.4 的「是否升級 Cloud」——由 Escalation Controller 依 Policy 決定，不是由本地模型「求救」決定。**

**P4 — Evidence Is First-class Object**
Research 結果不是一段文字，而是具備 source、version、claim、confidence、timestamp、provenance 的 **Evidence Bundle**。

**P5 — Worker Is Replaceable**
第一個 Worker 是 Pi，但架構不能綁死 Pi。v0.4 正式加入第二、第三個 Worker：OpenCode、Goose。未來可再替換：Aider、Claude Code、Codex、Custom Worker。

**P6 — Verification Is Ground Truth**
LLM 說「應該沒問題」沒有意義；build／test／lint／type check／security scan／dry-run 的實際結果才是 Verification。

---

## 4. System Architecture（Phase 1 / Phase II）

### 4.1 Phase 1 系統圖（架構驗證期，local-only，作為 Phase II 的基礎架構）

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

**整張圖沒有 Cloud。** Phase 9 之前，`model_limitation` 分類的結果是 **STOP**，不是升級到 Cloud——理由見 §24。

### 4.2 Phase II 系統圖（v0.4，Hybrid）

```text
                     Task
                       │
                       ▼
                 Policy Engine
                       │
                       ▼
         ┌──────────────────────────┐
         │  Execution Strategy      │
         │  Engine（v0.4 新增）      │
         │  ├── Execution Tier      │
         │  ├── Worker Router       │
         │  ├── Model Router        │
         │  └── Escalation Ctrl     │
         └────────────┬─────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
     Local Tier               Hybrid / Cloud Tier
         │                         │
         ▼                         ▼
   Pi + 9B（local）         Cloud Reviewer / Planner
         │                         │
         ▼                         │
   Verification                   │
         │                         │
   ┌────┴────┐                    │
   ▼         ▼                    │
 PASS      FAIL                   │
   │         │                    │
   ▼         ▼                    │
 DONE   Reflection                │
           │                      │
     ┌─────┴─────┐                │
     ▼           ▼                │
  Research     Retry              │
     │           │                │
     └─────┬─────┘                │
           ▼                      │
     Local retry #2 / #3          │
           │                      │
     ┌─────┴──────────────────────┘
     ▼
Cloud Escalate（由 Escalation Controller 依 Policy 觸發，
            不是本地模型自己決定）
     ▼
┌────────────────────┐
│ Cloud Worker       │
│ ├─ Reviewer First  │
│ ├─ Planner         │
│ └─ Executor（最後） │
└────────────────────┘
```

#### 角色分工（v0.4 最重要的一層）

| 角色 | 負責 |
| --- | --- |
| **Execution Strategy Engine** | 依 Policy 決定 Execution Tier（Local / Hybrid / Cloud） |
| **Worker Router** | 依 Tier 選擇 runtime（Pi / OpenCode / Goose） |
| **Model Router** | 依 Tier 選擇 model（9B / 14B / Cloud LLM） |
| **Escalation Controller** | 依條件（repeated failure 等）在 Local retry 用盡後觸發 Cloud |

---

## 5. Architecture Layers

系統分成七層：

```text
Layer 7  User Interface        ← Tauri Desktop App（v0.5 新增，見 §45）
Layer 6  Control Plane
Layer 5  Research / Evidence
Layer 4  Worker Interface
Layer 3  Agent Runtime
Layer 2  MCP Tools
Layer 1  Execution / Verification
```

Layer 7 在 v0.5 定義為 **Tauri Desktop App**（opencode 風格終端介面），透過 HTTP/SSE 與 Control Plane（Layer 6）通訊，不直接觸碰 Layer 1–4（詳細見 §45）。

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
├── Memory Manager
│
├── Execution Strategy Engine（v0.4 新增）
├── Model Router（v0.4 新增）
└── Escalation Controller（v0.4 啟用）
```

---

## 6. Technology Stack & 決策紀錄

| 元件 | 選擇 | 備註 |
|---|---|---|
| Control Plane | **TypeScript + Node.js + Fastify + Zod** | 見下方決策紀錄 |
| Research Engine | **Python 3.12+ + FastAPI + httpx + BeautifulSoup + trafilatura + Pydantic** | AI/RAG/research 生態最完整 |
| Coding Worker（第一個） | **Pi** | 見 §17 比較 |
| Local Model 後端 | **llama.cpp**（OpenAI-compatible API），不綁死 Ollama | 換模型不需要改 Control Plane |
| 本地模型 | 7B/9B，優先找 **code-specialized model**（Qwen／DeepSeek／Mistral-Gemma coding variants） | 具體型號留待 benchmark 決定，見 §44 |
| Workflow / State Machine | **自己寫**，不用 LangGraph | 見下方理由 |
| Policy Engine | 自製 YAML/JSON Policy Engine | 不外包給 framework |
| Storage | **SQLite（+ FTS5）**，MVP 不上 Vector DB | 第一階段要驗證的是「Research 有沒有用」 |
| Sandbox（v0.5） | **bwrap（Linux）/ sandbox-exec（macOS）為預設；Shuru（MicroVM）為 high-risk 可選；Docker 為 fallback** | 見 §21.2、§28 |
| Cloud Escalation（Phase 9 才啟用） | OpenAI / Anthropic / Gemini API | 見 §25；一律包成 `CloudClient` |
| 額外 Workers（v0.4） | Pi / OpenCode / Goose | Q8 A/B；一律走同一個 Worker Interface |
| Desktop UI（v0.5，Layer 7） | **Tauri v2（Rust + WebView）＋ React + TypeScript** | 見 §45；比 Electron 輕（~10MB vs 100MB+）、原生 WebView、最小權限 |

### 決策紀錄：為什麼 Control Plane 最終選 TypeScript

1. **最初建議 Python**（discuss-6、discuss-7）：理由是 Python 的 Policy／State／Workflow／Research／RAG／Tool orchestration／Verification 生態最完整，也最貼近 Kubernetes/Ansible/automation 背景。
2. **後來改為 TypeScript**（discuss-8 起）：一旦確定用 **Pi** 作為第一個 Coding Worker，而 Pi 本身就是 TypeScript/Node.js 生態，繼續用 Python 寫 Control Plane 會變成「Python ↔ HTTP/RPC ↔ Node.js/Pi」多一層 IPC。系統的 IPC 層數越少，Evidence Gate、Artifact Lock、Policy Enforcement 就越容易做成真正可靠的控制面。
3. **最終定案**：TypeScript 負責 Control Plane（Policy／Evidence Gate／Research Orchestrator／State Machine／Artifact Lock／Escalation／Pi 整合），Python 只在真正需要 AI/Data science 生態的地方出現（Research Engine 作為獨立 service，透過 HTTP 呼叫）。只有一層 IPC（TS ↔ Python research service）。

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
│   ├── cli/
│   │   └── src/
│   │
│   └── desktop/               # v0.5：Tauri Desktop UI（Layer 7）
│       ├── src-tauri/         # Rust：tauri.conf.json、capabilities、commands
│       │   ├── src/
│       │   ├── capabilities/
│       │   └── tauri.conf.json
│       ├── src/               # React + TypeScript + Tailwind
│       │   ├── App.tsx
│       │   ├── components/
│       │   ├── api/           # Control Plane REST/SSE client
│       │   └── styles/
│       └── package.json
```

> **實際路徑決策（v0.5.0）**：程式碼與文件分離——**程式碼**位於 `~/Projects/local-ai-controlpanel`（Tauri 專案根目錄，即上述 `apps/desktop/` 的內容直接成為該專案的 root）；**開發文件**位於 `~/tasks/local-ai-controlpanel`（本 repo，含 spec 全部版本與 pre-discuss）。
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
│   ├── model-router/          # v0.4
│   ├── execution-tier/        # v0.4：Execution Strategy Engine
│   ├── escalation/            # v0.4：啟用
│   ├── cloud-client/          # v0.4：OpenAI/Anthropic/Gemini adapter
│   ├── pi-worker/
│   ├── opencode-worker/       # v0.4
│   ├── goose-worker/          # v0.4（可選）
│   ├── mcp/
│   ├── acp/
│   ├── artifact/
│   ├── verification/
│   ├── sandbox/               # v0.5：bwrap / seatbelt / shuru / docker adapter
│   ├── memory/
│   └── observability/
│
├── services/
│   └── research-engine/       # Python
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
│   ├── escalation.yaml        # v0.4
│   ├── sandbox.yaml           # v0.5：sandbox 可切換模式配置
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
├── sandbox-profiles/          # v0.5：seatbelt .sb profile、bwrap 參數模板
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
  sandboxMode?: "auto" | "bwrap" | "seatbelt" | "shuru" | "docker";   // v0.5
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

固定狀態（Phase 1–5 版本，`ESCALATE` 到 Cloud 分支在 Phase 9 前不存在，見 §24；v0.4 加入 `DEGRADED` 旗標與 `STRONGER_MODEL`）：

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
   │
   ├── PASS → PLANNING
   ├── RESEARCH_AGAIN → RESEARCHING（受限於 max_rounds）
   ├── BLOCK → ASK_USER 或 STOP      ← 知識缺口，硬性
   └── DEGRADED → PLANNING（帶旗標）  ← 基礎設施失敗，政策降級（v0.4）
   │
   ▼
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
          ├── REPAIR_ENVIRONMENT
          │
          ├── STRONGER_MODEL      ← v0.4：Phase 9+ 觸發 escalation
          │
          └── STOP   ← Phase 1–5：model_limitation 為 STOP
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
├── Escalation Policy（v0.4 啟用）
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

  evaluateExecution(context: TaskAnalysis): Promise<ExecutionStrategy>;  // v0.4

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

Policy Schema 範例（v0.4 完整版，啟用 escalation）：

```yaml
version: "2"

research:
  enabled: true
  required_when:
    - unknown_dependency
    - version_sensitive
    - external_api
    - unfamiliar_framework
    - security_sensitive
    - low_confidence
  minimum_sources: 2
  official_source_preferred: true
  preferred_sources:
    - official_documentation
    - repository
    - upstream_issue
  max_rounds: 3
  retrievers:
    repository:     true    # Phase 1 啟用
    documentation:  true    # Phase 1 啟用
    git_history:    true    # Phase 1 啟用
    web:            true    # Phase 1 啟用

evidence:
  max_tokens: 8000        # Evidence Bundle context 預算（§12.1 Evidence Shaping；按模型實測調整）
  min_relevance: 0.3      # 低於此 relevance 的 facts 不進入 shaping（仍在 Evidence Store）
  budget_percent: 0.4     # bundle 佔模型 context window 的上限比例（例如 8k/20k）

artifact:
  allowed:
    - "src/**"
    - "lib/**"
    - "tests/**"
  readonly:
    - "package-lock.json"
    - "go.mod"
  forbidden:
    - ".git/**"
    - ".env"
    - "secrets/**"

verification:
  required:
    - unit_test
    - lint

retry:
  enabled: true
  max_attempts: 3
  on:
    coding_error:       retry
    knowledge_error:    research
    requirement_error:  ask_user
    environment_error:  repair
    tool_error:         retry
    model_limitation:   stronger_model   # v0.4：Phase 9+ 升級到更強 model / Cloud

execution:
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
    mode: reviewer_first    # reviewer → planner → executor
```

**v0.3 → v0.4 的唯一行為變更：** `model_limitation` 從 `stop` 改成 `stronger_model`。這是把 v0.3 驗證到的「能力邊界」交給明確的 escalation 政策，**不是**讓 Cloud 變成 default。

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

### 12.1 Retriever 支援（正式定義）與來源優先順序

Phase 1 的 Research Engine 支援四種 retriever，**全部啟用**：

```text
Repository Retriever
  負責：目前 repo 的 code / config / 既有 pattern / 約定

Documentation Retriever
  負責：本地與官方文件（local docs → 官方 documentation）

Git History Retriever
  負責：git log / blame / 近期變更 / 既有 pattern 演進

Web Retriever
  負責：官方網站、GitHub upstream、issue、release note、general web
```

來源優先順序（執行時依序嘗試）：

```text
1. Repository
2. Git History
3. Package Metadata / Dependency source
4. Official Documentation
5. GitHub upstream / Official Issue / Release
6. Trusted Technical Source
7. General Web
```

原則是：**能從本地取得證據就不先打網路；web 是最後手段但不是停用項。**

```yaml
research:
  retrievers:
    repository:   true
    documentation: true
    git_history:  true
    web:          true
```

Research Engine 可以先查 **Project Memory**（見 §26），再決定是否需要重新 research，避免每個 task 都重查已知內容。

### 12.2 Evidence Shaping（上下文預算政策，v0.4）

7B/9B 的 context window 有限（16GB 記憶體下 KV cache 更吃緊），因此 Evidence Bundle 在交付 Worker 前必須經過 **Shaping**。機制現在定義，參數之後按模型實測調整。

**機制（確定性規則，不可由 LLM 決定）：**

```text
1. 以 policy 的 evidence.max_tokens 為預算上限
2. 組裝順序（依優先度從低到高截斷）：
   constraints（完整保留）
   versions（完整保留）
   facts（依 relevance × confidence 由高到低保留，直到預算用盡）
   unresolvedQuestions（完整保留，改用摘要式單行）
3. 被截掉的 facts 不從系統消失：
   - 仍完整存在於 SQLite evidence store / project memory
   - bundle 中僅標記 truncated = true，並記錄 droppedFactIds
4. 截斷發生時 bundle.truncated = true，且必須在 unresolvedQuestions
   追加一行：「另有 N 筆證據因超過 token 預算未提供」
5. 任何情況下不得以摘要/刪減 constraints 或 versions（完整性優先）
```

**證據完整性不受影響：** Evidence Gate（§14）以 Evidence Store 的**完整**證據集驗證；Shaping 只影響「交付給 Worker 的 bundle」，不影響 gate 判定。

---

## 13. Evidence Model

Evidence 是一級 Domain Object，不是一段文字（P4）：

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
  tokenBudget: number;      // Evidence Shaping 的預算上限（由 policy 設定，v0.4）
  estimatedTokens: number;  // shaping 後 bundle 的估計 token 數（v0.4）
  truncated: boolean;       // 是否因超過預算而截斷（v0.4）
  droppedFactIds: string[]; // 被截斷而未交付的 fact id 清單（v0.4）
}
```

> **token 估計規則（deterministic）：** 每個 fact 的 token 數以 `max(1, ceil(claim.length / 4))` 估算（中文約 2–4 字 / token，估算偏差可接受），總合即 `estimatedTokens`。不得使用 LLM 逐條估算。（v0.4）

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

不要 `Google results → 9B`，而是：

```text
Search → Retrieve → Extract → Normalize → Version filter → Deduplicate → Cross-check → Evidence
→ Shaping（截斷 / 摘要，§12.2）→ Evidence Bundle
```

---

## 14. Evidence Gate

**沒有 Evidence，就不允許 Implementation 修改 artifact。**

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
   ├── BLOCK
   │
   └── DEGRADED（v0.4：基礎設施失敗，政策允許的降級）
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
  | { status: "BLOCK"; reason: string }        // 知識缺口：硬性，永不降級
  | { status: "DEGRADED"; reason: string;      // 基礎設施失敗：政策允許的降級
      scope: "task" | "attempt";
      originalDecision: EvidenceDecision;
      flags: string[] };
```

### 14.1 兩階段評估（v0.4）

**知識缺口（BLOCK）與查證基礎設施失敗（可降級）必須分開判斷：**

```text
Research Pipeline 完成後
     │
     ▼
Stage 1: Research 執行狀態（來源有沒有「跑到」）
     COMPLETE ── 所有必要來源都嘗試成功
     PARTIAL  ── 部分來源失敗（例：web 掛掉但 repo / docs 成功）
     FAILED   ── 一個來源都拿不到
     │
     ▼
Stage 2: 證據評估（拿到的東西夠不夠）
     SUFFICIENT                  → PASS
     INSUFFICIENT（可再進步）    → RESEARCH_AGAIN
     INSUFFICIENT_LOW_CONFIDENCE → BLOCK（知識缺口，硬性）
```

**降級路徑只由 Stage 1 的 PARTIAL / FAILED 觸發；Stage 2 的 BLOCK 永不降級。**

### 14.2 降級政策（research_failure，v0.4）

```yaml
research_failure:
  retry:
    max_attempts: 2        # 基礎設施失敗先短退避重試（瞬斷 / 404 / rate limit）
    backoff: [5s, 30s]
  on_partial:              # 例：web 掛，但本地來源 OK
    if_evidence_from_local_sources_sufficient: allow_local
    else: ask_user
  on_failed:               # 例：完全離線，連 docs 都拿不到
    action: ask_user       # 預設問人；不自動降級放行
    allow_override: true   # 人可選擇「無證據硬跑」，但必須標記 degraded
    override_records_actor: true   # 記錄覆寫者與理由
```

### 14.3 降級三鐵律（v0.4）

1. **降級永遠帶旗標**：decision 記錄 `{ status: "DEGRADED"; reason; scope; originalDecision }`——在哪一層降的、為什麼、原本決策是什麼。
2. **風險分級**：低風險 task（已知穩定 API、repository 已有 pattern）可由 policy 自動降級到 local-only coding；高風險（version-sensitive、unknown dependency、security_sensitive）一律 `ask_user`。
3. **benchmark 不被污染**：`research_degraded_tasks` 單獨計數與報告；主指標可排除或分開呈現。

### 14.4 卡死防護（流程，v0.4）

```text
RESEARCHING 失敗
   ↓
重試 ×2（5s / 30s 退避）
   ↓
仍失敗 → 分類（PARTIAL / FAILED）
   ↓
Policy 依 task risk 決定：
   ├── 低風險 + PARTIAL（本地證據已足夠）→ allow_local（degraded, flagged）
   ├── 高風險                          → ASK_USER（狀態機 §9 既有狀態）
   └── 人選擇「硬跑」                  → allow_without_evidence
                                          （degraded, 記錄覆寫者與理由）
```

> 註：retriever 優先序為「本地先行」（repo → git history → docs → web），因此 **web 掛掉時大部分 task 不會卡死**；降級路徑主要救「證據只能來自外部」的 task。

---

## 15. 三層 Protocol：Worker Interface / ACP-Protocol / MCP

三個層級責任完全不同，必須固定，避免混用：

| Layer | 解決什麼 |
|---|---|
| **Worker Interface** | Control Plane 的內部抽象（Control Plane ↔ 自己的程式碼） |
| **ACP-Protocol** | Control Plane ↔ Agent Runtime（例如 Pi / OpenCode） |
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

模型可以是 Qwen / Llama / DeepSeek / 其他 coding-capable local model——**模型名稱不是 Control Plane 的 dependency**。

---

## 17. Worker 選型比較與依據

Worker Interface 刻意保持通用，`Pi` 只是第一個實作，未來可以替換或並存其他 Worker。選型比較（依「能不能被 Control Plane 有效控制」排序，而不是單純比較「哪個 Coding Agent 最強」）：

| Runtime | 當 Worker 的適合度 | 可客製程度 | Local Model | 外部 Control Plane 整合 | 評價 |
|---|---|---:|---:|---:|---:|---|
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
  costClass: "free" | "low" | "high";   // v0.4
  supportsACP: boolean;
  supportsMCP: boolean;
}
```

v0.4 的 Worker Registry 預先登錄（啟用與否由 Policy 決定）：

```yaml
workers:
  pi-local-9b:
    runtime: pi
    model: qwen-9b
    tier: local
    enabled: true

  pi-local-14b:
    runtime: pi
    model: qwen-14b
    tier: local
    enabled: false          # Phase II 中期可測

  opencode-local:
    runtime: opencode
    model: qwen-14b
    tier: local
    enabled: false          # Q8 A/B 用

  pi-cloud:
    runtime: pi
    model: cloud-model
    tier: cloud
    enabled: false          # 只有 escalation 觸發時使用

  opencode-cloud:
    runtime: opencode
    model: cloud-model
    tier: cloud
    enabled: false
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

**MCP Server 不可以自行繞過 Control Plane Policy**（Rule 4）：

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

Phase 1–5 可以先實作但不是 benchmark 的核心（見 §38 排序）；第一批工具集：`filesystem, git, shell, test, search`。v0.4 中 Cloud Worker 的 MCP 呼叫同樣受此 Gateway 管制。

---

## 19. ACP-Protocol Layer

用於 `Control Plane ↕ Agent Runtime`（而不是 `Control Plane ↕ Tool`——這兩者不要混在一起）。

因此 Pi 可以被視為一個 **ACP Agent**，Control Plane 可以對它 `spawn / send request / receive event / interrupt / terminate`。

v0.4 正式要求 ACP-Protocol 可運作在至少兩個 runtime：

```text
Control Plane ↕ Pi        （已於 v0.3 建立 abstraction boundary）
Control Plane ↕ OpenCode  （v0.4 實作）
```

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

v0.4 啟用 Cloud Worker 後，**同一組 Artifact Policy 適用於所有 Worker**（Rule 2：Cloud 不例外）。

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

Verification 絕對不交給 LLM 自己判斷（「我覺得 code 應該沒問題」不算數），一律用實際指令的結果：`go test / pytest / cargo test / npm test / kubectl --dry-run / helm template / ansible-lint / ruff / mypy / semgrep`。**Cloud 產生的 patch 一樣要過 Verification。**

### 21.1 Sandbox Interface（v0.5 新增）

所有 Verification 命令一律在 Sandbox 內執行。Sandbox 以 **Strategy Pattern（Registry / Factory）** 實作，執行前由 Verification Engine 依 `task.risk` 與 `policy.sandbox.mode` 選擇後端：

```typescript
interface Sandbox {
  name: "bwrap" | "seatbelt" | "shuru" | "docker";
  isAvailable(): Promise<boolean>;
  run(context: SandboxRunContext): Promise<SandboxRunResult>;
}

interface SandboxRunContext {
  command: string[];
  cwd: string;
  env?: Record<string, string>;
  mounts?: MountMapping[];
  network?: boolean;          // default: false（default-deny）
  timeout?: number;           // seconds, default: 120
  cpuLimit?: number;
  memoryLimitMb?: number;
}

interface SandboxRunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
}
```

```typescript
class SandboxRegistry {
  private factories: Map<string, (config: any) => Sandbox> = new Map();
  register(name: string, factory: (config: any) => Sandbox): void;
  get(name: string): Sandbox | undefined;
}

// 預設註冊
registry.register("bwrap", NewBwrapSandbox);       // Linux
registry.register("seatbelt", NewSeatbeltSandbox);  // macOS
registry.register("shuru", NewShuruSandbox);        // 高安全 MicroVM
registry.register("docker", NewDockerSandbox);      // fallback
```

### 21.2 Sandbox 選擇邏輯（v0.5 新增）

```typescript
function selectSandbox(task: Task, policy: SecurityPolicy): Sandbox {
  // 1. 明確指定模式（task / CLI override）
  if (task.sandboxMode && registry.get(task.sandboxMode)?.isAvailable()) {
    return registry.get(task.sandboxMode);
  }
  // 2. Policy 強制指定
  if (policy.sandbox?.mode && registry.get(policy.sandbox.mode)?.isAvailable()) {
    return registry.get(policy.sandbox.mode);
  }
  // 3. 高風險任務 → Shuru（硬體隔離）
  if (task.risk === "high" || policy.securityLevel === "high") {
    if (registry.get("shuru")?.isAvailable()) return registry.get("shuru");
  }
  // 4. 預設：bwrap (Linux) / seatbelt (macOS)
  if (process.platform === "darwin") {
    if (registry.get("seatbelt")?.isAvailable()) return registry.get("seatbelt");
  }
  if (registry.get("bwrap")?.isAvailable()) return registry.get("bwrap");
  // 5. Fallback: Docker
  if (registry.get("docker")?.isAvailable()) return registry.get("docker");
  throw new Error("No sandbox available");
}
```

| Mode | 實作 | 適用場景 | 啟動時間 | 記憶體開銷 | 隔離等級 |
|------|------|---------|---------|-----------|---------|
| **bwrap** (Linux) | `bubblewrap` + namespaces + seccomp | 預設：`pytest`/`go test`/`cargo test`/`npm test` | **< 10ms** | ~0 MB | OS-level（足以防範絕大多數威脅） |
| **seatbelt** (macOS) | `sandbox-exec` + SB profile | 預設：macOS 驗證 | **< 10ms** | ~0 MB | OS-level（足以防範絕大多數威脅） |
| **shuru** (High-Security) | SuperHQ MicroVM（Virtualization.framework） | 高風險：供應鏈審計、不可信 PR | ~2–3s | ~200–500MB | Hardware-level（硬體隔離） |
| **docker** (Fallback) | 容器（需 daemon） | 需要完整容器環境的驗證 | ~1–2s | ~50–100MB | 容器級 |

> **原則**：預設使用 `bwrap`/`seatbelt`，僅在 `security.risk == "high"` 或 `sandbox.mode == "shuru"` 時切換到 Shuru。bwrap 命令模板：

```bash
bwrap \
  --ro-bind /usr /usr --ro-bind /lib /lib --ro-bind /bin /bin \
  --ro-bind /opt/homebrew /opt/homebrew \
  --bind "$WORKSPACE" "$WORKSPACE" --bind /tmp /tmp \
  --proc /proc --dev /dev \
  --unshare-net --unshare-ipc --unshare-pid --die-with-parent \
  --cap-drop ALL \
  "$@"
```

macOS 用 `sandbox-exec -f verification-default.sb pytest`（default-deny profile，見 §28.1）。

### 21.3 Benchmark 對照（v0.5 新增）

```text
L = 9B + Full CP + bwrap/seatbelt sandbox        # 預設驗證模式
M = 9B + Full CP + Shuru sandbox                 # 高安全驗證模式
```

| 指標 | 計算方式 | 基線（bwrap） | 目標（Shuru） | 接受門檻 |
|------|---------|--------------|--------------|---------|
| Verification Latency Overhead | `(avg_shuru - avg_bwrap) / avg_bwrap` | 0% | +50% | ≤ +200% |
| Memory Overhead per Run | `shuru_mem - bwrap_mem` | 0 MB | 50–500 MB | ≤ 500 MB |
| High-risk Security Success Rate | `tasks_passed_in_shuru / tasks_given_to_shuru` | — | ≥ 95% | ≥ 90% |

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
    | "stronger_model"     // v0.4：Phase 9+ 才觸發 escalation
    | "stop";              // Phase 1–5：model_limitation → stop
}
```

對應動作：

```text
knowledge_error     → Research
coding_error        → Retry Worker
requirement_error   → Ask User
environment_error   → Repair Environment
model_limitation    → Stop（Phase 1–5）／Stronger Model → Cloud（Phase 9+，v0.4）
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
    tool_error:
      action: retry          # v0.4
    model_limitation:
      action: stop           # Phase 1–5（見 §24）；Phase 9+ = stronger_model
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

這是 v0.4 與 v0.2/v0.3 最大的架構差異：**把「Worker Selection」拆成「Policy Engine 決策 → Execution Tier」兩層**。

```text
Execution Strategy Engine
        │
        ├── Execution Tier     （Local / Hybrid / Cloud）
        │
        ├── Worker Router      （runtime 選擇）
        │
        ├── Model Router       （model 選擇）
        │
        └── Escalation Controller（Local 用盡後升級）
```

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

### 25.4 升級階梯（Escalation Ladder，v0.4）

```text
Pi + 9B
   ↓
Pi + 14B（可選）
   ↓
Pi + Cloud LLM
   ↓
OpenCode + Cloud LLM（可選）
```

### 25.5 三種 Cloud Mode，優先順序 Reviewer → Planner → Executor

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

```text
Cloud-only Agent：
User → Cloud LLM → Research → Plan → Coding → Debug → Test → Fix
Cloud Token：████████████████████████████

本架構：
User → Local 9B → Research → Local 9B → Coding → Test
       FAIL → Cloud Reviewer → Local 9B → Fix → Test
Cloud Token：███
```

> 把昂貴 token 限制在真正需要高 intelligence 的節點（預估 Cloud token 可降到 10% 甚至更低——實際數字由 benchmark 回答，這是 Q7）。

### 25.6 Execution Policy 完整範例

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

v0.4 補充：**Cloud Reviewer / Planner 的輸出也必須轉成 Evidence Bundle / Review Note 結構，再由本地 Worker 執行**——Cloud 不直接改 code（Rule 6）。

Phase 9 完成後，應該重新跑一次「Cloud LLM 原生 baseline」對比「9B + 完整 Control Plane」，量化 Control Plane 到底把 9B 拉到什麼程度、Cloud 還能再加多少（見 §36 的比較表）。

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

CREATE TABLE escalations (              -- v0.4
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    attempt INTEGER NOT NULL,
    reason TEXT NOT NULL,
    mode TEXT NOT NULL,                 -- reviewer / planner / executor
    provider TEXT NOT NULL,             -- anthropic / openai / gemini
    model TEXT NOT NULL,
    action TEXT NOT NULL,               -- review / plan / fix
    tokens_in INTEGER,
    tokens_out INTEGER,
    cost REAL,
    result TEXT NOT NULL,
    created_at TEXT NOT NULL
);
```

其餘資料表（結構依循同樣的 `id / task_id / ... / created_at` 慣例）：

```text
attempts · evidence_sources · policies · worker_runs
patches · reflections · project_memory
cloud_usage        ← v0.4（provider / model / tokens / cost）
hallucination_evidence ← v0.4（error-signature 分類 + Symbol Probe 結果，§36.2）
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
    enabled: false          # 本地 Worker 預設禁止；僅 Research Engine 有網
```

### 28.1 Sandbox Security 強化（v0.5 新增）

Sandbox 一律 **default-deny**：

```text
Network          DENY（sandbox 內，除非 policy 明確允許）
Secrets          DENY
Host filesystem  DENY（僅 bind 的 workspace / /tmp 可寫）
Git push         DENY
Git reset        DENY
Git clean        DENY
Docker socket    DENY
```

macOS seatbelt profile（`sandbox-profiles/verification-default.sb`）：

```text
(version 1)
(deny default)

;; 檔案系統：專案目錄可讀寫，系統目錄唯讀
(allow file-read* (require-any
  (subpath "/Users/.../workspace")
  (subpath "/tmp") (subpath "/usr") (subpath "/bin")
  (subpath "/lib") (subpath "/opt/homebrew")
  (subpath "/System/Library") (subpath "/Library/Developer/CommandLineTools")))
(allow file-write* (subpath "/Users/.../workspace"))
(allow file-write* (subpath "/tmp"))

;; Network 拒絕（預設關閉網路）
(deny network*)

;; 資源限制
(allow process-fork)
(allow sysctl-read)
```

> **實作原則：不要自己寫隔離邊界**（chroot/namespace/seccomp 組合極易踩坑），直接用 bwrap/seatbelt/Shuru，這是業界標準答案。

### 28.2 v0.4 安全附加條款（Cloud）

- Cloud Provider 的 credentials 只存在於 Control Plane（環境變數 / secrets manager），**絕不下放給 Worker**。
- Cloud 的 tool 權限與本地 Worker 相同（同一份 Tool Policy），不能因為「是強模型」就放寬。
- 所有 Cloud 呼叫都記錄於 `cloud_usage`，用於 cost / token 分析與 Q7 驗證。

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

# v0.4 新增
acp strategy TASK-001        # 顯示 Execution Strategy / Tier 決策
acp escalate TASK-001        # 手動觸發 escalation（reviewer / planner / executor）
acp cloud usage              # cloud token / cost 報表

# v0.5 新增
acp sandbox check            # 驗證各 sandbox 後端可用性
acp verify TASK-001 --sandbox bwrap|seatbelt|shuru|docker
acp sandbox status
```

---

## 30. Configuration

```yaml
runtime:
  workspace: "./workspace"
  default_worker: pi-local
  max_attempts: 3

execution:
  strategy: local_first
  local:
    worker: pi
    model: qwen-9b
    max_attempts: 3
  escalation:
    enabled: true            # Phase 1-5 = false；Phase 9 才切成 true
    conditions:
      - repeated_verification_failure
      - insufficient_model_capability
      - conflicting_evidence
      - high_risk_change
  cloud:
    mode: reviewer_first      # reviewer → planner → executor

research:
  enabled: true
  minimum_confidence: 0.85
  max_rounds: 3
  retrievers:
    repository:     true    # Phase 1
    documentation:  true    # Phase 1
    git_history:    true    # Phase 1
    web:            true    # Phase 1

evidence:
  max_tokens: 8000        # Evidence Bundle context 預算（§12.2）
  min_relevance: 0.3
  budget_percent: 0.4     # bundle 佔模型 context window 的上限比例

research_failure:         # §14.2：基礎設施失敗的降級路徑
  retry:
    max_attempts: 2
    backoff: [5s, 30s]
  on_partial:
    if_evidence_from_local_sources_sufficient: allow_local
    else: ask_user
  on_failed:
    action: ask_user
    allow_override: true
    override_records_actor: true

verification:
  required: true
  sandbox:                 # v0.5：可切換 Sandbox 模式
    mode: "auto"           # auto | bwrap | seatbelt | shuru | docker
    macos_default: "seatbelt"
    linux_default: "bwrap"
    bwrap:
      ro_bind: ["/usr", "/lib", "/bin", "/opt/homebrew"]
      bind: [workspace, "/tmp"]
      unshare: { net: true, ipc: true, pid: true }
      cap_drop: ALL
    seatbelt:
      profile: "sandbox-profiles/verification-default.sb"
    shuru:
      image: "shuru/alpine:3.20"
      memory: "512MiB"
      cpus: "1"
      network: false
      snapshot: true
    docker:
      image: "python:3.12-slim"
      network: false

cloud:
  providers:                  # 只允許 escalation 使用
    anthropic:
      enabled: false          # 預設關閉，benchmark 需要時開
      models: [claude-sonnet]
    openai:
      enabled: false
      models: [gpt-5]
    # credentials 一律來自環境變數，禁止寫入 repo
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
├── bwrap / sandbox-exec        # v0.5：預設 sandbox（Linux / macOS）
├── Shuru（MicroVM）             # v0.5：可選 high-security sandbox
├── Docker                       # fallback only
│
└── Cloud API keys（v0.4，環境變數，僅 Escalation Controller 使用）
```

**不上 Kubernetes。** 第一版直接 local process + 可切換 sandbox（bwrap/seatbelt 預設，Shuru 高風險，Docker fallback）。

---

## 32. Observability

所有 execution 都要記錄，這份 log 之後就是 benchmark 的資料來源：

```text
task_id · attempt_id · worker · model · tool_calls
research_queries · sources · evidence_confidence
files_changed · verification · retry_count
escalation · tokens · latency · cost · sandbox_mode（v0.5）
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
  "escalated": false,
  "sandbox_mode": "seatbelt"
}
```

v0.4 範例（escalated）：

```json
{
  "task_id": "TASK-042",
  "worker": "pi-local",
  "model": "qwen-9b",
  "attempt": 3,
  "verification": "failed",
  "escalated": true,
  "escalation": {
    "mode": "reviewer",
    "provider": "anthropic",
    "model": "claude-sonnet",
    "tokens_in": 12000,
    "tokens_out": 1800,
    "cost": 0.09,
    "action": "review"
  },
  "final_result": "passed_by_local_after_cloud_review"
}
```

**保留每一次 attempt 的完整 event log**，不要只留彙總數字——之後不管結果好壞，都需要能回頭分析是哪一層造成的差異。這會直接成為 benchmark 的資料來源。

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

v0.3 原本定義 A–E 五組，但把 Policy 和 Verification 混在同一組，會分不清楚到底是哪一個因子在起作用。本版採用 discuss-11 提出的更細粒度拆法（v0.3.2），再補上 v0.4 的 Hybrid 組：

### Phase I（v0.3 / v0.3.2）：Baseline Groups A ~ G

| Group | Research | Policy | Verification | 說明 |
|---|:---:|:---:|:---:|---|
| **A** | ❌ | ❌ | ❌ | Raw 9B baseline |
| **B** | ✅ | ❌ | ❌ | Research Only |
| **C** | ❌ | ✅ | ❌ | Policy Only |
| **D** | ❌ | ❌ | ✅ | Verification Only |
| **E** | ✅ | ❌ | ✅ | Research + Verification |
| **F** | ✅ | ✅ | ✅ | **Full Control Plane**（含 Evidence Gate、Artifact Gate、Reflection、Retry/Research） |
| **G** | ✅ | ✅ | ✅ | **Full CP + Cloud Escalation（v0.4）** |

**F/G 是 Phase 5 的核心實驗組。** A 到 G 全部跑完，才能回答「Research 是主要增益來源，還是 Policy/Control 才是關鍵」這類問題，而不是只知道「有 Control Plane 比沒有好」。

### Phase II（v0.4）：Hybrid Groups H ~ K

```text
H = 9B + Full CP + Cloud Reviewer
I = 9B + Full CP + Cloud Planner
J = 9B + Full CP + Cloud Executor
K = Cloud-only（Claude / GPT，無 Control Plane）
```

### Phase II.5（v0.5）：Sandbox Groups L ~ M

```text
L = 9B + Full CP + bwrap/seatbelt sandbox        # 預設驗證模式
M = 9B + Full CP + Shuru sandbox                 # 高安全驗證模式
```

### 核心比較（Q5 / Q6 / Q7）

| Metric | K: Cloud-only | G: 9B+Full CP | H: G+Reviewer | J: G+Executor |
| --- | ---: | ---: | ---: | ---: |
| Task success | 90%? | 87%? | 88%? | 91%? |
| First-pass success | ? | ? | ? | ? |
| Retry count | ? | ? | ? | ? |
| Hallucinated API | ? | ? | ? | ? |
| Tests passing | ? | ? | ? | ? |
| Unauthorized changes | ? | ? | ? | ? |
| Token usage | 100% | ~0% | ~10%? | ~30%? |
| Latency | ? | ? | ? | ? |
| Cloud dependency | 100% | 0% | 低 | 高 |

關鍵問題：

> **H 能否以接近 K 的 token 比例（預估 10%）保持接近 K 的 success rate？**（Q7）

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

| Metric | 公式 |
| --- | --- |
| Task Success Rate | `successful_tasks / total_tasks` |
| First Attempt Success | `first_attempt_success / total_tasks` |
| Verification Pass Rate | `passing_final_verification / total_tasks` |
| Retry Count | `average_attempts` |
| Research Accuracy | `correct_evidence / total_evidence` |
| Hallucination Rate | `hallucination_evidence / total_attempts`（判定見 §36.2） |
| Unauthorized Mod. Rate | `blocked_changes / attempted_changes` |
| Token Usage | `input_tokens + output_tokens` |
| Escalation Rate（v0.4） | `cloud_escalation / total_tasks` |

三個最重要的衍生指標：

**Control Plane Gain**（整個專案最重要的一個數字，§36.3）
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

v0.4 新增 Metrics：

| Metric | 公式 | 回答 |
| --- | --- | --- |
| **Cloud Marginal Gain** | `Success(G+K後) - Success(G)` | Q6 |
| **Cloud Token Ratio** | `cloud_tokens(H) / cloud_tokens(K)` | Q7 |
| **Cost Efficiency** | `success_delta / cost_delta` | Cloud 值得嗎 |
| **Reviewer Efficacy** | `tasks_passed_after_review / cloud_reviews` | Reviewer 模式有效性 |

### 36.1 Phase 9 之後：外部比較（Cloud LLM vs 9B + Control Plane）

| Metric | Cloud LLM（原生） | 9B + Full Control Plane |
|---|---|---:|---:|
| Task success | ? | ? |
| First-pass success | ? | ? |
| Retry count | ? | ? |
| Hallucinated API | ? | ? |
| Tests passing | ? | ? |
| Unauthorized changes | ? | ? |
| Token usage | ? | ? |
| Latency | ? | ? |
| Cloud dependency | 100% | 0%（Phase 1-5）／少量（Phase 9） |

### 36.2 Hallucination Rate — 判定定義（自動化，禁止 LLM-as-judge，v0.4）

> 原始公式 `invalid_claims / total_claims` 需要一個「評判人」；如果由 LLM 判定，會有**循環驗證 bias**（用 LLM 評 LLM 的幻覺）。因此判定分三層，由客觀到主觀：

**第一層 — Binary Task Outcome（ground truth）**

Task Success 由 verification 的 PASS/FAIL 決定（`pytest` / `go test` / build / lint），不需要任何評判人。這是所有指標的地基。

**第二層 — Error-Signature 自動分類器（確定性，無 LLM、無人）**

每次 verification output 自動掃描以下 pattern，命中即記錄一個 `hallucination_evidence`（含 file:line 與原文）：

```text
ModuleNotFoundError: No module named 'xxx'      → 幻覺 module
ImportError: cannot import name 'xxx'           → 幻覺 symbol
AttributeError: object has no attribute 'xxx'   → 幻覺欄位 / method
Cannot find symbol / undefined reference        → 編譯期幻覺（Go / Rust）
Property does not exist on type（ts2339 類）    → 型別層幻覺（TypeScript）
404 on required API endpoint                    → 幻覺 endpoint（API 整合題）
```

規則：

- 掃描是**字串/正則匹配**，完全確定性，跑在 verification 之後、任何 LLM 之前
- 每個 hit 寫入 `hallucination_evidence` 表（task_id / attempt / pattern_type / file:line / message）
- 分子 = 所有 attempt 的 hit 總數；分母 = total_attempts（或 total_tasks，報告時標明口徑）
- 這同時量化「Research 是否降低幻覺」：比較組別 A vs E/G 的 rate

**第二層半 — Symbol Probe（自動查證，主動附證據）**

分類器只是「偵測」，還不算「查證」。查證在**失敗當下由程序主動執行**，不是事後：

```text
[Verification FAIL 的同一時刻、同一 sandbox（pin 的版本）內自動執行]

候選 symbol / module
   ↓
依語言選擇 probe：
   Python:  python -c "import pkg; print(getattr(pkg, 'sym', None))"
   Go:      go doc pkg sym   （或 go list）
   TypeScript: grep 於 node_modules/pkg 的 .d.ts
   Ruby / JS:  require 或 Object.keys 檢查
   ↓
寫入該 hallucination_evidence 記錄：
   probeResult:   EXISTS | NOT_FOUND | UNABLE_CHECK
   pinnedVersion: requirements.txt / go.mod / package.json 鎖定的版本
   probeOutput:   簡短輸出片段
   evidenceCovered: 該 symbol 是否出現於本次 attempt 的 Evidence Bundle
                    （判斷「Research 是否應該攔下它」的關鍵欄位）
   reflectionClass: 同 attempt 的 Reflection 分類（交叉驗證用）
   sandboxId / timestamp
```

**人不需要重跑查證**：review queue 每筆候選都附上上面的證據，人只做確認或處理少數模糊案例。

**第三層 — 人樣本校正（估算殘差）**

並非所有幻覺都會報錯（例：「API 存在但參數語義用錯」可能安靜地輸出錯結果）。因此：

- 從各組的失敗 attempt 抽 **N ≈ 20~50 個樣本**，由人類標記是否為幻覺
- 用樣本算第二層分類器的 **precision / recall**，回推校正後的 rate（`adjusted = auto_detected / recall`）
- 校正結果與 precision/recall 一起寫入 benchmark report（不修正原始自動值）

**標記 rubric（消除「人各有志」）：**

| 標記 | 定義 | 查證方法 |
| --- | --- | --- |
| **外部知識幻覺** | 引用的 symbol / signature 在 pin 版本中不存在，或與官方文件（該版本）矛盾 | probe = NOT_FOUND＋對照該版官方 docs |
| **coding error（非幻覺）** | 自身程式碼拼錯、import 自己的 module 路徑錯 | 路徑可修改後通過；不涉及外部知識 |
| **環境問題（非幻覺）** | 缺系統相依、Python 版本錯、repo 自己 pin 壞了 | 修環境後同一段 code 通過 |
| **語義誤用（模糊殘差）** | import 得過、編譯得過，但參數語義 / 順序 / 副作用錯 | 存在性查證無效，這裡才需要 judgment |

**人出錯的量化：** N 個樣本由 **2 人各自標記**，報告 Cohen's κ；κ < 0.7 表示 rubric 還不夠機械，修 rubric 而不是信任人。

**明確禁止：** 以 LLM 判定幻覺作為 metric。LLM-as-judge 只允許離線做失敗 taxonomy（了解「為什麼失敗」），不能進任何報告數字。

**交叉驗證（與既有機制）：**

| 信號 | 獨立於 | 用途 |
| --- | --- | --- |
| 第二層 error-signature | pytest / LLM | 幻覺直接證據 |
| Reflection `knowledge_error` | error-signature | 幻覺的 agent 側自我歸因 |
| Evidence Gate BLOCK / RESEARCH_AGAIN 次數 | 上述兩者 | **Prevention Rate**：Policy 擋下幻覺的量化 |

兩者同時命中（error-signature + `knowledge_error`）＝高信心幻覺；Prevention Rate = `evidence_gate_blocks / (evidence_gate_blocks + hallucinations_that_passed_gate)`。

### 36.3 最重要的 Metric：Control Plane Gain

```text
CP Gain =
Success Rate(9B + Full Control Plane)
-
Success Rate(9B Raw)
```

```text
Raw 9B               38%
Full Control Plane   71%
CP Gain              +33 percentage points
```

**v0.3 → v0.4 的啟動 gate：CP Gain 必須明顯為正（例如 ≥ +15pp）。**

### 36.4 必須保留的實驗結果（results-keep）

* Raw 7B/9B baseline（A）
* Research + 7B/9B（B/E）
* Full Control Plane + 7B/9B（G）
* v0.4：G + Cloud Reviewer / Planner / Executor（H / I / J）與 Cloud-only（K）
* Task Success Rate
* First-pass Success Rate
* 平均 Retry 次數
* Research 成本 / 延遲
* Hallucination Rate（自動 error-signature 分類，§36.2）＋人樣本校正的 precision/recall
* Evidence Gate Prevention Rate（Policy 擋下幻覺的量化）
* 最終 Verification Pass Rate
* **每次 attempt 的完整 event log**（之後可回頭分析是哪一層造成差異）
* v0.4：每次 escalation 的完整記錄（原因 / mode / provider / tokens / cost / 結果）

目標是不先假設「Control Plane 一定有效」，讓數據自己回答。

---

## 37. E2E Example Walkthrough

### 37.1 Phase I 典型路徑（0 次 Cloud）

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

### 37.2 Phase II 典型路徑（v0.4，1 次 Cloud reviewer）

```text
User
 │
 ▼
Task Analyzer
 │  ├── Go / controller-runtime / Kubernetes API / version-sensitive
 ▼
Policy Engine
 ▼
Research Required
 ▼
Python Research（K8s docs / controller-runtime docs / upstream / project repo）
 ▼
Evidence Bundle
 ▼
Evidence Gate → PASS
 ▼
Pi + 9B
 ▼
Patch
 ▼
Artifact Controller → Build → Test
 ▼
FAIL × 2（Retry + Research 後仍失敗）
 ▼
Reflection → model_limitation（confidence high）
 ▼
Escalation Controller → Cloud Reviewer（1 次 API call）
 │     檢查 patch、回傳 Review / Fix Plan（不直接改 code）
 ▼
Pi + 9B implementation
 ▼
Test → PASS
 ▼
COMPLETE
```

整個過程：**1 次 Cloud call（reviewer mode，只讀不寫）。** 這是 v0.4 的典型成功路徑；Cloud Executor 只有在 Reviewer + Planner 都無法解救時才會被觸發。

---

## 38. MVP Roadmap（Phase 1–11，已重新排序）

v0.2 原本的 Sprint 6–7（MCP、ACP-Protocol）排在 Sprint 8（Reflection/Retry/Escalation）之前，Benchmark 放在最後的 Sprint 10。本版採用 discuss-11 的修正順序：**先把 Cloud 拔掉，用 7B/9B 壓力測試 Control Plane，做嚴格 A/B benchmark，證明 Research/Policy/Verification/Reflection 的增益，最後才接 Cloud。**

### Architecture Validation Track（Phase 1–5，全程不含 Cloud）

**Phase 1 — Foundation**
Repo scaffold、TypeScript、pnpm、SQLite、Task model、State Machine、CLI；Worker Interface + Pi Worker + llama.cpp 串接。
驗證：`Task → Pi → Patch → Test` 這條最小 pipeline 能跑通。

**Phase 2 — Policy + Artifact + Verification + Switchable Sandbox**
Artifact Controller（git diff、file permissions）、Verification Engine（test/build/lint/type-check，pluggable）。**v0.5：同時實作可切換 Sandbox 模式（bwrap / sandbox-exec / Shuru）**——Sandbox 第一天就做，不要先住 host 再搬（discuss-12 的教訓）。

**Sandbox 子任務（依序）：**

```text
2a. Sandbox Interface + Registry（§21.1）
    └── packages/sandbox/ + ISandbox / SandboxRegistry（Factory pattern）
2b. bwrap adapter（Linux 預設）
    └── bubblewrap + namespaces + seccomp，<10ms 啟動，命令模板見 §21.2
2c. sandbox-exec adapter（macOS 預設）
    └── Seatbelt .sb profile（default-deny），profile 見 §28.1
2d. verify TASK-001 --sandbox bwrap|seatbelt 可切換執行（CLI §29）
2e. Shuru adapter（high-risk 可選模式）
    └── MicroVM 後端（Virtualization.framework），快照加速，見 §21.2/§21.3
2f. Sandbox Matrix 測試（五種 verifier × 三種 sandbox 後端）
```

**三種模式的定位（Phase 2 完成時的驗收標準）：**

| 模式 | 平台 | 預設 | 用途 | 驗收 |
|------|------|:---:|------|------|
| **bwrap** | Linux | ✅ | `pytest`/`go test`/`cargo test`/`npm test` 等例行驗證 | `bwrap --version` 可用；隔離 fail 測試通過 |
| **sandbox-exec** | macOS | ✅ | 同上（macOS 原生） | `.sb` profile 可擋寫入系統目錄 |
| **Shuru** | macOS/Linux | ❌ | `risk == high`（供應鏈審計、不可信 PR、未信任代碼） | `shuru run pytest` 通過；快照可復原 |

**硬性要求：**

- 三種模式共用同一個 `Sandbox` interface（§21.1），切換只改 config（`verification.sandbox.mode`，§30），不改 Verification Engine 呼叫端
- sandbox 一律 default-deny：network / secrets / host filesystem（§28.1）
- **Phase 2 只要求 bwrap/seatbelt 完整實作並通過測試；Shuru adapter 完成 interface 對接即可，**不需在 Phase 2 預載全部映像
- 驗證：`Patch → Policy → Sandbox → Test`＋`acp sandbox check` 三後端狀態正常

**Phase 3 — Research + Evidence Gate**
Python Research Engine（Repository/Documentation/Web/Dependency Retriever，四種全部啟用）、Evidence model、Evidence Bundle（含 Shaping，§12.2）、Evidence Gate（沒有證據不能 coding）。
**這是第一個真正重要的 milestone。**

**Phase 4 — Reflection + Retry**
Failure Classifier、Retry Policy；`model_limitation → STOP`（不是 Cloud，見 §24）。

**Phase 5 — Benchmark**
Baseline Groups A–F（§34）全部跑過一輪，50+ task dataset；算出 Control Plane Gain / Intelligence Efficiency / Research ROI。

> **Architecture Validation Gate**：Phase 5 結束後檢視數據——Control Plane 是否真的讓本地 7B/9B 的成功率顯著提升（CP Gain ≥ +15pp）？這是決定要不要繼續往下走的關卡。如果數據不支持，應該回頭修 Research/Policy/Verification 的設計，而不是急著往 Phase 6 走。

### Protocol & Scale Track（Phase 6–11，Validation Gate 通過後才開始）

**Phase 6 — ACP-Protocol**：正式的 Agent↔Runtime 邊界、process 管理、events/interrupt/session（Control Plane ↔ Pi）。

**Phase 7 — MCP + Tool Gateway**：Tool Gateway、Tool Policy 完整化。

**Phase 8 — Multi-Worker**：OpenCode/Goose Worker adapter（§17 比較表的候選）、Worker Registry 真正派上用場、Project Memory 深化。

**Phase 9 — Execution Strategy Engine + Model Router**：實作 §25 的完整 Execution Strategy Engine（Tier 系統、Worker/Model 解耦）。

**Phase 10 — Cloud Escalation**：reviewer_first → planner → executor，Cloud Reviewer / Planner / Executor 三種 mode。

**Phase 11 — Hybrid Benchmark**：H / I / J / K 四組 hybrid benchmark（§34）+ Q6/Q7 分析；v0.5 另加 L / M 兩組 sandbox 對照。

注意順序：**先 ACP/MCP/Multi Worker，最後才是 Cloud Escalation**。理由與 v0.3 相同——先證明每一層本地能力，Cloud 才不會污染實驗結果。

### UI Track（v0.5，與 Core Track 平行）

Tauri Desktop UI（§45）為獨立 Track，不阻塞 Core Track：

```text
Phase 2 完成後 → UI-1 ~ UI-4（scaffold、terminal 視覺、SSE 串流、命令面板）
Phase 5 前     → UI-1~UI-4 可用（可視覺化 benchmark 的 task 執行）
Phase 8+       → UI-5 / UI-6（sandbox 整合顯示、approve 流程、打包）
```

UI 依賴的 Control Plane API（§45.5）須在 Phase 2 同時提供（REST 基礎 endpoint）＋ Phase 3 加入 SSE events。

### 第一個 Hybrid E2E 測試

沿用 Phase I 的 Python repository 情境，外加：

> Same task，強制走 `model_limitation` 路徑 → 觸發 Cloud Reviewer → Local 重做 → 比較「有 / 無 reviewer」的 success 與 token。

---

## 39. Definition of Done

不是「Control Plane 可以執行」，而是下面全部成立：

### Gate 0（v0.3 前置條件，必須先成立）

* [ ] Phase I benchmark 完成（A ~ G）
* [ ] CP Gain 明顯為正（建議 ≥ +15pp）
* [ ] 每次 attempt 的 event log 已存檔

### Functional

- [ ] Task lifecycle 可運作
- [ ] Policy Engine 可運作
- [ ] Research Engine 可運作
- [ ] Evidence Bundle 可建立（含 Shaping，v0.4）
- [ ] Evidence Gate 可阻擋 Coding（含 DEGRADED 路徑，v0.4）
- [ ] Pi Worker 可執行
- [ ] Artifact Controller 可阻擋非法修改
- [ ] Verification 可執行
- [ ] Reflection 可分類 failure
- [ ] Retry 可執行
- [ ] MCP Tool Gateway 可執行（Phase 7）
- [ ] Audit Log 完整
- [ ] Sandbox 可切換：bwrap/seatbelt 預設、Shuru high-risk、Docker fallback（v0.5）⭐
- [ ] Phase 2：`acp sandbox check` 顯示 bwrap / sandbox-exec / Shuru 三後端狀態（v0.5）⭐
- [ ] Phase 2：`acp verify --sandbox bwrap|seatbelt|shuru` 可切換執行同一 verifier（v0.5）⭐
- [ ] Phase 2：Sandbox Matrix（5 verifier × 3 sandbox 後端）通過（v0.5）⭐
- [ ] Execution Strategy Engine 可運作（v0.4）⭐
- [ ] Escalation Controller 依 Policy 觸發，不依賴 LLM（v0.4）⭐
- [ ] Cloud Reviewer / Planner / Executor 三種 mode 可運作（v0.4）⭐
- [ ] Cloud 產生的 patch 通過同一套 Artifact / Verification（v0.4）⭐
- [ ] `cloud_usage` / `escalations` 記錄完整（v0.4）⭐
- [ ] OpenCode Worker 可跑通 ACP-Protocol（v0.4）⭐
- [ ] Tauri UI：SSE 串流顯示 task 全域事件（UI-1~UI-4，§45.6）（v0.5）⭐
- [ ] Tauri UI：sandbox mode badge + `sandbox check` 顯示（UI-5，§45.6）（v0.5）⭐
- [ ] Tauri UI：WebView 無 filesystem/shell/secrets 存取權限（capabilities whitelist）（v0.5）⭐

### Architectural

- [ ] LLM 無 Policy 權限
- [ ] LLM 無 Artifact bypass 權限
- [ ] Research 與 Coding 分離
- [ ] Worker 與 Control Plane 分離
- [ ] MCP 與 Authorization 分離
- [ ] Cloud 在 Phase 1–5 完全 disabled（程式層強制，非僅 prompt）
- [ ] Worker / Model / Execution Tier 分離（v0.4）⭐
- [ ] Cloud 只有 escalation 路徑；local_first 為 default（v0.4）⭐
- [ ] Cloud credentials 不進 Worker、不進 repo（v0.4）⭐
- [ ] Sandbox 預設 default-deny（network / secrets / host filesystem）（v0.5）⭐

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
- [ ] H / I / J / K 四組 hybrid benchmark 完成（v0.4）⭐
- [ ] Cloud Marginal Gain（Q6）量化（v0.4）⭐
- [ ] Cloud Token Ratio（Q7）量化（v0.4）⭐
- [ ] Reviewer Efficacy 量化（v0.4）⭐
- [ ] L / M sandbox 對照組完成（v0.5）⭐

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

這六條（＋v0.4 兩條新增）是不可破壞的規則。守住這幾條，之後即使把 Pi 換成 OpenCode、Goose、Claude Code，甚至自己寫 Worker，整個架構都不需要推翻：

**Rule 1** — LLM 不得直接決定 Policy。

**Rule 2** — Worker 不得繞過 Artifact Controller。

**Rule 3** — Research Result 必須轉換成 Evidence Bundle 才能進入 Coding。

**Rule 4** — MCP 是 capability interface，不是 authorization layer；authorization 必須由 Control Plane 決定。

**Rule 5** — Pi 是 Worker，不是 Control Plane。

**Rule 6**（v0.4 新增）— Cloud 是 Escalation Provider，不是 Primary Executor。

> **能不用 Cloud 寫 code，就不要讓 Cloud 寫 code。**
> Cloud 第一優先角色是 Reviewer / Planner，最後才是 Executor：
> `Cloud Reviewer → Cloud Planner → Cloud Executor（最後手段）`

**Rule 7**（v0.4 新增，自 spec-v0.21）— Worker / Model / Execution Tier 三者分離。

```text
Worker
 │
 ├── Runtime：Pi / OpenCode / Goose
 │
 └── Model：Qwen 9B / Qwen 14B / Claude / GPT
```

`Worker Selection` 不能簡單根據「這題比較難 → Cloud」決定；必須由 **Policy Engine → Execution Strategy（Tier）→ Worker Router → Model Router** 依序決定。

**Rule 8**（v0.5 新增）— Verification 命令一律在 Sandbox 內執行，sandbox 選擇由 Policy 決定，不交給 LLM 或 Worker。

---

## 42. Product Positioning

不叫它 **Coding Agent**，而定位成 **Agent Control Plane**。Pi／OpenCode／Goose／Cloud 都只是 **Execution Workers**：

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
v0.3.2 Consolidated Spec（排序 Phase 1-9、整合 Execution Strategy 設計）
        ↓
v0.4 Hybrid Agent（Local + Cloud，對應 Phase 9-11 完成）
        ↓
v0.5 Consolidated + Sandbox Modes（本文件）
        │
        ├── v0.3.2 架構 + v0.4 Hybrid 合併為單一權威規格
        ├── 可切換 Sandbox 模式（bwrap / seatbelt / Shuru / Docker）
        └── Worker Router 依 task / cost / latency 動態選擇
        ↓
Production ACP
        │
        ├── Linux / Kubernetes deployment
        ├── 多使用者 / 多 repo 並行 task
        └── 安全硬化（sandbox 強化、secrets 管理、審計）
```

### 最終產品演進

```text
                    ┌──────────────────────┐
                    │   v0.1 Architecture │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │ v0.2 Implementation │
                    └──────────┬───────────┘
                               ▼
             ┌────────────────────────────────┐
             │ v0.3 Local Intelligence Test │
             │       9B + Control Plane      │
             └───────────────┬────────────────┘
                             │
                       Benchmark (A-G)
                             │
                             ▼
                   ┌─────────────────┐
                   │ Does CP work?   │
                   └───────┬─────────┘
                           ▼
                 ┌─────────────────────┐
                 │ v0.4 Hybrid Agent   │
                 │  Local + Cloud      │
                 └──────────┬──────────┘
                            ▼
                 ┌─────────────────────┐
                 │ v0.5 Consolidated   │
                 │ + Sandbox Modes     │
                 └──────────┬──────────┘
                            ▼
                 ┌─────────────────────┐
                 │ Production ACP      │
                 └─────────────────────┘
```

---

## 44. Open Questions / 尚未決定的事項

整理目前所有討論中還沒有定案、下次規劃時應該優先釐清的項目：

1. **本地 coding model 的具體型號**：Qwen／DeepSeek／Mistral／Gemma 系列各自有 coding-oriented variant，目前只確定「要用 code-specialized model」，實際要選哪個版本、7B 還是 9B，需要在 Phase 5 benchmark 時實際跑過幾個候選再定。
2. **Research 用的 search provider**：曾提過 Tavily／Brave／自建 search + crawler 三個選項，尚未定案，Phase 3 實作時需要選一個起跑。
3. **Redis 快取層**：討論初期提過，但 v0.2／v0.3 最終都只用 SQLite，Redis 是否要在 Phase 8+（Multi-Worker，查詢量上升後）重新評估，目前沒有觸發條件。
4. **Vector DB／embedding**（Qdrant／FAISS）：明確保留到 MVP 之後，但沒有具體的「什麼情況下該導入」的門檻（例如 evidence 累積到多少筆才需要語意搜尋），值得在 Phase 5 之後補一個判斷標準。
5. **50 個 benchmark task 的實際清單**：目前只有語言/生態分類比例（10 Python/10 TS/10 Go/10 K8s-Helm/10 Ansible-Terraform），具體題目尚未列出，Phase 5 開始前需要先把清單生出來。
6. **Sandbox 後端啟用時機**（v0.5）：Shuru 的 `risk == high` 觸發條件需要更明確的操作型定義（哪些 task 算 high-risk），Phase 5 前需補；Linux 端 bwrap 為唯一預設，macOS 端 sandbox-exec 的 profile 需在 Phase 2 實際打磨。
7. **Evidence Shaping 的實際參數**（v0.4）：`evidence.max_tokens` 的數值需按 7B/9B 實測 context window 調整。
8. **Tauri Desktop UI 的啟用時機**（v0.5，§45）：UI 是哪個 Phase 的 deliverables？建議 Phase 2 完成後平行開發（有 sandbox + verification 可看），或等 Phase 5 benchmark 出數據後再做（UI 會長得比較「有內容」）。另需決定 CLI 與 Desktop UI 的關係——兩者並存，UI 只是另一種 frontend。

---

## 45. Tauri Desktop UI（Layer 7，opencode 風格終端介面）（v0.5 新增）

### 45.1 定位與原則

Layer 7 User Interface 在 v0.5 定義為 **Tauri v2 Desktop App**，視覺與交互模仿 **opencode 的終端 TUI 風格**（暗色、等寬字體、鍵盤優先、訊息串流輸出），但以原生桌面視窗呈現。

```text
┌─────────────────────────────────────────────────────────────────┐
│  Agent Control Plane — workspace: local-ai-controlpanel         │  ← top bar
├──────────────┬──────────────────────────────────────────────────┤
│  任務列表      │  TASK-042                                       │
│              │  ┌──────────────────────────────────────────┐   │
│  TASK-041     │  │ ◤ 讓這個 Kubernetes controller 支援新 API  │   │
│  TASK-042     │  │                                          │   │
│  TASK-043     │  │ Policy      → RESEARCH_REQUIRED           │   │
│              │  │ Research    → 8 evidence (conf 0.96)       │   │
│              │  │ Evidence    → PASS (gate)                  │   │
│              │  │ Pi+9B       → patch (3 files)              │   │
│              │  │ Verify      → go test ✓ PASS 3.2s          │   │
│              │  │              (sandbox: bwrap)              │   │
│              │  └──────────────────────────────────────────┘   │
├──────────────┴──────────────────────────────────────────────────┤
│  > 輸入任務或指令…        [ctrl+K: 命令面板]  [esc: 取消]       │  ← bottom input
└─────────────────────────────────────────────────────────────────┘
```

原則：

1. **UI 只是另一種 frontend**：所有能力仍由 Control Plane（Layer 6）提供，UI 一律透過 HTTP/SSE 存取，不直接碰 sandbox / secrets / worker。
2. **鍵盤優先**：重現 opencode 的鍵盤驅動操作（`ctrl+K` 命令面板、`esc` 中斷、`/` 指令前綴、方向鍵瀏覽歷史）。
3. **串流優先**：task 的每一層進度（policy → research → evidence → coding → verify）即時串流顯示，不是跑完才顯示。
4. **CLI 並存**：CLI（§29）與 Desktop UI 只是同一 Control Plane 的兩種介面，實作順序獨立。

### 45.2 技術選型

| 元件 | 選擇 | 理由 |
|---|---|---|
| Desktop Shell | **Tauri v2**（Rust + 系統 WebView） | 安裝包 ~10MB（Electron 100MB+）；最小權限模型（capabilities whitelist）；macOS 原生 |
| Frontend | **React + TypeScript** | 與 Control Plane（TS 生態）共享型別；Pi agent runtime 同生態 |
| Styling | **Tailwind CSS**（自訂暗色 terminal theme） | 快速達到 monospace × dark 的 terminal 視覺 |
| Streaming | **SSE（Server-Sent Events）** | Control Plane 已是 Fastify；SSE 比 WebSocket 簡單、自動重連 |
| Fonts | 等寬字體（JetBrains Mono / SF Mono 等） | opencode 風格核心元素 |
| Rust commands（薄層） | open window / copy text / open external link | 只有這三個；一律不碰 file/shell/secrets |
| 狀態管理 | React Context + `useSyncExternalStore`（或 zustand） | 輕量，不引入重型 state framework |

### 45.3 架構與安全邊界

```text
┌─────────────────── Tauri Desktop App ───────────────────┐
│  WebView（React UI）                                     │
│    │  fetch / SSE（僅 http://127.0.0.1:<port>）          │
│    ▼                                                     │
│  Rust 側：薄 commands（clipboard / window / open-link）  │
│    └── capabilities whitelist（tauri.conf.json）          │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTP + SSE
                    ▼
             Control Plane（Fastify）
             ├── /api/v1/tasks/*（REST）
             ├── /api/v1/tasks/:id/events（SSE 串流）
             └── 全部 policy / sandbox / secrets 都在這層
```

安全規則（與 §28 一致，Rule 4 延伸）：

- WebView **不得**直接存取 filesystem、shell、process、secrets——Tauri capability whitelist 只開 `http://127.0.0.1:*`、clipboard、window。
- UI 顯示的 sandbox 模式、escalation、cloud cost 全部來自 Control Plane 的 API 回傳，UI 沒有任何判斷權。
- API 只 bind 127.0.0.1（本機），不開放外部網路。

### 45.4 UI 佈局（opencode 風格）

| 區域 | 內容 | 交互 |
|---|---|---|
| **Top bar** | workspace 路徑、current worker/model、sandbox mode（bwrap/seatbelt/shuru badge） | 點擊複製路徑 |
| **左側欄** | Task 列表（id、狀態、attempt 數、updated_at），狀態彩色 badge | 點擊切換 task；`j/k` 上下移動 |
| **主區域（對話串流）** | Task 的完整 event stream：policy 決定、research/evidence、patch、verification 輸出（ANSI 上色）、reflection、escalation | 自動滾動、可摺疊每層、`enter` 重新送出 |
| **底部輸入** | 新 task 輸入或對目前 task 的指令（`/research`、`/verify`、`/escalate`、`/logs`） | `esc` 中斷目前執行；`ctrl+K` 命令面板 |
| **命令面板** | 搜尋指令：task run / status / evidence / verify / sandbox check / strategy / cloud usage | `ctrl+K` 開啟，`/` 或輸入過濾 |

視覺規範：背景 `#0d1117`（GitHub Dark 底）等級，前景 `#c9d1d9`，Accent `#58a6ff` 或 opencode 風格綠色 `#3fb950`；介面元素一律 `font-mono`。

### 45.5 API 契約（Control Plane 需提供的 endpoint）

| Method | Path | 用途 |
|---|---|---|
| POST | `/api/v1/tasks` | 建立 task（body: userRequest, workspace?, sandboxMode?） |
| GET | `/api/v1/tasks` | 列表（含 status/attempt/sandbox） |
| GET | `/api/v1/tasks/:id` | task 詳細（含 evidence summary, verification 摘要） |
| GET | `/api/v1/tasks/:id/events` | **SSE 串流**：task 的每一層事件（policy/research/evidence/patch/verify/reflection/escalation） |
| POST | `/api/v1/tasks/:id/cancel` | 中斷執行（對應 CLI `esc`） |
| POST | `/api/v1/tasks/:id/approve` | 人工審批（artifact / escalation / degraded override） |
| GET | `/api/v1/sandbox` | sandbox 後端狀態（`acp sandbox check` 的 API 形式） |
| GET | `/api/v1/strategy/:id` | Execution Strategy / Tier 決策（`acp strategy`） |
| GET | `/api/v1/cloud/usage` | cloud token/cost（`acp cloud usage`，Phase 10+） |

SSE event schema（對應 §32 Observability 欄位）：

```json
{ "type": "stage", "stage": "RESEARCHING", "attempt": 1, "ts": "..." }
{ "type": "evidence", "evidenceCount": 8, "confidence": 0.96, "ts": "..." }
{ "type": "verification", "verifier": "go test", "status": "FAIL",
  "sandbox": "bwrap", "durationMs": 3200, "output": "…(ANSI)…" }
{ "type": "reflection", "classification": "knowledge_error", "action": "research" }
{ "type": "done", "status": "COMPLETE", "ts": "..." }
```

### 45.6 實作路徑（UI Track，與 Core Track 平行）

```text
UI-1  Tauri scaffold（pnpm create tauri-app）、Rust 薄 commands、capabilities whitelist
UI-2  Terminal 視覺基底：dark theme、monospace、layout、ANSI 上色 renderer
UI-3  SSE client + Task 列表 + 對話串流主區域
UI-4  底部輸入 + 中斷（esc/cancel）+ 命令面板（ctrl+K）
UI-5  與 sandbox 整合顯示（badge + `acp sandbox check` 畫面）、approve 流程
UI-6  打包（.app/.dmg）＋ Control Plane 自動啟動/附著（spawn Fastify server）
```

> 建議起跑點：**Phase 2 完成後**（sandbox + verification 已可視覺化），達成門檻：`UI-1~UI-4` 在 Phase 5 benchmark 前可用；UI-5/UI-6 隨 Phase 8+ 推進。

---

*本文件整合 discuss-1 ~ discuss-11、purpose.md、results-keep.md、spec-v0_2.md、spec-v0.3.md、spec-v0.321.md、agent-control-plane-spec-v0.3.2.md、agent-control-plane-spec-v0.4.md 全部內容。舊檔可保留作歷史紀錄，後續開發與規格討論請以本文件為準。*
