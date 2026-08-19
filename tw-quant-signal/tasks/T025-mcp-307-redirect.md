---
github_issue: 
title: 修正 MCP Client 處理 HTTP 307 重導向
type: pending
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-19
updated: 2026-08-19
---

# T025 - 修正 MCP Client 處理 HTTP 307 重導向

## 目標
修正 MCP Client 無法處理 MOPS (公開資訊觀測站) 回傳的 HTTP 307 重導向，導致財報抓取失敗。

## 驗收標準
- [x] `httpx.Client` 設定 `follow_redirects=True`
- [x] 確認 `McpClient._send_request` 或底層 `httpx.Client` 正確處理 307 重導向
- [x] 測試 MOPS 財報 API (資產負債表、損益表、現金流量表) 能正確跟隨 307 重導向
- [x] 移除因 307 導致的 fallback 到 direct mode

## 備註
- 錯誤訊息：`MCP get_financial_statements 失敗，降級至 direct: MCP 工具回傳 isError: 資產負債表取得失敗: mops: 非預期 HTTP 狀態 307`
- 相關檔案：`src/tw_quant_signal/provider/mcp_client.py`、`src/tw_quant_signal/provider/mcp_provider.py`
- `httpx.Client(follow_redirects=True)` 預設即為 True，需確認是否被覆蓋為 False
- 風險：若重導向鏈過長可能導致無限循環，需設定最大重導向次數
- 相關任務：T021, T022, T023 (MCP 相關遷移任務)
---