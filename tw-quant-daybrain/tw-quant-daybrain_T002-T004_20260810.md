# T002-T004 完成紀錄（tw-quant-daybrain）

- 日期：2026-08-10
- 專案：`~/Projects/tw-quant-daybrain`（程式碼）/ `~/tasks/tw-quant-daybrain/tasks/*.md`（任務書）

## 目標
完成 T002（MCP Client 連線層）、T003（資料新鮮度守門）、T004（事件日誌與回放）三個連貫任務，每任務依規範 commit + 更新任務書 + 更新 README + 逐項驗收。

## 執行結果

### T002 MCP Client 連線層（commit b75a99d）
- `src/mcp/envelope.ts`：Envelope 型別（data/_lineage/_chart_meta）+ parseEnvelope + McpEnvelopeError
- `src/mcp/contracts.ts`：§2.2 全部 18 工具契約型別
- `src/mcp/client.ts`：McpClient（Stdio、handshake、call、重試 2 次 1s→2s、重連 1s→30s、breaker 5 次→60s）
- `test/mock_mcp_server.ts`：SDK 實作 mock server（Envelope fixtures + 錯誤路徑）
- 測試中發現並修正：Envelope 契約違反不應重試，直接抛 McpEnvelopeError

### T003 Freshness Gate（commit 8dd1c69）
- `src/gate/freshness_gate.ts`：§3.1 判定規則（時效 ≤30s、快取 sampling≤10/ttl≤4、PRE_MARKET、HISTORICAL+data_date）、附錄 A 未知 source fail、§3.2 狀態機（STALE 單標的停訊 / DEGRADED 市場層停新訊 / LOCKOUT 3 次全停）、事件 freshness_gate_pass|fail
- 狀態 API：getState/isSymbolStale/getStaleSymbols/recoverSymbol/recoverFromLockout/forceLockout

### T004 事件日誌（commit 5c5dd88）
- `src/logging/event_types.ts`：16 種事件型別 + EVENT_SCHEMAS 驗證 + EventValidationError
- `src/logging/event_logger.ts`：append-only JSON Lines 每日一檔（YYYY-MM-DD.events.jsonl）、seq 自動遞增、loadDay 回放（ts 排序、損壞行跳過）、loadChain 決策追溯

## 驗收
- 68 tests pass（node:test，含 T001 既有 30 個）
- build（tsc）✅、lint（tsc --noEmit + eslint）✅
- 任務書 T002/T003/T004 均更新 status: done + 驗收 checkbox 全勾
- 專案 README.md 已更新（含使用方式範例）；`~/tasks/tw-quant-daybrain/README.md` 未動

## 後續
- T005（交易日曆與生命週期排程）為下一任務，依任務書順序進行
