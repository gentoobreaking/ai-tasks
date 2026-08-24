---
github_issue: N/A
title: 專案骨架與 Go 模組初始化
type: chore
priority: high
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T001 - 專案骨架與 Go 模組初始化

## 目標
建立 Go 專案基礎：go.mod（module slo-sentinel）、§2.2 模組樹的目錄結構、
全域 config 載入（YAML：Prometheus URL / AlertManager URL / Telegram token /
輪詢間隔 / listen 位址）、structlog 結構化日誌、Makefile（build/lint/test/promtool-check）。

## 驗收標準
- [x] `go build ./...` 通過；`make lint` 含 go vet（golangci-lint 未安裝時降級 vet）
- [x] `internal/{spec,query,catalog,budget,capacity,billing,cost,waste,alert,store}` 目錄存在且各含 doc.go 職責說明（依 spec.md §2.2）
- [x] config 載入有單元測試（預設值/覆寫/缺欄位三案例）

## 備註
- 語言評估見 spec.md §4（Go）；後續任務書驗收標準必須引用 algs/*.md 對應小節（拆解鐵律見 spec.md §6）