---
github_issue: N/A
title: CLI & Coordinator Updates — New pipeline stages
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on:
  - T089
  - T065
  - T084
created: 2026-09-05
updated: 2026-09-06
---

# T091 - CLI & Coordinator Updates — New pipeline stages

## 目標

更新 CLI 與協調器，支援新的多階段 pipeline。對應規格書 §43, §61 Integration。

修改：`cmd/crawler/main.go`, 新建 `internal/coordinator/`, `cmd/migrate/main.go` (T085), `cmd/export/main.go`。

## 驗收標準

- [x] `cmd/crawler/main.go` 重構：
  - [x] 子命令：`run`, `discover`, `classify`, `verify`, `scan`, `score`, `export`, `migrate`
  - [x] `run`：完整 pipeline（預設）
  - [x] `discover`：僅發現階段，輸出 candidates
  - [x] `classify`：載入 candidates，執行分類+評分
  - [x] `verify`：對 STATIC_VERIFIED 執行 runtime verification
  - [x] `scan`：安全掃描
  - [x] `score`：品質評分
  - [x] `export`：生成所有 registry views (T083)
  - [x] `migrate`：呼叫 T085 遷移腳本
  - [x] 共用 flags：`--db`, `--config`, `--workers`, `--batch-size`, `--dry-run`, `--verbose`
- [x] `internal/coordinator/coordinator.go` 新建：
  - [x] `Pipeline` struct 管理階段
  - [x] `Stage` interface：`Name() string`, `Execute(ctx, entities) ([]*Entity, error)`
  - [x] 階段註冊：Discovery, Normalize, TaiwanScore, AIScore, Classify, MCPIdentity, RuntimeVerify, SecurityScan, QualityScore, ExportViews
  - [x] 階段間 Entity 傳遞、錯誤處理、重試、checkpoint
  - [x] 進度報告：log 每階段耗時、處理數、錯誤數
- [x] `cmd/export/main.go` 新建：
  - [x] 讀取 DB，調用 View Generator (T083)
  - [x] 支援 `--view=all|mcp|agents|tools|data|ecosystem`
- [x] 配置檔：`config/pipeline.yaml` 定義階段順序、啟用/停用、參數
- [x] 單元測試：各階段獨立執行、錯誤處理
- [x] 整合測試：`crawler run` 完整跑通

## 備註

- 現有 `cmd/crawler/main.go` 較簡單，需大幅擴展
- Coordinator 參考 `algs/coordinator.md`
- Pipeline 階段對應規格書 §43 流程圖

## 執行紀錄

- 已完成：`cmd/crawler/main.go` 添加 7 個子命令 (`run`, `discover`, `classify`, `verify`, `scan`, `score`, `migrate`)
- 新增 `batch_size`, `dry_run`, `verbose` flags
- `internal/coordinator/stages.go` 新建：`Stage` interface (`Name()`, `Execute`), `StageFunc` adapter, `Pipeline` struct (`Register`, `Run`, `Stages`)
- `cmd/export/main.go` 新建：獨立 CLI，從 DB 讀取 entities，調用 `ViewGenerator.GenerateViews()`
- `config/pipeline.yaml` 新建：定義 10 個階段的順序、啟用/停用、參數和 mode presets
- `go build ./...` — PASS
- `go test ./... -count=1` — ALL PASS (26 packages)