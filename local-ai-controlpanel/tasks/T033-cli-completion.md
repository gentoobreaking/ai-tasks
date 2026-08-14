---
github_issue: N/A
title: CLI 完善與使用者介面
type: feature
priority: medium
status: pending
depends_on: [T024]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-15
---

# T033 - CLI 完善與使用者介面（§29）

## 目標

完善 Spec §29 定義的 CLI 功能，提供完整的命令列介面供開發者/使用者操作 Control Plane。

目前 `apps/cli/` 存在但功能有限，需補完核心指令。

## 驗收標準

- [ ] 實作核心 CLI 指令（`apps/cli/src/commands/`）：

| 指令 | 功能 | Spec 參考 |
|------|------|-----------|
| `cp task create <request>` | 建立新任務 | §9 |
| `cp task list [--status]` | 列出任務 | §9 |
| `cp task show <id>` | 顯示任務詳情（狀態、attempt、evidence、patches） | §32 |
| `cp task cancel <id>` | 取消任務 | §9 |
| `cp task approve <id>` | 批准 ASK_USER 任務 | §9 |
| `cp task retry <id>` | 重試失敗任務 | §23 |
| `cp run <task_id> [--baseline A-F]` | 執行單一任務（支援 baseline 選擇） | §34 |
| `cp baseline run [--lang] [--baseline A-F]` | 批次跑分 | §34 |
| `cp report generate [--baseline]` | 生成指標報告 | §36 |
| `cp db export [--db] [--format csv|json]` | 匯出資料庫 | §36.4 |
| `cp worker ping` | 探測 llama.cpp 連線 | §16 |
| `cp worker models` | 列出可用模型 | §16 |

- [ ] 實作輸出格式選項：`--format json|table|csv|markdown`
- [ ] 實作 `--watch` / `-w` 模式：即時顯示 task 狀態變化（SSE 訂閱）
- [ ] 實作 `--config` 指定自訂政策檔案路徑
- [ ] 完善 `apps/cli/src/main.ts` 入口點、命令註冊、錯誤處理
- [ ] 加入 `--help` 完整說明、範例
- [ ] 單元測試：每個指令的基本功能測試

## 備註

- 使用 `commander.js` 或 `yargs` 作為 CLI 框架
- 輸出格式預設 table，支援 `--json` 給腳本串接
- 需讀取 `config.ts` + `policies/*.yaml` 取得預設設定
- 依賴 `apps/control-plane/src/server.ts` 的 REST API 或直接調用內部模組
- 預估開發時間：3-4 天

## 相關 Spec 章節

- §29 CLI
- §32 Observability（事件日誌、SSE）
- §34 Baseline Experiment Groups（baseline run 指令）
- §36 Metrics / §36.4 結果保存（db export、report generate）