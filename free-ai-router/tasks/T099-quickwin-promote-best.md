---
github_issue: ""
title: "Quick win: promote --best flag to first-class subcommand"
type: pending
priority: high
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: "2026-08-22"
updated: "2026-08-22"
---

# T099 - Quick win: promote --best flag to first-class subcommand

## 目標
將隱藏的 `--best` flag 升級為 `freemodel best` 子命令，提升可發現性並支援更多選項。

## 驗收標準
- [x] 新增 `freemodel best` 子命令，功能等同現有 `--best`
- [x] 保留 `--best` flag 向後相容（顯示棄用警告）
- [x] 新增選項：
  - `--rounds <n>`：ping 輪數（預設 4，現行硬編碼）
  - `--tag <tag>`：限定 tag（如 `--tag coding`）
  - `--provider <name>`：限定 provider
  - `--json`：輸出 JSON 含完整統計（latency、uptime、tier、verdict）
  - `--quiet`：僅輸出最佳 model ID（適合腳本 `$()` 捕獲）
- [x] `freemodel --help` 顯示 `best` 於 Core Commands 區塊
- [x] 現有 `cli.RunBest()` 邏輯重構為可複用函數，供 flag 與 subcommand 共用

## 備註
- 修改位置：`internal/cli/flags.go`（解析）、`internal/cli/best.go`（重構）、`cmd/freemodel/main.go`（dispatch）
- 極低風險，純 CLI 層面調整，無核心邏輯變更
- 預估 10-15 分鐘完成
- 可作為 T082 的第一步交付
