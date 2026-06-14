---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/685
title: Docker Multi-stage Build（前端 + API 合一）
type: feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. 將 Dockerfile 改為 multi-stage build：
     Stage 1 (node:20-alpine): npm ci + npm run build → frontend/dist/
     Stage 2 (python:3.12-slim): pip install -e . + COPY frontend dist
  2. 在 app.py 新增 SPA fallback：偵測 frontend/dist 目錄存在時，
     掛載 /assets 靜態檔，並以 catch-all route 回傳 index.html
  3. 更新 docker-compose.yml 移除 healthcheck 中對 curl 的依賴
  4. 放寬 CORS allow_origins 為 ["*"] 以支援 container 情境
---

# T032 - Docker Multi-stage Build（前端 + API 合一）

## 目標
將前端 React SPA 整合進 Docker image，讓單一 container 同時提供 API 與前端，簡化部署。

## 驗收標準
- [x] Dockerfile 使用 multi-stage build，第一階段編譯前端，第二階段運行 API
- [x] `frontend/dist/` 產物複製到 Python image 中
- [x] 當 `frontend/dist` 存在時，`/` 路由自動回傳 SPA 的 index.html
- [x] `/assets/*` 靜態檔由 FastAPI StaticFiles 提供
- [x] 非 API 路徑（如 `/signals`、`/portfolio`）由 catch-all route 回傳 index.html（SPA client-side routing）
- [x] API 路徑 (`/api/*`、`/health`) 不受 catch-all 影響
- [x] docker-compose.yml 簡潔無多餘依賴
- [x] 所有 27 項後端測試通過

## 備註
- CORS 放寬為 `["*"]` 因為 production 情境無跨域問題
- SPA fallback 僅在 `frontend/dist` 目錄存在時啟用；開發模式仍用 Vite dev server + CORS
