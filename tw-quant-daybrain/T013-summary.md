# T013-summary — 測試策略與模擬盤（Mock MCP Server）

- **Commit**: `1083ece`
- **日期**: 2026-08-11
- **狀態**: done（199 tests pass、build ✅、lint ✅、test:simulate Phase 0→4 全 OK）

## 交付內容

### 1. Mock MCP Server（`test/mock_mcp_server.ts`，T002 時期既有）
- mcp v1.3 契約 18 工具假實作，Stdio server（name: mock-tw-quant-mcp, v1.3.0）
- 特殊 symbol 控制錯誤路徑：`mock_error` / `mock_bad_json` / `mock_unknown_source` / `mock_no_lineage` / `mock_timeout`
- Envelope 產生 helper：`env()` 帶 `_lineage`（source/freshness/fetched_at/is_cached）+ `_chart_meta`

### 2. Fixtures（`testdata/mcp/intraday.json`）
- 單日模擬 fixture：P0（11 工具無參數預熱版）、P1（三路徑選股 2308/2317 + abnormal + announcement）、P2（雙 tick 爆量突破 2308：tick1 09:30:00 / tick2 09:30:10）、P3（13:20 四筆 fetch）、P4（盤後）
- `scoring_version: '2.1.0'` 標註
- **fixture 設計教訓**：P0 的 warmup 會對每個 required tool 呼叫 `mcpCall(tool, {})`，故 P0 需無參數版本；P1/P2 需帶參數版本，避免被 P0 消費

### 3. 回放 Harness（`src/simulate/simulate.ts` + `cli.ts`）
- `runSimulation({ fixturePath, fault, faultTool, logDir })`：fixture 驅動真實 pipeline（Phase0ReadyCheck → Phase1Selector → IntradayLoop ticks → Phase 3 → Phase 4）
- **fixtureCaller 依序消費**（每 hit 一筆即移除）：防止跨 tick 重用舊資料（同 tool+args 跨 tick 無法區分，消費制解決）
- 三種故障注入：`connection_drop`（Phase 0 tools=0 連線失敗）、`timeout`（faultTool 逾時→警示不當機）、`data_gap`（data=null→守門不崩潰）

### 4. 測試
- `src/simulate/simulate.test.ts`：5 測試（模擬日全 Phase 0→4 + signal_issued:2308、connection_drop、timeout、data_gap、回測 fixtures 存在性）
- `npm run test:simulate`（CLI 全盤模擬日輸出）、`npm run test:simulate:unit`（simulate 單元）
- 回測 fixtures：`testdata/historical_1m/{2308,2317}.csv`（5 天 × 270 分鐘 1 分鐘 K，供 T021/T022）

## 關鍵修正：跨日時間敏感 bug（重要）

**根因**：多處 `events.write()` 未傳 `now` → 用真實時鐘寫入「今天」檔，測試讀「指定日」檔 → 查無。跨日即必掛的測試設計瑕疵。

**修正清單**：
1. `src/engine/intraday_loop.ts`：7 處 write（phase_end/freshness_gate_fail×2/signal_expired/failed_breakout×2/signal_issued）改傳 `now`（業務時鐘）
2. `src/risk/risk_manager.ts`：4 處 write（position_opened/position_closed/daily_lockout/position_state_change）改用 `this.nowFn()`
3. `src/tools/replay.test.ts`：setupLogger 改傳 now（從事件 ts 解析）
4. `src/logging/event_logger.test.ts`：測試 90 改動態日期
5. `src/metrics/journal.test.ts`：測試 122 的 write 補傳 now
6. `src/engine/intraday_loop.test.ts`：fixtures 簽名擴充 `(tool, symbol, now)`，測試 10 動態 fetched_at 跟隨時鐘
7. `simulate.ts`：RiskManager 補 InMemoryPositionRepository（否則 openPositions() 讀 undefined 噴錯）

**教訓**：EventLogger.write 用 `todayInTaipei(now)` 決定檔名——凡測試寫入歷史日誌必須傳 now；生產代碼 events.write 一律用業務時鐘（nowFn/tick 參數），不得依賴真實時鐘。

## 其他修正
- `loadScoringConfig(yaml)` 需參數 → simulate 改用 `loadScoringConfigFromFile()`
- 事件 map spread 順序：`{ ...e, ts: e.ts, type: e.type }` 避免 TS2783
- Phase 3 tick 會 fetch watchlist（設計行為）：fixture 需提供 13:20 的 vwap/surge 資料，否則 stale fail

## 驗收對照
- [x] Mock MCP Server 契約 + fixtures 回放 + 三種故障注入
- [x] 單元測試：T003 守門（STALE/DEGRADED/LOCKOUT 全狀態）、T007 評分、T008 風控、T010 指標（T016/T020 依賴後續任務）
- [x] 全盤模擬日：Phase 0→4 全執行、事件日誌完整（signal_issued:2308 + 6 次 phase_end:3）
- [x] 測試指令：test / test:simulate / test:simulate:unit 全綠
- [x] 故障注入：connection_drop→tools=0、timeout→警示、data_gap→缺口警示
- [x] 回測 fixtures：historical_1m/ 1 分鐘 K CSV
