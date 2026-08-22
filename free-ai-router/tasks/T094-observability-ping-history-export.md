---
github_issue: ""
title: "Ping history export: freemodel export-pings --since 1h --format csv"
type: pending
priority: low
status: done
depends_on: []
assignee: "OpenCode with DeepSeek V4 Flash"
created: "2026-08-22"
updated: "2026-08-22"
---

# T094 - Ping history export: freemodel export-pings --since 1h --format csv

## 目標
提供 ping 歷史資料匯出功能，支援離線分析、報表產生、效能基準比較。

## 驗收標準
- [x] 新增命令：`freemodel export-pings [--since <duration>] [--format csv|json] [--output <file>]`
- [x] `--since` 支援相對時間：`1h`、`24h`、`7d`、`30d`，預設 `24h`
- [x] `--format`：`csv`（預設，Excel 相容）| `json`（完整結構）
- [x] CSV 欄位：`timestamp,model_id,provider,status,latency_ms,http_code,verdict`
- [x] `--output` 指定檔案，預設 stdout
- [x] 資料來源：registry 中模型的 `Pings` 歷史記錄（已有 `HistoryCap=100`）
- [x] 若歷史不足（重啟遺失），提示警告但繼續匯出現有資料
- [x] 支援 `--model <id>` 過濾特定模型

## 備註
- 修改位置：`internal/cli/` 新增 `export_pings.go`、或擴充 `internal/cli/best.go` 邏輯
- 需讀取 registry 完整模型清單（含 ping 歷史），目前 `Snapshot()` 回傳 deep copy 已包含 `Pings`
- 時間過濾在匯出時套用，比較 `PingEntry.At` (unix ms)
- 大量資料時考慮 streaming 寫入，避免記憶體峰值
- 可作為 `freemodel doctor` 的擴充輸出來源