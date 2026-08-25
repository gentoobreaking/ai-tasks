---
github_issue: N/A
title: 新增工具 get_all_stocks_daily_close（單日全市場逐檔收盤行情）
type: feature
priority: medium
status: done
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-26
updated: 2026-08-26
---

# T192 - 新增工具 `get_all_stocks_daily_close`（單日全市場逐檔收盤行情）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_all_stocks_daily_close`，
提供「指定日期查詢全部上市股票收盤行情（開高低收、成交量、本益比）」之能力。
與既有 `get_stock_daily_quote`（個股跨日）、`get_market_summary`（市場彙總）互補：
本工具是「單一日期 × 全市場逐檔」快照，適合條件篩選與市場橫斷面分析。
工具名稱**沿用遠端命名**以利對照。

出處：`docs/COMPARISON_TWSEMCPServer.md` §三之一 A——遠端獨有清單實測（2026-08-26）。

## 遠端參考實作（twstockmcpserver）

### 工具描述與參數（tools/list 實抓 2026-08-26）
```
查詢指定日期全部上市股票的每日收盤行情（開高低收、成交量、本益比）。
與 get_stock_history（單一股票查一整月）互補：此工具是「單一日期查全市場」，
適合抓某天的市場快照或篩選特定條件的股票。

Args:
    date: 查詢日期，格式 YYYYMMDD，例如 "20260610"（需為交易日）
    stock_no: 股票代號（選填），指定則只回傳該股票
    name: 股票名稱關鍵字（選填）
    limit: 回傳筆數上限（預設 50）
    offset: 跳過前 N 筆（預設 0，搭配 limit 分頁）

Returns:
    每支股票的代號、名稱、成交股數、成交金額、開高低收、漲跌、本益比
```

### 輸入參數 Schema（inputSchema）
```json
{
  "properties": {
    "date":     { "title": "Date", "type": "string" },
    "stock_no": { "default": "", "title": "Stock No", "type": "string" },
    "name":     { "default": "", "title": "Name", "type": "string" },
    "limit":    { "default": 50, "title": "Limit", "type": "integer" },
    "offset":   { "default": 0, "title": "Offset", "type": "integer" }
  },
  "required": ["date"],
  "type": "object"
}
```

### 上游取值 API（遠端原始碼驗證：tools/history/all_stocks_daily_close.py）
- 端點：`GET https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX?response=json&date={YYYYMMDD}&type=ALLBUT0999`
- 回應為 `tables[]` 結構：以 `title` 字首「每日收盤行情」定位個股行情表
  （其餘 tables 為指數層級彙總表；TWSE 可能重排順序，勿寫死 index）
- 個股行情表每列 16 欄：
  `證券代號, 證券名稱, 成交股數, 成交筆數, 成交金額, 開盤價, 最高價, 最低價,
   收盤價, 漲跌(+/-), 漲跌價差, 最後揭示買價, 最後揭示買量, 最後揭示賣價, 最後揭示賣量, 本益比`
- 注意：非交易日回 `stat != "OK"` 或空 tables，需回明確錯誤訊息；
  數字欄含逗號與 `--`/`X`（如 ETF 無 PE）須容錯解析（參考前例 ParseWebReport 數字儲存cell修正）

## 實作要求
- 資料源：TWSE-WEB 官方端點（100% 官方來源政策，§2 Source Registry）
- 登錄位置：依既有 registry 行情類分組（參考 `get_stock_daily_quote` 所在檔案）
- `stock_no` / `name` 為本地端過濾（先取全量再 filter）；`limit`/`offset` 分頁
- 全市場約 1000+ 列，建議 L2 快取（歷史日不可變資料可長 TTL／永久），
  當日資料 L1 短 TTL
- 遵循 Envelope、`_lineage`、Per-source Rate Limit（§4.4/§5.3）、`_chart_meta` 不適用

## 驗收標準
- [x] `tools/list` 可見 `get_all_stocks_daily_close`，inputSchema 與本任務附帶者語意一致
- [x] 以真實參數呼叫至少一次成功（含 stock_no 過濾與 offset 分頁各一次），回傳符合 Envelope 且含 `_lineage`
- [x] 非交易日呼叫回明確錯誤訊息（非靜默空值）
- [x] 快取生效：同日期重複呼叫第二次零上游 HTTP
- [x] 單元測試（fixtures 對照 MI_INDEX 真實回傳樣本）；`make test` / `go vet ./...` 通過
- [x] README 附錄（自動產生）重新彙出

## 備註
- 遠端對照：TWSEMCPServer 同名工具，行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/COMPARISON_TWSEMCPServer.md` §三之一
