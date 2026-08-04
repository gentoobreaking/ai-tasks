---
github_issue:
title: Add /api/health and /api/status summarization endpoints
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T078 - Add /api/health and /api/status summarization endpoints

## 目標
新增 `/api/health` 和 `/api/status` 端點，讓外部監控系統和腳本能查詢 router 健康狀態與模型摘要，而不需解析 TUI 畫面或 `/v1/models`。

## 背景
目前 router server（`127.0.0.1:7352`）的 API 端點有：
- `POST /v1/chat/completions` — 主要 proxy
- `GET /v1/models` — OpenAI-compatible 模型清單
- `GET /api/meta` — 版本與更新資訊
- `POST /api/config` / `GET /api/config` — 設定讀寫

但缺少最關鍵的兩個端點：
1. **Health check** — 監控系統（Docker healthcheck、K8s liveness probe、UptimeRobot）無法簡單判斷 router 是否正常
2. **Status summary** — 使用者無法快速了解「有多少模型 up、最佳延遲是多少、哪個 provider 最好」

## 驗收標準
- [x] `GET /api/health` — 回傳 `{"status":"ok","uptime_seconds":123}`（HTTP 200）
- [x] `GET /api/status` — 回傳模型摘要：
  ```json
  {
    "total_models": 142,
    "models_up": 45,
    "models_down": 12,
    "models_pending": 85,
    "best_model": {"id":"...","provider":"...","avg_latency_ms":234},
    "providers": {"nvidia": {"up":3,"total":5},"groq":{"up":2,"total":3}},
    "avg_latency_ms": 450,
    "uptime_pct": 87.5,
    "free_tier_only": true
  }
  ```
- [x] 運算高效（registry snapshot + 單次遍歷，無外部 HTTP）
- [x] `go build ./...` 通過
- [x] `go vet ./...` 零警告
- [x] `go test ./...` 全部通過

## 實作位置

**檔案：** `internal/router/server.go`

```go
// 在 buildHandler() 中註冊
mux.HandleFunc("GET /api/health", s.handleAPIHealth)
mux.HandleFunc("GET /api/status", s.handleAPIStatus)

func (s *Server) handleAPIHealth(w http.ResponseWriter, r *http.Request) {
    writeJSON(w, 200, map[string]interface{}{
        "status": "ok",
        "uptime_seconds": int(time.Since(s.startTime).Seconds()),
    })
}

func (s *Server) handleAPIStatus(w http.ResponseWriter, r *http.Request) {
    all := s.registry.Snapshot()
    // 單次遍歷統計 up/down/pending/best/provider breakdown
    summary := computeStatusSummary(all)
    writeJSON(w, 200, summary)
}
```

## 備註
- `s.startTime` 需新增到 `Server` struct（在 `NewServer()` 中設定）
- `/api/health` 是業界標準端點，K8s/Docker Compose/Supervisor 都依賴它
- `/api/status` 讓 `freemodel status` CLI 命令可以改呼叫這個端點而非重複 build registry
