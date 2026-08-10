# T014 部署與營運 — Summary

- **Commit**: `112a422`（核心）+ `60986e4`（index.ts 升級）
- **狀態**: done ✅（211 tests pass、build/lint ✅、test:simulate ✅）

## 實作內容（§18 部署與營運）

### 1. 單進程部署（§18.1）
- `src/ops/single_process.ts`：`runSingleProcess(opts, ctx)`
  - 交易日曆檢查（T005）→ 非交易日休眠回傳 `tradingDay: false`
  - 子程序拉起 `tw-quant-mcp`（`MCP_SERVER_BIN`，McpClient spawn Stdio）
  - `LifecycleScheduler` 主迴圈 1s 輪詢 `checkAndFire`
  - 依賴注入：`createClient`/`loadCalendar`/`onPhase`/`onTick`/`notify`/`nowFn`（測試友好）
- `src/index.ts`：T001 最小啟動升級為部署入口（SIGINT/SIGTERM → 優雅關閉）

### 2. 失敗處理矩陣（§18.3）
- MCP 斷線 → 指數退避重連 1s→30s + circuit breaker（McpClient 既有）
- Tool 失敗 → 重試 2 次後拋錯（既有）
- 守門失敗 → §3.2 降級（T003 既有）
- LLM 離線 → 規則引擎照常 + `llm_offline`（T011 既有）

### 3. 紙上交單（Human-in-the-loop）
- `src/execution/paper_trader.ts`：`PaperTrader.processSignal()`
  - 風控閘門（canOpenNewPosition）→ armPosition → trigger（score≥threshold）→ confirmer.confirm → enter
  - `EntryConfirmer` 可注入：`HeadlessConfirmer`（自動 simulated）/ `createCliConfirmer`（stdin y/n + 回報成交價 fill_price 覆寫）
  - 寫入 `position_opened` 補充事件（simulated / confirm_by 標註）
  - **v2.1 動態 force_flat_by**（取自 briefing active_window，§7.4/§11.5）：時間到 → 阻擋開倉
- 系統不自動下單（§1 原則 4），僅記錄決策

### 4. 無頭模式（headless）
- `HeadlessConfirmer`：建議成交價 = 觸發價 + `simulated: true`
- env `HEADLESS` / `PAPER_CONFIRM` / `FORCE_FLAT_BY` 新增

### 5. 優雅關閉
- `createContext()`：cancel → `waitForCancel` resolve → 主迴圈 break
- 停止 Phase 2 tick 循環（`isPhase2Running` 檢查）→ 強制平倉提醒（`getFiredPhases` 含 phase3）→ 寫 `system_shutdown` 事件
- 13:15/13:20 多通道提醒：`logger.warn` + stderr 終端警示（ANSI 黃色）+ `notify` 鉤子

## 除錯記錄
1. **測試 2 卡死**：runSingleProcess 主迴圈 `waitForCancel(1000)` 與測試 clock 推進速率不匹配（interval +1min/50ms 太快，第一次迭代後 cancel 已觸發）→ clock 起始設 08:16（phase0 已過），首次 checkAndFire 即觸發
2. **測試 3 timeout**：firePhase 對 phase2 不呼叫 onPhase（tick 循環由 checkAndFire 內啟動）→ 改測 phase3_close_1320 觸發；且 clock 13:19:30 未到 13:20（hhmm 分鐘粒度）→ 改 13:20:30
3. **PositionAction 型別**：`'LONG'|'SHORT'` → `'BUY_TO_OPEN'|'SELL_TO_OPEN'`（risk_manager 定義）
4. **lint**：EntryConfirmer 未用 import、result 未用 → 清理

## 測試（新增 12 項）
- paper_trader 7：headless / CLI 成交價回報 / 人工拒絕 / 風控拒絕 / 評分不足 / e2e / force_flat_by
- single_process 5：非交易日休眠 / 排程觸發 / 優雅關閉多通道 / createContext ×2
- 總計 211 tests（原 199 + 12）

## 後續
T015-release（10s tick 壓測、v2.0→v2.1 參數實驗、v2.0 tag）
