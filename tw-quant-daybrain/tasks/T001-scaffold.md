---
github_issue: N/A
title: 專案初始化與設定骨架
type: infrastructure
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-08-01
---

# T001 - 專案初始化與設定骨架

## 目標
建立 `tw-quant-daybrain` TypeScript 專案骨架（§17 技術選型），含設定載入（yaml + 環境變數覆寫）、目錄結構、日誌基礎，可啟動但不連 MCP 的最小進程。

## 驗收標準
- [ ] Node.js ≥ 20 + TypeScript 專案初始化於 `~/Projects/tw-quant-daybrain`；依賴含 `@modelcontextprotocol/sdk`
- [ ] 目錄結構：`src/{mcp,gate,bias,engine,briefing,execution,risk,metrics,llm,scheduler,logging,backtest}/`、`config/*.yaml`、`logs/`、`data/historical_1m/`
- [ ] 設定載入：`config/scoring.yaml`（§8.2 評分表）、`config/scheduler.yaml`（§18.2 排程）、環境變數覆寫（§17.1 全部變數，含預設值）
- [ ] 環境變數（§17.1 為唯一真值）：`TIME_ZONE / MCP_SERVER_BIN / MCP_TRANSPORT / DATA_STALENESS_MAX_SEC / SCORE_THRESHOLD / NEUTRAL_SCORE_THRESHOLD / BIAS_LOCK_SCORE / RISK_PER_TRADE / MAX_POSITIONS / MAX_DAILY_LOSS_PCT / TOTAL_MARGIN_POOL_NTD / MAX_LEVERAGE / SECTOR_LIMIT_PCT / VOLUME_SURGE_THRESHOLD / NO_ENTRY_AFTER / FORCE_CLOSE_AT / LOG_DIR / DATA_DIR`
- [ ] 結構化 JSON 日誌基礎（事件型，含 ts/type 欄位），`LOG_DIR` 可設定
- [ ] 時區統一 `Asia/Taipei`（時間工具函式），禁止使用本機時區隱式轉換
- [ ] `npm run build` / `npm run test` / `npm run lint` 腳本；`tsc --noEmit` 通過

## 備註
- 程式碼根目錄 `~/Projects/tw-quant-daybrain`；規格書與任務檔存放於 `~/tasks/tw-quant-daybrain`
- 此階段不接 `tw-quant-mcp`，連線在 T002 實作
- 所有環境變數預設值以 §17.1 表為唯一真值
- v2.0 新增目錄：`bias/`（§5 決策樹）、`engine/`（§6/§7 策略引擎）、`briefing/`（§9）、`execution/`（§10）、`backtest/`（§12/§13）
