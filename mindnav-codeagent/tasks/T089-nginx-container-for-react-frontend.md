---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/598
title: Caddy container for React frontend (auto HTTPS)
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-18
updated: 2026-05-18
howto: null
---

# T089 - Caddy container for React frontend

## 目標
為 `frontend-react/` 新增 Caddy container，自動處理 HTTPS（Let's Encrypt）並 proxy `/api` 到後端。

## 驗收標準
- [x] 建立 `docker/Dockerfile.frontend`（multi-stage：node build → Caddy serve）
- [x] 建立 `docker/Caddyfile`（自動 HTTPS + SPA fallback + API proxy）
- [x] `docker-compose.yml` 新增 `frontend-react` service（port 8080:80 + 443:443）
- [x] `docker-compose.yml` 新增 `caddy_data` volume 持久化憑證
- [x] `scripts/build.sh` 的 SERVICES + case 新增 `frontend-react`
- [x] `scripts/start_all.sh` 的 echo 新增 `frontend-react`
- [x] 執行 `docker compose build frontend-react` 成功
- [x] 移除 `docker/nginx-frontend.conf`（已淘汰）

## Caddyfile 設計
```caddy
{$DOMAIN:localhost} {
    tls {$EMAIL:}internal
    handle_path /api* { reverse_proxy {$API_UPSTREAM:frontend_api:18080} }
    handle { file_server; try_files {path} /index.html }
}
```

## 環境變數
| 變數 | 預設值 | 說明 |
|------|--------|------|
| `DOMAIN` | `localhost` | 網域名稱（正式部署時設定） |
| `EMAIL` | 無 | Let's Encrypt 通知信箱 |
| `API_UPSTREAM` | `frontend_api:18080` | 後端 API 位址 |

## 備註
- `DOMAIN` 未設定 → `tls internal` 自簽憑證（開發用）
- `DOMAIN` + `EMAIL` 有設定 → Caddy 自動申請 Let's Encrypt 憑證
- 開發階段仍使用 `npm run dev`（Vite dev server），不依賴 Caddy
