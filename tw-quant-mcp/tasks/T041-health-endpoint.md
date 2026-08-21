---
github_issue: N/A
title: 實作 /health 健康檢查端點
type: feature
priority: medium
status: done
depends_on: []
assignee: OpenCode
created: 2026-08-22
updated: 2026-08-22
---

# T041 - 實作 /health 健康檢查端點

## 目標
streamable-http 傳輸模式下新增 `GET /health` 端點，回傳 `{"status": "healthy"}`（HTTP 200），供容器 healthcheck、負載平衡與監控探測使用，不經 MCP 協定層。

## 背景
docker-compose 部署之 healthcheck 原以複雜的 JSON-RPC initialize 探測（POST + Accept headers）實作，且 SDK 對 MCP 端點之 GET 回 "Method Not Allowed"，不利標準化監控整合。

## 改動內容

### 1. cmd/mcp-server/main.go
- 抽出 `newHTTPHandler(srv)`：以 `http.ServeMux` 路由
  - `GET /health` → HTTP 200、Content-Type application/json、body `{"status":"healthy"}`
  - 其餘路徑 → MCP Streamable Handler（JSON-RPC 2.0，行為完全不變）

### 2. cmd/mcp-server/main_test.go
- 新增 `TestHealthEndpoint`：
  - 斷言狀態碼 200、Content-Type 前綴 application/json、body JSON 解析後 status=healthy
  - 驗證 MCP 路徑不受影響：帶規範要求之 `Accept: application/json, text/event-stream` POST initialize 應 200

### 3. docker-compose.yml
- healthcheck 由 JSON-RPC initialize 探測簡化為 `curl -f http://localhost:8000/health`

### 4. README.md
- 「安裝 → 執行」新增「健康檢查（streamable-http）」段落：curl 範例、MCP 路徑與 Accept header 規範提示、docker-compose healthcheck 說明

## 驗收標準
- [x] `GET /health` 回 HTTP 200 與 `{"status":"healthy"}`（Content-Type: application/json）
- [x] MCP JSON-RPC 路徑行為不變（initialize 正常回應）
- [x] 單元測試 TestHealthEndpoint 通過
- [x] docker-compose 實機驗證：容器 healthy、curl /health 回 200
- [x] README.md 文件更新

## 驗收證據（2026-08-22）
- `go test ./cmd/mcp-server/ -run TestHealthEndpoint -v` → PASS
- docker-compose up --build 後 `docker-compose ps` → Up (healthy)；
  `curl http://localhost:8000/health` → `HTTP 200 {"status":"healthy"}`

## 備註
- MCP SDK 依規範要求客戶端請求帶 `Accept: application/json, text/event-stream`，
  缺少時回 400「Accept must contain both 'application/json' and 'text/event-stream'」
  （測試中已記錄此行為，供對接方參考）。
- stdio 傳輸模式無 HTTP 層，本端點不適用。
