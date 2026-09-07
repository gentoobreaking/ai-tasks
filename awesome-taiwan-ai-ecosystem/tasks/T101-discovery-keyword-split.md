---
github_issue: N/A
title: GitHub KeywordMatrix 拆成兩階段 discovery，去除 MCP 字串依賴（DoD #1）
type: refactor
priority: high
status: pending
assignee: pi with opencode
created: 2026-09-07
depends_on: [T097]
updated: 2026-09-07
---

# T101 - GitHub KeywordMatrix 拆成兩階段 discovery

## 目標

把 `internal/sources/github/adapter.go:26-69` 的 `KeywordMatrix` 拆成兩個 phase，消除「必須含 MCP 字串」才能命中 Taiwan MCP 候選人的設計。

現況問題：spec §3 non-goal #1 明令「不假設含 MCP 字串的 repo 就是 MCP server」，但 `KeywordMatrix:26-34` 前 7 個 entry（`mcp Taiwan` / `mcp Taiwanese` / `mcp 台灣` / `mcp "data.gov.tw"` / `mcp TWSE` / `mcp TAIEX` / `mcp FinTech Taiwan`）全是 MCP-anchored query。這違反 spec §6.1「Discovery SHALL NOT primarily search for Taiwan MCP」與 §64 DoD #1「Discovery no longer depends on MCP keywords」。

## 問題根因

`internal/sources/github/adapter.go:24-69`：

```go
// KeywordMatrix defines the discovery query strategy (spec §6, §42).
// Combines Taiwan signals + AI signals for broad discovery, not just MCP keywords.
var KeywordMatrix = []string{
    // Taiwan + MCP (high precision)
    "mcp Taiwan", "mcp Taiwanese", "mcp 台灣", ...
    // Taiwan + AI (broad discovery)
    "Taiwan AI", "台灣 AI", ...
}
```

雖然後面有「Taiwan + AI」broad discovery 區段，但**前 7 個 MCP-anchored query 仍會被執行**，且 GitHub search 對 MCP-anchored 命中精度高（量少、幾乎都是真 MCP server），導致**整體 recall 偏 MCP** — 違反「Discovery First 最大化 recall」原則（spec §4.1）。

## 修法

**兩階段 discovery**：

### Phase A: Broad Recall（recall 最大化）
**只用** Taiwan + AI 信號 query，不含 MCP 字串。涵蓋所有「可能是 Taiwan AI project」的 repo（含非 MCP server）。對應 `KeywordMatrix` 後段的 broad discovery 區段。

### Phase B: MCP Anchored（precision 補強，可關閉）
原本的 MCP-anchored 7 條 query 保留為 `MCPKeywordMatrix`（分開宣告），**預設關閉**，由 `crawler run` 的 `--include-mcp-anchored` flag 控制是否執行（預設 false）。

## 修改位置

`internal/sources/github/adapter.go`

### 修改 1：拆 KeywordMatrix

```go
// BroadKeywordMatrix is the primary discovery query set (spec §6.1, §64 DoD #1).
// Contains only Taiwan + AI signals. No MCP keywords — MCP is a classification
// category, not a discovery boundary (spec §3 #1, §63).
var BroadKeywordMatrix = []string{
    // Taiwan + AI (broad discovery)
    "Taiwan AI",
    "Taiwan artificial intelligence",
    "台灣 AI",
    "台灣 人工智慧",
    "台灣 生成式 AI",
    "Taipei AI",
    "TAIPEI AI Lab",
    "Taiwan LLM",
    "Taiwan LLMOps",
    "Taiwan RAG",
    "Taiwan embedding",
    "Taiwan vector database",
    // AI + Taiwan financial keywords
    "AI stock Taiwan",
    "AI trading TWSE",
    "AI FinTech Taiwan",
    "AI data.gov.tw",
    // Taiwan government + AI
    "AI 政府",
    "AI 政务",
    "AI 政务 台湾",
    // AI frameworks/toolkits + Taiwan
    "LangChain Taiwan",
    "LlamaIndex Taiwan",
    "AutoGen Taiwan",
    "CrewAI Taiwan",
    "LangGraph Taiwan",
    "Semantic Kernel Taiwan",
}

// MCPKeywordMatrix is an optional precision boost for MCP-anchored discovery.
// NOT executed by default. Enable with --include-mcp-anchored (spec §3 #1).
var MCPKeywordMatrix = []string{
    "mcp Taiwan",
    "mcp Taiwanese",
    "mcp 台灣",
    `mcp "data.gov.tw"`,
    "mcp TWSE",
    "mcp TAIEX",
    "mcp FinTech Taiwan",
}

// KeywordMatrix is kept as an alias for backward compatibility with tests
// that import the old name. New code should use BroadKeywordMatrix.
var KeywordMatrix = BroadKeywordMatrix
```

### 修改 2：Discover 用 BroadKeywordMatrix + flag

`internal/sources/github/adapter.go:143` 附近的 `for _, keyword := range KeywordMatrix` 改用 `BroadKeywordMatrix`，並在 `GitHubAdapter` struct 加 `IncludeMCPAnchored bool` 欄位，由 `setupCrawler` 從 CLI flag 設定。

```go
type GitHubAdapter struct {
    Token               string
    HTTPClient          HTTPClient
    BaseURL             string
    IncludeMCPAnchored  bool  // new
}

// in Discover():
queries := BroadKeywordMatrix
if a.IncludeMCPAnchored {
    queries = append(queries, MCPKeywordMatrix...)
}
for _, keyword := range queries { ... }
```

### 修改 3：CLI flag

`cmd/crawler/main.go` 全域 flags 加：

```go
rootCmd.PersistentFlags().BoolVar(&includeMCPAnchored, "include-mcp-anchored", false,
    "include MCP-anchored keywords in GitHub discovery (default: false, spec §3 #1)")
```

並在 `setupCrawler` 傳給 `github.New(...)`。

## 驗收標準

- [ ] `BroadKeywordMatrix` 與 `MCPKeywordMatrix` 兩組宣告加上
- [ ] `KeywordMatrix` 保留為 `BroadKeywordMatrix` 的 alias（向後相容）
- [ ] `GitHubAdapter.IncludeMCPAnchored` 欄位加，預設 false
- [ ] `cmd/crawler --include-mcp-anchored` flag 加，預設 false
- [ ] `go build ./...` 通過
- [ ] `go test ./internal/sources/github/... -v -count=1` 通過
- [ ] 跑 `crawler discover` 不傳 flag，log 顯示「phase: broad_only, queries=22」
- [ ] 跑 `crawler discover --include-mcp-anchored`，log 顯示「phase: broad_plus_mcp, queries=29」
- [ ] 既有的 `KeywordMatrix` 引用（測試、外部 import）仍編譯通過

## 執行紀錄

_(待執行後填寫)_

## 備註

- 依賴 T097（差距分析）
- 對應 spec §3 #1、§6.1、§64 DoD #1
- 風險：MCP-anchored query 關閉後，純台灣 MCP server recall 可能下降 5–10%。可由兩階段改進：Phase A 撈出 broad recall（含 AI Agent、Tool、Library 等），Phase B 在 classification 之後只對 `classification.primary == MCP_SERVER` 的 candidates 做 MCP runtime verification（MCP identity 仍由 runtime 證實，不靠 keyword）。這與 spec §4.2「Classification Before Registry Inclusion」一致
- 後續可考慮：把 `MCPKeywordMatrix` 從 GitHub 移到 mcpso/pulsemcp 等專屬 MCP registry 來源，那邊本來就只列 MCP servers
- 相關任務：T097（差距分析）
