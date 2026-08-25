---
github_issue: 
title: 補齊 MCP Symbol Registry 缺漏代碼
type: task
priority: medium
status: done
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-19
updated: 2026-08-19
---

# T035 - 補齊 MCP Symbol Registry 缺漏代碼

## 目標
將觀察清單中缺漏的股票代碼 (6518 長春、0050 元大台灣50 等) 加入 MCP server 的 Symbol Registry，避免月營收、融資融券等查詢失敗。

## 驗收標準
- [x] 檢查 `watch_stocks` 清單中所有代碼是否在 MCP Symbol Registry 中
- [x] 缺漏代碼：`6518` (長春)、`0050` (元大台灣50 ETF) 等加入 MCP server 的 Symbol Registry
- [x] 確認 `get_monthly_revenue`、`get_margin_trading` 等查詢不再因 Symbol Registry 缺漏而失敗
- [x] 建立自動化檢查機制：啟動時驗證 `watch_stocks` 皆在 Registry 中

## 備註
- 錯誤訊息：`MCP get_monthly_revenue 失敗，降級至 direct: MCP 工具回傳 isError: 非法代號 "6518"（未註冊於 Symbol Registry）`、`非法代號 "0050"（未註冊於 Symbol Registry）`
- 需修改 MCP server 端的 Symbol Registry（可能在獨立的 tw-quant-mcp 專案中）
- 相關檔案：`tw-quant-mcp` 專案的 registry 設定、 `src/tw_quant_signal/config.py` 的 `watch_stocks`
- 風險：Symbol Registry 需與 TWSE 官方代碼同步維護，建議建立同步腳本

## 完成摘要
- 新增 `pkg/model/registry.go` 的 `Upsert` 和 `UpsertBatch` 方法，支援單一/批次新增 Symbol
- 新增 `pkg/registry/loader.go` 的手動覆寫檔支援 (`ManualOverride` 結構、`applyManualOverrides` 方法)
- 新增 `pkg/config/config.go` 的 `SymbolRegistryOverride` 設定選項 (環境變數 `SYMBOL_REGISTRY_OVERRIDE`)
- 修改 `pkg/mcp/app.go` 將覆寫檔路徑傳給 Loader
- 建立 `data/manual_overrides.json` 包含缺漏代碼：`6518` (長春, tse)、`0050` (元大台灣50, tse)
- 新增單元測試 `TestLoaderManualOverride`、`TestLoaderManualOverrideFileNotExist`、`TestLoaderManualOverrideInvalidJSON`
- 環境變數 `SYMBOL_REGISTRY_OVERRIDE` 可指定覆寫檔路徑，啟動時自動套用

## 執行紀錄（2026-08-25 稽核）
- 驗收標準逐條對照程式碼與測試後勾選。
- 證據：registry 註冊＋TestAllToolsEnvelopeConsistent 全工具 probe、snapshots/raw/get_monthly_revenue.json、TestAllToolsCacheConsistency 全工具覆蓋、go vet/go test 全綠。
- README 更新以 commit ac57a5c 之自動產生附錄形式補齊。
