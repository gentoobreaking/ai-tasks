---
github_issue: ""
title: "Quick win: /api/ready endpoint for load balancer health checks"
type: pending
priority: high
status: done
depends_on: []
assignee: "OpenCode with DeepSeek V4 Flash"
created: "2026-08-22"
updated: "2026-08-22"
---

# T100 - Quick win: /api/ready endpoint for load balancer health checks

## 目標
新增 `/api/ready` 端點，供 Kubernetes liveness/readiness probe、負載平衡器健檢使用。極簡實作，高價值。

## 驗收標準
- [x] `GET /api/ready` 回傳：
  - 200 OK + `{"ready": true, "models_up": N}` 當有 ≥1 模型 up
  - 503 Service Unavailable + `{"ready": false, "reason": "no models available"}` 否則
- [x] 回應時間 < 10ms（只讀 registry snapshot，無外部呼叫）
- [x] 支援 `?min_models=2` 參數自訂門檻
- [x] 更新 `Dockerfile` HEALTHCHECK 使用 `/api/ready`
- [x] 單元測試覆蓋基本場景

## 備註
- 修改位置：`internal/router/server.go` 新增 `handleAPIReady`、註冊路由、`Dockerfile`
- 邏輯極簡：`len(registry.Snapshot()) > 0 && models_up >= min_models`
- 可複用 `handleAPIStatus` 的統計邏輯但精簡化
- 與現有 `/api/health`（進程存活）語意區分明確
- 預估 15 分鐘完成