# 任務看板 v2.0 更新紀錄

- 日期：2026-08-01
- 目錄：`~/tasks/tw-quant-daybrain/`

## 背景

`tw-quant-daybrain-v2.0.md`（主規格 v2.0，95403 bytes）與 `tw-quant-adapter-2.0.md`（券商 Adapter v2.0，35416 bytes）已於先前完成合併。v2.0 規格書新增大量模組，原 T001–T015 任務（v1.1 版）章節引用已失效且缺少 v2.0 新模組任務。

## 本輪完成事項

1. **更新既有 15 個任務（T001–T015）**：
   - 章節引用全面對齊 v2.0（如 §17 技術選型、§18 部署、§8 訊號模型、§11 風控、§14/§15 資料結構與指標、§16 LLM 規範、§19 Roadmap）
   - 環境變數清單補齊 v2.0 新增項（`NEUTRAL_SCORE_THRESHOLD`、`BIAS_LOCK_SCORE`、`TOTAL_MARGIN_POOL_NTD`、`MAX_LEVERAGE`、`SECTOR_LIMIT_PCT`、`VOLUME_SURGE_THRESHOLD` 等）
   - T006/T007/T008/T009/T010 補入 v2.0 對齊備註（Bias 輸入、雙評分制並存、多空出場分流、Bias 白名單攔截、假突破率/攔截統計）
   - 各檔 updated 欄位改為 2026-08-01

2. **新增 9 個 v2.0 任務（T016–T024）**：
   - T016 Bias Decision Tree（§5，`src/bias/decision_tree.ts`）
   - T017 做多策略引擎 VWAP_SURGE_LONG（§6，`src/engine/vwap_surge_long.ts`）
   - T018 空方策略引擎 BULL_TRAP_VWAP_SHORT（§7，`src/engine/bull_trap_vwap_short.ts`）
   - T019 Tactical Briefing 產生器（§9，`src/briefing/generator.ts`）
   - T020 Priority Ranking Engine（§10，`src/execution/priority_engine.ts`）
   - T021 CsvDataLoader（§12.3，`src/backtest/data_loader.ts`）
   - T022 事件驅動回測模擬器（§12，`src/backtest/simulator.ts`）
   - T023 Grid Search（§13.1，`src/backtest/grid_search.ts`）
   - T024 WFO（§13.3，`src/backtest/wfo_optimizer.ts`）
   - 每檔含完整 front matter（github_issue/type/priority/status/assignee/created/updated）、目標、對應規格書章節、驗收標準（對齊 v2.0 提供之 TypeScript 範例）、備註

3. **重建 README.md 專案看板**（2678 bytes）：規格文件索引、24 任務總覽表（done 0 / in-progress 0 / skip 0 / pending 24）、按 Phase 分組任務清單、開發地圖（附錄 B）

## 驗證

- 24 檔皆含 front matter，status 全部 pending
- 章節引用抽查（T014 → §18）正確
- 目錄現況：`tw-quant-daybrain-v2.0.md`、`tw-quant-adapter-2.0.md`、`README.md`、`tasks/`（24 檔）、`台股 MCP 程式串接指南.pdf`

## 備註

- 任務檔存放 `~/tasks/tw-quant-daybrain/tasks/`；程式碼根目錄為 `~/Projects/tw-quant-daybrain`（尚未建立）
- 全部任務待 OpenCode 依序執行；T015 發布需 T016–T024 全數驗收通過
