---
github_issue:
title: Router HTTP Server
type: pending
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-04
---

# T009 - Router HTTP Server

## 目標
Implement `internal/router/server.go` per spec §7. The OpenAI-compatible reverse proxy listens on `http://127.0.0.1:<port>` (default 7352, configurable via `FREMODEL_PORT`). Implements all endpoints listed in §7.2.

## 驗收標準
- [x] HTTP server listening on `127.0.0.1:7352` (default, from `FREMODEL_PORT` env or `--port` flag)
- [x] `GET /v1/models` — list all routable models (grouped, with tags)
- [x] `POST /v1/chat/completions` — chat completion proxied to best backend
- [x] `GET /` — static web UI launcher (§7.2)
- [x] Config/mgmt API endpoints:
  - `GET /api/models` — full model list with live ping data
  - `GET /api/config` — current provider configuration
  - `GET /api/meta` — version, update availability
  - `GET /api/pinned` — currently pinned model
  - `POST /api/pinned` — set/clear pinned model
  - `GET/POST /api/auto-ping` — auto-ping status/toggle
  - `POST /api/config` — update provider config (key, enabled, etc.)
  - `POST /api/models/ban` — ban/unban a model
  - `POST /api/models/ping` — trigger immediate ping
  - `POST /api/providers/:key/refresh` — refresh provider's model list
  - `POST /api/providers/refresh-all` — refresh all providers
  - `POST /api/config/import` — import config from token
  - `GET /api/config/export` — export config as token
  - `GET /api/account-status` — multi-account rotation state
  - `GET/POST /api/autoupdate` — auto-update settings
  - `PUT /api/models/tags` — set user-defined tags
  - `GET/POST /api/filter-rules` — min score, excluded providers
  - `GET /api/logs` — recent request logs
- [x] Connection pooling: Go scheduler handles concurrent requests (§16.2)
- [x] Thread safety: RWMutex-protected model registry (§16.2, §16.3)

## 備註
- Server can run standalone via `freemodel start` (§10.1)
- Config reads are lock-free (atomic pointer swap on save) (§16.3)
