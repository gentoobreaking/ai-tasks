---
github_issue: N/A
title: 專案初始化與目錄骨架
type: infrastructure
priority: high
status: done
assignee: pi with opencode/x-preview-f-free
created: 2026-07-31
updated: 2026-07-31
depends_on: []
---

# T001 - 專案初始化與目錄骨架

## 目標
建立 `tw-quant-mcp` Go 專案骨架，遵循規格書 §7 模組化目錄結構，安裝核心依賴，提供可啟動的最小 MCP Server（空 Tool 清單）。

## 驗收標準
- [x] `go.mod` 建立（module 名 `tw-quant-mcp`），依賴：`modelcontextprotocol/go-sdk`、`dgraph-io/ristretto`、`golang.org/x/time/rate`、`golang.org/x/sync/singleflight`、SQLite driver（`modernc.org/sqlite` 或等效 CGO-free driver）
- [x] 目錄結構與 §7 一致：`cmd/mcp-server/`、`pkg/{mcp,model,provider,engine,cache,chart,calendar}/`
- [x] `cmd/mcp-server/main.go` 可啟動 Stdio MCP Server，`tools/list` 回傳空清單不報錯
- [x] 環境變數設定檔（如 `pkg/config`）：`MCP_TRANSPORT`、`DATA_DIR`（L2 SQLite 位置）、`LOG_LEVEL`
- [x] `Makefile` 提供 `make build` / `make test` / `make lint`；`.gitignore` 排除 binary 與 `DATA_DIR`
- [x] `go build ./...` 與 `go vet ./...` 通過

## 實作記錄（2026-07-31）

### 產出
| 項目 | 說明 |
|---|---|
| 專案根目錄 | `~/Projects/tw-quant-mcp`（go 1.26.1，已 `git init`，尚未 commit） |
| 入口 | `cmd/mcp-server/main.go`：依 `MCP_TRANSPORT` 支援 `stdio`（預設）與 `streamable-http` 兩種傳輸；log 一律輸出 stderr 不污染協定 |
| 設定 | `pkg/config`：`MCP_TRANSPORT` / `MCP_HTTP_ADDR`（HTTP 位址，預設 127.0.0.1:8787）/ `DATA_DIR`（預設 `~/.tw-quant-mcp/data`，啟動時自動建目錄、支援 `$ENV` 與 `~` 展開）/ `LOG_LEVEL`（debug/info/warn/error） |
| 目錄 | `cmd/mcp-server/`、`pkg/{mcp,model,provider,engine,cache,chart,calendar,config}/`（§7 結構 + config） |
| Makefile | `build`（含 `-ldflags -X main.version`）/ `test` / `vet` / `lint`（vet + gofmt）/ `run` / `clean` |
| .gitignore | 排除 `bin/`、`data/`、`*.db*`、`.env` 等 |

### 驗證結果（全數通過）
1. `go build ./...`、`go vet ./...`、`go test ./...`、`make lint` — OK
2. 單元測試：`cmd/mcp-server`（in-memory 傳輸驗證 `tools/list` 空清單、Ping）、`pkg/config`（預設值/覆寫/非法值）
3. Stdio 實測：initialize → 回 serverInfo（tw-quant-mcp 0.1.0）；`tools/list` → `{"tools":[]}` 不報錯；用戶端斷線（EOF）正常結束 EXIT=0
4. Streamable HTTP 實測：POST `/mcp` 回 `tools/list` 空清單

### 依賴版本與已知事項
- 直接依賴：`modelcontextprotocol/go-sdk v1.7.0`（官方 SDK，2026-07-28 協定）
- 已安裝但尚未被引用（T001 範圍內不接 Provider，go.mod 暫標記 `indirect`，T003/T004 引用後自動提升為 direct）：`dgraph-io/ristretto v0.2.0`、`golang.org/x/time v0.15.0`、`golang.org/x/sync v0.22.0`、`modernc.org/sqlite v1.55.0`（CGO-free）
- go-sdk v1.7.0 之 `NewStreamableHTTPHandler` 簽名為 `func(*http.Request) *mcp.Server`（無 error 回傳）
- SDK 對 stdio 斷線以 unexported 錯誤 `"server is closing: EOF"` 表達，`main.go` 以 `isExpectedStdioExit` 判別並視為正常結束

### 後續任務銜接
- T002：`pkg/model` 依 §3.2/§3.3/§5.2/§5.3 建 Lineage/Envelope/Symbol/Candle
- T003：`pkg/provider` Rate Limiter 引用 `x/time/rate`；T004：`pkg/cache` 引用 ristretto/sqlite

## 備註
- 專案程式碼根目錄為 `~/Projects/tw-quant-mcp`（規格書與任務檔存放於 `~/tasks/tw-quant-mcp`）
- 依賴與規格書 §6 架構圖一致；SQLite 需 CGO-free（純 Go driver）以利單一執行檔發布
- 先不接任何 Provider，資料來源在 T006 之後逐步接入

## 執行紀錄（2026-08-25 稽核）
- 驗收條目全數已有勾選；本次稽核以全域門檻複核：`go vet ./...` 通過、`go test ./...` 16 套件全綠（含契約測試/Envelope 一致性/快取一致性/壓力腳本存在性）。
- 本任務產出之模組為現行 155 註冊工具之作用中路徑（非死代碼），接線由 `cmd/mcp-server` 入口經 `App` 組裝達成；真實程序煙霧測試見 snapshots/raw/。
