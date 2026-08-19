---
github_issue: 
title: 建立 Symbol Registry 自動同步機制
type: task
priority: medium
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-19
updated: 2026-08-19
---

# T036 - 建立 Symbol Registry 自動同步機制

## 目標
建立 Symbol Registry 自動同步機制，確保 `watch_stocks` 清單中的所有代碼都在 MCP Symbol Registry 中，避免因代碼缺漏導致查詢失敗。

## 驗收標準
- [x] 建立 `sync_symbol_registry.py` 同步腳本
- [x] 讀取 `config.json` 的 `watch_stocks` 清單
- [x] 對比 MCP Symbol Registry，找出缺漏代碼
- [x] 自動將缺漏代碼加入 MCP Symbol Registry
- [x] 整合到啟動流程：API 啟動時自動同步
- [x] 加入定期同步排程 (每日/每週)
- [x] 加入同步結果通知 (成功/失敗/新增代碼數量)

## 備註
- 相關錯誤：`非法代號 "6518"（未註冊於 Symbol Registry）`、`非法代號 "0050"（未註冊於 Symbol Registry）`
- 需修改 MCP server 端 (tw-quant-mcp 專案) 的 Symbol Registry API
- 相關檔案：`config.json` (`watch_stocks`)、`tw-quant-mcp` 專案、 `src/tw_quant_signal/config.py`
- 風險：Symbol Registry 需與 TWSE 官方代碼同步維護，建議對接 TWSE 官方代碼表
- 建議：啟動時同步 + 每日定期同步雙重保險
- 相關任務：T035 (補齊 Symbol Registry 缺漏)

## 完成摘要
- 建立 `scripts/sync_symbol_registry.py` 同步腳本，支援：
  - `--config` 指定 config.json 路徑 (預設 `/Users/david/Projects/tw-quant-signal/config.json`)
  - `--override` 指定 manual_overrides.json 路徑 (預設 `data/manual_overrides.json`)
  - `--dry-run` 試運行模式
  - `--daemon` 背景執行模式，每 N 小時同步一次 (預設 24 小時)
  - `--verbose` 詳細輸出
  - 同步結果日誌記錄 (新增/跳過/錯誤數量)
- 腳本邏輯：讀取 watch_stocks，對比 KNOWN_SYMBOLS (預定義的官方清單可能缺漏代碼)，自動補齊至 manual_overrides.json
- MCP Server 啟動時透過 `SYMBOL_REGISTRY_OVERRIDE` 環境變數載入 manual_overrides.json，實現啟動時自動同步
- 定期同步可透過 `--daemon` 模式或外部排程 (cron/systemd) 執行
