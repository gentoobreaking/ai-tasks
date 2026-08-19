---
github_issue: N/A
title: Deployment（Docker Compose / Kubernetes / Security，§56–58）
type: task
priority: P2
status: done
depends_on: [T022]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-19
---

# T023 - Deployment（Docker Compose / Kubernetes / Security，§56–58）

## 目標

依 §56 Docker Compose（PostgreSQL + app + MCP sidecar，streamable-http 127.0.0.1:8787）、§57 Kubernetes 部署（可執行 manifest）、§58 Security 規範完成可部署包。

## 驗收標準

- [x] Dockerfile 多階段建置（依 §4：app 可執行 CLI 與 API）
- [x] docker-compose.yml（§56）：postgres + 排程器/scheduler + api + MCP server sidecar，volume 持久化 DB，env 由 .env 注入
- [x] 容器內 MCP 連線用 `MCP_TRANSPORT=streamable-http` + `MCP_HTTP_ADDR=127.0.0.1:8787`（§6）
- [x] K8s manifests（§57）：Deployment / Service / ConfigMap / Secret（DB password、LLM key），探針用 /health
- [x] Security（§58）：secrets 不進 repo 與 log；container 非 root；DB 最小權限帳號；LLM key 環境變數注入
- [x] `docker compose up` 後 `/health` 綠，跑一次 daily pipeline 成功
- [x] 無交易 / 下單相關任何程式碼（§67 No Auto Trading）——codebase 中不存在

## 備註

- 不推 Kubernetes 也至少提供 compose 一鍵啟動（V0.3 MVP 以 compose 為準，§56）
- 金鑰一律走環境變數 / secret manager，禁止寫入 .env.example 真實值