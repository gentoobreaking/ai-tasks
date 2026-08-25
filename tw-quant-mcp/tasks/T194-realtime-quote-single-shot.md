---
github_issue: N/A
title: 新增工具 get_realtime_quote（任意多檔單發即時報價，MIS 直查模式）
type: feature
priority: high
status: done
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-26
updated: 2026-08-26
---

# T194 - 新增工具 `get_realtime_quote`（任意多檔單發即時報價，MIS 直查模式）

## 目標
補齊遠端獨有的即時報價「差異模式」。本機既有盤中引擎為 **watchlist 常駐輪詢**
（`set_active_watchlist` 上限 15 檔 → `get_intraday_quote` 讀記憶體），watchlist 外的
標的無法隨手即時查。本任務新增 **單發直查模式** 工具 `get_realtime_quote`：
任意多檔、即查即走、不佔 watchlist 名額、不觸發輪詢引擎。

### 命名決策（已定案）
- 新工具沿用遠端名稱 **`get_realtime_quote`**（遠端原本就叫此名，保留原名以利雙邊對照）
- 本機引擎式工具維持 **`get_intraday_quote`** 不改名（daybrain 相依契約 15 依賴之一，
  不可破壞）——兩者名稱本就不同，無衝突
- 兩工具並存、模式互補，於兩者 description 互相註明差異：

| | `get_realtime_quote`（新） | `get_intraday_quote`（既有） |
|---|---|---|
| 模式 | MIS HTTP 單發直查 | 引擎記憶體讀取（零 HTTP） |
| 標的 | 任意多檔 | 僅 watchlist 內（≤15 檔） |
| 前置 | 無 | 需先 `set_active_watchlist` |
| 五檔 | ✅（a/b/f/g 欄位） | ✅ |
| 適用 | 盤中隨手查、盤後最後成交價 | 高頻輪詢、爆量/K線引擎 |

出處：`docs/COMPARISON_TWSEMCPServer.md` §三之一 B——模式差異（2026-08-26）。

## 遠端參考實作（twstockmcpserver）

### 工具描述與參數（tools/list 實抓 2026-08-26）
```
查詢台灣股票盤中即時報價，支援同時查詢多支股票。
上市股與上櫃股皆可查，系統自動判斷前綴。
盤後回傳最後成交價。

Args:
    stock_nos: 股票代號列表，例如 ["2330", "0050", "2317"]

Returns:
    每支股票的即時報價：代號、名稱、成交價、開盤、最高、最低、昨收、成交量、漲跌、漲跌幅、時間
```

### 輸入參數 Schema（inputSchema）
```json
{
  "properties": {
    "stock_nos": {
      "items": { "type": "string" },
      "title": "Stock Nos",
      "type": "array"
    }
  },
  "required": ["stock_nos"],
  "type": "object"
}
```

### 上游取值 API（遠端原始碼驗證：tools/realtime/stock_info.py）
- 端點：`GET https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch={ex_ch}&json=1&delay=0`
- `ex_ch` 格式：管道分隔的 `tse_{code}.tw` / `otc_{code}.tw`，如 `tse_2330.tw|otc_0050.tw`
- **前綴策略**（遠端做法）：全部先試 `tse_`；回傳 `msgArray` 中缺漏的代號
  （無 `z` 成交價且無 `y` 昨收者視為缺漏）再以 `otc_` 前綴重試一次。
  本機已有 Symbol Registry（`get_symbol_list`），可改為**直接查表判斷上市/上櫃**
  更精準，查不到再 fallback tse_/otc_ 各試一次
- `msgArray[]` 欄位對照：

| 欄位 | 意義 |
|---|---|
| `c` / `n` / `ex` | 代號 / 名稱 / 市別（tse｜otc） |
| `z` | 最新成交價（`-` 表無成交） |
| `o` / `h` / `l` / `y` | 開 / 高 / 低 / 昨收 |
| `v` | 累計成交量（張） |
| `t` / `d` | 最後成交時間 / 日期 |
| `u` / `w` | 漲停價 / 跌停價 |
| `a` + `f` | 賣五檔價格＋數量（底線 `_` 分隔） |
| `b` + `g` | 買五檔價格＋數量（底線 `_` 分隔） |

- 漲跌/漲跌幅由 `z - y` 本地計算（y≠0 時）

## 實作要求
- 資料源：TWSE-MIS（mis.twse.com.tw，host 已在 sandbox 白名單；引擎 provider 已有
  MIS 存取程式碼可重用 request 建構/headers）
- 登錄位置：盤中即時工具群組（`set_active_watchlist` 同檔案附近）
- **不接進輪詢引擎**：單發直查，與 engine 完全解耦；不得修改 engine 任何行為
- Rate Limit：遵守 MIS per-source 限流（§4.4/§5.3）；`stock_nos` 上限建議 20 檔/
  次（超過回明確錯誤），避免被 MIS 節流
- 即時資料不做 L2 持久化；可選極短 L1（如 3–5s）防連點，於 `_lineage` 註明取樣時間
- 遵循 Envelope、`_lineage`；五檔輸出格式對齊 `get_intraday_quote` 的 bids/asks 結構
- 盤中未成交/盤後情境：`z=-` 時以 `y`（昨收）或 `mp`（試算均價）fallback 並註明

## 驗收標準
- [x] `tools/list` 可見 `get_realtime_quote`，inputSchema 與本任務附帶者語意一致
- [x] 以真實參數呼叫至少一次成功：上市股（如 2330）、上櫃股（如 8996 或其他）混合多檔
- [x] 五檔 bids/asks 結構與 `get_intraday_quote` 一致；含 `_lineage`（取樣時間）
- [x] 盤後呼叫不報錯，回最後成交價或昨收 fallback（附說明）
- [x] watchlist 引擎行為完全不變（既有 engine 測試全綠）
- [x] `make test` / `go vet ./...` 通過；README 附錄（自動產生）重新彙出

## 備註
- MIS 為非官方保證之公開端點（本機引擎既用之，政策一致）；高頻使用仍建議走引擎模式，
  description 應引導：「固定標的高頻監控請用 set_active_watchlist + get_intraday_quote」
- 缺口分析文件：`docs/COMPARISON_TWSEMCPServer.md` §三之一 B
