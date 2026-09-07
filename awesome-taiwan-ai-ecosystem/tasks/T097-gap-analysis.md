---
github_issue: N/A
title: Crawler↔Spec 差距分析與補完清單（§64 DoD 阻塞項）
type: refactor
priority: high
status: pending
assignee: pi with opencode
created: 2026-09-07
depends_on: []
updated: 2026-09-07
---

# T097 - Crawler↔Spec 差距分析與補完清單

## 目標

依 `TAIWAN_AI_ECOSYSTEM_REGISTRY_SPEC.md`（v1.0，65 sections、12 phases）對現有 crawler 程式碼做差距盤點，輸出「讓 crawler 真正能跑出 spec §60 結構的 list」所需的最小修補清單。

**本任務只做盤點，不動 code。** 後續 T098+ 依此清單拆出可執行的子任務。

## 背景

- Spec：`~/tasks/awesome-taiwan-ai-ecosystem/TAIWAN_AI_ECOSYSTEM_REGISTRY_SPEC.md`
- Code：`~/Projects/awesome-taiwan-ai-ecosystem/`
- 任務書目錄：`~/tasks/awesome-taiwan-ai-ecosystem/tasks/`
- 96 個 T001–T096 任務書**全部標 `status: done`**，但**「任務勾選完成」≠「程式碼接到 coordinator 主流程」**——這是本任務發現的最大落差。

## 現況快照（2026-09-07）

| 項目 | 現況 |
|---|---|
| `go build ./...` | 通過 |
| DB schema v2 | 已套用 |
| `data/registry.db` | 存在但 `db_count: 0`（entity 為空） |
| `registry/REGISTRY.md` | 仍是 9/5 legacy 產出（561 servers / 200 Taiwan relevant / 503 Quality F） |
| spec §60 結構檔（`taiwan-ai-ecosystem.md` / `taiwan-mcp.md` / `taiwan-ai-agents.md` / `taiwan-ai-tools.md` / `taiwan-ai-data.md`） | **完全未產出** |
| Acceptance tests / FP rate tests | 程式碼已實作（`internal/engines/acceptance_test.go` 14 測試 + `fp_rate_test.go`） |

## 缺口清單（依優先順序）

### 🔴 P0 — 阻塞「跑出 list」

| ID | 缺口 | 位置 | 預期影響 |
|---|---|---|---|
| **P0-1** | `coordinator.Run()` 主流程**從頭到尾沒把 entity 寫進 DB**。`entityStore.Save` 只在 `runRuntimeVerificationOnly` 內被呼叫（`coordinator.go:474`），只有 `--pipeline verify-only` 才會跑到。 | `internal/coordinator/coordinator.go:128-198` | DB 永遠空，view generator 沒資料可產 |
| **P0-2** | `runExport` 從 `store.GetServers()` 讀 legacy MCPServer，不是 `EntityStore`。 | `cmd/crawler/main.go:444-458` | 新 view generator 收不到資料；`registry/` 下的檔案是 9/5 legacy pipeline 留下的舊資料 |
| **P0-3** | `registry` adapter 預設打 `api.mcp-servers.dev` 不存在，log 噴 DNS 錯（雖不 crash，但永遠 0 candidate）。 | `internal/sources/registry/adapter.go:71` | 該 source 永久靜默失敗 |

### 🟡 P1 — 影響 spec §64 DoD（Definition of Done）

| ID | 缺口 | 位置 | 對應 DoD |
|---|---|---|---|
| **P1-1** | `runtime_verifier.go:512,526` **SSE / streamable_http transport 顯式回 `transport_not_implemented`** → MCP server 永遠停在 `MCP_STATIC_VERIFIED`，不會進 `MCP_RUNTIME_VERIFIED` view | `internal/engines/runtime_verifier.go` | DoD #14「Runtime MCP handshake is supported」 |
| **P1-2** | `models/entity.go:71-80` 缺 `MCP_VERIFIED` 第 5 個 enum | `internal/models/entity.go` | DoD #15「MCP verification state is explicitly stored」 |
| **P1-3** | `mcpmarket` adapter 永久 `ErrNotAvailable`（Vercel WAF），污染整體 source 健康度 | `internal/sources/mcpmarket/adapter.go:41` | DoD #1「Discovery no longer depends on MCP keywords」 |

### 🟢 P2 — Schema 對齊（spec §37）

| ID | 缺口 | 位置 | 對應欄位 |
|---|---|---|---|
| **P2-1** | `SourceReference` 缺 `Primary` 布林 | `internal/models/entity.go:497-504` | `source.primary` |
| **P2-2** | `MCPIdentity` 缺顯式 `Related` 布林 | `internal/models/entity.go:337-345` | `mcp.related` |
| **P2-3** | GitHub `KeywordMatrix` 內含 `mcp Taiwan` / `mcp 台灣` 等字串 → 違反 spec §3 non-goal #1 | `internal/sources/github/adapter.go:26-58` | DoD #1 |
| **P2-4** | `schema/registry.json` 仍是 v0.1 legacy wrapper | `schema/registry.json:11` | §37 |

### ⚪ P3 — 輸出路徑

| ID | 缺口 | 位置 |
|---|---|---|
| **P3-1** | view generator 寫到 `registry/views/`，但 spec §60 要求 `registry/taiwan-ai-ecosystem.md` 等檔案在 `registry/` 根目錄 | `internal/export/view_generator.go:243,249` |

## 最短可跑出 list 的路徑（4 處改動）

1. **P0-1**：`coordinator.Run` 結尾加 `entityStore.Save(ctx, e)`（或在 stage 9 結束前一次性批次 Save）
2. **P0-2**：`runExport` 改用 `entityStore.List`
3. **P1-1**：`runtime_verifier` 補 SSE / streamable_http handshake（不然 MCP_SERVER 永遠 `STATIC_VERIFIED`）
4. **P3-1**：view generator 改寫到 `registry/` 根目錄

完成這 4 項就能跑出 spec §60 結構的 list（即使裡面是 0 entity，至少 pipeline 端到端通了）。

## 對應 spec 區段速查

| Spec 區段 | 對應任務 | 狀態 |
|---|---|---|
| §1–§4 設計原則 | – | 已落地 |
| §5 來源 | T006, T090 | mcpmarket 異常 |
| §6 查詢策略 | T089 | GitHub KeywordMatrix 含 MCP 字串 |
| §9 Taiwan relevance | T068, T069 | code 完成，coordinator 未串接 |
| §10 AI relevance | T070, T071 | 同上 |
| §11–§23 Taxonomy | T072, T073 | 24 規則、27 enum 已實作 |
| §24–§26 Endpoint | T076, T077, T078 | runtime_verifier SSE/streamable 缺 |
| §27–§30 MCP identity | T074, T075 | code 完成，coordinator 未串接 |
| §32–§33 State machine | T065, T067, T079 | 缺 `MCP_VERIFIED` enum |
| §34–§35 Security | T060, T080, T081 | code 完成，coordinator 未串接 |
| §36 Quality | T082 | 同上 |
| §43 Pipeline | T089, T091, T093 | coordinator 結構有，**存 DB 缺** |
| §44 Views | T083 | 10 views 已實作，**輸出為空** |
| §51–§53 Migration / Backward compat | T084, T085, T086 | CLI 就緒 |
| §56–§58 Tests / KPI | T087, T088 | 程式碼就緒 |
| §60 預期輸出 | T083 | **未產出** §60 結構檔 |
| §64 DoD | – | **12/20 缺**（見下方） |

## §64 Definition of Done 對照

| DoD 項 | 狀態 |
|---|---|
| [ ] Discovery no longer depends on MCP keywords | ❌ P2-3 |
| [ ] Taiwan relevance is independent from MCP identity | ✅ |
| [ ] AI relevance is independent from MCP identity | ✅ |
| [ ] Every candidate receives a primary classification | ⚠️ code 寫了但 DB 沒存 |
| [x] MCP Server is a specific verified classification | ✅ |
| [x] MCP client and MCP host are separated from MCP server | ✅ |
| [x] SDK/library projects are separated from servers | ✅ |
| [x] Skills are separated from servers | ✅ |
| [x] Tutorials/examples are separated from servers | ✅ |
| [x] Collections/registries are separated from servers | ✅ |
| [x] Data libraries are separated from servers | ✅ |
| [x] Repository URLs cannot become MCP runtime endpoints | ✅ |
| [x] Documentation URLs cannot become MCP runtime endpoints | ✅ |
| [x] Installer URLs cannot become MCP runtime endpoints | ✅ |
| [ ] Runtime MCP handshake is supported | ❌ P1-1 |
| [ ] MCP verification state is explicitly stored | ❌ P1-2 |
| [x] Security status is independent from classification | ✅ |
| [x] Quality score is independent from classification | ✅ |
| [ ] Existing records can be migrated | ⚠️ CLI 有但未實測 |
| [ ] False-positive acceptance tests pass | ⚠️ 程式碼有但未實測 |
| [ ] MCP false-positive rate is below 5% | ⚠️ 待實測 |
| [ ] MCP Server registry is generated as a filtered view of the Taiwan AI Ecosystem registry | ❌ P0-1 + P0-2 + P3-1 |

## 驗收標準

- [x] 現有 crawler 與 spec 各區段對照表完成
- [x] 12 phases 進度盤點完成
- [x] 程式碼結構盤點完成（22 packages / 4 binaries / 6 yaml / 4 SQL / 2 JSON schema）
- [x] Entity model 與 spec §37 欄位對照完成
- [x] crawler pipeline 瓶頸分析完成
- [x] 缺口清單依優先順序排出（P0/P1/P2/P3）
- [x] §64 DoD 對照（12/20 缺）完成
- [x] 最短可跑出 list 路徑（4 處改動）已標出

## 執行紀錄

- 2026-09-07：依 spec §62 12 phases 與 code 實況交叉比對，產出本盤點
- 使用 explore subagent 跑多輪 `rg` / `find` / `git log` 蒐集證據
- 所有結論附 `檔名:行號` 引用

## 備註

- 96 個 T001–T096 任務書雖然全 `status: done`，但**沒有串到 coordinator 主流程**——這是 spec §43 pipeline 缺 entity 的根本原因
- 後續任務（T098+）建議依本清單 P0 → P1 → P2 → P3 順序拆解
- 跨 repo 參考：`~/Projects/awesome-taiwan-ai-ecosystem/`
