---
github_issue: N/A
title: 部署、失敗處理與紙上交單
type: operations
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T014 - 部署與營運

## 目標
實作 §11 部署與營運：單進程部署（daybrain + mcp 子程序）、§11.3 失敗處理矩陣、紙上交單介面（Human-in-the-loop）、無頭模式。

## 驗收標準
- [ ] 部署形態（§11.1）：單一進程啟動 daybrain Agent 並以子程序拉起 `tw-quant-mcp`（`MCP_SERVER_BIN`）；交易日自動執行、非交易日休眠（T005）
- [ ] 失敗處理矩陣（§11.3 全項）：MCP 斷線→指數退避重連 + LOCKOUT；Tool 失敗→重試 2 次後跳過並標缺口；守門失敗→§3.2 降級；LLM 不可用→規則引擎照常出訊 + `llm_offline` 註記
- [ ] 紙上交單介面：`TRIGGERED→ENTERED` 需人工確認（T008）；提供 CLI/stdin 確認與回報成交價，寫入 `position_opened` 事件
- [ ] 無頭模式（headless）：無人工介入時自動回報「建議成交價 = 觸發價」並標註 `simulated`，供模擬盤使用
- [ ] 優雅關閉：ctx cancel → 停止 Phase 2、強制平倉提醒、寫入 `system_shutdown` 事件
- [ ] 測試：故障注入（T013）下之失敗處理行為、無頭模式端到端

## 備註
- 本系統不自動下單（§1 原則 4），紙上交單僅記錄決策，不觸碰券商 API
- 13:15/13:20 之提醒需支援多通道輸出（日誌 + 終端警示），避免被忽略
