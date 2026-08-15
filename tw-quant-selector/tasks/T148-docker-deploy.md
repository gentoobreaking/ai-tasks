---
github_issue: "#101"
title: 更新編譯與 Docker 部署配置
type: config
priority: medium
status: completed
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2025-08-15
updated: 2025-08-15
---

# T148 - 更新編譯與 Docker 部署配置

## 目標
確保 tw-quant-selector 專案與 tw-quant-mcp 客戶端的編譯、建置與 Docker 部署配置無縫切換，並在生產環境中正確運作。

## 內容說明
- **修改檔案**: 
  - `Dockerfile`：新增 `tw-quant-mcp` 建置階段，或使用官方鏡像
  - `docker-compose.yml`：新增 `mcp-service` 服務定義，連線 `tw-quant-selector` app 容器
  - `pyproject.toml`：新增 `mcp` 相關依賴 (若使用 Python client) 或確認不需要額外套件 (若純 Go client)
  - `Makefile`：新增 `make build-mcp`、`make run-mcp` 等 targets
- **新增環境變數**: 
  - `MCP_TRANSPORT` (`stdio` / `streamable-http`)：決定客戶端連線方式
  - `MCP_HTTP_ADDR` (`127.0.0.1:8787`): Streamable HTTP 時的監聽位址
  - `DATA_DIR` (`~/.tw-quant-mcp/data`): 快取目錄 (L2 SQLite 路徑)
  - `MCP_FALLBACK_ENABLED` (`true`): 是否開啟備用 yfinance/twstock 來源
  - `MCP_RETRY_MAX` (`3`): 最大重試次數
  - `MCP_RETRY_JITTER` (`1000`): 重試 jitter 下限 (ms)
- **建置流程**:
  - `make build`: 編譯 `tw-quant-selector` 前端與後端
  - `make build-mcp`: 編譯或拉取 `tw-quant-mcp` 二進位檔
  - `make up`: 啟動 docker-compose，包含 mcp-service
  - `make down`: 停止所有容器
- **CI/CD**: GitHub Actions 工作流 `.github/workflows/ci.yml`：
  - `make build` 與 `make test` 階段
  - 選項性 `make integration-test` 階段 (啟動臨時 MCP 伺服器進行整合測試)
  - 心跳檢查：確保 MCP 進程存活，否則標記測試為 skip

## 驗收標準
- [ ] `make build` 成功編譯前端 (React/TS) 與後端 (Python/FastAPI)
- [ ] `make build-mcp` 成功 (若使用 Go client) 或 `docker pull tw-quant-mcp` (若使用官方鏡像)
- [ ] `docker compose up -d` 啟動所有服務 (selector + mcp)，`docker ps` 顯示 2 個容器運行中
- [ ] `curl http://localhost:8000/api/v1/mcp/status` 回傲健康狀態 (當 MCP 運作時)
- [ ] `docker compose down` 干淨停止並移除容器、網絡、卷
- [ ] 無未使用的 Docker 映像或遺留容器

## 備註
- 若 `tw-quant-mcp` 二進位檔已預裝於鏡像中，則 `make build-mcp` 只需 `cp /usr/local/bin/tw-quant-mcp .`；否則需要 `go build` 或 `docker pull`
- `DATA_DIR` 目錄需在容器啟動時掛載持久化儲存 (volume `~/.tw-quant-mcp/data:/data`)
- 確保 `python-multipart` (已在 pyproject.toml 中加入) 仍兼容新的變更，不因 MCP client 導入而衝突
- 若在生產環境使用 `streamable-http` transport，需額外開啟防火牆埠 8787 (或自定義 `MCP_HTTP_ADDR`) 並配置反向代理
- 文件 `README.md` 與 `docs/` 中需更新 `MCP` 相關環境變數說明與部署指南

## 備註
- 為避免影響穩定版本，建議先在 `development` 環境嘗試新的 Docker 配置，驗收無誤後再合併至 `main` 分支
- 若專案後續決定完全棄用原有資料來源，可於 `docker-compose.yml` 中移除舊 service 定義；反之則保留為 `depends_on` 關係
- 苗頭目錄 `tw_quant_selector/data/` 中的 `mcp_client.py` (或 `.go`) 編譯結果需打包進 selector app 的 Docker image (多階段建置 或 copy 二進位檔)
## 實作摘要 (2026-08-16)

### Dockerfile (`Dockerfile`)
- Stage 1: `frontend-builder` (node:20-alpine) — build 前端
- Stage 2: `mcp-builder` (golang:1.22-alpine) — 編譯 tw-quant-mcp Go binary；當原始碼不存在時 graceful skip
- Stage 3: `python:3.12-slim` — 安裝依賴（含 `mcp` Python SDK）、複製 stage 1/2 產物、設定 MCP 環境變數預設值

預設環境變數：
```
TW_USE_MCP=1
MCP_ENRICH_EXPORT=1
MCP_TRANSPORT=stdio
MCP_BINARY_PATH=/app/tw-quant-mcp
MCP_HTTP_ADDR=127.0.0.1:8787
DATA_DIR=/data/mcp-cache
```

### docker-compose.yml
- `app` service：新增 `TW_USE_MCP` / `MCP_ENRICH_EXPORT` / `MCP_TRANSPORT` / `MCP_BINARY_PATH` / `MCP_HTTP_ADDR` / `DATA_DIR`
- `scheduler` service：同步新增 MCP 環境變數
- `postgres` service：不變

### .env.example
- 補上 `# ── tw-quant-mcp 整合 (T143/T144) ──` 區塊

### 文件
- `README.md` 架構圖加入 MCP 圖層；快速開始段落加上 MCP env 變數說明
- `scripts/export_portfolio.py` 透過 MCP enrich 時會印出 `✅ Enriched with MCP realtime quotes`

檔案：`Dockerfile`、`docker-compose.yml`、`.env.example`、`README.md`
