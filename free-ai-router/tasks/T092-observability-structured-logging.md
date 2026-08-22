---
github_issue: ""
title: "Structured logging: --log-format json for log aggregation"
type: pending
priority: medium
status: pending
depends_on: []
assignee: "OpenCode with DeepSeek V4 Flash"
created: "2026-08-22"
updated: "2026-08-22"
---

# T092 - Structured logging: --log-format json for log aggregation

## 目標
支援結構化 JSON 日誌輸出，方便接入 ELK、Loki、Datadog 等日誌聚合系統。

## 驗收標準
- [ ] 新增 `--log-format` flag：`text`（預設，人類可讀）| `json`（結構化）
- [ ] JSON 格式每行一個物件，包含標準欄位：
  - `timestamp` (RFC3339), `level`, `message`
  - `model`, `provider`, `status`, `latency_ms`, `ttfb_ms`
  - `request_id`（每請求唯一，便於追蹤）
  - `usage`（token 統計，若有）
  - `error`（錯誤詳情，若有）
- [ ] `--log` flag 同時啟用請求載體記錄（現有行為），JSON 格式下載體截斷 1024 字元
- [ ] 環境變數 `FREMODEL_LOG_FORMAT` 覆蓋
- [ ] 檔案輸出支援：`--log-file /var/log/freemodel.log`（可選，預設 stdout）
- [ ] 日誌輪轉：可選整合 `lumberjack` 或由外部 logrotate 處理

## 備註
- 修改位置：`internal/router/logging.go`（Logger 結構）、`internal/router/server.go`（flag 解析）、`internal/cli/flags.go`
- 現有 `Logger` 已有 `LogEntry` 結構，直接序列化為 JSON
- 建議使用 `encoding/json` 配合 `json.Encoder` 寫入 stdout，避免手動拼接
- 注意效能：高吞吐時 JSON 序列化開銷，可考慮 `github.com/segmentio/encoding/json` 優化
- 現有 `ping.test` 腳本可能需更新解析邏輯