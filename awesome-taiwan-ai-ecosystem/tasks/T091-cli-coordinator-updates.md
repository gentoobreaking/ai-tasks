---
github_issue: N/A
title: CLI & Coordinator Updates — New pipeline stages
assignee: pi
type: feat
priority: high
status: pending
depends_on: ["T089", "T065", "T084"]
created: 2026-09-05
updated: 2026-09-05
---

# T091 - CLI & Coordinator Updates — New pipeline stages

## 目標

更新 CLI 與協調器，支援新的多階段 pipeline。對應規格書 §43, §61 Integration。

修改：`cmd/crawler/main.go`, 新建 `internal/coordinator/`, `cmd/migrate/main.go` (T085), `cmd/export/main.go`。

## 驗收標準

- [ ] `cmd/crawler/main.go` 重構：
  - [ ] 子命令：`run`, `discover`, `classify`, `verify`, `scan`, `score`, `export`, `migrate`
  - [ ] `run`：完整 pipeline（預設）
  - [ ] `discover`：僅發現階段，輸出 candidates
  - [ ] `classify`：載入 candidates，執行分類+評分
  - [ ] `verify`：對 STATIC_VERIFIED 執行 runtime verification
  - [ ] `scan`：安全掃描
  - [ ] `score`：品質評分
  - [ ] `export`：生成所有 registry views (T083)
  - [ ] `migrate`：呼叫 T085 遷移腳本
  - [ ] 共用 flags：`--db`, `--config`, `--workers`, `--batch-size`, `--dry-run`, `--verbose`
- [ ] `internal/coordinator/coordinator.go` 新建：
  - [ ] `Pipeline` struct 管理階段
  - [ ] `Stage` interface：`Name() string`, `Execute(ctx, entities) ([]*Entity, error)`
  - [ ] 階段註冊：Discovery, Normalize, TaiwanScore, AIScore, Classify, MCPIdentity, RuntimeVerify, SecurityScan, QualityScore, ExportViews
  - [ ] 階段間 Entity 傳遞、錯誤處理、重試、checkpoint
  - [ ] 進度報告：log 每階段耗時、處理數、錯誤數
- [ ] `cmd/export/main.go` 新建：
  - [ ] 讀取 DB，調用 View Generator (T083)
  - [ ] 支援 `--view=all|mcp|agents|tools|data|ecosystem`
- [ ] 配置檔：`config/pipeline.yaml` 定義階段順序、啟用/停用、參數
- [ ] 單元測試：各階段獨立執行、錯誤處理
- [ ] 整合測試：`crawler run` 完整跑通

## 備註

- 現有 `cmd/crawler/main.go` 較簡單，需大幅擴展
- Coordinator 參考 `algs/coordinator.md`
- Pipeline 階段對應規格書 §43 流程圖

## 執行紀錄

- 待執行