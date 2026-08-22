---
github_issue: ""
title: "Router readiness endpoint: /api/ready for load balancer health checks"
type: done
priority: high
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: "2026-08-22"
updated: "2026-08-22"
---

# T089 - Router readiness endpoint: /api/ready for load balancer health checks

## 目標
新增 `/api/ready` 端點，供 Kubernetes liveness/readiness probe、負載平衡器健檢使用。僅當至少有一個模型狀態為 "up" 時回傳 200，否則 503。

## 驗收標準
- [x] `GET /api/ready` 回傳：
  - 200 OK + `{"ready": true, "models_up": N, "total_models": M}` 當有 ≥1 模型 up
  - 503 Service Unavailable + `{"ready": false, "reason": "no models available"}` 否則
- [x] 回應時間 < 10ms（無外部呼叫，只讀 registry 快照）
- [x] 支援查詢參數 `?min_models=2` 指定最少就緒模型數
- [x] 包含於 `/api/meta` 回應中（`readyEndpoint: "/api/ready"`）
- [x] 單元測試覆蓋：無模型、全 down、部分 up、min_models 門檻

## 備註
- 修改位置：`internal/router/server.go` 新增 `handleAPIReady`、註冊路由
- 邏輯可複用 `handleAPIStatus` 的統計計算，但需輕量化（無需計算 latency/uptime）
- 注意：`/api/health` 現有回傳 uptime，語意不同（health = 進程存活；ready = 可服務流量）
- 建議同時更新 Dockerfile 的 HEALTHCHECK 使用 `/api/ready`
