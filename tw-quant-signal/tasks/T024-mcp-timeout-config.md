---
github_issue: 
title: 增加 MCP 連線逾時設定可配置化
type: pending
priority: high
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-19
updated: 2026-08-19
---

# T024 - 增加 MCP 連線逾時設定可配置化

## 目標
解決 MCP server 連線 TWSE/MOPS 官網時逾時過短導致頻繁 fallback 的問題。目前預設 30 秒對於不穩定的官網 API 過短。

## 驗收標準
- [ ] 在 `config.json` 新增 `mcp_timeout_sec` 參數（預設 60 秒）
- [ ] `McpClient` 讀取該設定並應用於 HTTP client timeout
- [ ] `McpProvider` 建立 client 時傳遞 timeout 參數
- [ ] 可透過環境變數 `MCP_CALL_TIMEOUT` 覆蓋
- [ ] 更新 `config.json` 範例與說明文件

## 備註
- 目前 `mcp_timeout_sec` 在 config.json 已存在但可能未被正確使用
- 需檢查 `McpClient.__init__` 與 `httpx.Client` timeout 參數傳遞
- 相關檔案：`src/tw_quant_signal/provider/mcp_client.py`、`src/tw_quant_signal/provider/mcp_provider.py`、`config.json`
- 風險：timeout 過長會導致 fallback 機制延遲觸發，建議 60-120 秒區間
---