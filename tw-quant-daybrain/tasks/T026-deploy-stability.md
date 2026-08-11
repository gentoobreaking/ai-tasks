---
github_issue: ""
title: "部署穩定性——優雅關閉 + 交易日曆預載"
type: task
priority: high
status: done
depends_on: [T014]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-12
updated: 2026-08-12
---

# T026 - 部署穩定性（優雅關閉 + 交易日曆預載）

## 目標

修復單進程部署的三個穩定性問題：`process.exit(0)` 死碼 bug、MCP 子程序殘留、交易日曆首次拉取時機。

## 驗收標準

- [x] **移除 `process.exit(0)` 死碼**（`src/ops/single_process.ts`）：原 exit 在 `return` 之前無條件殺進程，`return { tradingDay, shutdownReason, firedPhases }` 永不執行、`main()` 拿不到結果、`logger.info('exit', ...)` 日誌遺失。改為自然收尾，保留 return 供呼叫方記錄與決定退出碼。
- [x] **MCP close 3 秒超時**：`Promise.race([client.close(), timeout 3000])`，超時記 `mcp_close_failed` warn 日誌，防止關閉掛死。
- [x] **MCP 子程序強殺**（`src/mcp/client.ts`）：`close()` 保存 transport 引用，關閉時強制 `kill('SIGKILL')` child process + 銷毀 stdio pipes，修復 MCP 子程序殘留（此前日誌出現大量 `system_shutdown` 事件疑似即因此）。
- [x] **交易日曆預載**（`src/index.ts`）：啟動時預載 `get_trading_calendar`（快取優先、失效走 MCP），避免盤中首次才拉取；以公開 `load()` 取代原 `calendar['loadCache']()` + `as never` 的私有欄位 hack，型別安全。
- [x] **shutdown marker 監控**：每 2 秒檢查 `LOG_DIR/.shutdown` 檔，存在即取消排程（`shutdownChecker.unref()` 不擋事件循環）。
- [x] **修正手改縮進錯位**：single_process.ts 3 行、index.ts 1 行多餘空格。
- [x] **驗證通過**：typecheck PASS + 350 測試全綠（含 client/single_process/contract_compat 相關 18 測試）。

## 備註

- **此三檔改動為先前工作區遺留**（8/12 01:53-02:06 修改，非 T025 任務所屬），經逐一審查確認屬「部署穩定性」主題後單獨提交，未與 T025 混入同一 commit。
- **`as never` hack 的來龍去脈**：`TradingCalendar` 的 `loadCache/saveCache/data` 皆為 private，原實作以 bracket 訪問 + `as never` 強轉繞過；`load()` 公開方法本身已處理快取/刷新，直接替換即可，不需要 hack。
- **為何刪 `process.exit(0)` 安全**：MCP 子程序殘留問題已由 close 強殺解決，事件循環清空後進程自然退出，無需暴力 exit。
- 對應 commit：`52a19c1 fix(ops): 部署穩定性——優雅關閉 + 交易日曆預載`（3 files, +71/-4）。
