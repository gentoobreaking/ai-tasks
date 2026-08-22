---
github_issue: ""
title: "Configurable request timeout via config (replace hardcoded 120s)"
type: pending
priority: medium
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: "2026-08-22"
updated: "2026-08-22"
---

# T091 - Configurable request timeout via config (replace hardcoded 120s)

## 目標
將 router 轉發請求的硬編碼 120 秒超時改為可配置，支援不同場景需求（長上下文、慢速模型、串流）。

## 驗收標準
- [x] Config 新增 `requestTimeoutMs`（預設 120000，單位毫秒）
- [x] `internal/router/routing.go` 的 `forward` 函數讀取 config 而非硬編碼
- [x] 環境變數 `FREMODEL_REQUEST_TIMEOUT_MS` 覆蓋 config
- [x] CLI `freemodel config set-request-timeout <ms>` 設定
- [x] TUI Settings 畫面可調整
- [x] 驗證：最小 5000ms，最大 600000ms（10分鐘），超出範圍報錯
- [x] 串流請求同樣套用此超時（目前串流無超時控制）

## 備註
- 修改位置：`internal/config/config.go`（Config struct）、`internal/router/server.go`（傳遞 config 給 router）、`internal/router/routing.go`（使用）
- Router struct 需持有 timeout 設定，或從 config 讀取
- 注意：`http.Client.Timeout` 包含連線、TLS、讀寫全程，非僅讀取回應
- 串流模式下，超時應適用於「首字節時間（TTFB）」而非整個串流，需細分處理
